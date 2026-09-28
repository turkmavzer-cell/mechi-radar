import { test } from 'node:test';
import assert from 'node:assert/strict';
import { macd, rsi, sma, supertrend } from '../src/core/indicators';
import { analyze, signalPerformance } from '../src/core/strategies';
import { signalTitle } from '../src/core/labels';
import type { Candle } from '../src/core/types';

function fromCloses(closes: number[], step = 900, wick = 0.2): Candle[] {
  return closes.map((c, i) => {
    const o = i ? closes[i - 1] : c;
    return { t: 1_700_000_000 + i * step, o, h: Math.max(o, c) + wick, l: Math.min(o, c) - wick, c };
  });
}

test('göstergeler: sma, rsi sınırları, macd işareti', () => {
  assert.deepEqual(sma([1, 2, 3, 4], 2).slice(1), [1.5, 2.5, 3.5]);
  const up = Array.from({ length: 40 }, (_, i) => 100 + i);
  assert.equal(rsi(up)[39], 100);
  assert.ok(macd(up).line[39] > 0);
  const down = up.map((v) => 300 - v);
  assert.ok(rsi(down)[39] < 1);
  assert.ok(macd(down).line[39] < 0);
});

test('supertrend: düşüşten yükselişe dönünce yön değişir', () => {
  const closes = [...Array.from({ length: 40 }, (_, i) => 200 - i), ...Array.from({ length: 40 }, (_, i) => 161 + i * 1.5)];
  const cs = fromCloses(closes);
  const d = supertrend(cs.map((c) => c.h), cs.map((c) => c.l), closes);
  assert.equal(d[35], -1);
  assert.equal(d[79], 1);
  const ev = analyze('X', '1h', cs).events.filter((e) => e.strategy === 'supertrend');
  assert.equal(ev[ev.length - 1].dir, 'up');
});

test('altın kesişim: SMA 50, SMA 200 ü yukarı keser', () => {
  const closes = [...Array.from({ length: 220 }, (_, i) => 300 - i * 0.5), ...Array.from({ length: 120 }, (_, i) => 190 + i * 1.2)];
  const a = analyze('X', '1d', fromCloses(closes, 86400));
  const gc = a.events.filter((e) => e.strategy === 'goldencross');
  assert.equal(gc.length, 1);
  assert.equal(gc[0].dir, 'up');
  assert.equal(signalTitle(gc[0]), 'Altın kesişim (SMA 50/200)');
  assert.equal(a.status!.golden, 'up');
});

test('donchian: kırılım yönü değişince tek sinyal', () => {
  const closes = [...Array.from({ length: 30 }, () => 100), ...Array.from({ length: 10 }, (_, i) => 101 + i), ...Array.from({ length: 30 }, (_, i) => 108 - i)];
  const ev = analyze('X', '4h', fromCloses(closes, 14400, 0.1)).events.filter((e) => e.strategy === 'donchian');
  assert.deepEqual(ev.map((e) => e.dir), ['up', 'down']);
});

function reversal(jump: number, dir: 1 | -1 = 1): number[] {
  // dir=1: düşüşten sert yükselişe dönüş; dir=-1: tersi
  return [...Array.from({ length: 60 }, (_, i) => 150 - dir * i * 0.5), ...Array.from({ length: 25 }, (_, i) => 150 - dir * 30 + dir * i * jump)];
}

test('üçlü onay: MACD 0 ve RSI 50 kesişimleri 3 mum içinde, mum BB ortası üstünde → tek ok', () => {
  // Bu seride RSI 62. mumda, MACD 65. mumda keser (3 mum fark); fiyat BB ortasının üstünde.
  const a = analyze('X', '15m', fromCloses(reversal(4)));
  const tr = a.events.filter((e) => e.strategy === 'triple');
  assert.deepEqual(tr.map((e) => [e.dir, (e.time - 1_700_000_000) / 900]), [['up', 65]]);
  assert.equal(a.status!.triple, 'up');
  assert.equal(a.status!.tripleScore, 3);
});

test('üçlü onay: MACD ile RSI kesişimleri 3 mumdan fazla arayla ise ok yok', () => {
  // RSI 65. mumda, MACD 70. mumda keser (5 mum fark).
  const tr = analyze('X', '15m', fromCloses(reversal(1.2))).events.filter((e) => e.strategy === 'triple');
  assert.equal(tr.length, 0);
});

test('üçlü onay: düşüş yönü simetrik', () => {
  const tr = analyze('X', '15m', fromCloses(reversal(4, -1))).events.filter((e) => e.strategy === 'triple');
  assert.deepEqual(tr.map((e) => e.dir), ['down']);
});

test('performans: sonraki sinyale kadar hareket ve en iyi seviye', () => {
  const closes = [...Array.from({ length: 30 }, () => 100), ...Array.from({ length: 10 }, (_, i) => 101 + i), ...Array.from({ length: 30 }, (_, i) => 108 - i)];
  const cs = fromCloses(closes, 14400, 0.1);
  const ev = analyze('X', '4h', cs).events.filter((e) => e.strategy === 'donchian');
  const perf = signalPerformance(ev, cs);
  const up = perf.get(ev[0])!;
  const down = perf.get(ev[1])!;
  assert.equal(up.ongoing, false);
  assert.equal(down.ongoing, true);
  // Yukarı sinyal 101'de, sonraki (aşağı) sinyale kadar zirve 110.1 civarı
  assert.ok(up.bestPct > 8 && up.bestPct < 10, String(up.bestPct));
  const endClose = cs[cs.length - 1].c;
  assert.ok(Math.abs(down.movePct - ((endClose - ev[1].close) / ev[1].close) * 100) < 1e-9);
  assert.ok(down.bestPct < 0);
});

test('MACD: sıfır kesişimi ve sıfırın altında/üstünde devam kesişimi', () => {
  // Dalgalı düşüş ve dalgalı yükseliş: hem sıfır hem devam kesişimleri oluşur.
  const closes = Array.from({ length: 400 }, (_, i) => 100 + 15 * Math.sin(i / 60) + 2 * Math.sin(i / 6));
  const cs = fromCloses(closes, 3600);
  const m = macd(closes);
  const ev = analyze('X', '1h', cs).events.filter((e) => e.strategy === 'macd');
  const idx = new Map(cs.map((c, i) => [c.t, i]));
  assert.ok(ev.some((e) => e.kind === 'zero' && e.dir === 'up'));
  assert.ok(ev.some((e) => e.kind === 'zero' && e.dir === 'down'));
  assert.ok(ev.some((e) => e.kind === 'cont'), 'devam kesişimi bekleniyor');
  for (const e of ev) {
    const i = idx.get(e.time)!;
    if (e.kind === 'zero') {
      assert.ok(e.dir === 'up' ? m.line[i - 1] <= 0 && m.line[i] > 0 : m.line[i - 1] >= 0 && m.line[i] < 0);
    } else if (e.dir === 'down') {
      // İki çizgi de sıfırın altında, mavi kırmızıyı yukarıdan aşağı keser
      assert.ok(m.line[i] < 0 && m.signal[i] < 0 && m.line[i - 1] >= m.signal[i - 1] && m.line[i] < m.signal[i]);
    } else {
      assert.ok(m.line[i] > 0 && m.signal[i] > 0 && m.line[i - 1] <= m.signal[i - 1] && m.line[i] > m.signal[i]);
    }
  }
  assert.match(signalTitle(ev.find((e) => e.kind === 'cont' && e.dir === 'down') ?? ev[0]), /MACD/);
});
