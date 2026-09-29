// Günlük veri indirme: Yahoo, range=max, interval=1d. research/data/<ad>.csv olarak yazar.
// Tarih, borsanın yerel saatine göre (meta.gmtoffset) hesaplanır.
// Çalıştırma: npx tsx research/daily/download.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { fetchChart } from '../../src/core/yahoo';
import { INSTRUMENTS } from './instruments';

async function main() {
  mkdirSync('research/data', { recursive: true });
  const meta: Record<string, unknown> = {};
  for (const ins of INSTRUMENTS) {
    const { meta: m, candles } = await fetchChart(fetch, ins.symbol, '1d', 'max');
    const off = m.gmtoffset ?? 0;
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
