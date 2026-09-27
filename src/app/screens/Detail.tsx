import { useEffect, useMemo, useState } from 'react';
import { TF_LABEL } from '../../core/candles';
import { alignText, ema200Text, formatPrice, pullbackText } from '../../core/labels';
import { analyze } from '../../core/strategies';
import { TIMEFRAMES, type Timeframe } from '../../core/types';
import { loadSeries, type SeriesSet } from '../../core/yahoo';
import type { OpenTarget } from '../App';
import { LINE_COLORS, PriceChart, type EmaGroup } from '../Chart';
import type { RadarApi } from '../lib/data';
import { SignalRow } from '../ui';

interface Props {
  target: OpenTarget;
  api: RadarApi;
  hasToken: boolean;
  onClose: () => void;
  onGoSettings: () => void;
}

export function DetailScreen({ target, api, hasToken, onClose, onGoSettings }: Props) {
  const [tf, setTf] = useState<Timeframe>('15m');
  const [group, setGroup] = useState<EmaGroup>('fast');
  const [series, setSeries] = useState<SeriesSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [needToken, setNeedToken] = useState(false);

  const watchItem = api.data.config?.watchlist.find((w) => w.symbol === target.symbol);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loadSeries(fetch, target.symbol, [tf])
      .then((s) => alive && setSeries(s))
      .catch((err) => alive && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [target.symbol, tf]);

  const { all, analysis } = useMemo(() => {
    const candles = series?.candles[tf] ?? [];
    const closed = series?.lastOpen[tf] ? candles.slice(0, -1) : candles;
    return { all: candles, analysis: analyze(target.symbol, tf, closed) };
  }, [series, tf, target.symbol]);
  const st = analysis.status;
  const history = [...analysis.events].reverse().slice(0, 8);
  const price = series?.meta.regularMarketPrice ?? all[all.length - 1]?.c;

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    if (!hasToken) {
      setNeedToken(true);
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg(ok);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleAlert = (t: Timeframe) => {
    if (!watchItem) return;
    const next = watchItem.alerts.includes(t) ? watchItem.alerts.filter((a) => a !== t) : [...watchItem.alerts, t];
    const ordered = TIMEFRAMES.filter((x) => next.includes(x));
    run(() => api.setAlerts(target.symbol, ordered), 'Mail ayarı kaydedildi.');
  };

  return (
    <div className="detail">
      <header className="top">
        <button className="icon-btn" onClick={onClose} aria-label="Geri">
          ←
        </button>
        <div className="grow">
          <h1>{target.name}</h1>
          <div className="muted small">
            {target.symbol} · {formatPrice(price)}
          </div>
        </div>
      </header>

      <div className="seg scroll">
        {TIMEFRAMES.map((t) => (
          <button key={t} className={t === tf ? 'on' : ''} onClick={() => setTf(t)}>
            {TF_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="seg">
        <button className={group === 'fast' ? 'on' : ''} onClick={() => setGroup('fast')}>
          EMA 5·8·13
        </button>
        <button className={group === 'slow' ? 'on' : ''} onClick={() => setGroup('slow')}>
          EMA 20·50·200
        </button>
      </div>

      {error ? (
        <div className="notice err">Veri alınamadı: {error}</div>
      ) : loading && !series ? (
        <div className="chart placeholder">Yükleniyor…</div>
      ) : (
        <>
          <PriceChart candles={all} emas={analysis.emas} events={analysis.events} group={group} />
          <div className="legend-row small">
            {(group === 'fast' ? ['EMA 5', 'EMA 8', 'EMA 13'] : ['EMA 20', 'EMA 50', 'EMA 200']).map((n, i) => (
              <span key={n}>
                <i style={{ background: LINE_COLORS[i] }} />
                {n}
              </span>
            ))}
          </div>
        </>
      )}

      {st && (
        <div className="card">
          <div className="kv">
            <span>EMA 5·8·13</span>
            <b className={st.align}>{alignText(st)}</b>
          </div>
          <div className="kv">
            <span>EMA 20·50</span>
            <b className={st.pullbackDir}>{pullbackText(st)}</b>
          </div>
          <div className="kv">
            <span>EMA 200</span>
            <b className={st.above200 == null ? '' : st.above200 ? 'up' : 'down'}>{ema200Text(st)}</b>
          </div>
        </div>
      )}

      <h2>Sinyal geçmişi · {TF_LABEL[tf]}</h2>
      {history.length ? (
        <div className="list">
          {history.map((e) => (
            <SignalRow key={`${e.strategy}${e.time}`} e={e} name={target.name} />
          ))}
        </div>
      ) : (
        <div className="empty">Bu zaman diliminde sinyal yok.</div>
      )}

      <h2>İzleme ve mail</h2>
      <div className="card">
        {watchItem ? (
          <>
            <div className="small muted">Mail gelmesini istediğin zaman dilimlerini seç:</div>
            <div className="seg wrap">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  className={watchItem.alerts.includes(t) ? 'on' : ''}
                  disabled={busy}
                  onClick={() => toggleAlert(t)}
                >
                  {watchItem.alerts.includes(t) ? '🔔 ' : ''}
                  {TF_LABEL[t]}
                </button>
              ))}
            </div>
            <button
              className="btn ghost"
              disabled={busy}
              onClick={() => run(() => api.removeWatch(target.symbol), 'Listeden çıkarıldı.')}
            >
              İzleme listesinden çıkar
            </button>
          </>
        ) : (
          <button
            className="btn"
            disabled={busy}
            onClick={() => run(() => api.addWatch({ symbol: target.symbol, name: target.name, alerts: [] }), 'İzleme listesine eklendi.')}
          >
            İzleme listesine ekle
          </button>
        )}
        {needToken && (
          <div className="notice">
            İzleme listesi GitHub'daki reponda tutulduğu için uygulamanın bir kez yazma izni (token) alması gerekiyor.
            <button className="btn" style={{ marginTop: 10, width: '100%' }} onClick={onGoSettings}>
              Ayarlar'a git ve token gir
            </button>
          </div>
        )}
        {msg && <div className="small">{msg}</div>}
      </div>
      <p className="legend muted small">Teknik gösterge bilgisidir, yatırım tavsiyesi değildir.</p>
    </div>
  );
}
