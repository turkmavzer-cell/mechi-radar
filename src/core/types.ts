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
  /** İşlem hacmi (varsa; FX paritelerinde Yahoo hacim vermez). */
  v?: number;
}

export type Direction = 'up' | 'down';
export type Strategy =
  | 'ema5813'
  | 'pullback2050'
  | 'triple'
  | 'supertrend'
  | 'goldencross'
  | 'donchian'
  | 'bbrev'
  | 'stoch'
  | 'rsidiv'
  | 'macd'
  | 'sratr'
  | 'sratrEma'
  | 'sratrAdx'
  | 'sarmacd'
  | 'squeeze'
  | 'st200'
  | 'utbot'
  | 'rsi2'
  | 'ema2155'
  | 'ema2155bo'
  | 'ema2155bt'
  | 'ema2155b55'
  | 'ema2155v2'
  | 'ema5813macd'
  | 'twinst'
  | 'twinst3'
  | 'bbstoch'
  | 'hasmooth'
  | 'hasmoothAdx'
  | 'rsimacd'
  | 'triangle'
  | 'emavolha';

export const STRATEGIES: Strategy[] = [
  'sratr',
  'sratrEma',
  'sratrAdx',
  'sarmacd',
  'squeeze',
  'st200',
  'utbot',
  'rsi2',
  'ema2155',
  'ema2155bo',
  'ema2155bt',
  'ema2155b55',
  'ema2155v2',
  'ema5813macd',
  'twinst',
  'twinst3',
  'bbstoch',
  'hasmooth',
  'hasmoothAdx',
  'rsimacd',
  'triangle',
  'emavolha',
  'ema5813',
  'pullback2050',
  'triple',
  'macd',
  'bbrev',
  'stoch',
  'rsidiv',
  'supertrend',
  'goldencross',
  'donchian',
];
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
  /** Stokastik-RSI-ATR: giriş, stop ve hedef fiyatı. */
  /** Hedef yoksa (kural çıkışlı stratejiler) `target` tanımsız. */
  levels?: { entry: number; stop: number; target?: number };
}

export type Trend = 'up' | 'down' | 'neutral';

/** Bir enstrümanın bir zaman dilimindeki güncel durumu. */
export interface TfStatus {
  /** EMA 5/8/13 dizilimi (şu anki mum). */
  align: Trend;
  /** Son EMA 5/8/13 sinyalinin yönü: bir sonraki ters sinyale kadar geçerli yön. */
  ema5813Dir?: Trend;
  /** EMA 20/50 ilişkisi ve pullback aşaması. */
  pullback: PullbackPhase;
  pullbackDir: Trend;
  /** Geri çekilmedeyken onay için kırılması gereken seviye. */
  pullbackLevel?: number | null;
  /** Fiyat EMA 200'ün üstünde mi; veri yetersizse null. */
  above200: boolean | null;
  /** Üçlü Onay: MACD>0, RSI>50, fiyat Bollinger orta bandı üstünde (yükseliş) / tersi (düşüş). */
  triple?: Trend;
  /** Üçlü Onay koşullarından yükseliş yönünde sağlananların sayısı (0-3). */
  tripleScore?: number;
  supertrend?: Trend;
  /** SMA 50 / SMA 200 ilişkisi. */
  golden?: Trend;
  /** Donchian 20 kanalında son kırılımın yönü. */
  donchian?: Trend;
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
