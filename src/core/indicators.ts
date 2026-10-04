/**
 * Üstel hareketli ortalama. TradingView'in ta.ema'sı gibi ilk değer basit
 * ortalama (SMA) ile başlatılır; yeterli veri oluşana kadar değerler NaN'dır.
 */
export function ema(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  let prev = sum / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** Basit hareketli ortalama. */
export function sma(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

/** Wilder yumuşatması (RMA); TradingView'in ta.rma'sı ile aynı başlangıç. */
export function rma(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  let prev = NaN;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (Number.isNaN(v)) continue;
    if (Number.isNaN(prev)) {
      sum += v;
      count++;
      if (count === period) {
        prev = sum / period;
        out[i] = prev;
      }
    } else {
      prev = (prev * (period - 1) + v) / period;
      out[i] = prev;
    }
  }
  return out;
}

/** RSI (Wilder, varsayılan 14). */
export function rsi(values: number[], period = 14): number[] {
  const gains = values.map((v, i) => (i === 0 ? NaN : Math.max(v - values[i - 1], 0)));
  const losses = values.map((v, i) => (i === 0 ? NaN : Math.max(values[i - 1] - v, 0)));
  const ag = rma(gains, period);
  const al = rma(losses, period);
  return ag.map((g, i) => {
    const l = al[i];
    if (Number.isNaN(g) || Number.isNaN(l)) return NaN;
    if (l === 0) return 100;
    return 100 - 100 / (1 + g / l);
  });
}

/** MACD çizgisi (EMA12 - EMA26) ve sinyal çizgisi (MACD'nin EMA9'u). */
export function macd(values: number[], fast = 12, slow = 26, signal = 9): { line: number[]; signal: number[] } {
  const ef = ema(values, fast);
  const es = ema(values, slow);
  const line = values.map((_, i) => ef[i] - es[i]);
  const start = line.findIndex((v) => !Number.isNaN(v));
  const sig = new Array<number>(values.length).fill(NaN);
  if (start >= 0) {
    const tail = ema(line.slice(start), signal);
    tail.forEach((v, j) => (sig[start + j] = v));
  }
  return { line, signal: sig };
}

/** ATR (Wilder). */
export function atr(high: number[], low: number[], close: number[], period = 14): number[] {
  const tr = high.map((h, i) =>
    i === 0 ? h - low[i] : Math.max(h - low[i], Math.abs(h - close[i - 1]), Math.abs(low[i] - close[i - 1])),
  );
  return rma(tr, period);
}

/** Supertrend yönü: 1 yükseliş, -1 düşüş, NaN veri yetersiz. */
export function supertrend(high: number[], low: number[], close: number[], period = 10, mult = 3): number[] {
  return supertrendLine(high, low, close, period, mult).dir;
}

// ---- Grafik indikatörleri (hazır ayarlı) ----

/** Pencere en yükseği/en düşüğü; pencerede NaN varsa NaN. */
function extreme(values: number[], period: number, pick: (a: number, b: number) => number): number[] {
  return values.map((_, i) => {
    if (i < period - 1) return NaN;
    let m = values[i];
    for (let j = i - period + 1; j <= i; j++) {
      if (Number.isNaN(values[j])) return NaN;
      m = pick(m, values[j]);
    }
    return m;
  });
}
export const highest = (values: number[], period: number) => extreme(values, period, Math.max);
export const lowest = (values: number[], period: number) => extreme(values, period, Math.min);

/** Standart sapma (anakütle, TradingView ta.stdev gibi). */
export function stdev(values: number[], period: number): number[] {
  const mean = sma(values, period);
  return values.map((_, i) => {
    if (Number.isNaN(mean[i])) return NaN;
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) v += (values[j] - mean[i]) ** 2;
    return Math.sqrt(v / period);
  });
}

export function bollinger(close: number[], period = 20, mult = 2) {
  const mid = sma(close, period);
  const sd = stdev(close, period);
  return { mid, upper: mid.map((m, i) => m + mult * sd[i]), lower: mid.map((m, i) => m - mult * sd[i]) };
}

export function keltner(high: number[], low: number[], close: number[], period = 20, mult = 2, atrPeriod = 10) {
  const mid = ema(close, period);
  const a = atr(high, low, close, atrPeriod);
  return { mid, upper: mid.map((m, i) => m + mult * a[i]), lower: mid.map((m, i) => m - mult * a[i]) };
}

export function donchian(high: number[], low: number[], period = 20) {
  const upper = highest(high, period);
  const lower = lowest(low, period);
  return { upper, lower, mid: upper.map((u, i) => (u + lower[i]) / 2) };
}

/** Supertrend çizgisi (yükselişte alt bant, düşüşte üst bant) ve yönü. */
export function supertrendLine(high: number[], low: number[], close: number[], period = 10, mult = 3) {
  const a = atr(high, low, close, period);
  const line = new Array<number>(close.length).fill(NaN);
  const dir = new Array<number>(close.length).fill(NaN);
  let upper = NaN;
  let lower = NaN;
  let d = 1;
  for (let i = 0; i < close.length; i++) {
    if (Number.isNaN(a[i])) continue;
    const mid = (high[i] + low[i]) / 2;
    const bu = mid + mult * a[i];
    const bl = mid - mult * a[i];
    const prevClose = close[i - 1] ?? close[i];
    upper = Number.isNaN(upper) || bu < upper || prevClose > upper ? bu : upper;
    lower = Number.isNaN(lower) || bl > lower || prevClose < lower ? bl : lower;
    if (d === 1 && close[i] < lower) d = -1;
    else if (d === -1 && close[i] > upper) d = 1;
    dir[i] = d;
    line[i] = d === 1 ? lower : upper;
  }
  return { line, dir };
}

/** Parabolic SAR (0,02 / 0,02 / 0,2). */
export function psar(high: number[], low: number[], start = 0.02, inc = 0.02, max = 0.2): number[] {
  const n = high.length;
  const out = new Array<number>(n).fill(NaN);
  if (n < 2) return out;
  let up = high[1] >= high[0];
  let sar = up ? low[0] : high[0];
  let ep = up ? high[1] : low[1];
  let af = start;
  out[1] = sar;
  for (let i = 2; i < n; i++) {
    sar = sar + af * (ep - sar);
    if (up) {
      sar = Math.min(sar, low[i - 1], low[i - 2]);
      if (low[i] < sar) {
        up = false;
        sar = ep;
        ep = low[i];
        af = start;
      } else if (high[i] > ep) {
        ep = high[i];
        af = Math.min(af + inc, max);
      }
    } else {
      sar = Math.max(sar, high[i - 1], high[i - 2]);
      if (high[i] > sar) {
        up = true;
        sar = ep;
        ep = high[i];
        af = start;
      } else if (low[i] < ep) {
        ep = low[i];
        af = Math.min(af + inc, max);
      }
    }
    out[i] = sar;
  }
  return out;
}

/** Ichimoku (9, 26, 52); öncü açıklıklar kaydırılmadan döner. */
export function ichimoku(high: number[], low: number[], conv = 9, base = 26, spanB = 52) {
  const mid = (p: number) => {
    const h = highest(high, p);
    const l = lowest(low, p);
    return h.map((x, i) => (x + l[i]) / 2);
  };
  const tenkan = mid(conv);
  const kijun = mid(base);
  return { tenkan, kijun, spanA: tenkan.map((t, i) => (t + kijun[i]) / 2), spanB: mid(spanB) };
}

/** Stokastik %K (yumuşatılmış) ve %D. */
export function stochOsc(high: number[], low: number[], close: number[], period = 14, smoothK = 3, smoothD = 3) {
  const h = highest(high, period);
  const l = lowest(low, period);
  const raw = close.map((c, i) => (h[i] === l[i] ? 50 : (100 * (c - l[i])) / (h[i] - l[i])));
  const k = smaNaN(raw, smoothK);
  return { k, d: smaNaN(k, smoothD) };
}

/** Başındaki NaN'ları atlayarak SMA. */
function smaNaN(values: number[], period: number): number[] {
  const start = values.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(values.length).fill(NaN);
  if (start < 0) return out;
  sma(values.slice(start), period).forEach((v, j) => (out[start + j] = v));
  return out;
}

export function stochRsi(close: number[], rsiLen = 14, stochLen = 14, smoothK = 3, smoothD = 3) {
  const r = rsi(close, rsiLen);
  const h = highest(r, stochLen);
  const l = lowest(r, stochLen);
  const raw = r.map((v, i) => (Number.isNaN(h[i]) ? NaN : h[i] === l[i] ? 50 : (100 * (v - l[i])) / (h[i] - l[i])));
  const k = smaNaN(raw, smoothK);
  return { k, d: smaNaN(k, smoothD) };
}

export function cci(high: number[], low: number[], close: number[], period = 20): number[] {
  const tp = close.map((c, i) => (high[i] + low[i] + c) / 3);
  const m = sma(tp, period);
  return tp.map((v, i) => {
    if (Number.isNaN(m[i])) return NaN;
    let dev = 0;
    for (let j = i - period + 1; j <= i; j++) dev += Math.abs(tp[j] - m[i]);
    dev /= period;
    return dev === 0 ? 0 : (v - m[i]) / (0.015 * dev);
  });
}

export function williamsR(high: number[], low: number[], close: number[], period = 14): number[] {
  const h = highest(high, period);
  const l = lowest(low, period);
  return close.map((c, i) => (h[i] === l[i] ? -50 : (-100 * (h[i] - c)) / (h[i] - l[i])));
}

/** ADX ve yön göstergeleri (+DI / -DI), Wilder 14. */
export function adx(high: number[], low: number[], close: number[], period = 14) {
  const plusDM = high.map((h, i) => {
    if (i === 0) return NaN;
    const up = h - high[i - 1];
    const down = low[i - 1] - low[i];
    return up > down && up > 0 ? up : 0;
  });
  const minusDM = low.map((l, i) => {
    if (i === 0) return NaN;
    const up = high[i] - high[i - 1];
    const down = low[i - 1] - l;
    return down > up && down > 0 ? down : 0;
  });
  const tr = high.map((h, i) =>
    i === 0 ? NaN : Math.max(h - low[i], Math.abs(h - close[i - 1]), Math.abs(low[i] - close[i - 1])),
  );
  const atrv = rma(tr, period);
  const plus = rma(plusDM, period).map((v, i) => (100 * v) / atrv[i]);
  const minus = rma(minusDM, period).map((v, i) => (100 * v) / atrv[i]);
  const dx = plus.map((p, i) => {
    const s = p + minus[i];
    return Number.isNaN(s) ? NaN : s === 0 ? 0 : (100 * Math.abs(p - minus[i])) / s;
  });
  return { adx: rma(dx, period), plus, minus };
}

/** Awesome Oscillator: medyan fiyatın SMA 5 - SMA 34 farkı. */
export function awesome(high: number[], low: number[]): number[] {
  const mid = high.map((h, i) => (h + low[i]) / 2);
  const f = sma(mid, 5);
  const s = sma(mid, 34);
  return f.map((v, i) => v - s[i]);
}

/** Değişim oranı (ROC), yüzde. */
export function roc(close: number[], period = 10): number[] {
  return close.map((c, i) => (i < period ? NaN : (100 * (c - close[i - period])) / close[i - period]));
}

/** Doğrusal regresyon değeri (TradingView ta.linreg, offset 0). */
export function linreg(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  const sx = (period * (period - 1)) / 2;
  const sxx = ((period - 1) * period * (2 * period - 1)) / 6;
  for (let i = period - 1; i < values.length; i++) {
    let sy = 0;
    let sxy = 0;
    let bad = false;
    for (let k = 0; k < period; k++) {
      const v = values[i - period + 1 + k];
      if (Number.isNaN(v)) {
        bad = true;
        break;
      }
      sy += v;
      sxy += k * v;
    }
    if (bad) continue;
    const slope = (period * sxy - sx * sy) / (period * sxx - sx * sx);
    const icpt = (sy - slope * sx) / period;
    out[i] = icpt + slope * (period - 1);
  }
  return out;
}

/** Sıfır gecikmeli en küçük kareler ortalaması (ZLSMA). */
export function zlsma(close: number[], period = 32): number[] {
  const l = linreg(close, period);
  const l2 = linreg(l, period);
  return l.map((v, i) => v + (v - l2[i]));
}

/** UT Bot: ATR izleyen stop (anahtar değer × ATR). Yön 1/-1. */
export function utBot(close: number[], high: number[], low: number[], key = 1, period = 10): { stop: number[]; dir: number[] } {
  const a = atr(high, low, close, period);
  const stop = new Array<number>(close.length).fill(NaN);
  const dir = new Array<number>(close.length).fill(NaN);
  let prev = NaN;
  for (let i = 0; i < close.length; i++) {
    if (Number.isNaN(a[i])) continue;
    const loss = key * a[i];
    const c = close[i];
    const pc = close[i - 1] ?? c;
    let s: number;
    if (Number.isNaN(prev)) s = c - loss;
    else if (c > prev && pc > prev) s = Math.max(prev, c - loss);
    else if (c < prev && pc < prev) s = Math.min(prev, c + loss);
    else s = c > prev ? c - loss : c + loss;
    stop[i] = s;
    dir[i] = c > s ? 1 : -1;
    prev = s;
  }
  return { stop, dir };
}

/** Chandelier Exit (22, 3): yön 1/-1 ve aktif stop çizgisi. */
export function chandelier(high: number[], low: number[], close: number[], period = 22, mult = 3): { stop: number[]; dir: number[] } {
  const a = atr(high, low, close, period);
  const hh = highest(close, period);
  const ll = lowest(close, period);
  const stop = new Array<number>(close.length).fill(NaN);
  const dir = new Array<number>(close.length).fill(NaN);
  let longS = NaN;
  let shortS = NaN;
  let d = 1;
  for (let i = 0; i < close.length; i++) {
    if (Number.isNaN(a[i]) || Number.isNaN(hh[i])) continue;
    let ls = hh[i] - mult * a[i];
    let ss = ll[i] + mult * a[i];
    const pc = close[i - 1] ?? close[i];
    if (!Number.isNaN(longS) && pc > longS) ls = Math.max(ls, longS);
    if (!Number.isNaN(shortS) && pc < shortS) ss = Math.min(ss, shortS);
    if (!Number.isNaN(shortS) && close[i] > shortS) d = 1;
    else if (!Number.isNaN(longS) && close[i] < longS) d = -1;
    longS = ls;
    shortS = ss;
    dir[i] = d;
    stop[i] = d === 1 ? ls : ss;
  }
  return { stop, dir };
}

/** TTM Squeeze (LazyBear): momentum (doğrusal regresyon) ve sıkışma durumu (Bollinger 20,2 Keltner 20,1,5 içinde). */
export function squeezeMomentum(high: number[], low: number[], close: number[], period = 20): { mom: number[]; sqz: boolean[] } {
  const bb = bollinger(close, period, 2);
  const kc = keltner(high, low, close, period, 1.5, period);
  const hh = highest(high, period);
  const ll = lowest(low, period);
  const s = sma(close, period);
  const base = close.map((v, i) => v - ((hh[i] + ll[i]) / 2 + s[i]) / 2);
  return {
    mom: linreg(base, period),
    sqz: close.map((_, i) => bb.upper[i] < kc.upper[i] && bb.lower[i] > kc.lower[i]),
  };
}

/** Başındaki NaN'ları atlayarak EMA. */
export function emaNaN(values: number[], period: number): number[] {
  const start = values.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(values.length).fill(NaN);
  if (start < 0) return out;
  ema(values.slice(start), period).forEach((v, j) => (out[start + j] = v));
  return out;
}

/** Heikin Ashi mumları. */
export function heikinAshi(open: number[], high: number[], low: number[], close: number[]) {
  const n = close.length;
  const o = new Array<number>(n).fill(NaN);
  const c = new Array<number>(n).fill(NaN);
  const h = new Array<number>(n).fill(NaN);
  const l = new Array<number>(n).fill(NaN);
  for (let i = 0; i < n; i++) {
    if ([open[i], high[i], low[i], close[i]].some(Number.isNaN)) continue;
    c[i] = (open[i] + high[i] + low[i] + close[i]) / 4;
    o[i] = i > 0 && !Number.isNaN(o[i - 1]) ? (o[i - 1] + c[i - 1]) / 2 : (open[i] + close[i]) / 2;
    h[i] = Math.max(high[i], o[i], c[i]);
    l[i] = Math.min(low[i], o[i], c[i]);
  }
  return { o, h, l, c };
}

/**
 * Heikin Ashi Smoothed (TradingView "Smoothed Heiken Ashi"): OHLC önce EMA(len1) ile yumuşatılır, Heikin Ashi hesaplanır,
 * açılış ve kapanış tekrar EMA(len2) ile yumuşatılır. Yön: kapanış > açılış → 1 (yeşil), değilse −1 (kırmızı).
 */
export function haSmoothed(open: number[], high: number[], low: number[], close: number[], len1 = 10, len2 = 10) {
  const ha = heikinAshi(ema(open, len1), ema(high, len1), ema(low, len1), ema(close, len1));
  const o = emaNaN(ha.o, len2);
  const c = emaNaN(ha.c, len2);
  const h = emaNaN(ha.h, len2);
  const l = emaNaN(ha.l, len2);
  const dir = o.map((v, i) => (Number.isNaN(v) || Number.isNaN(c[i]) ? NaN : c[i] > v ? 1 : -1));
  return { o, h, l, c, dir };
}

/**
 * Tepe/dip noktaları: `k` mumu, iki yanındaki `span` mumun en yükseği (en düşüğü) ise tepe (dip).
 * Nokta ancak `k + span` mumu kapanınca bilinir (`at`).
 */
export function pivots(high: number[], low: number[], span = 5) {
  const hi: { k: number; v: number; at: number }[] = [];
  const lo: { k: number; v: number; at: number }[] = [];
  for (let k = span; k + span < high.length; k++) {
    let isH = true;
    let isL = true;
    for (let j = k - span; j <= k + span && (isH || isL); j++) {
      if (j === k) continue;
      if (high[j] >= high[k] && (j > k || high[j] > high[k])) isH = false;
      if (low[j] <= low[k] && (j > k || low[j] < low[k])) isL = false;
    }
    if (isH) hi.push({ k, v: high[k], at: k + span });
    if (isL) lo.push({ k, v: low[k], at: k + span });
  }
  return { hi, lo };
}

/**
 * Twin Range Filter (colinmck, TradingView): iki yumuşatılmış aralığın ortalamasıyla aralık filtresi.
 * `signal`: 1 = "Long" etiketi (yön ilk kez yukarı döner), −1 = "Short", 0 = yok.
 */
export function twinRangeFilter(close: number[], per1 = 27, mult1 = 1.6, per2 = 55, mult2 = 2) {
  const n = close.length;
  const diff = close.map((x, i) => (i === 0 ? NaN : Math.abs(x - close[i - 1])));
  const smooth = (t: number, m: number) => emaNaN(emaNaN(diff, t), t * 2 - 1).map((v) => v * m);
  const r1 = smooth(per1, mult1);
  const r2 = smooth(per2, mult2);
  const filt = new Array<number>(n).fill(NaN);
  const signal = new Array<number>(n).fill(0);
  let prev = NaN;
  let upward = 0;
  let downward = 0;
  let cond = 0;
  for (let i = 0; i < n; i++) {
    const r = (r1[i] + r2[i]) / 2;
    if (Number.isNaN(r)) continue;
    const x = close[i];
    const p = Number.isNaN(prev) ? 0 : prev;
    const f = x > p ? (x - r < p ? p : x - r) : x + r > p ? p : x + r;
    if (!Number.isNaN(prev)) {
      upward = f > prev ? upward + 1 : f < prev ? 0 : upward;
      downward = f < prev ? downward + 1 : f > prev ? 0 : downward;
    }
    filt[i] = f;
    prev = f;
    // Orijinal koşul: kaynak önceki kapanıştan farklı (büyük ya da küçük) olmalı.
    const moved = i > 0 && x !== close[i - 1];
    const longCond = moved && x > f && upward > 0;
    const shortCond = moved && x < f && downward > 0;
    const before = cond;
    cond = longCond ? 1 : shortCond ? -1 : cond;
    if (longCond && before === -1) signal[i] = 1;
    else if (shortCond && before === 1) signal[i] = -1;
  }
  return { filt, signal };
}

/**
 * Supertrend, KivancOzbilgic sürümü (TradingView "SuperTrend", "Change ATR Calculation Method" işaretli = Wilder ATR).
 * Yerleşik sürümden farkı: yön değişimi bir önceki mumun bandına göre kontrol edilir. Kaynak hl2.
 */
export function supertrendKv(high: number[], low: number[], close: number[], period = 10, mult = 3) {
  const a = atr(high, low, close, period);
  const n = close.length;
  const line = new Array<number>(n).fill(NaN);
  const dir = new Array<number>(n).fill(NaN);
  let up = NaN;
  let dn = NaN;
  let trend = 1;
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(a[i])) continue;
    const src = (high[i] + low[i]) / 2;
    const up1 = Number.isNaN(up) ? src - mult * a[i] : up;
    const dn1 = Number.isNaN(dn) ? src + mult * a[i] : dn;
    const prevClose = i > 0 ? close[i - 1] : close[i];
    const u = src - mult * a[i];
    const d = src + mult * a[i];
    up = prevClose > up1 ? Math.max(u, up1) : u;
    dn = prevClose < dn1 ? Math.min(d, dn1) : d;
    trend = trend === -1 && close[i] > dn1 ? 1 : trend === 1 && close[i] < up1 ? -1 : trend;
    dir[i] = trend;
    line[i] = trend === 1 ? up : dn;
  }
  return { line, dir };
}

/** Ağırlıklı hareketli ortalama (TradingView ta.wma). */
export function wma(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  const den = (period * (period + 1)) / 2;
  for (let i = period - 1; i < values.length; i++) {
    let s = 0;
    for (let k = 0; k < period; k++) s += values[i - k] * (period - k);
    out[i] = s / den;
  }
  return out;
}

/** Hull hareketli ortalama: wma(2 × wma(n/2) − wma(n), round(√n)). */
export function hma(values: number[], period: number): number[] {
  const a = wma(values, Math.floor(period / 2));
  const b = wma(values, period);
  const diff = a.map((v, i) => 2 * v - b[i]);
  const start = diff.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(values.length).fill(NaN);
  if (start < 0) return out;
  wma(diff.slice(start), Math.round(Math.sqrt(period))).forEach((v, j) => (out[start + j] = v));
  return out;
}

/** Başındaki NaN'ları atlayarak kayan pencere (SMA / anakütle standart sapması). */
function rollNaN(values: number[], period: number, fn: (v: number[], p: number) => number[]): number[] {
  const start = values.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(values.length).fill(NaN);
  if (start < 0) return out;
  fn(values.slice(start), period).forEach((v, j) => (out[start + j] = v));
  return out;
}

/** QQE çizgisi (Mihkel00 "QQE MOD" içindeki hesap): RSI'ın EMA'sı ve onu izleyen bant. */
function qqeLine(close: number[], rsiLen: number, sf: number, factor: number) {
  const wilders = rsiLen * 2 - 1;
  const rsiMa = emaNaN(rsi(close, rsiLen), sf);
  const atrRsi = rsiMa.map((v, i) => (i === 0 ? NaN : Math.abs(rsiMa[i - 1] - v)));
  const dar = emaNaN(emaNaN(atrRsi, wilders), wilders).map((v) => v * factor);
  const n = close.length;
  const lb = new Array<number>(n).fill(NaN);
  const sb = new Array<number>(n).fill(NaN);
  const tl = new Array<number>(n).fill(NaN);
  const cross = (a0: number, a1: number, b0: number, b1: number) => (a0 > b0 && a1 <= b1) || (a0 < b0 && a1 >= b1);
  let trend = 1;
  for (let i = 0; i < n; i++) {
    const r = rsiMa[i];
    const r1 = i > 0 ? rsiMa[i - 1] : NaN;
    const lb1 = i > 0 ? lb[i - 1] : NaN;
    const sb1 = i > 0 ? sb[i - 1] : NaN;
    const sb2 = i > 1 ? sb[i - 2] : NaN;
    const lb2 = i > 1 ? lb[i - 2] : NaN;
    const nl = r - dar[i];
    const ns = r + dar[i];
    lb[i] = r1 > lb1 && r > lb1 ? Math.max(lb1, nl) : nl;
    sb[i] = r1 < sb1 && r < sb1 ? Math.min(sb1, ns) : ns;
    if (cross(r, r1, sb1, sb2)) trend = 1;
    else if (cross(lb1, lb2, r, r1)) trend = -1;
    tl[i] = trend === 1 ? lb[i] : sb[i];
  }
  return { rsiMa, tl };
}

/**
 * QQE MOD (Mihkel00) histogram rengi: +1 = yeşil/mavi "QQE Up", −1 = kırmızı "QQE Down", 0 = gri.
 * Varsayılanlar: QQE 1 (RSI 6, SF 5, 3), Bollinger 50 / 0,35, QQE 2 (RSI 6, SF 5, 1,61), eşik 3.
 */
export function qqeMod(close: number[], rsiLen = 6, sf = 5, factor = 3, rsiLen2 = 6, sf2 = 5, factor2 = 1.61, thr2 = 3, bbLen = 50, bbMult = 0.35): number[] {
  const q1 = qqeLine(close, rsiLen, sf, factor);
  const q2 = qqeLine(close, rsiLen2, sf2, factor2);
  const x = q1.tl.map((v) => v - 50);
  const basis = rollNaN(x, bbLen, sma);
  const dev = rollNaN(x, bbLen, stdev);
  return close.map((_, i) => {
    const upper = basis[i] + bbMult * dev[i];
    const lower = basis[i] - bbMult * dev[i];
    const m1 = q1.rsiMa[i] - 50;
    const m2 = q2.rsiMa[i] - 50;
    if (m2 > thr2 && m1 > upper) return 1;
    if (m2 < -thr2 && m1 < lower) return -1;
    return 0;
  });
}

/**
 * SSL Hybrid (Mihkel00) çıkış okları (SSL3, HMA 15): +1 = yukarı ok (kapanış SSL çıkış çizgisini yukarı keser), −1 = aşağı ok.
 */
export function sslHybridArrows(high: number[], low: number[], close: number[], len = 15): number[] {
  const eh = hma(high, len);
  const el = hma(low, len);
  const n = close.length;
  const line = new Array<number>(n).fill(NaN);
  let hlv = 0;
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(eh[i]) || Number.isNaN(el[i])) continue;
    hlv = close[i] > eh[i] ? 1 : close[i] < el[i] ? -1 : hlv;
    line[i] = hlv < 0 ? eh[i] : el[i];
  }
  return close.map((c, i) => {
    if (i === 0 || Number.isNaN(line[i - 1])) return 0;
    if (c > line[i] && close[i - 1] <= line[i - 1]) return 1;
    if (c < line[i] && close[i - 1] >= line[i - 1]) return -1;
    return 0;
  });
}
