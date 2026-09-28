import { useMemo, useState } from 'react';
import { TF_LABEL } from '../core/candles';
import { LAB, score } from '../core/lab';
import { RESEARCH, RESEARCH_SYMBOLS } from '../core/research';
import type { Candle, Timeframe } from '../core/types';

/** En az bu kadar sinyali olmayan strateji karnede sıralanmaz (istatistik anlamsız). */
const MIN_N = 8;

function edgeClass(edge: number): string {
  if (!Number.isFinite(edge)) return 'muted';
  if (edge >= 3) return 'pos';
  if (edge <= -3) return 'neg';
  return 'muted';
}

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toLocaleString('tr-TR', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');
const sign = (v: number) => (v > 0 ? '+' : '') + fmt(v);

/**
 * Strateji karnesi: bu enstrümanın yüklü geçmişinde her stratejinin sinyalden 10 mum sonra
 * doğru yönde kalma oranı, rastgele girişe göre farkı ve genel araştırmadaki sonucu.
 */
export function ScoreCard({ candles, tf, name }: { candles: Candle[]; tf: Timeframe; name: string }) {
  const [all, setAll] = useState(false);
  const rows = useMemo(() => {
    if (candles.length < 150) return [];
    return LAB.map((s) => {
      const sc = score(candles, s.run(candles));
      const r = RESEARCH[s.id]?.[tf];
      return {
        id: s.id,
        name: s.name,
        rule: s.rule,
        n: sc.n,
        win: sc.win[10],
        base: sc.base10,
        edge: sc.win[10] - sc.base10,
        avg: sc.avg[10],
        general: r && r[0] >= 100 ? r[1] - r[2] : NaN,
      };
    })
      .filter((r) => r.n >= MIN_N)
      .sort((a, b) => b.edge - a.edge);
  }, [candles, tf]);

  if (!rows.length) return <div className="empty">Karne için bu zaman diliminde yeterli geçmiş yok.</div>;
  const shown = all ? rows : rows.slice(0, 8);

  return (
    <div className="card score">
      <div className="small muted">
        {name} · {TF_LABEL[tf]} · son {candles.length} mum. <b>İsabet</b>: sinyalden 10 mum sonra fiyatın sinyal yönünde olma oranı.{' '}
        <b>Fark</b>: aynı dönemde rastgele girişe göre puan farkı. <b>Genel</b>: {RESEARCH_SYMBOLS} enstrümanlık araştırmadaki fark.
      </div>
      <div className="score-head small muted">
        <span className="grow">Strateji</span>
        <span>İsabet</span>
        <span>Fark</span>
        <span>Genel</span>
      </div>
      {shown.map((r) => (
        <div key={r.id} className="score-row">
          <span className="grow">
            <b>{r.name}</b>
            <span className="small muted">
              {' '}
              · {r.n} sinyal · ort. {sign(r.avg)}%
            </span>
          </span>
          <span>%{fmt(r.win, 0)}</span>
          <b className={edgeClass(r.edge)}>{sign(r.edge)}</b>
          <span className={edgeClass(r.general)}>{Number.isFinite(r.general) ? sign(r.general) : '—'}</span>
        </div>
      ))}
      {rows.length > 8 && (
        <button className="btn ghost-plain" onClick={() => setAll(!all)}>
          {all ? 'Daha az göster' : `Tümünü göster (${rows.length})`}
        </button>
      )}
      <div className="small muted">
        Geçmiş sonuç geleceği garanti etmez. ±3 puandan küçük farklar çoğunlukla tesadüftür; az sinyalli satırlara güvenme. İşlem
        maliyetleri (spread, komisyon) dahil değildir.
      </div>
    </div>
  );
}
