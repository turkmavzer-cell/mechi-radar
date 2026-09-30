// Kontrol: USDJPY 15dk son 3 gün, EMA 21/55 stratejilerinin girişleri ve çıkışları.
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_STRATEGIES } from '../src/core/boxStrategies';
import { ema } from '../src/core/indicators';
import { loadAll } from './load';

async function main() {
  const all = await loadAll('USDJPY=X');
  const cs = all['15m']!;
  const iso = (t: number) => new Date((t + 3 * 3600) * 1000).toISOString().slice(0, 16).replace('T', ' ');
  const from = cs[cs.length - 1].t - 3 * 86400;
  const ids = ['ema2155', 'ema2155bo', 'ema2155bt'];
  const trs = ids.map((id) => ({ id, tr: BOX_STRATEGIES.find((x) => x.id === id)!.run(cs, '15m', undefined) }));
  const tr = trs.flatMap((x) => x.tr.map((t) => ({ ...t, sid: x.id })));
  const e21 = ema(cs.map((c) => c.c), 21), e55 = ema(cs.map((c) => c.c), 55);
  const out = ['| Mum (TR) | O | H | L | C | EMA21 | EMA55 | Olay |', '|---|---|---|---|---|---|---|---|'];
  for (let i = 0; i < cs.length; i++) {
    if (cs[i].t < from) continue;
    const ev = [
      ...tr.filter((t) => t.i === i).map((t) => `${t.sid}: ${t.dir === 'up' ? 'LONG' : 'SHORT'} giriş, stop ${t.stop.toFixed(3)}`),
      ...tr.filter((t) => t.exitI === i).map((t) => `${t.sid}: çıkış ${t.ruleExit ? 'kural' : t.outcome} ${t.r?.toFixed(2)}R`),
    ].join(', ');
    const c = cs[i];
    out.push(`| ${iso(c.t)} | ${c.o.toFixed(3)} | ${c.h.toFixed(3)} | ${c.l.toFixed(3)} | ${c.c.toFixed(3)} | ${e21[i].toFixed(3)} | ${e55[i].toFixed(3)} | ${ev} |`);
  }
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-debug.md', out.join('\n'));
}
main();
