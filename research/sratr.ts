// Stokastik-RSI-ATR stratejisinin stop/hedef seçimi için geçmiş veri testi.
// Her kombinasyon (stop ATR katı × risk/ödül × üst zaman dilimi filtresi) tüm sembol ve zaman dilimlerinde
// çalıştırılır; sonuç R cinsinden (hedef = +RR, stop = −1) research/out/sratr.* dosyalarına yazılır.
// Çalıştırma: npx tsx research/sratr.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { aggregate, TF_SECONDS } from '../src/core/candles';
import { higherSeries, srTrades, type SrParams } from '../src/core/sratr';
import { TIMEFRAMES, type Candle, type Timeframe } from '../src/core/types';
import { fetchChart, isSessionMarket, lastIsOpen } from '../src/core/yahoo';

const SYMBOLS = [
  'EURUSD=X', 'USDJPY=X', 'GBPUSD=X', '^GSPC', '^NDX', '^GDAXI', 'NIY=F', 'XU100.IS', 'GC=F',
  'CL=F', 'AAPL', 'MSFT', 'NVDA', 'THYAO.IS', 'GARAN.IS', 'ASELS.IS', 'BTC-USD', 'ETH-USD',
];
const SOURCE: Record<Timeframe, { interval: '5m' | '60m' | '1d'; range: string }> = {
  '15m': { interval: '5m', range: '60d' },
  '20m': { interval: '5m', range: '60d' },
  '30m': { interval: '5m', range: '60d' },
  '1h': { interval: '60m', range: '730d' },
  '2h': { interval: '60m', range: '730d' },
  '4h': { interval: '60m', range: '730d' },
  '1d': { interval: '1d', range: '10y' },
};

const COMBOS: SrParams[] = [];
for (const lookback of [1, 3]) for (const stopAtr of [1.5, 2]) for (const rr of [1, 1.5, 2, 3]) COMBOS.push({ stopAtr, rr, lookback });
const key = (p: SrParams) => `stop ${p.stopAtr} ATR · RR 1:${p.rr} · filtre ${p.lookback === 1 ? 'anlık' : `son ${p.lookback}`}`;

interface Acc { n: number; tp: number; r: number; gross: number; loss: number; symbols: Set<string>; posSymbols: Map<string, number> }
const acc = new Map<string, Acc>();
const get = (k: string) => {
  let a = acc.get(k);
  if (!a) acc.set(k, (a = { n: 0, tp: 0, r: 0, gross: 0, loss: 0, symbols: new Set(), posSymbols: new Map() }));
  return a;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const now = Math.floor(Date.now() / 1000);
  for (const symbol of SYMBOLS) {
    const raw = new Map<string, Awaited<ReturnType<typeof fetchChart>>>();
    for (const src of new Set(Object.values(SOURCE).map((x) => `${x.interval}|${x.range}`))) {
      const [interval, range] = src.split('|');
      try {
        raw.set(src, await fetchChart(fetch, symbol, interval as '5m' | '60m' | '1d', range));
      } catch (err) {
        console.warn(`${symbol} ${interval}: ${err}`);
      }
      await sleep(500);
    }
    const all: Partial<Record<Timeframe, Candle[]>> = {};
    for (const tf of TIMEFRAMES) {
      const src = raw.get(`${SOURCE[tf].interval}|${SOURCE[tf].range}`);
      if (!src) continue;
      const session = isSessionMarket(src.meta);
      let cs = tf === '1d' ? src.candles : aggregate(src.candles, TF_SECONDS[tf], session, src.meta.gmtoffset ?? 0);
      if (lastIsOpen(cs, tf, src.meta, now)) cs = cs.slice(0, -1);
      all[tf] = cs;
    }
    for (const tf of TIMEFRAMES) {
      const cs = all[tf];
      const higher = higherSeries(tf, all);
      if (!cs || cs.length < 200 || !higher) continue;
      for (const p of COMBOS) {
        const closed = srTrades(cs, tf, higher, p).filter((t) => t.outcome !== 'open');
        let sr = 0;
        for (const k of [`${key(p)}|${tf}`, `${key(p)}|ALL`]) {
          const a = get(k);
          for (const t of closed) {
            const r = t.outcome === 'tp' ? p.rr : -1;
            a.n++;
            if (t.outcome === 'tp') a.tp++;
            a.r += r;
            if (r > 0) a.gross += r;
            else a.loss -= r;
          }
          if (closed.length) a.symbols.add(symbol);
        }
        for (const t of closed) sr += t.outcome === 'tp' ? p.rr : -1;
        if (closed.length >= 3) {
          const a = get(`${key(p)}|ALL`);
          a.posSymbols.set(`${symbol}|${tf}`, sr);
        }
      }
    }
    console.log(`${symbol}: tamam`);
  }

  const rows = [...acc.entries()].map(([k, a]) => {
    const [combo, tf] = k.split('|');
    const pos = [...a.posSymbols.values()];
    return {
      combo,
      tf,
      n: a.n,
      winRate: a.n ? (100 * a.tp) / a.n : NaN,
      avgR: a.n ? a.r / a.n : NaN,
      totalR: a.r,
      pf: a.loss ? a.gross / a.loss : NaN,
      positiveSeries: pos.length ? `${pos.filter((x) => x > 0).length}/${pos.length}` : '',
    };
  });
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr.json', JSON.stringify(rows, null, 1));
  const f = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
  const md: string[] = ['# Stokastik-RSI-ATR testi', '', '## Tüm zaman dilimleri', '', '| Kombinasyon | İşlem | Hedef % | Ort. R | Toplam R | PF | Kârlı seri |', '|---|---|---|---|---|---|---|'];
  for (const r of rows.filter((x) => x.tf === 'ALL').sort((a, b) => b.avgR - a.avgR))
    md.push(`| ${r.combo} | ${r.n} | ${f(r.winRate, 1)} | ${f(r.avgR, 3)} | ${f(r.totalR, 1)} | ${f(r.pf)} | ${r.positiveSeries} |`);
  for (const tf of TIMEFRAMES) {
    md.push('', `## ${tf}`, '', '| Kombinasyon | İşlem | Hedef % | Ort. R | PF |', '|---|---|---|---|---|');
    for (const r of rows.filter((x) => x.tf === tf).sort((a, b) => b.avgR - a.avgR))
      md.push(`| ${r.combo} | ${r.n} | ${f(r.winRate, 1)} | ${f(r.avgR, 3)} | ${f(r.pf)} |`);
  }
  writeFileSync('research/out/sratr.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
