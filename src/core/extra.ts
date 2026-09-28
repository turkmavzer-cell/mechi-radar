// Ortalamaya dönüş stratejileri ve pivot yardımcıları (strateji motoru ve laboratuvar ortak kullanır).
import { rsi, sma } from './indicators';
import type { Candle, Direction } from './types';

export interface LabSignal {
  i: number;
  dir: Direction;
}

const closes = (c: Candle[]) => c.map((x) => x.c);
const ok = (...v: number[]) => v.every((x) => Number.isFinite(x));

/** Pivot tepe/dipler: k mumu, sol ve sağdaki `w` mumdan yüksek/alçaksa pivot; k+w'da kesinleşir. */
export interface Pivot {
  k: number;
  price: number;
}
export function pivots(c: Candle[], w: number) {
  const hi: (Pivot & { at: number })[] = [];
  const lo: (Pivot & { at: number })[] = [];
  for (let k = w; k < c.length - w; k++) {
    let isH = true;
    let isL = true;
    for (let j = k - w; j <= k + w; j++) {
      if (j === k) continue;
      if (c[j].h >= c[k].h) isH = false;
      if (c[j].l <= c[k].l) isL = false;
    }
    if (isH) hi.push({ k, price: c[k].h, at: k + w });
    if (isL) lo.push({ k, price: c[k].l, at: k + w });
  }
  return { hi, lo };
}

/** Bollinger dönüşü: kapanış alt bandın dışından içine döner (al) / üst bant (sat). */
export const bbReversion =  (c: Candle[]): LabSignal[] => {
  const cl = closes(c);
  const m = sma(cl, 20);
  const out: LabSignal[] = [];
  const band = (i: number) => {
    let s = 0;
    for (let j = i - 19; j <= i; j++) s += (cl[j] - m[i]) ** 2;
    return 2 * Math.sqrt(s / 20);
  };
  for (let i = 20; i < c.length; i++) {
    const bp = band(i - 1);
    const b = band(i);
    if (cl[i - 1] < m[i - 1] - bp && cl[i] > m[i] - b) out.push({ i, dir: 'up' });
    else if (cl[i - 1] > m[i - 1] + bp && cl[i] < m[i] + b) out.push({ i, dir: 'down' });
  }
  return out;
};

/** Stokastik (14,3,3): %K, %D'yi 20 altında yukarı / 80 üstünde aşağı keser. */
export const stochastic =  (c: Candle[]): LabSignal[] => {
  const raw = c.map((_, i) => {
    if (i < 13) return NaN;
    let h = -Infinity;
    let l = Infinity;
    for (let j = i - 13; j <= i; j++) {
      h = Math.max(h, c[j].h);
      l = Math.min(l, c[j].l);
    }
    return h === l ? 50 : ((c[i].c - l) / (h - l)) * 100;
  });
  const k = sma(raw.map((v) => (Number.isFinite(v) ? v : 0)), 3).map((v, i) => (i < 15 ? NaN : v));
  const d = sma(k.map((v) => (Number.isFinite(v) ? v : 0)), 3).map((v, i) => (i < 17 ? NaN : v));
  const out: LabSignal[] = [];
  for (let i = 18; i < c.length; i++) {
    if (k[i - 1] <= d[i - 1] && k[i] > d[i] && k[i] < 20) out.push({ i, dir: 'up' });
    else if (k[i - 1] >= d[i - 1] && k[i] < d[i] && k[i] > 80) out.push({ i, dir: 'down' });
  }
  return out;
};

/** RSI(14) uyumsuzluğu: fiyat daha düşük dip, RSI daha yüksek dip (al); tepelerde tersi. */
export const rsiDivergence =  (c: Candle[]): LabSignal[] => {
  const r = rsi(closes(c), 14);
  const { hi, lo } = pivots(c, 3);
  const out: LabSignal[] = [];
  for (let n = 1; n < lo.length; n++) {
    const a = lo[n - 1];
    const b = lo[n];
    if (b.k - a.k > 40 || !ok(r[a.k], r[b.k])) continue;
    if (b.price < a.price && r[b.k] > r[a.k] && r[b.k] < 45 && b.at < c.length) out.push({ i: b.at, dir: 'up' });
  }
  for (let n = 1; n < hi.length; n++) {
    const a = hi[n - 1];
    const b = hi[n];
    if (b.k - a.k > 40 || !ok(r[a.k], r[b.k])) continue;
    if (b.price > a.price && r[b.k] < r[a.k] && r[b.k] > 55 && b.at < c.length) out.push({ i: b.at, dir: 'down' });
  }
  return out.sort((x, y) => x.i - y.i);
};

