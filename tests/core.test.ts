import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ema } from '../src/core/indicators';
import { aggregate } from '../src/core/candles';
import { analyze } from '../src/core/strategies';
import { signalLine, strengthLabel } from '../src/core/labels';
import type { Candle } from '../src/core/types';

function fromCloses(closes: number[], step = 900, wick = 0.2): Candle[] {
  return closes.map((c, i) => {
    const o = i ? closes[i - 1] : c;
    return { t: 1_700_000_000 + i * step, o, h: Math.max(o, c) + wick, l: Math.min(o, c) - wick, c };
  });
}

test('ema: SMA ile başlar, sonra üstel devam eder', () => {
  const v = ema([1, 2, 3, 4, 5, 6], 3);
  assert.ok(Number.isNaN(v[1]));
  assert.equal(v[2], 2);
  assert.equal(v[3], 3); // 4*0.5 + 2*0.5
  assert.equal(v[5], 5);
});

test('aggregate: 5dk mumlardan 20dk mum, UTC hizalı', () => {
  const base = 1_700_000_400; // 20dk sınırının 400sn sonrası değil; hizayı kontrol et
  const cs: Candle[] = Array.from({ length: 8 }, (_, i) => ({ t: base + i * 300, o: i, h: i + 1, l: i - 1, c: i + 0.5 }));
  const out = aggregate(cs, 1200, false);
  for (const c of out) assert.equal(c.t % 1200, 0);
  const first = out[0];
  assert.equal(first.o, 0);
  assert.equal(first.h, Math.max(...cs.filter((c) => c.t < first.t + 1200).map((c) => c.h)));
});

test('aggregate: seanslı piyasada kovalar günün ilk mumundan başlar', () => {
  // 09:30 UTC açılış (gmtoffset 0), 60dk mumlar -> 4s
  const day = 1_700_006_400; // 00:00 UTC olan bir gün
  const cs: Candle[] = Array.from({ length: 7 }, (_, i) => ({ t: day + 9.5 * 3600 + i * 3600, o: 1, h: 2, l: 0, c: 1 }));
  const out = aggregate(cs, 14400, true, 0);
  assert.equal(out.length, 2);
  assert.equal(out[0].t, day + 9.5 * 3600);
  assert.equal(out[1].t, day + 13.5 * 3600);
});

test('5·8·13: istikrarlı yükselişte tek sinyal, düşüşe dönünce düşüş sinyali', () => {
  const closes = [
    ...Array.from({ length: 30 }, () => 100),
    ...Array.from({ length: 30 }, (_, i) => 100 + (i + 1) * 0.5),
    ...Array.from({ length: 30 }, (_, i) => 115 - (i + 1) * 0.5),
  ];
  const a = analyze('X', '15m', fromCloses(closes));
  const ev = a.events.filter((e) => e.strategy === 'ema5813');
  assert.deepEqual(
    ev.map((e) => e.dir),
    ['up', 'down'],
  );
  assert.equal(ev[0].time, 1_700_000_000 + 30 * 900); // ilk yükselen mum
});

test('20·50 pullback: trend, geri çekilme, onay', () => {
  const closes: number[] = [];
  for (let i = 0; i < 80; i++) closes.push(100 + i * 0.5); // yükseliş trendi
  const top = closes[closes.length - 1];
  for (let i = 1; i <= 6; i++) closes.push(top - i * 1.2); // EMA20'ye geri çekilme
  const bottom = closes[closes.length - 1];
  for (let i = 1; i <= 6; i++) closes.push(bottom + i * 1.5); // toparlanma
  const a = analyze('X', '4h', fromCloses(closes, 14400));
  const pb = a.events.filter((e) => e.strategy === 'pullback2050');
  assert.equal(pb.length, 1);
  assert.equal(pb[0].dir, 'up');
  assert.ok(pb[0].time > 1_700_000_000 + 86 * 14400);
  assert.equal(pb[0].strength, 'unknown'); // EMA 200 için yeterli mum yok
});

test('20·50 pullback: EMA50 altına kapanış senaryoyu iptal eder', () => {
  const closes: number[] = [];
  for (let i = 0; i < 80; i++) closes.push(100 + i * 0.5);
  const top = closes[closes.length - 1];
  for (let i = 1; i <= 25; i++) closes.push(top - i * 1.5); // EMA50'nin altına sert düşüş
  for (let i = 1; i <= 3; i++) closes.push(closes[closes.length - 1] + 2);
  const a = analyze('X', '4h', fromCloses(closes, 14400));
  assert.equal(a.events.filter((e) => e.strategy === 'pullback2050' && e.dir === 'up').length, 0);
});

test('EMA 200 filtresi: güçlü / zayıf etiketi', () => {
  const closes = [
    ...Array.from({ length: 220 }, (_, i) => 200 - i * 0.3), // uzun düşüş -> EMA200 fiyatın üstünde
    ...Array.from({ length: 20 }, (_, i) => 134 + (i + 1) * 0.4), // EMA200 altında tepki yükselişi
  ];
  const a = analyze('X', '15m', fromCloses(closes));
  const up = a.events.find((e) => e.strategy === 'ema5813' && e.dir === 'up');
  assert.ok(up);
  assert.equal(up.strength, 'weak');
  assert.equal(strengthLabel('up', up.strength), 'Zayıf · tepki yükselişi (EMA 200 altı)');
  assert.equal(signalLine(up, 'USDJPY'), '▲ USDJPY · 15dk · Kısa vade yükseliş başlangıcı · Zayıf');
});
