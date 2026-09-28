// Takip eden kâr al testi: sabit 2R hedef ile hedefe ulaşınca takip (0,5 / 1 / 1,5 / 2 ATR) karşılaştırması.
// Tüm kutulu stratejiler, 18 enstrüman; ilk yarı / ikinci yarı ve Japan 225 (NIY=F) ayrıca.
// Çalıştırma: npx tsx research/trail.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_STRATEGIES } from '../src/core/boxStrategies';
import { higherSeries } from '../src/core/sratr';
import { TIMEFRAMES } from '../src/core/types';
import { loadAll, SYMBOLS } from './load';

const TRAILS: (number | undefined)[] = [undefined, 0.5, 1, 1.5, 2];
const tname = (t: number | undefined) => (t == null ? 'sabit 2R' : `takip ${t} ATR`);
interface Acc { n: number; r: number; win: number; bars: number; big: number }
const acc = new Map<string, Acc>();
const add = (k: string, r: number, bars: number) => {
  let a = acc.get(k);
  if (!a) acc.set(k, (a = { n: 0, r: 0, win: 0, bars: 0, big: 0 }));
  a.n++;
  a.r += r;
  if (r > 0) a.win++;
  if (r >= 4) a.big++;
  a.bars += bars;
};

async function main() {
  for (const symbol of SYMBOLS) {
    const all = await loadAll(symbol);
    for (const tf of TIMEFRAMES) {
      const cs = all[tf];
      if (!cs || cs.length < 300) continue;
      const higher = higherSeries(tf, all);
      const half = Math.floor(cs.length / 2);
      for (const b of BOX_STRATEGIES)
        for (const tr of TRAILS) {
          for (const t of b.run(cs, tf, higher, tr == null ? undefined : { trail: tr })) {
            if (t.outcome === 'open' || t.r == null) continue;
            const part = t.i < half ? 'first' : 'second';
            const keys = [`${b.id}|${tname(tr)}|all|ALL`, `${b.id}|${tname(tr)}|${part}|ALL`, `${b.id}|${tname(tr)}|all|${tf}`];
            if (symbol === 'NIY=F') keys.push(`${b.id}|${tname(tr)}|jp|${tf}`);
            for (const k of keys) add(k, t.r, t.exitI! - t.i);
          }
        }
    }
    console.log(`${symbol}: tamam`);
  }
  const g = (k: string) => acc.get(k) ?? { n: 0, r: 0, win: 0, bars: 0, big: 0 };
  const f = (x: number, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : '—');
  const md = ['# Takip eden kâr al testi', '', 'Stop 1,5 ATR, hedef 2R. Takipte stop hedefe çekilir ve en iyi fiyatın `d × ATR` gerisinden izler. Spread/komisyon hariç.', ''];
  md.push('## Tüm veri', '', '| Strateji | Çıkış | İşlem | Kârlı % | ≥4R % | İlk yarı ort. R | İkinci yarı ort. R | Toplam R | Ort. süre (mum) |', '|---|---|---|---|---|---|---|---|---|');
  const rows: unknown[] = [];
  for (const b of BOX_STRATEGIES)
    for (const tr of TRAILS) {
      const k = `${b.id}|${tname(tr)}`;
      const a = g(`${k}|all|ALL`), f1 = g(`${k}|first|ALL`), f2 = g(`${k}|second|ALL`);
      rows.push({ strategy: b.id, trail: tr ?? null, n: a.n, r: a.r, first: f1.n ? f1.r / f1.n : null, second: f2.n ? f2.r / f2.n : null });
      md.push(`| ${b.short} | ${tname(tr)} | ${a.n} | ${f((100 * a.win) / a.n, 1)} | ${f((100 * a.big) / a.n, 1)} | ${f(f1.r / f1.n)} | ${f(f2.r / f2.n)} | ${f(a.r, 0)} | ${f(a.bars / a.n, 1)} |`);
    }
  for (const [title, part] of [['Zaman dilimine göre ort. R (tüm semboller)', 'all'], ['Japan 225 (NIY=F): toplam R (işlem)', 'jp']] as const) {
    md.push('', `## ${title}`, '', `| Strateji | Çıkış | ${TIMEFRAMES.join(' | ')} |`, `|---|---|${TIMEFRAMES.map(() => '---').join('|')}|`);
    for (const b of BOX_STRATEGIES)
      for (const tr of TRAILS) {
        const cells = TIMEFRAMES.map((tf) => {
          const a = g(`${b.id}|${tname(tr)}|${part}|${tf}`);
          return part === 'all' ? `${f(a.r / a.n, 2)} (${a.n})` : `${a.n ? (a.r >= 0 ? '+' : '') + a.r.toFixed(1) : '—'} (${a.n})`;
        });
        md.push(`| ${b.short} | ${tname(tr)} | ${cells.join(' | ')} |`);
      }
  }
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-trail.json', JSON.stringify(rows, null, 1));
  writeFileSync('research/out/sratr-trail.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
