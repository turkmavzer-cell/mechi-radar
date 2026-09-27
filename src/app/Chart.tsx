import { useEffect, useRef } from 'react';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  LineSeries,
  type IChartApi,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle, SignalEvent, Strategy } from '../core/types';

export interface ChartLine {
  name: string;
  values: number[];
}

// Doğrulanmış kategorik palet (koyu tema): mavi, turuncu, su yeşili.
export const LINE_COLORS = ['#3987e5', '#d95926', '#199e70'];
const UP = '#0ca30c';
const DOWN = '#d03b3b';

// Grafik saatleri İstanbul saatiyle gösterilir.
const TZ_SHIFT = 3 * 3600;

interface Props {
  candles: Candle[];
  /** En fazla 3 çizgi; değerler kapanmış mumlar için hesaplandı (oluşan son mum dahil değil). */
  lines: ChartLine[];
  events: SignalEvent[];
  /** Ok işaretleri gösterilecek strateji. */
  strategy: Strategy;
}

export function PriceChart({ candles, lines, events, strategy }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const chart = createChart(box.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: '#0f172a' }, textColor: '#94a3b8', fontSize: 11 },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      rightPriceScale: { borderColor: '#1e293b' },
      timeScale: { borderColor: '#1e293b', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const t = (u: number) => (u + TZ_SHIFT) as UTCTimestamp;
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
    });
    candleSeries.setData(candles.map((c) => ({ time: t(c.t), open: c.o, high: c.h, low: c.l, close: c.c })));

    const lineSeries = lines.slice(0, LINE_COLORS.length).map(({ values: vals }, idx) => {
      const s = chart.addSeries(LineSeries, {
        color: LINE_COLORS[idx],
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: false,
      });
      s.setData(
        vals.flatMap((v, i) => (Number.isNaN(v) || !candles[i] ? [] : [{ time: t(candles[i].t), value: v }])),
      );
      return s;
    });

    const markers: SeriesMarker<Time>[] = events
      .filter((e) => e.strategy === strategy)
      .map((e) => ({
        time: t(e.time),
        position: e.dir === 'up' ? 'belowBar' : 'aboveBar',
        shape: e.dir === 'up' ? 'arrowUp' : 'arrowDown',
        color: e.dir === 'up' ? UP : DOWN,
        text: e.strategy === 'pullback2050' ? 'PB' : '',
        size: 1.2,
      }));
    const markerApi = createSeriesMarkers(candleSeries, markers);

    const visible = Math.min(candles.length, 90);
    if (candles.length) chart.timeScale().setVisibleLogicalRange({ from: candles.length - visible, to: candles.length + 2 });

    return () => {
      // Bileşen kapanırken grafik önce yok edilmiş olabilir.
      if (chartRef.current !== chart) return;
      markerApi.detach();
      lineSeries.forEach((s) => chart.removeSeries(s));
      chart.removeSeries(candleSeries);
    };
  }, [candles, lines, events, strategy]);

  return <div className="chart" ref={box} />;
}
