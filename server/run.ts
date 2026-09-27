import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TF_SECONDS } from '../src/core/candles';
import { analyze } from '../src/core/strategies';
import { TIMEFRAMES } from '../src/core/types';
import type { RadarConfig, RadarState, ScanResult, SignalEvent, SymbolState, Timeframe } from '../src/core/types';
import { loadSeries, type FetchFn } from '../src/core/yahoo';
import { DEFAULT_CONFIG } from './defaults';
import { buildMail, sendMail, type Mail, type MailItem } from './mail';

const MAX_SIGNALS = 300;
const SCAN_INTERVAL = 55 * 60;

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    console.warn(`${path} okunamadı, varsayılan kullanılıyor`);
    return fallback;
  }
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 1) + '\n');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RunOptions {
  dataDir: string;
  fetchFn: FetchFn;
  now?: number;
  send?: (mail: Mail) => Promise<unknown>;
  delayMs?: number;
}

export interface RunResult {
  newEvents: SignalEvent[];
  mailed: MailItem[];
  scanned: boolean;
}

/** Mum kapanışından bu yana çok zaman geçmişse (ör. uzun kesinti) mail atılmaz. */
function isFresh(e: SignalEvent, now: number): boolean {
  const closeAt = e.time + TF_SECONDS[e.tf];
  return now - closeAt < Math.max(2 * 3600, 3 * TF_SECONDS[e.tf]);
}

function closedCandles<T>(candles: T[] | undefined, lastOpen: boolean | undefined): T[] {
  if (!candles) return [];
  return lastOpen ? candles.slice(0, -1) : candles;
}

export async function runRadar(opts: RunOptions): Promise<RunResult> {
  const { dataDir, fetchFn } = opts;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const send = opts.send ?? sendMail;
  const delay = opts.delayMs ?? 400;
  mkdirSync(dataDir, { recursive: true });

  const configPath = join(dataDir, 'config.json');
  if (!existsSync(configPath)) writeJson(configPath, DEFAULT_CONFIG);
  const config = readJson<RadarConfig>(configPath, DEFAULT_CONFIG);
  const state = readJson<RadarState>(join(dataDir, 'state.json'), { updatedAt: '', symbols: {}, lastSeen: {} });
  const signals = readJson<SignalEvent[]>(join(dataDir, 'signals.json'), []);

  const newEvents: SignalEvent[] = [];
  const mailed: MailItem[] = [];
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
        const a = analyze(item.symbol, tf, candles);
        if (!a.status) continue;
        sym.tf[tf] = a.status;
        const key = `${item.symbol}|${tf}`;
        const seen = state.lastSeen[key];
        state.lastSeen[key] = a.status.time;
        // İlk kez görülen sembolde geçmiş sinyaller mail olarak gönderilmez.
        if (seen === undefined) continue;
        for (const e of a.events) {
          if (e.time <= seen) continue;
          newEvents.push(e);
          if (item.alerts.includes(tf) && isFresh(e, now)) mailed.push({ event: e, name: item.name });
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
  const allSignals = [...newEvents.sort((a, b) => b.time - a.time), ...signals].slice(0, MAX_SIGNALS);

  // Tarayıcı saatte bir çalışır, mail göndermez.
  let scanned = false;
  if (config.scanner.symbols.length && (!state.scanAt || now - state.scanAt >= SCAN_INTERVAL)) {
    const scan: ScanResult = { name: config.scanner.name, updatedAt: state.updatedAt, rows: [] };
    const tfs: Timeframe[] = config.scanner.timeframes.length ? config.scanner.timeframes : ['4h', '1d'];
    for (const symbol of config.scanner.symbols) {
      try {
        const set = await loadSeries(fetchFn, symbol, tfs, now);
        const row: ScanResult['rows'][number] = { symbol, tf: {} };
        for (const tf of tfs) {
          const a = analyze(symbol, tf, closedCandles(set.candles[tf], set.lastOpen[tf]));
          if (a.status) row.tf[tf] = a.status;
        }
        scan.rows.push(row);
      } catch (err) {
        scan.rows.push({ symbol, tf: {}, error: err instanceof Error ? err.message : String(err) });
      }
      if (delay) await sleep(delay);
    }
    writeJson(join(dataDir, 'scan.json'), scan);
    state.scanAt = now;
    scanned = true;
  }

  writeJson(join(dataDir, 'state.json'), state);
  writeJson(join(dataDir, 'signals.json'), allSignals);

  if (mailed.length) {
    try {
      await send(buildMail(mailed));
    } catch (err) {
      console.error('Mail gönderilemedi:', err);
    }
  }
  console.log(`Bitti: ${newEvents.length} yeni sinyal, ${mailed.length} mail kalemi, tarama: ${scanned ? 'evet' : 'hayır'}`);
  return { newEvents, mailed, scanned };
}

async function main() {
  const dataDir = process.env.DATA_DIR || 'data-branch';
  if (process.env.TEST_MAIL === '1') {
    await sendMail({
      subject: 'Mechi Radar · test maili',
      text: 'Mail ayarları çalışıyor. Sinyal mailleri bu adrese gelecek.\n',
      html: '<p>Mail ayarları çalışıyor. Sinyal mailleri bu adrese gelecek.</p>',
    });
  }
  await runRadar({ dataDir, fetchFn: fetch });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
