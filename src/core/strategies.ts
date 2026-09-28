import { ema, macd, rsi, sma, supertrend } from './indicators';
import { bbReversion, rsiDivergence, stochastic } from './extra';
import { SR_VARIANTS, srTrades, SR_PARAMS, type HigherSeries } from './sratr';
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
 * Sinyaller sırayla değişir: yükseliş sinyalinden sonraki ilk sinyal ancak düşüş dizilimi
 * oluştuğunda (düşüş sinyali) verilir; tersi de aynı. Aynı yönde art arda sinyal çıkmaz.
 *
 * EMA 20/50 pullback (yükseliş; düşüş tersi):
 *   kopuş    : EMA20, EMA50'yi aşağıdan yukarı keser -> senaryo başlar ('trend')
 *   tepe     : kesişimden sonra oluşan en yüksek seviye izlenir
 *   pulled   : mumun dibi EMA20'ye dokunur/altına sarkar; o ana kadarki tepe kırılım seviyesi olur
 *   onay     : bir mum kırılım seviyesinin (geri çekilme öncesi tepe) üstünde kapanır ('confirmed')
 *   iptal    : kapanış EMA50 altında -> yeni bir yukarı kesişim beklenir
 * Onaydan sonra trend sürdükçe yeni geri çekilme + yeni tepe kırılımı yeni sinyal üretir.
 */
export function analyze(symbol: string, tf: Timeframe, candles: Candle[], higher?: HigherSeries): Analysis {
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

  let align: Trend = 'neutral';
  /** Son 5·8·13 sinyalinin yönü; aynı yönde ikinci sinyal verilmez. */
  let lastDir: Trend = 'neutral';

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
      // Yön sırayla değişir: yükseliş sinyalinden sonra yeniden yükseliş için önce düşüş dizilimi
      // oluşup düşüş sinyali verilmiş olmalı (tersi de aynı).
      if (orderUp && risingAll && lastDir !== 'up') {
        push(i, 'ema5813', 'up');
        lastDir = 'up';
      } else if (orderDown && fallingAll && lastDir !== 'down') {
        push(i, 'ema5813', 'down');
        lastDir = 'down';
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

  const extra = extraStrategies(candles, push);
  // Ortalamaya dönüş stratejileri (araştırmada 20dk/30dk/4s'te en tutarlı sonuç verenler).
  for (const s of bbReversion(candles)) push(s.i, 'bbrev', s.dir);
  for (const s of stochastic(candles)) push(s.i, 'stoch', s.dir);
  for (const s of rsiDivergence(candles)) push(s.i, 'rsidiv', s.dir);
  for (const s of macdSignals(candles)) push(s.i, 'macd', s.dir);
  // Stokastik-RSI-ATR yalnızca üst zaman dilimi verisi verildiyse hesaplanır.
  for (const v of SR_VARIANTS)
    for (const s of srTrades(candles, tf, higher, SR_PARAMS, [...v.filters])) {
      push(s.i, v.id, s.dir);
      events[events.length - 1].levels = { entry: s.entry, stop: s.stop, target: s.target };
    }
  // Stratejiler ayrı döngülerde çalıştığı için olayları zamana göre sırala.
  events.sort((a, b) => a.time - b.time);

  const last = candles.length - 1;
  const status: TfStatus | null =
    last >= 0
      ? {
          align,
          ema5813Dir: lastDir,
          pullback: phase,
          pullbackDir: pbDir,
          pullbackLevel: phase === 'pulled' ? level : null,
          above200: Number.isNaN(e200[last]) ? null : candles[last].c > e200[last],
          ...extra,
          close: candles[last].c,
          time: candles[last].t,
          lastSignal: events[events.length - 1] ?? null,
        }
      : null;

  return { events, status, emas };
}

/** Kesişim: önceki mumda a<=b iken bu mumda a>b (yukarı) ya da tersi (aşağı). */
function crossedUp(a: number[], b: number[] | number, i: number): boolean {
  const bi = typeof b === 'number' ? b : b[i];
  const bp = typeof b === 'number' ? b : b[i - 1];
  return a[i - 1] <= bp && a[i] > bi;
}
function crossedDown(a: number[], b: number[] | number, i: number): boolean {
  const bi = typeof b === 'number' ? b : b[i];
  const bp = typeof b === 'number' ? b : b[i - 1];
  return a[i - 1] >= bp && a[i] < bi;
}

/** Üçlü Onay: MACD ve RSI kesişimleri arasındaki, ve son kesişimden ok mumuna kadar en fazla mum farkı. */
export const TRIPLE_WINDOW = 3;

interface TripleTrack {
  /** Son MACD 0 kesişiminin ve son RSI 50 kesişiminin mum indeksi. */
  m: number;
  r: number;
  /** Ok verilmiş kesişim çifti (aynı çift için tekrar ok çıkmaz). */
  fired: string;
}

function tripleReady(t: TripleTrack, i: number): boolean {
  return Math.abs(t.m - t.r) <= TRIPLE_WINDOW && i - Math.max(t.m, t.r) <= TRIPLE_WINDOW;
}
const DONCHIAN = 20;

/**
 * Ek stratejiler (grafikte çizilmez, yalnızca ok işareti):
 *
 * Üçlü Onay (MACD + RSI + Bollinger): MACD çizgisi 0'ı yukarı keser ve bu kesişimin en fazla
 *   TRIPLE_WINDOW mum öncesinde/sonrasında RSI(14) 50'yi yukarı keser (sıra fark etmez). Ok, son
 *   kesişimden sonraki en fazla TRIPLE_WINDOW mum içinde Bollinger orta bandının (SMA 20) üstünde
 *   kapanan ilk mumda verilir; o anda MACD > 0 ve RSI > 50 de sürmelidir. Düşüş: tersi.
 * Supertrend (10, 3): yön değişiminde sinyal.
 * Altın / Ölüm kesişimi: SMA 50, SMA 200'ü yukarı / aşağı keser.
 * Donchian 20 (Turtle kırılımı): kapanış önceki 20 mumun en yükseğinin üstünde / en düşüğünün
 *   altında. Sinyal yalnızca kırılım yönü değiştiğinde verilir.
 */
function extraStrategies(candles: Candle[], push: (i: number, s: SignalEvent['strategy'], d: Direction) => void) {
  const close = candles.map((c) => c.c);
  const high = candles.map((c) => c.h);
  const low = candles.map((c) => c.l);
  const m = macd(close).line;
  const r = rsi(close, 14);
  const mid = sma(close, 20);
  const s50 = sma(close, 50);
  const s200 = sma(close, 200);
  const st = supertrend(high, low, close, 10, 3);

  const up: TripleTrack = { m: -Infinity, r: -Infinity, fired: '' };
  const dn: TripleTrack = { m: -Infinity, r: -Infinity, fired: '' };
  let tripleUp = false;
  let tripleDn = false;
  let don: Trend = 'neutral';

  for (let i = 1; i < candles.length; i++) {
    // --- Üçlü Onay ---
    if (!Number.isNaN(m[i - 1]) && !Number.isNaN(r[i - 1]) && !Number.isNaN(mid[i])) {
      if (crossedUp(m, 0, i)) up.m = i;
      if (crossedUp(r, 50, i)) up.r = i;
      if (crossedDown(m, 0, i)) dn.m = i;
      if (crossedDown(r, 50, i)) dn.r = i;
      const upNow = m[i] > 0 && r[i] > 50 && close[i] > mid[i];
      const dnNow = m[i] < 0 && r[i] < 50 && close[i] < mid[i];
      if (upNow && tripleReady(up, i) && up.fired !== `${up.m}:${up.r}`) {
        push(i, 'triple', 'up');
        up.fired = `${up.m}:${up.r}`;
      }
      if (dnNow && tripleReady(dn, i) && dn.fired !== `${dn.m}:${dn.r}`) {
        push(i, 'triple', 'down');
        dn.fired = `${dn.m}:${dn.r}`;
      }
      tripleUp = upNow;
      tripleDn = dnNow;
    }

    // --- Supertrend ---
    if (!Number.isNaN(st[i - 1]) && st[i] !== st[i - 1]) push(i, 'supertrend', st[i] > 0 ? 'up' : 'down');

    // --- Altın / Ölüm kesişimi ---
    if (!Number.isNaN(s200[i - 1])) {
      if (crossedUp(s50, s200, i)) push(i, 'goldencross', 'up');
      else if (crossedDown(s50, s200, i)) push(i, 'goldencross', 'down');
    }

    // --- Donchian 20 ---
    if (i >= DONCHIAN) {
      let hh = -Infinity;
      let ll = Infinity;
      for (let j = i - DONCHIAN; j < i; j++) {
        if (high[j] > hh) hh = high[j];
        if (low[j] < ll) ll = low[j];
      }
      if (close[i] > hh && don !== 'up') {
        don = 'up';
        push(i, 'donchian', 'up');
      } else if (close[i] < ll && don !== 'down') {
        don = 'down';
        push(i, 'donchian', 'down');
      }
    }
  }

  const last = candles.length - 1;
  if (last < 0) return {};
  const score = (m[last] > 0 ? 1 : 0) + (r[last] > 50 ? 1 : 0) + (close[last] > mid[last] ? 1 : 0);
  const trend = (up: boolean, dn: boolean): Trend => (up ? 'up' : dn ? 'down' : 'neutral');
  return {
    triple: trend(tripleUp, tripleDn),
    tripleScore: Number.isNaN(m[last]) || Number.isNaN(r[last]) || Number.isNaN(mid[last]) ? undefined : score,
    supertrend: Number.isNaN(st[last]) ? undefined : st[last] > 0 ? ('up' as Trend) : ('down' as Trend),
    golden: Number.isNaN(s200[last]) ? undefined : trend(s50[last] > s200[last], s50[last] < s200[last]),
    donchian: don,
  };
}

export interface SignalPerformance {
  /** Sinyal kapanışından ölçüm sonuna kadar fiyat değişimi (%). */
  movePct: number;
  /** Aynı aralıkta sinyal yönünde görülen en iyi hareket (%): yükselişte en yüksek, düşüşte en düşük. */
  bestPct: number;
  /** true: aynı stratejide henüz yeni sinyal yok, ölçüm son fiyata kadar. */
  ongoing: boolean;
}

/**
 * Her sinyal için, aynı stratejinin bir sonraki sinyaline (yoksa son fiyata) kadar olan hareket.
 * candles oluşmakta olan son mumu da içerebilir.
 */
export function signalPerformance(events: SignalEvent[], candles: Candle[]): Map<SignalEvent, SignalPerformance> {
  const out = new Map<SignalEvent, SignalPerformance>();
  if (!candles.length) return out;
  const index = new Map(candles.map((c, i) => [c.t, i]));
  const byStrategy = new Map<string, SignalEvent[]>();
  for (const e of events) {
    const list = byStrategy.get(e.strategy) ?? [];
    list.push(e);
    byStrategy.set(e.strategy, list);
  }
  for (const list of byStrategy.values()) {
    list.sort((a, b) => a.time - b.time);
    list.forEach((e, k) => {
      const start = index.get(e.time);
      if (start === undefined) return;
      const next = list[k + 1];
      const end = next ? (index.get(next.time) ?? candles.length - 1) : candles.length - 1;
      let best = e.close;
      for (let i = start + 1; i <= end; i++) {
        best = e.dir === 'up' ? Math.max(best, candles[i].h) : Math.min(best, candles[i].l);
      }
      const endPrice = candles[end].c;
      out.set(e, {
        movePct: ((endPrice - e.close) / e.close) * 100,
        bestPct: ((best - e.close) / e.close) * 100,
        ongoing: !next,
      });
    });
  }
  return out;
}

/**
 * MACD (12, 26, 9): yalnızca MACD çizgisinin (mavi) sıfır kesişimi.
 *   ▲ 0'ı aşağıdan yukarı keser · ▼ 0'ı yukarıdan aşağı keser
 */
export function macdSignals(candles: Candle[]): { i: number; dir: Direction }[] {
  const { line } = macd(candles.map((c) => c.c));
  const out: { i: number; dir: Direction }[] = [];
  for (let i = 1; i < candles.length; i++) {
    if (Number.isNaN(line[i - 1])) continue;
    if (line[i - 1] <= 0 && line[i] > 0) out.push({ i, dir: 'up' });
    else if (line[i - 1] >= 0 && line[i] < 0) out.push({ i, dir: 'down' });
  }
  return out;
}
