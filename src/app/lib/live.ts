import { useCallback, useEffect, useRef, useState } from 'react';
import { mapLimit, summarize, type LiveSummary } from '../../core/live';
import type { Timeframe } from '../../core/types';
import { readCache, writeCache } from './cache';
import { yahooFetch } from './http';

export interface LiveState {
  data: Record<string, LiveSummary>;
  errors: Record<string, string>;
  loading: boolean;
  progress: { done: number; total: number };
  updatedAt: number | null;
}

/**
 * Sembollerin özetini telefonda canlı hesaplar. `autoMs` verilirse o aralıkla yeniler.
 * Son sonuç önbelleğe yazılır; uygulama açılınca önce o gösterilir.
 */
export function useLive(cacheKey: string, symbols: string[], tfs: Timeframe[], autoMs?: number, auto = true) {
  const [state, setState] = useState<LiveState>(() => {
    const c = readCache<Pick<LiveState, 'data' | 'updatedAt'>>(cacheKey);
    return { data: c?.data ?? {}, errors: {}, loading: false, progress: { done: 0, total: 0 }, updatedAt: c?.updatedAt ?? null };
  });
  const running = useRef(false);
  const key = symbols.join(',') + '|' + tfs.join(',');

  const refresh = useCallback(async () => {
    if (running.current || !symbols.length) return;
    running.current = true;
    setState((s) => ({ ...s, loading: true, progress: { done: 0, total: symbols.length } }));
    const results = await mapLimit(
      symbols,
      4,
      (sym) => summarize(yahooFetch, sym, tfs),
      (done) => setState((s) => ({ ...s, progress: { done, total: symbols.length } })),
    );
    const data: Record<string, LiveSummary> = {};
    const errors: Record<string, string> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') data[symbols[i]] = r.value;
      else errors[symbols[i]] = r.reason instanceof Error ? r.reason.message : String(r.reason);
    });
    setState((s) => {
      // Hata alınan sembolde son başarılı sonuç korunur.
      const merged = { ...s.data, ...data };
      for (const k of Object.keys(merged)) if (!symbols.includes(k)) delete merged[k];
      const updatedAt = Date.now();
      writeCache(cacheKey, { data: merged, updatedAt });
      return { data: merged, errors, loading: false, progress: { done: symbols.length, total: symbols.length }, updatedAt };
    });
    running.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, cacheKey]);

  useEffect(() => {
    if (!auto) return;
    refresh();
    if (!autoMs) return;
    const id = setInterval(refresh, autoMs);
    return () => clearInterval(id);
  }, [refresh, autoMs, auto]);

  return { ...state, refresh };
}
