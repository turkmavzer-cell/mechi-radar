// EMA 21/55 (yeni kural) + yardımcı indikatör filtreleri, farklı zaman dilimlerinde; USDJPY ağırlıklı, maliyet dahil.
// Çalıştırma: npx tsx research/ema2155-filters.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { simulate, type BoxParams } from '../src/core/boxes';
import { TF_SECONDS } from '../src/core/candles';
import { adx, atr, bollinger, ema, haSmoothed, macd, rsi, sma, stochRsi, supertrend } from '../src/core/indicators';
import { ema2155Signals } from '../src/core/setups';
import { alignHigher, higherSeries } from '../src/core/sratr';
import type { Candle, Direction, Timeframe } from '../src/core/types';
import { costR, f, INS, sg } from './focus';
import { loadAll } from './load';

const TFS: Timeframe[] = ['15m', '30m', '1h', '2h', '4h', '1d'];
const EXITS: { id: string; name: string; p: BoxParams }[] = [
  { id: 'rr2', name: '1:2', p: { stopAtr: 2, rr: 2 } },
  { id: 'rr3', name: '1:3', p: { stopAtr: 2, rr: 3 } },
];
type Filter = (i: number, d: Direction) => boolean;

function filters(cs: Candle[], tf: Timeframe, all: Partial<Record<Timeframe, Candle[]>>): { id: string; name: string; fn?: Filter }[] {
  const o = cs.map((x) => x.o), h = cs.map((x) => x.h), l = cs.map((x) => x.l), c = cs.map((x) => x.c);
  const e200 = ema(c, 200);
  const ax = adx(h, l, c, 14).adx;
  const r = rsi(c, 14);
  const m = macd(c);
  const stDir = supertrend(h, l, c);
  const sr = stochRsi(c);
  const ha = haSmoothed(o, h, l, c).dir;
  const bb = bollinger(c);
  const w = bb.mid.map((x, i) => (bb.upper[i] - bb.lower[i]) / x);
  const wAvg = sma(w.map((x) => (Number.isNaN(x) ? 0 : x)), 100);
  const a = atr(h, l, c, 14);
  const aAvg = sma(a.map((x) => (Number.isNaN(x) ? 0 : x)), 50);
  const hs = higherSeries(tf, all);
  let htf: Filter | undefined;
  if (hs) {
    const idx = alignHigher(cs, tf, hs);
    const hc = hs.candles.map((x) => x.c);
    const hf = ema(hc, 21), hsl = ema(hc, 55);
    htf = (i, d) => idx[i] >= 0 && (d === 'up' ? hf[idx[i]] > hsl[idx[i]] : hf[idx[i]] < hsl[idx[i]]);
  }
  const sec = TF_SECONDS[tf];
  const up = (d: Direction) => d === 'up';
  return [
    { id: 'none', name: 'Filtre yok' },
    { id: 'ema200', name: 'EMA 200 yönünde', fn: (i, d) => (up(d) ? c[i] > e200[i] : c[i] < e200[i]) },
    { id: 'adx20', name: 'ADX ≥ 20', fn: (i) => ax[i] >= 20 },
    { id: 'adx25', name: 'ADX ≥ 25', fn: (i) => ax[i] >= 25 },
    { id: 'rsi50', name: 'RSI(14) 50 yönünde', fn: (i, d) => (up(d) ? r[i] > 50 : r[i] < 50) },
    { id: 'macd', name: 'MACD sinyal üstünde/altında', fn: (i, d) => (up(d) ? m.line[i] > m.signal[i] : m.line[i] < m.signal[i]) },
    { id: 'st', name: 'Supertrend yönünde', fn: (i, d) => stDir[i] === (up(d) ? 1 : -1) },
    ...(htf ? [{ id: 'htf', name: 'Üst zaman diliminde EMA 21/55 aynı yönde', fn: htf }] : []),
    { id: 'stochrsi', name: 'Geri çekilmede Stokastik RSI aşırı bölgede', fn: (i, d) => [i, i - 1].some((j) => (up(d) ? sr.k[j] < 30 : sr.k[j] > 70)) },
    { id: 'hasm', name: 'HA Smoothed rengi yönünde', fn: (i, d) => ha[i] === (up(d) ? 1 : -1) },
    { id: 'bbw', name: 'Bollinger bandı ortalamadan geniş', fn: (i) => w[i] >= wAvg[i] },
    { id: 'atrUp', name: 'ATR ortalamasının üstünde', fn: (i) => a[i] > aAvg[i] },
    ...(tf !== '1d'
      ? [{ id: 'session', name: 'Londra + New York seansı (08–21 TR)', fn: (i: number) => { const hr = new Date((cs[i].t + sec) * 1000).getUTCHours(); return hr >= 5 && hr < 18; } }]
      : []),
  ];
}

interface T { net: number; half: 1 | 2 }
const mean = (x: number[]) => (x.length ? x.reduce((p, q) => p + q, 0) / x.length : NaN);

async function main() {
  // res[exit][filter][ins][tf] = işlemler
  const res: Record<string, Record<string, Record<string, Record<string, T[]>>>> = {};
  const names: Record<string, string> = {};
  const list = INS; // USDJPY, Japan 225, Nasdaq 100, altın
  for (const ins of list) {
    const all = await loadAll(ins.symbol);
    for (const tf of TFS) {
      const cs = all[tf];
      if (!cs || cs.length < 300) continue;
      const mid = (cs[0].t + cs[cs.length - 1].t) / 2;
      for (const flt of filters(cs, tf, all)) {
        names[flt.id] = flt.name;
        const sig = ema2155Signals(cs, { firstOnly: true, breakAtr: 1, gapAtr: 1, filter: flt.fn });
        for (const e of EXITS) {
          const tr = simulate(cs, sig, e.p).filter((t) => t.outcome !== 'open' && t.r != null);
          (((res[e.id] ??= {})[flt.id] ??= {})[ins.id] ??= {})[tf] = tr.map((t) => ({ net: t.r! - costR(t, cs, ins, 1), half: cs[t.i].t < mid ? 1 : 2 }));
        }
      }
    }
    console.log(`${ins.name}: tamam`);
  }

  const cell = (ts: T[] | undefined) => (ts?.length ? `${sg(mean(ts.map((x) => x.net)), 2)} · ${ts.length}` : '—');
  const md: string[] = [
    '# EMA 21/55 + yardımcı indikatörler (maliyet dahil)',
    '',
    'Temel kural: kesişim başına 1 işlem, kopuş 1 ATR, EMA arası 1 ATR, stop 2 ATR. Filtre sağlanmazsa o geri çekilme atlanır.',
    'Hücre: işlem başına net R · işlem sayısı. Veri: 15dk/30dk ~2–3 ay, 1s/2s/4s ~2,5–3 yıl, 1g 10 yıl.',
    '',
  ];
  const fids = Object.keys(names);
  for (const e of EXITS) {
    md.push(`## USDJPY · ${e.name}`, '', `| Filtre | ${TFS.join(' | ')} |`, `|---|${TFS.map(() => '---').join('|')}|`);
    for (const id of fids) md.push(`| ${names[id]} | ${TFS.map((tf) => cell(res[e.id]?.[id]?.usdjpy?.[tf])).join(' | ')} |`);
    md.push('');
  }
  for (const e of EXITS) {
    md.push(
      `## Dört enstrüman birlikte (USDJPY, Japan 225, Nasdaq, altın) · ${e.name}`,
      '',
      'Hücre: net R ilk yarı / ikinci yarı · işlem. İki yarıda da pozitif olan ✓.',
      '',
      `| Filtre | ${TFS.join(' | ')} |`,
      `|---|${TFS.map(() => '---').join('|')}|`,
    );
    for (const id of fids)
      md.push(
        `| ${names[id]} | ${TFS.map((tf) => {
          const ts = list.flatMap((ins) => res[e.id]?.[id]?.[ins.id]?.[tf] ?? []);
          if (!ts.length) return '—';
          const a = mean(ts.filter((x) => x.half === 1).map((x) => x.net));
          const b = mean(ts.filter((x) => x.half === 2).map((x) => x.net));
          return `${a > 0 && b > 0 ? '✓ ' : ''}${sg(a, 2)} / ${sg(b, 2)} · ${ts.length}`;
        }).join(' | ')} |`,
      );
    md.push('');
  }
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-ema2155-filters.md', md.join('\n'));
  console.log(md.slice(0, 30).join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
