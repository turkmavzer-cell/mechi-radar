// EMA 21/55 (yeni kural): hedef 1:2 ile 1:3 (ve 1:2 + takip) karşılaştırması; maliyet dahil.
// Enstrümanlar: USDJPY, Nasdaq 100, Japan 225 ve hisseler. Çalıştırma: npx tsx research/ema2155-rr.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { simulate, type BoxParams } from '../src/core/boxes';
import { ema2155Signals } from '../src/core/setups';
import type { Timeframe } from '../src/core/types';
import { costR, f, INS, sg, type Ins } from './focus';
import { loadAll } from './load';

// Hisse maliyeti (DOĞRULANMADI): gidiş-dönüş fiyatın %0,1'i (BIST) / %0,05'i (ABD) + swap yıllık %6,5 uzun / %3 kısa.
const stock = (id: string, name: string, symbol: string, rt: number): Ins => ({
  id,
  name,
  symbol,
  spread: 0,
  comm: rt,
  swapLong: 6.5,
  swapShort: 3,
  tripleDay: 5,
});
const LIST: Ins[] = [
  ...INS.filter((x) => x.id !== 'xau'),
  stock('thy', 'THY', 'THYAO.IS', 0.001),
  stock('asels', 'Aselsan', 'ASELS.IS', 0.001),
  stock('bimas', 'BİM', 'BIMAS.IS', 0.001),
  stock('aapl', 'Apple', 'AAPL', 0.0005),
  stock('nvda', 'Nvidia', 'NVDA', 0.0005),
  stock('msft', 'Microsoft', 'MSFT', 0.0005),
];
const TFS: Timeframe[] = ['15m', '1h', '4h', '1d'];
const OPTS = { firstOnly: true, breakAtr: 1, gapAtr: 1 };
const EXITS: { id: string; name: string; p: BoxParams }[] = [
  { id: 'rr2', name: '1:2', p: { stopAtr: 2, rr: 2 } },
  { id: 'rr3', name: '1:3', p: { stopAtr: 2, rr: 3 } },
  { id: 'trail', name: '1:2 + takip', p: { stopAtr: 2, rr: 2, trail: 1.5 } },
];

interface S { n: number; win: number; net: number; gross: number; total: number; dd: number }
function st(xs: { net: number; gross: number }[]): S {
  const n = xs.length;
  let eq = 1, peak = 1, dd = 0;
  for (const x of xs) {
    eq *= 1 + 0.01 * x.net;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
  }
  const sum = (k: 'net' | 'gross') => xs.reduce((a, x) => a + x[k], 0);
  return { n, win: n ? (100 * xs.filter((x) => x.net > 0).length) / n : NaN, net: n ? sum('net') / n : NaN, gross: n ? sum('gross') / n : NaN, total: sum('net'), dd: 100 * dd };
}

async function main() {
  const rows: string[] = [];
  const pool: Record<string, Record<string, { net: number; gross: number }[]>> = {};
  const info: string[] = [];
  for (const ins of LIST) {
    const all = await loadAll(ins.symbol);
    for (const tf of TFS) {
      const cs = all[tf];
      if (!cs || cs.length < 300) continue;
      const months = (cs[cs.length - 1].t - cs[0].t) / (30.44 * 86400);
      info.push(`${ins.name} ${tf}: ${f(months, 0)} ay`);
      const sig = ema2155Signals(cs, OPTS);
      const cells = EXITS.map((e) => {
        const tr = simulate(cs, sig, e.p).filter((t) => t.outcome !== 'open' && t.r != null);
        const xs = tr.map((t) => ({ net: t.r! - costR(t, cs, ins, 1), gross: t.r! }));
        ((pool[tf] ??= {})[e.id] ??= []).push(...xs);
        const s = st(xs);
        return s.n ? `${sg(s.net, 2)} (top. ${sg(s.total, 1)}, %${f(s.win, 0)}, düşüş %${f(s.dd, 0)})` : '—';
      });
      const n = simulate(cs, sig, EXITS[0].p).filter((t) => t.outcome !== 'open').length;
      rows.push(`| ${ins.name} | ${tf} | ${n} | ${cells.join(' | ')} |`);
    }
    console.log(`${ins.name}: tamam`);
  }
  const md = [
    '# EMA 21/55 (yeni kural): 1:2 ile 1:3 karşılaştırması',
    '',
    'Kural: kesişim başına 1 işlem, kopuş 1 ATR, EMA arası 1 ATR, stop 2 ATR. Maliyet dahil (hisse maliyetleri doğrulanmadı).',
    'Hücre: işlem başına net R (toplam net R, kazanan %, %1 riskte en büyük düşüş).',
    '',
    '| Enstrüman | Zaman dilimi | İşlem | 1:2 | 1:3 | 1:2 + takip |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
    '## Zaman dilimine göre toplam (tüm enstrümanlar)',
    '',
    '| Zaman dilimi | 1:2 | 1:3 | 1:2 + takip |',
    '|---|---|---|---|',
    ...TFS.map((tf) => `| ${tf} | ${EXITS.map((e) => {
      const s = st(pool[tf]?.[e.id] ?? []);
      return `${sg(s.net)} R · ${s.n} işlem · %${f(s.win, 0)} kazanan (maliyetsiz ${sg(s.gross)})`;
    }).join(' | ')} |`),
    '',
    `Veri: ${info.join(' · ')}`,
  ];
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-ema2155-rr.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
