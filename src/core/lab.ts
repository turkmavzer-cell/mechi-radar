// Strateji laboratuvarı: aday stratejiler ve geçmiş veride isabet ölçümü.
// Tüm sinyaller yalnızca o ana kadar kapanmış mumları kullanır (geleceğe bakma yok).
import { atr, ema, macd, rma, rsi, sma } from './indicators';
import { bbReversion, pivots, rsiDivergence, stochastic, type LabSignal, type Pivot } from './extra';
import { analyze } from './strategies';
import type { Candle, Direction, Strategy, Timeframe } from './types';

export type { LabSignal } from './extra';

export type Family = 'trend' | 'momentum' | 'reversion' | 'candle' | 'pattern';

export interface LabStrategy {
  id: string;
  name: string;
  family: Family;
  /** Kısa kural açıklaması (rapor ve uygulama için). */
  rule: string;
  run: (c: Candle[]) => LabSignal[];
}

const closes = (c: Candle[]) => c.map((x) => x.c);
const highs = (c: Candle[]) => c.map((x) => x.h);
const lows = (c: Candle[]) => c.map((x) => x.l);
const ok = (...v: number[]) => v.every((x) => Number.isFinite(x));

/** Yön sırayla değişsin: aynı yönde art arda sinyal atılır. */
function alternate(sigs: LabSignal[]): LabSignal[] {
  const out: LabSignal[] = [];
  for (const s of sigs) if (!out.length || out[out.length - 1].dir !== s.dir) out.push(s);
  return out;
}

/** Aynı yönde sinyaller arasında en az `gap` mum olsun. */
function spaced(sigs: LabSignal[], gap: number): LabSignal[] {
  const last: Record<Direction, number> = { up: -Infinity, down: -Infinity };
  const out: LabSignal[] = [];
  for (const s of sigs) {
    if (s.i - last[s.dir] >= gap) out.push(s);
    last[s.dir] = s.i;
  }
  return out;
}

function fromCore(strategy: Strategy): (c: Candle[]) => LabSignal[] {
  return (c) => {
    const idx = new Map(c.map((x, i) => [x.t, i]));
    return analyze('LAB', '1h' as Timeframe, c)
      .events.filter((e) => e.strategy === strategy)
      .map((e) => ({ i: idx.get(e.time)!, dir: e.dir }));
  };
}

// ---------------- Adaylar ----------------

const emaCross = (f: number, s: number): LabStrategy['run'] => (c) => {
  const a = ema(closes(c), f);
  const b = ema(closes(c), s);
  const out: LabSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (!ok(a[i - 1], b[i - 1])) continue;
    if (a[i - 1] <= b[i - 1] && a[i] > b[i]) out.push({ i, dir: 'up' });
    else if (a[i - 1] >= b[i - 1] && a[i] < b[i]) out.push({ i, dir: 'down' });
  }
  return out;
};

const macdSignal: LabStrategy['run'] = (c) => {
  const m = macd(closes(c));
  const out: LabSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (!ok(m.line[i - 1], m.signal[i - 1])) continue;
    if (m.line[i - 1] <= m.signal[i - 1] && m.line[i] > m.signal[i]) out.push({ i, dir: 'up' });
    else if (m.line[i - 1] >= m.signal[i - 1] && m.line[i] < m.signal[i]) out.push({ i, dir: 'down' });
  }
  return out;
};

/** Ichimoku: Tenkan/Kijun kesişimi, fiyat bulutun doğru tarafındayken. */
const ichimoku: LabStrategy['run'] = (c) => {
  const mid = (i: number, n: number) => {
    let h = -Infinity;
    let l = Infinity;
    for (let j = i - n + 1; j <= i; j++) {
      h = Math.max(h, c[j].h);
      l = Math.min(l, c[j].l);
    }
    return (h + l) / 2;
  };
  const out: LabSignal[] = [];
  const tk = new Array<number>(c.length).fill(NaN);
  const kj = new Array<number>(c.length).fill(NaN);
  for (let i = 51; i < c.length; i++) {
    tk[i] = mid(i, 9);
    kj[i] = mid(i, 26);
  }
  for (let i = 80; i < c.length; i++) {
    // Bugünkü bulut, 26 mum önce hesaplanan Senkou A/B'dir.
    const p = i - 26;
    const spanA = (mid(p, 9) + mid(p, 26)) / 2;
    const spanB = mid(p, 52);
    const top = Math.max(spanA, spanB);
    const bot = Math.min(spanA, spanB);
    if (tk[i - 1] <= kj[i - 1] && tk[i] > kj[i] && c[i].c > top) out.push({ i, dir: 'up' });
    else if (tk[i - 1] >= kj[i - 1] && tk[i] < kj[i] && c[i].c < bot) out.push({ i, dir: 'down' });
  }
  return out;
};

/** Parabolic SAR (0.02, 0.2) yön değişimi. */
const psar: LabStrategy['run'] = (c) => {
  if (c.length < 3) return [];
  const out: LabSignal[] = [];
  let up = c[1].c > c[0].c;
  let sar = up ? c[0].l : c[0].h;
  let ep = up ? c[1].h : c[1].l;
  let af = 0.02;
  for (let i = 2; i < c.length; i++) {
    sar = sar + af * (ep - sar);
    if (up) {
      sar = Math.min(sar, c[i - 1].l, c[i - 2].l);
      if (c[i].l < sar) {
        up = false;
        sar = ep;
        ep = c[i].l;
        af = 0.02;
        out.push({ i, dir: 'down' });
      } else if (c[i].h > ep) {
        ep = c[i].h;
        af = Math.min(af + 0.02, 0.2);
      }
    } else {
      sar = Math.max(sar, c[i - 1].h, c[i - 2].h);
      if (c[i].h > sar) {
        up = true;
        sar = ep;
        ep = c[i].h;
        af = 0.02;
        out.push({ i, dir: 'up' });
      } else if (c[i].l < ep) {
        ep = c[i].l;
        af = Math.min(af + 0.02, 0.2);
      }
    }
  }
  return out;
};

/** ADX/DMI: +DI ile -DI kesişimi, ADX(14) > 25 iken. */
const adxDmi: LabStrategy['run'] = (c) => {
  const n = 14;
  const plus: number[] = [0];
  const minus: number[] = [0];
  const tr: number[] = [c[0] ? c[0].h - c[0].l : 0];
  for (let i = 1; i < c.length; i++) {
    const upM = c[i].h - c[i - 1].h;
    const dnM = c[i - 1].l - c[i].l;
    plus.push(upM > dnM && upM > 0 ? upM : 0);
    minus.push(dnM > upM && dnM > 0 ? dnM : 0);
    tr.push(Math.max(c[i].h - c[i].l, Math.abs(c[i].h - c[i - 1].c), Math.abs(c[i].l - c[i - 1].c)));
  }
  const atrv = rma(tr, n);
  const pdi = rma(plus, n).map((v, i) => (100 * v) / atrv[i]);
  const mdi = rma(minus, n).map((v, i) => (100 * v) / atrv[i]);
  const dx = pdi.map((p, i) => (100 * Math.abs(p - mdi[i])) / (p + mdi[i] || 1));
  const adx = rma(dx.map((v) => (Number.isFinite(v) ? v : NaN)), n);
  const out: LabSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (!ok(pdi[i - 1], mdi[i - 1], adx[i]) || adx[i] < 25) continue;
    if (pdi[i - 1] <= mdi[i - 1] && pdi[i] > mdi[i]) out.push({ i, dir: 'up' });
    else if (pdi[i - 1] >= mdi[i - 1] && pdi[i] < mdi[i]) out.push({ i, dir: 'down' });
  }
  return out;
};

/** Heikin Ashi: iki ardışık aynı renk mumla renk değişimi. */
const heikinAshi: LabStrategy['run'] = (c) => {
  if (!c.length) return [];
  const ha: { o: number; c: number }[] = [];
  for (let i = 0; i < c.length; i++) {
    const hc = (c[i].o + c[i].h + c[i].l + c[i].c) / 4;
    const ho = i ? (ha[i - 1].o + ha[i - 1].c) / 2 : (c[i].o + c[i].c) / 2;
    ha.push({ o: ho, c: hc });
  }
  const color = ha.map((x) => (x.c >= x.o ? 1 : -1));
  const sigs: LabSignal[] = [];
  for (let i = 2; i < c.length; i++) {
    if (color[i] === color[i - 1] && color[i - 1] !== color[i - 2]) sigs.push({ i, dir: color[i] > 0 ? 'up' : 'down' });
  }
  return alternate(sigs);
};

/** TTM Squeeze: Bollinger (20,2) Keltner (20,1.5) içinden çıkınca momentum yönünde. */
const squeeze: LabStrategy['run'] = (c) => {
  const cl = closes(c);
  const m = sma(cl, 20);
  const a = atr(highs(c), lows(c), cl, 20);
  const sd = cl.map((_, i) => {
    if (i < 19) return NaN;
    let s = 0;
    for (let j = i - 19; j <= i; j++) s += (cl[j] - m[i]) ** 2;
    return Math.sqrt(s / 20);
  });
  const inSq = cl.map((_, i) => ok(sd[i], a[i]) && 2 * sd[i] < 1.5 * a[i]);
  const out: LabSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (inSq[i - 1] && !inSq[i] && ok(m[i])) out.push({ i, dir: cl[i] > m[i] ? 'up' : 'down' });
  }
  return out;
};

/** Piyasa yapısı kırılımı: kapanış son pivot tepenin üstüne / son pivot dibin altına. */
const structureBreak: LabStrategy['run'] = (c) => {
  const { hi, lo } = pivots(c, 3);
  let h = 0;
  let l = 0;
  let lastHi: number | null = null;
  let lastLo: number | null = null;
  const sigs: LabSignal[] = [];
  for (let i = 0; i < c.length; i++) {
    while (h < hi.length && hi[h].at <= i) lastHi = hi[h++].price;
    while (l < lo.length && lo[l].at <= i) lastLo = lo[l++].price;
    if (lastHi != null && c[i].c > lastHi && (i === 0 || c[i - 1].c <= lastHi)) sigs.push({ i, dir: 'up' });
    else if (lastLo != null && c[i].c < lastLo && (i === 0 || c[i - 1].c >= lastLo)) sigs.push({ i, dir: 'down' });
  }
  return alternate(sigs);
};

/** Connors RSI(2): SMA200 üstünde RSI2 < 10'a inince al; altında RSI2 > 90'a çıkınca sat. */
const rsi2: LabStrategy['run'] = (c) => {
  const cl = closes(c);
  const r = rsi(cl, 2);
  const s200 = sma(cl, 200);
  const out: LabSignal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (!ok(r[i - 1], s200[i])) continue;
    if (r[i - 1] >= 10 && r[i] < 10 && cl[i] > s200[i]) out.push({ i, dir: 'up' });
    else if (r[i - 1] <= 90 && r[i] > 90 && cl[i] < s200[i]) out.push({ i, dir: 'down' });
  }
  return out;
};

/** Yutan mum: son 10 mumun dibinde yükselen yutan (al) / zirvesinde düşen yutan (sat). */
const engulfing: LabStrategy['run'] = (c) => {
  const out: LabSignal[] = [];
  for (let i = 10; i < c.length; i++) {
    const p = c[i - 1];
    const x = c[i];
    let lowest = Infinity;
    let highest = -Infinity;
    for (let j = i - 10; j < i; j++) {
      lowest = Math.min(lowest, c[j].l);
      highest = Math.max(highest, c[j].h);
    }
    const bull = p.c < p.o && x.c > x.o && x.c >= p.o && x.o <= p.c;
    const bear = p.c > p.o && x.c < x.o && x.c <= p.o && x.o >= p.c;
    if (bull && Math.min(p.l, x.l) <= lowest) out.push({ i, dir: 'up' });
    else if (bear && Math.max(p.h, x.h) >= highest) out.push({ i, dir: 'down' });
  }
  return spaced(out, 5);
};

/** Çekiç / kayan yıldız (pin bar): uzun fitil gövdenin 2 katı, 10 mumluk uçta. */
const pinBar: LabStrategy['run'] = (c) => {
  const out: LabSignal[] = [];
  for (let i = 10; i < c.length; i++) {
    const x = c[i];
    const body = Math.abs(x.c - x.o);
    const range = x.h - x.l;
    if (range <= 0) continue;
    const lowerW = Math.min(x.o, x.c) - x.l;
    const upperW = x.h - Math.max(x.o, x.c);
    let lowest = Infinity;
    let highest = -Infinity;
    for (let j = i - 10; j < i; j++) {
      lowest = Math.min(lowest, c[j].l);
      highest = Math.max(highest, c[j].h);
    }
    if (lowerW >= 2 * body && lowerW >= 0.6 * range && x.l <= lowest) out.push({ i, dir: 'up' });
    else if (upperW >= 2 * body && upperW >= 0.6 * range && x.h >= highest) out.push({ i, dir: 'down' });
  }
  return spaced(out, 5);
};

/** İç mum kırılımı: iç mumdan sonra ana mumun tepesi/dibi kapanışla kırılır. */
const insideBar: LabStrategy['run'] = (c) => {
  const out: LabSignal[] = [];
  for (let i = 2; i < c.length; i++) {
    const mother = c[i - 2];
    const inside = c[i - 1];
    if (!(inside.h < mother.h && inside.l > mother.l)) continue;
    if (c[i].c > mother.h) out.push({ i, dir: 'up' });
    else if (c[i].c < mother.l) out.push({ i, dir: 'down' });
  }
  return out;
};

/** İkili dip / ikili tepe: benzer iki pivot dip, aradaki tepenin (boyun) kapanışla kırılması. */
const doubleTopBottom: LabStrategy['run'] = (c) => {
  const a = atr(highs(c), lows(c), closes(c), 14);
  const { hi, lo } = pivots(c, 3);
  const out: LabSignal[] = [];
  const scan = (ps: typeof lo, dir: Direction) => {
    for (let n = 1; n < ps.length; n++) {
      const p1 = ps[n - 1];
      const p2 = ps[n];
      const gap = p2.k - p1.k;
      const tol = a[p2.k];
      if (gap < 5 || gap > 60 || !ok(tol) || Math.abs(p2.price - p1.price) > 0.5 * tol) continue;
      // Boyun çizgisi: iki pivot arasındaki en uç nokta.
      let neck = dir === 'up' ? -Infinity : Infinity;
      for (let j = p1.k; j <= p2.k; j++) neck = dir === 'up' ? Math.max(neck, c[j].h) : Math.min(neck, c[j].l);
      if (Math.abs(neck - p2.price) < 1.5 * tol) continue; // formasyon yeterince derin değil
      for (let i = p2.at; i < Math.min(c.length, p2.at + 20); i++) {
        if (dir === 'up' && c[i].c > neck) {
          out.push({ i, dir });
          break;
        }
        if (dir === 'down' && c[i].c < neck) {
          out.push({ i, dir });
          break;
        }
        if (dir === 'up' && c[i].c < Math.min(p1.price, p2.price) - 0.5 * tol) break;
        if (dir === 'down' && c[i].c > Math.max(p1.price, p2.price) + 0.5 * tol) break;
      }
    }
  };
  scan(lo, 'up');
  scan(hi, 'down');
  return spaced(out.sort((x, y) => x.i - y.i), 5);
};

/** Omuz-baş-omuz (ve ters OBO): üç pivot, ortası en uçta, omuzlar benzer; boyun çizgisi kırılımı. */
const headShoulders: LabStrategy['run'] = (c) => {
  const a = atr(highs(c), lows(c), closes(c), 14);
  const { hi, lo } = pivots(c, 3);
  const out: LabSignal[] = [];
  const scan = (ps: typeof hi, troughs: typeof lo, dir: Direction) => {
    for (let n = 2; n < ps.length; n++) {
      const [l, h, r] = [ps[n - 2], ps[n - 1], ps[n]];
      const tol = a[r.k];
      if (!ok(tol) || r.k - l.k > 80) continue;
      const headOk = dir === 'down' ? h.price > l.price + tol && h.price > r.price + tol : h.price < l.price - tol && h.price < r.price - tol;
      if (!headOk || Math.abs(l.price - r.price) > tol) continue;
      const t1 = troughs.filter((t) => t.k > l.k && t.k < h.k);
      const t2 = troughs.filter((t) => t.k > h.k && t.k < r.k);
      if (!t1.length || !t2.length) continue;
      const neck = dir === 'down' ? Math.min(...t1.map((t) => t.price), ...t2.map((t) => t.price)) : Math.max(...t1.map((t) => t.price), ...t2.map((t) => t.price));
      for (let i = r.at; i < Math.min(c.length, r.at + 20); i++) {
        if (dir === 'down' && c[i].c < neck) {
          out.push({ i, dir });
          break;
        }
        if (dir === 'up' && c[i].c > neck) {
          out.push({ i, dir });
          break;
        }
      }
    }
  };
  scan(hi, lo, 'down');
  scan(lo, hi, 'up');
  return spaced(out.sort((x, y) => x.i - y.i), 5);
};

/** Trend çizgisi kırılımı: son iki alçalan pivot tepeden çizilen çizginin kapanışla yukarı kırılması (tersi dipler). */
const trendlineBreak: LabStrategy['run'] = (c) => {
  const { hi, lo } = pivots(c, 3);
  const out: LabSignal[] = [];
  let h = 0;
  let l = 0;
  const hs: Pivot[] = [];
  const ls: Pivot[] = [];
  let firedHi = -1;
  let firedLo = -1;
  for (let i = 0; i < c.length; i++) {
    while (h < hi.length && hi[h].at <= i) hs.push(hi[h++]);
    while (l < lo.length && lo[l].at <= i) ls.push(lo[l++]);
    if (hs.length >= 2) {
      const [p1, p2] = hs.slice(-2);
      if (p2.price < p1.price && firedHi !== p2.k && i - p2.k < 60) {
        const line = p2.price + ((p2.price - p1.price) / (p2.k - p1.k)) * (i - p2.k);
        const prev = p2.price + ((p2.price - p1.price) / (p2.k - p1.k)) * (i - 1 - p2.k);
        if (c[i].c > line && c[i - 1].c <= prev) {
          out.push({ i, dir: 'up' });
          firedHi = p2.k;
        }
      }
    }
    if (ls.length >= 2) {
      const [p1, p2] = ls.slice(-2);
      if (p2.price > p1.price && firedLo !== p2.k && i - p2.k < 60) {
        const line = p2.price + ((p2.price - p1.price) / (p2.k - p1.k)) * (i - p2.k);
        const prev = p2.price + ((p2.price - p1.price) / (p2.k - p1.k)) * (i - 1 - p2.k);
        if (c[i].c < line && c[i - 1].c >= prev) {
          out.push({ i, dir: 'down' });
          firedLo = p2.k;
        }
      }
    }
  }
  return out;
};

export const LAB: LabStrategy[] = [
  { id: 'ema5813', name: 'EMA 5·8·13', family: 'trend', rule: 'EMA5>8>13 dizilimi, sırayla değişen yön', run: fromCore('ema5813') },
  { id: 'pullback2050', name: 'EMA 20·50 pullback', family: 'trend', rule: 'Kesişim → EMA20 geri çekilme → tepe kırılımı', run: fromCore('pullback2050') },
  { id: 'triple', name: 'Üçlü Onay', family: 'momentum', rule: 'MACD 0 + RSI 50 (3 mum) + BB orta üstü kapanış', run: fromCore('triple') },
  { id: 'macd', name: 'MACD (0 + devam)', family: 'momentum', rule: 'MACD 0 kesişimi; 0 altında/üstünde sinyal kesişimiyle devam', run: fromCore('macd') },
  { id: 'supertrend', name: 'Supertrend 10,3', family: 'trend', rule: 'Yön değişimi', run: fromCore('supertrend') },
  { id: 'goldencross', name: 'Altın/Ölüm kesişimi', family: 'trend', rule: 'SMA50 × SMA200', run: fromCore('goldencross') },
  { id: 'donchian', name: 'Donchian 20', family: 'trend', rule: '20 mumluk zirve/dip kırılımı', run: fromCore('donchian') },
  { id: 'ema921', name: 'EMA 9×21', family: 'trend', rule: 'EMA9, EMA21 kesişimi', run: emaCross(9, 21) },
  { id: 'macdsig', name: 'MACD sinyal kesişimi', family: 'momentum', rule: 'MACD çizgisi × sinyal çizgisi', run: macdSignal },
  { id: 'ichimoku', name: 'Ichimoku TK', family: 'trend', rule: 'Tenkan × Kijun, fiyat bulutun dışında', run: ichimoku },
  { id: 'psar', name: 'Parabolic SAR', family: 'trend', rule: 'SAR yön değişimi (0.02/0.2)', run: psar },
  { id: 'adx', name: 'ADX/DMI', family: 'trend', rule: '+DI × −DI, ADX > 25', run: adxDmi },
  { id: 'heikin', name: 'Heikin Ashi', family: 'trend', rule: 'İki mumla renk değişimi', run: heikinAshi },
  { id: 'squeeze', name: 'TTM Squeeze', family: 'momentum', rule: 'BB, Keltner dışına çıkınca yön', run: squeeze },
  { id: 'structure', name: 'Yapı kırılımı (BOS)', family: 'pattern', rule: 'Son pivot tepe/dibin kapanışla kırılması', run: structureBreak },
  { id: 'rsi2', name: 'RSI(2) Connors', family: 'reversion', rule: 'SMA200 yönünde RSI2 <10 / >90', run: rsi2 },
  { id: 'bbrev', name: 'Bollinger dönüşü', family: 'reversion', rule: 'Bant dışından içeri kapanış', run: bbReversion },
  { id: 'stoch', name: 'Stokastik 14,3,3', family: 'reversion', rule: '%K×%D, 20 altı / 80 üstü', run: stochastic },
  { id: 'rsidiv', name: 'RSI uyumsuzluğu', family: 'reversion', rule: 'Fiyat yeni dip, RSI yüksek dip (tersi tepe)', run: rsiDivergence },
  { id: 'engulf', name: 'Yutan mum', family: 'candle', rule: '10 mumluk uçta yutan formasyon', run: engulfing },
  { id: 'pinbar', name: 'Çekiç / kayan yıldız', family: 'candle', rule: '10 mumluk uçta uzun fitilli mum', run: pinBar },
  { id: 'insidebar', name: 'İç mum kırılımı', family: 'candle', rule: 'Ana mumun tepe/dibinin kırılması', run: insideBar },
  { id: 'double', name: 'İkili dip / tepe', family: 'pattern', rule: 'Benzer iki pivot + boyun kırılımı', run: doubleTopBottom },
  { id: 'hns', name: 'Omuz-baş-omuz', family: 'pattern', rule: 'OBO / ters OBO boyun kırılımı', run: headShoulders },
  { id: 'trendline', name: 'Trend çizgisi kırılımı', family: 'pattern', rule: 'İki pivottan çizilen çizginin kırılması', run: trendlineBreak },
];

// ---------------- Ölçüm ----------------

export const HORIZONS = [5, 10, 20] as const;

export interface Score {
  n: number;
  /** Ufuk başına: sinyal yönünde kazanç oranı (%), ortalama yönlü getiri (%). */
  win: Record<number, number>;
  avg: Record<number, number>;
  /** 10 mum ufkunda kâr faktörü: kazançlar toplamı / kayıplar toplamı. */
  pf10: number;
  /** Aynı dönemde rastgele (her mumda) girişin 10 mum sonraki yönlü kazanç oranı; kıyas çizgisi. */
  base10: number;
}

/** Sinyallerin ileriye dönük yönlü getirisini ölçer. Sonucu yeterli ileri veri olmayan sinyaller sayılmaz. */
export function score(c: Candle[], sigs: LabSignal[]): Score {
  const win: Record<number, number> = {};
  const avg: Record<number, number> = {};
  let n = 0;
  let gains = 0;
  let losses = 0;
  const maxH = HORIZONS[HORIZONS.length - 1];
  const valid = sigs.filter((s) => s.i + maxH < c.length);
  for (const h of HORIZONS) {
    let w = 0;
    let sum = 0;
    for (const s of valid) {
      const r = ((c[s.i + h].c - c[s.i].c) / c[s.i].c) * 100 * (s.dir === 'up' ? 1 : -1);
      if (r > 0) w++;
      sum += r;
      if (h === 10) {
        if (r > 0) gains += r;
        else losses -= r;
      }
    }
    n = valid.length;
    win[h] = n ? (w / n) * 100 : NaN;
    avg[h] = n ? sum / n : NaN;
  }
  // Kıyas: aynı yön dağılımıyla her mumda giriş yapılsaydı.
  const upShare = valid.length ? valid.filter((s) => s.dir === 'up').length / valid.length : 0.5;
  let upWins = 0;
  let total = 0;
  for (let i = 0; i + 10 < c.length; i++) {
    total++;
    if (c[i + 10].c > c[i].c) upWins++;
  }
  const pUp = total ? upWins / total : 0.5;
  return { n, win, avg, pf10: losses ? gains / losses : gains ? Infinity : NaN, base10: (upShare * pUp + (1 - upShare) * (1 - pUp)) * 100 };
}
