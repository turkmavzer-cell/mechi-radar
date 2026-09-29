# Günlük strateji karşılaştırması (maliyet dahil)

Oluşturma: 2026-09-29 · Kod: `research/daily/` · Karar kuralı (ön kayıt): `STRATEJI-KARSILASTIRMA-KURAL.md` · Yıllık tablolar: `STRATEJI-KARSILASTIRMA-YILLIK.md`

> Geçmiş sonuçlar geleceği garanti etmez. "Maliyetler hariç" işaretli sütunlar spread, kayma ve swap içermez.

## Karar kuralının sonucu

**Maliyetler fiyata oranlı** (spread ve puan/gece swap bugünkü fiyatta gözlendi; her işlemin fiyatına ölçeklendi):

| Aday | Japan 225 | S&P 500 | Nasdaq 100 | Sonuç | Sıralama puanı |
|---|---|---|---|---|---|
| A · Donchian 55/20 | ✓1 ✗2 ✓3 | ✗1 ✗2 ✗3 | ✓1 ✗2 ✓3 | **geçer** | 0,258 |
| B · TSMOM 12 ay | ✗1 ✗2 ✓3 | ✓1 ✗2 ✓3 | ✓1 ✗2 ✓3 | **geçer** | 2,241 |
| C · Connors RSI(2) + SMA 200 | ✗1 ✗2 ✓3 | ✓1 ✓2 ✓3 | ✓1 ✓2 ✓3 | **geçer** | 0,239 |
| D · Ay dönümü (TOM) | ✗1 ✗2 ✓3 | ✓1 ✓2 ✓3 | ✓1 ✓2 ✓3 | **geçer** | 0,215 |
| E1 · SAR + EMA 200 + MACD (mevcut) | ✗1 ✗2 ✓3 | ✗1 ✗2 ✓3 | ✓1 ✗2 ✓3 | kalır | — |
| E2 · SRA (mevcut) | ✗1 ✗2 ✗3 | ✗1 ✗2 ✗3 | ✗1 ✗2 ✗3 | kalır | — |

**Ön kayıt metnine harfiyen (sabit puan)** — yalnız karşılaştırma için; 1970–1990'larda endeks düşükken maliyeti onlarca kat abartır:

| Aday | Japan 225 | S&P 500 | Nasdaq 100 | Sonuç | Sıralama puanı |
|---|---|---|---|---|---|
| A · Donchian 55/20 | ✗1 ✗2 ✗3 | ✗1 ✗2 ✗3 | ✗1 ✗2 ✓3 | kalır | — |
| B · TSMOM 12 ay | ✗1 ✗2 ✗3 | ✗1 ✗2 ✓3 | ✓1 ✗2 ✓3 | kalır | — |
| C · Connors RSI(2) + SMA 200 | ✗1 ✗2 ✓3 | ✗1 ✗2 ✓3 | ✗1 ✗2 ✓3 | kalır | — |
| D · Ay dönümü (TOM) | ✗1 ✗2 ✓3 | ✗1 ✗2 ✓3 | ✗1 ✗2 ✓3 | kalır | — |
| E1 · SAR + EMA 200 + MACD (mevcut) | ✗1 ✗2 ✓3 | ✗1 ✗2 ✗3 | ✗1 ✗2 ✓3 | kalır | — |
| E2 · SRA (mevcut) | ✗1 ✗2 ✗3 | ✗1 ✗2 ✗3 | ✗1 ✗2 ✗3 | kalır | — |

> **Ön kayıttan sapma:** Ön kayıt spread'i "endeks puanı" olarak tanımladı. Bugün gözlenen puanı 1973'teki (S&P 500 ≈ 100) fiyata uygulamak maliyeti gerçekçi olmayan biçimde büyütüyor; bu sonuçlar görüldükten sonra fark edildi ve maliyet fiyata oranlandı. Karar kuralının kendisi değişmedi. İki uygulamanın sonucu yukarıda ayrı ayrı veriliyor.

1 = maliyet sonrası ort. R ilk ve ikinci yarıda > 0 · 2 = t ≥ 2 (sağlamazsa "kanıt yetersiz", elenmez) · 3 = %1 riskte en büyük düşüş < %30.
Aday, en az iki enstrümanda 1 ve 3 birlikte sağlanırsa geçer. Sıralama puanı: ort. net R × √(yılda işlem), bu enstrümanların ortalaması.
Toplam 6 aday × 3 enstrüman = 18 deneme: en iyi sonuçta seçim yanlılığı var, temkinli yorumlanmalı.


## Özet

- **A · Donchian 55/20: geçer** — 1 ve 3. şart: Japan 225 (^N225), Nasdaq 100 (^NDX). t < 2 (kanıt yetersiz): Japan 225 (^N225), Nasdaq 100 (^NDX). %1 riskte yaklaşık getiri (ort. net R × yılda işlem): Japan 225 (^N225) ≈ %0,6/yıl, Nasdaq 100 (^NDX) ≈ %0,5/yıl.
- **B · TSMOM 12 ay: geçer** — 1 ve 3. şart: S&P 500 (^GSPC), Nasdaq 100 (^NDX). t < 2 (kanıt yetersiz): S&P 500 (^GSPC), Nasdaq 100 (^NDX). %1 riskte yaklaşık getiri (ort. net R × yılda işlem): S&P 500 (^GSPC) ≈ %1,1/yıl, Nasdaq 100 (^NDX) ≈ %3,4/yıl. Japan 225'te geçmiyor (1. yarı +0,030, 2. yarı -0,324).
- **C · Connors RSI(2) + SMA 200: geçer** — 1 ve 3. şart: S&P 500 (^GSPC), Nasdaq 100 (^NDX). t ≥ 2 bu enstrümanlarda. %1 riskte yaklaşık getiri (ort. net R × yılda işlem): S&P 500 (^GSPC) ≈ %0,7/yıl, Nasdaq 100 (^NDX) ≈ %0,7/yıl. Japan 225'te geçmiyor (1. yarı -0,038, 2. yarı +0,069).
- **D · Ay dönümü (TOM): geçer** — 1 ve 3. şart: S&P 500 (^GSPC), Nasdaq 100 (^NDX). t ≥ 2 bu enstrümanlarda. %1 riskte yaklaşık getiri (ort. net R × yılda işlem): S&P 500 (^GSPC) ≈ %0,6/yıl, Nasdaq 100 (^NDX) ≈ %0,9/yıl. Japan 225'te geçmiyor (1. yarı +0,044, 2. yarı -0,033).
- **E1 · SAR + EMA 200 + MACD (mevcut): kalır** — yarı dönem net R (1./2.): Japan 225 (^N225) +0,264/-0,135; S&P 500 (^GSPC) -0,005/-0,053; Nasdaq 100 (^NDX) +0,143/+0,238.
- **E2 · SRA (mevcut): kalır** — yarı dönem net R (1./2.): Japan 225 (^N225) -0,119/-0,178, düşüş %43; S&P 500 (^GSPC) -0,049/-0,132, düşüş %47; Nasdaq 100 (^NDX) -0,057/-0,200, düşüş %48.

Karşılaştırma: al ve tut (maliyetler ve temettü hariç) Japan 225 (^N225) yıllık %1,6, en büyük düşüş %81; S&P 500 (^GSPC) yıllık %8,1, en büyük düşüş %57; Nasdaq 100 (^NDX) yıllık %14,4, en büyük düşüş %83.
Stratejilerin yıllık getiri tahmini %1 riskle ve işlemler üst üste binmeden hesaplandı; risk artırılırsa getiri ve düşüş birlikte büyür.
Sıralama puanı işlem başına R ile yılda işlem sayısını birleştirir; çok az işlemli adaylarda (ör. TSMOM, yılda ~1) puan tek tek işlemlere bağlıdır.

## Veri

| Enstrüman | Ham veri | Kullanılan (OHLC tam) | Test penceresi (ısınma 260 gün sonrası) | Mum |
|---|---|---|---|---|
| Japan 225 (^N225) | 1970-01-05 – 2026-09-28 | 1989-01-04 itibarıyla | 1990-01-23 – 2026-09-28 | 9001 |
| S&P 500 (^GSPC) | 1970-01-02 – 2026-09-29 | 1972-01-03 itibarıyla | 1973-01-15 – 2026-09-29 | 13540 |
| Nasdaq 100 (^NDX) | 1985-10-01 – 2026-09-29 | 1985-10-01 itibarıyla | 1986-10-10 – 2026-09-29 | 10068 |

Kaynak: Yahoo Finance günlük (nakit endeks). Eksik OHLC (yüksek ≤ düşük ya da açılış = kapanış = yüksek) oranı %2'yi aşan son yıldan sonrası kullanıldı.

## Maliyet varsayımları

| Enstrüman | Spread (puan) | Spread kaynağı | Swap |
|---|---|---|---|
| Japan 225 (^N225) | 17,0 | FxPro #Japan225, kullanıcı ekranında gözlenen | FxPro #Japan225: uzun −6,5306, kısa −3,0551 "pip"; birim doğrulanmadı, iki yorum |
| S&P 500 (^GSPC) | 0,7 | FxPro #USSPX500, kullanıcı ekranında gözlenen (0,70) | DOĞRULANMADI — varsayım: yıllık %, Japan 225 ile aynı oranlar |
| Nasdaq 100 (^NDX) | 2,0 | DOĞRULANMADI — varsayım 2,0 puan | DOĞRULANMADI — varsayım: yıllık %, Japan 225 ile aynı oranlar |

İşlem başına `1,5 × spread` (spread + 0,5 × spread kayma). Swap her takvim gecesi (Cuma → Pazartesi 3 gece). Karar için iki swap yorumundan yüksek olanı (temkinli) kullanıldı. Komisyon 0.

## Japan 225 (^N225)

| Aday | İşlem | Yılda | İsabet % | Ort. R (maliyetler hariç) | **Ort. net R** | t | Toplam net R | PF | En uzun kayıp serisi | En büyük düşüş %1 risk | Piyasada % | 1. yarı net R (n) | 2. yarı net R (n) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A · Donchian 55/20 | 161 | 4,4 | 26,7 | +0,365 | **+0,130** | 0,55 | +21,0 | 1,17 | 11 | %22,0 | %51,1 | +0,193 (79) | +0,070 (82) |
| B · TSMOM 12 ay | 76 | 2,1 | 19,7 | +0,366 | **-0,156** | -0,54 | -11,9 | 0,82 | 9 | %18,4 | %90,6 | +0,030 (36) | -0,324 (40) |
| C · Connors RSI(2) + SMA 200 | 225 | 6,1 | 66,2 | +0,055 | **+0,023** | 0,64 | +5,2 | 1,11 | 4 | %6,6 | %8,3 | -0,038 (96) | +0,069 (129) |
| D · Ay dönümü (TOM) | 440 | 12,0 | 53,0 | +0,040 | **+0,005** | 0,19 | +2,4 | 1,02 | 6 | %11,6 | %19,1 | +0,044 (220) | -0,033 (220) |
| E1 · SAR + EMA 200 + MACD (mevcut) | 151 | 4,1 | 39,7 | +0,192 | **+0,079** | 0,67 | +11,9 | 1,12 | 6 | %16,1 | %17,8 | +0,264 (81) | -0,135 (70) |
| E2 · SRA (mevcut) | 344 | 9,4 | 31,1 | -0,067 | **-0,148** | -1,99 | -50,8 | 0,80 | 14 | %43,2 | %35,4 | -0,119 (175) | -0,178 (169) |
| F · Al ve tut | — | — | — | — | — | — | — | — | — | %81,3 (fiyat) | %100 | yıllık %1,6, toplam %76 (maliyetler hariç, temettü hariç) | |

Pencere: 1990-01-23 – 2026-09-28. İsabet ve PF net R'ye göre.

## S&P 500 (^GSPC)

| Aday | İşlem | Yılda | İsabet % | Ort. R (maliyetler hariç) | **Ort. net R** | t | Toplam net R | PF | En uzun kayıp serisi | En büyük düşüş %1 risk | Piyasada % | 1. yarı net R (n) | 2. yarı net R (n) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A · Donchian 55/20 | 233 | 4,3 | 27,0 | +0,168 | **-0,146** | -1,17 | -33,9 | 0,79 | 11 | %35,1 | %55,4 | +0,022 (109) | -0,293 (124) |
| B · TSMOM 12 ay | 61 | 1,1 | 29,5 | +2,278 | **+1,011** | 0,89 | +61,7 | 2,36 | 6 | %9,1 | %91,2 | +1,621 (38) | +0,004 (23) |
| C · Connors RSI(2) + SMA 200 | 465 | 8,7 | 71,4 | +0,110 | **+0,079** | 3,71 | +36,8 | 1,56 | 6 | %5,6 | %11,4 | +0,062 (254) | +0,099 (211) |
| D · Ay dönümü (TOM) | 644 | 12,0 | 55,3 | +0,086 | **+0,051** | 2,55 | +32,8 | 1,29 | 7 | %6,0 | %18,9 | +0,078 (322) | +0,023 (322) |
| E1 · SAR + EMA 200 + MACD (mevcut) | 218 | 4,1 | 38,1 | +0,142 | **-0,028** | -0,29 | -6,1 | 0,96 | 11 | %17,3 | %21,1 | -0,005 (112) | -0,053 (106) |
| E2 · SRA (mevcut) | 531 | 9,9 | 33,0 | -0,011 | **-0,095** | -1,56 | -50,3 | 0,87 | 11 | %46,7 | %36,3 | -0,049 (240) | -0,132 (291) |
| F · Al ve tut | — | — | — | — | — | — | — | — | — | %56,8 (fiyat) | %100 | yıllık %8,1, toplam %6377 (maliyetler hariç, temettü hariç) | |

Pencere: 1973-01-15 – 2026-09-29. İsabet ve PF net R'ye göre.

## Nasdaq 100 (^NDX)

| Aday | İşlem | Yılda | İsabet % | Ort. R (maliyetler hariç) | **Ort. net R** | t | Toplam net R | PF | En uzun kayıp serisi | En büyük düşüş %1 risk | Piyasada % | 1. yarı net R (n) | 2. yarı net R (n) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A · Donchian 55/20 | 177 | 4,4 | 31,1 | +0,362 | **+0,115** | 0,75 | +20,4 | 1,18 | 13 | %16,5 | %58,2 | +0,206 (93) | +0,015 (84) |
| B · TSMOM 12 ay | 40 | 1,0 | 32,5 | +4,501 | **+3,402** | 1,12 | +136,1 | 5,66 | 9 | %10,4 | %86,3 | +4,337 (26) | +1,667 (14) |
| C · Connors RSI(2) + SMA 200 | 355 | 8,9 | 69,0 | +0,104 | **+0,082** | 3,23 | +29,2 | 1,54 | 5 | %5,5 | %11,7 | +0,068 (178) | +0,097 (177) |
| D · Ay dönümü (TOM) | 479 | 12,0 | 57,0 | +0,098 | **+0,073** | 3,06 | +35,1 | 1,41 | 7 | %4,3 | %18,9 | +0,112 (240) | +0,034 (239) |
| E1 · SAR + EMA 200 + MACD (mevcut) | 186 | 4,7 | 43,0 | +0,290 | **+0,185** | 1,73 | +34,4 | 1,30 | 9 | %13,0 | %19,9 | +0,143 (103) | +0,238 (83) |
| E2 · SRA (mevcut) | 426 | 10,7 | 30,8 | -0,077 | **-0,132** | -1,98 | -56,2 | 0,82 | 15 | %48,1 | %35,4 | -0,057 (203) | -0,200 (223) |
| F · Al ve tut | — | — | — | — | — | — | — | — | — | %82,9 (fiyat) | %100 | yıllık %14,4, toplam %21591 (maliyetler hariç, temettü hariç) | |

Pencere: 1986-10-10 – 2026-09-29. İsabet ve PF net R'ye göre.

## Maliyet duyarlılığı (ort. R/işlem, tüm dönem)

| Aday | Enstrüman | Maliyetler hariç | Yalnız spread + kayma | Swap: puan/gece | Swap: yıllık % | Temkinli (karar) |
|---|---|---|---|---|---|---|
| A | Japan 225 (^N225) | +0,365 | +0,352 | +0,229 | +0,130 | +0,130 |
| B | Japan 225 (^N225) | +0,366 | +0,357 | +0,073 | -0,156 | -0,156 |
| C | Japan 225 (^N225) | +0,055 | +0,045 | +0,033 | +0,023 | +0,023 |
| D | Japan 225 (^N225) | +0,040 | +0,031 | +0,017 | +0,005 | +0,005 |
| E1 | Japan 225 (^N225) | +0,192 | +0,175 | +0,122 | +0,079 | +0,079 |
| E2 | Japan 225 (^N225) | -0,067 | -0,084 | -0,119 | -0,148 | -0,148 |
| A | S&P 500 (^GSPC) | +0,168 | +0,162 | — | -0,146 | -0,146 |
| B | S&P 500 (^GSPC) | +2,278 | +2,275 | — | +1,011 | +1,011 |
| C | S&P 500 (^GSPC) | +0,110 | +0,106 | — | +0,079 | +0,079 |
| D | S&P 500 (^GSPC) | +0,086 | +0,082 | — | +0,051 | +0,051 |
| E1 | S&P 500 (^GSPC) | +0,142 | +0,135 | — | -0,028 | -0,028 |
| E2 | S&P 500 (^GSPC) | -0,011 | -0,020 | — | -0,095 | -0,095 |
| A | Nasdaq 100 (^NDX) | +0,362 | +0,359 | — | +0,115 | +0,115 |
| B | Nasdaq 100 (^NDX) | +4,501 | +4,499 | — | +3,402 | +3,402 |
| C | Nasdaq 100 (^NDX) | +0,104 | +0,102 | — | +0,082 | +0,082 |
| D | Nasdaq 100 (^NDX) | +0,098 | +0,096 | — | +0,073 | +0,073 |
| E1 | Nasdaq 100 (^NDX) | +0,290 | +0,286 | — | +0,185 | +0,185 |
| E2 | Nasdaq 100 (^NDX) | -0,077 | -0,082 | — | -0,132 | -0,132 |

## Parametre duyarlılığı (seçimde kullanılmadı)

| Aday | Enstrüman | Taban net R | Değişken | Net R (n) |
|---|---|---|---|---|
| A | Japan 225 (^N225) | +0,130 | 40/15 | +0,027 (204) |
| A | Japan 225 (^N225) | +0,130 | 70/25 | +0,155 (137) |
| B | Japan 225 (^N225) | -0,156 | 189 gün | -0,139 (90) |
| B | Japan 225 (^N225) | -0,156 | 315 gün | -0,102 (67) |
| C | Japan 225 (^N225) | +0,023 | eşik 5 | +0,006 (108) |
| C | Japan 225 (^N225) | +0,023 | eşik 15 | +0,006 (328) |
| D | Japan 225 (^N225) | +0,005 | çıkış 2. gün | +0,012 (440) |
| D | Japan 225 (^N225) | +0,005 | çıkış 4. gün | -0,008 (440) |
| E1 | Japan 225 (^N225) | +0,079 | stop 1,125 ATR | +0,161 (164) |
| E1 | Japan 225 (^N225) | +0,079 | stop 1,875 ATR | -0,033 (143) |
| E2 | Japan 225 (^N225) | -0,148 | stop 1,125 ATR | -0,107 (407) |
| E2 | Japan 225 (^N225) | -0,148 | stop 1,875 ATR | -0,144 (289) |
| A | S&P 500 (^GSPC) | -0,146 | 40/15 | -0,224 (308) |
| A | S&P 500 (^GSPC) | -0,146 | 70/25 | -0,114 (182) |
| B | S&P 500 (^GSPC) | +1,011 | 189 gün | +1,192 (65) |
| B | S&P 500 (^GSPC) | +1,011 | 315 gün | +0,662 (69) |
| C | S&P 500 (^GSPC) | +0,079 | eşik 5 | +0,141 (240) |
| C | S&P 500 (^GSPC) | +0,079 | eşik 15 | +0,050 (644) |
| D | S&P 500 (^GSPC) | +0,051 | çıkış 2. gün | +0,039 (644) |
| D | S&P 500 (^GSPC) | +0,051 | çıkış 4. gün | +0,050 (644) |
| E1 | S&P 500 (^GSPC) | -0,028 | stop 1,125 ATR | +0,008 (241) |
| E1 | S&P 500 (^GSPC) | -0,028 | stop 1,875 ATR | -0,023 (201) |
| E2 | S&P 500 (^GSPC) | -0,095 | stop 1,125 ATR | -0,095 (626) |
| E2 | S&P 500 (^GSPC) | -0,095 | stop 1,875 ATR | -0,193 (455) |
| A | Nasdaq 100 (^NDX) | +0,115 | 40/15 | +0,117 (215) |
| A | Nasdaq 100 (^NDX) | +0,115 | 70/25 | +0,223 (147) |
| B | Nasdaq 100 (^NDX) | +3,402 | 189 gün | +2,704 (67) |
| B | Nasdaq 100 (^NDX) | +3,402 | 315 gün | +5,396 (35) |
| C | Nasdaq 100 (^NDX) | +0,082 | eşik 5 | +0,073 (176) |
| C | Nasdaq 100 (^NDX) | +0,082 | eşik 15 | +0,080 (490) |
| D | Nasdaq 100 (^NDX) | +0,073 | çıkış 2. gün | +0,054 (479) |
| D | Nasdaq 100 (^NDX) | +0,073 | çıkış 4. gün | +0,080 (479) |
| E1 | Nasdaq 100 (^NDX) | +0,185 | stop 1,125 ATR | +0,189 (196) |
| E1 | Nasdaq 100 (^NDX) | +0,185 | stop 1,875 ATR | +0,206 (166) |
| E2 | Nasdaq 100 (^NDX) | -0,132 | stop 1,125 ATR | -0,034 (497) |
| E2 | Nasdaq 100 (^NDX) | -0,132 | stop 1,875 ATR | -0,135 (365) |

Geçen adaylarda, 1. ve 3. şartı sağlayan enstrümanlarda işaret değişirse "kırılgan".

- A: işaret değişmiyor
- B: işaret değişmiyor
- C: işaret değişmiyor
- D: işaret değişmiyor

## Sınırlar

- **Nakit endeks ≠ CFD.** Test Yahoo nakit endeks verisiyle; FxPro CFD fiyatı, seans saatleri ve kapanışı farklıdır. Japan 225 CFD neredeyse 24 saat işlem görür, nakit endeks değil.
- **Temettü yok.** Nakit endeks fiyat endeksidir; CFD'de temettü düzeltmesi ve finansman ayrı işler. Al ve tut getirisi temettü hariç.
- **Günlük mumda mum içi sıra bilinmez.** Stop mum içinde kontrol edilir; aynı mumda kural çıkışı da olursa stop sayılır (temkinli). Boşlukla açılışta açılış fiyatından çıkılır.
- **Maliyetler kısmen doğrulanmadı.** Japan 225 swap birimi ile S&P 500 swap ve Nasdaq 100 spread/swap değerleri varsayım (bkz. Maliyet varsayımları).
- **Takvim bilgisi.** Ay sonu ve ayın n. işlem günü verideki işlem günlerinden belirlenir; canlıda borsa tatil takvimi önceden bilinmelidir.
- **Düşük işlem sayısı.** Bazı adaylarda yılda birkaç işlem var; t-istatistiği ve yarı dönem sonuçları bu yüzden oynaktır.
- **Çoklu deneme.** 18 deneme yapıldı; en iyi görünen sonuçta şans payı büyüktür.
- **%1 risk düşüş hesabı** yalnız bu stratejinin işlemleriyle, pozisyon büyüklüğü her işlemde güncel bakiyenin %1'i kabulüyle yapıldı; kaldıraç ve teminat sınırı hesaba katılmadı.
