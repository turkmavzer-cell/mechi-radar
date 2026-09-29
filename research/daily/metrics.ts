// Maliyetler ve ölçütler (ön kayıt: research/STRATEJI-KARSILASTIRMA-KURAL.md).
import type { Instrument } from './instruments';
import type { Bar, Trade } from './strategies';

export type CostMode = 'none' | 'spreadOnly' | 'points' | 'annualPct' | 'conservative';

const dayNum = (d: string) => Math.round(Date.parse(d + 'T00:00:00Z') / 86400000);

/**
 * Bir işlemin maliyeti, puan olarak. Spread ve "puan/gece" swap bugünkü fiyatta gözlendiği için varsayılan olarak
 * fiyata oranlanır (`relative`: puan × giriş fiyatı / son kapanış). `fixed` ön kayıt metnindeki sabit puan uygulamasıdır
 * (eski yıllarda endeks çok düşük olduğundan maliyeti abartır; yalnız karşılaştırma için).
 */
export function costPoints(t: Trade, bars: Bar[], ins: Instrument, mode: CostMode, scale: 'relative' | 'fixed' = 'relative'): number {
  if (mode === 'none') return 0;
  const k = scale === 'relative' ? t.entry / bars[bars.length - 1].c : 1;
  const spread = 1.5 * ins.spread * k;
  if (mode === 'spreadOnly') return spread;
  const nights = Math.max(0, dayNum(bars[t.exitI].date) - dayNum(bars[t.i].date));
  const rate = t.dir === 'up' ? ins.swapLong : ins.swapShort;
  const swap = (m: 'points' | 'annualPct') => (m === 'points' ? nights * rate * k : (nights * t.entry * rate) / 100 / 365);
  if (mode === 'points' || mode === 'annualPct') return spread + swap(mode);
  return spread + Math.max(...ins.swapModes.map(swap));
}

export function netR(t: Trade, bars: Bar[], ins: Instrument, mode: CostMode, scale: 'relative' | 'fixed' = 'relative'): number {
  return t.grossR - costPoints(t, bars, ins, mode, scale) / t.risk;
}

export interface Stats {
  n: number;
  perYear: number;
  win: number;
  avg: number;
  t: number;
  total: number;
  pf: number;
  maxLossStreak: number;
  maxDD: number;
  inMarket: number;
  h1: { n: number; avg: number };
  h2: { n: number; avg: number };
  yearly: Map<string, { n: number; r: number }>;
}

const mean = (x: number[]) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : NaN);

/** `rs[k]` işlem `trades[k]`'nin net R'si; pencere [start, end] mum indeksleri. */
export function stats(trades: Trade[], rs: number[], bars: Bar[], start: number, end: number): Stats {
  const n = trades.length;
  const years = (dayNum(bars[end].date) - dayNum(bars[start].date)) / 365.25;
  const avg = mean(rs);
  const sd = n > 1 ? Math.sqrt(rs.reduce((a, r) => a + (r - avg) ** 2, 0) / (n - 1)) : NaN;
  const gains = rs.filter((r) => r > 0).reduce((a, b) => a + b, 0);
  const losses = -rs.filter((r) => r < 0).reduce((a, b) => a + b, 0);
  let streak = 0, maxStreak = 0;
  for (const r of rs) {
    streak = r < 0 ? streak + 1 : 0;
    maxStreak = Math.max(maxStreak, streak);
  }
  // %1 risk, bileşik; işlemler çıkış sırasına göre.
  const order = trades.map((_, k) => k).sort((a, b) => trades[a].exitI - trades[b].exitI);
  let eq = 1, peak = 1, dd = 0;
  for (const k of order) {
    eq *= 1 + 0.01 * rs[k];
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
  }
  const held = trades.reduce((a, t) => a + (t.exitI - t.i), 0);
  const mid = (dayNum(bars[start].date) + dayNum(bars[end].date)) / 2;
  const h1 = rs.filter((_, k) => dayNum(bars[trades[k].i].date) < mid);
  const h2 = rs.filter((_, k) => dayNum(bars[trades[k].i].date) >= mid);
  const yearly = new Map<string, { n: number; r: number }>();
  trades.forEach((t, k) => {
    const y = bars[t.i].date.slice(0, 4);
    const e = yearly.get(y) ?? { n: 0, r: 0 };
    e.n++;
    e.r += rs[k];
    yearly.set(y, e);
  });
  return {
    n,
    perYear: n / years,
    win: n ? (100 * rs.filter((r) => r > 0).length) / n : NaN,
    avg,
    t: sd > 0 ? avg / (sd / Math.sqrt(n)) : NaN,
    total: rs.reduce((a, b) => a + b, 0),
    pf: losses > 0 ? gains / losses : NaN,
    maxLossStreak: maxStreak,
    maxDD: 100 * dd,
    inMarket: (100 * held) / (end - start + 1),
    h1: { n: h1.length, avg: mean(h1) },
    h2: { n: h2.length, avg: mean(h2) },
    yearly,
  };
}

/** Al ve tut: yıllık bileşik getiri ve en büyük düşüş (kapanışlara göre). */
export function buyHold(bars: Bar[], start: number, end: number) {
  const years = (dayNum(bars[end].date) - dayNum(bars[start].date)) / 365.25;
  let peak = bars[start].c, dd = 0;
  for (let i = start; i <= end; i++) {
    peak = Math.max(peak, bars[i].c);
    dd = Math.max(dd, 1 - bars[i].c / peak);
  }
  return { cagr: 100 * ((bars[end].c / bars[start].c) ** (1 / years) - 1), maxDD: 100 * dd, total: 100 * (bars[end].c / bars[start].c - 1) };
}
