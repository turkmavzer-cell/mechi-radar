import { ema } from './indicators';
import type { Candle, Direction, PullbackPhase, SignalEvent, Strength, TfStatus, Timeframe, Trend } from './types';

export interface EmaSet {
  e5: number[];
  e8: number[];
  e13: number[];
  e20: number[];
  e50: number[];
  e200: number[];
}

export function computeEmas(candles: Candle[]): EmaSet {
  const closes = candles.map((c) => c.c);
  return {
    e5: ema(closes, 5),
    e8: ema(closes, 8),
    e13: ema(closes, 13),
    e20: ema(closes, 20),
    e50: ema(closes, 50),
    e200: ema(closes, 200),
  };
}

function strengthAt(dir: Direction, close: number, e200: number): Strength {
  if (Number.isNaN(e200)) return 'unknown';
  const above = close > e200;
  return (dir === 'up') === above ? 'strong' : 'weak';
}

export interface Analysis {
  events: SignalEvent[];
  status: TfStatus | null;
  emas: EmaSet;
}

/**
 * Kapanmış mumlar üzerinde iki stratejiyi baştan sona çalıştırır.
 *
 * EMA 5/8/13: EMA5>EMA8>EMA13 ve üçü de yükseliyorsa yükseliş dizilimi (düşüş tersi).
 * Sinyal dizilimin ilk oluştuğu mumda verilir; aynı yönde yeni sinyal için sıralamanın
 * arada bozulmuş olması gerekir (eğim kısa süre duraklayınca tekrar sinyal çıkmaz).
 *
 * EMA 20/50 pullback (yükseliş; düşüş tersi):
 *   kopuş    : EMA20, EMA50'yi aşağıdan yukarı keser -> senaryo başlar ('trend')
 *   tepe     : kesişimden sonra oluşan en yüksek seviye izlenir
 *   pulled   : mumun dibi EMA20'ye dokunur/altına sarkar; o ana kadarki tepe kırılım seviyesi olur
 *   onay     : bir mum kırılım seviyesinin (geri çekilme öncesi tepe) üstünde kapanır ('confirmed')
 *   iptal    : kapanış EMA50 altında -> yeni bir yukarı kesişim beklenir
 * Onaydan sonra trend sürdükçe yeni geri çekilme + yeni tepe kırılımı yeni sinyal üretir.
 */
export function analyze(symbol: string, tf: Timeframe, candles: Candle[]): Analysis {
  const emas = computeEmas(candles);
  const { e5, e8, e13, e20, e50, e200 } = emas;
  const events: SignalEvent[] = [];
  const push = (i: number, strategy: SignalEvent['strategy'], dir: Direction) => {
    events.push({
      symbol,
      tf,
      strategy,
      dir,
      strength: strengthAt(dir, candles[i].c, e200[i]),
      time: candles[i].t,
      close: candles[i].c,
    });
  };

  let armedUp = true;
  let armedDown = true;
  let align: Trend = 'neutral';

  let phase: PullbackPhase = 'none';
  let pbDir: Trend = 'neutral';
  let extreme = NaN; // kesişimden beri tepe (yükseliş) / dip (düşüş)
  let level = NaN; // geri çekilmede kırılması gereken seviye

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];

    // --- EMA 5/8/13 ---
    if (!Number.isNaN(e13[i - 1])) {
      const orderUp = e5[i] > e8[i] && e8[i] > e13[i];
      const orderDown = e5[i] < e8[i] && e8[i] < e13[i];
      const risingAll = e5[i] > e5[i - 1] && e8[i] > e8[i - 1] && e13[i] > e13[i - 1];
      const fallingAll = e5[i] < e5[i - 1] && e8[i] < e8[i - 1] && e13[i] < e13[i - 1];
      if (!orderUp) armedUp = true;
      if (!orderDown) armedDown = true;
      if (orderUp && risingAll && armedUp) {
        push(i, 'ema5813', 'up');
        armedUp = false;
      } else if (orderDown && fallingAll && armedDown) {
        push(i, 'ema5813', 'down');
        armedDown = false;
      }
      align = orderUp && risingAll ? 'up' : orderDown && fallingAll ? 'down' : 'neutral';
    }

    // --- EMA 20/50 pullback ---
    if (!Number.isNaN(e50[i - 1])) {
      const crossUp = e20[i - 1] <= e50[i - 1] && e20[i] > e50[i];
      const crossDown = e20[i - 1] >= e50[i - 1] && e20[i] < e50[i];
      if (crossUp) {
        phase = 'trend';
        pbDir = 'up';
        extreme = c.h;
        level = NaN;
      } else if (crossDown) {
        phase = 'trend';
        pbDir = 'down';
        extreme = c.l;
        level = NaN;
      } else if (pbDir === 'up') {
        if (c.c < e50[i]) {
          phase = 'none';
          pbDir = 'neutral';
        } else if (phase === 'pulled') {
          if (c.c > level) {
            push(i, 'pullback2050', 'up');
            phase = 'confirmed';
            extreme = c.h;
            level = NaN;
          }
        } else {
          extreme = Math.max(extreme, c.h);
          if (c.l <= e20[i]) {
            phase = 'pulled';
            level = extreme;
          }
        }
      } else if (pbDir === 'down') {
        if (c.c > e50[i]) {
          phase = 'none';
          pbDir = 'neutral';
        } else if (phase === 'pulled') {
          if (c.c < level) {
            push(i, 'pullback2050', 'down');
            phase = 'confirmed';
            extreme = c.l;
            level = NaN;
          }
        } else {
          extreme = Math.min(extreme, c.l);
          if (c.h >= e20[i]) {
            phase = 'pulled';
            level = extreme;
          }
        }
      }
    }
  }

  const last = candles.length - 1;
  const status: TfStatus | null =
    last >= 0
      ? {
          align,
          pullback: phase,
          pullbackDir: pbDir,
          pullbackLevel: phase === 'pulled' ? level : null,
          above200: Number.isNaN(e200[last]) ? null : candles[last].c > e200[last],
          close: candles[last].c,
          time: candles[last].t,
          lastSignal: events[events.length - 1] ?? null,
        }
      : null;

  return { events, status, emas };
}
