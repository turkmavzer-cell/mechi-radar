import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOX_CANDIDATES, simulate } from '../src/core/boxes';
import type { Candle } from '../src/core/types';

const bar = (i: number, c: number, spread = 1): Candle => ({ t: i * 3600, o: c, h: c + spread, l: c - spread, c });

test('kural çıkışı: stop/hedef yokken kapanışta kapatır, R işaretine göre sonuç', () => {
  const cs = Array.from({ length: 40 }, (_, i) => bar(i, 100));
  cs[30] = bar(30, 100.5); // küçük kâr, hedefe uzak
  const tr = simulate(cs, [{ i: 20, dir: 'up' }], { stopAtr: 1.5, rr: 2 }, (j) => j === 30);
  assert.equal(tr.length, 1);
  assert.equal(tr[0].exitI, 30);
  assert.equal(tr[0].ruleExit, true);
  assert.equal(tr[0].outcome, 'tp');
  assert.ok(tr[0].r! > 0 && tr[0].r! < 1);
});

test('kural çıkışı: aynı mumda stop önce gelir', () => {
  const cs = Array.from({ length: 40 }, (_, i) => bar(i, 100));
  cs[25] = { t: 25 * 3600, o: 100, h: 101, l: 90, c: 100 };
  const tr = simulate(cs, [{ i: 20, dir: 'up' }], { stopAtr: 1.5, rr: 2 }, () => true);
  assert.equal(tr[0].exitI, 21);
  const tr2 = simulate(cs, [{ i: 20, dir: 'up' }], { stopAtr: 1.5, rr: 2 }, (j) => j >= 25);
  assert.equal(tr2[0].outcome, 'sl');
  assert.equal(tr2[0].r, -1);
  assert.equal(tr2[0].ruleExit, undefined);
});

test('yeni adaylar geleceğe bakmaz (kısaltılmış veride aynı girişler)', () => {
  let x = 100;
  const cs: Candle[] = [];
  for (let i = 0; i < 900; i++) {
    x += Math.sin(i / 7) * 1.3 + Math.cos(i / 23) * 0.9 + ((i * 7919) % 13) / 13 - 0.48;
    cs.push({ t: i * 3600, o: x - 0.3, h: x + 1.2, l: x - 1.2, c: x + (i % 3 === 0 ? 0.4 : -0.2) });
  }
  for (const id of ['donchian55', 'rsi2x', 'emapull']) {
    const b = BOX_CANDIDATES.find((c) => c.id === id)!;
    const full = b.signals(cs).filter((s) => s.i < 700).map((s) => `${s.i}${s.dir}`);
    const cut = b.signals(cs.slice(0, 700)).map((s) => `${s.i}${s.dir}`);
    assert.deepEqual(cut, full, id);
    assert.ok(full.length > 0, `${id} sinyal üretmeli`);
  }
});

test('kural çıkışı mumunda ters sinyal yeni işlem açar (stop/hedef çıkışında açmaz)', () => {
  const cs = Array.from({ length: 40 }, (_, i) => bar(i, 100));
  const tr = simulate(cs, [{ i: 20, dir: 'down' }, { i: 25, dir: 'up' }], { stopAtr: 1.5, rr: Number.POSITIVE_INFINITY }, (j, d) => d === 'down' && j === 25);
  assert.equal(tr.length, 2);
  assert.equal(tr[0].exitI, 25);
  assert.equal(tr[1].i, 25);
  assert.equal(tr[1].dir, 'up');
  const cs2 = Array.from({ length: 40 }, (_, i) => bar(i, 100));
  cs2[25] = { t: 25 * 3600, o: 100, h: 110, l: 99, c: 100 };
  const tr2 = simulate(cs2, [{ i: 20, dir: 'down' }, { i: 25, dir: 'up' }], { stopAtr: 1.5, rr: 2 });
  assert.equal(tr2.length, 1);
});

test('sameBarEntry: stop mumunda gelen ters sinyal yeni işlem açar', () => {
  const cs = Array.from({ length: 40 }, (_, i) => bar(i, 100));
  cs[25] = { t: 25 * 3600, o: 100, h: 110, l: 99, c: 100 };
  const tr = simulate(cs, [{ i: 20, dir: 'down' }, { i: 25, dir: 'up' }], { stopAtr: 1.5, rr: 2, sameBarEntry: true });
  assert.equal(tr.length, 2);
  assert.equal(tr[0].outcome, 'sl');
  assert.equal(tr[1].i, 25);
});
