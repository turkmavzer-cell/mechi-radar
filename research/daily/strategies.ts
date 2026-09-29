// Günlük adaylar (ön kayıt: research/STRATEJI-KARSILASTIRMA-KURAL.md). Parametreler sabit; duyarlılık için değiştirilebilir.
import { BOX_CANDIDATES, simulate, simulateRule, type RuleSignal } from '../../src/core/boxes';
import { atr, donchianPrior, rsi, sma } from '../../src/core/indicators';
import { SR_PARAMS, srTrades, weeklyFromDaily } from '../../src/core/sratr';
import type { Candle, Direction } from '../../src/core/types';

/** Ortak işlem kaydı (brüt R, maliyet hariç). */
export interface Trade {
  i: number;
  exitI: number;
  dir: Direction;
  entry: number;
  exitPrice: number;
  /** İlk stop mesafesi (puan). */
  risk: number;
  grossR: number;
}

export interface Bar extends Candle {
  /** Borsanın yerel tarihi (YYYY-MM-DD). */
  date: string;
}

const H = (c: Bar[]) => c.map((x) => x.h);
const L = (c: Bar[]) => c.map((x) => x.l);
const C = (c: Bar[]) => c.map((x) => x.c);
const month = (b: Bar) => b.date.slice(0, 7);

function closed(tr: { i: number; exitI?: number; dir: Direction; entry: number; stop: number; exitPrice?: number; r?: number }[]): Trade[] {
  return tr
    .filter((t) => t.exitI != null && t.exitPrice != null && t.r != null)
    .map((t) => ({ i: t.i, exitI: t.exitI!, dir: t.dir, entry: t.entry, exitPrice: t.exitPrice!, risk: Math.abs(t.entry - t.stop), grossR: t.r! }));
}

/** A. Donchian (Turtle) giriş N / çıkış M, stop k × ATR(20). */
export function donchianTrend(c: Bar[], entryN = 55, exitN = 20, stopAtr = 2): Trade[] {
  const cl = C(c);
  const inn = donchianPrior(H(c), L(c), entryN);
  const out = donchianPrior(H(c), L(c), exitN);
  const a = atr(H(c), L(c), cl, 20);
  const sig: RuleSignal[] = [];
  for (let i = 0; i < c.length; i++) {
    if (cl[i] > inn.upper[i]) sig.push({ i, dir: 'up', stopDist: stopAtr * a[i] });
    else if (cl[i] < inn.lower[i]) sig.push({ i, dir: 'down', stopDist: stopAtr * a[i] });
  }
  return closed(simulateRule(c, sig, (j, t) => (t.dir === 'up' ? cl[j] < out.lower[j] : cl[j] > out.upper[j])));
}

/** Ayın son işlem günü mü (sonraki işlem günü başka ayda). Borsa takvimi önceden bilinir kabulü. */
function isMonthEnd(c: Bar[], j: number): boolean {
  return j + 1 < c.length && month(c[j + 1]) !== month(c[j]);
}

/** B. TSMOM: ay sonu kapanışında `lookback` günlük getirinin işareti; stop 3 × ATR(20); stop sonrası ay sonuna kadar yok. */
export function tsmom(c: Bar[], lookback = 252, stopAtr = 3): Trade[] {
  const cl = C(c);
  const a = atr(H(c), L(c), cl, 20);
  const dirAt = new Map<number, Direction>();
  const sig: RuleSignal[] = [];
  for (let j = lookback; j < c.length; j++) {
    if (!isMonthEnd(c, j)) continue;
    const ret = cl[j] / cl[j - lookback] - 1;
    if (ret === 0) continue;
    const d: Direction = ret > 0 ? 'up' : 'down';
    dirAt.set(j, d);
    sig.push({ i: j, dir: d, stopDist: stopAtr * a[j] });
  }
  return closed(simulateRule(c, sig, (j, t) => dirAt.has(j) && dirAt.get(j) !== t.dir, { blockAfterStop: true }));
}

/** C. Connors RSI(2) + SMA200, yalnız long; çıkış kapanış > SMA5 ya da 10. işlem günü; stop 3 × ATR(14). */
export function connorsRsi2(c: Bar[], threshold = 10, stopAtr = 3, maxDays = 10): Trade[] {
  const cl = C(c);
  const r2 = rsi(cl, 2);
  const s200 = sma(cl, 200);
  const s5 = sma(cl, 5);
  const a = atr(H(c), L(c), cl, 14);
  const sig: RuleSignal[] = [];
  for (let i = 0; i < c.length; i++) if (cl[i] > s200[i] && r2[i] < threshold) sig.push({ i, dir: 'up', stopDist: stopAtr * a[i] });
  return closed(simulateRule(c, sig, (j, t) => cl[j] > s5[j] || j - t.i >= maxDays));
}

/** D. Ay dönümü: sondan ikinci işlem günü kapanışında long, yeni ayın `exitDay`. işlem günü kapanışında çık; stop 3 × ATR(14). */
export function turnOfMonth(c: Bar[], exitDay = 3, stopAtr = 3): Trade[] {
  const cl = C(c);
  const a = atr(H(c), L(c), cl, 14);
  const ord: number[] = [];
  for (let j = 0; j < c.length; j++) ord.push(j > 0 && month(c[j]) === month(c[j - 1]) ? ord[j - 1] + 1 : 1);
  const sig: RuleSignal[] = [];
  for (let j = 1; j + 1 < c.length; j++) if (isMonthEnd(c, j + 1) && month(c[j]) === month(c[j + 1])) sig.push({ i: j, dir: 'up', stopDist: stopAtr * a[j] });
  return closed(simulateRule(c, sig, (j, t) => month(c[j]) !== month(c[t.i]) && ord[j] >= exitDay));
}

/** E1. Mevcut SAR + EMA 200 + MACD (sabit 2R hedef). */
export function sarMacd(c: Bar[], stopAtr = 1.5): Trade[] {
  const b = BOX_CANDIDATES.find((x) => x.id === 'sarmacd')!;
  return closed(simulate(c, b.signals(c), { stopAtr, rr: 2 }));
}

/** E2. Mevcut SRA, günlükte üst zaman dilimi haftalık (sabit 2R hedef). */
export function sra(c: Bar[], stopAtr = 1.5): Trade[] {
  return closed(srTrades(c, '1d', { tf: '1w', candles: weeklyFromDaily(c) }, { ...SR_PARAMS, stopAtr, rr: 2 }));
}

export interface Candidate {
  id: string;
  name: string;
  run: (c: Bar[]) => Trade[];
  /** Duyarlılık: ana parametre −%25 / +%25. */
  variants: { label: string; run: (c: Bar[]) => Trade[] }[];
}

export const CANDIDATES: Candidate[] = [
  { id: 'A', name: 'Donchian 55/20', run: (c) => donchianTrend(c), variants: [
    { label: '40/15', run: (c) => donchianTrend(c, 40, 15) },
    { label: '70/25', run: (c) => donchianTrend(c, 70, 25) },
  ] },
  { id: 'B', name: 'TSMOM 12 ay', run: (c) => tsmom(c), variants: [
    { label: '189 gün', run: (c) => tsmom(c, 189) },
    { label: '315 gün', run: (c) => tsmom(c, 315) },
  ] },
  { id: 'C', name: 'Connors RSI(2) + SMA 200', run: (c) => connorsRsi2(c), variants: [
    { label: 'eşik 5', run: (c) => connorsRsi2(c, 5) },
    { label: 'eşik 15', run: (c) => connorsRsi2(c, 15) },
  ] },
  { id: 'D', name: 'Ay dönümü (TOM)', run: (c) => turnOfMonth(c), variants: [
    { label: 'çıkış 2. gün', run: (c) => turnOfMonth(c, 2) },
    { label: 'çıkış 4. gün', run: (c) => turnOfMonth(c, 4) },
  ] },
  { id: 'E1', name: 'SAR + EMA 200 + MACD (mevcut)', run: (c) => sarMacd(c), variants: [
    { label: 'stop 1,125 ATR', run: (c) => sarMacd(c, 1.125) },
    { label: 'stop 1,875 ATR', run: (c) => sarMacd(c, 1.875) },
  ] },
  { id: 'E2', name: 'SRA (mevcut)', run: (c) => sra(c), variants: [
    { label: 'stop 1,125 ATR', run: (c) => sra(c, 1.125) },
    { label: 'stop 1,875 ATR', run: (c) => sra(c, 1.875) },
  ] },
];
