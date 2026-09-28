import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregate } from '../src/core/candles';
import { atr } from '../src/core/indicators';
import { higherSeries, srTrades, weeklyFromDaily, withHigher, SR_PARAMS } from '../src/core/sratr';
import { analyze } from '../src/core/strategies';
import { signalTitle } from '../src/core/labels';
import type { Candle } from '../src/core/types';

// Rastgele yürüyüş (sabit tohum) 15dk mumlar; 1s üst zaman dilimi birleştirmeyle üretilir.
function walk(n: number, step = 900, seed = 7): Candle[] {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  let p = 100;
  const out: Candle[] = [];
  const t0 = 1_750_000_000 - (1_750_000_000 % 86400);
  for (let i = 0; i < n; i++) {
    const o = p;
    p = Math.max(1, p + (rnd() - 0.5) * 1.2);
    out.push({ t: t0 + i * step, o, h: Math.max(o, p) + rnd() * 0.3, l: Math.min(o, p) - rnd() * 0.3, c: p });
  }
  return out;
}

test('Stokastik-RSI-ATR: seviyeler, tek pozisyon, sonuç', () => {
  const cs = walk(4000);
  const higher = higherSeries('15m', { '1h': aggregate(cs, 3600, false) })!;
  const trades = srTrades(cs, '15m', higher);
  assert.ok(trades.length > 5, `yeterli işlem yok: ${trades.length}`);
  const a = atr(cs.map((c) => c.h), cs.map((c) => c.l), cs.map((c) => c.c), 14);
  for (let k = 0; k < trades.length; k++) {
    const t = trades[k];
    const risk = SR_PARAMS.stopAtr * a[t.i];
    const s = t.dir === 'up' ? 1 : -1;
    assert.ok(Math.abs(t.entry - cs[t.i].c) < 1e-9);
    assert.ok(Math.abs(t.stop - (t.entry - s * risk)) < 1e-9);
    assert.ok(Math.abs(t.target - (t.entry + s * SR_PARAMS.rr * risk)) < 1e-9);
    // Önceki pozisyon kapanmadan yeni pozisyon açılmaz.
    if (k > 0) assert.ok(t.i > trades[k - 1].exitI!);
    if (t.outcome !== 'open') {
      const c = cs[t.exitI!];
      assert.ok(t.outcome === 'tp' ? (s > 0 ? c.h >= t.target : c.l <= t.target) : s > 0 ? c.l <= t.stop : c.h >= t.stop);
    }
  }
});

test('Stokastik-RSI-ATR: geleceğe bakmaz (kısaltılmış veride aynı girişler)', () => {
  const cs = walk(4000, 900, 11);
  const run = (n: number) => {
    const part = cs.slice(0, n);
    // Üst zaman dilimi, oluşmakta olan son mumu da içerir; kapanış zamanı kuralı onu elemeli.
    return srTrades(part, '15m', { tf: '1h', candles: aggregate(part, 3600, false) });
  };
  const full = run(4000);
  for (const n of [1500, 2300, 3100]) {
    const part = run(n);
    const fullBefore = full.filter((t) => t.i < n);
    // Kısaltılmış veride açık kalan pozisyon sonrası girişler farklılaşabilir; kapanana kadar olanlar aynı olmalı.
    const stable = part.filter((t) => t.outcome !== 'open');
    for (let k = 0; k < stable.length; k++) {
      assert.equal(stable[k].i, fullBefore[k].i);
      assert.equal(stable[k].dir, fullBefore[k].dir);
    }
  }
});

test('Stokastik-RSI-ATR: analyze olayları, başlık ve üst zaman dilimi eşlemesi', () => {
  const cs = walk(3000, 900, 5);
  const ev = analyze('X', '15m', cs, higherSeries('15m', { '1h': aggregate(cs, 3600, false) })).events.filter((e) => e.strategy === 'sratr');
  assert.ok(ev.length > 0 && ev.every((e) => e.levels));
  assert.match(signalTitle(ev[0]), /^(LONG|SHORT) GİRİŞ .* · Stop .* · Hedef /);
  assert.equal(analyze('X', '15m', cs).events.filter((e) => e.strategy === 'sratr').length, 0);
  assert.deepEqual(withHigher(['15m', '1d']), ['15m', '1h', '1d']);
  const days: Candle[] = Array.from({ length: 14 }, (_, i) => ({ t: 1_767_571_200 + i * 86400, o: i, h: i + 1, l: i - 1, c: i + 0.5 })); // 2026-01-05 Pazartesi
  const w = weeklyFromDaily(days);
  assert.equal(w.length, 2);
  assert.deepEqual(w[0], { t: 1_767_571_200, o: 0, h: 7, l: -1, c: 6.5 });
});

test('Stokastik-RSI-ATR filtreleri: her giriş filtre şartını sağlar', async () => {
  const { SR_FILTERS, alignHigher } = await import('../src/core/sratr');
  const cs = walk(5000, 900, 3);
  const higher = { tf: '1h' as const, candles: aggregate(cs, 3600, false) };
  const hIdx = alignHigher(cs, '15m', higher);
  const base = srTrades(cs, '15m', higher).length;
  for (const id of Object.keys(SR_FILTERS)) {
    const f = SR_FILTERS[id].make({ candles: cs, hIdx, higher });
    const ts = srTrades(cs, '15m', higher, SR_PARAMS, [id]);
    assert.ok(ts.length > 0 && ts.length <= base * 1.5, `${id}: ${ts.length}/${base}`);
    for (const t of ts) assert.ok(f(t.i, t.dir), `${id} şartı sağlanmadı`);
  }
});

test('kutu adayları: her strateji sinyal üretir, sinyaller geçerli indekste', async () => {
  const { BOX_CANDIDATES, simulate } = await import('../src/core/boxes');
  const cs = walk(6000, 900, 9);
  for (const b of BOX_CANDIDATES) {
    const sig = b.signals(cs);
    assert.ok(sig.length > 0, `${b.id} sinyal yok`);
    assert.ok(sig.every((s) => s.i > 0 && s.i < cs.length));
    const tr = simulate(cs, sig);
    for (let k = 1; k < tr.length; k++) assert.ok(tr[k].i > tr[k - 1].exitI!);
  }
});

test('kutu adayları: geleceğe bakmaz (kısaltılmış veride aynı sinyaller)', async () => {
  const { BOX_CANDIDATES } = await import('../src/core/boxes');
  const cs = walk(3000, 900, 21);
  for (const b of BOX_CANDIDATES) {
    const full = b.signals(cs);
    for (const n of [1200, 2100]) {
      const part = b.signals(cs.slice(0, n)).map((s) => `${s.i}${s.dir}`);
      assert.deepEqual(part, full.filter((s) => s.i < n).map((s) => `${s.i}${s.dir}`), `${b.id} @${n}`);
    }
  }
});

test('takip eden kâr al: hedefte kapanmaz, fiyatı takip eder, dönüşte kârla kapanır', async () => {
  const { simulate } = await import('../src/core/boxes');
  // 30 mum yatay (ATR ≈ 2), sonra düşüş (short lehine) ve geri dönüş.
  const cs: Candle[] = [];
  let p = 100;
  for (let i = 0; i < 30; i++) cs.push({ t: i * 900, o: p, h: p + 1, l: p - 1, c: p });
  const path = [99, 97, 95, 93, 91, 89, 87, 85, 83, 81, 80, 82, 84, 86, 88, 90];
  for (const [k, c] of path.entries()) {
    const o = p;
    cs.push({ t: (30 + k) * 900, o, h: Math.max(o, c) + 0.2, l: Math.min(o, c) - 0.2, c });
    p = c;
  }
  const sig = [{ i: 29, dir: 'down' as const }];
  const fixed = simulate(cs, sig, { stopAtr: 1.5, rr: 2 })[0];
  const trail = simulate(cs, sig, { stopAtr: 1.5, rr: 2, trail: 1, trailLock: true })[0];
  assert.equal(fixed.outcome, 'tp');
  assert.equal(fixed.r, 2);
  assert.equal(trail.outcome, 'tp');
  assert.ok(trail.r! > fixed.r!, `takip ${trail.r} > sabit ${fixed.r}`);
  assert.ok(trail.exitI! > fixed.exitI!);
  // Çıkış, görülen en düşük fiyatın 1 ATR yukarısında (hedefin altında).
  assert.ok(trail.exitPrice! <= trail.target && trail.exitPrice! > 79.8);
});

test('takip eden kâr al: alt sınır — kilitte hedef, geriden takipte hedef − takip mesafesi (boşluk yoksa)', async () => {
  const { BOX_CANDIDATES, simulate } = await import('../src/core/boxes');
  const cs = walk(6000, 900, 13);
  for (const lock of [true, false]) {
    // stop 1,5 ATR = 1R; takip 1,5 ATR = 1R → geriden takipte alt sınır 2R − 1R = 1R.
    const floor = lock ? 2 : 1;
    for (const b of BOX_CANDIDATES.slice(0, 4)) {
      const tr = simulate(cs, b.signals(cs), { stopAtr: 1.5, rr: 2, trail: 1.5, trailLock: lock });
      for (const t of tr) {
        if (t.outcome === 'sl') assert.equal(t.r, -1);
        if (t.outcome === 'tp') {
          const c = cs[t.exitI!];
          const lim = t.entry + ((t.target - t.entry) * floor) / 2;
          const gapped = t.dir === 'up' ? c.o < lim : c.o > lim;
          if (!gapped) assert.ok(t.r! >= floor - 1e-9, `${b.id} kilit=${lock} r=${t.r}`);
        }
      }
    }
  }
});
