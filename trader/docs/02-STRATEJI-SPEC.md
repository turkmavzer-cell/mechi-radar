# Strateji tanımı (tek doğru kaynak)

Botun sinyalleri Mechi Radar'daki TypeScript koduyla **aynı** olmalı. Çelişki olursa referans koddur:

| Konu | Referans dosya (mechi-radar) |
|---|---|
| İndikatör formülleri | `src/core/indicators.ts` |
| SRA ve filtreleri, üst zaman dilimi | `src/core/sratr.ts` |
| Ortak pozisyon motoru, SAR + MACD, Squeeze | `src/core/boxes.ts` |
| Uygulamada gösterilen strateji listesi | `src/core/boxStrategies.ts` |

İlk sürümde yalnızca **SRA** uygulanır. Diğerleri parametreyle seçilebilir hale sonraki aşamada gelir.

## 1. Genel kurallar (tüm stratejiler)

- Sinyaller yalnızca **kapanmış mumda** hesaplanır (cBot'ta `OnBar`: yeni mum açıldığında bir önceki mum kapanmıştır).
- Giriş: sinyal mumunun kapanışından hemen sonra, **piyasa emri**.
- ATR = ATR(14), Wilder yumuşatması, sinyal mumundaki değer.
- **Stop mesafesi = 1,5 × ATR**, **hedef mesafesi = 2 × stop mesafesi = 3 × ATR** (1:2).
  - Mechi Radar mesafeleri sinyal mumu kapanışından ölçer. Botta mesafeler **gerçekleşen giriş fiyatından** uygulanır
    (R sabit kalsın diye). Fark küçüktür; eşleşme testinde yalnızca giriş zamanı ve yönü karşılaştırılır.
- Pozisyon yalnızca stop ya da hedefle kapanır. Ters sinyal pozisyonu kapatmaz.
- **Aynı sembol + aynı strateji için tek pozisyon.** Açık pozisyon varken gelen sinyaller yok sayılır (Mechi Radar'daki `busyUntil`).
- Stop ve hedef, emirle birlikte brokere gönderilir (sunucu tarafı SL/TP). Bot kapansa bile pozisyon korunur.

## 2. İndikatör formülleri (TradingView ile uyumlu)

Seri başındaki yetersiz veri NaN'dır; NaN içeren hesaplar sinyal üretmez.

- **SMA(n):** son n değerin aritmetik ortalaması.
- **RMA(n) (Wilder):** ilk değer = ilk n geçerli değerin SMA'sı; sonra `rma = (rma_önceki × (n−1) + x) / n`.
- **EMA(n):** `k = 2/(n+1)`; ilk değer = ilk n değerin SMA'sı; sonra `ema = x·k + ema_önceki·(1−k)`.
- **RSI(14):** `kazanç = max(Δkapanış, 0)`, `kayıp = max(−Δkapanış, 0)` (ilk mumda yok);
  `RSI = 100 − 100 / (1 + RMA14(kazanç) / RMA14(kayıp))`; kayıp ortalaması 0 ise RSI = 100.
- **RSI ortalaması:** RSI'ın SMA 14'ü; RSI'ın ilk geçerli değerinden itibaren hesaplanır.
- **Stokastik (14, 3, 3):** `ham = 100 × (kapanış − en düşük14) / (en yüksek14 − en düşük14)`; en yüksek = en düşük ise 50.
  `%K = SMA3(ham)`, `%D = SMA3(%K)`. Strateji **%K** kullanır. En yüksek/en düşük mumların high/low değerleridir.
- **ATR(14):** `TR = max(H−L, |H−öncekiC|, |L−öncekiC|)`, ilk mumda `H−L`; `ATR = RMA14(TR)`.

> cTrader'ın hazır `RelativeStrengthIndex`, `StochasticOscillator`, `AverageTrueRange` indikatörleri bu formüllerden
> (özellikle başlangıç ve yumuşatma türünde) farklı olabilir. **Hazır indikatör kullanılmaz**; yukarıdaki formüller
> `Indicators/` altında elle yazılır ve birim testle Mechi Radar çıktısına karşı doğrulanır.

## 3. Üst zaman dilimi

| İşlem zaman dilimi | Üst zaman dilimi |
|---|---|
| 15dk, 20dk | 1s |
| 30dk | 2s |
| 1s | 4s |
| 2s, 4s | 1g |
| 1g | Haftalık |

- Bir mumun kapanış anında yalnızca **o ana kadar kapanmış** üst zaman dilimi mumları kullanılır.
  Kural: üst mumun `açılış + süre ≤ alt mumun açılış + süre`.
  Haftalık mum Pazartesi 00:00 UTC'de başlar, süresi 7 gündür.
- cTrader'da oluşmakta olan son üst mum `Bars.Last(0)`'dır; **kullanılmaz**.

## 4. SRA (Stokastik-RSI-ATR) — ilk sürüm

Her kapanan mum `i` için:

1. `yukarı = RSI[i−1] ≤ Ort[i−1] ve RSI[i] > Ort[i]`, `aşağı = RSI[i−1] ≥ Ort[i−1] ve RSI[i] < Ort[i]`.
2. Kapanmış **son 3** üst zaman dilimi mumunun %K değerlerine bak: birinde `< 20` ise `düşük`, birinde `> 80` ise `yüksek`.
3. `yukarı ve düşük` → **LONG**; `aşağı ve yüksek` → **SHORT**; değilse sinyal yok.
4. ATR geçersizse sinyal yok.

## 5. Sonraki sürümler (parametreyle seçilir)

- **SRA + EMA 200:** SRA şartına ek olarak LONG için `kapanış > EMA200`, SHORT için `kapanış < EMA200`.
- **SRA + ADX:** SRA şartına ek olarak `ADX(14) < 25`. ADX, +DM/−DM ve TR'nin RMA14'ü, `DX = 100·|+DI − −DI| / (+DI + −DI)`, `ADX = RMA14(DX)`.
- **SAR + EMA 200 + MACD:** Parabolic SAR (0,02 / 0,02 / 0,2) fiyatın altına geçer (yön değişimi), `kapanış > EMA200` ve
  `MACD(12,26,9) > sinyal` → LONG; tersi SHORT. SAR başlangıç ve kural ayrıntısı: `indicators.ts → psar`.
- **TTM Squeeze:** Bollinger (20, 2) önceki mumda Keltner (20, 1,5 × ATR20, orta = EMA20) içindeydi, bu mumda değil
  (sıkışma bitti); momentum = `linreg(kapanış − ((en yüksek20 + en düşük20)/2 + SMA20)/2, 20)`;
  `mom > 0`, `mom > mom[i−1]`, `kapanış > SMA50` → LONG; tersi SHORT.

## 6. Bilinen farklar (kabul edilen)

- Mechi Radar mumları Yahoo verisinden, bot mumları FxPro fiyatından gelir. Fiyatlar, seans saatleri ve mum sınırları farklı
  olabilir (ör. Yahoo `NIY=F` vadeli ile FxPro Japan 225 CFD). Bu yüzden **aynı veri üzerinde** eşleşme beklenir, farklı
  veri kaynaklarında birebir aynı sinyal beklenmez. Bkz. `05-TEST-PLANI.md`.
- 20dk mum: cTrader'da `TimeFrame.Minute20` vardır; Mechi Radar 20dk'yı 5dk mumlardan birleştirir.
