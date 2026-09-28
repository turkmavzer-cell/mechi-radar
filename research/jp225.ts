// Japan 225 için SRA ve SAR + EMA 200 + MACD: farklı hedef oranlarında (stop 1,5 ATR sabit) sonuçlar.
// Çalıştırma: npx tsx research/jp225.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { BOX_CANDIDATES, simulate, type BoxTrade } from '../src/core/boxes';
import { higherSeries, SR_PARAMS, srTrades } from '../src/core/sratr';
import { TIMEFRAMES, type Candle } from '../src/core/types';
import { loadAll } from './load';

const SYMBOLS = [
  { symbol: 'NIY=F', name: 'Japan 225 vadeli (NIY=F)' },
  { symbol: '^N225', name: 'Nikkei 225 endeksi (^N225)' },
];
const RRS = [1, 1.5, 2, 3];
const sar = BOX_CANDIDATES.find((b) => b.id === 'sarmacd')!;

function stat(trades: BoxTrade[], rr: number, cs: Candle[]) {
  const done = trades.filter((t) => t.outcome !== 'open');
  const wins = done.filter((t) => t.outcome === 'tp').length;
  const total = wins * rr - (done.length - wins);
  const days = done.length ? (cs[done[done.length - 1].exitI!].t - cs[done[0].i].t) / 86400 : 0;
  return { n: done.length, win: done.length ? (100 * wins) / done.length : NaN, totalR: total, avgR: done.length ? total / done.length : NaN, days };
}

async function main() {
  const md: string[] = ['# Japan 225: SRA ve SAR + EMA 200 + MACD, hedef oranı karşılaştırması', '', 'Stop 1,5 ATR sabit. Hedef = oran × stop mesafesi (1:2 = 3 ATR, şu anki ayar). Spread/komisyon hariç.', ''];
  const rows: unknown[] = [];
  for (const s of SYMBOLS) {
    const all = await loadAll(s.symbol);
    md.push(`## ${s.name}`, '');
    for (const [sid, sname] of [['sratr', 'SRA (Stokastik-RSI-ATR)'], ['sarmacd', 'SAR + EMA 200 + MACD']] as const) {
      md.push(`### ${sname}`, '', '| Zaman dilimi | Veri | ' + RRS.map((r) => `1:${r} (işlem · hedef% · toplam R · ort. R)`).join(' | ') + ' |', `|---|---|${RRS.map(() => '---').join('|')}|`);
      for (const tf of TIMEFRAMES) {
        const cs = all[tf];
        if (!cs || cs.length < 250) continue;
        const higher = higherSeries(tf, all);
        const cells = RRS.map((rr) => {
          const tr = sid === 'sratr' ? srTrades(cs, tf, higher, { ...SR_PARAMS, rr }) : simulate(cs, sar.signals(cs), { stopAtr: 1.5, rr });
          const st = stat(tr, rr, cs);
          rows.push({ symbol: s.symbol, strategy: sid, tf, rr, ...st });
          return `${st.n} · %${st.win.toFixed(0)} · ${st.totalR >= 0 ? '+' : ''}${st.totalR.toFixed(1)}R · ${st.avgR >= 0 ? '+' : ''}${st.avgR.toFixed(2)}`;
        });
        const span = ((cs[cs.length - 1].t - cs[0].t) / 86400).toFixed(0);
        md.push(`| ${tf} | ${span} gün | ${cells.join(' | ')} |`);
      }
      md.push('');
    }
  }
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-jp225.json', JSON.stringify(rows, null, 1));
  writeFileSync('research/out/sratr-jp225.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
