import {
  adx,
  atr,
  awesome,
  bollinger,
  cci,
  donchian,
  ema,
  haSmoothed,
  ichimoku,
  keltner,
  macd,
  psar,
  roc,
  squeezeMomentum,
  rsi,
  sma,
  stochOsc,
  stochRsi,
  supertrendLine,
  twinRangeFilter,
  williamsR,
} from '../core/indicators';
import { HIGHER_LABEL, HIGHER_TF, higherStoch, rsiWithSma, type HigherSeries } from '../core/sratr';
import type { Candle, Timeframe } from '../core/types';

/** Çizimde gereken bağlam: zaman dilimi ve Stokastik-RSI-ATR'nin üst zaman dilimi mumları. */
export interface PlotContext {
  tf: Timeframe;
  higher?: HigherSeries;
}

/** Grafikte bir çizgi. Değer dizisi mum sayısından uzunsa fazlası ileri tarihlere çizilir (Ichimoku bulutu). */
export interface PlotLine {
  name: string;
  color: string;
  values: number[];
  style?: 'line' | 'dashed' | 'dots';
}

/** Bir indikatörün çizimi: fiyat üstünde (overlay) veya ayrı alt panelde. */
export interface Plot {
  id: string;
  label: string;
  lines: PlotLine[];
  histogram?: number[];
  /** Alt panelde yatay referans çizgileri (ör. RSI 30/70). */
  levels?: number[];
}

export interface IndicatorDef {
  id: string;
  /** Seçim listesinde ve aktif çipte görünen ad. */
  label: string;
  /** Grup içi alt seçenek (EMA 21 → '21'). */
  option?: string;
  group: string;
  pane: boolean;
  color: string;
  build: (c: Candle[], ctx: PlotContext) => Omit<Plot, 'id' | 'label'>;
}

const H = (c: Candle[]) => c.map((x) => x.h);
const L = (c: Candle[]) => c.map((x) => x.l);
const C = (c: Candle[]) => c.map((x) => x.c);

/** Koyu zeminde ayırt edilebilir renkler. */
const EMA_COLORS: Record<number, string> = {
  3: '#f472b6',
  5: '#3987e5',
  8: '#d95926',
  13: '#199e70',
  20: '#38bdf8',
  21: '#e2b714',
  34: '#a78bfa',
  50: '#f97316',
  55: '#22d3ee',
  100: '#fb923c',
  150: '#94a3b8',
  200: '#f1f5f9',
};
const SMA_COLORS: Record<number, string> = { 20: '#60a5fa', 50: '#f59e0b', 100: '#34d399', 200: '#e879f9' };

export const EMA_PERIODS = [3, 5, 8, 13, 20, 21, 34, 50, 55, 100, 150, 200];
export const SMA_PERIODS = [20, 50, 100, 200];

const BLUE = '#3987e5';
const RED = '#e66767';
const ORANGE = '#f59e0b';
const GREEN = '#22c55e';

const defs: IndicatorDef[] = [
  {
    id: 'rsisma',
    label: 'RSI (14) + SMA 14',
    group: 'Stokastik-RSI-ATR',
    pane: true,
    color: '#a78bfa',
    build: (c) => {
      const r = rsiWithSma(C(c));
      return {
        lines: [
          { name: 'RSI', color: '#a78bfa', values: r.rsi },
          { name: 'SMA 14', color: '#e2b714', values: r.sma },
        ],
        levels: [30, 50, 70],
      };
    },
  },
  {
    id: 'htfstoch',
    label: 'Üst zaman dilimi Stokastik',
    group: 'Stokastik-RSI-ATR',
    pane: true,
    color: '#22d3ee',
    build: (c, ctx) => {
      const s = higherStoch(c, ctx.tf, ctx.higher);
      const tag = HIGHER_LABEL[HIGHER_TF[ctx.tf]];
      return {
        lines: [
          { name: `%K ${tag}`, color: '#22d3ee', values: s.k },
          { name: `%D ${tag}`, color: ORANGE, values: s.d },
        ],
        levels: [20, 80],
      };
    },
  },
  ...EMA_PERIODS.map<IndicatorDef>((p) => ({
    id: `ema${p}`,
    label: `EMA ${p}`,
    option: String(p),
    group: 'EMA',
    pane: false,
    color: EMA_COLORS[p],
    build: (c) => ({ lines: [{ name: `EMA ${p}`, color: EMA_COLORS[p], values: ema(C(c), p) }] }),
  })),
  ...SMA_PERIODS.map<IndicatorDef>((p) => ({
    id: `sma${p}`,
    label: `SMA ${p}`,
    option: String(p),
    group: 'SMA',
    pane: false,
    color: SMA_COLORS[p],
    build: (c) => ({ lines: [{ name: `SMA ${p}`, color: SMA_COLORS[p], values: sma(C(c), p) }] }),
  })),
  {
    id: 'bb',
    label: 'Bollinger (20, 2)',
    group: 'Fiyat üstü',
    pane: false,
    color: '#60a5fa',
    build: (c) => {
      const b = bollinger(C(c));
      return {
        lines: [
          { name: 'Üst', color: '#60a5fa', values: b.upper },
          { name: 'Orta', color: '#fbbf24', values: b.mid, style: 'dashed' },
          { name: 'Alt', color: '#60a5fa', values: b.lower },
        ],
      };
    },
  },
  {
    id: 'keltner',
    label: 'Keltner (20, 2)',
    group: 'Fiyat üstü',
    pane: false,
    color: '#2dd4bf',
    build: (c) => {
      const k = keltner(H(c), L(c), C(c));
      return {
        lines: [
          { name: 'Üst', color: '#2dd4bf', values: k.upper },
          { name: 'Orta', color: '#2dd4bf', values: k.mid, style: 'dashed' },
          { name: 'Alt', color: '#2dd4bf', values: k.lower },
        ],
      };
    },
  },
  {
    id: 'donchian',
    label: 'Donchian (20)',
    group: 'Fiyat üstü',
    pane: false,
    color: '#a78bfa',
    build: (c) => {
      const d = donchian(H(c), L(c));
      return {
        lines: [
          { name: 'Üst', color: '#a78bfa', values: d.upper },
          { name: 'Orta', color: '#a78bfa', values: d.mid, style: 'dashed' },
          { name: 'Alt', color: '#a78bfa', values: d.lower },
        ],
      };
    },
  },
  {
    id: 'supertrend',
    label: 'Supertrend (10, 3)',
    group: 'Fiyat üstü',
    pane: false,
    color: GREEN,
    build: (c) => {
      const s = supertrendLine(H(c), L(c), C(c));
      // Yön değişince çizgi kopsun diye yükseliş ve düşüş ayrı çizilir.
      return {
        lines: [
          { name: 'Yükseliş', color: GREEN, values: s.line.map((v, i) => (s.dir[i] === 1 ? v : NaN)) },
          { name: 'Düşüş', color: RED, values: s.line.map((v, i) => (s.dir[i] === -1 ? v : NaN)) },
        ],
      };
    },
  },
  {
    id: 'hasmooth',
    label: 'Heikin Ashi Smoothed (10, 10)',
    group: 'Fiyat üstü',
    pane: false,
    color: GREEN,
    build: (c) => {
      const s = haSmoothed(c.map((x) => x.o), H(c), L(c), C(c));
      const mid = s.o.map((o, i) => (o + s.c[i]) / 2);
      return {
        lines: [
          { name: 'Yeşil', color: GREEN, values: mid.map((v, i) => (s.dir[i] === 1 ? v : NaN)), style: 'dots' },
          { name: 'Kırmızı', color: RED, values: mid.map((v, i) => (s.dir[i] === -1 ? v : NaN)), style: 'dots' },
        ],
      };
    },
  },
  {
    id: 'supertrend4',
    label: 'Supertrend (10, 4)',
    group: 'Fiyat üstü',
    pane: false,
    color: GREEN,
    build: (c) => {
      const s = supertrendLine(H(c), L(c), C(c), 10, 4);
      return {
        lines: [
          { name: 'Yükseliş', color: GREEN, values: s.line.map((v, i) => (s.dir[i] === 1 ? v : NaN)) },
          { name: 'Düşüş', color: RED, values: s.line.map((v, i) => (s.dir[i] === -1 ? v : NaN)) },
        ],
      };
    },
  },
  {
    id: 'twinrange',
    label: 'Twin Range Filter (12/1, 4/2)',
    group: 'Fiyat üstü',
    pane: false,
    color: '#a78bfa',
    build: (c) => ({ lines: [{ name: 'Filtre', color: '#a78bfa', values: twinRangeFilter(C(c), 12, 1, 4, 2).filt }] }),
  },
  {
    id: 'psar',
    label: 'Parabolic SAR',
    group: 'Fiyat üstü',
    pane: false,
    color: '#fbbf24',
    build: (c) => ({ lines: [{ name: 'SAR', color: '#fbbf24', values: psar(H(c), L(c)), style: 'dots' }] }),
  },
  {
    id: 'ichimoku',
    label: 'Ichimoku (9, 26, 52)',
    group: 'Fiyat üstü',
    pane: false,
    color: '#f472b6',
    build: (c) => {
      const k = ichimoku(H(c), L(c));
      // Öncü açıklıklar 26 mum ileri, gecikmeli çizgi 26 mum geri kaydırılır.
      const shift = 25;
      const ahead = (v: number[]) => [...new Array<number>(shift).fill(NaN), ...v];
      const close = C(c);
      return {
        lines: [
          { name: 'Tenkan', color: BLUE, values: k.tenkan },
          { name: 'Kijun', color: RED, values: k.kijun },
          { name: 'Span A', color: 'rgba(34,197,94,.7)', values: ahead(k.spanA) },
          { name: 'Span B', color: 'rgba(240,82,82,.7)', values: ahead(k.spanB) },
          { name: 'Chikou', color: '#a3a3a3', values: close.map((_, i) => close[i + shift] ?? NaN), style: 'dashed' },
        ],
      };
    },
  },
  {
    id: 'rsi',
    label: 'RSI (14)',
    group: 'Alt panel',
    pane: true,
    color: '#a78bfa',
    build: (c) => ({ lines: [{ name: 'RSI', color: '#a78bfa', values: rsi(C(c), 14) }], levels: [30, 50, 70] }),
  },
  {
    id: 'macd',
    label: 'MACD (12, 26, 9)',
    group: 'Alt panel',
    pane: true,
    color: BLUE,
    build: (c) => {
      const m = macd(C(c));
      return {
        lines: [
          { name: 'MACD', color: BLUE, values: m.line },
          { name: 'Sinyal', color: RED, values: m.signal },
        ],
        histogram: m.line.map((v, i) => v - m.signal[i]),
        levels: [0],
      };
    },
  },
  {
    id: 'stoch',
    label: 'Stokastik (14, 3, 3)',
    group: 'Alt panel',
    pane: true,
    color: BLUE,
    build: (c) => {
      const s = stochOsc(H(c), L(c), C(c));
      return {
        lines: [
          { name: '%K', color: BLUE, values: s.k },
          { name: '%D', color: ORANGE, values: s.d },
        ],
        levels: [20, 80],
      };
    },
  },
  {
    id: 'stoch1',
    label: 'Stokastik (14, 1, 3)',
    group: 'Alt panel',
    pane: true,
    color: BLUE,
    build: (c) => {
      const s = stochOsc(H(c), L(c), C(c), 14, 1, 3);
      return {
        lines: [
          { name: '%K', color: BLUE, values: s.k },
          { name: '%D', color: ORANGE, values: s.d },
        ],
        levels: [20, 80],
      };
    },
  },
  {
    id: 'volume',
    label: 'Hacim',
    group: 'Alt panel',
    pane: true,
    color: '#94a3b8',
    build: (c) => ({
      lines: [{ name: 'Ort. 20', color: ORANGE, values: sma(c.map((x) => x.v ?? 0), 20) }],
      histogram: c.map((x) => x.v ?? NaN),
    }),
  },
  {
    id: 'stochrsi8',
    label: 'Stokastik RSI (3, 3, 8, 10)',
    group: 'Alt panel',
    pane: true,
    color: '#22d3ee',
    build: (c) => {
      const s = stochRsi(C(c), 8, 10, 3, 3);
      return {
        lines: [
          { name: '%K', color: '#22d3ee', values: s.k },
          { name: '%D', color: ORANGE, values: s.d },
        ],
        levels: [0, 100],
      };
    },
  },
  {
    id: 'stochrsi',
    label: 'Stokastik RSI',
    group: 'Alt panel',
    pane: true,
    color: '#22d3ee',
    build: (c) => {
      const s = stochRsi(C(c));
      return {
        lines: [
          { name: '%K', color: '#22d3ee', values: s.k },
          { name: '%D', color: ORANGE, values: s.d },
        ],
        levels: [20, 80],
      };
    },
  },
  {
    id: 'cci',
    label: 'CCI (20)',
    group: 'Alt panel',
    pane: true,
    color: '#2dd4bf',
    build: (c) => ({ lines: [{ name: 'CCI', color: '#2dd4bf', values: cci(H(c), L(c), C(c)) }], levels: [-100, 0, 100] }),
  },
  {
    id: 'willr',
    label: 'Williams %R (14)',
    group: 'Alt panel',
    pane: true,
    color: '#f472b6',
    build: (c) => ({ lines: [{ name: '%R', color: '#f472b6', values: williamsR(H(c), L(c), C(c)) }], levels: [-80, -20] }),
  },
  {
    id: 'adx',
    label: 'ADX / DMI (14)',
    group: 'Alt panel',
    pane: true,
    color: '#fbbf24',
    build: (c) => {
      const a = adx(H(c), L(c), C(c));
      return {
        lines: [
          { name: 'ADX', color: '#fbbf24', values: a.adx },
          { name: '+DI', color: GREEN, values: a.plus },
          { name: '−DI', color: RED, values: a.minus },
        ],
        levels: [25],
      };
    },
  },
  {
    id: 'atr',
    label: 'ATR (14)',
    group: 'Stokastik-RSI-ATR',
    pane: true,
    color: '#94a3b8',
    build: (c) => ({ lines: [{ name: 'ATR', color: '#94a3b8', values: atr(H(c), L(c), C(c), 14) }] }),
  },
  {
    id: 'ao',
    label: 'Awesome Oscillator',
    group: 'Alt panel',
    pane: true,
    color: GREEN,
    build: (c) => ({ lines: [], histogram: awesome(H(c), L(c)), levels: [0] }),
  },
  {
    id: 'sqzmom',
    label: 'Squeeze Momentum',
    group: 'Alt panel',
    pane: true,
    color: '#22c55e',
    build: (c) => {
      const s = squeezeMomentum(H(c), L(c), C(c));
      // Sıkışma sürerken sıfır çizgisinde gri noktalar (TTM Squeeze gösterimi).
      return {
        lines: [{ name: 'Sıkışma', color: '#94a3b8', values: s.sqz.map((q) => (q ? 0 : NaN)), style: 'dots' }],
        histogram: s.mom,
        levels: [0],
      };
    },
  },
  {
    id: 'roc',
    label: 'ROC (10)',
    group: 'Alt panel',
    pane: true,
    color: '#60a5fa',
    build: (c) => ({ lines: [{ name: 'ROC', color: '#60a5fa', values: roc(C(c), 10) }], levels: [0] }),
  },
];

export const INDICATORS: IndicatorDef[] = defs;
export const INDICATOR_BY_ID = new Map(defs.map((d) => [d.id, d]));
export const INDICATOR_GROUPS = ['Stokastik-RSI-ATR', 'EMA', 'SMA', 'Fiyat üstü', 'Alt panel'];
export const STRATEGY_KIT = ['rsisma', 'htfstoch', 'atr'];

export const DEFAULT_INDICATORS = ['ema21', 'ema55', 'ema200'];

export function buildPlots(ids: string[], candles: Candle[], ctx: PlotContext): { overlays: Plot[]; panes: Plot[] } {
  const overlays: Plot[] = [];
  const panes: Plot[] = [];
  // Seçim listesindeki sıra korunur (EMA'lar kısa → uzun).
  for (const d of defs) {
    if (!ids.includes(d.id)) continue;
    const plot = { id: d.id, label: d.label, ...d.build(candles, ctx) };
    (d.pane ? panes : overlays).push(plot);
  }
  return { overlays, panes };
}

const KEY = 'mechi.indicators';

export function loadIndicatorIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const ids = JSON.parse(raw) as unknown;
      if (Array.isArray(ids)) return ids.filter((x): x is string => typeof x === 'string' && INDICATOR_BY_ID.has(x));
    }
  } catch {
    // Depolama kapalı olabilir; varsayılana dön.
  }
  return DEFAULT_INDICATORS;
}

export function saveIndicatorIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Kaydedilemezse yalnızca bu oturumda geçerli olur.
  }
}
