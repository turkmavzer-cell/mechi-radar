// Strateji araştırması: Yahoo'dan geçmiş veriyi indirir, tüm aday stratejileri tüm zaman
// dilimlerinde çalıştırır ve isabet istatistiklerini research/out/ klasörüne yazar.
// Çalıştırma: npx tsx research/backtest.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { aggregate, TF_SECONDS } from '../src/core/candles';
import { HORIZONS, LAB, score, type Score } from '../src/core/lab';
import { TIMEFRAMES, type Candle, type Timeframe } from '../src/core/types';
import { fetchChart, isSessionMarket, lastIsOpen } from '../src/core/yahoo';

const SYMBOLS: { symbol: string; name: string; group: string }[] = [
  { symbol: 'EURUSD=X', name: 'EURUSD', group: 'Döviz' },
  { symbol: 'USDJPY=X', name: 'USDJPY', group: 'Döviz' },
  { symbol: 'GBPUSD=X', name: 'GBPUSD', group: 'Döviz' },
  { symbol: '^GSPC', name: 'S&P 500', group: 'Endeks' },
  { symbol: '^NDX', name: 'Nasdaq 100', group: 'Endeks' },
  { symbol: '^GDAXI', name: 'DAX', group: 'Endeks' },
  { symbol: 'NIY=F', name: 'Japan 225 vadeli', group: 'Endeks' },
  { symbol: 'XU100.IS', name: 'BIST 100', group: 'Endeks' },
  { symbol: 'GC=F', name: 'Altın', group: 'Emtia' },
  { symbol: 'CL=F', name: 'Ham petrol', group: 'Emtia' },
  { symbol: 'AAPL', name: 'Apple', group: 'Hisse' },
  { symbol: 'MSFT', name: 'Microsoft', group: 'Hisse' },
  { symbol: 'NVDA', name: 'Nvidia', group: 'Hisse' },
  { symbol: 'THYAO.IS', name: 'THYAO', group: 'Hisse' },
  { symbol: 'GARAN.IS', name: 'GARAN', group: 'Hisse' },
  { symbol: 'ASELS.IS', name: 'ASELS', group: 'Hisse' },
  { symbol: 'BTC-USD', name: 'Bitcoin', group: 'Kripto' },
  { symbol: 'ETH-USD', name: 'Ethereum', group: 'Kripto' },
];

// Yahoo'nun izin verdiği en uzun geçmişler.
const SOURCE: Record<Timeframe, { interval: '5m' | '60m' | '1d'; range: string }> = {
  '15m': { interval: '5m', range: '60d' },
  '20m': { interval: '5m', range: '60d' },
  '30m': { interval: '5m', range: '60d' },
  '1h': { interval: '60m', range: '730d' },
  '2h': { interval: '60m', range: '730d' },
  '4h': { interval: '60m', range: '730d' },
  '1d': { interval: '1d', range: '10y' },
};

interface Row {
  strategy: string;
  tf: Timeframe;
  symbol: string;
  group: string;
  score: Score;
  /** Verinin ilk ve ikinci yarısında 10 mum isabeti (kararlılık kontrolü). */
  firstHalf: Score;
  secondHalf: Score;
  bars: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const rows: Row[] = [];
  for (const s of SYMBOLS) {
    const raw = new Map<string, Awaited<ReturnType<typeof fetchChart>>>();
    for (const src of new Set(Object.values(SOURCE).map((x) => `${x.interval}|${x.range}`))) {
      const [interval, range] = src.split('|');
      try {
        raw.set(src, await fetchChart(fetch, s.symbol, interval as '5m' | '60m' | '1d', range));
      } catch (err) {
        console.warn(`${s.symbol} ${interval}: ${err}`);
      }
      await sleep(500);
    }
    for (const tf of TIMEFRAMES) {
      const src = raw.get(`${SOURCE[tf].interval}|${SOURCE[tf].range}`);
      if (!src) continue;
      const session = isSessionMarket(src.meta);
      let cs: Candle[] = tf === '1d' ? src.candles : aggregate(src.candles, TF_SECONDS[tf], session, src.meta.gmtoffset ?? 0);
      if (lastIsOpen(cs, tf, src.meta, now)) cs = cs.slice(0, -1);
      if (cs.length < 300) continue;
      const half = Math.floor(cs.length / 2);
      for (const st of LAB) {
        const sigs = st.run(cs);
        rows.push({
          strategy: st.id,
          tf,
          symbol: s.symbol,
          group: s.group,
          score: score(cs, sigs),
          firstHalf: score(cs.slice(0, half + 20), sigs.filter((x) => x.i < half)),
          secondHalf: score(cs, sigs.filter((x) => x.i >= half)),
          bars: cs.length,
        });
      }
    }
    console.log(`${s.symbol}: tamam`);
  }

  // Havuzlanmış sonuç (tüm semboller): ağırlık sinyal sayısı.
  const pooled: Record<string, Record<string, unknown>> = {};
  for (const st of LAB) {
    for (const tf of TIMEFRAMES) {
      const rs = rows.filter((r) => r.strategy === st.id && r.tf === tf && r.score.n > 0);
      const n = rs.reduce((a, r) => a + r.score.n, 0);
      if (!n) continue;
      const w = (h: number, pick: (r: Row) => Score = (r) => r.score) => {
        const m = rs.filter((r) => pick(r).n > 0);
        const nn = m.reduce((a, r) => a + pick(r).n, 0);
        return nn ? m.reduce((a, r) => a + pick(r).win[h] * pick(r).n, 0) / nn : NaN;
      };
      const avg10 = rs.reduce((a, r) => a + r.score.avg[10] * r.score.n, 0) / n;
      const base = rs.reduce((a, r) => a + r.score.base10 * r.score.n, 0) / n;
      const positiveSymbols = rs.filter((r) => r.score.n >= 5 && r.score.win[10] > r.score.base10).length;
      const eligible = rs.filter((r) => r.score.n >= 5).length;
      pooled[`${st.id}|${tf}`] = {
        strategy: st.id,
        name: st.name,
        family: st.family,
        rule: st.rule,
        tf,
        n,
        win5: w(5),
        win10: w(10),
        win20: w(20),
        avg10,
        base10: base,
        edge10: w(10) - base,
        firstHalfWin10: w(10, (r) => r.firstHalf),
        secondHalfWin10: w(10, (r) => r.secondHalf),
        symbolsBeatingBase: `${positiveSymbols}/${eligible}`,
      };
    }
  }

  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/rows.json', JSON.stringify(rows));
  writeFileSync('research/out/pooled.json', JSON.stringify(Object.values(pooled), null, 1));
  writeFileSync(
    'research/out/meta.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), symbols: SYMBOLS, horizons: HORIZONS, sources: SOURCE }, null, 1),
  );
  console.log(`Bitti: ${rows.length} satır, ${Object.keys(pooled).length} strateji×zaman dilimi`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
