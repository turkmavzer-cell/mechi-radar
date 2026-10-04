// Kullanıcının tarif ettiği stratejiler (video ekran görüntülerinden): EMA 21/55 geri çekilmesi, Bollinger + Stokastik,
// Heikin Ashi Smoothed, üçgen formasyonları, EMA 20/50 + hacim + Heikin Ashi. Çıkış ayarları research/yeni-stratejiler.ts ile seçildi.
import type { BoxSignal, ExitRule, TargetLine } from './boxes';
import { adx, atr, bollinger, highest, lowest, macd, ema, heikinAshi, haSmoothed, pivots, qqeMod, rsi, sslHybridArrows, sma, stochOsc, stochRsi, supertrendKv, supertrendLine, twinRangeFilter } from './indicators';
import type { Candle, Direction } from './types';

const O = (c: Candle[]) => c.map((x) => x.o);
const H = (c: Candle[]) => c.map((x) => x.h);
const L = (c: Candle[]) => c.map((x) => x.l);
const C = (c: Candle[]) => c.map((x) => x.c);

export interface Ema2155Opts {
  /** Kesişimden sonra yalnızca ilk geri çekilme (aynı yönde ikinci sinyal yok; ters kesişim sıfırlar). */
  firstOnly?: boolean;
  /** Kopuş: kesişimden sonra, geri çekilmeden önce bir mumun dibi EMA 21'in en az bu kadar ATR üstünde olmalı (short tersi). */
  breakAtr?: number;
  /** Girişte EMA 21 ile EMA 55 arası en az bu kadar ATR olmalı. */
  gapAtr?: number;
  /** Ek şart (yardımcı indikatör); sağlanmazsa bu geri çekilme atlanır, kesişimin hakkı yanmaz. */
  filter?: (i: number, dir: Direction) => boolean;
}

/**
 * EMA 21/55 geri çekilmesi: EMA 21, EMA 55'i yukarı kestikten sonra (EMA 21 > EMA 55 sürerken) mumun dibi EMA 21'e değer,
 * kapanış EMA 21 üstünde ve mum yeşil → LONG. Short tersi. Kopuş ve ortalama arası mesafe şartları `opts` ile.
 */
export function ema2155Signals(c: Candle[], opts: Ema2155Opts = {}): BoxSignal[] {
  const { firstOnly = false, breakAtr = 0, gapAtr = 0, filter } = opts;
  const cl = C(c);
  const f = ema(cl, 21);
  const s = ema(cl, 55);
  const a = atr(H(c), L(c), cl, 14);
  const out: BoxSignal[] = [];
  let used = false;
  let broke = false; // kesişimden sonra kopuş oldu mu
  for (let i = 1; i < c.length; i++) {
    if (Number.isNaN(s[i - 1]) || Number.isNaN(a[i])) continue;
    if (Math.sign(f[i] - s[i]) !== Math.sign(f[i - 1] - s[i - 1])) {
      used = false; // yeni kesişim
      broke = false;
    }
    const x = c[i];
    const upTrend = f[i] > s[i];
    const up = upTrend && x.l <= f[i] && x.c > f[i] && x.c > x.o && x.c > s[i];
    const dn = !upTrend && x.h >= f[i] && x.c < f[i] && x.c < x.o && x.c < s[i];
    const ok = (up || dn) && !(firstOnly && used) && (breakAtr <= 0 || broke) && Math.abs(f[i] - s[i]) >= gapAtr * a[i] && (!filter || filter(i, up ? 'up' : 'down'));
    if (ok) {
      out.push({ i, dir: up ? 'up' : 'down' });
      used = true;
    }
    // Kopuş bu mumdan sonra geçerli olur (aynı mumda hem kopuş hem geri çekilme olmaz).
    if (upTrend ? x.l - f[i] >= breakAtr * a[i] : f[i] - x.h >= breakAtr * a[i]) broke = true;
  }
  return out;
}

/**
 * Bollinger (20, 2) + Stokastik (14, 1, 3): son `touch` mum içinde üst banda değildi ve Stokastik %K (mavi) %D'yi (turuncu)
 * aşağı keser → SHORT; alt bant + yukarı kesişim → LONG. Bant genişliği son 100 mumun ortalamasının `minWidth` katından
 * darsa sinyal yok. Hedef: karşı bant (`bbTarget`).
 */
export function bbStochSignals(c: Candle[], minWidth = 0.8, touch = 2): BoxSignal[] {
  const bb = bollinger(C(c), 20, 2);
  const st = stochOsc(H(c), L(c), C(c), 14, 1, 3);
  const width = bb.mid.map((m, i) => (bb.upper[i] - bb.lower[i]) / m);
  const avgW = sma(width.map((w) => (Number.isNaN(w) ? 0 : w)), 100);
  const out: BoxSignal[] = [];
  for (let i = 120; i < c.length; i++) {
    if (Number.isNaN(width[i]) || Number.isNaN(st.d[i - 1]) || width[i] < minWidth * avgW[i]) continue;
    let top = false;
    let bot = false;
    for (let j = Math.max(0, i - touch + 1); j <= i; j++) {
      if (c[j].h >= bb.upper[j]) top = true;
      if (c[j].l <= bb.lower[j]) bot = true;
    }
    const down = st.k[i - 1] >= st.d[i - 1] && st.k[i] < st.d[i];
    const up = st.k[i - 1] <= st.d[i - 1] && st.k[i] > st.d[i];
    if (top && down) out.push({ i, dir: 'down' });
    else if (bot && up) out.push({ i, dir: 'up' });
  }
  return out;
}

/** Bollinger karşı bandı: LONG'da üst bant, SHORT'ta alt bant. */
export function bbTarget(c: Candle[]): TargetLine {
  const bb = bollinger(C(c), 20, 2);
  return (j, d) => (d === 'up' ? bb.upper[j] : bb.lower[j]);
}

/**
 * Heikin Ashi Smoothed (10, 10) renk değişimi: yeşile döner → LONG, kırmızıya → SHORT.
 * `minAdx`: yalnızca ADX(14) bu değerin üstündeyken (trend varken) giriş; yatay piyasada renk dönüşü yalnızca işlemi kapatır.
 */
export function haSmoothedSignals(c: Candle[], minAdx?: number): BoxSignal[] {
  const { dir } = haSmoothed(O(c), H(c), L(c), C(c));
  const a = minAdx != null ? adx(H(c), L(c), C(c), 14).adx : null;
  const out: BoxSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (Number.isNaN(dir[i - 1]) || dir[i] === dir[i - 1]) continue;
    if (a && !(a[i] >= minAdx!)) continue;
    out.push({ i, dir: dir[i] === 1 ? 'up' : 'down' });
  }
  return out;
}

/** Heikin Ashi Smoothed ters renge dönünce çıkış. */
export function haSmoothedExit(c: Candle[]): ExitRule {
  const { dir } = haSmoothed(O(c), H(c), L(c), C(c));
  return (j, d) => (d === 'up' ? dir[j] === -1 : dir[j] === 1);
}

export type TriangleKind = 'asc' | 'desc' | 'sym';
export interface TriangleSignal extends BoxSignal {
  kind: TriangleKind;
  /** Formasyon çizgilerinin tanımlandığı tepe/dip noktaları (grafikte çizmek için). */
  upper: [number, number, number, number];
  lower: [number, number, number, number];
}

/**
 * Üçgen formasyonları (tepe/dip noktaları, iki yanda 5 mum):
 * son iki tepe ve son iki dip (son `window` mum içinde) direnç ve destek çizgilerini verir.
 * Yatay: çizginin 20 mumdaki değişimi 0,5 ATR'den az. Yükselen üçgen: yatay direnç + yükselen destek → yukarı kırılımda LONG.
 * Alçalan üçgen: düşen direnç + yatay destek → aşağı kırılımda SHORT. Simetrik: düşen direnç + yükselen destek → iki yöne de.
 * Kırılım: kapanış çizginin ötesine geçer (önceki kapanış içerideydi). `measured`: hedef = formasyonun en geniş yeri.
 */
export function triangleSignals(c: Candle[], measured = false, span = 5, window = 80): TriangleSignal[] {
  const h = H(c);
  const l = L(c);
  const a = atr(h, l, C(c), 14);
  const pv = pivots(h, l, span);
  const out: TriangleSignal[] = [];
  let hiN = 0;
  let loN = 0;
  for (let i = 1; i < c.length; i++) {
    while (hiN < pv.hi.length && pv.hi[hiN].at <= i) hiN++;
    while (loN < pv.lo.length && pv.lo[loN].at <= i) loN++;
    if (hiN < 2 || loN < 2 || Number.isNaN(a[i])) continue;
    const [h1, h2] = [pv.hi[hiN - 2], pv.hi[hiN - 1]];
    const [l1, l2] = [pv.lo[loN - 2], pv.lo[loN - 1]];
    if (i - Math.min(h1.k, l1.k) > window) continue;
    const sH = (h2.v - h1.v) / (h2.k - h1.k);
    const sL = (l2.v - l1.v) / (l2.k - l1.k);
    const flat = 0.025 * a[i];
    const flatH = Math.abs(sH) < flat;
    const flatL = Math.abs(sL) < flat;
    let kind: TriangleKind | null = null;
    if (flatH && sL >= flat) kind = 'asc';
    else if (sH <= -flat && flatL) kind = 'desc';
    else if (sH <= -flat && sL >= flat) kind = 'sym';
    if (!kind) continue;
    const up = (k: number) => h2.v + sH * (k - h2.k);
    const lo = (k: number) => l2.v + sL * (k - l2.k);
    if (up(i) <= lo(i)) continue; // çizgiler kesişmiş: formasyon bitmiş
    const start = Math.min(h1.k, l1.k);
    const height = up(start) - lo(start);
    let dir: Direction | null = null;
    if (kind !== 'desc' && c[i].c > up(i) && c[i - 1].c <= up(i - 1)) dir = 'up';
    else if (kind !== 'asc' && c[i].c < lo(i) && c[i - 1].c >= lo(i - 1)) dir = 'down';
    if (!dir) continue;
    const sig: TriangleSignal = {
      i,
      dir,
      kind,
      upper: [start, up(start), i, up(i)],
      lower: [start, lo(start), i, lo(i)],
    };
    sig.lines = [sig.upper, sig.lower];
    if (measured) sig.target = c[i].c + (dir === 'up' ? height : -height);
    out.push(sig);
  }
  return out;
}

/**
 * EMA 20/50 + hacim + Heikin Ashi: EMA 20 > EMA 50 iken geri çekilme (son 6 mumda dip EMA 20'ye değdi) ve geri çekilmedeki
 * kırmızı Heikin Ashi mumlarından birinde hacim 20 mum ortalamasının `volMult` katını aştı; ardından Heikin Ashi yeşile
 * döner → LONG. Short tersi. Hacim verisi yoksa (FX) hacim şartı aranmaz. `rsiFilter`: RSI(14) 50'nin sinyal tarafında.
 */
export function emaVolHaSignals(c: Candle[], volMult = 1.2, rsiFilter = false): BoxSignal[] {
  const cl = C(c);
  const e20 = ema(cl, 20);
  const e50 = ema(cl, 50);
  const ha = heikinAshi(O(c), H(c), L(c), cl);
  const green = (i: number) => ha.c[i] > ha.o[i];
  const vol = c.map((x) => x.v ?? 0);
  const hasVol = vol.filter((v) => v > 0).length > 0.8 * c.length;
  const vAvg = sma(vol, 20);
  const r = rsi(cl, 14);
  const out: BoxSignal[] = [];
  for (let i = 7; i < c.length; i++) {
    if (Number.isNaN(e50[i])) continue;
    const upTrend = e20[i] > e50[i];
    if (upTrend ? !(green(i) && !green(i - 1)) : !(!green(i) && green(i - 1))) continue;
    let touched = false;
    let volOk = !hasVol;
    // Geri çekilme: sinyalden önceki ters renkli Heikin Ashi dizisi (en fazla 6 mum).
    for (let j = i - 1; j >= i - 6 && (upTrend ? !green(j) : green(j)); j--) {
      if (upTrend ? c[j].l <= e20[j] : c[j].h >= e20[j]) touched = true;
      if (hasVol && vol[j] > volMult * vAvg[j - 1]) volOk = true;
    }
    if (!touched || !volOk) continue;
    if (upTrend ? cl[i] < e50[i] : cl[i] > e50[i]) continue;
    if (rsiFilter && (upTrend ? r[i] <= 50 : r[i] >= 50)) continue;
    out.push({ i, dir: upTrend ? 'up' : 'down' });
  }
  return out;
}

/** EMA 20 çıkışı: 'touch' mum EMA 20'ye değip kapanınca, 'close' kapanış EMA 20'nin ötesine geçince. */
export function ema20Exit(c: Candle[], mode: 'touch' | 'close' = 'touch'): ExitRule {
  const e20 = ema(C(c), 20);
  return (j, d) => {
    const x = c[j];
    if (mode === 'close') return d === 'up' ? x.c < e20[j] : x.c > e20[j];
    return d === 'up' ? x.l <= e20[j] : x.h >= e20[j];
  };
}

/**
 * RSI + MACD: RSI(14) 50'yi yukarı keser ve MACD çizgisi (mavi) 0'ın üstünde (aynı mumda yukarı kesmiş olabilir) → LONG; tersi SHORT.
 * `either`: MACD çizgisi 0'ı yukarı keserken RSI zaten 50 üstündeyse de LONG (ikisinden hangisi son keserse).
 */
export function rsiMacdSignals(c: Candle[], either = false): BoxSignal[] {
  const cl = C(c);
  const r = rsi(cl, 14);
  const m = macd(cl).line;
  const out: BoxSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if ([r[i - 1], r[i], m[i - 1], m[i]].some(Number.isNaN)) continue;
    const rUp = r[i - 1] <= 50 && r[i] > 50;
    const rDn = r[i - 1] >= 50 && r[i] < 50;
    const mUp = m[i - 1] <= 0 && m[i] > 0;
    const mDn = m[i - 1] >= 0 && m[i] < 0;
    if ((rUp && m[i] > 0) || (either && mUp && r[i] > 50)) out.push({ i, dir: 'up' });
    else if ((rDn && m[i] < 0) || (either && mDn && r[i] < 50)) out.push({ i, dir: 'down' });
  }
  return out;
}

/** RSI 50'nin ters tarafına geçince çıkış. */
export function rsiMacdExit(c: Candle[]): ExitRule {
  const r = rsi(C(c), 14);
  return (j, d) => (d === 'up' ? r[j] < 50 : r[j] > 50);
}

/**
 * RSI üst/alt çizgide çıkış: LONG'da RSI(14) `upper` (ör. 70) üstüne çıkınca, SHORT'ta 100 − `upper` (ör. 30) altına inince.
 * `mid`: ayrıca RSI 50'nin ters tarafına geçerse de çık.
 */
export function rsiLevelExit(c: Candle[], upper = 70, mid = false): ExitRule {
  const r = rsi(C(c), 14);
  const lower = 100 - upper;
  return (j, d) => (d === 'up' ? r[j] >= upper || (mid && r[j] < 50) : r[j] <= lower || (mid && r[j] > 50));
}

export interface Ema2155BreakOpts {
  /** Kesişim başına tek işlem. */
  firstOnly?: boolean;
  /** Stop dibin bu kadar ATR altında. */
  bufferAtr?: number;
  /** Stop mesafesi en az bu kadar ATR (çok yakın stoplarda maliyet R'yi yer). */
  minStopAtr?: number;
  /**
   * Tanımlıysa kesişim mumu da sayılır ve kırılacak seviye kesişimden önceki bu kadar mumun tepesinden (short'ta dibinden)
   * başlar: kesişim sırasında EMA'lara değen fiyat, kesişim öncesi dibin altında kapanınca SHORT (kullanıcı tarifi, 2. anlatım).
   */
  refBars?: number;
  /** Tanımlıysa kesişimden bu kadar mum sonra fiyat EMA 55'e değerse o kesişimde işlem açılmaz. */
  no55After?: number;
}

/**
 * EMA 21/55 kırılım: EMA 21 > EMA 55 iken fiyat yükselip bir tepe yapar, sonra geri çekilip EMA 21'e değer; ardından bir mum
 * geri çekilme öncesindeki tepenin üstünde (ve EMA 21 üstünde) kapanırsa → LONG. Stop geri çekilmenin dibinin altında.
 * Kapanış EMA 55 altına inerse geri çekilme iptal (yeni bacak aranır). Short tersi.
 */
export function ema2155BreakSignals(c: Candle[], opts: Ema2155BreakOpts = {}): BoxSignal[] {
  const { firstOnly = true, bufferAtr = 0.1, minStopAtr = 0.5, refBars, no55After } = opts;
  const cl = C(c);
  const f = ema(cl, 21);
  const s = ema(cl, 55);
  const a = atr(H(c), L(c), cl, 14);
  const out: BoxSignal[] = [];
  let used = false;
  let phase: 'rise' | 'pullback' = 'rise';
  let peak = NaN; // bu bacağın tepesi (short'ta dibi)
  let ref = NaN; // geri çekilme öncesi tepe
  let pb = NaN; // geri çekilmenin dibi (short'ta tepesi)
  let crossI = -1;
  let dead = false; // EMA 55'e değildi: bu kesişimde işlem yok
  for (let i = 1; i < c.length; i++) {
    if (Number.isNaN(s[i - 1]) || Number.isNaN(a[i])) continue;
    const x = c[i];
    const up = f[i] > s[i];
    const sg = up ? 1 : -1;
    const hi = up ? x.h : -x.l; // yön bağımsız: "yukarı" = sinyal yönü
    const lo = up ? x.l : -x.h;
    const close = sg * x.c;
    const ema21 = sg * f[i];
    const ema55 = sg * s[i];
    if (Math.sign(f[i] - s[i]) !== Math.sign(f[i - 1] - s[i - 1])) {
      used = false; // yeni kesişim
      dead = false;
      crossI = i;
      phase = 'rise';
      peak = hi;
      if (refBars == null) continue;
      for (let j = Math.max(0, i - refBars); j < i; j++) peak = Math.max(peak, up ? c[j].h : -c[j].l);
    }
    if (no55After != null && crossI >= 0 && i - crossI > no55After && lo <= ema55) dead = true;
    if (dead) continue;
    if (Number.isNaN(peak)) peak = hi;
    if (phase === 'rise') {
      if (lo <= ema21) {
        phase = 'pullback';
        ref = peak;
        pb = lo;
      } else {
        peak = Math.max(peak, hi);
        continue;
      }
    } else pb = Math.min(pb, lo);
    // Geri çekilmede: EMA 55'in altında kapanış iptal eder.
    if (close < ema55) {
      phase = 'rise';
      peak = hi;
      continue;
    }
    if (close > ref && close > ema21) {
      if (!(firstOnly && used)) {
        const stopDist = Math.max(close - (pb - bufferAtr * a[i]), minStopAtr * a[i]);
        out.push({ i, dir: up ? 'up' : 'down', stop: x.c - sg * stopDist });
        used = true;
      }
      phase = 'rise';
      peak = hi;
    }
  }
  return out;
}

/** EMA 21 kapanış çıkışı: kapanış EMA 21'in ters tarafında; `minR` > 0 ise ancak işlem en az o kadar R kâr görmüşse. */
export function ema21CloseExit(c: Candle[], minR = 0): ExitRule {
  const f = ema(C(c), 21);
  return (j, d, ctx) => ctx.bestR >= minR && (d === 'up' ? c[j].c < f[j] : c[j].c > f[j]);
}

/** EMA 55 çizgisi (çıkış çizgisi olarak). */
export function ema55Line(c: Candle[]): TargetLine {
  const e = ema(C(c), 55);
  return (j) => e[j];
}

/**
 * EMA 5/8/13 + MACD: MACD çizgisi 0'ı yukarı keser ve en fazla `win` mum içinde (önce ya da sonra) EMA 5 > 8 > 13 sıralanıp üçü de
 * yükselir → ikisi birlikte sağlandığı mumda LONG (MACD hâlâ 0 üstünde, sıralama sürüyor). Stop: önceki dip (tepe/dip noktası,
 * iki yanda `span` mum) altında, en az `minStopAtr` ATR. Short tersi. MACD kesişimi başına tek sinyal.
 */
export function ema5813MacdSignals(c: Candle[], win = 5, span = 3, minStopAtr = 0.5, bufferAtr = 0.1): BoxSignal[] {
  const cl = C(c);
  const e5 = ema(cl, 5), e8 = ema(cl, 8), e13 = ema(cl, 13);
  const m = macd(cl).line;
  const a = atr(H(c), L(c), cl, 14);
  const pv = pivots(H(c), L(c), span);
  const aligned = (i: number, up: boolean) =>
    i > 0 &&
    (up
      ? e5[i] > e8[i] && e8[i] > e13[i] && e5[i] > e5[i - 1] && e8[i] > e8[i - 1] && e13[i] > e13[i - 1]
      : e5[i] < e8[i] && e8[i] < e13[i] && e5[i] < e5[i - 1] && e8[i] < e8[i - 1] && e13[i] < e13[i - 1]);
  const out: BoxSignal[] = [];
  let crossUp = -1e9, crossDn = -1e9, alignUp = -1e9, alignDn = -1e9, usedUp = -1, usedDn = -1;
  let loN = 0, hiN = 0;
  for (let i = 2; i < c.length; i++) {
    while (loN < pv.lo.length && pv.lo[loN].at <= i) loN++;
    while (hiN < pv.hi.length && pv.hi[hiN].at <= i) hiN++;
    if (Number.isNaN(m[i - 1]) || Number.isNaN(e13[i - 1]) || Number.isNaN(a[i])) continue;
    if (m[i - 1] <= 0 && m[i] > 0) crossUp = i;
    if (m[i - 1] >= 0 && m[i] < 0) crossDn = i;
    if (aligned(i, true) && !aligned(i - 1, true)) alignUp = i;
    if (aligned(i, false) && !aligned(i - 1, false)) alignDn = i;
    for (const up of [true, false]) {
      const cross = up ? crossUp : crossDn;
      const al = up ? alignUp : alignDn;
      if ((up ? usedUp : usedDn) === cross || Math.abs(cross - al) > win || Math.max(cross, al) !== i) continue;
      if (up ? !(m[i] > 0 && aligned(i, true)) : !(m[i] < 0 && aligned(i, false))) continue;
      const piv = up ? pv.lo.slice(0, loN).at(-1) : pv.hi.slice(0, hiN).at(-1);
      const ext = piv ? piv.v : up ? Math.min(...c.slice(Math.max(0, i - 10), i + 1).map((x) => x.l)) : Math.max(...c.slice(Math.max(0, i - 10), i + 1).map((x) => x.h));
      const dist = Math.max(up ? c[i].c - (ext - bufferAtr * a[i]) : ext + bufferAtr * a[i] - c[i].c, minStopAtr * a[i]);
      out.push({ i, dir: up ? 'up' : 'down', stop: up ? c[i].c - dist : c[i].c + dist });
      if (up) usedUp = cross;
      else usedDn = cross;
    }
  }
  return out;
}

/** EMA 5, EMA 13'ü ters yöne kesince çıkış. */
export function ema5x13Exit(c: Candle[]): ExitRule {
  const cl = C(c);
  const e5 = ema(cl, 5), e13 = ema(cl, 13);
  return (j, d) => (d === 'up' ? e5[j] < e13[j] : e5[j] > e13[j]);
}

export interface TwinStOpts {
  /** "Long" etiketinden sonra Supertrend "Buy" en geç kaç mum içinde gelmeli. */
  win?: number;
  /** Bir Supertrend yükseliş bacağında en fazla kaç LONG (ilk dönüş dahil). */
  maxPerLeg?: number;
  /** LONG'da da Stokastik RSI doygunluğu (son 10 mumda en az 3 mum 98 üstü) aransın mı (SHORT'ta her zaman aranır). */
  stochLong?: boolean;
  /** Stop: son bu kadar mumun dibi (short'ta tepesi). */
  lookback?: number;
}

/**
 * Twin Range Filter (12/1, 4/2) + Supertrend (10, 4, hl2) + Stokastik RSI (3, 3, 8, 10) — YouTube'dan (Gemini özeti).
 * LONG: (a) Supertrend kırmızıyken Twin Range "Long" verir, en geç `win` mum içinde Supertrend "Buy"a (yeşile) döner → dönüş mumunda;
 * (b) Supertrend yeşilken düzeltme sonrası yeni Twin Range "Long" → o mumda (bacak başına en fazla `maxPerLeg`).
 * SHORT: Supertrend kırmızıyken Twin Range "Short" ve son 10 mumda Stokastik RSI en az 3 mum 98 üstünde (sert yükseliş sonrası).
 * Stop: son `lookback` mumun dibi/tepesi (0,1 ATR payla, en az 0,5 ATR).
 */
export function twinStSignals(c: Candle[], opts: TwinStOpts = {}): BoxSignal[] {
  const { win = 10, maxPerLeg = 2, stochLong = false, lookback = 20 } = opts;
  const cl = C(c), h = H(c), l = L(c);
  const trf = twinRangeFilter(cl, 12, 1, 4, 2).signal;
  const st = supertrendLine(h, l, cl, 10, 4).dir;
  const sk = stochRsi(cl, 8, 10, 3, 3).k;
  const a = atr(h, l, cl, 14);
  const lo = lowest(l, lookback), hi = highest(h, lookback);
  const hot = (i: number) => {
    let k = 0;
    for (let j = Math.max(0, i - 9); j <= i; j++) if (sk[j] >= 98) k++;
    return k >= 3;
  };
  const out: BoxSignal[] = [];
  let lastLong = -1e9;
  let legLongs = 0;
  for (let i = 1; i < c.length; i++) {
    if (Number.isNaN(st[i - 1]) || Number.isNaN(a[i]) || Number.isNaN(lo[i])) continue;
    if (trf[i] === 1) lastLong = i;
    const flipUp = st[i - 1] === -1 && st[i] === 1;
    if (flipUp) legLongs = 0;
    const push = (dir: Direction) => {
      const ext = dir === 'up' ? lo[i] - 0.1 * a[i] : hi[i] + 0.1 * a[i];
      const dist = Math.max(dir === 'up' ? cl[i] - ext : ext - cl[i], 0.5 * a[i]);
      out.push({ i, dir, stop: dir === 'up' ? cl[i] - dist : cl[i] + dist });
    };
    if (st[i] === 1 && legLongs < maxPerLeg && (!stochLong || hot(i))) {
      const dip = flipUp && i - lastLong <= win;
      const inTrend = !flipUp && trf[i] === 1;
      if (dip || inTrend) {
        push('up');
        legLongs++;
      }
    }
    if (st[i] === -1 && trf[i] === -1 && hot(i)) push('down');
  }
  return out;
}

/** Supertrend (10, 4) çizgisi: çıkış çizgisi olarak (fiyat çizgiye değince çıkış). */
export function supertrendExitLine(c: Candle[]): TargetLine {
  const s = supertrendLine(H(c), L(c), C(c), 10, 4);
  return (j, d) => (s.dir[j] === (d === 'up' ? 1 : -1) ? s.line[j] : d === 'up' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
}

/**
 * Twin Range Filter (12/1, 4/2) + Supertrend (Kıvanç, 10, 4, hl2) — kullanıcı tarifi.
 * Supertrend yeşilken her TRF "Long" → LONG; Supertrend yeşile döndüğü mumda TRF'nin son sinyali "Long" ise o mumda da LONG.
 * Stop: Supertrend çizgisi (girişteki seviye; sonra `stExitLine` ile her mum takip). Kırmızıda tersi (SHORT).
 * Kâr al: TRF ters sinyali (`trfExit`).
 */
export interface TrfStOpts {
  /** Girişte ADX(14) en az bu değer (yatay piyasayı eler). */
  minAdx?: number;
  /** Aynı Supertrend bölgesindeki tekrar girişte kapanış, önceki girişten beri görülen en iyi fiyatın ötesinde olmalı (trend sürüyor). */
  newExtreme?: boolean;
}

export function trfStSignals(c: Candle[], opts: TrfStOpts = {}): BoxSignal[] {
  const cl = C(c);
  const trf = twinRangeFilter(cl, 12, 1, 4, 2).signal;
  const st = supertrendKv(H(c), L(c), cl, 10, 4);
  const ax = opts.minAdx != null ? adx(H(c), L(c), cl, 14).adx : null;
  const out: BoxSignal[] = [];
  let state = 0; // TRF'nin son sinyali
  let zoneEntry = false; // bu Supertrend bölgesinde giriş oldu mu
  let ext = NaN; // son girişten beri görülen en iyi fiyat (LONG'da en yüksek, SHORT'ta en düşük)
  for (let i = 1; i < c.length; i++) {
    if (trf[i] !== 0) state = trf[i];
    const d = st.dir[i];
    if (Number.isNaN(st.dir[i - 1]) || Number.isNaN(d)) continue;
    const flip = d !== st.dir[i - 1];
    if (flip) {
      zoneEntry = false;
      ext = NaN;
    }
    const up = d === 1;
    const want = trf[i] === d || (flip && state === d);
    let ok = want && (up ? st.line[i] < cl[i] : st.line[i] > cl[i]);
    if (ok && ax && !(ax[i] >= opts.minAdx!)) ok = false;
    if (ok && opts.newExtreme && zoneEntry && !(up ? cl[i] > ext : cl[i] < ext)) ok = false;
    if (ok) {
      out.push({ i, dir: up ? 'up' : 'down', stop: st.line[i] });
      zoneEntry = true;
      ext = cl[i];
    }
    if (zoneEntry) ext = up ? Math.max(ext, c[i].h) : Math.min(ext, c[i].l);
  }
  return out;
}

/** TRF ters sinyali (LONG'da "Short", SHORT'ta "Long") gelince mum kapanışında kâr al; `minR`: ancak işlem en az o kadar R kâr gördüyse. */
export function trfExit(c: Candle[], minR = -Infinity): ExitRule {
  const trf = twinRangeFilter(C(c), 12, 1, 4, 2).signal;
  return (j, d, ctx) => trf[j] === (d === 'up' ? -1 : 1) && ctx.bestR >= minR;
}

/**
 * ATR kâr al: fiyat girişten en az `x` × ATR (girişteki) kâr yönünde gittikten sonra ilk ters mumda (LONG'da kırmızı, SHORT'ta
 * yeşil kapanış) kâr al. TRF ters sinyali de kâr aldırır.
 */
export function trfAtrExit(c: Candle[], x: number): ExitRule {
  const a = atr(H(c), L(c), C(c), 14);
  const trf = trfExit(c);
  return (j, d, ctx) => {
    const reached = (d === 'up' ? ctx.best - ctx.entry : ctx.entry - ctx.best) >= x * a[ctx.i];
    const against = d === 'up' ? c[j].c < c[j].o : c[j].c > c[j].o;
    return (reached && against) || trf(j, d, ctx);
  };
}

/** Supertrend (Kıvanç, 10, 4) çizgisi takip stopu: fiyat bir önceki mumdaki çizgiye değince çıkış; yön dönmüşse açılışta. */
export function stKvExitLine(c: Candle[]): TargetLine {
  const s = supertrendKv(H(c), L(c), C(c), 10, 4);
  return (j, d) => (s.dir[j] === (d === 'up' ? 1 : -1) ? s.line[j] : d === 'up' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
}

/** EMA kesişimi (sürekli pozisyon): hızlı EMA yavaşı yukarı keserse LONG, aşağı keserse SHORT; kapanışta. */
export function emaCrossSignals(c: Candle[], fast = 21, slow = 55): BoxSignal[] {
  const cl = C(c);
  const f = ema(cl, fast), s = ema(cl, slow);
  const out: BoxSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (Number.isNaN(s[i - 1])) continue;
    if (f[i - 1] <= s[i - 1] && f[i] > s[i]) out.push({ i, dir: 'up' });
    else if (f[i - 1] >= s[i - 1] && f[i] < s[i]) out.push({ i, dir: 'down' });
  }
  return out;
}

/** Ters kesişimde çıkış (aynı kapanışta ters yönde yeni işlem açılır). */
export function emaCrossExit(c: Candle[], fast = 21, slow = 55): ExitRule {
  const cl = C(c);
  const f = ema(cl, fast), s = ema(cl, slow);
  return (j, d) => (d === 'up' ? f[j] < s[j] : f[j] > s[j]);
}

/** QQE MOD + SSL Hybrid: QQE MOD yeşilken SSL Hybrid yukarı ok → LONG; kırmızıyken aşağı ok → SHORT (mum kapanışında). */
export function qqeSslSignals(c: Candle[]): BoxSignal[] {
  const q = qqeMod(C(c));
  const s = sslHybridArrows(H(c), L(c), C(c));
  const out: BoxSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (q[i] === 1 && s[i] === 1) out.push({ i, dir: 'up' });
    else if (q[i] === -1 && s[i] === -1) out.push({ i, dir: 'down' });
  }
  return out;
}
