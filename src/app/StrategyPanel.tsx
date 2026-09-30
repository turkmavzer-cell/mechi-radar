import { useState } from 'react';
import type { BoxTrade } from '../core/boxes';
import { formatPrice, formatTime } from '../core/labels';
import type { Candle } from '../core/types';

const PAGE = 20;

/** Süreyi okunur yazar: 14 saat, 5 gün, 3 hafta, 11 ay, 2 yıl. */
export function durationText(seconds: number): string {
  const h = seconds / 3600;
  if (h < 1) return `${Math.max(1, Math.round(seconds / 60))} dk`;
  if (h < 48) return `${Math.round(h)} saat`;
  const d = h / 24;
  if (d < 14) return `${Math.round(d)} gün`;
  if (d < 60) return `${Math.round(d / 7)} hafta`;
  if (d < 730) return `${Math.round(d / 30.4)} ay`;
  return `${(d / 365).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} yıl`;
}

/** Takip eden kâr alda takip mesafesi (ATR katı); geçmiş veri testine göre seçildi. */
export const TRAIL_ATR = 1.5;

export const fmtR = (r: number) => `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}R`;

interface Props {
  title: string;
  /** Tek satırlık kural özeti. */
  rule: string;
  trades: BoxTrade[];
  /** Kapanmış mumlar (işlem indeksleri bu diziye göre). */
  candles: Candle[];
  rr: number;
}

export function StrategyPanel({ title, rule, trades, candles, rr }: Props) {
  const [limit, setLimit] = useState(PAGE);
  const done = trades.filter((x) => x.outcome !== 'open');
  const wins = done.filter((x) => x.outcome === 'tp').length;
  const rOf = (x: BoxTrade) => x.r ?? (x.outcome === 'tp' ? rr : -1);
  const totalR = done.reduce((a, x) => a + rOf(x), 0);
  // Toplam sonucun oluştuğu süre: ilk girişten son kapanan işleme kadar.
  const span = done.length ? candles[done[done.length - 1].exitI!]?.t - candles[done[0].i].t : 0;
  const list = trades.slice().reverse();
  const cls = totalR > 0 ? 'pos' : totalR < 0 ? 'neg' : '';

  return (
    <>
      <h2>{title}</h2>
      <p className="legend small muted">{rule}</p>
      {done.length > 0 && (
        <div className="card score">
          <div>
            <b className={`big ${cls}`}>{fmtR(totalR)}</b>
            <span className="muted small">{durationText(span)} içinde</span>
          </div>
          <div>
            <b className="big">{done.length}</b>
            <span className="muted small">işlem</span>
          </div>
          <div>
            <b className="big">%{Math.round((100 * wins) / done.length)}</b>
            <span className="muted small">
              kazanan işlem
              <br />
              {wins} kâr · {done.length - wins} stop
            </span>
          </div>
        </div>
      )}
      {list.length ? (
        <div className="list">
          {list.slice(0, limit).map((x) => {
            const end = x.exitI != null ? candles[x.exitI]?.t : undefined;
            const took = end != null ? durationText(end - candles[x.i].t) : '';
            return (
              <div key={x.i} className="row signal">
                <span className={`arrow ${x.dir}`}>{x.dir === 'up' ? '▲' : '▼'}</span>
                <span className="grow">
                  <span className="title">
                    {x.dir === 'up' ? 'LONG' : 'SHORT'} {formatPrice(x.entry)}
                  </span>
                  <span className="sub">
                    {x.stop === x.entry ? 'Stop yok' : `Stop ${formatPrice(x.stop)}`} · {Number.isFinite(x.target) ? `Hedef ${formatPrice(x.target)}` : 'Çıkış kurala göre'}
                  </span>
                  <span className="perf">
                    <b className={x.outcome === 'tp' ? 'pos' : x.outcome === 'sl' ? 'neg' : 'muted'}>
                      {x.outcome === 'tp' ? `✓ ${fmtR(rOf(x))}` : x.outcome === 'sl' ? `✕ ${fmtR(rOf(x))}` : x.trailing ? `Takipte · stop ${formatPrice(x.trailStop)}` : 'Açık'}
                    </b>
                    {x.exitPrice != null && (
                      <span className="muted">
                        {' '}
                        · {x.exitPrice >= x.entry === (x.dir === 'up') ? '+' : '−'}
                        {formatPrice(Math.abs(x.exitPrice - x.entry))} puan
                      </span>
                    )}
                    {took && <span className="muted"> · {took}</span>}
                  </span>
                </span>
                <span className="muted small">{formatTime(candles[x.i].t)}</span>
              </div>
            );
          })}
          {list.length > limit && (
            <button className="row more" onClick={() => setLimit(list.length)}>
              Tümünü göster ({list.length})
            </button>
          )}
        </div>
      ) : (
        <div className="empty">Bu zaman diliminde sinyal yok.</div>
      )}
    </>
  );
}
