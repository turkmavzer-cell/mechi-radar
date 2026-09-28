import { TF_SECONDS } from './candles';
import { atr, rsi, sma, stochOsc } from './indicators';
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

export function srTrades(candles: Candle[], tf: Timeframe, higher: HigherSeries | undefined, params: SrParams = SR_PARAMS): SrTrade[] {
  if (!higher || candles.length < 30) return [];
  const close = candles.map((c) => c.c);
  const r = rsi(close, 14);
  const rMa = sma_nan(r, 14);
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
  const hSec = higher.tf === '1w' ? WEEK : TF_SECONDS[higher.tf];
  const sec = TF_SECONDS[tf];

  const trades: SrTrade[] = [];
  let h = -1; // kapanmış son üst mumun indeksi
  let busyUntil = -1;
  for (let i = 1; i < candles.length; i++) {
    const closeTime = candles[i].t + sec;
    while (h + 1 < hc.length && hc[h + 1].t + hSec <= closeTime) h++;
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
    if (!dir) continue;
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

/** Başındaki NaN'ları atlayarak SMA (RSI'ın ortalaması için). */
function sma_nan(values: number[], period: number): number[] {
  const start = values.findIndex((v) => !Number.isNaN(v));
  const out = new Array<number>(values.length).fill(NaN);
  if (start < 0) return out;
  sma(values.slice(start), period).forEach((v, j) => (out[start + j] = v));
  return out;
}
