import { useEffect, useMemo, useState } from 'react';
import { TF_LABEL } from '../../core/candles';
import { formatPrice, formatTime } from '../../core/labels';
import { HIGHER_LABEL, HIGHER_TF, higherSeries, SR_FILTERS, SR_PARAMS, SR_VARIANTS, srTrades, withHigher, type SrVariantId } from '../../core/sratr';
import { TIMEFRAMES, type Timeframe } from '../../core/types';
import { loadSeries, type SeriesSet } from '../../core/yahoo';
import type { OpenTarget } from '../App';
import { PriceChart, type ChartPosition } from '../Chart';
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
    loadSeries(yahooFetch, target.symbol, withHigher([tf]))
      .then((s) => alive && setSeries(s))
      .catch((err) => alive && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [target.symbol, tf, tick]);

  const all = useMemo(() => series?.candles[tf] ?? [], [series, tf]);
  // İndikatörler TradingView'deki gibi oluşmakta olan son mum dahil hesaplanır.
  const { overlays, panes } = useMemo(
    () => buildPlots(indicators, all, { tf, higher: series ? higherSeries(tf, series.candles) : undefined }),
    [indicators, all, tf, series],
  );

  const updateIndicators = (ids: string[]) => {
    setIndicators(ids);
    saveIndicatorIds(ids);
  };
  const toggleIndicator = (id: string) =>
    updateIndicators(indicators.includes(id) ? indicators.filter((x) => x !== id) : [...indicators, id]);

  // Grafikte gösterilen Stokastik-RSI-ATR sürümü (biri seçilir; seçili olana tekrar dokununca kapanır).
  const [srId, setSrId] = useState<SrVariantId | null>(() => {
    try {
      const v = localStorage.getItem('mechi.sratr');
      if (v === '0') return null;
      return SR_VARIANTS.some((x) => x.id === v) ? (v as SrVariantId) : 'sratr';
    } catch {
      return 'sratr';
    }
  });
  const pickVariant = (id: SrVariantId) => {
    const next = srId === id ? null : id;
    setSrId(next);
    try {
      localStorage.setItem('mechi.sratr', next ?? '0');
    } catch {
      // Kaydedilemezse yalnızca bu oturumda geçerli olur.
    }
  };
  const variant = SR_VARIANTS.find((x) => x.id === srId);
  const showStrategy = !!variant;
  // Strateji yalnızca kapanmış mumlarda sinyal üretir; üst zaman diliminin oluşan mumu kapanış zamanıyla elenir.
  const { closed, trades } = useMemo(() => {
    const closed = series?.lastOpen[tf] ? all.slice(0, -1) : all;
    return { closed, trades: series && variant ? srTrades(closed, tf, higherSeries(tf, series.candles), SR_PARAMS, [...variant.filters]) : [] };
  }, [series, tf, all, variant]);
  const positions = useMemo<ChartPosition[] | undefined>(
    () =>
      showStrategy
        ? trades.map((x) => ({
            from: closed[x.i].t,
            to: all[x.exitI ?? all.length - 1].t,
            dir: x.dir,
            entry: x.entry,
            stop: x.stop,
            target: x.target,
            outcome: x.outcome,
          }))
        : undefined,
    [showStrategy, trades, closed, all],
  );
  const done = trades.filter((x) => x.outcome !== 'open');
  const wins = done.filter((x) => x.outcome === 'tp').length;
  const totalR = done.reduce((a, x) => a + (x.outcome === 'tp' ? SR_PARAMS.rr : -1), 0);

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
        {SR_VARIANTS.map((v) => (
          <button key={v.id} className={`ind-chip strat ${srId === v.id ? 'on' : ''}`} onClick={() => pickVariant(v.id)}>
            {srId === v.id ? '✓ ' : ''}
            {v.short}
          </button>
        ))}
        <button className="ind-add" onClick={() => setPicker(true)}>
          + İndikatör ekle
        </button>
      </div>

      {error && !series?.candles[tf] ? (
        <div className="notice err">Veri alınamadı: {error}</div>
      ) : !series?.candles[tf] ? (
        <div className="chart placeholder">Yükleniyor…</div>
      ) : (
        <PriceChart candles={all} overlays={overlays} panes={panes} viewId={`${target.symbol}|${tf}`} positions={positions} />
      )}

      {picker && <IndicatorPicker
          selected={indicators}
          onToggle={toggleIndicator}
          onAddAll={(ids) => updateIndicators([...indicators, ...ids.filter((id) => !indicators.includes(id))])}
          onClose={() => setPicker(false)}
        />}

      {variant && series?.candles[tf] && (
        <>
          <h2>
            {variant.name} · {TF_LABEL[tf]}
          </h2>
          <p className="legend small muted">
            {HIGHER_LABEL[HIGHER_TF[tf]]} Stokastik 20 altı/80 üstü iken RSI(14) kendi ortalamasını (SMA 14) keserse giriş. Stop{' '}
            {SR_PARAMS.stopAtr.toLocaleString('tr-TR')} ATR, hedef stop mesafesinin {SR_PARAMS.rr.toLocaleString('tr-TR')} katı.
            {variant.filters.map((f) => ` Ek şart: ${SR_FILTERS[f].name}.`)}
            {done.length > 0 && (
              <>
                {' '}
                {formatDate(closed[done[0].i].t)} – {formatDate(closed[closed.length - 1].t)} arasında {done.length} kapanmış işlem: {wins} hedef, {done.length - wins} stop, toplam{' '}
                <b className={totalR > 0 ? 'pos' : totalR < 0 ? 'neg' : ''}>
                  {totalR > 0 ? '+' : ''}
                  {totalR.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}R
                </b>
                .
              </>
            )}
          </p>
          {trades.length ? (
            <div className="list">
              {trades
                .slice()
                .reverse()
                .slice(0, 12)
                .map((x) => (
                  <div key={x.i} className="row signal">
                    <span className={`arrow ${x.dir}`}>{x.dir === 'up' ? '▲' : '▼'}</span>
                    <span className="grow">
                      <span className="title">
                        {x.dir === 'up' ? 'LONG' : 'SHORT'} GİRİŞ {formatPrice(x.entry)}
                      </span>
                      <span className="sub">
                        Stop {formatPrice(x.stop)} · Hedef {formatPrice(x.target)}
                      </span>
                      <span className="perf">
                        <b className={x.outcome === 'tp' ? 'pos' : x.outcome === 'sl' ? 'neg' : 'muted'}>
                          {x.outcome === 'tp' ? `✓ Hedef +${SR_PARAMS.rr.toLocaleString('tr-TR')}R` : x.outcome === 'sl' ? '✕ Stop −1R' : 'Açık pozisyon'}
                        </b>
                      </span>
                    </span>
                    <span className="muted small">{formatTime(closed[x.i].t)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty">Bu zaman diliminde sinyal yok.</div>
          )}
        </>
      )}

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

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}
