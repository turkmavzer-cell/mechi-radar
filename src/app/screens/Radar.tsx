import { formatPrice } from '../../core/labels';
import type { Role } from '../lib/auth';
import type { RadarApi } from '../lib/data';
import type { OpenTarget } from '../App';
import { agoText, SignInCard, SignalRow, TrendChip } from '../ui';

interface Props {
  api: RadarApi;
  role: Role;
  onOpen: (t: OpenTarget) => void;
}

export function RadarScreen({ api, role, onOpen }: Props) {
  const { data, loading, error } = api;
  const watch = data.config?.watchlist ?? [];
  const names = new Map(watch.map((w) => [w.symbol, w.name]));
  const recent = data.signals.filter((s) => names.has(s.symbol)).slice(0, 5);

  return (
    <div>
      <header className="top">
        <div>
          <h1>Mechi Radar</h1>
          <div className="muted small">Son kontrol: {agoText(data.state?.updatedAt)}</div>
        </div>
        {(loading || role === 'loading') && <span className="spin muted">⟳</span>}
      </header>

      {error && <div className="notice err">{error}</div>}
      <SignInCard role={role} reason="İzleme listeni görmek ve telefona bildirim almak için Google hesabınla giriş yap." />
      {role === 'owner' && !data.state && !loading && !error && (
        <div className="notice">Henüz veri yok. Sunucu ilk kontrolü yaptığında (en geç 5 dakika) burada görünecek.</div>
      )}

      <h2>Son sinyaller</h2>
      {recent.length === 0 ? (
        <div className="empty">Henüz yeni sinyal yok.</div>
      ) : (
        <div className="list">
          {recent.map((e) => (
            <SignalRow
              key={`${e.symbol}${e.tf}${e.strategy}${e.time}`}
              e={e}
              name={names.get(e.symbol)}
              onClick={() => onOpen({ symbol: e.symbol, name: names.get(e.symbol) ?? e.symbol })}
            />
          ))}
        </div>
      )}

      <h2>İzleme listem</h2>
      <div className="list">
        {watch.map((w) => {
          const st = data.state?.symbols[w.symbol];
          const ch = st?.changePct;
          return (
            <button key={w.symbol} className="row" onClick={() => onOpen({ symbol: w.symbol, name: w.name })}>
              <span className="grow">
                <span className="title">
                  {w.name} {w.alerts.length > 0 && <span className="bell" title="Mail açık">🔔</span>}
                </span>
                <span className="chips">
                  <TrendChip tf="15m" trend={st?.tf['15m']?.align} />
                  <TrendChip tf="4h" trend={st?.tf['4h']?.align} />
                  <TrendChip tf="1d" trend={st?.tf['1d']?.align} />
                </span>
              </span>
              <span className="price">
                <span>{formatPrice(st?.price)}</span>
                {st?.error ? (
                  <span className="small muted">veri alınamadı</span>
                ) : (
                  ch != null && (
                    <span className={`small ${ch >= 0 ? 'pos' : 'neg'}`}>
                      {ch >= 0 ? '+' : ''}
                      {ch.toLocaleString('tr-TR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%
                    </span>
                  )
                )}
              </span>
            </button>
          );
        })}
        {watch.length === 0 && <div className="empty">Liste boş. Keşfet'ten enstrüman ekleyebilirsin.</div>}
      </div>
      <p className="legend muted small">▲ yükseliş dizilimi · ▼ düşüş dizilimi · – belirsiz (EMA 5·8·13)</p>
    </div>
  );
}
