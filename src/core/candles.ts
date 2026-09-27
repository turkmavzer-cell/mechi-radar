import type { Candle, Timeframe } from './types';

export const TF_SECONDS: Record<Timeframe, number> = {
  '15m': 900,
  '20m': 1200,
  '30m': 1800,
  '1h': 3600,
  '2h': 7200,
  '4h': 14400,
  '1d': 86400,
};

export const TF_LABEL: Record<Timeframe, string> = {
  '15m': '15dk',
  '20m': '20dk',
  '30m': '30dk',
  '1h': '1s',
  '2h': '2s',
  '4h': '4s',
  '1d': '1g',
};

export const TF_LONG_LABEL: Record<Timeframe, string> = {
  '15m': '15 dakika',
  '20m': '20 dakika',
  '30m': '30 dakika',
  '1h': '1 saat',
  '2h': '2 saat',
  '4h': '4 saat',
  '1d': '1 gün',
};

/**
 * Mumları daha büyük zaman dilimine birleştirir.
 * sessionAnchored=true: hisse/endeks gibi seanslı piyasalarda kovalar her günün
 * ilk mumundan başlar (TradingView'in seans hizalamasına yakın).
 * false: 7/24 piyasalarda (döviz, kripto, vadeli) kovalar UTC'ye hizalanır.
 */
export function aggregate(
  candles: Candle[],
  tfSec: number,
  sessionAnchored: boolean,
  gmtoffset = 0,
): Candle[] {
  const out: Candle[] = [];
  let dayKey = NaN;
  let anchor = 0;
  let cur: Candle | null = null;
  for (const c of candles) {
    if (sessionAnchored) {
      const key = Math.floor((c.t + gmtoffset) / 86400);
      if (key !== dayKey) {
        dayKey = key;
        anchor = c.t;
      }
    }
    const start = anchor + Math.floor((c.t - anchor) / tfSec) * tfSec;
    if (cur && cur.t === start) {
      cur.h = Math.max(cur.h, c.h);
      cur.l = Math.min(cur.l, c.l);
      cur.c = c.c;
    } else {
      cur = { t: start, o: c.o, h: c.h, l: c.l, c: c.c };
      out.push(cur);
    }
  }
  return out;
}
