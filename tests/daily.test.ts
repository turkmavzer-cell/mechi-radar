import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connorsRsi2, donchianTrend, turnOfMonth, tsmom, type Bar } from '../research/daily/strategies';

// Hafta içi günlük mumlar, sabit tohumlu rastgele yürüyüş.
function days(n: number, seed = 5): Bar[] {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const out: Bar[] = [];
  let p = 1000;
  let t = Date.UTC(2010, 0, 4) / 1000;
  while (out.length < n) {
    const wd = new Date(t * 1000).getUTCDay();
    if (wd !== 0 && wd !== 6) {
      const o = p;
      p = Math.max(10, p * (1 + (rnd() - 0.48) * 0.03));
      out.push({ date: new Date(t * 1000).toISOString().slice(0, 10), t, o, h: Math.max(o, p) * (1 + rnd() * 0.01), l: Math.min(o, p) * (1 - rnd() * 0.01), c: p });
    }
    t += 86400;
  }
  return out;
}

test('TOM: giriş ayın sondan ikinci işlem günü, çıkış yeni ayın 3. işlem günü (stop yoksa)', () => {
  const b = days(800);
  const tr = turnOfMonth(b, 3, 1000); // stop fiilen devre dışı
  assert.ok(tr.length > 20);
  for (const t of tr) {
    const m = b[t.i].date.slice(0, 7);
    assert.equal(b[t.i + 1].date.slice(0, 7), m);
    assert.notEqual(b[t.i + 2].date.slice(0, 7), m);
    assert.notEqual(b[t.exitI].date.slice(0, 7), m);
    assert.equal(b[t.exitI - 2].date.slice(0, 7), b[t.exitI].date.slice(0, 7));
    assert.notEqual(b[t.exitI - 3].date.slice(0, 7), b[t.exitI].date.slice(0, 7));
  }
});

test('RSI(2): en geç 10 işlem günü sonra çıkılır, yalnız long', () => {
  const b = days(3000, 9);
  const tr = connorsRsi2(b);
  assert.ok(tr.length > 10);
  for (const t of tr) {
    assert.equal(t.dir, 'up');
    assert.ok(t.exitI - t.i <= 10);
  }
});

test('Donchian ve TSMOM: geleceğe bakmaz (kısaltılmış veride aynı kapanmış işlemler)', () => {
  const b = days(2500, 3);
  for (const run of [donchianTrend, tsmom] as ((c: Bar[]) => { i: number; exitI: number; dir: string }[])[]) {
    const full = run(b);
    const part = run(b.slice(0, 1800));
    const key = (x: { i: number; exitI: number; dir: string }) => `${x.i}-${x.exitI}-${x.dir}`;
    // Kısaltılmış veride kapanan işlemler, tam veride de birebir aynı olmalı (son açık işlem hariç).
    assert.deepEqual(part.map(key), full.filter((x) => x.exitI < 1800).map(key));
  }
});
