# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5622 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17132 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4438 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4503 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13719 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3713 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4514 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13689 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3705 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4516 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13728 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3715 | var |

## EMA 5/8/13 + MACD

**Seçilen (ilk yarıya göre):** stop önceki dip (iki yanda 5 mum) · EMA 5, 13'ü kesince çıkış

- İlk yarı: 1446 işlem · net ort. +0,019 R
- **İkinci yarı (doğrulama): 1378 işlem · net ort. -0,019 R · kazanan %31 · t -0,7**
- Tüm veri: 2824 işlem · net +0,000 R (maliyetsiz +0,046 R) · PF 1,00 · ort. süre 16,8 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,032 · 198 · %15 | -0,142 · 161 · %23 | -0,055 · 146 · %17 | +0,034 · 126 · %10 |
| 1h | +0,055 · 488 · %13 | -0,075 · 457 · %36 | -0,052 · 377 · %24 | +0,137 · 392 · %11 |
| 4h | -0,031 · 134 · %16 | -0,077 · 128 · %11 | -0,024 · 107 · %10 | +0,095 · 110 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop önceki dip (iki yanda 5 mum) · 1:2 + takip (karşılaştırma) (seçilemez) | 297 | +0,100 | 341 | -0,060 | +0,080 |
| stop önceki dip (iki yanda 5 mum) · sabit 1:2 (karşılaştırma) (seçilemez) | 299 | +0,057 | 343 | -0,048 | +0,065 |
| stop önceki dip (iki yanda 3 mum) · 1:2 + takip (karşılaştırma) (seçilemez) | 359 | +0,043 | 399 | -0,044 | +0,065 |
| stop önceki dip (iki yanda 3 mum) · sabit 1:2 (karşılaştırma) (seçilemez) | 368 | +0,028 | 400 | -0,108 | +0,023 |
| stop önceki dip (iki yanda 5 mum) · EMA 5, 13'ü kesince çıkış | 1446 | +0,019 | 1378 | -0,019 | +0,046 |
| stop önceki dip (iki yanda 3 mum) · EMA 5, 13'ü kesince çıkış | 1434 | +0,008 | 1366 | -0,026 | +0,042 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop önceki dip (iki yanda 5 mum) · EMA 5, 13'ü kesince çıkış → ilk yarı +0,033 R (332), ikinci yarı -0,105 R (299)
- 1h: stop önceki dip (iki yanda 5 mum) · EMA 5, 13'ü kesince çıkış → ilk yarı +0,019 R (872), ikinci yarı +0,013 R (842)
- 4h: stop önceki dip (iki yanda 5 mum) · EMA 5, 13'ü kesince çıkış → ilk yarı -0,003 R (242), ikinci yarı -0,023 R (237)

## EMA 21/55 (2. anlatım)

**Seçilen (ilk yarıya göre):** seviye kesişim öncesi 10 mum · kesişimden 6 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış

- İlk yarı: 261 işlem · net ort. -0,027 R
- **İkinci yarı (doğrulama): 275 işlem · net ort. -0,055 R · kazanan %34 · t -0,8**
- Tüm veri: 536 işlem · net -0,041 R (maliyetsiz +0,013 R) · PF 0,89 · ort. süre 15,6 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,285 · 41 · %13 | -0,216 · 32 · %7 | +0,277 · 29 · %2 | -0,060 · 23 · %3 |
| 1h | +0,029 · 106 · %10 | -0,029 · 68 · %9 | -0,165 · 71 · %15 | +0,041 · 76 · %9 |
| 4h | -0,224 · 23 · %7 | -0,192 · 26 · %8 | -0,057 · 22 · %4 | +0,458 · 19 · %2 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| seviye kesişim öncesi 10 mum · kesişimden 6 mum sonra EMA 55'e değerse iptal · sabit 1:2 (karşılaştırma) (seçilemez) | 229 | +0,150 | 233 | +0,035 | +0,156 |
| seviye kesişim öncesi 5 mum · kesişimden 6 mum sonra EMA 55'e değerse iptal · sabit 1:2 (karşılaştırma) (seçilemez) | 234 | +0,149 | 248 | +0,003 | +0,139 |
| seviye kesişim öncesi 10 mum · kesişimden 3 mum sonra EMA 55'e değerse iptal · sabit 1:2 (karşılaştırma) (seçilemez) | 194 | +0,141 | 196 | -0,044 | +0,108 |
| seviye kesişim öncesi 5 mum · kesişimden 3 mum sonra EMA 55'e değerse iptal · sabit 1:2 (karşılaştırma) (seçilemez) | 199 | +0,141 | 213 | -0,085 | +0,085 |
| seviye kesişim öncesi 5 mum · kesişimden 0 mum sonra EMA 55'e değerse iptal · sabit 1:2 (karşılaştırma) (seçilemez) | 160 | +0,061 | 175 | -0,146 | +0,012 |
| seviye kesişim öncesi 10 mum · kesişimden 0 mum sonra EMA 55'e değerse iptal · sabit 1:2 (karşılaştırma) (seçilemez) | 158 | +0,057 | 160 | -0,114 | +0,028 |
| seviye kesişim öncesi 10 mum · kesişimden 6 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış | 261 | -0,027 | 275 | -0,055 | +0,013 |
| seviye kesişim öncesi 10 mum · kesişimden 3 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış | 213 | -0,027 | 222 | -0,109 | -0,021 |
| seviye kesişim öncesi 10 mum · kesişimden 0 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış | 169 | -0,031 | 175 | -0,148 | -0,045 |
| seviye kesişim öncesi 5 mum · kesişimden 6 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış | 267 | -0,032 | 285 | -0,063 | +0,008 |
| seviye kesişim öncesi 5 mum · kesişimden 0 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış | 172 | -0,033 | 185 | -0,143 | -0,043 |
| seviye kesişim öncesi 5 mum · kesişimden 3 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış | 219 | -0,035 | 234 | -0,113 | -0,025 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: seviye kesişim öncesi 10 mum · kesişimden 3 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış → ilk yarı -0,140 R (47), ikinci yarı -0,023 R (49)
- 1h: seviye kesişim öncesi 5 mum · kesişimden 0 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış → ilk yarı +0,040 R (103), ikinci yarı -0,128 R (121)
- 4h: seviye kesişim öncesi 5 mum · kesişimden 3 mum sonra EMA 55'e değerse iptal · EMA 21 içinde kapanışta çıkış → ilk yarı +0,125 R (40), ikinci yarı -0,242 R (39)
