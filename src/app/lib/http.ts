import type { FetchFn } from '../../core/yahoo';

// Telefonda CapacitorHttp genel fetch'i yerel HTTP'ye yönlendirir (CORS kısıtı yok).
export const yahooFetch: FetchFn = (url, init) => fetch(url, init);
