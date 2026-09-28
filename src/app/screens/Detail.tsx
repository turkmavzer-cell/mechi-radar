import { useEffect, useMemo, useState } from 'react';
import { TF_LABEL } from '../../core/candles';
import { alignText, ema200Text, formatPrice, pullbackText, STRATEGY_NAME, trendText } from '../../core/labels';
import { sma } from '../../core/indicators';
import { analyze, signalPerformance, TRIPLE_WINDOW } from '../../core/strategies';
import { RESEARCH, RESEARCH_SYMBOLS } from '../../core/research';
import { ScoreCard } from '../ScoreCard';
import { STRATEGIES, TIMEFRAMES, type Strategy, type Timeframe } from '../../core/types';
import { loadSeries, type SeriesSet } from '../../core/yahoo';
import type { OpenTarget } from '../App';
import { LINE_COLORS, PriceChart, type ChartLine } from '../Chart';
import type { RadarApi } from '../lib/data';
import { SignalRow } from '../ui';
import { yahooFetch } from '../lib/http';

const STRATEGY_HINT: Record<Strategy, string> = {
  ema5813: '',
  pullback2050: '',
  goldencross: '',
  triple: `MACD 0'ı keser, ${TRIPLE_WINDOW} mum içinde RSI 50'yi keser ve mum Bollinger orta bandının üstünde (düşüşte altında) kapanırsa ok çıkar.`,
  supertrend: 'Supertrend (10, 3) yön değiştirince ok çıkar.',
  donchian: 'Kapanış önceki 20 mumun zirvesini / dibini kırınca ok çıkar (Turtle kırılımı).',
  bbrev: '',
  stoch: 'Stokastik (14,3,3): %K, %D\'yi 20 altında yukarı / 80 üstünde aşağı kesince ok çıkar.',
  rsidiv: 'Fiyat yeni dip yaparken RSI(14) daha yüksek dip yaparsa ▲, tepede tersi ▼.',
};

interface Props {
  target: OpenTarget;
  api: RadarApi;
  hasToken: boolean;
  onClose: () => void;
  onGoSettings: () => void;
}

export function DetailScreen({ target, api, hasToken, onClose, onGoSettings }: Props) {
  const [tf, setTf] = useState<Timeframe>('15m');
  const [strategy, setStrategy] = useState<Strategy>('ema5813');
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
    loadSeries(yahooFetch, target.symbol, [tf])
      .then((s) => alive && setSeries(s))
      .catch((err) => alive && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [target.symbol, tf, tick]);

  const { all, closed, analysis } = useMemo(() => {
    const candles = series?.candles[tf] ?? [];
    const closed = series?.lastOpen[tf] ? candles.slice(0, -1) : candles;
    return { all: candles, closed, analysis: analyze(target.symbol, tf, closed) };
  }, [series, tf, target.symbol]);
  const st = analysis.status;
  const perf = useMemo(() => signalPerformance(analysis.events, all), [analysis, all]);
  const history = analysis.events.filter((e) => e.strategy === strategy).reverse().slice(0, 10);

  // Grafikte çizilecek çizgiler; Üçlü Onay, Supertrend ve Donchian yalnızca ok işaretiyle gösterilir.
  const lines = useMemo<ChartLine[]>(() => {
    const e = analysis.emas;
    if (strategy === 'ema5813')
      return [
        { name: 'EMA 5', values: e.e5 },
        { name: 'EMA 8', values: e.e8 },
        { name: 'EMA 13', values: e.e13 },
      ];
    if (strategy === 'pullback2050')
      return [
        { name: 'EMA 20', values: e.e20 },
        { name: 'EMA 50', values: e.e50 },
        { name: 'EMA 200', values: e.e200 },
      ];
    if (strategy === 'bbrev') {
      const c = closed.map((x) => x.c);
      const mid = sma(c, 20);
      const dev = c.map((_, i) => {
        if (i < 19) return NaN;
        let v = 0;
        for (let j = i - 19; j <= i; j++) v += (c[j] - mid[i]) ** 2;
        return 2 * Math.sqrt(v / 20);
      });
      return [
        { name: 'Üst bant', values: mid.map((m, i) => m + dev[i]) },
        { name: 'Orta (SMA 20)', values: mid },
        { name: 'Alt bant', values: mid.map((m, i) => m - dev[i]) },
      ];
    }
    if (strategy === 'goldencross') {
      const c = closed.map((x) => x.c);
      return [
        { name: 'SMA 50', values: sma(c, 50) },
        { name: 'SMA 200', values: sma(c, 200) },
      ];
    }
    return [];
  }, [analysis, closed, strategy]);
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

      <div className="seg scroll">
        {STRATEGIES.map((x) => (
          <button key={x} className={x === strategy ? 'on' : ''} onClick={() => setStrategy(x)}>
            {STRATEGY_NAME[x]}
          </button>
        ))}
      </div>

      {error && !series?.candles[tf] ? (
        <div className="notice err">Veri alınamadı: {error}</div>
      ) : !series?.candles[tf] ? (
        <div className="chart placeholder">Yükleniyor…</div>
      ) : (
        <>
          <PriceChart candles={all} lines={lines} events={analysis.events} strategy={strategy} viewId={`${target.symbol}|${tf}`} />
          <div className="legend-row small">
            {lines.length ? (
              lines.map((l, i) => (
                <span key={l.name}>
                  <i style={{ background: LINE_COLORS[i] }} />
                  {l.name}
                </span>
              ))
            ) : (
              <span>{STRATEGY_HINT[strategy]}</span>
            )}
          </div>
        </>
      )}

      {(() => {
        const r = RESEARCH[strategy]?.[tf];
        if (!r || r[0] < 100) return null;
        const edge = r[1] - r[2];
        return (
          <p className="legend small muted">
            Genel test ({RESEARCH_SYMBOLS} enstrüman, {TF_LABEL[tf]}): {r[0]} sinyalde %{Math.round(r[1])} isabet, rastgele girişe göre{' '}
            <b className={edge >= 1.5 ? 'pos' : edge <= -1.5 ? 'neg' : ''}>
              {edge > 0 ? '+' : ''}
              {edge.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} puan
            </b>
            .
          </p>
        );
      })()}

      {st && (
        <div className="card">
          <div className="kv">
            <span>EMA 5·8·13</span>
            <b className={st.ema5813Dir ?? st.align}>
              {st.ema5813Dir && st.ema5813Dir !== 'neutral'
                ? `Son sinyal ${st.ema5813Dir === 'up' ? 'yükseliş' : 'düşüş'} · ${alignText(st).toLowerCase()}`
                : alignText(st)}
            </b>
          </div>
          <div className="kv">
            <span>EMA 20·50</span>
            <b className={st.pullbackDir}>{pullbackText(st)}</b>
          </div>
          <div className="kv">
            <span>Üçlü Onay</span>
            <b className={st.triple}>
              {st.tripleScore == null
                ? 'Veri yetersiz'
                : trendText(st.triple, 'Yükseliş bölgesi (3/3)', 'Düşüş bölgesi (0/3)', `Karışık (${st.tripleScore}/3 yukarı)`)}
            </b>
          </div>
          <div className="kv">
            <span>Supertrend</span>
            <b className={st.supertrend}>{trendText(st.supertrend, 'Yükseliş', 'Düşüş', 'Veri yetersiz')}</b>
          </div>
          <div className="kv">
            <span>SMA 50/200</span>
            <b className={st.golden}>{trendText(st.golden, 'SMA 50 üstte (altın)', 'SMA 50 altta (ölüm)', 'Veri yetersiz')}</b>
          </div>
          <div className="kv">
            <span>Donchian 20</span>
            <b className={st.donchian}>{trendText(st.donchian, 'Son kırılım yukarı', 'Son kırılım aşağı', 'Kırılım yok')}</b>
          </div>
          <div className="kv">
            <span>EMA 200</span>
            <b className={st.above200 == null ? '' : st.above200 ? 'up' : 'down'}>{ema200Text(st)}</b>
          </div>
        </div>
      )}

      <h2>
        Sinyal geçmişi · {STRATEGY_NAME[strategy]} · {TF_LABEL[tf]}
      </h2>
      {history.length ? (
        <div className="list">
          {history.map((e) => (
            <SignalRow key={`${e.strategy}${e.time}`} e={e} name={target.name} perf={perf.get(e)} />
          ))}
        </div>
      ) : (
        <div className="empty">Bu strateji ve zaman diliminde sinyal yok.</div>
      )}

      <h2>Strateji karnesi · {TF_LABEL[tf]}</h2>
      {closed.length > 0 && <ScoreCard candles={closed} tf={tf} name={target.name} />}

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
