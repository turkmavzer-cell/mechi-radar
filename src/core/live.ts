import { higherSeries, withHigher } from './sratr';
import { analyze } from './strategies';
import type { SignalEvent, TfStatus, Timeframe } from './types';
import { loadSeries, type FetchFn } from './yahoo';

/** Radar ve Tarayıcı ekranlarının telefonda canlı hesapladığı özet. */
export interface LiveSummary {
  symbol: string;
  price: number | null;
  changePct: number | null;
  tf: Partial<Record<Timeframe, TfStatus>>;
  events: SignalEvent[];
  updatedAt: number;
}

export async function summarize(
  fetchFn: FetchFn,
  symbol: string,
  tfs: Timeframe[],
  now = Math.floor(Date.now() / 1000),
): Promise<LiveSummary> {
  const all: Timeframe[] = tfs.includes('1d') ? tfs : [...tfs, '1d'];
  const set = await loadSeries(fetchFn, symbol, withHigher(all), now, true);
  const daily = set.candles['1d'] ?? [];
  const price = set.meta.regularMarketPrice ?? daily[daily.length - 1]?.c ?? null;
  const ref = daily[daily.length - 2]?.c;
  const out: LiveSummary = {
    symbol,
    price,
    changePct: price != null && ref ? ((price - ref) / ref) * 100 : null,
    tf: {},
    events: [],
    updatedAt: now,
  };
  for (const tf of tfs) {
    const cs = set.candles[tf] ?? [];
    const closed = set.lastOpen[tf] ? cs.slice(0, -1) : cs;
    const a = analyze(symbol, tf, closed, higherSeries(tf, set.candles));
    if (a.status) out.tf[tf] = a.status;
    out.events.push(...a.events);
  }
  return out;
}

/** Görevleri en fazla `limit` tanesi aynı anda çalışacak şekilde yürütür. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  onEach?: (done: number) => void,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: 'fulfilled', value: await fn(items[i], i) };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
      onEach?.(++done);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
