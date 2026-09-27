import { useCallback, useEffect, useState } from 'react';
import type { RadarConfig, RadarState, ScanResult, SignalEvent, Timeframe, WatchItem } from '../../core/types';
import { readFile, updateFile } from './github';
import { loadCache, saveCache, type AppSettings } from './storage';

export interface RadarData {
  config: RadarConfig | null;
  state: RadarState | null;
  signals: SignalEvent[];
  scan: ScanResult | null;
}

const EMPTY: RadarData = { config: null, state: null, signals: [], scan: null };

export function useRadarData(settings: AppSettings | null) {
  const [data, setData] = useState<RadarData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCache<RadarData>('radar').then((c) => c && setData((d) => (d.state ? d : c)));
  }, []);

  const refresh = useCallback(async () => {
    if (!settings) return;
    setLoading(true);
    setError(null);
    try {
      const [config, state, signals, scan] = await Promise.all([
        readFile<RadarConfig>(settings, 'config.json'),
        readFile<RadarState>(settings, 'state.json'),
        readFile<SignalEvent[]>(settings, 'signals.json'),
        readFile<ScanResult>(settings, 'scan.json'),
      ]);
      const next: RadarData = {
        config: config?.data ?? null,
        state: state?.data ?? null,
        signals: signals?.data ?? [],
        scan: scan?.data ?? null,
      };
      setData(next);
      await saveCache('radar', next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  const editConfig = useCallback(
    async (mutate: (c: RadarConfig) => RadarConfig, message: string) => {
      if (!settings) return;
      const next = await updateFile<RadarConfig>(settings, 'config.json', mutate, message);
      setData((d) => {
        const updated = { ...d, config: next };
        void saveCache('radar', updated);
        return updated;
      });
    },
    [settings],
  );

  const addWatch = (item: WatchItem) =>
    editConfig(
      (c) => (c.watchlist.some((w) => w.symbol === item.symbol) ? c : { ...c, watchlist: [...c.watchlist, item] }),
      `İzleme listesine eklendi: ${item.symbol}`,
    );

  const removeWatch = (symbol: string) =>
    editConfig((c) => ({ ...c, watchlist: c.watchlist.filter((w) => w.symbol !== symbol) }), `İzleme listesinden çıkarıldı: ${symbol}`);

  const setAlerts = (symbol: string, alerts: Timeframe[]) =>
    editConfig(
      (c) => ({ ...c, watchlist: c.watchlist.map((w) => (w.symbol === symbol ? { ...w, alerts } : w)) }),
      `Mail bildirimleri: ${symbol} → ${alerts.join(', ') || 'kapalı'}`,
    );

  return { data, loading, error, refresh, addWatch, removeWatch, setAlerts };
}

export type RadarApi = ReturnType<typeof useRadarData>;
