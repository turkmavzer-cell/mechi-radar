import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adx, bollinger, cci, psar, stochOsc, stochRsi, williamsR, sma } from '../src/core/indicators';
import { buildPlots, INDICATORS } from '../src/app/indicators';
import { aggregate } from '../src/core/candles';
import { higherStoch } from '../src/core/sratr';
import type { Candle } from '../src/core/types';

const candles: Candle[] = Array.from({ length: 300 }, (_, i) => {
  const c = 100 + 10 * Math.sin(i / 20) + 3 * Math.sin(i / 3);
  const o = 100 + 10 * Math.sin((i - 1) / 20) + 3 * Math.sin((i - 1) / 3);
  return { t: 1_750_000_000 + i * 900, o, h: Math.max(o, c) + 0.5, l: Math.min(o, c) - 0.5, c };
});
const H = candles.map((c) => c.h), L = candles.map((c) => c.l), C = candles.map((c) => c.c);
const finite = (v: number[]) => v.filter(Number.isFinite);

test('indikatörler: sınırlar ve temel özellikler', () => {
  const b = bollinger(C);
  assert.deepEqual(b.mid, sma(C, 20));
  for (let i = 19; i < C.length; i++) assert.ok(b.upper[i] >= b.mid[i] && b.lower[i] <= b.mid[i]);
  for (const v of [...finite(stochOsc(H, L, C).k), ...finite(stochRsi(C).k)]) assert.ok(v >= -1e-9 && v <= 100 + 1e-9);
  for (const v of finite(williamsR(H, L, C))) assert.ok(v >= -100 && v <= 0);
  const a = adx(H, L, C);
  assert.ok(finite(a.adx).length > 200);
  for (const v of finite(a.adx)) assert.ok(v >= -1e-9 && v <= 100 + 1e-9);
  assert.ok(finite(cci(H, L, C)).length > 250);
  // SAR yükselişte mumun altında, düşüşte üstünde kalır.
  const s = psar(H, L);
  for (let i = 2; i < s.length; i++) assert.ok(s[i] <= L[i] || s[i] >= H[i], `SAR mumun içinde: ${i}`);
});

test('tüm hazır indikatörler çizilebilir', () => {
  const { overlays, panes } = buildPlots(INDICATORS.map((d) => d.id), candles, { tf: '15m', higher: { tf: '1h', candles: aggregate(candles, 3600, false) } });
  assert.equal(overlays.length + panes.length, INDICATORS.length);
  for (const p of [...overlays, ...panes]) {
    const n = p.lines.reduce((k, l) => k + finite(l.values).length, finite(p.histogram ?? []).length);
    assert.ok(n > 0, `${p.id} boş`);
  }
  // Ichimoku öncü açıklıkları mumların ötesine uzanır.
  const ich = overlays.find((p) => p.id === 'ichimoku')!;
  assert.ok(ich.lines.find((l) => l.name === 'Span A')!.values.length > candles.length);
});

test('üst zaman dilimi Stokastik: yalnızca kapanmış 1s mumunun değeri, basamak şeklinde', () => {
  const hc = aggregate(candles, 3600, false);
  const s = higherStoch(candles, '15m', { tf: '1h', candles: hc });
  // 1s mumu, içindeki son 15dk mumu kapanınca biter; o 15dk mumunda değer o 1s mumuna geçer.
  for (let i = 0; i < candles.length; i++) {
    const closeTime = candles[i].t + 900;
    const done = hc.filter((h) => h.t + 3600 <= closeTime).length - 1;
    const expected = higherStoch(hc, '1h', { tf: '1h', candles: hc }).k[done] ?? NaN;
    assert.ok(Object.is(s.k[i], expected) || Math.abs(s.k[i] - expected) < 1e-9, `${i}`);
  }
});
