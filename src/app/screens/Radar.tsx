import { useMemo } from 'react';
import { formatPrice, formatPct } from '../../core/labels';
import type { SignalEvent, Timeframe } from '../../core/types';
import { DEFAULT_CONFIG } from '../../../server/defaults';
import type { Role } from '../lib/auth';
import type { RadarApi } from '../lib/data';
import { useLive } from '../lib/live';
import type { OpenTarget } from '../App';
import { SignalRow, SignInCard, SkeletonList, TrendChip, clockText } from '../ui';

interface Props {
  api: RadarApi;
  role: Role;
  onOpen: (t: OpenTarget) => void;
}

const TFS: Timeframe[] = ['15m', '4h', '1d'];
const RECENT_HOURS = 24;

export function RadarScreen({ api, role, onOpen }: Props) {
  const watch = api.data.config?.watchlist ?? DEFAULT_CONFIG.watchlist;
  const symbols = useMemo(() => watch.map((w) => w.symbol), [watch]);
  const names = useMemo(() => new Map(watch.map((w) => [w.symbol, w.name])), [watch]);
  const live = useLive('radar', symbols, TFS, 2 * 60 * 1000);

  // Son 24 saatte izleme listesinde oluşan tüm sinyaller (tüm stratejiler), en yeniden eskiye.
  const recent = useMemo(() => {
    const since = Date.now() / 1000 - RECENT_HOURS * 3600;
    const list: SignalEvent[] = [];
    for (const s of Object.values(live.data)) list.push(...s.events.filter((e) => e.time >= since));
    return list.sort((a, b) => b.time - a.time).slice(0, 8);
  }, [live.data]);

  const first = live.loading && !live.updatedAt;

  return (
    <div>
      <header className="top">
        <div className="brand">
          <span className="logo" aria-hidden>
            ◎
          </span>
          <div>
            <h1>Mechi Radar</h1>
            <div className="muted small">
              {live.loading
                ? `Güncelleniyor… ${live.progress.done}/${live.progress.total}`
                : live.updatedAt
                  ? `Güncellendi ${clockText(live.updatedAt)}`
                  : 'Henüz güncellenmedi'}
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={live.refresh} aria-label="Yenile" disabled={live.loading}>
          <span className={live.loading ? 'spin' : ''}>⟳</span>
        </button>
      </header>

      {api.error && <div className="notice err">{api.error}</div>}
      <SignInCard role={role} reason="Kendi izleme listeni görmek ve telefona bildirim almak için Google hesabınla giriş yap." />

      <h2>Son {RECENT_HOURS} saatin sinyalleri</h2>
      {first ? (
        <SkeletonList rows={3} />
      ) : recent.length === 0 ? (
        <div className="empty">Son {RECENT_HOURS} saatte 15dk, 4s ve 1g mumlarında yeni sinyal yok.</div>
      ) : (
        <div className="list">
          {recent.map((e) => (
            <SignalRow
              key={`${e.symbol}${e.tf}${e.strategy}${e.time}`}
              e={e}
              name={names.get(e.symbol)}
              showStrategy
              onClick={() => onOpen({ symbol: e.symbol, name: names.get(e.symbol) ?? e.symbol })}
            />
          ))}
        </div>
      )}

      <h2>İzleme listem</h2>
      {first ? (
        <SkeletonList rows={watch.length || 4} />
      ) : (
        <div className="list">
          {watch.map((w) => {
            const s = live.data[w.symbol];
            const err = live.errors[w.symbol];
            const ch = s?.changePct;
            return (
              <button key={w.symbol} className="row" onClick={() => onOpen({ symbol: w.symbol, name: w.name })}>
                <span className="grow">
                  <span className="title">
                    {w.name} {w.alerts.length > 0 && <span className="bell" title="Bildirim açık">🔔</span>}
                  </span>
                  <span className="chips">
                    {TFS.map((tf) => (
                      <TrendChip key={tf} tf={tf} trend={s?.tf[tf]?.ema5813Dir ?? s?.tf[tf]?.align} />
                    ))}
                  </span>
                </span>
                <span className="price">
                  <span>{formatPrice(s?.price)}</span>
                  {ch != null ? (
                    <span className={`small ${ch >= 0 ? 'pos' : 'neg'}`}>{formatPct(ch)}</span>
                  ) : (
                    err && <span className="small muted">veri yok</span>
                  )}
                </span>
              </button>
            );
          })}
          {watch.length === 0 && <div className="empty">Liste boş. Keşfet'ten enstrüman ekleyebilirsin.</div>}
        </div>
      )}
      <p className="legend muted small">
        Oklar EMA 5·8·13'ün son sinyal yönünü gösterir; yön, ters yönde yeni sinyal gelene kadar geçerlidir.
      </p>
    </div>
  );
}
