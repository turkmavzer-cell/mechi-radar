// Kontrol: USDJPY 4s Heikin Ashi Smoothed renkleri ve işlemleri (Eylül 2026).
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_STRATEGIES } from '../src/core/boxStrategies';
import { haSmoothed } from '../src/core/indicators';
import { loadAll } from './load';

async function main() {
  const all = await loadAll('USDJPY=X');
  const cs = all['4h']!;
  const hs = haSmoothed(cs.map((c) => c.o), cs.map((c) => c.h), cs.map((c) => c.l), cs.map((c) => c.c));
  const iso = (t: number) => new Date((t + 3 * 3600) * 1000).toISOString().slice(0, 16).replace('T', ' ');
  const from = Date.UTC(2026, 8, 8) / 1000;
  const b = BOX_STRATEGIES.find((x) => x.id === 'hasmooth')!;
  const tr = b.run(cs, '4h', undefined);
  const out = ['| Mum (TR) | O | H | L | C | HA renk | Olay |', '|---|---|---|---|---|---|---|'];
  for (let i = 0; i < cs.length; i++) {
    if (cs[i].t < from) continue;
    const ev = [
      ...tr.filter((t) => t.i === i).map((t) => `${t.dir === 'up' ? 'LONG' : 'SHORT'} giriş`),
      ...tr.filter((t) => t.exitI === i).map((t) => `çıkış ${t.ruleExit ? 'kural' : t.outcome} ${t.r?.toFixed(2)}R`),
    ].join(', ');
    const c = cs[i];
    out.push(`| ${iso(c.t)} | ${c.o.toFixed(3)} | ${c.h.toFixed(3)} | ${c.l.toFixed(3)} | ${c.c.toFixed(3)} | ${hs.dir[i] === 1 ? 'yeşil' : 'kırmızı'} | ${ev} |`);
  }
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-debug.md', out.join('\n'));
}
main();
