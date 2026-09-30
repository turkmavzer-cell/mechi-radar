import type { CanvasRenderingTarget2D } from 'fancy-canvas';
import type {
  IChartApiBase,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time,
} from 'lightweight-charts';

/** TradingView'in Alış/Satış Pozisyonu aracı gibi: girişten stopa kırmızı, hedefe yeşil alan. */
export interface PositionBox {
  from: Time;
  to: Time;
  entry: number;
  stop: number;
  target: number;
  outcome: 'tp' | 'sl' | 'open';
  /** Takip eden kâr alda hedefin ötesindeki çıkış fiyatı. */
  exitPrice?: number;
  /** Takipte görülen en iyi fiyat: yeşil alan buraya kadar uzar. */
  peak?: number;
  /** Takip stopu (açık işlem) ya da takipte çıkış fiyatı: kesikli çizgi. */
  trailLine?: number;
  /** Kutunun sonuç etiketi (ör. "✓ +3,2R"). */
  label?: string;
  /** Ek çizgiler (ör. üçgen formasyonunun kenarları). */
  lines?: { from: Time; to: Time; p1: number; p2: number }[];
}

const GREEN = 'rgba(34, 197, 94, 0.22)';
const RED = 'rgba(240, 82, 82, 0.22)';

export class PositionBoxes implements ISeriesPrimitive<Time> {
  private chart: IChartApiBase<Time> | null = null;
  private series: ISeriesApi<SeriesType, Time> | null = null;
  private readonly view: IPrimitivePaneView;

  constructor(private readonly boxes: PositionBox[]) {
    this.view = { zOrder: () => 'bottom', renderer: () => this.renderer };
  }

  attached({ chart, series }: SeriesAttachedParameter<Time>): void {
    this.chart = chart;
    this.series = series;
  }

  detached(): void {
    this.chart = null;
    this.series = null;
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this.view];
  }

  private readonly renderer: IPrimitivePaneRenderer = {
    draw: (target: CanvasRenderingTarget2D) => {
      const chart = this.chart;
      const series = this.series;
      if (!chart || !series) return;
      const ts = chart.timeScale();
      target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hr, verticalPixelRatio: vr }) => {
        const spacing = ts.options().barSpacing;
        for (const b of this.boxes) {
          const x1 = ts.timeToCoordinate(b.from);
          const x2 = ts.timeToCoordinate(b.to);
          const yE = series.priceToCoordinate(b.entry);
          const yS = series.priceToCoordinate(b.stop);
          // Hedefsiz (kural çıkışlı) işlemde yeşil alan çizilmez.
          const yT = Number.isFinite(b.target) ? series.priceToCoordinate(b.target) : yE;
          if (x1 == null || x2 == null || yE == null || yS == null || yT == null) continue;
          for (const ln of b.lines ?? []) {
            const la = ts.timeToCoordinate(ln.from);
            const lb = ts.timeToCoordinate(ln.to);
            const pa = series.priceToCoordinate(ln.p1);
            const pb = series.priceToCoordinate(ln.p2);
            if (la == null || lb == null || pa == null || pb == null) continue;
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = Math.max(1, Math.round(1.5 * hr));
            ctx.beginPath();
            ctx.moveTo(la * hr, pa * vr);
            ctx.lineTo(lb * hr, pb * vr);
            ctx.stroke();
          }
          const left = Math.round(x1 * hr);
          const width = Math.max(Math.round((x2 - x1 + spacing / 2) * hr), Math.round(6 * hr));
          const rect = (ya: number, yb: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(left, Math.round(Math.min(ya, yb) * vr), width, Math.max(1, Math.round(Math.abs(yb - ya) * vr)));
          };
          rect(yE, yT, GREEN);
          // Takip eden kâr al: hedefin ötesinde kapanan kısım daha açık yeşil.
          // Takip eden kâr al: hedefin ötesinde görülen en iyi fiyata kadar açık yeşil uzantı, takip stopu kesikli çizgi.
          const yX = b.peak != null ? series.priceToCoordinate(b.peak) : null;
          const beyond = yX != null && (yT < yE ? yX < yT : yX > yT);
          if (beyond) rect(yT, yX, 'rgba(34, 197, 94, 0.14)');
          const yL = b.trailLine != null ? series.priceToCoordinate(b.trailLine) : null;
          if (yL != null) {
            ctx.fillStyle = '#22c55e';
            const dash = Math.round(4 * hr);
            for (let x = left; x < left + width; x += dash * 2) ctx.fillRect(x, Math.round(yL * vr), Math.min(dash, left + width - x), Math.max(1, Math.round(1.5 * vr)));
          }
          rect(yE, yS, RED);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
          ctx.fillRect(left, Math.round(yE * vr), width, Math.max(1, Math.round(vr)));
          // Sonuç etiketi kutunun sağ kenarında, kapanış tarafında.
          const label = b.label ?? (b.outcome === 'tp' ? '✓ Hedef' : b.outcome === 'sl' ? '✕ Stop' : 'Açık');
          ctx.font = `${Math.round(10 * vr)}px sans-serif`;
          ctx.fillStyle = b.outcome === 'tp' ? '#22c55e' : b.outcome === 'sl' ? '#f05252' : '#94a3b8';
          // Etiket gerçek çıkışın yanında: takipte kesikli çizgi (tepe yalnızca görülen en iyi fiyattır).
          const y = yL != null ? yL : b.outcome === 'sl' ? yS : yT;
          ctx.textBaseline = y > yE ? 'top' : 'bottom';
          ctx.fillText(label, left + 2 * hr, Math.round((y + (y > yE ? 4 : -4)) * vr));
        }
      });
    },
  };
}
