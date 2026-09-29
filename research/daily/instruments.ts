// Enstrümanlar ve maliyet varsayımları (ön kayıt: research/STRATEJI-KARSILASTIRMA-KURAL.md).
export interface Instrument {
  id: string;
  name: string;
  symbol: string;
  /** Spread, endeks puanı (gidiş-dönüş toplamı bir kez). */
  spread: number;
  spreadNote: string;
  /** Swap: uzun/kısa, gece başına maliyet (pozitif sayı = ödenen). */
  swapLong: number;
  swapShort: number;
  /** Swap yorumları: 'points' = puan/gece, 'annualPct' = yıllık % (fiyatın). */
  swapModes: ('points' | 'annualPct')[];
  swapNote: string;
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'jp225',
    name: 'Japan 225 (^N225)',
    symbol: '^N225',
    spread: 17,
    spreadNote: 'FxPro #Japan225, kullanıcı ekranında gözlenen',
    swapLong: 6.5306,
    swapShort: 3.0551,
    swapModes: ['points', 'annualPct'],
    swapNote: 'FxPro #Japan225: uzun −6,5306, kısa −3,0551 "pip"; birim doğrulanmadı, iki yorum',
  },
  {
    id: 'us500',
    name: 'S&P 500 (^GSPC)',
    symbol: '^GSPC',
    spread: 0.7,
    spreadNote: 'FxPro #USSPX500, kullanıcı ekranında gözlenen (0,70)',
    swapLong: 6.5306,
    swapShort: 3.0551,
    swapModes: ['annualPct'],
    swapNote: 'DOĞRULANMADI — varsayım: yıllık %, Japan 225 ile aynı oranlar',
  },
  {
    id: 'us100',
    name: 'Nasdaq 100 (^NDX)',
    symbol: '^NDX',
    spread: 2.0,
    spreadNote: 'DOĞRULANMADI — varsayım 2,0 puan',
    swapLong: 6.5306,
    swapShort: 3.0551,
    swapModes: ['annualPct'],
    swapNote: 'DOĞRULANMADI — varsayım: yıllık %, Japan 225 ile aynı oranlar',
  },
];
