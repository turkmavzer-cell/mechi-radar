import { aggregate, TF_SECONDS } from './candles';
import type { Candle, Timeframe } from './types';

/** Resmi olmayan Yahoo Finance uç noktaları. Anahtar gerektirmez. */
const HOSTS = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com'];

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export interface ChartMeta {
  symbol: string;
  instrumentType?: string;
  gmtoffset?: number;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  shortName?: string;
  longName?: string;
  currency?: string;
  currentTradingPeriod?: { regular?: { start: number; end: number } };
}

interface ChartResponse {
  chart: {
    result?: Array<{
      meta: ChartMeta;
      timestamp?: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
        }>;
      };
    }>;
    error?: { description?: string } | null;
  };
}

async function getJson<T>(fetchFn: FetchFn, path: string): Promise<T> {
  let lastErr: unknown;
  for (const host of HOSTS) {
    try {
      const res = await fetchFn(host + path, {
        headers: { 'User-Agent': 'Mozilla/5.0 (MechiRadar)', Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function chartPath(symbol: string, interval: string, range: string): string {
  return `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
}

export async function fetchChart(
  fetchFn: FetchFn,
  symbol: string,
  interval: '5m' | '60m' | '1d',
  range: string,
): Promise<{ meta: ChartMeta; candles: Candle[] }> {
  const data = await getJson<ChartResponse>(fetchFn, chartPath(symbol, interval, range));
  const r = data.chart.result?.[0];
  if (!r) throw new Error(data.chart.error?.description || `${symbol}: veri yok`);
  const q = r.indicators.quote[0];
  const ts = r.timestamp ?? [];
  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i];
    if (o == null || h == null || l == null || c == null) continue;
    candles.push({ t: ts[i], o, h, l, c });
  }
  return { meta: r.meta, candles };
}

const SESSION_TYPES = new Set(['EQUITY', 'INDEX', 'ETF', 'MUTUALFUND']);

export function isSessionMarket(meta: ChartMeta): boolean {
  return SESSION_TYPES.has((meta.instrumentType ?? '').toUpperCase());
}

function marketOpen(meta: ChartMeta, now: number): boolean {
  const reg = meta.currentTradingPeriod?.regular;
  if (!reg) return true;
  return now >= reg.start && now < reg.end;
}

/** Son mum henüz kapanmadıysa true. */
export function lastIsOpen(candles: Candle[], tf: Timeframe, meta: ChartMeta, now: number): boolean {
  const last = candles[candles.length - 1];
  if (!last) return false;
  const session = isSessionMarket(meta);
  if (session) {
    if (!marketOpen(meta, now)) return false;
    if (tf === '1d') {
      const reg = meta.currentTradingPeriod?.regular;
      return !reg || last.t >= reg.start - 43200;
    }
  }
  return now < last.t + TF_SECONDS[tf];
}

export interface SeriesSet {
  meta: ChartMeta;
  /** Tüm mumlar (son mum oluşmakta olabilir). */
  candles: Partial<Record<Timeframe, Candle[]>>;
  /** Son mum açıksa true. */
  lastOpen: Partial<Record<Timeframe, boolean>>;
}

const SOURCE: Record<Timeframe, '5m' | '60m' | '1d'> = {
  '15m': '5m',
  '20m': '5m',
  '30m': '5m',
  '1h': '60m',
  '2h': '60m',
  '4h': '60m',
  '1d': '1d',
};
const RANGE: Record<'5m' | '60m' | '1d', string> = { '5m': '30d', '60m': '1y', '1d': '5y' };
/** Telefonda hızlı özet için daha kısa geçmiş (EMA 200 için yine yeterli mum kalır). */
const RANGE_LIGHT: Record<'5m' | '60m' | '1d', string> = { '5m': '10d', '60m': '6mo', '1d': '2y' };

/** loadSeries'in ilk denemede isteyeceği adresler (toplu/paralel önceden indirmek için). */
export function chartUrls(symbol: string, tfs: Timeframe[]): string[] {
  const sources = [...new Set(tfs.map((tf) => SOURCE[tf]))];
  return sources.map((src) => HOSTS[0] + chartPath(symbol, src, RANGE[src]));
}

/** İstenen zaman dilimleri için mumları indirir ve birleştirir. */
export async function loadSeries(
  fetchFn: FetchFn,
  symbol: string,
  tfs: Timeframe[],
  now = Math.floor(Date.now() / 1000),
  light = false,
): Promise<SeriesSet> {
  const sources = [...new Set(tfs.map((tf) => SOURCE[tf]))];
  const ranges = light ? RANGE_LIGHT : RANGE;
  const fetched = await Promise.all(sources.map((src) => fetchChart(fetchFn, symbol, src, ranges[src])));
  const raw = new Map<string, { meta: ChartMeta; candles: Candle[] }>(sources.map((src, i) => [src, fetched[i]]));
  const meta = raw.values().next().value!.meta;
  const session = isSessionMarket(meta);
  const set: SeriesSet = { meta, candles: {}, lastOpen: {} };
  for (const tf of tfs) {
    const src = raw.get(SOURCE[tf])!;
    const cs = tf === '1d' ? src.candles : aggregate(src.candles, TF_SECONDS[tf], session, meta.gmtoffset ?? 0);
    set.candles[tf] = cs;
    set.lastOpen[tf] = lastIsOpen(cs, tf, src.meta, now);
  }
  return set;
}

export interface SearchHit {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export async function searchSymbols(fetchFn: FetchFn, query: string): Promise<SearchHit[]> {
  const path = `/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0&listsCount=0`;
  const data = await getJson<{
    quotes?: Array<{ symbol: string; shortname?: string; longname?: string; exchDisp?: string; typeDisp?: string; quoteType?: string }>;
  }>(fetchFn, path);
  return (data.quotes ?? [])
    .filter((q) => q.symbol)
    .map((q) => ({
      symbol: q.symbol,
      name: q.longname || q.shortname || q.symbol,
      exchange: q.exchDisp ?? '',
      type: q.typeDisp ?? q.quoteType ?? '',
    }));
}
