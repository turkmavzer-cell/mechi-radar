// Kullanıcının tarif ettiği stratejiler (video ekran görüntülerinden): EMA 21/55 geri çekilmesi, Bollinger + Stokastik,
// Heikin Ashi Smoothed, üçgen formasyonları, EMA 20/50 + hacim + Heikin Ashi. Çıkış ayarları research/yeni-stratejiler.ts ile seçildi.
import type { BoxSignal, ExitRule, TargetLine } from './boxes';
import { adx, atr, bollinger, ema, heikinAshi, haSmoothed, pivots, rsi, sma, stochOsc } from './indicators';
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
