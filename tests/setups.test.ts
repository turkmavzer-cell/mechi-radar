import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../src/core/boxes';
import { haSmoothed, heikinAshi, pivots } from '../src/core/indicators';
import { bbStochSignals, ema2155Signals, emaVolHaSignals, haSmoothedSignals, triangleSignals } from '../src/core/setups';
import type { Candle } from '../src/core/types';

function series(n = 1500): Candle[] {
  let x = 100;
  const cs: Candle[] = [];
  for (let i = 0; i < n; i++) {
    x += Math.sin(i / 9) * 1.1 + Math.cos(i / 31) * 0.8 + ((i * 7919) % 17) / 17 - 0.5;
    const o = x - 0.3 + ((i * 31) % 7) / 10;
    cs.push({ t: i * 3600, o, h: Math.max(o, x) + 0.8 + ((i * 13) % 5) / 5, l: Math.min(o, x) - 0.8 - ((i * 17) % 5) / 5, c: x, v: 1000 + ((i * 97) % 700) });
  }
  return cs;
}

test('yeni stratejiler geleceğe bakmaz (kısaltılmış veride aynı sinyaller)', () => {
  const cs = series();
  const fns: [string, (c: Candle[]) => { i: number; dir: string }[]][] = [
    ['ema2155', (c) => ema2155Signals(c)],
    ['ema2155 ilk', (c) => ema2155Signals(c, true)],
    ['bbstoch', (c) => bbStochSignals(c, 0.8)],
    ['hasmooth', haSmoothedSignals],
    ['triangle', (c) => triangleSignals(c)],
    ['emavolha', (c) => emaVolHaSignals(c)],
  ];
  for (const [name, fn] of fns) {
    const full = fn(cs).filter((s) => s.i < 1100).map((s) => `${s.i}${s.dir}`);
    const cut = fn(cs.slice(0, 1100)).map((s) => `${s.i}${s.dir}`);
    assert.deepEqual(cut, full, name);
    if (name !== 'triangle') assert.ok(full.length > 0, `${name} sinyal üretmeli`);
  }
});

test('Heikin Ashi: kapanış OHLC ortalaması, açılış önceki gövdenin ortası', () => {
  const ha = heikinAshi([10, 12], [14, 15], [9, 11], [12, 13]);
  assert.equal(ha.c[0], (10 + 14 + 9 + 12) / 4);
  assert.equal(ha.o[1], (ha.o[0] + ha.c[0]) / 2);
  const s = haSmoothed(...(['o', 'h', 'l', 'c'] as const).map((k) => series(200).map((x) => x[k])) as [number[], number[], number[], number[]]);
  assert.ok(s.dir.slice(40).every((d) => d === 1 || d === -1));
});

test('tepe/dip noktaları ve yükselen üçgen kırılımı', () => {
  // Yatay direnç 110, yükselen destek; sonra yukarı kırılım.
  const cs: Candle[] = [];
  const lows = [100, 103, 106];
  let t = 0;
  const push = (c: number) => cs.push({ t: t++ * 3600, o: c, h: c + 0.2, l: c - 0.2, c });
  for (let k = 0; k < 20; k++) push(95 + k * 0.5); // ATR için başlangıç
  for (const lo of lows) {
    for (let j = 0; j < 6; j++) push(lo + ((110 - lo) * j) / 6);
    push(110);
    for (let j = 5; j >= 0; j--) push(lo + 1 + ((110 - lo - 1) * j) / 6);
  }
  for (let j = 0; j < 6; j++) push(108 + j * 0.3);
  push(112);
  push(113);
  const pv = pivots(cs.map((c) => c.h), cs.map((c) => c.l), 5);
  assert.ok(pv.hi.length >= 2 && pv.lo.length >= 2);
  const sig = triangleSignals(cs, true);
  const last = sig.find((s) => s.i === cs.length - 2);
  assert.ok(last, 'kırılım sinyali');
  assert.equal(last!.dir, 'up');
  assert.equal(last!.kind, 'asc');
  assert.ok(last!.target! > cs[cs.length - 2].c);
});

test('değişen hedef: önceki mumun seviyesinde, açılış ötedeyse açılıştan çıkar', () => {
  const cs: Candle[] = Array.from({ length: 30 }, (_, i) => ({ t: i, o: 100, h: 101, l: 99, c: 100 }));
  cs[25] = { t: 25, o: 104, h: 105, l: 103, c: 104 };
  const tr = simulate(cs, [{ i: 20, dir: 'up' }], { stopAtr: 1.5, rr: 2 }, undefined, () => 102);
  assert.equal(tr[0].exitI, 25);
  assert.equal(tr[0].exitPrice, 104);
  assert.equal(tr[0].outcome, 'tp');
});
