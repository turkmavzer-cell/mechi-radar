import { TF_SECONDS } from '../src/core/candles';
import { higherSeries, withHigher } from '../src/core/sratr';
import { analyze } from '../src/core/strategies';
import { TIMEFRAMES } from '../src/core/types';
import type { RadarConfig, RadarState, ScanResult, SignalEvent, SymbolState, Timeframe } from '../src/core/types';
import { loadSeries, type FetchFn } from '../src/core/yahoo';
import { DEFAULT_CONFIG } from './defaults';

const MAX_SIGNALS = 300;
const SCAN_INTERVAL = 55 * 60;

export interface AlertItem {
  event: SignalEvent;
  name: string;
}

/** Verinin nerede tutulduğundan (dosya, Firestore) bağımsız depolama arayüzü. */
export interface RadarStore {
  load(): Promise<{ config: RadarConfig | null; state: RadarState | null; signals: SignalEvent[] }>;
  saveConfig(config: RadarConfig): Promise<void>;
  save(data: { state: RadarState; signals: SignalEvent[]; scan?: ScanResult }): Promise<void>;
}

export interface RunOptions {
  store: RadarStore;
  fetchFn: FetchFn;
  notify: (items: AlertItem[]) => Promise<unknown>;
  now?: number;
  delayMs?: number;
}

export interface RunResult {
  newEvents: SignalEvent[];
  alerted: AlertItem[];
  scanned: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Mum kapanışından bu yana çok zaman geçmişse (ör. uzun kesinti) bildirim gönderilmez. */
function isFresh(e: SignalEvent, now: number): boolean {
  const closeAt = e.time + TF_SECONDS[e.tf];
  return now - closeAt < Math.max(2 * 3600, 3 * TF_SECONDS[e.tf]);
}

function closedCandles<T>(candles: T[] | undefined, lastOpen: boolean | undefined): T[] {
  if (!candles) return [];
  return lastOpen ? candles.slice(0, -1) : candles;
}

export async function runRadar(opts: RunOptions): Promise<RunResult> {
  const { store, fetchFn, notify } = opts;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const delay = opts.delayMs ?? 400;

  const loaded = await store.load();
  let config = loaded.config;
  if (!config) {
    config = DEFAULT_CONFIG;
    await store.saveConfig(config);
  }
  const state: RadarState = loaded.state ?? { updatedAt: '', symbols: {}, lastSeen: {} };

  const newEvents: SignalEvent[] = [];
  const alerted: AlertItem[] = [];
  const symbols: Record<string, SymbolState> = {};

  for (const item of config.watchlist) {
    const sym: SymbolState = { symbol: item.symbol, name: item.name, price: null, changePct: null, tf: {} };
    symbols[item.symbol] = sym;
    try {
      const set = await loadSeries(fetchFn, item.symbol, TIMEFRAMES, now);
      const daily = set.candles['1d'] ?? [];
      sym.price = set.meta.regularMarketPrice ?? daily[daily.length - 1]?.c ?? null;
      const ref = daily[daily.length - 2]?.c;
      if (sym.price != null && ref) sym.changePct = ((sym.price - ref) / ref) * 100;

      for (const tf of TIMEFRAMES) {
        const candles = closedCandles(set.candles[tf], set.lastOpen[tf]);
        const a = analyze(item.symbol, tf, candles, higherSeries(tf, set.candles));
        if (!a.status) continue;
        sym.tf[tf] = a.status;
        const key = `${item.symbol}|${tf}`;
        const seen = state.lastSeen[key];
        state.lastSeen[key] = a.status.time;
        // İlk kez görülen sembolde geçmiş sinyaller bildirilmez.
        if (seen === undefined) continue;
        for (const e of a.events) {
          if (e.time <= seen) continue;
          newEvents.push(e);
          if (item.alerts.includes(tf) && isFresh(e, now)) alerted.push({ event: e, name: item.name });
        }
      }
    } catch (err) {
      const prev = state.symbols[item.symbol];
      sym.error = err instanceof Error ? err.message : String(err);
      if (prev) {
        sym.price = prev.price;
        sym.changePct = prev.changePct;
        sym.tf = prev.tf;
      }
      console.warn(`${item.symbol}: ${sym.error}`);
    }
    if (delay) await sleep(delay);
  }

  state.symbols = symbols;
  state.updatedAt = new Date(now * 1000).toISOString();
  const signals = [...newEvents.sort((a, b) => b.time - a.time), ...loaded.signals].slice(0, MAX_SIGNALS);

  // Tarayıcı saatte bir çalışır, bildirim göndermez.
  let scan: ScanResult | undefined;
  if (config.scanner.symbols.length && (!state.scanAt || now - state.scanAt >= SCAN_INTERVAL)) {
    scan = { name: config.scanner.name, updatedAt: state.updatedAt, rows: [] };
    const tfs: Timeframe[] = config.scanner.timeframes.length ? config.scanner.timeframes : ['4h', '1d'];
    for (const symbol of config.scanner.symbols) {
      try {
        const set = await loadSeries(fetchFn, symbol, withHigher(tfs), now);
        const row: ScanResult['rows'][number] = { symbol, tf: {} };
        for (const tf of tfs) {
          const a = analyze(symbol, tf, closedCandles(set.candles[tf], set.lastOpen[tf]), higherSeries(tf, set.candles));
          if (a.status) row.tf[tf] = a.status;
        }
        scan.rows.push(row);
      } catch (err) {
        scan.rows.push({ symbol, tf: {}, error: err instanceof Error ? err.message : String(err) });
      }
      if (delay) await sleep(delay);
    }
    state.scanAt = now;
  }

  await store.save({ state, signals, scan });

  if (alerted.length) {
    try {
      await notify(alerted);
    } catch (err) {
      console.error('Bildirim gönderilemedi:', err);
    }
  }
  console.log(`Bitti: ${newEvents.length} yeni sinyal, ${alerted.length} bildirim, tarama: ${scan ? 'evet' : 'hayır'}`);
  return { newEvents, alerted, scanned: !!scan };
}
