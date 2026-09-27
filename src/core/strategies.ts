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
 *   trend    : EMA20>EMA50 ve kapanış EMA20 üstünde
 *   pulled   : mumun dibi EMA20'ye dokunur/altına sarkar, kapanış EMA50 üstünde kalır
 *   iptal    : kapanış EMA50 altında veya EMA20<EMA50
 *   onay     : sonraki bir mum EMA20 üstünde ve önceki mumun tepesinin üstünde kapanır
 *   confirmed: yeni pullback için önce dibin EMA20 üstünde kaldığı bir mum gerekir
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
    if (!Number.isNaN(e50[i])) {
      const up = e20[i] > e50[i];
      const down = e20[i] < e50[i];
      const prev = candles[i - 1];

      // Trend yönü değiştiyse veya EMA50 kırıldıysa senaryo sıfırlanır.
      if (pbDir === 'up' && (!up || c.c < e50[i])) phase = 'none';
      if (pbDir === 'down' && (!down || c.c > e50[i])) phase = 'none';
      if (phase === 'none') pbDir = 'neutral';

      if (phase === 'none') {
        if (up && c.c > e20[i]) {
          phase = 'trend';
          pbDir = 'up';
        } else if (down && c.c < e20[i]) {
          phase = 'trend';
          pbDir = 'down';
        }
      } else if (pbDir === 'up') {
        if (phase === 'trend' && c.l <= e20[i]) {
          phase = 'pulled';
        } else if (phase === 'pulled' && c.c > e20[i] && c.c > prev.h) {
          push(i, 'pullback2050', 'up');
          phase = 'confirmed';
        } else if (phase === 'confirmed' && c.l > e20[i]) {
          phase = 'trend';
        }
      } else if (pbDir === 'down') {
        if (phase === 'trend' && c.h >= e20[i]) {
          phase = 'pulled';
        } else if (phase === 'pulled' && c.c < e20[i] && c.c < prev.l) {
          push(i, 'pullback2050', 'down');
          phase = 'confirmed';
        } else if (phase === 'confirmed' && c.h < e20[i]) {
          phase = 'trend';
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
          above200: Number.isNaN(e200[last]) ? null : candles[last].c > e200[last],
          close: candles[last].c,
          time: candles[last].t,
          lastSignal: events[events.length - 1] ?? null,
        }
      : null;

  return { events, status, emas };
}
