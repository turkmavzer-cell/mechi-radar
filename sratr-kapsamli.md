# Kapsamlı strateji araştırması — Japan 225, 10x kaldıraç

Veri: Yahoo NIY=F (CME vadeli), 1s mumlar 2024-05-08 – 2026-09-30; 2s/3s/4s/6s/8s/12s 1s'ten (UTC sınırlı) birleştirildi, günlük Yahoo'dan.
Maliyet: 17 puan spread + 8,5 puan kayma (her işlemde bir kez) + swap (uzun %6,53, kısa %3,06 yıllık; Cuma 3 gün). 10x kaldıraç, bileşik, stop-out: özsermaye pozisyonun %1'i (marj %5, stop-out %20 varsayımı).
Giriş/çıkış: sinyal mum kapanışında, işlem bir sonraki mumun açılışında; stoplar mum içinde (boşlukta açılış fiyatından). Ele: en düşük bakiye < %40, maks. düşüş > %50 ya da stop-out.
Walk-forward: 6 ay eğitim → 2 ay test, 2 ay kaydırma; seçim yalnızca eğitimde (kısıtları sağlayan en yüksek bileşik bakiye; hiçbiri sağlamazsa o 2 ay işlem yok).

**Toplam denenen varyant: 812** (9 aile × parametre × 8 zaman dilimi). 15dk/30dk ayrıca (aşağıda), doğrulanamaz.

## 1. Aile özeti (walk-forward, yalnız test parçaları)

| Aile | Varyant | Tüm dönemde kısıtı geçen | Tüm dönem en iyi (seçim yanlılıklı) | WF test: 1000 $ → | İşlem | İsabet | İşlem başı net puan | Maks. düşüş | En düşük bakiye | Stop-out |
|---|---|---|---|---|---|---|---|---|---|---|
| EMA kesişimi | 288 | 4 | 2156 $ | 153 $ | 25 | %20 | -287 | %89,7 | 103 $ | hayır |
| Donchian kırılımı | 96 | 0 | 1860 $ | 49 $ | 42 | %26 | -191 | %98,0 | 21 $ | hayır |
| Supertrend | 120 | 0 | 3313 $ | 11 $ | 37 | %30 | -290 | %99,4 | 11 $ | hayır |
| MACD | 64 | 0 | 3097 $ | 548 $ | 64 | %41 | 26 | %75,5 | 245 $ | hayır |
| RSI(2) dönüş | 64 | 8 | 6873 $ | 3.568 $ | 79 | %62 | 136 | %68,8 | 321 $ | hayır |
| Bollinger dönüş | 32 | 3 | 3186 $ | 191 $ | 40 | %43 | -177 | %81,0 | 190 $ | hayır |
| ATR kanal kırılımı | 96 | 0 | 479 $ | 30 $ | 30 | %30 | -402 | %97,6 | 24 $ | hayır |
| Momentum (ROC) | 48 | 0 | 251 $ | 156 $ | 122 | %31 | -25 | %92,4 | 85 $ | hayır |
| Tokyo açılış kırılımı | 4 | 0 | 389 $ | 431 $ | 112 | %43 | -9 | %79,3 | 334 $ | hayır |

**Tüm aileler birlikte walk-forward** (her katta 812 varyant arasından seçim): 1000 $ → 11 $, 84 işlem, isabet %32, maks. düşüş %99,1, en düşük 11 $.

## 2. En iyi 3 aday (aile içi walk-forward, test sonuçları)

### 1. RSI(2) dönüş

- **Walk-forward test (10x, 1000 $):** 3.568 $ · getiri %257 · 79 işlem · isabet %62 · işlem başı net 136 puan · maks. düşüş %68,8 · en düşük 321 $ · stop-out hayır · hızlı zararlı çıkış (≤3 mum) %5
- **Son 12 ay (test parçaları):** 5.814 $ (26 işlem)
- **Kaldıraç duyarlılığı (aynı test işlemleri):** 1x → 1.191 $ (düşüş %8, en düşük 925 $) · 2x → 1.402 $ (düşüş %15, en düşük 850 $) · 3x → 1.634 $ (düşüş %23, en düşük 776 $) · 5x → 2.151 $ (düşüş %38, en düşük 632 $) · 10x → 3.568 $ (düşüş %69, en düşük 321 $, kısıtı aşıyor)
- **Monte Carlo (bootstrap: işlemler yerine koyarak rastgele sırayla yeniden örneklendi, 2000 tekrar):** bitiş %5 / %50 / %95: 708 $ / 3.730 $ / 16.585 $ · stop-out olasılığı %0,0 · bakiye %40 altına inme %31,3 · düşüş > %50 %97,5
- **Seçilen parametreler (katlar):** 2024-11-06: RSI(2) dönüş|2h|5,iki yön,3 · 2025-01-06: RSI(2) dönüş|4h|10,iki yön,3 · 2025-03-08: RSI(2) dönüş|3h|10,iki yön,3 · 2025-05-08: RSI(2) dönüş|8h|10,iki yön,0 · 2025-07-08: RSI(2) dönüş|8h|10,iki yön,0 · 2025-09-07: RSI(2) dönüş|8h|10,iki yön,0 · 2025-11-07: RSI(2) dönüş|12h|10,uzun,0 · 2026-01-06: RSI(2) dönüş|12h|10,uzun,0 · 2026-03-08: RSI(2) dönüş|12h|5,uzun,0 · 2026-05-08: RSI(2) dönüş|8h|5,iki yön,0 · 2026-07-08: RSI(2) dönüş|8h|5,iki yön,0 · 2026-09-07: RSI(2) dönüş|1d|10,uzun,0
- **Son seçim (Pine için):** 1d · {"eşik":10,"yön":"uzun","stopATR":0}
- **Aynı parametre tüm dönem (in-sample, seçim yanlılıklı):** 1.064 $, 17 işlem, isabet %59, maks. düşüş %89,6 · kapanışta giriş: 6.033 $ (17 işlem)
- **Deflated Sharpe:** 0,25 (N = 812 deneme; 0,95 üstü anlamlı sayılır)
- **Parametre yaylası:** aynı zaman diliminde tek parametresi farklı 3 komşudan 2'i (işlem başı net > 0), diğer zaman dilimlerinde aynı parametrelerin 7'inden 2'i kârlı
- **Diğer enstrümanlar (aynı aile, aynı yöntem):** USDJPY: 710 $ (105 işlem, maks. düşüş %80,1) · Nasdaq 100: 2.304 $ (113 işlem, maks. düşüş %88,8) · Altın: 115 $ (46 işlem, maks. düşüş %96,8, stop-out)
- **Rejim (çeyrek bazında test getirisi, işlem sayısı):** 2024-Ç4: %-17 (10) · 2025-Ç1: %-18 (19) · 2025-Ç2: %-23 (12) · 2025-Ç3: %17 (12) · 2025-Ç4: %40 (8) · 2026-Ç1: %98 (8) · 2026-Ç2: %40 (4) · 2026-Ç3: %50 (6)

### 2. MACD

- **Walk-forward test (10x, 1000 $):** 548 $ · getiri %-45 · 64 işlem · isabet %41 · işlem başı net 26 puan · maks. düşüş %75,5 · en düşük 245 $ · stop-out hayır · hızlı zararlı çıkış (≤3 mum) %14
- **Son 12 ay (test parçaları):** 592 $ (47 işlem)
- **Kaldıraç duyarlılığı (aynı test işlemleri):** 1x → 1.017 $ (düşüş %9, en düşük 918 $) · 2x → 1.015 $ (düşüş %18, en düşük 832 $) · 3x → 997 $ (düşüş %27, en düşük 745 $) · 5x → 913 $ (düşüş %43, en düşük 577 $) · 10x → 548 $ (düşüş %75, en düşük 245 $, kısıtı aşıyor)
- **Monte Carlo (bootstrap: işlemler yerine koyarak rastgele sırayla yeniden örneklendi, 2000 tekrar):** bitiş %5 / %50 / %95: 58 $ / 429 $ / 3.806 $ · stop-out olasılığı %0,0 · bakiye %40 altına inme %70,2 · düşüş > %50 %98,2
- **Seçilen parametreler (katlar):** 2024-11-06: MACD|3h|sıfır,1,0 · 2025-01-06: işlem yok · 2025-03-08: işlem yok · 2025-05-08: MACD|12h|sinyal,1,0 · 2025-07-08: MACD|6h|sıfır,0,2 · 2025-09-07: MACD|12h|sıfır,1,0 · 2025-11-07: MACD|6h|sinyal,1,0 · 2026-01-06: MACD|6h|sıfır,1,0 · 2026-03-08: MACD|1h|sinyal,1,2 · 2026-05-08: MACD|12h|sıfır,1,0 · 2026-07-08: MACD|8h|sıfır,1,0 · 2026-09-07: MACD|8h|sıfır,1,0
- **Son seçim (Pine için):** 8h · {"tür":"sıfır","ema200":1,"stopATR":0}
- **Aynı parametre tüm dönem (in-sample, seçim yanlılıklı):** 1.388 $, 26 işlem, isabet %42, maks. düşüş %95,3 · kapanışta giriş: 1.355 $ (26 işlem)
- **Deflated Sharpe:** 0,08 (N = 812 deneme; 0,95 üstü anlamlı sayılır)
- **Parametre yaylası:** aynı zaman diliminde tek parametresi farklı 3 komşudan 1'i (işlem başı net > 0), diğer zaman dilimlerinde aynı parametrelerin 7'inden 3'i kârlı
- **Diğer enstrümanlar (aynı aile, aynı yöntem):** USDJPY: 1.294 $ (347 işlem, maks. düşüş %66,0) · Nasdaq 100: 41 $ (78 işlem, maks. düşüş %97,2) · Altın: 2.294 $ (224 işlem, maks. düşüş %87,3)
- **Rejim (çeyrek bazında test getirisi, işlem sayısı):** 2024-Ç4: %-7 (3) · 2025-Ç1: %-15 (2) · 2025-Ç2: %4 (6) · 2025-Ç3: %13 (6) · 2025-Ç4: %-40 (6) · 2026-Ç1: %-52 (16) · 2026-Ç2: %111 (24) · 2026-Ç3: %-3 (1)

### 3. Tokyo açılış kırılımı

- **Walk-forward test (10x, 1000 $):** 431 $ · getiri %-57 · 112 işlem · isabet %43 · işlem başı net -9 puan · maks. düşüş %79,3 · en düşük 334 $ · stop-out hayır · hızlı zararlı çıkış (≤3 mum) %17
- **Son 12 ay (test parçaları):** 474 $ (102 işlem)
- **Kaldıraç duyarlılığı (aynı test işlemleri):** 1x → 976 $ (düşüş %13, en düşük 950 $) · 2x → 939 $ (düşüş %24, en düşük 890 $) · 3x → 892 $ (düşüş %35, en düşük 823 $) · 5x → 772 $ (düşüş %52, en düşük 678 $, kısıtı aşıyor) · 10x → 431 $ (düşüş %79, en düşük 334 $, kısıtı aşıyor)
- **Monte Carlo (bootstrap: işlemler yerine koyarak rastgele sırayla yeniden örneklendi, 2000 tekrar):** bitiş %5 / %50 / %95: 86 $ / 490 $ / 2.789 $ · stop-out olasılığı %0,0 · bakiye %40 altına inme %60,3 · düşüş > %50 %96,0
- **Seçilen parametreler (katlar):** 2024-11-06: işlem yok · 2025-01-06: işlem yok · 2025-03-08: işlem yok · 2025-05-08: işlem yok · 2025-07-08: işlem yok · 2025-09-07: Tokyo açılış kırılımı|1h|2,21 · 2025-11-07: Tokyo açılış kırılımı|1h|2,21 · 2026-01-06: Tokyo açılış kırılımı|1h|2,21 · 2026-03-08: Tokyo açılış kırılımı|1h|2,21 · 2026-05-08: işlem yok · 2026-07-08: Tokyo açılış kırılımı|1h|2,6 · 2026-09-07: Tokyo açılış kırılımı|1h|2,6
- **Son seçim (Pine için):** 1h · {"aralıkMum":2,"çıkışSaatiUTC":6}
- **Aynı parametre tüm dönem (in-sample, seçim yanlılıklı):** 389 $, 290 işlem, isabet %43, maks. düşüş %84,7 · kapanışta giriş: 343 $ (290 işlem)
- **Deflated Sharpe:** 0,00 (N = 812 deneme; 0,95 üstü anlamlı sayılır)
- **Parametre yaylası:** aynı zaman diliminde tek parametresi farklı 2 komşudan 1'i (işlem başı net > 0), diğer zaman dilimlerinde aynı parametrelerin 0'inden 0'i kârlı
- **Diğer enstrümanlar (aynı aile, aynı yöntem):** USDJPY: 1.330 $ (284 işlem, maks. düşüş %34,9) · Nasdaq 100: 786 $ (206 işlem, maks. düşüş %56,6) · Altın: 363 $ (347 işlem, maks. düşüş %90,4)
- **Rejim (çeyrek bazında test getirisi, işlem sayısı):** 2025-Ç3: %-9 (10) · 2025-Ç4: %-10 (31) · 2026-Ç1: %-22 (29) · 2026-Ç2: %-43 (15) · 2026-Ç3: %19 (27)

## 3. 15dk / 30dk (yalnız ~60 gün veri — walk-forward yapılamaz, DOĞRULANAMAZ)

Denenen 202 varyant; tüm dönemde en iyi 5 (seçim yanlılıklı):

- Bollinger dönüş|30m|2,iki yön: 1.792 $, 32 işlem, maks. düşüş %19,4
- Bollinger dönüş|30m|2,uzun: 1.478 $, 20 işlem, maks. düşüş %13,6
- Bollinger dönüş|30m|2.5,uzun: 1.443 $, 12 işlem, maks. düşüş %10,7
- Bollinger dönüş|30m|2.5,iki yön: 1.410 $, 13 işlem, maks. düşüş %12,6
- RSI(2) dönüş|30m|5,uzun,0: 1.277 $, 21 işlem, maks. düşüş %6,5

## 4. Walk-forward seçimleri (tüm aileler birlikte)

- 2024-11-06 – 2025-01-06: Momentum (ROC)|4h|20,3 (eğitim bakiyesi ×10,59)
- 2025-01-06 – 2025-03-08: Supertrend|3h|14,3,adx20 (eğitim bakiyesi ×4,13)
- 2025-03-08 – 2025-05-08: RSI(2) dönüş|3h|10,iki yön,3 (eğitim bakiyesi ×1,31)
- 2025-05-08 – 2025-07-08: Momentum (ROC)|3h|50,3 (eğitim bakiyesi ×1,64)
- 2025-07-08 – 2025-09-07: EMA kesişimi|4h|50,200,2,0 (eğitim bakiyesi ×6,25)
- 2025-09-07 – 2025-11-07: EMA kesişimi|6h|20,50,0,1 (eğitim bakiyesi ×7,31)
- 2025-11-07 – 2026-01-06: Supertrend|8h|10,2,günlük (eğitim bakiyesi ×7,25)
- 2026-01-06 – 2026-03-08: Supertrend|1d|10,3,günlük (eğitim bakiyesi ×6,68)
- 2026-03-08 – 2026-05-08: Supertrend|1d|10,2,adx20 (eğitim bakiyesi ×9,76)
- 2026-05-08 – 2026-07-08: EMA kesişimi|3h|50,100,3,1 (eğitim bakiyesi ×4,70)
- 2026-07-08 – 2026-09-07: Supertrend|1h|14,3,günlük (eğitim bakiyesi ×6,10)
- 2026-09-07 – 2026-09-30: Supertrend|1d|10,3,yok (eğitim bakiyesi ×4,39)
