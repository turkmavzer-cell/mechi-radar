import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runRadar } from '../server/run';
import { analyze } from '../src/core/strategies';
import { aggregate } from '../src/core/candles';
import type { RadarConfig, RadarState, ScanResult, SignalEvent } from '../src/core/types';
import type { Mail } from '../server/mail';

const START = 1_750_000_000 - (1_750_000_000 % 86400);

/** Salınımlı sentetik fiyat: sinyallerin sık oluşması için. */
const price = (t: number) => 150 + 3 * Math.sin((t - START) / 7200) + (t - START) / 400000;

function mockFetch(now: number) {
  return async (url: string): Promise<Response> => {
    const u = new URL(url);
    if (u.pathname.includes('BOZUK')) return new Response('x', { status: 404 });
    const interval = u.searchParams.get('interval')!;
    const step = interval === '5m' ? 300 : interval === '60m' ? 3600 : 86400;
    const from = interval === '1d' ? now - 400 * 86400 : interval === '60m' ? now - 200 * 86400 : now - 30 * 86400;
    const ts: number[] = [], o: number[] = [], h: number[] = [], l: number[] = [], c: number[] = [];
    for (let t = from - (from % step); t <= now; t += step) {
      const end = Math.min(t + step, now);
      const a = price(t), b = price(end);
      ts.push(t); o.push(a); c.push(b);
      h.push(Math.max(a, b, price((t + end) / 2)) + 0.01); l.push(Math.min(a, b, price((t + end) / 2)) - 0.01);
    }
    const body = {
      chart: {
        result: [{
          meta: { symbol: 'TEST', instrumentType: 'CURRENCY', gmtoffset: 0, regularMarketPrice: price(now) },
          timestamp: ts,
          indicators: { quote: [{ open: o, high: h, low: l, close: c }] },
        }],
        error: null,
      },
    };
    return new Response(JSON.stringify(body), { status: 200 });
  };
}

test('runRadar: ilk çalıştırmada mail yok, sonraki çalıştırmada yeni sinyaller maillenir', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'radar-'));
  const config: RadarConfig = {
    schemaVersion: 1,
    watchlist: [
      { symbol: 'TEST', name: 'Test', alerts: ['15m'] },
      { symbol: 'BOZUK', name: 'Hatalı', alerts: [] },
    ],
    scanner: { name: 'Deneme', symbols: ['TEST'], timeframes: ['4h', '1d'] },
  };
  writeFileSync(join(dir, 'config.json'), JSON.stringify(config));
  const mails: Mail[] = [];
  const send = async (m: Mail) => void mails.push(m);

  const t1 = START + 60 * 86400 + 123;
  const r1 = await runRadar({ dataDir: dir, fetchFn: mockFetch(t1), now: t1, send, delayMs: 0 });
  assert.equal(r1.newEvents.length, 0);
  assert.equal(mails.length, 0);
  assert.equal(r1.scanned, true);
  const s1 = JSON.parse(readFileSync(join(dir, 'state.json'), 'utf8')) as RadarState;
  assert.ok(s1.symbols.TEST.tf['15m']);
  assert.ok(s1.symbols.BOZUK.error);

  const t2 = t1 + 6 * 3600;
  const r2 = await runRadar({ dataDir: dir, fetchFn: mockFetch(t2), now: t2, send, delayMs: 0 });
  assert.equal(r2.scanned, true, '6 saat sonra tarayıcı yeniden çalışmalı');
  const new15 = r2.newEvents.filter((e) => e.tf === '15m');
  assert.ok(new15.length > 0, '6 saatlik salınımda 15dk sinyali beklenir');
  // Yeni olaylar yalnızca önceki kapanmış mumdan sonrakiler olmalı.
  for (const e of r2.newEvents) assert.ok(e.time > s1.lastSeen[`TEST|${e.tf}`]);
  // Sadece alarmı açık 15dk sinyalleri maillenir, tek mailde toplanır.
  assert.ok(r2.mailed.every((m) => m.event.tf === '15m'));
  assert.equal(r2.mailed.length, new15.length);
  assert.equal(mails.length, 1);
  assert.match(mails[0].subject, /Test|yeni sinyal/);

  // Aynı zamanla tekrar çalıştırınca tekrar sinyal/mail üretilmez.
  const r3 = await runRadar({ dataDir: dir, fetchFn: mockFetch(t2), now: t2, send, delayMs: 0 });
  assert.equal(r3.newEvents.length, 0);
  assert.equal(r3.scanned, false, 'tarayıcı saatte bir çalışmalı');
  assert.equal(mails.length, 1);

  const sig = JSON.parse(readFileSync(join(dir, 'signals.json'), 'utf8')) as SignalEvent[];
  assert.equal(sig.length, r2.newEvents.length);
  const scan = JSON.parse(readFileSync(join(dir, 'scan.json'), 'utf8')) as ScanResult;
  assert.equal(scan.rows[0].symbol, 'TEST');
  assert.ok(scan.rows[0].tf['4h']);
});

test('açık son mum sinyal hesabına girmez', async () => {
  // 15dk mumun ortasında: son (oluşan) mum hariç tutulmalı
  const now = START + 60 * 86400 + 450;
  const res = await mockFetch(now)(`https://x/v8/finance/chart/TEST?interval=5m&range=30d`);
  const j = await res.json();
  const q = j.chart.result[0];
  const cs = q.timestamp.map((t: number, i: number) => ({ t, o: q.indicators.quote[0].open[i], h: q.indicators.quote[0].high[i], l: q.indicators.quote[0].low[i], c: q.indicators.quote[0].close[i] }));
  const agg = aggregate(cs, 900, false);
  const dir = mkdtempSync(join(tmpdir(), 'radar-'));
  writeFileSync(join(dir, 'config.json'), JSON.stringify({ schemaVersion: 1, watchlist: [{ symbol: 'TEST', name: 'T', alerts: [] }], scanner: { name: '', symbols: [], timeframes: [] } }));
  await runRadar({ dataDir: dir, fetchFn: mockFetch(now), now, delayMs: 0, send: async () => {} });
  const st = JSON.parse(readFileSync(join(dir, 'state.json'), 'utf8')) as RadarState;
  assert.equal(st.symbols.TEST.tf['15m']!.time, agg[agg.length - 2].t);
  assert.equal(analyze('TEST', '15m', agg.slice(0, -1)).status!.time, agg[agg.length - 2].t);
});
