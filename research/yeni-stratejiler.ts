// Kullanıcının tarif ettiği 5 strateji: stop/hedef (ödül/risk) seçeneklerinin maliyet dahil testi.
// Yöntem: her strateji için seçenekler verinin İLK yarısında (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte) net ort. R'ye
// göre sıralanır, en iyisi seçilir; İKİNCİ yarı seçilenin doğrulamasıdır (seçimde kullanılmaz).
// Çalıştırma: npx tsx research/yeni-stratejiler.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { simulate, type BoxParams, type BoxSignal, type BoxTrade, type ExitRule, type TargetLine } from '../src/core/boxes';
import {
  bbStochSignals,
  bbTarget,
  ema2155Signals,
  ema20Exit,
  emaVolHaSignals,
  haSmoothedExit,
  haSmoothedSignals,
  rsiLevelExit,
  rsiMacdExit,
  rsiMacdSignals,
  triangleSignals,
} from '../src/core/setups';
import type { Candle, Timeframe } from '../src/core/types';
import { costR, f, INS, sg } from './focus';
import { loadAll } from './load';

const TFS: Timeframe[] = ['15m', '1h', '4h'];

interface Variant {
  id: string;
  label: string;
  /** Uygulamaya seçilebilir mi (ör. Bollinger'de dar bant filtresi zorunlu). */
  eligible?: boolean;
  run: (c: Candle[]) => { signals: BoxSignal[]; params: BoxParams; exit?: ExitRule; target?: TargetLine };
}

const INF = Number.POSITIVE_INFINITY;
const RRS = [1, 1.5, 2, 2.5, 3];
const STOPS = [1, 1.5, 2];

function grid(strategy: string): Variant[] {
  const v: Variant[] = [];
  if (strategy === 'ema2155') {
    v.push({ id: 'eski', label: 'ESKİ KURAL: her geri çekilme · filtre yok · stop 2 ATR · 1:3', eligible: false, run: (c) => ({ signals: ema2155Signals(c), params: { stopAtr: 2, rr: 3 } }) });
    const exits: [string, string, BoxParams][] = [
      ['2', '1:2', { stopAtr: 2, rr: 2 }],
      ['3', '1:3', { stopAtr: 2, rr: 3 }],
      ['3be', '1:3 + 1R\'de başa baş', { stopAtr: 2, rr: 3, breakeven: 1 }],
      ['trail', '1:2 + takip', { stopAtr: 2, rr: 2, trail: 1.5 }],
    ];
    for (const br of [0, 0.25, 0.5, 1])
      for (const gap of [0, 0.5, 1])
        for (const [eid, elabel, p] of exits) {
          const o = { firstOnly: true, breakAtr: br, gapAtr: gap };
          v.push({ id: `${br}|${gap}|${eid}`, label: `kesişim başına 1 · kopuş ${br} ATR · EMA arası ${gap} ATR · stop 2 ATR · ${elabel}`, run: (c) => ({ signals: ema2155Signals(c, o), params: p }) });
        }
  }
  if (strategy === 'bbstoch')
    for (const w of [0, 0.8, 1])
      for (const st of STOPS) {
        const tag = w ? `dar bant < ${w} × ort.` : 'bant filtresi yok';
        v.push({ id: `${w}|${st}|band`, label: `${tag} · stop ${st} ATR · hedef karşı bant`, eligible: w > 0, run: (c) => ({ signals: bbStochSignals(c, w), params: { stopAtr: st, rr: 2 }, target: bbTarget(c) }) });
        for (const rr of [1, 1.5, 2])
          v.push({ id: `${w}|${st}|${rr}`, label: `${tag} · stop ${st} ATR · 1:${rr}`, eligible: w > 0, run: (c) => ({ signals: bbStochSignals(c, w), params: { stopAtr: st, rr } }) });
      }
  if (strategy === 'hasmooth')
    for (const st of [...STOPS, 3]) {
      for (const rr of [1, 1.5, 2, 3]) v.push({ id: `${st}|${rr}`, label: `stop ${st} ATR · 1:${rr}`, run: (c) => ({ signals: haSmoothedSignals(c), params: { stopAtr: st, rr, sameBarEntry: true } }) });
      v.push({ id: `${st}|trail`, label: `stop ${st} ATR · 1:2 + takip`, run: (c) => ({ signals: haSmoothedSignals(c), params: { stopAtr: st, rr: 2, trail: 1.5, sameBarEntry: true } }) });
      v.push({ id: `${st}|flip`, label: `stop ${st} ATR · renk dönünce çıkış`, run: (c) => ({ signals: haSmoothedSignals(c), params: { stopAtr: st, rr: INF, sameBarEntry: true }, exit: haSmoothedExit(c) }) });
    }
  if (strategy === 'hasmoothAdx')
    for (const thr of [20, 25, 30])
      for (const st of [1.5, 2]) {
        v.push({ id: `${thr}|${st}|flip`, label: `ADX ≥ ${thr} · stop ${st} ATR · renk dönünce çıkış`, run: (c) => ({ signals: haSmoothedSignals(c, thr), params: { stopAtr: st, rr: INF, sameBarEntry: true }, exit: haSmoothedExit(c) }) });
        v.push({ id: `${thr}|${st}|trail`, label: `ADX ≥ ${thr} · stop ${st} ATR · 1:2 + takip`, run: (c) => ({ signals: haSmoothedSignals(c, thr), params: { stopAtr: st, rr: 2, trail: 1.5, sameBarEntry: true } }) });
      }
  if (strategy === 'rsimacd')
    for (const either of [false, true]) {
      const tag = either ? 'hangisi son keserse' : 'RSI keser, MACD 0 üstünde';
      for (const st of [1, 1.5, 2]) {
        for (const rr of [1, 1.5, 2, 3]) v.push({ id: `${either}|${st}|${rr}`, label: `${tag} · stop ${st} ATR · 1:${rr}`, run: (c) => ({ signals: rsiMacdSignals(c, either), params: { stopAtr: st, rr } }) });
        v.push({ id: `${either}|${st}|trail`, label: `${tag} · stop ${st} ATR · 1:2 + takip`, run: (c) => ({ signals: rsiMacdSignals(c, either), params: { stopAtr: st, rr: 2, trail: 1.5 } }) });
        v.push({ id: `${either}|${st}|exit`, label: `${tag} · stop ${st} ATR · RSI 50'nin ters tarafına geçince çıkış`, run: (c) => ({ signals: rsiMacdSignals(c, either), params: { stopAtr: st, rr: INF }, exit: rsiMacdExit(c) }) });
      }
    }
  if (strategy === 'rsimacdx')
    for (const lvl of [65, 70, 80])
      for (const mid of [false, true])
        for (const st of [1.5, 2, 3]) {
          const tag = `RSI ${lvl}/${100 - lvl} çizgisinde çıkış${mid ? ' (veya RSI 50 ters tarafa geçince)' : ''}`;
          v.push({ id: `${lvl}|${mid}|${st}`, label: `${tag} · acil stop ${st} ATR`, eligible: lvl === 70, run: (c) => ({ signals: rsiMacdSignals(c), params: { stopAtr: st, rr: INF }, exit: rsiLevelExit(c, lvl, mid) }) });
        }
  if (strategy === 'triangle')
    for (const st of STOPS) {
      v.push({ id: `${st}|measured`, label: `stop ${st} ATR · hedef formasyon yüksekliği`, run: (c) => ({ signals: triangleSignals(c, true), params: { stopAtr: st, rr: 2 } }) });
      for (const rr of [1.5, 2, 3]) v.push({ id: `${st}|${rr}`, label: `stop ${st} ATR · 1:${rr}`, run: (c) => ({ signals: triangleSignals(c), params: { stopAtr: st, rr } }) });
      v.push({ id: `${st}|trail`, label: `stop ${st} ATR · 1:2 + takip`, run: (c) => ({ signals: triangleSignals(c), params: { stopAtr: st, rr: 2, trail: 1.5 } }) });
    }
  if (strategy === 'emavolha')
    for (const useRsi of [false, true])
      for (const mode of ['touch', 'close'] as const)
        for (const st of [1.5, 2, 3]) {
          const tag = `${useRsi ? 'RSI 50 filtresi' : 'RSI yok'} · çıkış ${mode === 'touch' ? 'EMA 20 teması' : 'EMA 20 altı kapanış'}`;
          v.push({ id: `${useRsi}|${mode}|${st}`, label: `${tag} · acil stop ${st} ATR`, run: (c) => ({ signals: emaVolHaSignals(c, 1.2, useRsi), params: { stopAtr: st, rr: INF }, exit: ema20Exit(c, mode) }) });
        }
  return v;
}

const ALL_STRATS = [
  { id: 'ema2155', name: 'EMA 21/55 geri çekilmesi' },
  { id: 'bbstoch', name: 'Bollinger + Stokastik' },
  { id: 'hasmooth', name: 'Heikin Ashi Smoothed' },
  { id: 'rsimacd', name: 'RSI + MACD' },
  { id: 'rsimacdx', name: 'RSI + MACD · RSI üst/alt çizgide çıkış' },
  { id: 'hasmoothAdx', name: 'Heikin Ashi Smoothed + ADX' },
  { id: 'triangle', name: 'Üçgen formasyonları' },
  { id: 'emavolha', name: 'EMA 20/50 + hacim + Heikin Ashi' },
];
const ONLY = process.argv[2];
const STRATS = ONLY ? ALL_STRATS.filter((x) => x.id === ONLY) : ALL_STRATS;

interface T { ins: string; tf: Timeframe; half: 1 | 2; t: number; gross: number; net: number; bars: number }

function summary(ts: T[]) {
  const n = ts.length;
  const mean = (x: number[]) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : NaN);
  const net = ts.map((x) => x.net);
  const avg = mean(net);
  const sd = n > 1 ? Math.sqrt(net.reduce((a, b) => a + (b - avg) ** 2, 0) / (n - 1)) : NaN;
  const g = net.filter((x) => x > 0).reduce((a, b) => a + b, 0);
  const l = -net.filter((x) => x < 0).reduce((a, b) => a + b, 0);
  return {
    n,
    avg,
    gross: mean(ts.map((x) => x.gross)),
    win: n ? (100 * net.filter((x) => x > 0).length) / n : NaN,
    t: sd > 0 ? (avg / sd) * Math.sqrt(n) : NaN,
    pf: l ? g / l : NaN,
    bars: mean(ts.map((x) => x.bars)),
  };
}

/** Bir enstrüman × zaman dilimi dizisinde %1 riskle bileşik en büyük düşüş (%). */
function maxDD(ts: T[]): number {
  let eq = 1, peak = 1, dd = 0;
  for (const x of [...ts].sort((a, b) => a.t - b.t)) {
    eq *= 1 + 0.01 * x.net;
    peak = Math.max(peak, eq);
    dd = Math.max(dd, 1 - eq / peak);
  }
  return 100 * dd;
}

async function main() {
  const res = new Map<string, T[]>(); // `${strateji}|${seçenek}` → işlemler
  const dataInfo: string[] = [];
  for (const ins of INS) {
    const all = await loadAll(ins.symbol);
    for (const tf of TFS) {
      const cs = all[tf];
      if (!cs || cs.length < 300) continue;
      const mid = (cs[0].t + cs[cs.length - 1].t) / 2;
      const day = (u: number) => new Date(u * 1000).toISOString().slice(0, 10);
      const vol = cs.filter((x) => (x.v ?? 0) > 0).length > 0.8 * cs.length;
      dataInfo.push(`| ${ins.name} | ${tf} | ${day(cs[0].t)} – ${day(cs[cs.length - 1].t)} | ${cs.length} | ${vol ? 'var' : 'yok'} |`);
      for (const s of STRATS)
        for (const v of grid(s.id)) {
          const { signals, params, exit, target } = v.run(cs);
          const trades: BoxTrade[] = simulate(cs, signals, params, exit, target);
          const key = `${s.id}|${v.id}`;
          if (!res.has(key)) res.set(key, []);
          for (const t of trades) {
            if (t.outcome === 'open' || t.r == null || t.exitI == null) continue;
            res.get(key)!.push({ ins: ins.id, tf, half: cs[t.i].t < mid ? 1 : 2, t: cs[t.i].t, gross: t.r, net: t.r - costR(t, cs, ins, 1), bars: t.exitI - t.i });
          }
        }
      console.log(`${ins.name} ${tf}: ${cs.length} mum`);
    }
  }

  const md: string[] = [
    '# Yeni 5 strateji: stop/hedef testi (maliyet dahil)',
    '',
    'Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.',
    'Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.',
    '',
    '## Veri',
    '',
    '| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |',
    '|---|---|---|---|---|',
    ...dataInfo,
    '',
  ];
  const chosen: Record<string, { id: string; label: string }> = {};
  for (const s of STRATS) {
    const vs = grid(s.id);
    const rows = vs.map((v) => {
      const ts = res.get(`${s.id}|${v.id}`) ?? [];
      return { v, first: summary(ts.filter((x) => x.half === 1)), second: summary(ts.filter((x) => x.half === 2)), all: summary(ts), ts };
    });
    const pick = rows
      .filter((r) => r.v.eligible !== false && r.first.n >= 60)
      .sort((a, b) => b.first.avg - a.first.avg)[0];
    md.push(`## ${s.name}`, '');
    if (!pick) {
      md.push('Yeterli işlem yok.', '');
      continue;
    }
    chosen[s.id] = { id: pick.v.id, label: pick.v.label };
    md.push(
      `**Seçilen (ilk yarıya göre):** ${pick.v.label}`,
      '',
      `- İlk yarı: ${pick.first.n} işlem · net ort. ${sg(pick.first.avg)} R`,
      `- **İkinci yarı (doğrulama): ${pick.second.n} işlem · net ort. ${sg(pick.second.avg)} R · kazanan %${f(pick.second.win, 0)} · t ${f(pick.second.t, 1)}**`,
      `- Tüm veri: ${pick.all.n} işlem · net ${sg(pick.all.avg)} R (maliyetsiz ${sg(pick.all.gross)} R) · PF ${f(pick.all.pf)} · ort. süre ${f(pick.all.bars, 1)} mum`,
      '',
      'Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):',
      '',
      `| Zaman dilimi | ${INS.map((x) => x.name).join(' | ')} |`,
      `|---|${INS.map(() => '---').join('|')}|`,
    );
    for (const tf of TFS)
      md.push(
        `| ${tf} | ${INS.map((ins) => {
          const ts = pick.ts.filter((x) => x.ins === ins.id && x.tf === tf);
          const st = summary(ts);
          return st.n ? `${sg(st.avg)} · ${st.n} · %${f(maxDD(ts), 0)}` : '—';
        }).join(' | ')} |`,
      );
    md.push('', '<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>', '', '| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |', '|---|---|---|---|---|---|');
    for (const r of [...rows].sort((a, b) => b.first.avg - a.first.avg))
      md.push(`| ${r.v.label}${r.v.eligible === false ? ' (seçilemez)' : ''} | ${r.first.n} | ${sg(r.first.avg)} | ${r.second.n} | ${sg(r.second.avg)} | ${sg(r.all.gross)} |`);
    md.push('', '</details>', '');
    // Zaman dilimine göre en iyi seçenek (bilgi; ilk yarıya göre seçilir).
    md.push('Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:', '');
    for (const tf of TFS) {
      const per = rows
        .filter((r) => r.v.eligible !== false)
        .map((r) => ({ r, a: summary(r.ts.filter((x) => x.tf === tf && x.half === 1)), b: summary(r.ts.filter((x) => x.tf === tf && x.half === 2)) }))
        .filter((x) => x.a.n >= 20)
        .sort((x, y) => y.a.avg - x.a.avg)[0];
      if (per) md.push(`- ${tf}: ${per.r.v.label} → ilk yarı ${sg(per.a.avg)} R (${per.a.n}), ikinci yarı ${sg(per.b.avg)} R (${per.b.n})`);
    }
    md.push('');
  }
  mkdirSync('research/out', { recursive: true });
  writeFileSync(`research/out/sratr-yeni${ONLY ? '-' + ONLY : ''}.md`, md.join('\n'));
  writeFileSync('research/out/sratr-yeni.json', JSON.stringify(chosen, null, 1));
  console.log(JSON.stringify(chosen, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
