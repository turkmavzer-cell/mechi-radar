import type { RadarConfig } from '../src/core/types';

// BIST 30 bileşenleri dönem dönem değişir; bu liste başlangıç içindir,
// data dalındaki config.json dosyasından güncellenebilir.
const BIST30 = [
  'AKBNK', 'ALARK', 'ARCLK', 'ASELS', 'ASTOR', 'BIMAS', 'CIMSA', 'DOAS', 'EKGYO', 'ENKAI',
  'EREGL', 'FROTO', 'GARAN', 'HEKTS', 'ISCTR', 'KCHOL', 'KRDMD', 'MGROS', 'PETKM', 'PGSUS',
  'SAHOL', 'SASA', 'SISE', 'TAVHL', 'TCELL', 'THYAO', 'TOASO', 'TTKOM', 'TUPRS', 'YKBNK',
];

export const DEFAULT_CONFIG: RadarConfig = {
  schemaVersion: 1,
  watchlist: [
    { symbol: 'NIY=F', name: 'Japan 225 (vadeli)', alerts: [] },
    { symbol: 'USDJPY=X', name: 'USDJPY', alerts: [] },
    { symbol: 'EURUSD=X', name: 'EURUSD', alerts: [] },
    { symbol: 'GC=F', name: 'Altın', alerts: [] },
    { symbol: '^GSPC', name: 'S&P 500', alerts: [] },
    { symbol: 'XU100.IS', name: 'BIST 100', alerts: [] },
    { symbol: 'XU030.IS', name: 'BIST 30', alerts: [] },
    { symbol: 'BTC-USD', name: 'Bitcoin', alerts: [] },
    { symbol: 'GBPUSD=X', name: 'GBPUSD', alerts: [] },
    { symbol: 'USDCHF=X', name: 'USDCHF', alerts: [] },
    { symbol: 'AUDUSD=X', name: 'AUDUSD', alerts: [] },
    { symbol: 'USDCAD=X', name: 'USDCAD', alerts: [] },
    { symbol: 'NZDUSD=X', name: 'NZDUSD', alerts: [] },
    { symbol: 'THYAO.IS', name: 'THY', alerts: [] },
    { symbol: 'ASELS.IS', name: 'Aselsan', alerts: [] },
    { symbol: 'MGROS.IS', name: 'Migros', alerts: [] },
    { symbol: 'BIMAS.IS', name: 'BİM', alerts: [] },
  ],
  scanner: {
    name: 'BIST 30',
    symbols: BIST30.map((s) => `${s}.IS`),
    timeframes: ['4h', '1d'],
  },
};
