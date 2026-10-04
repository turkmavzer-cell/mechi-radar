// TRF + ST · ATR TP (uygulamadaki kural): Japan 225, 30 Eylül 2025 – 30 Eylül 2026, 1000 $, 10x, maliyet dahil; 4s ve 1s.
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_STRATEGIES } from '../src/core/boxStrategies';
import type { Timeframe } from '../src/core/types';
import { evaluate } from './kapsamli';
import { INS } from './focus';
import { loadAll } from './load';

const START = Date.UTC(2025, 8, 30) / 1000;
const ROLL = 21 * 3600;

async function main() {
  const ins = INS.find((x) => x.id === 'jp225')!;
  const all = await loadAll(ins.symbol);
  const s = BOX_STRATEGIES.find((x) => x.id === 'trfst1')!;
  const md = [
    '# TRF + ST · ATR TP — Japan 225 (NIY=F), 30 Eylül 2025 – 30 Eylül 2026, 1000 $, 10x',
    '',
    '| Zaman dilimi | İşlem | İsabet | Bitiş | En düşük bakiye | Maks. düşüş | İşlem başı net puan | Stop-out | 1x bitiş |',
    '|---|---|---|---|---|---|---|---|---|',
  ];
  for (const tf of ['4h', '1h'] as Timeframe[]) {
    const cs = all[tf]!;
    const tr = s.run(cs, tf, undefined).filter((t) => t.outcome !== 'open' && t.exitI != null && cs[t.i].t >= START);
    const trades = tr.map((t) => {
      const d = t.dir === 'up' ? 1 : -1;
      let worst = t.entry;
      for (let j = t.i + 1; j <= t.exitI!; j++) worst = d === 1 ? Math.min(worst, cs[j].l) : Math.max(worst, cs[j].h);
      worst = d === 1 ? Math.min(worst, t.exitPrice!) : Math.max(worst, t.exitPrice!);
      let nights = 0;
      for (let dd = Math.floor((cs[t.i].t - ROLL) / 86400) + 1; dd * 86400 + ROLL <= cs[t.exitI!].t; dd++) {
        const wd = new Date((dd * 86400 + ROLL) * 1000).getUTCDay();
        if (wd !== 0 && wd !== 6) nights += wd === ins.tripleDay ? 3 : 1;
      }
      const cost = 1.5 * ins.spread + (nights * t.entry * (d === 1 ? ins.swapLong : ins.swapShort)) / 100 / 360;
      const pts = d * (t.exitPrice! - t.entry) - cost;
      return { e: t.i, x: t.exitI!, t: cs[t.i].t, tx: cs[t.exitI!].t, dir: d, entry: t.entry, exitPx: t.exitPrice!, net: pts / t.entry, mae: (d * (worst - t.entry)) / t.entry, pts, bars: t.exitI! - t.i, costPts: cost };
    });
    const v = evaluate(trades, 10);
    const v1 = evaluate(trades, 1);
    const usd = (x: number) => `${Math.round(x * 1000).toLocaleString('tr-TR')} $`;
    md.push(`| ${tf} | ${v.n} | %${Math.round(v.win * 100)} | ${usd(v.end)} | ${usd(v.minEq)} | %${(v.maxDD * 100).toFixed(1)} | ${v.avgPts.toFixed(0)} | ${v.liq ? 'evet' : 'hayır'} | ${usd(v1.end)} |`);
  }
  md.push(
    '',
    "Giriş/çıkış uygulamadaki gibi sinyal mumunun kapanışında; maliyet 17 puan spread + 8,5 kayma + swap (uzun %6,53, kısa %3,06, Cuma 3 gün). En düşük bakiye ve düşüş, işlem içindeki en kötü fiyatla. Stop-out: özsermaye pozisyonun %1'i.",
  );
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-trfatr.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
