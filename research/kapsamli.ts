// Kapsamlı strateji araştırması — Japan 225 (NIY=F), 10x kaldıraç, 1000 $ bileşik, maliyet dahil.
// Yöntem: çok aile × parametre × zaman dilimi; walk-forward (6 ay eğitim → 2 ay test, 2 ay kaydırma), seçim yalnızca eğitimde,
// sonuç yalnızca test parçalarının birleşimi; deflated Sharpe; parametre yaylası; Monte Carlo (işlem sırası karıştırma);
// diğer enstrümanlar; rejim analizi. Çalıştırma: npx tsx research/kapsamli.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { aggregate } from '../src/core/candles';
import { adx, atr, bollinger, ema, highest, lowest, macd, rsi, sma, supertrend } from '../src/core/indicators';
import type { Candle, Timeframe } from '../src/core/types';
import { INS, type Ins } from './focus';
import { loadAll } from './load';

const LEV = 10;
const E0 = 1000;
const ROLL = 21 * 3600;
/** Stop-out: özsermaye pozisyon büyüklüğünün %1'ine inerse (marj %5, stop-out %20 varsayımı). */
const STOP_OUT = 0.01;
const MONTH = 30.44 * 86400;
const TRAIN = 6 * MONTH, TEST = 2 * MONTH;

type Tf = '15m' | '30m' | '1h' | '2h' | '3h' | '4h' | '6h' | '8h' | '12h' | '1d';
const TF_SEC: Record<Tf, number> = { '15m': 900, '30m': 1800, '1h': 3600, '2h': 7200, '3h': 10800, '4h': 14400, '6h': 21600, '8h': 28800, '12h': 43200, '1d': 86400 };
const MAIN_TFS: Tf[] = ['1h', '2h', '3h', '4h', '6h', '8h', '12h', '1d'];
const SHORT_TFS: Tf[] = ['15m', '30m'];

// ---------------------------------------------------------------- strateji tanımı
interface Rules {
  /** Kapanışta giriş sinyali: 1 / −1 / 0. */
  entry: (i: number) => number;
  /** Kapanışta çıkış (pozisyon yönüne göre). */
  exit?: (i: number, dir: number, held: number) => boolean;
  /** Sinyale özel stop fiyatı. */
  stopPx?: (i: number, dir: number) => number;
  stopAtr?: number;
  trailAtr?: number;
  maxBars?: number;
  /** Ters giriş sinyali açık pozisyonu çevirir. */
  reverse?: boolean;
}
interface Variant { id: string; family: string; tf: Tf; params: Record<string, number | string>; make: (x: Ctx) => Rules }
interface Ctx { cs: Candle[]; tf: Tf; I: Ind; htfUp: Int8Array }
interface Trade { e: number; x: number; t: number; tx: number; dir: number; entry: number; exitPx: number; net: number; mae: number; pts: number; bars: number; costPts: number }

class Ind {
  private m = new Map<string, number[]>();
  readonly h: number[]; readonly l: number[]; readonly c: number[]; readonly o: number[];
  constructor(readonly cs: Candle[]) {
    this.h = cs.map((x) => x.h); this.l = cs.map((x) => x.l); this.c = cs.map((x) => x.c); this.o = cs.map((x) => x.o);
  }
  get(key: string, f: () => number[]) {
    let v = this.m.get(key);
    if (!v) this.m.set(key, (v = f()));
    return v;
  }
  ema = (n: number) => this.get(`ema${n}`, () => ema(this.c, n));
  sma = (n: number) => this.get(`sma${n}`, () => sma(this.c, n));
  atr = () => this.get('atr', () => atr(this.h, this.l, this.c, 14));
  rsi = (n: number) => this.get(`rsi${n}`, () => rsi(this.c, n));
  adx = () => this.get('adx', () => adx(this.h, this.l, this.c, 14).adx);
  hi = (n: number) => this.get(`hi${n}`, () => highest(this.h, n));
  lo = (n: number) => this.get(`lo${n}`, () => lowest(this.l, n));
  st = (p: number, m: number) => this.get(`st${p}_${m}`, () => supertrend(this.h, this.l, this.c, p, m));
  macdLine = () => this.get('macdL', () => macd(this.c).line);
  macdSig = () => this.get('macdS', () => macd(this.c).signal);
  bbU = (k: number) => this.get(`bbU${k}`, () => bollinger(this.c, 20, k).upper);
  bbL = (k: number) => this.get(`bbL${k}`, () => bollinger(this.c, 20, k).lower);
}

const cross = (a: number[], b: number[] | number, i: number) => {
  const bi = typeof b === 'number' ? b : b[i], bp = typeof b === 'number' ? b : b[i - 1];
  if (!(i > 0) || [a[i], a[i - 1], bi, bp].some(Number.isNaN)) return 0;
  return a[i - 1] <= bp && a[i] > bi ? 1 : a[i - 1] >= bp && a[i] < bi ? -1 : 0;
};

// ---------------------------------------------------------------- aileler
export function variants(tfs: Tf[]): Variant[] {
  const out: Variant[] = [];
  const add = (family: string, tf: Tf, params: Record<string, number | string>, make: (x: Ctx) => Rules) =>
    out.push({ id: `${family}|${tf}|${Object.values(params).join(',')}`, family, tf, params, make });
  for (const tf of tfs) {
    // 1) EMA kesişimi
    for (const [f, s] of [[9, 21], [13, 34], [20, 50], [21, 55], [50, 100], [50, 200]])
      for (const stop of [0, 2, 3])
        for (const htf of [0, 1])
          add('EMA kesişimi', tf, { hızlı: f, yavaş: s, stopATR: stop, günlükFiltre: htf }, ({ I, htfUp }) => {
            const a = I.ema(f), b = I.ema(s);
            return {
              entry: (i) => {
                const x = cross(a, b, i);
                if (!x || (htf && (x === 1) !== (htfUp[i] === 1))) return 0;
                return x;
              },
              exit: (i, d) => (d === 1 ? a[i] < b[i] : a[i] > b[i]),
              stopAtr: stop || undefined,
              reverse: true,
            };
          });
    // 2) Donchian kırılımı
    for (const [n, m] of [[20, 10], [40, 20], [55, 20]])
      for (const stop of [0, 2])
        for (const flt of [0, 1])
          add('Donchian kırılımı', tf, { giriş: n, çıkış: m, stopATR: stop, ema200: flt }, ({ I }) => {
            const hn = I.hi(n), ln = I.lo(n), hm = I.hi(m), lm = I.lo(m), e = I.ema(200), c = I.c;
            return {
              entry: (i) => {
                if (i < 1) return 0;
                const up = c[i] > hn[i - 1], dn = c[i] < ln[i - 1];
                if (up && (!flt || c[i] > e[i])) return 1;
                if (dn && (!flt || c[i] < e[i])) return -1;
                return 0;
              },
              exit: (i, d) => i > 0 && (d === 1 ? c[i] < lm[i - 1] : c[i] > hm[i - 1]),
              stopAtr: stop || undefined,
              reverse: true,
            };
          });
    // 3) Supertrend
    for (const [p, mult] of [[10, 2], [10, 3], [10, 4], [14, 3], [20, 5]])
      for (const flt of ['yok', 'adx20', 'günlük'])
        add('Supertrend', tf, { periyot: p, çarpan: mult, filtre: flt }, ({ I, htfUp }) => {
          const d = I.st(p, mult), ax = I.adx();
          return {
            entry: (i) => {
              if (i < 1 || Number.isNaN(d[i - 1]) || d[i] === d[i - 1]) return 0;
              if (flt === 'adx20' && !(ax[i] >= 20)) return 0;
              if (flt === 'günlük' && (d[i] === 1) !== (htfUp[i] === 1)) return 0;
              return d[i];
            },
            exit: (i, dir) => d[i] === -dir,
            reverse: true,
          };
        });
    // 4) MACD
    for (const kind of ['sıfır', 'sinyal'])
      for (const flt of [0, 1])
        for (const stop of [0, 2])
          add('MACD', tf, { tür: kind, ema200: flt, stopATR: stop }, ({ I }) => {
            const L = I.macdLine(), S = I.macdSig(), e = I.ema(200), c = I.c;
            return {
              entry: (i) => {
                const x = kind === 'sıfır' ? cross(L, 0, i) : cross(L, S, i);
                if (!x || (flt && (x === 1 ? !(c[i] > e[i]) : !(c[i] < e[i])))) return 0;
                return x;
              },
              exit: (i, d) => (kind === 'sıfır' ? (d === 1 ? L[i] < 0 : L[i] > 0) : d === 1 ? L[i] < S[i] : L[i] > S[i]),
              stopAtr: stop || undefined,
              reverse: true,
            };
          });
    // 5) RSI(2) ortalamaya dönüş
    for (const thr of [5, 10])
      for (const mode of ['uzun', 'iki yön'])
        for (const stop of [0, 3])
          add('RSI(2) dönüş', tf, { eşik: thr, yön: mode, stopATR: stop }, ({ I }) => {
            const r = I.rsi(2), s200 = I.sma(200), s5 = I.sma(5), c = I.c;
            return {
              entry: (i) => (c[i] > s200[i] && r[i] < thr ? 1 : mode === 'iki yön' && c[i] < s200[i] && r[i] > 100 - thr ? -1 : 0),
              exit: (i, d) => (d === 1 ? c[i] > s5[i] : c[i] < s5[i]),
              stopAtr: stop || undefined,
              maxBars: 10,
            };
          });
    // 6) Bollinger ortalamaya dönüş
    for (const k of [2, 2.5])
      for (const mode of ['uzun', 'iki yön'])
        add('Bollinger dönüş', tf, { sapma: k, yön: mode }, ({ I }) => {
          const u = I.bbU(k), lo = I.bbL(k), mid = I.sma(20), s200 = I.sma(200), c = I.c;
          return {
            entry: (i) => (c[i] < lo[i] && c[i] > s200[i] ? 1 : mode === 'iki yön' && c[i] > u[i] && c[i] < s200[i] ? -1 : 0),
            exit: (i, d) => (d === 1 ? c[i] > mid[i] : c[i] < mid[i]),
            stopAtr: 2,
            maxBars: 20,
          };
        });
    // 7) Keltner (ATR kanalı) kırılımı + takip eden stop
    for (const k of [1, 1.5, 2])
      for (const trail of [2, 3])
        for (const flt of [0, 1])
          add('ATR kanal kırılımı', tf, { kanal: k, takipATR: trail, ema200: flt }, ({ I }) => {
            const e = I.ema(20), a = I.atr(), e200 = I.ema(200), c = I.c;
            return {
              entry: (i) => {
                if (c[i] > e[i] + k * a[i] && (!flt || c[i] > e200[i])) return 1;
                if (c[i] < e[i] - k * a[i] && (!flt || c[i] < e200[i])) return -1;
                return 0;
              },
              stopAtr: trail,
              trailAtr: trail,
              reverse: true,
            };
          });
    // 8) Momentum (ROC işareti)
    for (const n of [20, 50, 100])
      for (const trail of [0, 3])
        add('Momentum (ROC)', tf, { periyot: n, takipATR: trail }, ({ I }) => {
          const c = I.c;
          const sgn = (i: number) => (i >= n ? Math.sign(c[i] - c[i - n]) : 0);
          return {
            entry: (i) => (i > n && sgn(i) !== sgn(i - 1) ? sgn(i) : 0),
            exit: (i, d) => sgn(i) === -d,
            stopAtr: trail || undefined,
            trailAtr: trail || undefined,
            reverse: true,
          };
        });
    // 9) Tokyo açılış aralığı kırılımı (yalnız 1s)
    if (tf === '1h')
      for (const rb of [1, 2])
        for (const endH of [6, 21])
          add('Tokyo açılış kırılımı', tf, { aralıkMum: rb, çıkışSaatiUTC: endH }, ({ cs }) => {
            const hr = (i: number) => new Date(cs[i].t * 1000).getUTCHours();
            const day = (i: number) => Math.floor(cs[i].t / 86400);
            const rh = new Map<number, number>(), rl = new Map<number, number>(), done = new Set<number>();
            for (let i = 0; i < cs.length; i++)
              if (hr(i) < rb) {
                const d = day(i);
                rh.set(d, Math.max(rh.get(d) ?? -Infinity, cs[i].h));
                rl.set(d, Math.min(rl.get(d) ?? Infinity, cs[i].l));
              }
            return {
              entry: (i) => {
                const h = hr(i), d = day(i);
                if (h < rb || h >= 5 || done.has(d) || !rh.has(d)) return 0;
                if (cs[i].c > rh.get(d)!) return done.add(d), 1;
                if (cs[i].c < rl.get(d)!) return done.add(d), -1;
                return 0;
              },
              stopPx: (i, dir) => (dir === 1 ? rl.get(day(i))! : rh.get(day(i))!),
              exit: (i) => hr(i) === endH - 1,
            };
          });
  }
  return out;
}

// ---------------------------------------------------------------- motor
export function backtest(cs: Candle[], R: Rules, ins: Ins, a: number[], mode: 'open' | 'close'): Trade[] {
  const trades: Trade[] = [];
  let dir = 0, e = -1, entryPx = 0, stop = NaN, best = NaN, worst = NaN, stopDist = 0;
  let pending: { dir: number; sig: number; exit: boolean } | null = null;
  const cost = (px: number) => 1.5 * ins.spread + ins.comm * px;
  const open = (i: number, d: number, px: number, sigI: number) => {
    dir = d; e = i; entryPx = px; best = px; worst = px;
    const sp = R.stopPx?.(sigI, d);
    stopDist = sp != null ? d * (px - sp) : R.stopAtr ? R.stopAtr * a[sigI] : NaN;
    stop = sp != null ? sp : R.stopAtr ? px - d * stopDist : NaN;
    if (!(stopDist > 0)) stopDist = NaN;
  };
  const close = (i: number, px: number) => {
    let nights = 0;
    for (let dd = Math.floor((cs[e].t - ROLL) / 86400) + 1; dd * 86400 + ROLL <= cs[i].t; dd++) {
      const wd = new Date((dd * 86400 + ROLL) * 1000).getUTCDay();
      if (wd === 0 || wd === 6) continue;
      nights += wd === ins.tripleDay ? 3 : 1;
    }
    const rate = dir === 1 ? ins.swapLong : ins.swapShort;
    const swapPts = (nights * entryPx * rate) / 100 / 360;
    const cp = cost(entryPx) + swapPts;
    const pts = dir * (px - entryPx) - cp;
    trades.push({ e, x: i, t: cs[e].t, tx: cs[i].t, dir, entry: entryPx, exitPx: px, net: pts / entryPx, mae: (dir * (worst - entryPx)) / entryPx, pts, bars: i - e, costPts: cp });
    dir = 0;
  };
  for (let i = 1; i < cs.length; i++) {
    const c = cs[i];
    if (pending && mode === 'open') {
      const p = pending;
      pending = null;
      if (p.exit && dir !== 0) close(i, c.o);
      if (p.dir !== 0 && dir === 0) open(i, p.dir, c.o, p.sig);
    }
    if (dir !== 0) {
      // Mum içi: stop (boşlukla açılışta aşıldıysa açılıştan).
      const adverse = dir === 1 ? c.l : c.h;
      worst = dir === 1 ? Math.min(worst, c.l) : Math.max(worst, c.h);
      if (!Number.isNaN(stop) && (dir === 1 ? adverse <= stop : adverse >= stop)) {
        const px = dir === 1 ? Math.min(stop, c.o) : Math.max(stop, c.o);
        worst = dir === 1 ? Math.min(worst, px) : Math.max(worst, px);
        close(i, px);
      } else {
        best = dir === 1 ? Math.max(best, c.h) : Math.min(best, c.l);
        if (R.trailAtr && !Number.isNaN(a[i])) {
          const ts = best - dir * R.trailAtr * a[i];
          stop = Number.isNaN(stop) ? ts : dir === 1 ? Math.max(stop, ts) : Math.min(stop, ts);
        }
      }
    }
    // Kapanışta sinyaller.
    const sig = R.entry(i);
    let wantExit = false, wantDir = 0;
    if (dir !== 0) {
      const held = i - e;
      if ((R.exit && R.exit(i, dir, held)) || (R.maxBars && held >= R.maxBars)) wantExit = true;
      if (R.reverse && sig === -dir) (wantExit = true), (wantDir = sig);
    } else if (sig !== 0) wantDir = sig;
    if (!wantExit && !wantDir) continue;
    if (mode === 'close') {
      if (wantExit && dir !== 0) close(i, c.c);
      if (wantDir && dir === 0) open(i, wantDir, c.c, i);
    } else if (i + 1 < cs.length) pending = { dir: wantDir, sig: i, exit: wantExit };
  }
  return trades;
}

// ---------------------------------------------------------------- 10x bileşik değerlendirme
interface Eval { end: number; n: number; win: number; minEq: number; maxDD: number; liq: boolean; avgPts: number; whip: number; ret: number[] }
export function evaluate(ts: Trade[], lev = LEV, e0 = 1): Eval {
  let eq = e0, peak = e0, minEq = e0, maxDD = 0, win = 0, liq = false, pts = 0, whip = 0;
  const ret: number[] = [];
  for (const t of ts) {
    const low = eq * (1 + lev * t.mae);
    const notional = eq * lev * (1 + t.mae);
    if (low <= STOP_OUT * notional) {
      liq = true;
      const after = STOP_OUT * notional;
      ret.push(after / eq - 1);
      eq = after;
      minEq = Math.min(minEq, eq);
      maxDD = Math.max(maxDD, 1 - eq / peak);
      continue;
    }
    minEq = Math.min(minEq, low);
    maxDD = Math.max(maxDD, 1 - low / peak);
    const r = lev * t.net;
    ret.push(r);
    eq *= 1 + r;
    peak = Math.max(peak, eq);
    maxDD = Math.max(maxDD, 1 - eq / peak);
    if (t.net > 0) win++;
    else if (t.bars <= 3) whip++;
    pts += t.pts;
  }
  const n = ts.length;
  return { end: eq, n, win: n ? win / n : NaN, minEq, maxDD, liq, avgPts: n ? pts / n : NaN, whip: n ? whip / n : NaN, ret };
}
const ok = (v: Eval) => !v.liq && v.minEq >= 0.4 && v.maxDD <= 0.5;

// ---------------------------------------------------------------- istatistik
const mean = (x: number[]) => (x.length ? x.reduce((p, q) => p + q, 0) / x.length : NaN);
const sd = (x: number[]) => {
  const m = mean(x);
  return x.length > 1 ? Math.sqrt(x.reduce((p, q) => p + (q - m) ** 2, 0) / (x.length - 1)) : NaN;
};
function normInv(p: number) {
  // Acklam yaklaşımı
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const q = p < 0.02425 ? Math.sqrt(-2 * Math.log(p)) : p > 1 - 0.02425 ? Math.sqrt(-2 * Math.log(1 - p)) : NaN;
  if (p < 0.02425) return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  if (p > 1 - 0.02425) return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  const r = p - 0.5, s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}
function normCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const y = 1 - 0.3989422804 * Math.exp((-x * x) / 2) * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? y : 1 - y;
}
/** Deflated Sharpe (Bailey & López de Prado): N deneme, denemeler arası SR varyansı. */
export function dsr(r: number[], srs: number[]) {
  const n = r.length, m = mean(r), s = sd(r);
  if (n < 5 || !(s > 0)) return NaN;
  const sr = m / s;
  const sk = mean(r.map((x) => ((x - m) / s) ** 3)), ku = mean(r.map((x) => ((x - m) / s) ** 4));
  const N = srs.length, v = sd(srs) ** 2, g = 0.5772156649;
  const sr0 = Math.sqrt(v) * ((1 - g) * normInv(1 - 1 / N) + g * normInv(1 - 1 / (N * Math.E)));
  return normCdf(((sr - sr0) * Math.sqrt(n - 1)) / Math.sqrt(Math.max(1e-9, 1 - sk * sr + ((ku - 1) / 4) * sr * sr)));
}
export function monteCarlo(ts: Trade[], runs = 2000) {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const ends: number[] = [];
  let bust = 0, low40 = 0, dd50 = 0;
  for (let k = 0; k < runs; k++) {
    // Bootstrap: aynı sayıda işlem, yerine koyarak rastgele sırayla (hem sıra hem işlem karışımı değişir).
    const s = ts.map(() => ts[Math.floor(rnd() * ts.length)]);
    const v = evaluate(s);
    ends.push(v.end);
    if (v.liq) bust++;
    if (v.minEq < 0.4) low40++;
    if (v.maxDD > 0.5) dd50++;
  }
  ends.sort((x, y) => x - y);
  return { p5: ends[Math.floor(runs * 0.05)], p50: ends[Math.floor(runs * 0.5)], p95: ends[Math.floor(runs * 0.95)], bust: bust / runs, low40: low40 / runs, dd50: dd50 / runs };
}

// ---------------------------------------------------------------- veri
async function series(ins: Ins) {
  const all = await loadAll(ins.symbol);
  const h1 = all['1h']!;
  const out: Partial<Record<Tf, Candle[]>> = { '1h': h1, '15m': all['15m'], '30m': all['30m'], '1d': all['1d'] };
  for (const tf of ['2h', '3h', '4h', '6h', '8h', '12h'] as Tf[]) out[tf] = aggregate(h1, TF_SEC[tf], false, 0);
  const dUtc = aggregate(h1, 86400, false, 0);
  return { out, dUtc, start: h1[0].t, end: h1[h1.length - 1].t };
}
/** Günlük (UTC) EMA 50 üstü = 1, altı = −1; yalnız kapanmış gün kullanılır. */
function htfTrend(cs: Candle[], tf: Tf, d: Candle[]): Int8Array {
  const e = ema(d.map((x) => x.c), 50);
  const out = new Int8Array(cs.length);
  let k = -1;
  for (let i = 0; i < cs.length; i++) {
    const closeT = cs[i].t + TF_SEC[tf];
    while (k + 1 < d.length && d[k + 1].t + 86400 <= closeT) k++;
    out[i] = k >= 0 && !Number.isNaN(e[k]) ? (d[k].c > e[k] ? 1 : -1) : 0;
  }
  return out;
}

interface Run { v: Variant; trades: Trade[]; tradesClose?: Trade[] }
async function runAll(ins: Ins, tfs: Tf[], withClose = false) {
  return runSeries(await series(ins), ins, tfs, withClose);
}
export function runSeries(
  { out, dUtc, start, end }: { out: Partial<Record<Tf, Candle[]>>; dUtc: Candle[]; start: number; end: number },
  ins: Ins,
  tfs: Tf[],
  withClose = false,
) {
  const runs: Run[] = [];
  const cache = new Map<Tf, { I: Ind; h: Int8Array }>();
  for (const v of variants(tfs)) {
    const cs = out[v.tf];
    if (!cs || cs.length < 100) continue;
    if (!cache.has(v.tf)) cache.set(v.tf, { I: new Ind(cs), h: htfTrend(cs, v.tf, dUtc) });
    const { I, h } = cache.get(v.tf)!;
    const ctx: Ctx = { cs, tf: v.tf, I, htfUp: h };
    const a = I.atr();
    const trades = backtest(cs, v.make(ctx), ins, a, 'open').filter((t) => t.t >= start);
    const run: Run = { v, trades };
    if (withClose) run.tradesClose = backtest(cs, v.make({ ...ctx }), ins, a, 'close').filter((t) => t.t >= start);
    runs.push(run);
  }
  return { runs, start, end };
}

/** Walk-forward: her katta eğitimde en iyi (kısıtları sağlayan) varyant seçilir, test penceresindeki işlemleri alınır. */
export function walkForward(runs: Run[], start: number, end: number) {
  const oos: Trade[] = [];
  const picks: { from: string; to: string; id: string | null; trainEnd: number }[] = [];
  const iso = (u: number) => new Date(u * 1000).toISOString().slice(0, 10);
  for (let t0 = start; t0 + TRAIN < end; t0 += TEST) {
    const tr1 = t0 + TRAIN, te1 = Math.min(tr1 + TEST, end);
    let best: Run | null = null, bestEnd = 1;
    for (const r of runs) {
      const tr = r.trades.filter((t) => t.t >= t0 && t.t < tr1);
      if (tr.length < 3) continue;
      const v = evaluate(tr);
      if (ok(v) && v.end > bestEnd) (bestEnd = v.end), (best = r);
    }
    picks.push({ from: iso(tr1), to: iso(te1), id: best ? best.v.id : null, trainEnd: bestEnd });
    if (!best) continue;
    const lastExit = oos.length ? oos[oos.length - 1].tx : -Infinity;
    for (const t of best.trades) if (t.t >= tr1 && t.t < te1 && t.t >= lastExit) oos.push(t);
  }
  return { oos, picks };
}

// ---------------------------------------------------------------- rapor
const usd = (x: number) => `${Math.round(x * E0).toLocaleString('tr-TR')} $`;
const pc = (x: number, d = 1) => `%${(x * 100).toFixed(d).replace('.', ',')}`;
const fx = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '—');

async function main() {
  const jp = INS.find((x) => x.id === 'jp225')!;
  const { runs, start, end } = await runAll(jp, MAIN_TFS, true);
  console.log(`Japan 225: ${runs.length} varyant`);
  const md: string[] = [];
  const families = [...new Set(runs.map((r) => r.v.family))];
  const srs = runs.map((r) => {
    const x = r.trades.map((t) => t.net);
    return x.length > 4 ? mean(x) / sd(x) : 0;
  });

  // Aile özeti + aile içi walk-forward
  const famRows: string[] = [];
  const famRes: { family: string; wf: ReturnType<typeof walkForward>; ev: Eval }[] = [];
  for (const fam of families) {
    const rs = runs.filter((r) => r.v.family === fam);
    const wf = walkForward(rs, start, end);
    const ev = evaluate(wf.oos);
    famRes.push({ family: fam, wf, ev });
    const ins = rs.map((r) => evaluate(r.trades));
    famRows.push(`| ${fam} | ${rs.length} | ${ins.filter(ok).length} | ${fx(Math.max(...ins.map((x) => x.end)) * E0, 0)} $ | ${usd(ev.end)} | ${ev.n} | ${pc(ev.win, 0)} | ${fx(ev.avgPts, 0)} | ${pc(ev.maxDD)} | ${usd(ev.minEq)} | ${ev.liq ? 'evet' : 'hayır'} |`);
  }
  const all = walkForward(runs, start, end);
  const allEv = evaluate(all.oos);
  famRes.sort((a, b) => b.ev.end - a.ev.end);

  md.push(
    '# Kapsamlı strateji araştırması — Japan 225, 10x kaldıraç',
    '',
    `Veri: Yahoo NIY=F (CME vadeli), 1s mumlar ${new Date(start * 1000).toISOString().slice(0, 10)} – ${new Date(end * 1000).toISOString().slice(0, 10)}; 2s/3s/4s/6s/8s/12s 1s'ten (UTC sınırlı) birleştirildi, günlük Yahoo'dan.`,
    'Maliyet: 17 puan spread + 8,5 puan kayma (her işlemde bir kez) + swap (uzun %6,53, kısa %3,06 yıllık; Cuma 3 gün). 10x kaldıraç, bileşik, stop-out: özsermaye pozisyonun %1\'i (marj %5, stop-out %20 varsayımı).',
    'Giriş/çıkış: sinyal mum kapanışında, işlem bir sonraki mumun açılışında; stoplar mum içinde (boşlukta açılış fiyatından). Ele: en düşük bakiye < %40, maks. düşüş > %50 ya da stop-out.',
    `Walk-forward: 6 ay eğitim → 2 ay test, 2 ay kaydırma; seçim yalnızca eğitimde (kısıtları sağlayan en yüksek bileşik bakiye; hiçbiri sağlamazsa o 2 ay işlem yok).`,
    '',
    `**Toplam denenen varyant: ${runs.length}** (${families.length} aile × parametre × ${MAIN_TFS.length} zaman dilimi). 15dk/30dk ayrıca (aşağıda), doğrulanamaz.`,
    '',
    '## 1. Aile özeti (walk-forward, yalnız test parçaları)',
    '',
    '| Aile | Varyant | Tüm dönemde kısıtı geçen | Tüm dönem en iyi (seçim yanlılıklı) | WF test: 1000 $ → | İşlem | İsabet | İşlem başı net puan | Maks. düşüş | En düşük bakiye | Stop-out |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...famRows,
    '',
    `**Tüm aileler birlikte walk-forward** (her katta ${runs.length} varyant arasından seçim): 1000 $ → ${usd(allEv.end)}, ${allEv.n} işlem, isabet ${pc(allEv.win, 0)}, maks. düşüş ${pc(allEv.maxDD)}, en düşük ${usd(allEv.minEq)}.`,
    '',
  );

  // En iyi 3 aday (aile düzeyinde WF)
  md.push('## 2. En iyi 3 aday (aile içi walk-forward, test sonuçları)', '');
  const top = famRes.slice(0, 3);
  const others = INS.filter((x) => x.id !== 'jp225');
  const otherRuns: Record<string, Awaited<ReturnType<typeof runAll>>> = {};
  for (const o of others) otherRuns[o.id] = await runAll(o, MAIN_TFS);
  const detail: Record<string, unknown> = {};
  for (const [k, c] of top.entries()) {
    const ev = c.ev;
    const mc = monteCarlo(c.wf.oos);
    // En sık seçilen ve son seçilen parametre.
    const counts = new Map<string, number>();
    for (const p of c.wf.picks) if (p.id) counts.set(p.id, (counts.get(p.id) ?? 0) + 1);
    const lastId = [...c.wf.picks].reverse().find((p) => p.id)?.id ?? null;
    const freq = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const chosen = runs.find((r) => r.v.id === (lastId ?? freq));
    // In-sample (tüm dönem, sabit parametre) ve yayla.
    let plateau = '—', isLine = '—', closeLine = '—', dsrLine = '—', lastYear = '—';
    if (chosen) {
      const isEv = evaluate(chosen.trades);
      isLine = `${usd(isEv.end)}, ${isEv.n} işlem, isabet ${pc(isEv.win, 0)}, maks. düşüş ${pc(isEv.maxDD)}`;
      const cl = evaluate(chosen.tradesClose ?? []);
      closeLine = `${usd(cl.end)} (${cl.n} işlem)`;
      const d = dsr(chosen.trades.map((t) => t.net), srs);
      dsrLine = `${fx(d, 2)} (N = ${runs.length} deneme; 0,95 üstü anlamlı sayılır)`;
      const keys = Object.keys(chosen.v.params);
      const neigh = runs.filter((r) => r.v.family === chosen.v.family && r.v.tf === chosen.v.tf && r.v.id !== chosen.v.id && keys.filter((q) => r.v.params[q] !== chosen.v.params[q]).length === 1);
      const tfNeigh = runs.filter((r) => r.v.family === chosen.v.family && r.v.tf !== chosen.v.tf && keys.every((q) => r.v.params[q] === chosen.v.params[q]));
      const prof = (xs: Run[]) => xs.filter((r) => mean(r.trades.map((t) => t.net)) > 0).length;
      plateau = `aynı zaman diliminde tek parametresi farklı ${neigh.length} komşudan ${prof(neigh)}'i (işlem başı net > 0), diğer zaman dilimlerinde aynı parametrelerin ${tfNeigh.length}'inden ${prof(tfNeigh)}'i kârlı`;
      const yStart = end - 365 * 86400;
      const ly = evaluate(c.wf.oos.filter((t) => t.t >= yStart));
      lastYear = `${usd(ly.end)} (${ly.n} işlem)`;
      detail[c.family] = { chosen: chosen.v, picks: c.wf.picks };
    }
    // Diğer enstrümanlar (aynı aile içi WF).
    const otherLines = others.map((o) => {
      const r = otherRuns[o.id];
      const wf = walkForward(r.runs.filter((x) => x.v.family === c.family), r.start, r.end);
      const e = evaluate(wf.oos);
      return `${o.name}: ${usd(e.end)} (${e.n} işlem, maks. düşüş ${pc(e.maxDD)}${e.liq ? ', stop-out' : ''})`;
    });
    // Rejim: çeyrek bazında test sonuçları.
    const q = new Map<string, number[]>();
    for (const [ti, t] of c.wf.oos.entries()) {
      const d = new Date(t.t * 1000);
      const key = `${d.getUTCFullYear()}-Ç${Math.floor(d.getUTCMonth() / 3) + 1}`;
      if (!q.has(key)) q.set(key, []);
      q.get(key)!.push(ev.ret[ti]);
    }
    const regime = [...q.entries()].map(([k2, r]) => `${k2}: ${pc(r.reduce((p, x) => p * (1 + x), 1) - 1, 0)} (${r.length})`).join(' · ');
    md.push(
      `### ${k + 1}. ${c.family}`,
      '',
      `- **Walk-forward test (10x, 1000 $):** ${usd(ev.end)} · getiri ${pc(ev.end - 1, 0)} · ${ev.n} işlem${ev.n < 30 ? ' (**30\'dan az: istatistiksel olarak zayıf**)' : ''} · isabet ${pc(ev.win, 0)} · işlem başı net ${fx(ev.avgPts, 0)} puan · maks. düşüş ${pc(ev.maxDD)} · en düşük ${usd(ev.minEq)} · stop-out ${ev.liq ? '**evet**' : 'hayır'} · hızlı zararlı çıkış (≤3 mum) ${pc(ev.whip, 0)}`,
      `- **Son 12 ay (test parçaları):** ${lastYear}`,
      `- **Kaldıraç duyarlılığı (aynı test işlemleri):** ${[1, 2, 3, 5, 10].map((L) => {
        const e = evaluate(c.wf.oos, L);
        return `${L}x → ${usd(e.end)} (düşüş ${pc(e.maxDD, 0)}, en düşük ${usd(e.minEq)}${ok(e) ? '' : ', kısıtı aşıyor'})`;
      }).join(' · ')}`,
      `- **Monte Carlo (bootstrap: işlemler yerine koyarak rastgele sırayla yeniden örneklendi, 2000 tekrar):** bitiş %5 / %50 / %95: ${usd(mc.p5)} / ${usd(mc.p50)} / ${usd(mc.p95)} · stop-out olasılığı ${pc(mc.bust)} · bakiye %40 altına inme ${pc(mc.low40)} · düşüş > %50 ${pc(mc.dd50)}`,
      `- **Seçilen parametreler (katlar):** ${c.wf.picks.map((p) => `${p.from}: ${p.id ?? 'işlem yok'}`).join(' · ')}`,
      `- **Son seçim (Pine için):** ${chosen ? `${chosen.v.tf} · ${JSON.stringify(chosen.v.params)}` : '—'}`,
      `- **Aynı parametre tüm dönem (in-sample, seçim yanlılıklı):** ${isLine} · kapanışta giriş: ${closeLine}`,
      `- **Deflated Sharpe:** ${dsrLine}`,
      `- **Parametre yaylası:** ${plateau}`,
      `- **Diğer enstrümanlar (aynı aile, aynı yöntem):** ${otherLines.join(' · ')}`,
      `- **Rejim (çeyrek bazında test getirisi, işlem sayısı):** ${regime}`,
      '',
    );
  }

  // Kısa zaman dilimleri (doğrulanamaz)
  const shortRuns = await runAll(jp, SHORT_TFS);
  const sBest = shortRuns.runs.map((r) => ({ r, ev: evaluate(r.trades) })).sort((a, b) => b.ev.end - a.ev.end).slice(0, 5);
  md.push(
    '## 3. 15dk / 30dk (yalnız ~60 gün veri — walk-forward yapılamaz, DOĞRULANAMAZ)',
    '',
    `Denenen ${shortRuns.runs.length} varyant; tüm dönemde en iyi 5 (seçim yanlılıklı):`,
    '',
    ...sBest.map((x) => `- ${x.r.v.id}: ${usd(x.ev.end)}, ${x.ev.n} işlem, maks. düşüş ${pc(x.ev.maxDD)}${x.ev.liq ? ', stop-out' : ''}`),
    '',
  );
  md.push('## 4. Walk-forward seçimleri (tüm aileler birlikte)', '', ...all.picks.map((p) => `- ${p.from} – ${p.to}: ${p.id ?? 'işlem yok (kısıtları sağlayan yok)'} (eğitim bakiyesi ×${fx(p.trainEnd)})`), '');
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-kapsamli.md', md.join('\n'));
  writeFileSync('research/out/sratr-kapsamli.json', JSON.stringify(detail, null, 1));
  console.log(md.join('\n'));
}

if (process.argv[1]?.endsWith('kapsamli.ts'))
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
