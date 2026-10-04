import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../src/core/boxes';
import { ema, haSmoothed, heikinAshi, pivots } from '../src/core/indicators';
import { bbStochSignals, trfStSignals, twinStSignals, ema5813MacdSignals, ema2155BreakSignals, ema21CloseExit, ema2155Signals, emaVolHaSignals, haSmoothedSignals, triangleSignals, qqeSslSignals } from '../src/core/setups';
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
    ['ema2155 ilk', (c) => ema2155Signals(c, { firstOnly: true })],
    ['ema2155 kopuş', (c) => ema2155Signals(c, { firstOnly: true, breakAtr: 0.25, gapAtr: 0.5 })],
    ['bbstoch', (c) => bbStochSignals(c, 0.8)],
    ['hasmooth', haSmoothedSignals],
    ['ema2155break', (c) => ema2155BreakSignals(c)],
    ['ema2155v2', (c) => ema2155BreakSignals(c, { refBars: 10, no55After: 3 })],
    ['ema5813macd', (c) => ema5813MacdSignals(c)],
    ['twinst', (c) => twinStSignals(c)],
    ['trfst', trfStSignals],
    ['triangle', (c) => triangleSignals(c)],
    ['emavolha', (c) => emaVolHaSignals(c)],
    ['qqessl', qqeSslSignals],
  ];
  for (const [name, fn] of fns) {
    const full = fn(cs).filter((s) => s.i < 1100).map((s) => `${s.i}${s.dir}`);
    const cut = fn(cs.slice(0, 1100)).map((s) => `${s.i}${s.dir}`);
    assert.deepEqual(cut, full, name);
    if (name !== 'triangle' && name !== 'qqessl') assert.ok(full.length > 0, `${name} sinyal üretmeli`);
  }
});

test('QQE MOD + SSL Hybrid: rastgele yürüyüşte sinyal üretir, geleceğe bakmaz', () => {
  let x = 100;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cs: Candle[] = [];
  for (let i = 0; i < 1500; i++) {
    const o = x;
    x += (rnd() - 0.5) * 2;
    cs.push({ t: i * 3600, o, h: Math.max(o, x) + rnd(), l: Math.min(o, x) - rnd(), c: x, v: 1 });
  }
  const full = qqeSslSignals(cs).filter((s) => s.i < 1100).map((s) => `${s.i}${s.dir}`);
  assert.ok(full.length > 0);
  assert.deepEqual(qqeSslSignals(cs.slice(0, 1100)).map((s) => `${s.i}${s.dir}`), full);
  const e200 = ema(cs.map((c) => c.c), 200);
  for (const s of qqeSslSignals(cs)) assert.ok(s.dir === 'up' ? cs[s.i].c > e200[s.i] : cs[s.i].c < e200[s.i], 'EMA 200 filtresi');
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

test('tüm kutulu stratejiler çalışır, seviyeler JSON\'a uygun', async () => {
  const { STRATEGY_ARCHIVE } = await import('../src/core/boxStrategies');
  const { analyze } = await import('../src/core/strategies');
  const cs = series(1200);
  for (const b of STRATEGY_ARCHIVE) {
    const tr = b.run(cs, '1h', undefined);
    for (const t of tr) if (t.outcome !== 'open') assert.ok(Number.isFinite(t.r), `${b.id} r`);
  }
  const res = analyze('TEST', '1h', cs);
  const round = JSON.parse(JSON.stringify(res.events));
  for (const e of round) if (e.levels) assert.ok(e.levels.target == null || Number.isFinite(e.levels.target));
  // Uygulamada TRF + Supertrend sürümleri ve QQE + SSL açık.
  assert.ok(res.events.filter((e) => e.levels).every((e) => e.strategy.startsWith('trfst') || e.strategy.startsWith('qqessl')));
});

test('EMA 21/55 kırılım: stop dibin altında, kapanış önceki tepenin üstünde', () => {
  const cs = series(1500);
  const sig = ema2155BreakSignals(cs, { firstOnly: false });
  assert.ok(sig.length > 5);
  for (const x of sig) {
    const e = cs[x.i].c;
    assert.ok(x.dir === 'up' ? x.stop! < e : x.stop! > e, 'stop yanlış tarafta');
  }
  const tr = simulate(cs, sig, { stopAtr: 2, rr: Number.POSITIVE_INFINITY }, ema21CloseExit(cs, 1));
  for (const t of tr) if (t.outcome === 'sl' && !t.ruleExit) assert.equal(t.r, -1);
});

test('Twin Range Filter: Long ve Short etiketleri sırayla gelir', async () => {
  const { twinRangeFilter } = await import('../src/core/indicators');
  const sig = twinRangeFilter(series(1500).map((x) => x.c), 12, 1, 4, 2).signal.filter((x) => x !== 0);
  assert.ok(sig.length > 4);
  for (let k = 1; k < sig.length; k++) assert.notEqual(sig[k], sig[k - 1]);
});

test('Supertrend (Kıvanç): yükselişte çizgi altta, düşüşte üstte; TRF + ST stopu çizgide', async () => {
  const { supertrendKv } = await import('../src/core/indicators');
  const cs = series(1500);
  const st = supertrendKv(cs.map((x) => x.h), cs.map((x) => x.l), cs.map((x) => x.c), 10, 4);
  for (let i = 50; i < cs.length; i++) {
    if (st.dir[i] === st.dir[i - 1]) assert.ok(st.dir[i] === 1 ? st.line[i] <= cs[i].c : st.line[i] >= cs[i].c, `mum ${i}`);
  }
  for (const x of trfStSignals(cs)) assert.equal(x.stop, st.line[x.i]);
});

test('EMA 21/55 kesişim: sürekli pozisyon, ters kesişimde aynı kapanışta dönüş, stop yok', async () => {
  const { emaCrossSignals, emaCrossExit } = await import('../src/core/setups');
  const cs = series(1500);
  const tr = simulate(cs, emaCrossSignals(cs), { stopAtr: 2, rr: Number.POSITIVE_INFINITY, noStop: true, sameBarEntry: true }, emaCrossExit(cs));
  assert.ok(tr.length > 3);
  for (let k = 1; k < tr.length; k++) {
    assert.equal(tr[k].i, tr[k - 1].exitI);
    assert.notEqual(tr[k].dir, tr[k - 1].dir);
  }
  for (const t of tr) {
    assert.equal(t.stop, t.entry);
    if (t.outcome !== 'open') assert.ok(t.ruleExit);
  }
});
