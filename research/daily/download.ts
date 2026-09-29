// Günlük veri indirme: Yahoo, range=max, interval=1d. research/data/<ad>.csv olarak yazar.
// Tarih, borsanın yerel saatine göre (meta.gmtoffset) hesaplanır.
// Çalıştırma: npx tsx research/daily/download.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import type { Candle } from '../../src/core/types';
import { INSTRUMENTS } from './instruments';

// range=max günlük yerine seyrek (aylık/çeyreklik) mum döndürüyor; tarih aralığı açıkça verilir.
async function fetchDaily(symbol: string) {
  const now = Math.floor(Date.now() / 1000);
  const path = `/v8/finance/chart/${encodeURIComponent(symbol)}?period1=0&period2=${now}&interval=1d&includePrePost=false&events=div,split`;
  let last: unknown;
  for (const host of ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']) {
    try {
      const res = await fetch(host + path, { headers: { 'User-Agent': 'Mozilla/5.0 (MechiRadar)', Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
      const data = (await res.json()) as any;
      const r = data.chart.result?.[0];
      if (!r) throw new Error(data.chart.error?.description || `${symbol}: veri yok`);
      const q = r.indicators.quote[0];
      const ts: number[] = r.timestamp ?? [];
      const candles: Candle[] = [];
      for (let i = 0; i < ts.length; i++) {
        const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i];
        if (o == null || h == null || l == null || c == null) continue;
        candles.push({ t: ts[i], o, h, l, c });
      }
      return { meta: r.meta as { gmtoffset?: number }, candles };
    } catch (err) {
      last = err;
    }
  }
  throw last;
}

async function main() {
  mkdirSync('research/data', { recursive: true });
  const meta: Record<string, unknown> = {};
  for (const ins of INSTRUMENTS) {
    const { meta: m, candles } = await fetchDaily(ins.symbol);
    const off = m.gmtoffset ?? 0;
    // Günlük olduğunu doğrula: ardışık mumlar arasında medyan fark ~1 gün olmalı.
    const gaps = candles.slice(1).map((c, i) => c.t - candles[i].t).sort((a, b) => a - b);
    const median = gaps[Math.floor(gaps.length / 2)] ?? 0;
    if (median > 4 * 86400) throw new Error(`${ins.symbol}: günlük veri değil (medyan aralık ${median / 86400} gün)`);
    const rows = candles.map((c) => {
      const d = new Date((c.t + off) * 1000).toISOString().slice(0, 10);
      return `${d},${c.t},${c.o},${c.h},${c.l},${c.c}`;
    });
    writeFileSync(`research/data/${ins.id}.csv`, ['date,t,o,h,l,c', ...rows].join('\n') + '\n');
    meta[ins.id] = { symbol: ins.symbol, gmtoffset: off, bars: candles.length, first: rows[0]?.slice(0, 10), last: rows[rows.length - 1]?.slice(0, 10), downloadedAt: new Date().toISOString() };
    console.log(ins.id, candles.length, rows[0]?.slice(0, 10), rows[rows.length - 1]?.slice(0, 10));
  }
  writeFileSync('research/data/meta.json', JSON.stringify(meta, null, 1) + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
