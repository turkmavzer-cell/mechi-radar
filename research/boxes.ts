// Popüler indikatör stratejilerinin aynı kutu kurallarıyla (stop 1,5 ATR, hedef 1:2) testi.
// İlk yarı seçim, ikinci yarı doğrulama. Karşılaştırma için Stokastik-RSI-ATR sürümleri de dahil.
// Çalıştırma: npx tsx research/boxes.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_CANDIDATES, simulate, type BoxParams, type BoxTrade } from '../src/core/boxes';
import { higherSeries, SR_PARAMS, SR_VARIANTS, srTrades } from '../src/core/sratr';
import { TIMEFRAMES, type Timeframe } from '../src/core/types';
import { loadAll, SYMBOLS } from './load';

const RRS = [1.5, 2];
interface Acc { n: number; tp: number; r: number; gross: number; loss: number; bars: number }
const blank = (): Acc => ({ n: 0, tp: 0, r: 0, gross: 0, loss: 0, bars: 0 });
const acc = new Map<string, Acc>();
const add = (k: string, t: BoxTrade, rr: number) => {
  let a = acc.get(k);
  if (!a) acc.set(k, (a = blank()));
  const r = t.outcome === 'tp' ? rr : -1;
  a.n++;
  if (t.outcome === 'tp') a.tp++;
  a.r += r;
  if (r > 0) a.gross += r;
  else a.loss -= r;
  a.bars += (t.exitI ?? t.i) - t.i;
};

async function main() {
  const ids = [...SR_VARIANTS.map((v) => v.id as string), ...BOX_CANDIDATES.map((b) => b.id)];
  for (const symbol of SYMBOLS) {
    const all = await loadAll(symbol);
    for (const tf of TIMEFRAMES) {
      const cs = all[tf];
      const higher = higherSeries(tf, all);
      if (!cs || cs.length < 300) continue;
      const half = Math.floor(cs.length / 2);
      for (const rr of RRS) {
        const p: BoxParams = { stopAtr: 1.5, rr };
        const runs: [string, BoxTrade[]][] = [
          ...SR_VARIANTS.map((v) => [v.id, higher ? srTrades(cs, tf, higher, { ...SR_PARAMS, rr }, [...v.filters]) : []] as [string, BoxTrade[]]),
          ...BOX_CANDIDATES.map((b) => [b.id, simulate(cs, b.signals(cs), p)] as [string, BoxTrade[]]),
        ];
        for (const [id, trades] of runs)
          for (const t of trades) {
            if (t.outcome === 'open') continue;
            const part = t.i < half ? 'first' : 'second';
            for (const k of [`${id}|${rr}|all|ALL`, `${id}|${rr}|${part}|ALL`, `${id}|${rr}|all|${tf}`, `${id}|${rr}|${part}|${tf}`]) add(k, t, rr);
          }
      }
    }
    console.log(`${symbol}: tamam`);
  }

  const st = (k: string) => {
    const a = acc.get(k) ?? blank();
    return { n: a.n, win: a.n ? (100 * a.tp) / a.n : NaN, avgR: a.n ? a.r / a.n : NaN, pf: a.loss ? a.gross / a.loss : NaN, totalR: a.r, avgBars: a.n ? a.bars / a.n : NaN };
  };
  const names: Record<string, string> = Object.fromEntries([
    ...SR_VARIANTS.map((v) => [v.id, v.name]),
    ...BOX_CANDIDATES.map((b) => [b.id, b.name]),
  ]);
  const rows = ids.flatMap((id) =>
    RRS.map((rr) => ({
      id,
      name: names[id],
      rr,
      all: st(`${id}|${rr}|all|ALL`),
      first: st(`${id}|${rr}|first|ALL`),
      second: st(`${id}|${rr}|second|ALL`),
      byTf: Object.fromEntries(TIMEFRAMES.map((tf) => [tf, st(`${id}|${rr}|all|${tf}`)])),
      secondByTf: Object.fromEntries(TIMEFRAMES.map((tf: Timeframe) => [tf, st(`${id}|${rr}|second|${tf}`)])),
    })),
  );
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-boxes.json', JSON.stringify(rows, null, 1));
  const f = (x: number, d = 3) => (Number.isFinite(x) ? x.toFixed(d) : '—');
  const md = ['# Popüler stratejiler: kutu testi (stop 1,5 ATR)', ''];
  for (const rr of RRS) {
    md.push(`## Hedef 1:${rr}`, '', '| Strateji | İlk yarı işlem | Ort. R | İkinci yarı işlem | Hedef % | Ort. R | PF | Toplam R | Ort. süre (mum) |', '|---|---|---|---|---|---|---|---|---|');
    for (const r of rows.filter((x) => x.rr === rr).sort((a, b) => b.first.avgR - a.first.avgR))
      md.push(`| ${r.name} | ${r.first.n} | ${f(r.first.avgR)} | ${r.second.n} | ${f(r.second.win, 1)} | ${f(r.second.avgR)} | ${f(r.second.pf, 2)} | ${f(r.all.totalR, 0)} | ${f(r.all.avgBars, 1)} |`);
    md.push('', `### Zaman dilimine göre ort. R (tüm veri, 1:${rr})`, '', `| Strateji | ${TIMEFRAMES.join(' | ')} |`, `|---|${TIMEFRAMES.map(() => '---').join('|')}|`);
    for (const r of rows.filter((x) => x.rr === rr).sort((a, b) => b.first.avgR - a.first.avgR))
      md.push(`| ${r.name} | ${TIMEFRAMES.map((tf) => `${f(r.byTf[tf].avgR, 2)} (${r.byTf[tf].n})`).join(' | ')} |`);
    md.push('');
  }
  writeFileSync('research/out/sratr-boxes.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
