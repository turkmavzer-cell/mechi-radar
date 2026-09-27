import { TF_LABEL } from '../core/candles';
import { formatPct, formatTime, signalTitle, strengthShort } from '../core/labels';
import type { SignalPerformance } from '../core/strategies';
import type { SignalEvent, Timeframe, Trend } from '../core/types';

export function TrendChip({ tf, trend }: { tf: Timeframe; trend: Trend | undefined }) {
  const cls = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'flat';
  const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '–';
  return (
    <span className={`chip ${cls}`}>
      {TF_LABEL[tf]} {arrow}
    </span>
  );
}

export function SignalRow({
  e,
  name,
  perf,
  onClick,
}: {
  e: SignalEvent;
  name?: string;
  perf?: SignalPerformance;
  onClick?: () => void;
}) {
  const s = strengthShort(e.strength);
  // Sinyal yönündeki hareket yeşil, ters yöndeki kırmızı.
  const good = perf ? (e.dir === 'up' ? perf.movePct >= 0 : perf.movePct <= 0) : true;
  return (
    <button className="row signal" onClick={onClick} disabled={!onClick}>
      <span className={`arrow ${e.dir}`}>{e.dir === 'up' ? '▲' : '▼'}</span>
      <span className="grow">
        <span className="title">
          {name ?? e.symbol} <span className="muted">· {TF_LABEL[e.tf]}</span>
        </span>
        <span className="sub">
          {signalTitle(e)}
          {s && <span className={`tag ${e.strength}`}>{s}</span>}
        </span>
        {perf && (
          <span className="perf">
            <b className={good ? 'pos' : 'neg'}>{formatPct(perf.movePct)}</b>
            <span className="muted">
              {' '}
              {perf.ongoing ? 'şu ana kadar' : 'sonraki sinyale kadar'} · en {e.dir === 'up' ? 'yüksek' : 'düşük'}{' '}
              {formatPct(perf.bestPct)}
            </span>
          </span>
        )}
      </span>
      <span className="muted small">{formatTime(e.time)}</span>
    </button>
  );
}

export function agoText(iso: string | undefined): string {
  if (!iso) return 'henüz yok';
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export function shortSymbol(symbol: string): string {
  return symbol.replace(/\.IS$/, '');
}
