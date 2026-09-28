import { useEffect, useRef } from 'react';
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type SeriesType,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle } from '../core/types';
import type { Plot, PlotLine } from './indicators';
import { PositionBoxes } from './positionBoxes';

/** Strateji pozisyonu; zamanlar unix saniye. */
export interface ChartPosition {
  from: number;
  to: number;
  dir: 'up' | 'down';
  entry: number;
  stop: number;
  target: number;
  outcome: 'tp' | 'sl' | 'open';
  exitPrice?: number;
  label?: string;
}

const UP = '#0ca30c';
const DOWN = '#d03b3b';

// Grafik saatleri İstanbul saatiyle gösterilir.
const TZ_SHIFT = 3 * 3600;

export const PANE_HEIGHT = 110;
const MAIN_HEIGHT = 320;

interface Props {
  candles: Candle[];
  /** Fiyatın üstüne çizilen indikatörler. */
  overlays: Plot[];
  /** Her biri ayrı alt panelde gösterilen indikatörler. */
  panes: Plot[];
  /** Sembol + zaman dilimi; değişince görünüm son mumlara odaklanır, aynı kalırsa korunur. */
  viewId: string;
  /** Stokastik-RSI-ATR pozisyonları: giriş etiketi ve stop/hedef kutuları. */
  positions?: ChartPosition[];
}

export function PriceChart({ candles, overlays, panes, viewId, positions }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // Aynı seri yenilenince (dakikalık güncelleme) kullanıcının kaydırdığı görünüm korunur.
  const viewKey = useRef('');
  const paneCount = useRef(0);

  useEffect(() => {
    if (!box.current) return;
    const chart = createChart(box.current, {
      width: box.current.clientWidth,
      height: box.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
        fontSize: 11,
        panes: { separatorColor: '#1e293b' },
      },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      rightPriceScale: { borderColor: '#1e293b' },
      timeScale: { borderColor: '#1e293b', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;
    // Boyut elle yönetilir: kutu değişince grafik yeniden boyutlanır ve panel yükseklikleri yeniden atanır
    // (otomatik boyutlamada yeni yükseklik son panele eklendiği için alt paneller eşit kalmıyordu).
    const el = box.current;
    const ro = new ResizeObserver(() => layout(chart, el, paneCount.current));
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const t = (u: number) => (u + TZ_SHIFT) as UTCTimestamp;
    // Mum sayısından uzun seriler (Ichimoku bulutu) için ileri tarihler: son mum aralığı kadar adım.
    const last = candles[candles.length - 1];
    const step = candles.length > 1 ? last.t - candles[candles.length - 2].t : 60;
    const timeAt = (i: number) => (i < candles.length ? candles[i].t : last.t + (i - candles.length + 1) * step);
    const toData = (vals: number[]) =>
      candles.length ? vals.flatMap((v, i) => (Number.isFinite(v) ? [{ time: t(timeAt(i)), value: v }] : [])) : [];

    const all: ISeriesApi<SeriesType>[] = [];
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
    });
    candleSeries.setData(candles.map((c) => ({ time: t(c.t), open: c.o, high: c.h, low: c.l, close: c.c })));
    all.push(candleSeries);

    const boxes = positions?.length
      ? new PositionBoxes(positions.map((p) => ({ ...p, from: t(p.from), to: t(p.to) })))
      : null;
    if (boxes) candleSeries.attachPrimitive(boxes);
    const markers: SeriesMarker<Time>[] = (positions ?? []).map((p) => ({
      time: t(p.from),
      position: p.dir === 'up' ? 'belowBar' : 'aboveBar',
      shape: p.dir === 'up' ? 'arrowUp' : 'arrowDown',
      color: p.dir === 'up' ? UP : DOWN,
      text: p.dir === 'up' ? 'LONG GİRİŞ' : 'SHORT GİRİŞ',
      size: 1,
    }));
    const markerApi = markers.length ? createSeriesMarkers(candleSeries, markers) : null;

    const addLine = (l: PlotLine, pane: number) => {
      const s = chart.addSeries(
        LineSeries,
        {
          color: l.color,
          lineWidth: l.style === 'dashed' ? 1 : 2,
          lineStyle: l.style === 'dashed' ? LineStyle.Dashed : LineStyle.Solid,
          lineVisible: l.style !== 'dots',
          pointMarkersVisible: l.style === 'dots',
          pointMarkersRadius: 1.5,
          priceLineVisible: false,
          // Fiyat ekseninde yalnızca alt panel değerleri etiketlenir; fiyat üstü çizgiler kalabalık yapar.
          lastValueVisible: pane > 0 && l.style !== 'dots',
          crosshairMarkerVisible: false,
        },
        pane,
      );
      s.setData(toData(l.values));
      all.push(s);
      return s;
    };

    for (const p of overlays) p.lines.forEach((l) => addLine(l, 0));

    panes.forEach((p, k) => {
      const pane = k + 1;
      if (p.histogram) {
        const h = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false }, pane);
        h.setData(
          p.histogram.flatMap((v, i) =>
            Number.isFinite(v) && candles[i]
              ? [{ time: t(candles[i].t), value: v, color: v >= 0 ? 'rgba(12,163,12,.5)' : 'rgba(208,59,59,.5)' }]
              : [],
          ),
        );
        all.push(h);
        // Çizgisi olmayan panelde (AO) seviye çizgileri histograma eklenir.
        if (!p.lines.length) p.levels?.forEach((lv) => h.createPriceLine(level(lv)));
      }
      p.lines.forEach((l, idx) => {
        const s = addLine(l, pane);
        if (idx === 0) p.levels?.forEach((lv) => s.createPriceLine(level(lv)));
      });
    });

    // Kaldırılan alt panellerin boş yerleri silinir, kalanların yüksekliği ayarlanır.
    const ps = chart.panes();
    for (let k = ps.length - 1; k > panes.length; k--) chart.removePane(k);
    paneCount.current = panes.length;
    if (box.current) layout(chart, box.current, panes.length);

    if (candles.length && viewId !== viewKey.current) {
      const visible = Math.min(candles.length, 90);
      chart.timeScale().setVisibleLogicalRange({ from: candles.length - visible, to: candles.length + 2 });
      viewKey.current = viewId;
    }

    return () => {
      // Bileşen kapanırken grafik önce yok edilmiş olabilir.
      if (chartRef.current !== chart) return;
      markerApi?.detach();
      if (boxes) candleSeries.detachPrimitive(boxes);
      all.forEach((s) => chart.removeSeries(s));
    };
  }, [candles, overlays, panes, viewId, positions]);

  return <div className="chart" style={{ height: MAIN_HEIGHT + panes.length * PANE_HEIGHT }} ref={box} />;
}

/** Grafiği kutu boyutuna getirir; alt paneller sabit yükseklikte, kalan alan fiyat panelinde. */
function layout(chart: IChartApi, el: HTMLElement, n: number) {
  const width = el.clientWidth;
  const height = el.clientHeight;
  if (!width || !height) return;
  chart.resize(width, height, true);
  const axis = chart.timeScale().height();
  const ps = chart.panes();
  ps.forEach((p, k) => p.setHeight(k === 0 ? Math.max(120, height - axis - n * PANE_HEIGHT) : PANE_HEIGHT));
}

function level(price: number) {
  return { price, color: '#64748b', lineWidth: 1 as const, lineStyle: LineStyle.Dashed, axisLabelVisible: false };
}
