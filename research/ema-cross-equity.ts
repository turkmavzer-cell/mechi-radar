// 1000 USD senaryosu: EMA 21/55 kesişimi (sürekli pozisyon), 30 Eylül 2025 – 30 Eylül 2026, bileşik, 1x / 5x / 10x kaldıraç.
// Özsermaye her mumda (en kötü fiyatla, mum içi) izlenir; maliyet dahil. Çalıştırma: npx tsx research/ema-cross-equity.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { emaCrossSignals } from '../src/core/setups';
import type { Candle, Timeframe } from '../src/core/types';
import { f, INS, type Ins } from './focus';
import { loadAll } from './load';

const START = Date.UTC(2025, 8, 30) / 1000; // 30 Eylül 2025 00:00 UTC
const E0 = 1000;
const ROLL = 21 * 3600; // swap geçişi 21:00 UTC
/** Stop-out varsayımı: marj oranı %5 (1:20) ve stop-out seviyesi %20 → özsermaye pozisyon büyüklüğünün %1'ine inerse kapanır. */
const STOP_OUT = 0.01;

interface Res {
  end: number;
  n: number;
  win: number;
  maxDD: number;
  worst: number;
  minEq: number;
  stopOut: string | null;
  monthly: [string, number][];
}

function sim(cs: Candle[], ins: Ins, lev: number): Res {
  const sig = emaCrossSignals(cs, 21, 55).filter((s) => cs[s.i].t >= START);
  const byI = new Map(sig.map((s) => [s.i, s.dir === 'up' ? 1 : -1]));
  let cash = E0; // gerçekleşmiş bakiye
  let pos = 0; // +1 / −1 / 0
  let units = 0;
  let entry = 0;
  let eqAtEntry = 0;
  let peak = E0, maxDD = 0, minEq = E0, worst = 0, n = 0, win = 0;
  let stopOut: string | null = null;
  const monthly: [string, number][] = [];
  const first = cs.findIndex((c) => c.t >= START);
  const day = (u: number) => new Date(u * 1000).toISOString().slice(0, 10);
  const cost = (px: number) => 1.5 * ins.spread + ins.comm * px; // spread + kayma (0,5 × spread) + komisyon, fiyat birimi
  const close = (px: number) => {
    const pnl = units * pos * (px - entry);
    cash += pnl;
    const ret = (cash - eqAtEntry) / eqAtEntry;
    n++;
    if (ret > 0) win++;
    worst = Math.min(worst, ret);
    pos = 0;
    units = 0;
  };
  for (let i = first; i < cs.length; i++) {
    const c = cs[i];
    if (pos !== 0) {
      // Swap: bu mumun içinde 21:00 UTC geçişi varsa (hafta sonu hariç; 3 günlük gece).
      const d0 = Math.floor((cs[i - 1].t - ROLL) / 86400), d1 = Math.floor((c.t - ROLL) / 86400);
      for (let d = d0 + 1; d <= d1; d++) {
        const wd = new Date((d * 86400 + ROLL) * 1000).getUTCDay();
        if (wd === 0 || wd === 6) continue;
        const rate = pos === 1 ? ins.swapLong : ins.swapShort;
        cash -= (units * entry * rate) / 100 / 360 * (wd === ins.tripleDay ? 3 : 1);
      }
      // Mum içi en kötü özsermaye.
      const worstPx = pos === 1 ? c.l : c.h;
      const eqWorst = cash + units * pos * (worstPx - entry);
      minEq = Math.min(minEq, eqWorst);
      maxDD = Math.max(maxDD, 1 - eqWorst / peak);
      if (eqWorst <= STOP_OUT * units * worstPx) {
        // Stop-out: pozisyon o fiyattan kapanır, işlem durur.
        close(worstPx);
        stopOut = day(c.t);
        break;
      }
    }
    const dir = byI.get(i);
    if (dir != null && dir !== pos) {
      if (pos !== 0) close(c.c);
      pos = dir;
      entry = c.c;
      eqAtEntry = cash;
      units = (cash * lev) / entry;
      cash -= units * cost(entry);
    }
    const eq = cash + (pos ? units * pos * (c.c - entry) : 0);
    peak = Math.max(peak, eq);
    maxDD = Math.max(maxDD, 1 - eq / peak);
    minEq = Math.min(minEq, eq);
    const m = day(c.t).slice(0, 7);
    if (monthly.length && monthly[monthly.length - 1][0] === m) monthly[monthly.length - 1][1] = eq;
    else monthly.push([m, eq]);
  }
  const last = cs[cs.length - 1];
  const end = stopOut ? cash : cash + (pos ? units * pos * (last.c - entry) : 0);
  return { end, n, win: n ? (100 * win) / n : NaN, maxDD: 100 * maxDD, worst: 100 * worst, minEq, stopOut, monthly };
}

const usd = (x: number) => `${Math.round(x).toLocaleString('tr-TR')} $`;
const pct = (x: number) => `${x >= 0 ? '+' : ''}${f(x, 1)}%`;

async function main() {
  const md: string[] = [
    '# 1000 $ senaryosu: EMA 21/55 kesişimi, 30 Eylül 2025 – 30 Eylül 2026',
    '',
    '## Varsayımlar',
    '',
    '- Kural: EMA 21 > EMA 55 → LONG, < → SHORT; sinyal mum kapanışında, giriş kapanış fiyatından; ters kesişimde aynı fiyattan dönüş; stop/hedef yok.',
    '- Başlangıç: 30 Eylül 2025\'te pozisyonsuz; ilk işlem o tarihten sonraki ilk kesişimde (EMA\'lar önceki verilerle ısınmış). Açık kalan son işlem son kapanışla değerlenir.',
    '- Pozisyon büyüklüğü = o anki bakiye × kaldıraç / giriş fiyatı; bileşik. Getiri yüzde üzerinden hesaplanır (Japan 225 yen, kur etkisi yok sayıldı).',
    '- Maliyet (her girişte): spread + 0,5 × spread kayma + komisyon. Japan 225 17 puan (FxPro ekranı), Nasdaq 2 puan, altın 0,35 $ + %0,007, USDJPY 0,006 + %0,007 (Japan 225 dışı DOĞRULANMADI).',
    '- Swap: her 21:00 UTC geçişinde pozisyon × yıllık oran / 360 (FX/altında Çarşamba, endekslerde Cuma 3 gün). Japan 225/Nasdaq uzun %6,53, kısa %3,06; altın %5 / %1; USDJPY %0 / %4 (birim/oranlar DOĞRULANMADI).',
    `- Düşüş: her mumda mum içi en kötü fiyatla özsermaye üzerinden. Stop-out: marj %5 (1:20) ve stop-out %20 varsayımıyla özsermaye pozisyonun %${STOP_OUT * 100}\'ine inerse hesap kapanır (FxPro koşulları DOĞRULANMADI).`,
    '- Veri: Yahoo Finance (Japan 225 = NIY=F CME vadeli, Nasdaq = NQ=F, altın = GC=F); 4s mumlar 1s\'ten birleştirildi.',
    '',
  ];
  const rows: string[] = [];
  const header = '| Enstrüman | Zaman dilimi | Kaldıraç | Bitiş bakiyesi | Getiri | İşlem | Kazanan | Maks. düşüş (özsermaye) | En kötü işlem | En düşük bakiye | Stop-out |';
  const sep = '|---|---|---|---|---|---|---|---|---|---|---|';
  const row = (ins: Ins, tf: Timeframe, lev: number, r: Res) =>
    `| ${ins.name} | ${tf} | ${lev}x | ${usd(r.end)} | ${pct((r.end / E0 - 1) * 100)} | ${r.n} | %${f(r.win, 0)} | %${f(r.maxDD, 1)} | ${pct(r.worst)} | ${usd(r.minEq)} | ${r.stopOut ? `**evet (${r.stopOut})**` : 'hayır'} |`;
  let monthlyTable: string[] = [];
  const mainRes: Res[] = [];
  for (const ins of INS) {
    const all = await loadAll(ins.symbol);
    const tfs: Timeframe[] = ins.id === 'jp225' ? ['4h', '1h'] : ['4h'];
    for (const tf of tfs) {
      const cs = all[tf];
      if (!cs?.length) continue;
      const levs = ins.id === 'jp225' ? [1, 5, 10] : [1, 5];
      const rs = levs.map((lev) => sim(cs, ins, lev));
      rs.forEach((r, k) => rows.push(row(ins, tf, levs[k], r)));
      if (ins.id === 'jp225' && tf === '4h') {
        mainRes.push(...rs);
        monthlyTable = ['| Ay sonu | 1x | 5x | 10x |', '|---|---|---|---|', ...rs[0].monthly.map(([m], k) => `| ${m} | ${rs.map((r) => (r.monthly[k] ? usd(r.monthly[k][1]) : '—')).join(' | ')} |`)];
      }
    }
    console.log(`${ins.name}: tamam`);
  }
  md.push('## Sonuçlar', '', header, sep, ...rows, '', '## Japan 225 · 4s · ay sonu bakiyesi (açık pozisyon kapanışla değerlenmiş)', '', ...monthlyTable, '');
  mkdirSync('research/out', { recursive: true });
  writeFileSync('research/out/sratr-ema-cross-equity.md', md.join('\n'));
  console.log(md.join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
