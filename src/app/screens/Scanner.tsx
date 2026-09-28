import { useMemo, useState } from 'react';
import { TF_LABEL, TF_SECONDS } from '../../core/candles';
import { formatPct, formatPrice, formatTime, signalTitle, strategyName } from '../../core/labels';
import type { LiveSummary } from '../../core/live';
import type { SignalEvent, Timeframe } from '../../core/types';
import { DEFAULT_CONFIG } from '../../../server/defaults';
import type { OpenTarget } from '../App';
import type { RadarApi } from '../lib/data';
import { useLive } from '../lib/live';
import { clockText, shortSymbol, SkeletonList } from '../ui';

/** Son 3 mum içinde oluşan sinyal "yeni" sayılır. */
const RECENT_BARS = 3;

export function ScannerScreen({ api, onOpen }: { api: RadarApi; onOpen: (t: OpenTarget) => void }) {
  const scanner = api.data.config?.scanner ?? DEFAULT_CONFIG.scanner;
  const tfs: Timeframe[] = scanner.timeframes.length ? scanner.timeframes : ['4h', '1d'];
  const [tf, setTf] = useState<Timeframe>(tfs[0]);
  // Tarama ağır olduğu için otomatik değil, düğmeyle başlar; son sonuç önbellekten gösterilir.
  const live = useLive('scanner', scanner.symbols, tfs, undefined, false);

  const rows = useMemo(() => {
    return scanner.symbols
      .map((symbol) => {
        const s: LiveSummary | undefined = live.data[symbol];
        const st = s?.tf[tf];
        const events = (s?.events ?? []).filter((e) => e.tf === tf);
        const last = events[events.length - 1] ?? null;
        const recent: SignalEvent[] = st
          ? events.filter((e) => st.time - e.time <= (RECENT_BARS - 1) * TF_SECONDS[tf]).reverse()
          : [];
        return { symbol, s, st, last, recent };
      })
      .filter((r) => r.s)
      .sort((a, b) => b.recent.length - a.recent.length || (b.last?.time ?? 0) - (a.last?.time ?? 0));
  }, [live.data, scanner.symbols, tf]);

  const fresh = rows.filter((r) => r.recent.length);
  const rest = rows.filter((r) => !r.recent.length);
  const pct = live.progress.total ? (live.progress.done / live.progress.total) * 100 : 0;

  const renderRow = (r: (typeof rows)[number]) => {
    const e = r.recent[0] ?? r.last;
    const dir = r.st?.ema5813Dir ?? r.st?.align;
    return (
      <button key={r.symbol} className="row" onClick={() => onOpen({ symbol: r.symbol, name: shortSymbol(r.symbol) })}>
        <span className={`arrow ${e?.dir ?? dir ?? 'neutral'}`}>{(e?.dir ?? dir) === 'up' ? '▲' : (e?.dir ?? dir) === 'down' ? '▼' : '–'}</span>
        <span className="grow">
          <span className="title">
            {shortSymbol(r.symbol)}
            {e && <span className="tag strat">{strategyName(e)}</span>}
            {r.recent.length > 1 && <span className="tag">+{r.recent.length - 1}</span>}
          </span>
          <span className="sub muted">{e ? `${signalTitle(e)} · ${formatTime(e.time)}` : 'Sinyal yok'}</span>
        </span>
        <span className="price">
          <span>{formatPrice(r.s?.price)}</span>
          {r.s?.changePct != null && (
            <span className={`small ${r.s.changePct >= 0 ? 'pos' : 'neg'}`}>{formatPct(r.s.changePct)}</span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div>
      <header className="top">
        <div>
          <h1>Tarayıcı</h1>
          <div className="muted small">
            {scanner.name} · {scanner.symbols.length} hisse ·{' '}
            {live.updatedAt ? `son tarama ${clockText(live.updatedAt)}` : 'henüz taranmadı'}
          </div>
        </div>
      </header>

      <div className="card">
        <button className="btn" onClick={live.refresh} disabled={live.loading}>
          {live.loading ? `Taranıyor… ${live.progress.done}/${live.progress.total}` : 'Şimdi tara'}
        </button>
        {live.loading && (
          <div className="progress">
            <i style={{ width: `${pct}%` }} />
          </div>
        )}
        <div className="small muted">
          Tüm stratejiler {tfs.map((t) => TF_LABEL[t]).join(' ve ')} mumlarında telefonda hesaplanır. Yaklaşık 20–40 saniye sürer.
        </div>
      </div>

      <div className="seg">
        {tfs.map((t) => (
          <button key={t} className={t === tf ? 'on' : ''} onClick={() => setTf(t)}>
            {TF_LABEL[t]}
          </button>
        ))}
      </div>

      {live.loading && !rows.length ? (
        <SkeletonList rows={6} />
      ) : rows.length === 0 ? (
        <div className="empty" style={{ marginTop: 12 }}>
          Sonuç yok. "Şimdi tara" ile başlat.
        </div>
      ) : (
        <>
          <h2>Son {RECENT_BARS} mumda sinyal verenler</h2>
          <div className="list">
            {fresh.map(renderRow)}
            {fresh.length === 0 && <div className="empty">Yeni sinyal yok.</div>}
          </div>
          {rest.length > 0 && (
            <>
              <h2>Diğerleri</h2>
              <div className="list">{rest.map(renderRow)}</div>
            </>
          )}
        </>
      )}
      {Object.keys(live.errors).length > 0 && !live.loading && (
        <p className="legend muted small">Veri alınamayanlar: {Object.keys(live.errors).map(shortSymbol).join(', ')}</p>
      )}
    </div>
  );
}
