// EMA kesişimi (sürekli pozisyon) testi: 5 EMA çifti × 1s/4s × 4 enstrüman, maliyet dahil; ilk yarı seçim / ikinci yarı kontrol.
// Ayrıca TradingView karşılaştırması: Japan 225 4s, 30 Mart – 30 Eylül 2026, maliyetsiz puan.
// Çalıştırma: npx tsx research/ema-cross.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { simulate, type BoxTrade } from '../src/core/boxes';
import { emaCrossExit, emaCrossSignals } from '../src/core/setups';
import type { Candle, Timeframe } from '../src/core/types';
import { costR, f, INS, sg } from './focus';
import { loadAll } from './load';

const PAIRS: [number, number][] = [[9, 21], [13, 34], [20, 50], [21, 55], [50, 200]];
const TFS: Timeframe[] = ['1h', '4h'];
const P = { stopAtr: 2, rr: Number.POSITIVE_INFINITY, noStop: true, sameBarEntry: true };
const run = (cs: Candle[], [a, b]: [number, number]) => simulate(cs, emaCrossSignals(cs, a, b), P, emaCrossExit(cs, a, b));
const mean = (x: number[]) => (x.length ? x.reduce((p, q) => p + q, 0) / x.length : NaN);
const day = (u: number) => new Date(u * 1000).toISOString().slice(0, 10);
const hm = (u: number) => new Date((u + 3 * 3600) * 1000).toISOString().slice(0, 16).replace('T', ' ');

interface T { ins: string; tf: Timeframe; pair: string; half: 1 | 2; net: number; gross: number; pts: number }

async function main() {
  const rows: T[] = [];
  const info: string[] = [];
  const tv: string[] = [];
  for (const ins of INS) {
    const all = await loadAll(ins.symbol);
    for (const tf of TFS) {
      const cs = all[tf];
      if (!cs || cs.length < 300) continue;
      const mid = (cs[0].t + cs[cs.length - 1].t) / 2;
      info.push(`${ins.name} ${tf}: ${day(cs[0].t)} – ${day(cs[cs.length - 1].t)} (${cs.length} mum)`);
      for (const pair of PAIRS) {
        for (const t of run(cs, pair)) {
          if (t.outcome === 'open' || t.r == null) continue;
          const s = t.dir === 'up' ? 1 : -1;
          rows.push({ ins: ins.id, tf, pair: pair.join('/'), half: cs[t.i].t < mid ? 1 : 2, net: t.r - costR(t, cs, ins, 1), gross: t.r, pts: s * (t.exitPrice! - t.entry) });
        }
      }
      // TradingView karşılaştırması: Japan 225 4s, 21/55.
      if (ins.id === 'jp225' && tf === '4h') {
        const from = Date.UTC(2026, 2, 30) / 1000;
        const tr: BoxTrade[] = run(cs, [21, 55]).filter((t) => cs[t.i].t >= from);
        let close = 0, next = 0, n = 0, win = 0;
        tv.push('| Giriş (TR saati) | Yön | Giriş (kapanış) | Çıkış | Puan (kapanıştan) | Puan (sonraki açılıştan) |', '|---|---|---|---|---|---|');
        for (const t of tr) {
          const s = t.dir === 'up' ? 1 : -1;
          const open = t.outcome === 'open';
          const exitC = open ? cs[cs.length - 1].c : t.exitPrice!;
          const inN = cs[t.i + 1]?.o ?? t.entry;
          const outN = open ? cs[cs.length - 1].c : (cs[t.exitI! + 1]?.o ?? exitC);
          const pc = s * (exitC - t.entry), pn = s * (outN - inN);
          if (!open) {
            close += pc;
            next += pn;
            n++;
            if (pn > 0) win++;
          }
          tv.push(`| ${hm(cs[t.i].t)} | ${t.dir === 'up' ? 'LONG' : 'SHORT'} | ${f(t.entry, 0)} | ${open ? 'açık' : hm(cs[t.exitI!].t)} | ${sg(pc, 0)} | ${sg(pn, 0)}${open ? ' (açık)' : ''} |`);
        }
        tv.unshift(
          `Kapanan ${n} işlem: kapanıştan giriş ${sg(close, 0)} puan, sonraki mum açılışından giriş ${sg(next, 0)} puan (TradingView gibi), kazanan ${win}/${n}. Spread/kayma hariç.`,
          '',
        );
      }
    }
    console.log(`${ins.name}: tamam`);
  }

  const md: string[] = [
    '# EMA kesişimi (sürekli pozisyon) — 1s / 4s, maliyet dahil',
    '',
    'Kural: hızlı EMA yavaşı yukarı keserse LONG, aşağı keserse SHORT (mum kapanışında), ters kesişimde dönüş; stop/hedef yok.',
    'R ölçüsü: girişteki 2 × ATR(14). Maliyet: `ODAK-4S-15DK-KURAL.md` varsayımları (Japan 225 spread 17 puan + yarısı kayma + swap).',
    '',
    `Veri: ${info.join(' · ')}`,
    '',
  ];
  for (const tf of TFS) {
    md.push(`## ${tf}`, '', 'Hücre: net ort. R (ilk yarı / ikinci yarı) · işlem.', '', `| Çift | ${INS.map((x) => x.name).join(' | ')} | 4 enstrüman birlikte | Maliyetsiz |`, `|---|${INS.map(() => '---').join('|')}|---|---|`);
    const score: { pair: string; a: number; b: number }[] = [];
    for (const pair of PAIRS.map((p) => p.join('/'))) {
      const cell = (xs: T[]) => {
        if (!xs.length) return '—';
        const a = mean(xs.filter((x) => x.half === 1).map((x) => x.net));
        const b = mean(xs.filter((x) => x.half === 2).map((x) => x.net));
        return `${sg(a, 2)} / ${sg(b, 2)} · ${xs.length}`;
      };
      const pool = rows.filter((x) => x.tf === tf && x.pair === pair);
      score.push({ pair, a: mean(pool.filter((x) => x.half === 1).map((x) => x.net)), b: mean(pool.filter((x) => x.half === 2).map((x) => x.net)) });
      md.push(`| ${pair} | ${INS.map((ins) => cell(pool.filter((x) => x.ins === ins.id))).join(' | ')} | ${cell(pool)} | ${sg(mean(pool.map((x) => x.gross)), 2)} |`);
    }
    const best = [...score].sort((x, y) => y.a - x.a)[0];
    const e = score.find((x) => x.pair === '21/55')!;
    md.push('', `İlk yarıya göre en iyi çift: **${best.pair}** (ilk yarı ${sg(best.a)} R, ikinci yarı ${sg(best.b)} R). 21/55: ilk yarı ${sg(e.a)} R, ikinci yarı ${sg(e.b)} R.`, '');
  }
  md.push('## TradingView karşılaştırması (Japan 225 · 4s · EMA 21/55 · 30 Mart – 30 Eylül 2026)', '', 'Bizim veri: Yahoo `NIY=F` (CME vadeli, yen), 4s mumlar 1s\'ten UTC 00/04/08… sınırlarıyla birleştirildi.', '', ...tv, '');
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-ema-cross.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
