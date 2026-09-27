// Uygulama ve sunucu tarafının ortak veri tipleri.

export type Timeframe = '15m' | '20m' | '30m' | '1h' | '2h' | '4h' | '1d';

export const TIMEFRAMES: Timeframe[] = ['15m', '20m', '30m', '1h', '2h', '4h', '1d'];

/** Mum; t = mumun açılış zamanı (unix saniye). */
export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export type Direction = 'up' | 'down';
export type Strategy = 'ema5813' | 'pullback2050';
/** EMA 200 verisi yetersizse 'unknown'. */
export type Strength = 'strong' | 'weak' | 'unknown';

export interface SignalEvent {
  symbol: string;
  tf: Timeframe;
  strategy: Strategy;
  dir: Direction;
  strength: Strength;
  /** Sinyalin oluştuğu (kapanmış) mumun açılış zamanı, unix saniye. */
  time: number;
  close: number;
}

export type Trend = 'up' | 'down' | 'neutral';

/** Bir enstrümanın bir zaman dilimindeki güncel durumu. */
export interface TfStatus {
  /** EMA 5/8/13 dizilimi. */
  align: Trend;
  /** EMA 20/50 ilişkisi ve pullback aşaması. */
  pullback: PullbackPhase;
  pullbackDir: Trend;
  /** Fiyat EMA 200'ün üstünde mi; veri yetersizse null. */
  above200: boolean | null;
  close: number;
  /** Son kapanmış mumun açılış zamanı. */
  time: number;
  lastSignal: SignalEvent | null;
}

export type PullbackPhase = 'none' | 'trend' | 'pulled' | 'confirmed';

export interface WatchItem {
  symbol: string;
  name: string;
  /** Mail gönderilecek zaman dilimleri. Boşsa mail gönderilmez. */
  alerts: Timeframe[];
}

export interface RadarConfig {
  schemaVersion: 1;
  watchlist: WatchItem[];
  scanner: {
    name: string;
    symbols: string[];
    timeframes: Timeframe[];
  };
}

export interface SymbolState {
  symbol: string;
  name: string;
  price: number | null;
  /** Günlük değişim yüzdesi. */
  changePct: number | null;
  tf: Partial<Record<Timeframe, TfStatus>>;
  error?: string;
}

export interface RadarState {
  updatedAt: string;
  symbols: Record<string, SymbolState>;
  /** "SEMBOL|tf" -> en son işlenen kapanmış mumun zamanı. */
  lastSeen: Record<string, number>;
  /** Son tarayıcı çalışması (unix saniye). */
  scanAt?: number;
}

export interface ScanRow {
  symbol: string;
  tf: Partial<Record<Timeframe, TfStatus>>;
  error?: string;
}

export interface ScanResult {
  name: string;
  updatedAt: string;
  rows: ScanRow[];
}
