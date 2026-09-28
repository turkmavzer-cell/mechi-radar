import { aggregate, TF_SECONDS } from '../src/core/candles';
import { TIMEFRAMES, type Candle, type Timeframe } from '../src/core/types';
import { fetchChart, isSessionMarket, lastIsOpen } from '../src/core/yahoo';

export const SYMBOLS = [
  'EURUSD=X', 'USDJPY=X', 'GBPUSD=X', '^GSPC', '^NDX', '^GDAXI', 'NIY=F', 'XU100.IS', 'GC=F',
  'CL=F', 'AAPL', 'MSFT', 'NVDA', 'THYAO.IS', 'GARAN.IS', 'ASELS.IS', 'BTC-USD', 'ETH-USD',
];
const SOURCE: Record<Timeframe, { interval: '5m' | '60m' | '1d'; range: string }> = {
  '15m': { interval: '5m', range: '60d' },
  '20m': { interval: '5m', range: '60d' },
  '30m': { interval: '5m', range: '60d' },
  '1h': { interval: '60m', range: '730d' },
  '2h': { interval: '60m', range: '730d' },
  '4h': { interval: '60m', range: '730d' },
  '1d': { interval: '1d', range: '10y' },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Bir sembolün tüm zaman dilimlerindeki kapanmış mumları (Yahoo'nun izin verdiği en uzun geçmiş). */
export async function loadAll(symbol: string, now = Math.floor(Date.now() / 1000)): Promise<Partial<Record<Timeframe, Candle[]>>> {
  const raw = new Map<string, Awaited<ReturnType<typeof fetchChart>>>();
  for (const src of new Set(Object.values(SOURCE).map((x) => `${x.interval}|${x.range}`))) {
    const [interval, range] = src.split('|');
    try {
      raw.set(src, await fetchChart(fetch, symbol, interval as '5m' | '60m' | '1d', range));
    } catch (err) {
      console.warn(`${symbol} ${interval}: ${err}`);
    }
    await sleep(500);
  }
  const all: Partial<Record<Timeframe, Candle[]>> = {};
  for (const tf of TIMEFRAMES) {
    const src = raw.get(`${SOURCE[tf].interval}|${SOURCE[tf].range}`);
    if (!src) continue;
    const session = isSessionMarket(src.meta);
    let cs = tf === '1d' ? src.candles : aggregate(src.candles, TF_SECONDS[tf], session, src.meta.gmtoffset ?? 0);
    if (lastIsOpen(cs, tf, src.meta, now)) cs = cs.slice(0, -1);
    all[tf] = cs;
  }
  return all;
}
