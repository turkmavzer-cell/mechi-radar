import { useEffect, useMemo, useState } from 'react';
import { TF_LABEL } from '../../core/candles';
import { formatPrice } from '../../core/labels';
import { TIMEFRAMES, type Timeframe } from '../../core/types';
import { loadSeries, type SeriesSet } from '../../core/yahoo';
import type { OpenTarget } from '../App';
import { PriceChart } from '../Chart';
import { buildPlots, INDICATOR_BY_ID, loadIndicatorIds, saveIndicatorIds } from '../indicators';
import { IndicatorPicker } from '../IndicatorPicker';
import type { RadarApi } from '../lib/data';
import { SignInCard } from '../ui';
import type { Role } from '../lib/auth';
import { yahooFetch } from '../lib/http';

interface Props {
  target: OpenTarget;
  api: RadarApi;
  role: Role;
  onClose: () => void;
}

export function DetailScreen({ target, api, role, onClose }: Props) {
  const [tf, setTf] = useState<Timeframe>('15m');
  const [indicators, setIndicators] = useState<string[]>(loadIndicatorIds);
  const [picker, setPicker] = useState(false);
  const [series, setSeries] = useState<SeriesSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [needSignIn, setNeedSignIn] = useState(false);

  const watchItem = api.data.config?.watchlist.find((w) => w.symbol === target.symbol);

  // Ekran açıkken grafik dakikada bir yenilenir.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loadSeries(yahooFetch, target.symbol, [tf])
      .then((s) => alive && setSeries(s))
      .catch((err) => alive && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [target.symbol, tf, tick]);

  const all = useMemo(() => series?.candles[tf] ?? [], [series, tf]);
  // İndikatörler TradingView'deki gibi oluşmakta olan son mum dahil hesaplanır.
  const { overlays, panes } = useMemo(() => buildPlots(indicators, all), [indicators, all]);

  const updateIndicators = (ids: string[]) => {
    setIndicators(ids);
    saveIndicatorIds(ids);
  };
  const toggleIndicator = (id: string) =>
    updateIndicators(indicators.includes(id) ? indicators.filter((x) => x !== id) : [...indicators, id]);

  const price = series?.meta.regularMarketPrice ?? all[all.length - 1]?.c;

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    if (role !== 'owner') {
      setNeedSignIn(true);
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
    run(() => api.setAlerts(target.symbol, ordered), 'Bildirim ayarı kaydedildi.');
  };

  return (
    <div className="detail">
      <header className="top">
        <button className="icon-btn" onClick={onClose} aria-label="Geri">
          ←
        </button>
        <div className="grow">
          <h1>
            {target.name} {loading && series?.candles[tf] && <span className="spin muted small">⟳</span>}
          </h1>
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

      <div className="ind-row">
        {indicators.map((id) => {
          const d = INDICATOR_BY_ID.get(id);
          if (!d) return null;
          return (
            <button key={id} className="ind-chip" onClick={() => toggleIndicator(id)} aria-label={`${d.label} kaldır`}>
              <i style={{ background: d.color }} />
              {d.label}
              <span className="x">×</span>
            </button>
          );
        })}
        <button className="ind-add" onClick={() => setPicker(true)}>
          + İndikatör ekle
        </button>
      </div>

      {error && !series?.candles[tf] ? (
        <div className="notice err">Veri alınamadı: {error}</div>
      ) : !series?.candles[tf] ? (
        <div className="chart placeholder">Yükleniyor…</div>
      ) : (
        <PriceChart candles={all} overlays={overlays} panes={panes} viewId={`${target.symbol}|${tf}`} />
      )}

      {picker && <IndicatorPicker selected={indicators} onToggle={toggleIndicator} onClose={() => setPicker(false)} />}

      <h2>İzleme ve bildirim</h2>
      <div className="card">
        {watchItem ? (
          <>
            <div className="small muted">Telefona bildirim gelmesini istediğin zaman dilimlerini seç:</div>
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
        {needSignIn && <SignInCard role={role === 'loading' ? 'signedOut' : role} reason="İzleme listesi ve bildirimler Google hesabına bağlı." />}
        {msg && <div className="small">{msg}</div>}
      </div>
      <p className="legend muted small">Teknik gösterge bilgisidir, yatırım tavsiyesi değildir.</p>
    </div>
  );
}
