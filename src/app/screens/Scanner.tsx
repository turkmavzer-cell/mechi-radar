import { useState } from 'react';
import { TF_LABEL, TF_SECONDS } from '../../core/candles';
import { formatTime, pullbackText, signalTitle, strengthShort } from '../../core/labels';
import type { Timeframe } from '../../core/types';
import type { OpenTarget } from '../App';
import type { RadarApi } from '../lib/data';
import { agoText, shortSymbol } from '../ui';

/** Son 3 mum içinde oluşan sinyal "yeni" sayılır. */
const RECENT_BARS = 3;

export function ScannerScreen({ api, onOpen }: { api: RadarApi; onOpen: (t: OpenTarget) => void }) {
  const scan = api.data.scan;
  const tfs: Timeframe[] = api.data.config?.scanner.timeframes.length ? api.data.config.scanner.timeframes : ['4h', '1d'];
  const [tf, setTf] = useState<Timeframe>(tfs[0]);

  const rows = (scan?.rows ?? [])
    .map((r) => {
      const st = r.tf[tf];
      const sig = st?.lastSignal ?? null;
      const recent = !!(st && sig && st.time - sig.time <= (RECENT_BARS - 1) * TF_SECONDS[tf]);
      return { r, st, sig, recent };
    })
    .sort((a, b) => Number(b.recent) - Number(a.recent) || (b.sig?.time ?? 0) - (a.sig?.time ?? 0));
  const fresh = rows.filter((x) => x.recent);
  const rest = rows.filter((x) => !x.recent);

  const renderRow = ({ r, st, sig, recent }: (typeof rows)[number]) => (
    <button key={r.symbol} className="row" onClick={() => onOpen({ symbol: r.symbol, name: shortSymbol(r.symbol) })}>
      <span className={`arrow ${st?.align ?? 'neutral'}`}>{st?.align === 'up' ? '▲' : st?.align === 'down' ? '▼' : '–'}</span>
      <span className="grow">
        <span className="title">{shortSymbol(r.symbol)}</span>
        <span className="sub muted">
          {r.error
            ? 'veri alınamadı'
            : recent && sig
              ? `${signalTitle(sig)}${strengthShort(sig.strength) ? ' · ' + strengthShort(sig.strength) : ''}`
              : st
                ? pullbackText(st)
                : ''}
        </span>
      </span>
      {sig && <span className="muted small">{formatTime(sig.time)}</span>}
    </button>
  );

  return (
    <div>
      <header className="top">
        <div>
          <h1>Tarayıcı</h1>
          <div className="muted small">
            {scan?.name ?? '—'} · son tarama: {agoText(scan?.updatedAt)}
          </div>
        </div>
      </header>
      <div className="seg">
        {tfs.map((t) => (
          <button key={t} className={t === tf ? 'on' : ''} onClick={() => setTf(t)}>
            {TF_LABEL[t]}
          </button>
        ))}
      </div>
      {!scan && <div className="empty">Tarama sonucu henüz yok. Tarayıcı saatte bir çalışır.</div>}
      {scan && (
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
    </div>
  );
}
