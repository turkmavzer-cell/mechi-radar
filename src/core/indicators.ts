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
  const a = atr(high, low, close, period);
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
  }
  return dir;
}
