import { BOX_CANDIDATES, BOX_PARAMS, simulate, type BoxParams, type BoxTrade } from './boxes';
import { HIGHER_LABEL, HIGHER_TF, SR_PARAMS, srTrades, type HigherSeries } from './sratr';
import { bbStochSignals, bbTarget, ema2155BreakSignals, ema2155Signals, ema20Exit, ema21CloseExit, ema55Line, emaVolHaSignals, haSmoothedExit, haSmoothedSignals, rsiLevelExit, rsiMacdSignals, triangleSignals } from './setups';
import type { Candle, Strategy, Timeframe } from './types';

/** Grafikte kutularla gösterilen, bildirim üreten giriş-stop-hedef stratejileri. */
export interface BoxStrategy {
  id: Strategy;
  name: string;
  /** Çipte görünen kısa ad. */
  short: string;
  /** Tek satırlık kural özeti. */
  rule: (tf: Timeframe) => string;
  /** `exit` ile çıkış kuralı değiştirilebilir (ör. `{ trail: 1 }` takip eden kâr al). */
  run: (closed: Candle[], tf: Timeframe, higher: HigherSeries | undefined, exit?: Partial<BoxParams>) => BoxTrade[];
}

const exits = `Stop ${SR_PARAMS.stopAtr.toLocaleString('tr-TR')} ATR · hedef ${SR_PARAMS.rr}R`;
const sra = (id: Strategy, name: string, short: string, filters: string[], extra: string): BoxStrategy => ({
  id,
  name,
  short,
  rule: (tf) => `${HIGHER_LABEL[HIGHER_TF[tf]]} Stokastik 20 altı/80 üstü + RSI ortalamasını keser${extra} · ${exits}`,
  run: (c, tf, higher, exit) => srTrades(c, tf, higher, { ...SR_PARAMS, ...exit }, filters),
});

const fromCandidate = (id: Strategy, candidate: string, short: string, rule: string): BoxStrategy => {
  const b = BOX_CANDIDATES.find((x) => x.id === candidate)!;
  return { id, name: b.name, short, rule: () => `${rule} · ${exits}`, run: (c, _tf, _h, exit) => simulate(c, b.signals(c), { ...BOX_PARAMS, ...exit }, b.exit?.(c)) };
};

/** Stop/hedef ayarları research/yeni-stratejiler.ts ile verinin ilk yarısında seçildi (research/YENI-STRATEJILER.md). */
const custom = (id: Strategy, name: string, short: string, rule: string, run: BoxStrategy['run']): BoxStrategy => ({ id, name, short, rule: () => rule, run });
const NO_TARGET = Number.POSITIVE_INFINITY;
/** EMA 21/55: kesişim başına tek işlem, kopuş ve ortalama arası mesafe şartı (research/YENI-STRATEJILER.md). */
const EMA2155_OPTS = { firstOnly: true, breakAtr: 1, gapAtr: 1 };
const EMA2155_EXIT: BoxParams = { stopAtr: 2, rr: 3 };

export const BOX_STRATEGIES: BoxStrategy[] = [
  sra('sratr', 'Stokastik-RSI-ATR', 'SRA', [], ''),
  sra('sratrEma', 'SRA + EMA 200', 'SRA + EMA 200', ['ema200'], ' · EMA 200 yönünde'),
  sra('sratrAdx', 'SRA + ADX', 'SRA + ADX', ['adxRange'], ' · ADX 25 altı'),
  fromCandidate('sarmacd', 'sarmacd', 'SAR + MACD', 'SAR fiyatın altına geçer + fiyat EMA 200 üstünde + MACD sinyalin üstünde (short tersi)'),
  fromCandidate('squeeze', 'squeeze', 'Squeeze', 'Sıkışma biter (Bollinger, Keltner dışına çıkar) + momentum ve SMA 50 aynı yönde'),
  // 4s/15dk testinde (research/ODAK-4S-15DK.md) maliyet dahil geçenler; kanıt yetersiz (t < 2).
  fromCandidate('st200', 'st200', 'Supertrend + EMA 200', 'Supertrend (10, 3) yükselişe döner + fiyat EMA 200 üstünde (short tersi) · testte 4s, takip eden TP ile'),
  fromCandidate('utbot', 'utbot', 'UT Bot', 'UT Bot (1, 10) al sinyali + fiyat EMA 200 üstünde (short tersi) · testte 4s ve 15dk'),
  custom('ema2155', 'EMA 21/55 geri çekilmesi', 'EMA 21/55', 'EMA 21, EMA 55\'i keser; fiyat EMA 21\'den en az 1 ATR kopar, sonra mum EMA 21\'e değip üstünde yeşil kapanır ve iki EMA arası en az 1 ATR → LONG (short tersi) · kesişim başına tek işlem · Stop 2 ATR · hedef 3R', (c, _tf, _h, exit) =>
    simulate(c, ema2155Signals(c, EMA2155_OPTS), { ...EMA2155_EXIT, ...exit }),
  ),
  custom('ema2155bo', 'EMA 21/55 kırılım', 'EMA 21/55 kırılım', 'EMA 21 > 55 iken geri çekilme EMA 21\'e değer, sonra mum geri çekilme öncesindeki tepenin üstünde kapanır → LONG (short tersi) · kesişim başına tek işlem · Stop geri çekilmenin dibinin altında (en az 1 ATR) · Çıkış EMA 21 altında kapanışta', (c, _tf, _h, exit) =>
    simulate(c, ema2155BreakSignals(c, { firstOnly: true, minStopAtr: 1 }), { stopAtr: 2, rr: NO_TARGET, ...exit }, ema21CloseExit(c, 0)),
  ),
  custom('ema2155bt', 'EMA 21/55 kırılım + takip', 'EMA 21/55 kırılım + takip', 'Giriş ve stop EMA 21/55 kırılımla aynı · 1R kâra ulaştıktan sonra EMA 21 altında kapanışta çıkış (öncesinde yalnızca stop)', (c, _tf, _h, exit) =>
    simulate(c, ema2155BreakSignals(c, { firstOnly: true, minStopAtr: 0.5 }), { stopAtr: 2, rr: NO_TARGET, ...exit }, ema21CloseExit(c, 1)),
  ),
  custom('ema2155b55', 'EMA 21/55 kırılım · EMA 55 çıkışı', 'EMA 21/55 kırılım · 55 çıkış', 'Giriş ve stop EMA 21/55 kırılımla aynı · Çıkış fiyat EMA 55\'e değince (EMA 55 seviyesinden)', (c, _tf, _h, exit) =>
    simulate(c, ema2155BreakSignals(c, { firstOnly: true, minStopAtr: 1 }), { stopAtr: 2, rr: NO_TARGET, ...exit }, undefined, undefined, ema55Line(c)),
  ),
  custom('bbstoch', 'Bollinger + Stokastik', 'Bollinger + Stok.', 'Üst banda değer + Stokastik (14, 1, 3) %K %D\'yi aşağı keser → SHORT (alt bant + yukarı → LONG) · bant darsa sinyal yok · Stop 2 ATR · hedef karşı bant', (c, _tf, _h, exit) =>
    simulate(c, bbStochSignals(c, 1), { stopAtr: 2, rr: 2, ...exit }, undefined, bbTarget(c)),
  ),
  custom('hasmooth', 'Heikin Ashi Smoothed', 'HA Smoothed', 'Heikin Ashi Smoothed (10, 10) yeşile döner → LONG, kırmızıya → SHORT · renk dönünce işlem kapanır ve ters yönde yenisi açılır · acil stop 2 ATR', (c, _tf, _h, exit) =>
    simulate(c, haSmoothedSignals(c), { stopAtr: 2, rr: NO_TARGET, sameBarEntry: true, ...exit }, haSmoothedExit(c)),
  ),
  custom('hasmoothAdx', 'Heikin Ashi Smoothed + ADX', 'HA Smoothed + ADX', 'HA Smoothed renk dönüşü, yalnızca ADX(14) 20 üstündeyken (trend varken) giriş; yatay piyasada renk dönüşü yalnızca işlemi kapatır · acil stop 2 ATR', (c, _tf, _h, exit) =>
    simulate(c, haSmoothedSignals(c, 20), { stopAtr: 2, rr: NO_TARGET, sameBarEntry: true, ...exit }, haSmoothedExit(c)),
  ),
  custom('rsimacd', 'RSI + MACD', 'RSI + MACD', 'RSI(14) 50\'yi yukarı keser ve MACD mavi çizgisi 0 üstünde (ya da aynı anda keser) → LONG; tersi SHORT · Çıkış RSI 70\'e (SHORT\'ta 30\'a) değince · acil stop 3 ATR', (c, _tf, _h, exit) =>
    simulate(c, rsiMacdSignals(c), { stopAtr: 3, rr: Number.POSITIVE_INFINITY, ...exit }, rsiLevelExit(c, 70)),
  ),
  custom('triangle', 'Üçgen formasyonları', 'Üçgen', 'Yükselen üçgen yukarı, alçalan aşağı, simetrik iki yöne kırılımda (kapanış çizginin ötesinde) · Stop 1,5 ATR · hedef 3R', (c, _tf, _h, exit) =>
    simulate(c, triangleSignals(c), { stopAtr: 1.5, rr: 3, ...exit }),
  ),
  custom('emavolha', 'EMA 20/50 + hacim + HA', 'EMA + hacim + HA', 'EMA 20 > 50 iken EMA 20\'ye geri çekilme (hacim artışıyla), Heikin Ashi yeşile döner + RSI 50 üstü → LONG (short tersi) · Çıkış EMA 20 altı kapanış · acil stop 1,5 ATR', (c, _tf, _h, exit) =>
    simulate(c, emaVolHaSignals(c, 1.2, true), { stopAtr: 1.5, rr: NO_TARGET, ...exit }, ema20Exit(c, 'close')),
  ),
  fromCandidate('rsi2', 'rsi2', 'RSI(2)', 'Fiyat SMA 200 üstünde + RSI(2) 5 altına iner → LONG; altında + 95 üstü → SHORT · testte 15dk, takip eden TP ile'),
];
