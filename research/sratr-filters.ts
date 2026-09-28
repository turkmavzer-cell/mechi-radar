// Stokastik-RSI-ATR'ye tek (ve ikili) indikatör filtresi eklemenin etkisi.
// Aşırı uyumu önlemek için her serinin ilk yarısı "seçim", ikinci yarısı "doğrulama" olarak ayrı raporlanır.
// Çalıştırma: npx tsx research/sratr-filters.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { higherSeries, SR_FILTERS, SR_PARAMS, srTrades } from '../src/core/sratr';
import { TIMEFRAMES, type Timeframe } from '../src/core/types';
import { loadAll, SYMBOLS } from './load';

const singles = Object.keys(SR_FILTERS);
const VARIANTS: string[][] = [[], ...singles.map((f) => [f])];
for (let a = 0; a < singles.length; a++) for (let b = a + 1; b < singles.length; b++) VARIANTS.push([singles[a], singles[b]]);
const vname = (v: string[]) => (v.length ? v.join('+') : 'mevcut');

interface Acc { n: number; tp: number; r: number; gross: number; loss: number }
const blank = (): Acc => ({ n: 0, tp: 0, r: 0, gross: 0, loss: 0 });
type Part = 'all' | 'first' | 'second';
const acc = new Map<string, Acc>();
const add = (k: string, win: boolean) => {
  let a = acc.get(k);
  if (!a) acc.set(k, (a = blank()));
  const r = win ? SR_PARAMS.rr : -1;
  a.n++;
  if (win) a.tp++;
  a.r += r;
  if (r > 0) a.gross += r;
  else a.loss -= r;
};

async function main() {
  for (const symbol of SYMBOLS) {
    const all = await loadAll(symbol);
    for (const tf of TIMEFRAMES) {
      const cs = all[tf];
      const higher = higherSeries(tf, all);
      if (!cs || cs.length < 200 || !higher) continue;
      const half = Math.floor(cs.length / 2);
      for (const v of VARIANTS) {
        for (const t of srTrades(cs, tf, higher, SR_PARAMS, v)) {
          if (t.outcome === 'open') continue;
          const part: Part = t.i < half ? 'first' : 'second';
          for (const p of ['all', part] as Part[]) {
            add(`${vname(v)}|${p}|ALL`, t.outcome === 'tp');
            add(`${vname(v)}|${p}|${tf}`, t.outcome === 'tp');
          }
        }
      }
    }
    console.log(`${symbol}: tamam`);
  }

  const get = (v: string, p: Part, tf: Timeframe | 'ALL') => acc.get(`${v}|${p}|${tf}`) ?? blank();
  const stat = (a: Acc) => ({ n: a.n, win: a.n ? (100 * a.tp) / a.n : NaN, avgR: a.n ? a.r / a.n : NaN, pf: a.loss ? a.gross / a.loss : NaN, totalR: a.r });
  const rows = VARIANTS.map((v) => {
    const k = vname(v);
    return {
      variant: k,
      filters: v,
      names: v.map((f) => SR_FILTERS[f].name),
      all: stat(get(k, 'all', 'ALL')),
      first: stat(get(k, 'first', 'ALL')),
      second: stat(get(k, 'second', 'ALL')),
      byTf: Object.fromEntries(TIMEFRAMES.map((tf) => [tf, stat(get(k, 'all', tf))])),
      secondByTf: Object.fromEntries(TIMEFRAMES.map((tf) => [tf, stat(get(k, 'second', tf))])),
    };
  });
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-filters.json', JSON.stringify(rows, null, 1));

  const f = (x: number, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : '—');
  const line = (r: (typeof rows)[number]) =>
    `| ${r.variant} | ${r.first.n} | ${f(r.first.win, 1)} | ${f(r.first.avgR)} | ${r.second.n} | ${f(r.second.win, 1)} | ${f(r.second.avgR)} | ${f(r.second.pf, 2)} | ${f(r.all.totalR, 0)} |`;
  const head = '| Varyant | İlk yarı işlem | Hedef % | Ort. R | İkinci yarı işlem | Hedef % | Ort. R | PF | Toplam R |\n|---|---|---|---|---|---|---|---|---|';
  const md = ['# Stokastik-RSI-ATR filtre testi', '', `Stop ${SR_PARAMS.stopAtr} ATR, hedef 1:${SR_PARAMS.rr}. Sıralama: ilk yarı ortalama R.`, '', '## Tekli filtreler', '', head];
  const sorted = (xs: typeof rows) => xs.slice().sort((a, b) => b.first.avgR - a.first.avgR);
  for (const r of sorted(rows.filter((x) => x.filters.length <= 1))) md.push(line(r));
  md.push('', '## İkili filtreler (ilk 20)', '', head);
  for (const r of sorted(rows.filter((x) => x.filters.length === 2)).slice(0, 20)) md.push(line(r));
  md.push('', '## Zaman dilimine göre ortalama R (tüm veri)', '', `| Varyant | ${TIMEFRAMES.join(' | ')} |`, `|---|${TIMEFRAMES.map(() => '---').join('|')}|`);
  for (const r of sorted(rows.filter((x) => x.filters.length <= 1)))
    md.push(`| ${r.variant} | ${TIMEFRAMES.map((tf) => `${f(r.byTf[tf].avgR, 2)} (${r.byTf[tf].n})`).join(' | ')} |`);
  writeFileSync('research/out/sratr-filters.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
