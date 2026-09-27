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
