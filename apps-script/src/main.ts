// Mechi Radar zamanlanmış kontrolü — Google Apps Script'te çalışır (kart gerektirmez).
// Her 5 dakikada "tick" tetiklenir: Yahoo'dan mumları toplu indirir, sinyalleri hesaplar,
// sonucu Firestore'a yazar ve bildirimi açık sinyalleri FCM ile telefona gönderir.
import { chartUrls, type FetchFn } from '../../src/core/yahoo';
import { TIMEFRAMES } from '../../src/core/types';
import type { RadarConfig, RadarState, ScanResult, SignalEvent, Timeframe } from '../../src/core/types';
import { DEFAULT_CONFIG } from '../../server/defaults';
import { buildPushMessages, type PushMessage } from '../../server/notify';
import { runRadar, type RadarStore } from '../../server/radar';
import { fromFields, toFields, type FsValue } from './firestore';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const UrlFetchApp: any;
declare const ScriptApp: any;
declare const HtmlService: any;
declare const PropertiesService: any;
declare const LockService: any;

const PROJECT = 'banded-elevator-478108-q9';
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const SCAN_INTERVAL = 55 * 60;
const UA = 'Mozilla/5.0 (MechiRadar)';

function headers(): Record<string, string> {
  // Kullanıcının kendi yetkisiyle çağrılır; kota ve API ayarları Firebase projesinden alınır.
  return { Authorization: `Bearer ${ScriptApp.getOAuthToken()}`, 'x-goog-user-project': PROJECT };
}

function api(method: string, url: string, body?: unknown): { code: number; json: any } {
  const res = UrlFetchApp.fetch(url, {
    method,
    headers: headers(),
    contentType: 'application/json',
    payload: body === undefined ? undefined : JSON.stringify(body),
    muteHttpExceptions: true,
  });
  const text = res.getContentText();
  return { code: res.getResponseCode(), json: text ? JSON.parse(text) : null };
}

function getDoc<T>(path: string): T | null {
  const r = api('get', `${FS}/${path}`);
  if (r.code === 404) return null;
  if (r.code >= 300) throw new Error(`Firestore okuma ${path}: ${r.code} ${JSON.stringify(r.json).slice(0, 200)}`);
  return fromFields(r.json.fields ?? {}) as T;
}

function setDoc(path: string, data: Record<string, unknown>): void {
  const r = api('patch', `${FS}/${path}`, { fields: toFields(data) });
  if (r.code >= 300) throw new Error(`Firestore yazma ${path}: ${r.code} ${JSON.stringify(r.json).slice(0, 200)}`);
}

function deleteDoc(path: string): void {
  api('delete', `${FS}/${path}`);
}

function listDevices(): { token: string; uid: string }[] {
  const r = api('get', `${FS}/devices?pageSize=50`);
  if (r.code >= 300) return [];
  return ((r.json?.documents ?? []) as { name: string; fields: Record<string, FsValue> }[]).map((d) => ({
    token: decodeURIComponent(d.name.split('/').pop()!),
    uid: String(fromFields(d.fields ?? {}).uid ?? ''),
  }));
}

function sendPush(messages: PushMessage[], ownerUid: string | null): number {
  const devices = listDevices().filter((d) => !ownerUid || d.uid === ownerUid);
  let sent = 0;
  for (const m of messages) {
    for (const d of devices) {
      const r = api('post', `https://fcm.googleapis.com/v1/projects/${PROJECT}/messages:send`, {
        message: {
          token: d.token,
          notification: { title: m.title, body: m.body },
          data: m.data,
          android: { priority: 'HIGH', notification: { channel_id: 'signals', sound: 'default' } },
        },
      });
      if (r.code < 300) sent++;
      else {
        const status = r.json?.error?.status;
        console.warn(`FCM ${r.code} ${status}`);
        // Uygulama silinmiş veya token değişmişse cihaz kaydını temizle.
        if (r.code === 404 || status === 'UNREGISTERED' || status === 'INVALID_ARGUMENT') deleteDoc(`devices/${encodeURIComponent(d.token)}`);
      }
    }
  }
  return sent;
}

/** Tüm Yahoo isteklerini paralel indirir; runRadar bu önbellekten okur. */
function prefetch(urls: string[]): Map<string, { code: number; text: string }> {
  const cache = new Map<string, { code: number; text: string }>();
  const unique = [...new Set(urls)];
  for (let i = 0; i < unique.length; i += 40) {
    const chunk = unique.slice(i, i + 40);
    const responses = UrlFetchApp.fetchAll(chunk.map((url) => ({ url, muteHttpExceptions: true, headers: { 'User-Agent': UA } })));
    chunk.forEach((url, j) => cache.set(url, { code: responses[j].getResponseCode(), text: responses[j].getContentText() }));
  }
  return cache;
}

function cachedFetch(cache: Map<string, { code: number; text: string }>): FetchFn {
  return (async (url: string) => {
    let hit = cache.get(url);
    if (!hit) {
      const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': UA } });
      hit = { code: res.getResponseCode(), text: res.getContentText() };
    }
    const { code, text } = hit;
    return { ok: code >= 200 && code < 300, status: code, json: async () => JSON.parse(text) } as unknown as Response;
  }) as FetchFn;
}

function record(key: string, value: string) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

/** Zamanlanmış tetikleyicinin çağırdığı fonksiyon. */
export async function tick(): Promise<void> {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return; // önceki tur hâlâ çalışıyor
  const startedAt = Date.now();
  try {
    const owner = getDoc<{ owner?: string }>('meta/access')?.owner ?? null;

    // Ayarlar ekranından istenen test bildirimi.
    const testReq = getDoc<{ uid?: string }>('requests/testPush');
    if (testReq) {
      deleteDoc('requests/testPush');
      const n = sendPush(
        [{ title: 'Mechi Radar · test bildirimi', body: 'Bildirimler çalışıyor. Sinyaller bu şekilde gelecek.', data: { symbol: '', name: '', tf: '' } }],
        owner,
      );
      console.log(`Test bildirimi: ${n} cihaz`);
    }

    const config = getDoc<RadarConfig>('radar/config');
    const state = getDoc<RadarState>('radar/state');
    const signals = getDoc<{ items?: SignalEvent[] }>('radar/signals')?.items ?? [];
    const cfg = config ?? DEFAULT_CONFIG;
    const now = Math.floor(Date.now() / 1000);

    const urls: string[] = cfg.watchlist.flatMap((w) => chartUrls(w.symbol, TIMEFRAMES));
    if (!state?.scanAt || now - state.scanAt >= SCAN_INTERVAL) {
      const tfs: Timeframe[] = cfg.scanner.timeframes.length ? cfg.scanner.timeframes : ['4h', '1d'];
      urls.push(...cfg.scanner.symbols.flatMap((s) => chartUrls(s, tfs)));
    }
    const cache = prefetch(urls);

    const store: RadarStore = {
      load: async () => ({ config, state, signals }),
      saveConfig: async (c) => setDoc('radar/config', c as unknown as Record<string, unknown>),
      save: async ({ state: st, signals: sg, scan }) => {
        setDoc('radar/state', st as unknown as Record<string, unknown>);
        setDoc('radar/signals', { items: sg });
        if (scan) setDoc('radar/scan', scan as unknown as Record<string, unknown>);
      },
    };

    // Tüm veriler önceden indirildiği için buradaki await'ler beklemeden tamamlanır.
    const r = await runRadar({
      store,
      fetchFn: cachedFetch(cache),
      now,
      delayMs: 0,
      notify: async (items) => sendPush(buildPushMessages(items), owner),
    });
    record(
      'lastResult',
      `${new Date().toISOString()} · ${r.newEvents.length} sinyal, ${r.alerted.length} bildirim, ${Math.round((Date.now() - startedAt) / 1000)} sn`,
    );
  } catch (err) {
    record('lastError', `${new Date().toISOString()} · ${String(err)}`);
    throw err;
  } finally {
    lock.releaseLock();
  }
}

/** 5 dakikalık tetikleyiciyi (yeniden) kurar. */
export function setup(): string {
  for (const t of ScriptApp.getProjectTriggers()) if (t.getHandlerFunction() === 'tick') ScriptApp.deleteTrigger(t);
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(5).create();
  return 'Tetikleyici kuruldu: her 5 dakikada bir.';
}

/** Web uygulaması adresi: ilk açılışta izin ister, tetikleyiciyi kurar ve durumu gösterir. */
export function doGet(): unknown {
  const hasTrigger = ScriptApp.getProjectTriggers().some((t: any) => t.getHandlerFunction() === 'tick');
  const msg = hasTrigger ? 'Tetikleyici zaten kurulu: her 5 dakikada bir.' : setup();
  const props = PropertiesService.getScriptProperties();
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
  const html = `<meta name="viewport" content="width=device-width,initial-scale=1">
<div style="font-family:sans-serif;padding:20px;max-width:560px">
<h2>Mechi Radar</h2>
<p><b>${esc(msg)}</b></p>
<p>Son çalışma: ${esc(props.getProperty('lastResult') ?? 'henüz yok (ilk kontrol 5 dakika içinde)')}</p>
<p style="color:#b91c1c">Son hata: ${esc(props.getProperty('lastError') ?? 'yok')}</p>
<p>Bu sayfayı kapatabilirsin. Kontrol arka planda çalışmaya devam eder.</p></div>`;
  return HtmlService.createHtmlOutput(html).setTitle('Mechi Radar');
}
