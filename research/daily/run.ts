// Günlük strateji karşılaştırması: research/data/*.csv → research/STRATEJI-KARSILASTIRMA.md (+ YILLIK).
// Karar kuralı sonuçlardan önce sabitlendi: research/STRATEJI-KARSILASTIRMA-KURAL.md.
// Çalıştırma: npx tsx research/daily/run.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { INSTRUMENTS, type Instrument } from './instruments';
import { buyHold, netR, stats, type CostMode, type Stats } from './metrics';
import { CANDIDATES, type Bar, type Trade } from './strategies';

const WARMUP = 260;
const BAD_LIMIT = 0.02;

function load(ins: Instrument): { bars: Bar[]; rawFirst: string; rawLast: string; validFrom: string } {
  const lines = readFileSync(`research/data/${ins.id}.csv`, 'utf8').trim().split('\n').slice(1);
  const meta = JSON.parse(readFileSync('research/data/meta.json', 'utf8'))[ins.id];
  const off: number = meta.gmtoffset ?? 0;
  const all: Bar[] = lines.map((l) => {
    const [date, t, o, h, lo, c] = l.split(',');
    // t, borsanın yerel saatine kaydırılır (haftalık birleştirme ve kapanış zamanı hesapları yerel güne göre olsun).
    return { date, t: Number(t) + off, o: +o, h: +h, l: +lo, c: +c };
  });
  // OHLC kalitesi: yüksek ≤ düşük ya da açılış = kapanış = yüksek olan mumlar "eksik". Sonraki tüm yıllarda
  // eksik oranı ≤ %2 olan ilk yıldan başlanır.
  const years = new Map<string, [number, number]>();
  for (const b of all) {
    const y = b.date.slice(0, 4);
    const e = years.get(y) ?? [0, 0];
    e[0]++;
    if (b.h <= b.l || (b.o === b.c && b.c === b.h)) e[1]++;
    years.set(y, e);
  }
  const ys = [...years.keys()].sort();
  let startYear = ys[0];
  for (const y of ys) if (years.get(y)![1] / years.get(y)![0] > BAD_LIMIT) startYear = String(+y + 1);
  const bars = all.filter((b) => b.date.slice(0, 4) >= startYear);
  return { bars, rawFirst: all[0].date, rawLast: all[all.length - 1].date, validFrom: bars[0].date };
}

const f = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '—');
const sgn = (x: number, d = 3) => (Number.isFinite(x) ? (x > 0 ? '+' : '') + f(x, d) : '—');

interface Row { cand: string; ins: string; gross: Stats; net: Stats; literal: Stats; trades: Trade[]; costModes: Partial<Record<CostMode, number>> }

function main() {
  const out: string[] = [];
  const yearly: string[] = ['# Günlük strateji karşılaştırması — yıllık tablolar', '', 'Net R (maliyet sonrası, temkinli swap), giriş yılına göre. Parantez: işlem sayısı.', ''];
  const rows: Row[] = [];
  const data = INSTRUMENTS.map((ins) => ({ ins, ...load(ins) }));
  const windows = new Map<string, { start: number; end: number }>();
  const bh = new Map<string, ReturnType<typeof buyHold>>();
  const sens: { cand: string; ins: string; label: string; avg: number; n: number }[] = [];

  for (const d of data) {
    const start = WARMUP, end = d.bars.length - 1;
    windows.set(d.ins.id, { start, end });
    bh.set(d.ins.id, buyHold(d.bars, start, end));
    for (const cand of CANDIDATES) {
      const inWin = (tr: Trade[]) => tr.filter((t) => t.i >= start);
      const tr = inWin(cand.run(d.bars));
      const rs = (m: CostMode) => tr.map((t) => netR(t, d.bars, d.ins, m));
      const costModes: Row['costModes'] = {};
      for (const m of ['none', 'spreadOnly', 'points', 'annualPct', 'conservative'] as CostMode[]) {
        const r = rs(m);
        costModes[m] = r.length ? r.reduce((a, b) => a + b, 0) / r.length : NaN;
      }
      const lit = tr.map((t) => netR(t, d.bars, d.ins, 'conservative', 'fixed'));
      rows.push({ cand: cand.id, ins: d.ins.id, gross: stats(tr, rs('none'), d.bars, start, end), net: stats(tr, rs('conservative'), d.bars, start, end), literal: stats(tr, lit, d.bars, start, end), trades: tr, costModes });
      for (const v of cand.variants) {
        const vt = inWin(v.run(d.bars));
        const r = vt.map((t) => netR(t, d.bars, d.ins, 'conservative'));
        sens.push({ cand: cand.id, ins: d.ins.id, label: v.label, avg: r.length ? r.reduce((a, b) => a + b, 0) / r.length : NaN, n: r.length });
      }
    }
  }

  // ---- Karar kuralı (ön kayıt) ----
  const row = (c: string, i: string) => rows.find((r) => r.cand === c && r.ins === i)!;
  const c1 = (s: Stats) => s.h1.n > 0 && s.h2.n > 0 && s.h1.avg > 0 && s.h2.avg > 0;
  const c2 = (s: Stats) => s.t >= 2;
  const c3 = (s: Stats) => s.maxDD < 30;
  const decide = (pick: (r: Row) => Stats) =>
    CANDIDATES.map((cand) => {
      const rs = INSTRUMENTS.map((ins) => row(cand.id, ins.id));
      const ok = rs.filter((r) => c1(pick(r)) && c3(pick(r)));
      const pass = ok.length >= 2;
      const score = ok.length ? ok.reduce((a, r) => a + pick(r).avg * Math.sqrt(pick(r).perYear), 0) / ok.length : NaN;
      const fragile = sens.filter((x) => x.cand === cand.id && ok.some((r) => r.ins === x.ins) && Math.sign(x.avg) !== Math.sign(row(cand.id, x.ins).net.avg));
      return { cand, rs, ok, pass, score, fragile };
    });
  const decision = decide((r) => r.net);
  const literal = decide((r) => r.literal);
  const decisionTable = (dec: typeof decision, pick: (r: Row) => Stats) => {
    const t = ['| Aday | Japan 225 | S&P 500 | Nasdaq 100 | Sonuç | Sıralama puanı |', '|---|---|---|---|---|---|'];
    for (const d of dec) {
      const cell = (r: Row) => `${c1(pick(r)) ? '✓' : '✗'}1 ${c2(pick(r)) ? '✓' : '✗'}2 ${c3(pick(r)) ? '✓' : '✗'}3`;
      const res = d.pass ? (d.fragile.length ? '**geçer** (kırılgan)' : '**geçer**') : 'kalır';
      t.push(`| ${d.cand.id} · ${d.cand.name} | ${d.rs.map(cell).join(' | ')} | ${res} | ${d.pass ? f(d.score, 3) : '—'} |`);
    }
    return t;
  };

  out.push('# Günlük strateji karşılaştırması (maliyet dahil)', '');
  out.push(`Oluşturma: ${new Date().toISOString().slice(0, 10)} · Kod: \`research/daily/\` · Karar kuralı (ön kayıt): \`STRATEJI-KARSILASTIRMA-KURAL.md\` · Yıllık tablolar: \`STRATEJI-KARSILASTIRMA-YILLIK.md\``, '');
  out.push('> Geçmiş sonuçlar geleceği garanti etmez. "Maliyetler hariç" işaretli sütunlar spread, kayma ve swap içermez.', '');

  out.push('## Karar kuralının sonucu', '', '**Maliyetler fiyata oranlı** (spread ve puan/gece swap bugünkü fiyatta gözlendi; her işlemin fiyatına ölçeklendi):', '', ...decisionTable(decision, (r) => r.net));
  out.push('', '**Ön kayıt metnine harfiyen (sabit puan)** — yalnız karşılaştırma için; 1970–1990\'larda endeks düşükken maliyeti onlarca kat abartır:', '', ...decisionTable(literal, (r) => r.literal));
  out.push('', '> **Ön kayıttan sapma:** Ön kayıt spread\'i "endeks puanı" olarak tanımladı. Bugün gözlenen puanı 1973\'teki (S&P 500 ≈ 100) fiyata uygulamak maliyeti gerçekçi olmayan biçimde büyütüyor; bu sonuçlar görüldükten sonra fark edildi ve maliyet fiyata oranlandı. Karar kuralının kendisi değişmedi. İki uygulamanın sonucu yukarıda ayrı ayrı veriliyor.');
  out.push('', '1 = maliyet sonrası ort. R ilk ve ikinci yarıda > 0 · 2 = t ≥ 2 (sağlamazsa "kanıt yetersiz", elenmez) · 3 = %1 riskte en büyük düşüş < %30.',
    'Aday, en az iki enstrümanda 1 ve 3 birlikte sağlanırsa geçer. Sıralama puanı: ort. net R × √(yılda işlem), bu enstrümanların ortalaması.',
    `Toplam ${CANDIDATES.length} aday × ${INSTRUMENTS.length} enstrüman = ${CANDIDATES.length * INSTRUMENTS.length} deneme: en iyi sonuçta seçim yanlılığı var, temkinli yorumlanmalı.`, '');

  // ---- Otomatik özet (sayılar tablolardan) ----
  const name = (id: string) => INSTRUMENTS.find((i) => i.id === id)!.name;
  out.push('', '## Özet', '');
  for (const d of decision) {
    const okNames = d.ok.map((r) => name(r.ins));
    const weakT = d.ok.filter((r) => !c2(r.net)).map((r) => name(r.ins));
    const ann = d.ok.map((r) => `${name(r.ins)} ≈ %${f(r.net.avg * r.net.perYear, 1)}/yıl`);
    const jp = row(d.cand.id, 'jp225');
    if (d.pass)
      out.push(`- **${d.cand.id} · ${d.cand.name}: geçer** — 1 ve 3. şart: ${okNames.join(', ')}.` +
        `${weakT.length ? ` t < 2 (kanıt yetersiz): ${weakT.join(', ')}.` : ' t ≥ 2 bu enstrümanlarda.'}` +
        ` %1 riskte yaklaşık getiri (ort. net R × yılda işlem): ${ann.join(', ')}.` +
        `${c1(jp.net) ? '' : ` Japan 225'te geçmiyor (1. yarı ${sgn(jp.net.h1.avg)}, 2. yarı ${sgn(jp.net.h2.avg)}).`}`);
    else {
      const why = d.rs.map((r) => `${name(r.ins)} ${sgn(r.net.h1.avg)}/${sgn(r.net.h2.avg)}${c3(r.net) ? '' : `, düşüş %${f(r.net.maxDD, 0)}`}`);
      out.push(`- **${d.cand.id} · ${d.cand.name}: kalır** — yarı dönem net R (1./2.): ${why.join('; ')}.`);
    }
  }
  out.push('', 'Karşılaştırma: al ve tut (maliyetler ve temettü hariç) ' + INSTRUMENTS.map((i) => `${i.name} yıllık %${f(bh.get(i.id)!.cagr, 1)}, en büyük düşüş %${f(bh.get(i.id)!.maxDD, 0)}`).join('; ') + '.',
    'Stratejilerin yıllık getiri tahmini %1 riskle ve işlemler üst üste binmeden hesaplandı; risk artırılırsa getiri ve düşüş birlikte büyür.',
    'Sıralama puanı işlem başına R ile yılda işlem sayısını birleştirir; çok az işlemli adaylarda (ör. TSMOM, yılda ~1) puan tek tek işlemlere bağlıdır.', '');

  out.push('## Veri', '', '| Enstrüman | Ham veri | Kullanılan (OHLC tam) | Test penceresi (ısınma 260 gün sonrası) | Mum |', '|---|---|---|---|---|');
  for (const d of data) {
    const w = windows.get(d.ins.id)!;
    out.push(`| ${d.ins.name} | ${d.rawFirst} – ${d.rawLast} | ${d.validFrom} itibarıyla | ${d.bars[w.start].date} – ${d.bars[w.end].date} | ${w.end - w.start + 1} |`);
  }
  out.push('', 'Kaynak: Yahoo Finance günlük (nakit endeks). Eksik OHLC (yüksek ≤ düşük ya da açılış = kapanış = yüksek) oranı %2\'yi aşan son yıldan sonrası kullanıldı.', '');

  out.push('## Maliyet varsayımları', '', '| Enstrüman | Spread (puan) | Spread kaynağı | Swap |', '|---|---|---|---|');
  for (const ins of INSTRUMENTS) out.push(`| ${ins.name} | ${f(ins.spread, 1)} | ${ins.spreadNote} | ${ins.swapNote} |`);
  out.push('', 'İşlem başına `1,5 × spread` (spread + 0,5 × spread kayma). Swap her takvim gecesi (Cuma → Pazartesi 3 gece). Karar için iki swap yorumundan yüksek olanı (temkinli) kullanıldı. Komisyon 0.', '');

  for (const ins of INSTRUMENTS) {
    out.push(`## ${ins.name}`, '', '| Aday | İşlem | Yılda | İsabet % | Ort. R (maliyetler hariç) | **Ort. net R** | t | Toplam net R | PF | En uzun kayıp serisi | En büyük düşüş %1 risk | Piyasada % | 1. yarı net R (n) | 2. yarı net R (n) |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const cand of CANDIDATES) {
      const r = row(cand.id, ins.id);
      const s = r.net;
      out.push(`| ${cand.id} · ${cand.name} | ${s.n} | ${f(s.perYear, 1)} | ${f(s.win, 1)} | ${sgn(r.gross.avg)} | **${sgn(s.avg)}** | ${f(s.t)} | ${sgn(s.total, 1)} | ${f(s.pf)} | ${s.maxLossStreak} | %${f(s.maxDD, 1)} | %${f(s.inMarket, 1)} | ${sgn(s.h1.avg)} (${s.h1.n}) | ${sgn(s.h2.avg)} (${s.h2.n}) |`);
    }
    const b = bh.get(ins.id)!;
    const w = windows.get(ins.id)!;
    out.push(`| F · Al ve tut | — | — | — | — | — | — | — | — | — | %${f(b.maxDD, 1)} (fiyat) | %100 | yıllık %${f(b.cagr, 1)}, toplam %${f(b.total, 0)} (maliyetler hariç, temettü hariç) | |`, '');
    out.push(`Pencere: ${data.find((x) => x.ins.id === ins.id)!.bars[w.start].date} – ${data.find((x) => x.ins.id === ins.id)!.bars[w.end].date}. İsabet ve PF net R'ye göre.`, '');
  }

  out.push('## Maliyet duyarlılığı (ort. R/işlem, tüm dönem)', '', '| Aday | Enstrüman | Maliyetler hariç | Yalnız spread + kayma | Swap: puan/gece | Swap: yıllık % | Temkinli (karar) |', '|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const ins = INSTRUMENTS.find((i) => i.id === r.ins)!;
    const has = (m: 'points' | 'annualPct') => ins.swapModes.includes(m);
    out.push(`| ${r.cand} | ${ins.name} | ${sgn(r.costModes.none!)} | ${sgn(r.costModes.spreadOnly!)} | ${has('points') ? sgn(r.costModes.points!) : '—'} | ${has('annualPct') ? sgn(r.costModes.annualPct!) : '—'} | ${sgn(r.costModes.conservative!)} |`);
  }
  out.push('');

  out.push('## Parametre duyarlılığı (seçimde kullanılmadı)', '', '| Aday | Enstrüman | Taban net R | Değişken | Net R (n) |', '|---|---|---|---|---|');
  for (const s of sens) out.push(`| ${s.cand} | ${INSTRUMENTS.find((i) => i.id === s.ins)!.name} | ${sgn(row(s.cand, s.ins).net.avg)} | ${s.label} | ${sgn(s.avg)} (${s.n}) |`);
  out.push('', 'Geçen adaylarda, 1. ve 3. şartı sağlayan enstrümanlarda işaret değişirse "kırılgan".', '');
  for (const d of decision.filter((x) => x.pass))
    out.push(`- ${d.cand.id}: ${d.fragile.length ? `kırılgan — ${d.fragile.map((s) => `${INSTRUMENTS.find((i) => i.id === s.ins)!.name} ${s.label} ${sgn(s.avg)}`).join(', ')}` : 'işaret değişmiyor'}`);
  out.push('');

  out.push('## Sınırlar', '',
    '- **Nakit endeks ≠ CFD.** Test Yahoo nakit endeks verisiyle; FxPro CFD fiyatı, seans saatleri ve kapanışı farklıdır. Japan 225 CFD neredeyse 24 saat işlem görür, nakit endeks değil.',
    '- **Temettü yok.** Nakit endeks fiyat endeksidir; CFD\'de temettü düzeltmesi ve finansman ayrı işler. Al ve tut getirisi temettü hariç.',
    '- **Günlük mumda mum içi sıra bilinmez.** Stop mum içinde kontrol edilir; aynı mumda kural çıkışı da olursa stop sayılır (temkinli). Boşlukla açılışta açılış fiyatından çıkılır.',
    '- **Maliyetler kısmen doğrulanmadı.** Japan 225 swap birimi ile S&P 500 swap ve Nasdaq 100 spread/swap değerleri varsayım (bkz. Maliyet varsayımları).',
    '- **Takvim bilgisi.** Ay sonu ve ayın n. işlem günü verideki işlem günlerinden belirlenir; canlıda borsa tatil takvimi önceden bilinmelidir.',
    '- **Düşük işlem sayısı.** Bazı adaylarda yılda birkaç işlem var; t-istatistiği ve yarı dönem sonuçları bu yüzden oynaktır.',
    `- **Çoklu deneme.** ${CANDIDATES.length * INSTRUMENTS.length} deneme yapıldı; en iyi görünen sonuçta şans payı büyüktür.`,
    '- **%1 risk düşüş hesabı** yalnız bu stratejinin işlemleriyle, pozisyon büyüklüğü her işlemde güncel bakiyenin %1\'i kabulüyle yapıldı; kaldıraç ve teminat sınırı hesaba katılmadı.', '');

  writeFileSync('research/STRATEJI-KARSILASTIRMA.md', out.join('\n'));

  for (const ins of INSTRUMENTS) {
    const ys = new Set<string>();
    for (const cand of CANDIDATES) for (const y of row(cand.id, ins.id).net.yearly.keys()) ys.add(y);
    const years = [...ys].sort();
    yearly.push(`## ${ins.name}`, '', `| Yıl | ${CANDIDATES.map((c) => c.id).join(' | ')} |`, `|---|${CANDIDATES.map(() => '---').join('|')}|`);
    for (const y of years) yearly.push(`| ${y} | ${CANDIDATES.map((c) => { const e = row(c.id, ins.id).net.yearly.get(y); return e ? `${sgn(e.r, 1)} (${e.n})` : '—'; }).join(' | ')} |`);
    yearly.push('');
  }
  writeFileSync('research/STRATEJI-KARSILASTIRMA-YILLIK.md', yearly.join('\n'));
  console.log(out.slice(0, 20).join('\n'));
}

main();
