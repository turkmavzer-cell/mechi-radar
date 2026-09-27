import { Capacitor, CapacitorHttp } from '@capacitor/core';
import type { FetchFn } from '../../core/yahoo';

/**
 * Yahoo istekleri telefonda yerel HTTP ile yapılır (tarayıcı CORS kısıtına takılmaz).
 * Genel fetch yamalanmaz; Firebase'in canlı bağlantısı normal fetch/XHR ile çalışmalı.
 */
export const yahooFetch: FetchFn = async (url, init) => {
  if (!Capacitor.isNativePlatform()) return fetch(url, init);
  const res = await CapacitorHttp.get({
    url,
    headers: (init?.headers as Record<string, string> | undefined) ?? {},
    responseType: 'json',
  });
  const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  return new Response(body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
};
