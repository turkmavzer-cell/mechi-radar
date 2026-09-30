import { TF_LABEL } from './candles';
import type { Direction, SignalEvent, Strategy, Strength, TfStatus, Timeframe, Trend } from './types';

export function horizon(tf: Timeframe): string {
  if (tf === '15m' || tf === '20m' || tf === '30m') return 'Kısa vade';
  if (tf === '1d') return 'Uzun vade';
  return 'Orta vade';
}

export function signalTitle(e: Pick<SignalEvent, 'strategy' | 'dir' | 'tf' | 'levels'>): string {
  const up = e.dir === 'up';
  const word = up ? 'yükseliş' : 'düşüş';
  switch (e.strategy) {
    case 'ema5813':
      return `${horizon(e.tf)} ${word} başlangıcı`;
    case 'pullback2050':
      return `Pullback onayı · ${word} devamı`;
    case 'triple':
      return `Üçlü onay · ${word}`;
    case 'supertrend':
      return `Supertrend ${up ? 'yükselişe' : 'düşüşe'} döndü`;
    case 'goldencross':
      return up ? 'Altın kesişim (SMA 50/200)' : 'Ölüm kesişimi (SMA 50/200)';
    case 'donchian':
      return `20 mumun ${up ? 'zirvesi' : 'dibi'} kırıldı`;
    case 'sratr':
    case 'sratrEma':
    case 'sratrAdx':
    case 'sarmacd':
    case 'squeeze':
    case 'st200':
    case 'utbot':
    case 'rsi2':
    case 'ema2155':
    case 'ema2155bo':
    case 'ema2155bt':
    case 'ema2155b55':
    case 'bbstoch':
    case 'hasmooth':
    case 'hasmoothAdx':
    case 'rsimacd':
    case 'triangle':
    case 'emavolha':
      return e.levels
        ? `${up ? 'LONG' : 'SHORT'} GİRİŞ ${formatPrice(e.levels.entry)} · Stop ${formatPrice(e.levels.stop)}${e.levels.target != null ? ` · Hedef ${formatPrice(e.levels.target)}` : ''}`
        : `${up ? 'LONG' : 'SHORT'} GİRİŞ`;
    case 'macd':
      return `MACD sıfırı ${up ? 'yukarı kesti · al' : 'aşağı kesti · sat'}`;
    case 'bbrev':
      return up ? 'Alt banttan içeri dönüş' : 'Üst banttan içeri dönüş';
    case 'stoch':
      return up ? 'Stokastik aşırı satımdan dönüş' : 'Stokastik aşırı alımdan dönüş';
    case 'rsidiv':
      return up ? 'Pozitif RSI uyumsuzluğu' : 'Negatif RSI uyumsuzluğu';
  }
}

export function strengthLabel(dir: Direction, s: Strength): string {
  if (s === 'unknown') return '';
  if (s === 'strong') return 'Güçlü · ana trend yönünde';
  return dir === 'up' ? 'Zayıf · tepki yükselişi (EMA 200 altı)' : 'Zayıf · düzeltme (EMA 200 üstü)';
}

export function strengthShort(s: Strength): string {
  return s === 'strong' ? 'Güçlü' : s === 'weak' ? 'Zayıf' : '';
}

export const STRATEGY_NAME: Record<Strategy, string> = {
  ema5813: 'EMA 5·8·13',
  pullback2050: 'EMA 20·50',
  triple: 'Üçlü Onay',
  supertrend: 'Supertrend',
  goldencross: 'Altın Kesişim',
  donchian: 'Donchian 20',
  bbrev: 'Bollinger Dönüşü',
  stoch: 'Stokastik',
  rsidiv: 'RSI Uyumsuzluğu',
  macd: 'MACD',
  sratr: 'Stokastik-RSI-ATR',
  sratrEma: 'SRA + EMA 200',
  sratrAdx: 'SRA + ADX',
  sarmacd: 'SAR + EMA 200 + MACD',
  squeeze: 'TTM Squeeze',
  st200: 'Supertrend + EMA 200',
  utbot: 'UT Bot + EMA 200',
  rsi2: 'Connors RSI(2)',
  ema2155: 'EMA 21/55 geri çekilmesi',
  ema2155bo: 'EMA 21/55 kırılım',
  ema2155bt: 'EMA 21/55 kırılım + takip',
  ema2155b55: 'EMA 21/55 kırılım · EMA 55 çıkışı',
  bbstoch: 'Bollinger + Stokastik',
  hasmooth: 'Heikin Ashi Smoothed',
  hasmoothAdx: 'HA Smoothed + ADX',
  rsimacd: 'RSI + MACD',
  triangle: 'Üçgen formasyonları',
  emavolha: 'EMA 20/50 + hacim + HA',
};

export function strategyName(e: Pick<SignalEvent, 'strategy'>): string {
  return STRATEGY_NAME[e.strategy];
}

export function trendText(t: Trend | undefined, up: string, down: string, none = 'Belirsiz'): string {
  return t === 'up' ? up : t === 'down' ? down : none;
}

export function formatPct(v: number): string {
  const s = v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v > 0 ? '+' : ''}${s}%`;
}

/** Mail konusu: "▲ USDJPY · 15dk · Kısa vade yükseliş başlangıcı · Güçlü" */
export function signalLine(e: SignalEvent, name?: string): string {
  const arrow = e.dir === 'up' ? '▲' : '▼';
  const s = strengthShort(e.strength);
  return [`${arrow} ${name || e.symbol}`, TF_LABEL[e.tf], signalTitle(e), s].filter(Boolean).join(' · ');
}

export function alignText(st: TfStatus): string {
  if (st.align === 'up') return 'Yükseliş dizilimi';
  if (st.align === 'down') return 'Düşüş dizilimi';
  return 'Dizilim yok';
}

export function pullbackText(st: TfStatus): string {
  const up = st.pullbackDir === 'up';
  switch (st.pullback) {
    case 'trend':
      return `${up ? 'Yukarı' : 'Aşağı'} kesişim · geri çekilme bekleniyor`;
    case 'pulled':
      return st.pullbackLevel != null
        ? `Geri çekilmede · ${formatPrice(st.pullbackLevel)} ${up ? 'üstü' : 'altı'} kapanış bekleniyor`
        : 'Geri çekilmede · kırılım bekleniyor';
    case 'confirmed':
      return `Kırılım onaylandı · ${up ? 'yükseliş' : 'düşüş'} devam ediyor`;
    default:
      return 'EMA 20/50 kesişimi bekleniyor';
  }
}

export function ema200Text(st: TfStatus): string {
  if (st.above200 === null) return 'Veri yetersiz';
  return st.above200 ? 'Fiyat EMA 200 üstünde' : 'Fiyat EMA 200 altında';
}

export function formatPrice(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  const digits = abs >= 1000 ? 2 : abs >= 10 ? 2 : abs >= 1 ? 4 : 5;
  return v.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
}
