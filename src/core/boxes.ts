import {
  atr,
  highest,
  lowest,
  chandelier,
  ema,
  ichimoku,
  macd,
  psar,
  squeezeMomentum,
  rsi,
  sma,
  stochRsi,
  supertrend,
  utBot,
  williamsR,
  zlsma,
} from './indicators';
import type { Candle, Direction } from './types';

/**
 * Kutulu (giriş-stop-hedef) stratejiler için ortak motor.
 * Giriş sinyal mumunun kapanışında; stop giriş ∓ stopAtr × ATR(14), hedef ± rr × stop mesafesi.
 * Pozisyon yalnızca hedef ya da stopla kapanır; açık pozisyon varken gelen sinyaller yok sayılır.
 * Aynı mumda hem stop hem hedef görülürse stop sayılır (temkinli varsayım).
 */
export interface BoxParams {
  stopAtr: number;
  rr: number;
  /**
   * Takip eden kâr al: tanımlıysa hedefe ulaşınca pozisyon kapanmaz; stop hedefe çekilir ve fiyat kâr yönünde gittikçe
   * görülen en iyi fiyatın `trail × ATR` gerisinden takip eder. Fiyat bu stopa dönünce kapanır (en az ~hedef kadar kâr).
   */
  trail?: number;
  /**
   * true: hedefe değince stop tam hedefe kilitlenir (en az hedef kadar kâr, ama küçük geri çekilmede kapanır).
   * false (varsayılan): stop en iyi fiyatın `trail × ATR` gerisine konur; hedefte bu ≈ hedef − trail×ATR seviyesidir.
   */
  trailLock?: boolean;
  /**
   * true: işlem hangi yolla kapanırsa kapansın (stop mum içinde de olsa) aynı mumun kapanışındaki sinyal yeni işlem açar.
   * Dur-ve-dön stratejileri için (ör. Heikin Ashi Smoothed renk dönüşü). Varsayılan: yalnızca kural çıkışında.
   */
  sameBarEntry?: boolean;
  /** Fiyat girişten bu kadar R kâra geçince stop giriş fiyatına çekilir (başa baş; bir sonraki mumdan itibaren). */
  breakeven?: number;
  /** true: stop yok; `stopAtr` × ATR yalnızca R ölçüsü için referans risk (ör. sürekli pozisyonda kalan kesişim stratejisi). */
  noStop?: boolean;
}
export const BOX_PARAMS: BoxParams = { stopAtr: 1.5, rr: 2 };

export interface BoxSignal {
  i: number;
  dir: Direction;
  /** Sinyale özel sabit hedef fiyatı (ör. formasyon yüksekliği); yoksa `rr` × risk. */
  target?: number;
  /** Sinyale özel stop fiyatı (ör. önceki dibin altı); yoksa `stopAtr` × ATR. */
  stop?: number;
  /** Grafikte çizilecek çizgiler (ör. formasyon kenarları): [mum1, fiyat1, mum2, fiyat2]. */
  lines?: [number, number, number, number][];
}

/** Her mumda değişen hedef seviyesi (ör. Bollinger karşı bandı); `j` mumunun kapanışındaki değer. */
export type TargetLine = (j: number, dir: Direction) => number;

export interface BoxTrade {
  i: number;
  dir: Direction;
  entry: number;
  stop: number;
  target: number;
  exitI?: number;
  outcome: 'tp' | 'sl' | 'open';
  /** Kapanış fiyatı (kapanmış işlemlerde). */
  exitPrice?: number;
  /** Gerçekleşen sonuç, R cinsinden (kapanmış işlemlerde). */
  r?: number;
  /** Takip eden kâr al devrede (hedefe ulaşıldı); açık işlemde güncel takip stopu `trailStop`. */
  trailing?: boolean;
  trailStop?: number;
  /** Takip sırasında görülen en iyi fiyat (hedef dahil). */
  peak?: number;
  /** Stop/hedef yerine kural çıkışıyla (mum kapanışında) kapandı. */
  ruleExit?: boolean;
  /** R hesabında kullanılan risk (fiyat birimi). Stopsuz stratejide stop = giriş, risk referanstır. */
  risk?: number;
  lines?: [number, number, number, number][];
}

/** Kural çıkışı: `j` mumunun kapanışında pozisyon kapatılsın mı. */
export type ExitRule = (j: number, dir: Direction, ctx: ExitContext) => boolean;
/** Kural çıkışına verilen işlem bilgisi: şimdiye kadar görülen en iyi kâr (R, bu mum dahil). */
export interface ExitContext {
  bestR: number;
  /** Giriş mumu, giriş fiyatı ve şimdiye kadar görülen en iyi fiyat (bu mum dahil). */
  i: number;
  entry: number;
  best: number;
}

/**
 * `exitRule` verilirse stop ve hedefe ek olarak mum kapanışında kural çıkışı da uygulanır (hangisi önce gelirse).
 * Kural çıkışında sonuç kâr ise 'tp', zarar ise 'sl' sayılır; `ruleExit` işaretlenir.
 */
export function simulate(
  candles: Candle[],
  signals: BoxSignal[],
  params: BoxParams = BOX_PARAMS,
  exitRule?: ExitRule,
  targetLine?: TargetLine,
  /** Çıkış çizgisi (ör. EMA 55): fiyat bir önceki mumdaki seviyeye değince o seviyeden (boşlukta açılıştan) çıkılır. */
  exitLine?: TargetLine,
): BoxTrade[] {
  const a = atr(
    candles.map((c) => c.h),
    candles.map((c) => c.l),
    candles.map((c) => c.c),
    14,
  );
  const trades: BoxTrade[] = [];
  let busyUntil = -1;
  for (const sig of [...signals].sort((x, y) => x.i - y.i)) {
    const { i, dir } = sig;
    if (i <= busyUntil || Number.isNaN(a[i])) continue;
    const entry = candles[i].c;
    const s = dir === 'up' ? 1 : -1;
    const risk = sig.stop != null ? s * (entry - sig.stop) : params.stopAtr * a[i];
    if (!(risk > 0)) continue;
    const target = sig.target ?? (targetLine ? targetLine(i, dir) : entry + s * params.rr * risk);
    // Hedef girişin yanlış tarafındaysa (ör. bant zaten geçilmiş) işlem açılmaz.
    if (!(s * (target - entry) > 0)) continue;
    const t: BoxTrade = { i, dir, entry, stop: params.noStop ? entry : entry - s * risk, target, outcome: 'open', risk };
    if (sig.lines) t.lines = sig.lines;
    const gap = params.trail != null ? params.trail * a[i] : NaN;
    let stopLvl = params.noStop ? NaN : t.stop; // geçerli stop (başa başta girişe çekilir; kutuda ilk stop kalır)
    let best = NaN; // takipte görülen en iyi fiyat
    let trailStop = NaN;
    let bestR = -Infinity; // görülen en iyi kâr (R)
    for (let j = i + 1; j < candles.length; j++) {
      const c = candles[j];
      bestR = Math.max(bestR, (s * ((dir === 'up' ? c.h : c.l) - entry)) / risk);
      if (!t.trailing) {
        const hitStop = dir === 'up' ? c.l <= stopLvl : c.h >= stopLvl;
        // Değişen hedefte bir önceki mumun kapanışındaki seviye kullanılır (mum içinde geleceğe bakmamak için).
        const tgt = targetLine ? targetLine(j - 1, dir) : t.target;
        const hitTarget = dir === 'up' ? c.h >= tgt : c.l <= tgt;
        const lvl = exitLine ? exitLine(j - 1, dir) : NaN;
        const hitLine = !Number.isNaN(lvl) && (dir === 'up' ? c.l <= lvl : c.h >= lvl);
        // Çizgi stoptan önce gelir (fiyat stopa inmeden çizgiyi geçer); aynı mumda ikisi de varsa çizgi seviyesi daha yakındaysa o.
        if (hitLine && !(hitStop && s * (lvl - stopLvl) < 0)) {
          closeByRule(t, j, dir === 'up' ? Math.min(lvl, c.o) : Math.max(lvl, c.o), entry, s, risk);
          break;
        }
        if (hitStop) {
          t.outcome = 'sl';
          t.exitI = j;
          t.exitPrice = stopLvl;
          t.r = stopLvl === entry ? 0 : -1; // başa başa çekilmiş stop 0R, değilse −1R
          break;
        }
        if (!hitTarget) {
          if (exitRule?.(j, dir, { bestR, i, entry, best: entry + (s * bestR * risk) })) {
            closeByRule(t, j, c.c, entry, s, risk);
            break;
          }
          // Başa baş: bu mumda yeterli kâr görüldüyse stop bir sonraki mumdan itibaren girişte.
          if (params.breakeven != null && s * ((dir === 'up' ? c.h : c.l) - entry) >= params.breakeven * risk) stopLvl = entry;
          continue;
        }
        // Değişen hedefte mum hedefin ötesinde açıldıysa açılış fiyatından çıkılır.
        const px = targetLine ? (dir === 'up' ? Math.max(tgt, c.o) : Math.min(tgt, c.o)) : t.target;
        if (Number.isNaN(gap)) {
          t.exitI = j;
          t.exitPrice = px;
          t.r = (s * (px - entry)) / risk;
          t.outcome = t.r > 0 ? 'tp' : 'sl';
          break;
        }
        // Hedefe değildi: bu mumdaki hedef sonrası hareket bilinmediği için takip bir sonraki mumdan başlar (temkinli).
        t.trailing = true;
        best = px;
        trailStop = params.trailLock ? px : px - s * gap;
        continue;
      }
      // Takipte: önce mevcut stopa dokunuldu mu (boşlukla açılışta stop aşıldıysa açılış fiyatından çıkılır).
      const hit = dir === 'up' ? c.l <= trailStop : c.h >= trailStop;
      if (hit) {
        const px = dir === 'up' ? Math.min(trailStop, c.o) : Math.max(trailStop, c.o);
        t.outcome = 'tp';
        t.exitI = j;
        t.exitPrice = px;
        t.r = (s * (px - entry)) / risk;
        t.peak = best;
        break;
      }
      best = dir === 'up' ? Math.max(best, c.h) : Math.min(best, c.l);
      if (exitRule?.(j, dir, { bestR, i, entry, best: entry + (s * bestR * risk) })) {
        closeByRule(t, j, c.c, entry, s, risk);
        t.peak = best;
        break;
      }
      trailStop = dir === 'up' ? Math.max(trailStop, best - gap) : Math.min(trailStop, best + gap);
    }
    if (t.trailing && t.outcome === 'open') {
      t.trailStop = trailStop;
      t.peak = best;
    }
    trades.push(t);
    // Kural çıkışı mum kapanışında olur: aynı mumdaki ters sinyal (ör. renk dönüşü) o kapanışta yeni işlem açar.
    busyUntil = t.exitI == null ? candles.length : t.ruleExit || params.sameBarEntry ? t.exitI - 1 : t.exitI;
  }
  return trades;
}

function closeByRule(t: BoxTrade, j: number, px: number, entry: number, s: number, risk: number) {
  t.exitI = j;
  t.exitPrice = px;
  t.r = (s * (px - entry)) / risk;
  t.outcome = t.r > 0 ? 'tp' : 'sl';
  t.ruleExit = true;
}

const H = (c: Candle[]) => c.map((x) => x.h);
const L = (c: Candle[]) => c.map((x) => x.l);
const C = (c: Candle[]) => c.map((x) => x.c);

/** Bir yön dizisinin (1/-1) değiştiği mumlar. */
function flips(dir: number[], ok: (i: number, d: Direction) => boolean = () => true): BoxSignal[] {
  const out: BoxSignal[] = [];
  for (let i = 1; i < dir.length; i++) {
    if (Number.isNaN(dir[i - 1]) || dir[i] === dir[i - 1]) continue;
    const d: Direction = dir[i] === 1 ? 'up' : 'down';
    if (ok(i, d)) out.push({ i, dir: d });
  }
  return out;
}

/** Fiyat bir ortalamanın sinyal yönündeki tarafında mı. */
const side = (c: Candle[], m: number[]) => (i: number, d: Direction) =>
  !Number.isNaN(m[i]) && (d === 'up' ? c[i].c > m[i] : c[i].c < m[i]);

export interface BoxCandidate {
  id: string;
  name: string;
  /** Kaynak / iddia (araştırma raporu için). */
  source: string;
  rule: string;
  signals: (c: Candle[]) => BoxSignal[];
  /** İsteğe bağlı kural çıkışı (stop ve hedefe ek). */
  exit?: (c: Candle[]) => ExitRule;
}

/** Web'de "test edilmiş, en iyi" diye öne çıkan indikatör stratejileri (hepsi aynı kutu kurallarıyla sınanır). */
export const BOX_CANDIDATES: BoxCandidate[] = [
  {
    id: 'macd200',
    name: 'MACD + EMA 200',
    source: 'Trading Rush: 100 testte ~%62–65 isabet, en yüksek isabetli strateji',
    rule: 'Fiyat EMA 200 üstünde ve MACD sıfırın altındayken sinyal çizgisini yukarı keser → LONG (short tersi)',
    signals: (c) => {
      const m = macd(C(c));
      const e = ema(C(c), 200);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        const up = m.line[i - 1] <= m.signal[i - 1] && m.line[i] > m.signal[i] && m.line[i] < 0;
        const dn = m.line[i - 1] >= m.signal[i - 1] && m.line[i] < m.signal[i] && m.line[i] > 0;
        if (up && c[i].c > e[i]) out.push({ i, dir: 'up' });
        else if (dn && c[i].c < e[i]) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'rsi2',
    name: 'Connors RSI(2)',
    source: 'Larry Connors: endekslerde %70–85 isabet (ortalamaya dönüş)',
    rule: 'Fiyat SMA 200 üstünde ve RSI(2) 5 altında → LONG; SMA 200 altında ve RSI(2) 95 üstünde → SHORT',
    signals: (c) => {
      const r = rsi(C(c), 2);
      const s = sma(C(c), 200);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        if (Number.isNaN(s[i])) continue;
        if (c[i].c > s[i] && r[i] < 5 && r[i - 1] >= 5) out.push({ i, dir: 'up' });
        else if (c[i].c < s[i] && r[i] > 95 && r[i - 1] <= 95) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'willr',
    name: 'Williams %R (2)',
    source: 'QuantifiedStrategies: en istikrarlı osilatör, ~%81 isabet',
    rule: 'Fiyat SMA 200 üstünde ve %R(2) −90 altına iner → LONG; SMA 200 altında ve −10 üstüne çıkar → SHORT',
    signals: (c) => {
      const w = williamsR(H(c), L(c), C(c), 2);
      const s = sma(C(c), 200);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        if (Number.isNaN(s[i])) continue;
        if (c[i].c > s[i] && w[i] < -90 && w[i - 1] >= -90) out.push({ i, dir: 'up' });
        else if (c[i].c < s[i] && w[i] > -10 && w[i - 1] <= -10) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'ibs',
    name: 'IBS (mum içi güç)',
    source: 'QuantifiedStrategies: SPY\'de ~%78 isabet',
    rule: 'Fiyat SMA 200 üstünde ve mum kapanışı mumun alt %20\'sinde → LONG; SMA 200 altında ve üst %20\'sinde → SHORT',
    signals: (c) => {
      const s = sma(C(c), 200);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        const rng = c[i].h - c[i].l;
        if (Number.isNaN(s[i]) || rng <= 0) continue;
        const ibs = (c[i].c - c[i].l) / rng;
        if (c[i].c > s[i] && ibs < 0.2) out.push({ i, dir: 'up' });
        else if (c[i].c < s[i] && ibs > 0.8) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'st200',
    name: 'Supertrend + EMA 200',
    source: 'Trading Rush: Supertrend tek başına ~%46 isabet, 1,5R ile kârlı',
    rule: 'Supertrend (10, 3) yükselişe döner ve fiyat EMA 200 üstünde → LONG (short tersi)',
    signals: (c) => flips(supertrend(H(c), L(c), C(c)), side(c, ema(C(c), 200))),
  },
  {
    id: 'ichimoku',
    name: 'Ichimoku bulut kırılımı',
    source: 'Trading Rush: ~%53 isabet, iyi ve kötü piyasada en iyi indikatörlerden',
    rule: 'Kapanış bulutun üstüne çıkar ve Tenkan > Kijun → LONG (short tersi)',
    signals: (c) => {
      const k = ichimoku(H(c), L(c));
      const out: BoxSignal[] = [];
      // Bugünkü bulut, 26 mum önce hesaplanan öncü açıklıklardır.
      const top = (i: number) => Math.max(k.spanA[i - 25], k.spanB[i - 25]);
      const bot = (i: number) => Math.min(k.spanA[i - 25], k.spanB[i - 25]);
      for (let i = 27; i < c.length; i++) {
        if (Number.isNaN(top(i)) || Number.isNaN(top(i - 1))) continue;
        if (c[i - 1].c <= top(i - 1) && c[i].c > top(i) && k.tenkan[i] > k.kijun[i]) out.push({ i, dir: 'up' });
        else if (c[i - 1].c >= bot(i - 1) && c[i].c < bot(i) && k.tenkan[i] < k.kijun[i]) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'squeeze',
    name: 'TTM Squeeze',
    source: 'John Carter / LazyBear; 50 ortalama trend filtresiyle belirgin iyileşme bildiriliyor',
    rule: 'Bollinger (20, 2) Keltner (20, 1,5) içinden çıkar (sıkışma biter), momentum ve fiyat SMA 50 yönünde → giriş',
    signals: (c) => {
      const cl = C(c);
      const { mom, sqz } = squeezeMomentum(H(c), L(c), cl);
      const s50 = sma(cl, 50);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        if (!sqz[i - 1] || sqz[i] || Number.isNaN(mom[i]) || Number.isNaN(s50[i])) continue;
        if (mom[i] > 0 && mom[i] > mom[i - 1] && cl[i] > s50[i]) out.push({ i, dir: 'up' });
        else if (mom[i] < 0 && mom[i] < mom[i - 1] && cl[i] < s50[i]) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'utbot',
    name: 'UT Bot + EMA 200',
    source: 'TradingView popüler; bir testte 3 ayda ~%60 kârlı işlem',
    rule: 'UT Bot (1, 10) al sinyali ve fiyat EMA 200 üstünde → LONG (short tersi)',
    signals: (c) => flips(utBot(C(c), H(c), L(c)).dir, side(c, ema(C(c), 200))),
  },
  {
    id: 'cezl',
    name: 'Chandelier Exit + ZLSMA',
    source: 'YouTube/TradingView scalping; iddia edilen %90+ isabet bağımsız testte doğrulanmadı',
    rule: 'Chandelier Exit (22, 3) yön değiştirir ve kapanış ZLSMA (32) sinyal yönünde → giriş',
    signals: (c) => flips(chandelier(H(c), L(c), C(c)).dir, side(c, zlsma(C(c), 32))),
  },
  {
    id: 'ema3srsi',
    name: 'EMA 8/21/55 + Stokastik RSI',
    source: 'YouTube popüler trend-scalping stratejisi',
    rule: 'EMA 8 > 21 > 55 ve Stokastik RSI %K, %D\'yi 20 altında yukarı keser → LONG (short tersi, 80 üstü)',
    signals: (c) => {
      const cl = C(c);
      const e8 = ema(cl, 8), e21 = ema(cl, 21), e55 = ema(cl, 55);
      const s = stochRsi(cl);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        const up = s.k[i - 1] <= s.d[i - 1] && s.k[i] > s.d[i] && s.k[i] < 20;
        const dn = s.k[i - 1] >= s.d[i - 1] && s.k[i] < s.d[i] && s.k[i] > 80;
        if (up && e8[i] > e21[i] && e21[i] > e55[i]) out.push({ i, dir: 'up' });
        else if (dn && e8[i] < e21[i] && e21[i] < e55[i]) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'sarmacd',
    name: 'Parabolic SAR + EMA 200 + MACD',
    source: 'Davidd Tech: %70 isabet iddiası',
    rule: 'SAR fiyatın altına geçer, fiyat EMA 200 üstünde ve MACD sinyal çizgisinin üstünde → LONG (short tersi)',
    signals: (c) => {
      const cl = C(c);
      const sar = psar(H(c), L(c));
      const e = ema(cl, 200);
      const m = macd(cl);
      const dir = sar.map((v, i) => (Number.isNaN(v) ? NaN : cl[i] > v ? 1 : -1));
      return flips(dir, (i, d) => side(c, e)(i, d) && (d === 'up' ? m.line[i] > m.signal[i] : m.line[i] < m.signal[i]));
    },
  },
  {
    id: 'donchian55',
    name: 'Donchian 55 + EMA 200',
    source: 'Turtle kırılımı; trend takibi (Moskowitz vd. 2012, Hurst vd. 2017 zaman serisi momentumu)',
    rule: 'Kapanış önceki 55 mumun zirvesini kırar ve fiyat EMA 200 üstünde → LONG (short tersi)',
    signals: (c) => {
      const hi = highest(H(c), 55);
      const lo = lowest(L(c), 55);
      const e = ema(C(c), 200);
      const out: BoxSignal[] = [];
      for (let i = 56; i < c.length; i++) {
        if (Number.isNaN(e[i]) || Number.isNaN(hi[i - 1])) continue;
        const up = c[i].c > hi[i - 1] && c[i - 1].c <= hi[i - 2];
        const dn = c[i].c < lo[i - 1] && c[i - 1].c >= lo[i - 2];
        if (up && c[i].c > e[i]) out.push({ i, dir: 'up' });
        else if (dn && c[i].c < e[i]) out.push({ i, dir: 'down' });
      }
      return out;
    },
  },
  {
    id: 'rsi2x',
    name: 'RSI(2) + SMA 5 çıkışı',
    source: 'Larry Connors RSI-2 (giriş RSI(2) < 10, çıkış kapanış > SMA 5)',
    rule: 'Fiyat SMA 200 üstünde ve RSI(2) 10 altına iner → LONG, kapanış SMA 5 üstüne çıkınca çıkış (short tersi, 90 üstü)',
    signals: (c) => {
      const r = rsi(C(c), 2);
      const s = sma(C(c), 200);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        if (Number.isNaN(s[i])) continue;
        if (c[i].c > s[i] && r[i] < 10 && r[i - 1] >= 10) out.push({ i, dir: 'up' });
        else if (c[i].c < s[i] && r[i] > 90 && r[i - 1] <= 90) out.push({ i, dir: 'down' });
      }
      return out;
    },
    exit: (c) => {
      const s5 = sma(C(c), 5);
      return (j, d) => (d === 'up' ? c[j].c > s5[j] : c[j].c < s5[j]);
    },
  },
  {
    id: 'emapull',
    name: 'EMA 50 geri çekilmesi + EMA 200',
    source: 'Trend içinde geri çekilme; kapanışa bağlı EMA 50 çıkışı (fitil stoplarına dayanıklı)',
    rule: 'Fiyat ve EMA 50, EMA 200 üstünde; mum EMA 50\'ye değip üstünde yeşil kapanır → LONG; kapanış EMA 50 altına inerse çıkış (short tersi)',
    signals: (c) => {
      const cl = C(c);
      const e50 = ema(cl, 50);
      const e200 = ema(cl, 200);
      const out: BoxSignal[] = [];
      for (let i = 1; i < c.length; i++) {
        if (Number.isNaN(e200[i])) continue;
        const x = c[i];
        if (e50[i] > e200[i] && x.c > e200[i] && x.l <= e50[i] && x.c > e50[i] && x.c > x.o) out.push({ i, dir: 'up' });
        else if (e50[i] < e200[i] && x.c < e200[i] && x.h >= e50[i] && x.c < e50[i] && x.c < x.o) out.push({ i, dir: 'down' });
      }
      return out;
    },
    exit: (c) => {
      const e50 = ema(C(c), 50);
      return (j, d) => (d === 'up' ? c[j].c < e50[j] : c[j].c > e50[j]);
    },
  },
];
