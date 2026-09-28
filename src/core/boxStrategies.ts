import { BOX_CANDIDATES, BOX_PARAMS, simulate, type BoxParams, type BoxTrade } from './boxes';
import { HIGHER_LABEL, HIGHER_TF, SR_PARAMS, srTrades, type HigherSeries } from './sratr';
import type { Candle, Strategy, Timeframe } from './types';

/** Grafikte kutularla gösterilen, bildirim üreten giriş-stop-hedef stratejileri. */
export interface BoxStrategy {
  id: Strategy;
  name: string;
  /** Çipte görünen kısa ad. */
  short: string;
  /** Tek satırlık kural özeti. */
  rule: (tf: Timeframe) => string;
  /** `exit` ile çıkış kuralı değiştirilebilir (ör. `{ trail: 1 }` takip eden kâr al). */
  run: (closed: Candle[], tf: Timeframe, higher: HigherSeries | undefined, exit?: Partial<BoxParams>) => BoxTrade[];
}

const exits = `Stop ${SR_PARAMS.stopAtr.toLocaleString('tr-TR')} ATR · hedef ${SR_PARAMS.rr}R`;
const sra = (id: Strategy, name: string, short: string, filters: string[], extra: string): BoxStrategy => ({
  id,
  name,
  short,
  rule: (tf) => `${HIGHER_LABEL[HIGHER_TF[tf]]} Stokastik 20 altı/80 üstü + RSI ortalamasını keser${extra} · ${exits}`,
  run: (c, tf, higher, exit) => srTrades(c, tf, higher, { ...SR_PARAMS, ...exit }, filters),
});

const fromCandidate = (id: Strategy, candidate: string, short: string, rule: string): BoxStrategy => {
  const b = BOX_CANDIDATES.find((x) => x.id === candidate)!;
  return { id, name: b.name, short, rule: () => `${rule} · ${exits}`, run: (c, _tf, _h, exit) => simulate(c, b.signals(c), { ...BOX_PARAMS, ...exit }) };
};

export const BOX_STRATEGIES: BoxStrategy[] = [
  sra('sratr', 'Stokastik-RSI-ATR', 'SRA', [], ''),
  sra('sratrEma', 'SRA + EMA 200', 'SRA + EMA 200', ['ema200'], ' · EMA 200 yönünde'),
  sra('sratrAdx', 'SRA + ADX', 'SRA + ADX', ['adxRange'], ' · ADX 25 altı'),
  fromCandidate('sarmacd', 'sarmacd', 'SAR + MACD', 'SAR fiyatın altına geçer + fiyat EMA 200 üstünde + MACD sinyalin üstünde (short tersi)'),
  fromCandidate('squeeze', 'squeeze', 'Squeeze', 'Sıkışma biter (Bollinger, Keltner dışına çıkar) + momentum ve SMA 50 aynı yönde'),
];
