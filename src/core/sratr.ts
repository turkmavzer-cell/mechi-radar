import { TF_SECONDS } from './candles';
import { adx, atr, bollinger, ema, macd, rsi, sma, stochOsc, supertrend } from './indicators';
import type { Candle, Direction, Timeframe } from './types';

/**
 * Stokastik-RSI-ATR stratejisi (çoklu zaman dilimi):
 *   Filtre : bir üst zaman diliminde, kapanmış son 3 mumdan birinde Stokastik %K (14,3,3) < 20 (long) / > 80 (short)
 *   Tetik  : işlem zaman diliminde RSI(14), kendi SMA 14'ünü yukarı (long) / aşağı (short) keser; mum kapanışında giriş
 *   Stop   : giriş ∓ STOP_ATR × ATR(14)
 *   Hedef  : giriş ± RR × stop mesafesi
 * Pozisyon yalnızca hedef ya da stopla kapanır; açık pozisyon varken yeni sinyal verilmez.
 * Aynı mumda hem stop hem hedef görülürse sonuç stop sayılır (temkinli varsayım).
 */
export interface SrParams {
  stopAtr: number;
  rr: number;
  /** Filtre için bakılan kapanmış üst zaman dilimi mumu sayısı. */
  lookback: number;
}
export const SR_PARAMS: SrParams = { stopAtr: 1.5, rr: 2, lookback: 3 };

export type HigherTf = Timeframe | '1w';

export const HIGHER_TF: Record<Timeframe, HigherTf> = {
  '15m': '1h',
  '20m': '1h',
  '30m': '2h',
  '1h': '4h',
  '2h': '1d',
  '4h': '1d',
  '1d': '1w',
};

export const HIGHER_LABEL: Record<HigherTf, string> = {
  '15m': '15dk',
  '20m': '20dk',
  '30m': '30dk',
  '1h': '1s',
  '2h': '2s',
  '4h': '4s',
  '1d': '1g',
  '1w': 'haftalık',
};

/** Üst zaman dilimini hesaplamak için indirilmesi gereken zaman dilimleri (haftalık, günlükten üretilir). */
export function withHigher(tfs: Timeframe[]): Timeframe[] {
  const need = new Set<Timeframe>(tfs);
  for (const tf of tfs) {
    const h = HIGHER_TF[tf];
    need.add(h === '1w' ? '1d' : h);
  }
  return (['15m', '20m', '30m', '1h', '2h', '4h', '1d'] as Timeframe[]).filter((t) => need.has(t));
}

const WEEK = 7 * 86400;
// 1970-01-01 Perşembe; haftalar Pazartesi 00:00 UTC'den başlar.
const MONDAY_OFFSET = 4 * 86400;

/** Günlük mumlardan haftalık mumlar (t = haftanın başlangıcı). */
export function weeklyFromDaily(daily: Candle[]): Candle[] {
  const out: Candle[] = [];
  for (const c of daily) {
    const wk = Math.floor((c.t - MONDAY_OFFSET) / WEEK) * WEEK + MONDAY_OFFSET;
    const last = out[out.length - 1];
    if (last && last.t === wk) {
      last.h = Math.max(last.h, c.h);
      last.l = Math.min(last.l, c.l);
      last.c = c.c;
    } else out.push({ t: wk, o: c.o, h: c.h, l: c.l, c: c.c });
  }
  return out;
}

export interface HigherSeries {
  tf: HigherTf;
  /** Üst zaman dilimi mumları; oluşmakta olan son mum da olabilir, kapanış zamanına göre elenir. */
  candles: Candle[];
}

/** İndirilmiş zaman dilimlerinden bir alt zaman diliminin üst serisini çıkarır. */
export function higherSeries(tf: Timeframe, all: Partial<Record<Timeframe, Candle[]>>): HigherSeries | undefined {
  const h = HIGHER_TF[tf];
  const src = all[h === '1w' ? '1d' : h];
  if (!src?.length) return undefined;
  return { tf: h, candles: h === '1w' ? weeklyFromDaily(src) : src };
}

export interface SrTrade {
  /** Giriş mumunun indeksi. */
  i: number;
  dir: Direction;
  entry: number;
  stop: number;
  target: number;
  /** Pozisyonun kapandığı mum; açıksa undefined. */
  exitI?: number;
  outcome: 'tp' | 'sl' | 'open';
}

/** Girişe ek şart: true dönerse giriş yapılır. */
export type SrFilter = (i: number, dir: Direction) => boolean;

interface FilterInput {
  candles: Candle[];
  /** Her mumda bilinen son kapanmış üst zaman dilimi mumunun indeksi. */
  hIdx: number[];
  higher: HigherSeries;
}

/** Mevcut stratejiye tek bir indikatör ekleyen aday filtreler (araştırma ve yeni varyantlar için). */
export const SR_FILTERS: Record<string, { name: string; make: (x: FilterInput) => SrFilter }> = {
  ema200: {
    name: 'EMA 200 trend yönü',
    make: ({ candles }) => {
      const e = ema(candles.map((c) => c.c), 200);
      return (i, d) => !Number.isNaN(e[i]) && (d === 'up' ? candles[i].c > e[i] : candles[i].c < e[i]);
    },
  },
  ema50: {
    name: 'EMA 50 trend yönü',
    make: ({ candles }) => {
      const e = ema(candles.map((c) => c.c), 50);
      return (i, d) => !Number.isNaN(e[i]) && (d === 'up' ? candles[i].c > e[i] : candles[i].c < e[i]);
    },
  },
  adxTrend: {
    name: 'ADX > 20 (trend var)',
    make: ({ candles }) => {
      const a = adx(candles.map((c) => c.h), candles.map((c) => c.l), candles.map((c) => c.c)).adx;
      return (i) => a[i] > 20;
    },
  },
  adxRange: {
    name: 'ADX < 25 (yatay piyasa)',
    make: ({ candles }) => {
      const a = adx(candles.map((c) => c.h), candles.map((c) => c.l), candles.map((c) => c.c)).adx;
      return (i) => a[i] < 25;
    },
  },
  macdHist: {
    name: 'MACD histogramı sinyal yönünde',
    make: ({ candles }) => {
      const m = macd(candles.map((c) => c.c));
      const h = m.line.map((v, i) => v - m.signal[i]);
      return (i, d) => (d === 'up' ? h[i] > h[i - 1] : h[i] < h[i - 1]);
    },
  },
  rsiZone: {
    name: 'RSI 50 altında al / üstünde sat',
    make: ({ candles }) => {
      const r = rsi(candles.map((c) => c.c), 14);
      return (i, d) => (d === 'up' ? r[i] < 50 : r[i] > 50);
    },
  },
  bbMid: {
    name: 'Bollinger orta bandın altında al / üstünde sat',
    make: ({ candles }) => {
      const b = bollinger(candles.map((c) => c.c));
      return (i, d) => (d === 'up' ? candles[i].c < b.mid[i] : candles[i].c > b.mid[i]);
    },
  },
  bbTouch: {
    name: 'Son 5 mumda Bollinger alt/üst banda değmiş',
    make: ({ candles }) => {
      const b = bollinger(candles.map((c) => c.c));
      return (i, d) => {
        for (let k = Math.max(0, i - 4); k <= i; k++) if (d === 'up' ? candles[k].l <= b.lower[k] : candles[k].h >= b.upper[k]) return true;
        return false;
      };
    },
  },
  supertrend: {
    name: 'Supertrend (10, 3) aynı yönde',
    make: ({ candles }) => {
      const st = supertrend(candles.map((c) => c.h), candles.map((c) => c.l), candles.map((c) => c.c));
      return (i, d) => st[i] === (d === 'up' ? 1 : -1);
    },
  },
  htfTurn: {
    name: 'Üst zaman dilimi Stokastik dönmüş (%K, %D\'yi kesmiş)',
    make: ({ higher, hIdx }) => {
      const hc = higher.candles;
      const s = stochOsc(hc.map((c) => c.h), hc.map((c) => c.l), hc.map((c) => c.c));
      return (i, d) => {
        const h = hIdx[i];
        return d === 'up' ? s.k[h] > s.d[h] : s.k[h] < s.d[h];
      };
    },
  },
  candle: {
    name: 'Giriş mumu sinyal yönünde kapanmış',
    make: ({ candles }) => (i, d) => (d === 'up' ? candles[i].c > candles[i].o : candles[i].c < candles[i].o),
  },
};

export function srTrades(
  candles: Candle[],
  tf: Timeframe,
  higher: HigherSeries | undefined,
  params: SrParams = SR_PARAMS,
  filters: string[] = [],
): SrTrade[] {
  if (!higher || candles.length < 30) return [];
  const close = candles.map((c) => c.c);
  const { rsi: r, sma: rMa } = rsiWithSma(close);
  const a = atr(
    candles.map((c) => c.h),
    candles.map((c) => c.l),
    close,
    14,
  );
  const hc = higher.candles;
  const hk = stochOsc(
    hc.map((c) => c.h),
    hc.map((c) => c.l),
    hc.map((c) => c.c),
  ).k;
  const hIdx = alignHigher(candles, tf, higher);
  const extra = filters.map((id) => SR_FILTERS[id].make({ candles, hIdx, higher }));

  const trades: SrTrade[] = [];
  let busyUntil = -1;
  for (let i = 1; i < candles.length; i++) {
    const h = hIdx[i];
    if (i <= busyUntil || h < 0) continue;
    const up = r[i - 1] <= rMa[i - 1] && r[i] > rMa[i];
    const down = r[i - 1] >= rMa[i - 1] && r[i] < rMa[i];
    if ((!up && !down) || Number.isNaN(a[i])) continue;
    let low = false;
    let high = false;
    for (let k = Math.max(0, h - params.lookback + 1); k <= h; k++) {
      if (hk[k] < 20) low = true;
      if (hk[k] > 80) high = true;
    }
    const dir: Direction | null = up && low ? 'up' : down && high ? 'down' : null;
    if (!dir || !extra.every((f) => f(i, dir))) continue;
    const entry = close[i];
    const risk = params.stopAtr * a[i];
    const s = dir === 'up' ? 1 : -1;
    const t: SrTrade = { i, dir, entry, stop: entry - s * risk, target: entry + s * params.rr * risk, outcome: 'open' };
    for (let j = i + 1; j < candles.length; j++) {
      const c = candles[j];
      const hitStop = dir === 'up' ? c.l <= t.stop : c.h >= t.stop;
      const hitTarget = dir === 'up' ? c.h >= t.target : c.l <= t.target;
      if (hitStop || hitTarget) {
        t.outcome = hitStop ? 'sl' : 'tp';
        t.exitI = j;
        break;
      }
    }
    trades.push(t);
    busyUntil = t.exitI ?? candles.length;
  }
  return trades;
}

/** Her mumun kapanışında bilinen (kapanmış) son üst zaman dilimi mumunun indeksi; yoksa -1. */
export function alignHigher(candles: Candle[], tf: Timeframe, higher: HigherSeries): number[] {
  const hc = higher.candles;
  const hSec = higher.tf === '1w' ? WEEK : TF_SECONDS[higher.tf];
  const sec = TF_SECONDS[tf];
  const out = new Array<number>(candles.length);
  let h = -1;
  for (let i = 0; i < candles.length; i++) {
    const closeTime = candles[i].t + sec;
    while (h + 1 < hc.length && hc[h + 1].t + hSec <= closeTime) h++;
    out[i] = h;
  }
  return out;
}

/** Üst zaman dilimi Stokastiği (14,3,3), alt zaman dilimi mumlarına basamak şeklinde yerleştirilmiş. */
export function higherStoch(candles: Candle[], tf: Timeframe, higher: HigherSeries | undefined): { k: number[]; d: number[] } {
  if (!higher) return { k: candles.map(() => NaN), d: candles.map(() => NaN) };
  const hc = higher.candles;
  const s = stochOsc(
    hc.map((c) => c.h),
    hc.map((c) => c.l),
    hc.map((c) => c.c),
  );
  const idx = alignHigher(candles, tf, higher);
  return { k: idx.map((h) => (h < 0 ? NaN : s.k[h])), d: idx.map((h) => (h < 0 ? NaN : s.d[h])) };
}

/** RSI(14) ve RSI'ın SMA 14'ü (stratejinin tetik çizgileri). */
export function rsiWithSma(close: number[]): { rsi: number[]; sma: number[] } {
  const r = rsi(close, 14);
  return { rsi: r, sma: sma_nan(r, 14) };
}

/** Başındaki NaN'ları atlayarak SMA (RSI'ın ortalaması için). */
function sma_nan(values: number[], period: number): number[] {
  const start = values.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(values.length).fill(NaN);
  if (start < 0) return out;
  sma(values.slice(start), period).forEach((v, j) => (out[start + j] = v));
  return out;
}
