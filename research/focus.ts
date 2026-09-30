// 4s ve 15dk strateji testi: USDJPY, Japan 225, Nasdaq 100, altın; maliyet dahil.
// Ön kayıt: research/ODAK-4S-15DK-KURAL.md. Çalıştırma: npx tsx research/focus.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_CANDIDATES, simulate, type BoxParams, type BoxTrade } from '../src/core/boxes';
import { higherSeries, SR_PARAMS, SR_VARIANTS, srTrades } from '../src/core/sratr';
import type { Candle, Timeframe } from '../src/core/types';
import { loadAll } from './load';

interface Ins {
  id: string;
  name: string;
  symbol: string;
  spread: number;
  /** Gidiş-dönüş komisyonu, fiyatın oranı. */
  comm: number;
  /** Yıllık swap maliyeti (%; pozitif = ödenen). */
  swapLong: number;
  swapShort: number;
  /** 3 günlük swap gecesi (UTC haftanın günü, 0 = Pazar). */
  tripleDay: number;
}

const INS: Ins[] = [
  { id: 'usdjpy', name: 'USDJPY', symbol: 'USDJPY=X', spread: 0.006, comm: 0.00007, swapLong: 0, swapShort: 4, tripleDay: 3 },
  { id: 'jp225', name: 'Japan 225', symbol: 'NIY=F', spread: 17, comm: 0, swapLong: 6.5306, swapShort: 3.0551, tripleDay: 5 },
  { id: 'nas100', name: 'Nasdaq 100', symbol: 'NQ=F', spread: 2.0, comm: 0, swapLong: 6.5306, swapShort: 3.0551, tripleDay: 5 },
  { id: 'xau', name: 'Altın', symbol: 'GC=F', spread: 0.35, comm: 0.00007, swapLong: 5, swapShort: 1, tripleDay: 3 },
];
const TFS: Timeframe[] = ['4h', '15m'];
const MIN_N: Record<string, number> = { '4h': 20, '15m': 15 };
const EXITS: { id: string; name: string; p: Partial<BoxParams> }[] = [
  { id: 'fixed', name: 'sabit 2R', p: {} },
  { id: 'trail', name: 'takip eden TP', p: { trail: 1.5 } },
];
const ROLL = 21 * 3600; // 21:00 UTC

/** Giriş ve çıkış arasındaki swap geceleri (3 günlük gece dahil). */
function nights(t0: number, t1: number, tripleDay: number): number {
  let n = 0;
  for (let d = Math.floor((t0 - ROLL) / 86400) + 1; d * 86400 + ROLL <= t1; d++) {
    const wd = new Date((d * 86400 + ROLL) * 1000).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    n += wd === tripleDay ? 3 : 1;
  }
  return n;
}

interface Row { i: number; t: number; gross: number; net: number; bars: number }

function costR(t: BoxTrade, cs: Candle[], ins: Ins, scale: number): number {
  const risk = Math.abs(t.entry - t.stop);
  const exitT = cs[t.exitI!].t;
  const trade = 1.5 * ins.spread + ins.comm * t.entry;
  const rate = t.dir === 'up' ? ins.swapLong : ins.swapShort;
  const swap = (nights(cs[t.i].t, exitT, ins.tripleDay) * t.entry * rate) / 100 / 360;
  return (scale * (trade + swap)) / risk;
}

interface Stat { n: number; perYear: number; win: number; avg: number; gross: number; t: number; total: number; pf: number; maxDD: number; h1: number; h2: number; n1: number; n2: number; bars: number }

function stats(rows: Row[], key: 'gross' | 'net', span: [number, number], years: number): Stat {
  const x = rows.map((r) => r[key]);
  const n = x.length;
  const avg = n ? x.reduce((a, b) => a + b, 0) / n : NaN;
  const sd = n > 1 ? Math.sqrt(x.reduce((a, b) => a + (b - avg) ** 2, 0) / (n - 1)) : NaN;
  let eq = 1, peak = 1, maxDD = 0;
  for (const r of x) {
    eq *= 1 + 0.01 * r;
    peak = Math.max(peak, eq);
    maxDD = Math.max(maxDD, 1 - eq / peak);
  }
  const mid = (span[0] + span[1]) / 2;
  const a = rows.filter((r) => r.t < mid).map((r) => r[key]);
  const b = rows.filter((r) => r.t >= mid).map((r) => r[key]);
  const mean = (v: number[]) => (v.length ? v.reduce((p, q) => p + q, 0) / v.length : NaN);
  const g = x.filter((v) => v > 0).reduce((p, q) => p + q, 0);
  const l = -x.filter((v) => v < 0).reduce((p, q) => p + q, 0);
  return {
    n,
    perYear: n / years,
    win: n ? (100 * x.filter((v) => v > 0).length) / n : NaN,
    avg,
    gross: mean(rows.map((r) => r.gross)),
    t: sd > 0 ? (avg / sd) * Math.sqrt(n) : NaN,
    total: x.reduce((p, q) => p + q, 0),
    pf: l ? g / l : NaN,
    maxDD: 100 * maxDD,
    h1: mean(a),
    h2: mean(b),
    n1: a.length,
    n2: b.length,
    bars: mean(rows.map((r) => r.bars)),
  };
}

const f = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '—');
const sg = (x: number, d = 3) => (Number.isFinite(x) ? (x > 0 ? '+' : '') + f(x, d) : '—');

async function main() {
  const strategies = [
    ...SR_VARIANTS.map((v) => ({ id: v.id as string, name: v.name, sra: [...v.filters] as string[] })),
    ...BOX_CANDIDATES.map((b) => ({ id: b.id, name: b.name, sra: null as string[] | null })),
  ];
  // sonuç[tf][exit][strateji][enstrüman] = { maliyet ölçeğine göre istatistikler }
  const res: Record<string, Record<string, Record<string, Record<string, Stat>>>> = {};
  const dataInfo: string[] = [];

  for (const ins of INS) {
    const all = await loadAll(ins.symbol);
    for (const tf of TFS) {
      const cs = all[tf];
      if (!cs || cs.length < 300) {
        dataInfo.push(`| ${ins.name} | ${tf} | veri yetersiz | | |`);
        continue;
      }
      const span: [number, number] = [cs[0].t, cs[cs.length - 1].t];
      const years = (span[1] - span[0]) / (365.25 * 86400);
      const day = (u: number) => new Date(u * 1000).toISOString().slice(0, 10);
      dataInfo.push(`| ${ins.name} | ${tf} | ${day(span[0])} – ${day(span[1])} | ${cs.length} | ${f(years * 12, 1)} ay |`);
      const higher = higherSeries(tf, all);
      for (const ex of EXITS)
        for (const s of strategies) {
          let trades: BoxTrade[];
          if (s.sra) trades = higher ? srTrades(cs, tf, higher, { ...SR_PARAMS, ...ex.p }, s.sra) : [];
          else {
            const b = BOX_CANDIDATES.find((x) => x.id === s.id)!;
            trades = simulate(cs, b.signals(cs), { stopAtr: 1.5, rr: 2, ...ex.p }, b.exit?.(cs));
          }
          const closed = trades.filter((t) => t.outcome !== 'open' && t.r != null && t.exitI != null);
          for (const scale of [0, 1, 2]) {
            const rows: Row[] = closed.map((t) => ({ i: t.i, t: cs[t.i].t, gross: t.r!, net: t.r! - costR(t, cs, ins, scale), bars: t.exitI! - t.i }));
            (((res[tf] ??= {})[ex.id] ??= {})[s.id] ??= {})[`${ins.id}|${scale}`] = stats(rows, 'net', span, years);
          }
        }
      console.log(`${ins.name} ${tf}: ${cs.length} mum`);
    }
  }

  const md: string[] = [
    '# 4s ve 15dk strateji testi — sonuçlar (maliyet dahil)',
    '',
    'Ön kayıt: `ODAK-4S-15DK-KURAL.md`. Bu dosya `research/focus.ts` ile otomatik üretildi.',
    '',
    '## Veri',
    '',
    '| Enstrüman | Zaman dilimi | Dönem | Mum | Süre |',
    '|---|---|---|---|---|',
    ...dataInfo,
    '',
  ];
  const summary: { tf: string; ex: string; id: string; name: string; pass: string[]; score: number; tNote: boolean }[] = [];
  const names = Object.fromEntries(strategies.map((s) => [s.id, s.name]));
  for (const tf of TFS)
    for (const ex of EXITS) {
      md.push(`## ${tf} · ${ex.name}`, '', 'Hücre: net ort. R (ilk yarı / ikinci yarı) · işlem · en büyük düşüş · t. ✓ = karar kuralının 1–3. şartları sağlandı.', '');
      md.push(`| Strateji | ${INS.map((x) => x.name).join(' | ')} | Geçer |`, `|---|${INS.map(() => '---').join('|')}|---|`);
      for (const s of strategies) {
        const pass: string[] = [];
        let tLow = false;
        const cells = INS.map((ins) => {
          const st = res[tf]?.[ex.id]?.[s.id]?.[`${ins.id}|1`];
          if (!st || !st.n) return '—';
          const ok = st.n >= MIN_N[tf] && st.h1 > 0 && st.h2 > 0 && st.maxDD < 20;
          if (ok) {
            pass.push(ins.id);
            if (!(st.t >= 2)) tLow = true;
          }
          return `${ok ? '✓ ' : ''}${sg(st.avg)} (${sg(st.h1, 2)} / ${sg(st.h2, 2)}) · ${st.n} · %${f(st.maxDD, 0)} · t ${f(st.t, 1)}`;
        });
        const passes = pass.length >= 2;
        const score = passes ? pass.reduce((a, id) => a + res[tf][ex.id][s.id][`${id}|1`].avg, 0) / pass.length : NaN;
        summary.push({ tf, ex: ex.id, id: s.id, name: s.name, pass, score, tNote: tLow });
        md.push(`| ${s.name} | ${cells.join(' | ')} | ${passes ? `**geçer** (${f(score, 3)})` : 'kalır'} |`);
      }
      md.push('');
    }

  md.push('## Özet: geçenler (sıralı)', '');
  for (const tf of TFS) {
    const win = summary.filter((x) => x.tf === tf && x.pass.length >= 2).sort((a, b) => b.score - a.score);
    md.push(`### ${tf}`, '');
    if (!win.length) md.push('Geçen aday yok.', '');
    for (const w of win)
      md.push(`- ${w.name} · ${EXITS.find((e) => e.id === w.ex)!.name} · ${w.pass.map((p) => INS.find((i) => i.id === p)!.name).join(', ')} · ort. net R ${f(w.score, 3)}${w.tNote ? ' · kanıt yetersiz (t < 2)' : ''}`);
    md.push('');
  }

  md.push('## Maliyet duyarlılığı (net ort. R: maliyet × 0 / × 1 / × 2)', '');
  for (const tf of TFS)
    for (const ex of EXITS) {
      md.push(`### ${tf} · ${EXITS.find((e) => e.id === ex.id)!.name}`, '', `| Strateji | ${INS.map((x) => x.name).join(' | ')} |`, `|---|${INS.map(() => '---').join('|')}|`);
      for (const s of strategies)
        md.push(`| ${names[s.id]} | ${INS.map((ins) => [0, 1, 2].map((k) => sg(res[tf]?.[ex.id]?.[s.id]?.[`${ins.id}|${k}`]?.avg ?? NaN, 2)).join(' / ')).join(' | ')} |`);
      md.push('');
    }

  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-focus.md', md.join('\n'));
  writeFileSync('research/out/sratr-focus.json', JSON.stringify({ res, summary }, null, 1));
  console.log(md.slice(0, 12).join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
