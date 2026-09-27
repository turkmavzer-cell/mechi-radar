import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import type { RadarConfig, RadarState, ScanResult, SignalEvent, Timeframe, WatchItem } from '../../core/types';
import { fb } from './firebase';

export interface RadarData {
  config: RadarConfig | null;
  state: RadarState | null;
  signals: SignalEvent[];
  scan: ScanResult | null;
}

const EMPTY: RadarData = { config: null, state: null, signals: [], scan: null };

/** Firestore'daki radar belgelerini canlı dinler (sunucu yazdıkça ekran güncellenir). */
export function useRadarData(enabled: boolean) {
  const [data, setData] = useState<RadarData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !fb) {
      setData(EMPTY);
      return;
    }
    setLoading(true);
    setError(null);
    const db = fb.db;
    const onErr = (err: Error) => {
      setError(`Veri alınamadı: ${err.message}`);
      setLoading(false);
    };
    const subs = [
      onSnapshot(doc(db, 'radar', 'config'), (s) => setData((d) => ({ ...d, config: (s.data() as RadarConfig) ?? null })), onErr),
      onSnapshot(
        doc(db, 'radar', 'state'),
        (s) => {
          setData((d) => ({ ...d, state: (s.data() as RadarState) ?? null }));
          setLoading(false);
        },
        onErr,
      ),
      onSnapshot(doc(db, 'radar', 'signals'), (s) => setData((d) => ({ ...d, signals: (s.get('items') as SignalEvent[]) ?? [] })), onErr),
      onSnapshot(doc(db, 'radar', 'scan'), (s) => setData((d) => ({ ...d, scan: (s.data() as ScanResult) ?? null })), onErr),
    ];
    return () => subs.forEach((u) => u());
  }, [enabled]);

  const editConfig = useCallback(async (mutate: (c: RadarConfig) => RadarConfig) => {
    if (!fb) throw new Error('Firebase ayarlanmamış.');
    const ref = doc(fb.db, 'radar', 'config');
    await runTransaction(fb.db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Sunucu henüz ilk kontrolü yapmadı; birkaç dakika sonra tekrar dene.');
      tx.set(ref, mutate(snap.data() as RadarConfig));
    });
  }, []);

  const addWatch = (item: WatchItem) =>
    editConfig((c) => (c.watchlist.some((w) => w.symbol === item.symbol) ? c : { ...c, watchlist: [...c.watchlist, item] }));

  const removeWatch = (symbol: string) => editConfig((c) => ({ ...c, watchlist: c.watchlist.filter((w) => w.symbol !== symbol) }));

  const setAlerts = (symbol: string, alerts: Timeframe[]) =>
    editConfig((c) => ({ ...c, watchlist: c.watchlist.map((w) => (w.symbol === symbol ? { ...w, alerts } : w)) }));

  return { data, loading, error, addWatch, removeWatch, setAlerts };
}

export type RadarApi = ReturnType<typeof useRadarData>;
