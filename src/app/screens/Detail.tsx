import { useEffect, useMemo, useState } from 'react';
import { TF_LABEL } from '../../core/candles';
import { formatPrice } from '../../core/labels';
import { BOX_STRATEGIES } from '../../core/boxStrategies';
import { higherSeries, SR_PARAMS, withHigher } from '../../core/sratr';
import type { Strategy } from '../../core/types';
import { fmtR, StrategyPanel, TRAIL_ATR } from '../StrategyPanel';
import { TIMEFRAMES, type Timeframe } from '../../core/types';
import { loadSeries, type SeriesSet } from '../../core/yahoo';
import type { OpenTarget } from '../App';
import { PriceChart, type ChartPosition } from '../Chart';
import { buildPlots, INDICATOR_BY_ID, loadIndicatorIds, saveIndicatorIds } from '../indicators';
import { IndicatorPicker } from '../IndicatorPicker';
import type { RadarApi } from '../lib/data';
import { yahooFetch } from '../lib/http';

interface Props {
  target: OpenTarget;
  api: RadarApi;
  hasToken: boolean;
  onClose: () => void;
  onGoSettings: () => void;
}

export function DetailScreen({ target, api, hasToken, onClose, onGoSettings }: Props) {
  const [tf, setTf] = useState<Timeframe>('15m');
  const [indicators, setIndicators] = useState<string[]>(loadIndicatorIds);
  const [picker, setPicker] = useState(false);
  const [series, setSeries] = useState<SeriesSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [needToken, setNeedToken] = useState(false);

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
  const [srId, setSrId] = useState<Strategy | null>(() => {
    try {
      const v = localStorage.getItem('mechi.sratr');
      if (v === '0') return null;
      return BOX_STRATEGIES.some((x) => x.id === v) ? (v as Strategy) : 'sratr';
    } catch {
      return 'sratr';
    }
  });
  const pickVariant = (id: Strategy) => {
    const next = srId === id ? null : id;
    setSrId(next);
    try {
      localStorage.setItem('mechi.sratr', next ?? '0');
    } catch {
      // Kaydedilemezse yalnızca bu oturumda geçerli olur.
    }
  };
  const variant = BOX_STRATEGIES.find((x) => x.id === srId);
  // Takip eden kâr al: hedefe ulaşınca kapatmak yerine fiyatı TRAIL_ATR × ATR geriden izler.
  const [trailOn, setTrailOn] = useState(() => {
    try {
      return localStorage.getItem('mechi.trail') === '1';
    } catch {
      return false;
    }
  });
  const toggleTrail = () => {
    setTrailOn(!trailOn);
    try {
      localStorage.setItem('mechi.trail', trailOn ? '0' : '1');
    } catch {
      // Kaydedilemezse yalnızca bu oturumda geçerli olur.
    }
  };
  const showStrategy = !!variant;
  // Strateji yalnızca kapanmış mumlarda sinyal üretir; üst zaman diliminin oluşan mumu kapanış zamanıyla elenir.
  const { closed, trades } = useMemo(() => {
    const closed = series?.lastOpen[tf] ? all.slice(0, -1) : all;
    return { closed, trades: series && variant ? variant.run(closed, tf, higherSeries(tf, series.candles), trailOn ? { trail: TRAIL_ATR } : undefined) : [] };
  }, [series, tf, all, variant, trailOn]);
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
            exitPrice: x.exitPrice,
            peak: x.peak,
            // Takip stopu ya da stop/hedef dışında bir fiyattan çıkış (kural çıkışı, değişen hedef): kesikli çizgi.
            trailLine: x.trailing
              ? x.outcome === 'open'
                ? x.trailStop
                : x.exitPrice
              : x.exitPrice != null && x.exitPrice !== x.target && x.exitPrice !== x.stop
                ? x.exitPrice
                : undefined,
            label:
              x.outcome !== 'open' && x.r != null
                ? x.r === -1
                  ? undefined
                  : `${x.r > 0 ? '✓' : '✕'} ${fmtR(x.r)}`
                : x.trailing
                  ? 'Takipte'
                  : undefined,
            lines: x.lines?.map(([i1, p1, i2, p2]) => ({ from: closed[i1].t, to: closed[Math.min(i2, closed.length - 1)].t, p1, p2 })),
          }))
        : undefined,
    [showStrategy, trades, closed, all],
  );
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
        {BOX_STRATEGIES.map((v) => (
          <button key={v.id} className={`ind-chip strat ${srId === v.id ? 'on' : ''}`} onClick={() => pickVariant(v.id)}>
            {srId === v.id ? '✓ ' : ''}
            {v.short}
          </button>
        ))}
        {variant && (
          <button className={`ind-chip strat ${trailOn ? 'on' : ''}`} onClick={toggleTrail}>
            {trailOn ? '✓ ' : ''}Takip eden TP
          </button>
        )}
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
        <StrategyPanel
          key={`${variant.id}|${tf}|${target.symbol}`}
          title={`${variant.name} · ${TF_LABEL[tf]}`}
          rule={variant.rule(tf) + (trailOn ? ` · takip eden TP (${TRAIL_ATR.toLocaleString('tr-TR')} ATR)` : '')}
          trades={trades}
          candles={closed}
          rr={SR_PARAMS.rr}
        />
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

