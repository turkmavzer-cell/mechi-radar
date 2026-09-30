# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5617 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17143 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4440 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4498 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13740 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3718 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4509 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13719 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4511 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13755 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3720 | var |

## EMA 21/55 geri çekilmesi

**Seçilen (ilk yarıya göre):** kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3

- İlk yarı: 304 işlem · net ort. +0,065 R
- **İkinci yarı (doğrulama): 327 işlem · net ort. +0,017 R · kazanan %27 · t 0,2**
- Tüm veri: 631 işlem · net +0,040 R (maliyetsiz +0,116 R) · PF 1,05 · ort. süre 28,1 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,071 · 40 · %11 | -0,052 · 34 · %10 | +0,321 · 29 · %11 | -0,182 · 32 · %12 |
| 1h | +0,100 · 117 · %15 | +0,019 · 92 · %16 | -0,079 · 102 · %23 | -0,155 · 89 · %16 |
| 4h | +0,427 · 27 · %4 | -0,004 · 22 · %6 | +0,399 · 27 · %5 | +0,339 · 20 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 304 | +0,065 | 327 | +0,017 | +0,116 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 305 | +0,048 | 327 | +0,017 | +0,108 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 305 | +0,048 | 327 | +0,017 | +0,108 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 306 | +0,045 | 327 | +0,017 | +0,106 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 417 | +0,043 | 431 | +0,068 | +0,132 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 307 | +0,040 | 331 | +0,049 | +0,117 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 426 | +0,036 | 448 | +0,074 | +0,126 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 423 | +0,034 | 434 | +0,069 | +0,130 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 515 | +0,033 | 536 | +0,069 | +0,130 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 478 | +0,032 | 514 | +0,049 | +0,117 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 437 | +0,027 | 453 | +0,075 | +0,124 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 426 | +0,026 | 429 | +0,081 | +0,132 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 308 | +0,025 | 331 | +0,049 | +0,109 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 308 | +0,025 | 331 | +0,049 | +0,109 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 427 | +0,024 | 429 | +0,081 | +0,131 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 309 | +0,022 | 331 | +0,049 | +0,108 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 440 | +0,020 | 448 | +0,086 | +0,126 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 441 | +0,018 | 448 | +0,086 | +0,125 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 501 | +0,015 | 545 | +0,049 | +0,103 |
| ESKİ KURAL: her geri çekilme · filtre yok · stop 2 ATR · 1:3 (seçilemez) | 920 | +0,009 | 939 | -0,011 | +0,076 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 540 | +0,006 | 538 | +0,005 | +0,083 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 572 | +0,004 | 587 | -0,001 | +0,075 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 551 | +0,003 | 583 | +0,031 | +0,090 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 532 | -0,001 | 540 | +0,074 | +0,116 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 308 | -0,002 | 332 | +0,028 | +0,083 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 566 | -0,012 | 591 | +0,021 | +0,078 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 573 | -0,013 | 588 | -0,015 | +0,057 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 309 | -0,016 | 332 | +0,028 | +0,076 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 309 | -0,016 | 332 | +0,028 | +0,076 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 426 | -0,016 | 449 | +0,090 | +0,107 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 310 | -0,019 | 332 | +0,028 | +0,075 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 501 | -0,020 | 546 | +0,040 | +0,080 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 552 | -0,022 | 584 | +0,034 | +0,077 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 438 | -0,027 | 454 | +0,097 | +0,107 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 567 | -0,029 | 595 | +0,023 | +0,069 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 441 | -0,033 | 450 | +0,113 | +0,111 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 442 | -0,036 | 450 | +0,113 | +0,110 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 597 | — | 617 | — | +0,040 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 443 | — | 457 | — | +0,086 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 310 | — | 333 | — | +0,068 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 584 | — | 617 | — | +0,043 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 442 | — | 457 | — | +0,087 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 309 | — | 333 | — | +0,070 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 565 | — | 600 | — | +0,043 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 439 | — | 457 | — | +0,092 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 309 | — | 333 | — | +0,070 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 503 | — | 553 | — | +0,080 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 427 | — | 451 | — | +0,103 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 308 | — | 333 | — | +0,078 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip → ilk yarı +0,138 R (119), ikinci yarı -0,000 R (131)
- 1h: kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 → ilk yarı +0,034 R (187), ikinci yarı -0,069 R (213)
- 4h: kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 → ilk yarı +0,491 R (51), ikinci yarı +0,088 R (45)

## Bollinger + Stokastik

**Seçilen (ilk yarıya göre):** dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant

- İlk yarı: 1370 işlem · net ort. -0,037 R
- **İkinci yarı (doğrulama): 1373 işlem · net ort. -0,007 R · kazanan %39 · t -0,2**
- Tüm veri: 2743 işlem · net -0,022 R (maliyetsiz +0,053 R) · PF 0,97 · ort. süre 12,5 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,093 · 149 · %25 | +0,241 · 129 · %16 | +0,056 · 111 · %16 | -0,068 · 142 · %19 |
| 1h | -0,131 · 510 · %52 | +0,016 · 413 · %33 | +0,014 · 370 · %24 | -0,087 · 418 · %35 |
| 4h | +0,124 · 138 · %16 | +0,000 · 129 · %10 | +0,041 · 110 · %10 | -0,040 · 124 · %16 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant | 1370 | -0,037 | 1373 | -0,007 | +0,053 |
| dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant | 1260 | -0,037 | 1273 | -0,022 | +0,030 |
| bant filtresi yok · stop 2 ATR · 1:2 (seçilemez) | 1547 | -0,047 | 1669 | +0,017 | +0,054 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1 | 1273 | -0,051 | 1309 | -0,032 | +0,015 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1 | 1413 | -0,057 | 1445 | -0,023 | +0,029 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1.5 | 1160 | -0,061 | 1238 | -0,039 | +0,011 |
| bant filtresi yok · stop 2 ATR · hedef karşı bant (seçilemez) | 2774 | -0,063 | 2731 | -0,059 | -0,000 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1.5 | 1364 | -0,064 | 1404 | -0,029 | +0,027 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1 | 1688 | -0,065 | 1782 | -0,049 | +0,001 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:2 | 1293 | -0,066 | 1358 | -0,022 | +0,033 |
| dar bant < 0.8 × ort. · stop 2 ATR · hedef karşı bant | 1712 | -0,067 | 1716 | -0,045 | +0,004 |
| bant filtresi yok · stop 2 ATR · 1:1 (seçilemez) | 2443 | -0,072 | 2570 | -0,052 | -0,003 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:2 | 1215 | -0,073 | 1369 | -0,010 | +0,027 |
| bant filtresi yok · stop 1.5 ATR · 1:1 (seçilemez) | 3250 | -0,073 | 3295 | -0,075 | +0,000 |
| dar bant < 1 × ort. · stop 2 ATR · 1:2 | 1027 | -0,074 | 1111 | +0,020 | +0,041 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 | 1950 | -0,075 | 2025 | -0,057 | +0,005 |
| bant filtresi yok · stop 2 ATR · 1:1.5 (seçilemez) | 1900 | -0,079 | 2047 | -0,038 | +0,005 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1.5 | 1836 | -0,082 | 1933 | -0,059 | +0,005 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · hedef karşı bant | 1893 | -0,083 | 1894 | -0,045 | +0,012 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 | 1449 | -0,085 | 1601 | -0,054 | -0,007 |
| bant filtresi yok · stop 1.5 ATR · 1:1.5 (seçilemez) | 2742 | -0,086 | 2870 | -0,061 | +0,004 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:2 | 1688 | -0,087 | 1809 | -0,063 | +0,004 |
| bant filtresi yok · stop 1.5 ATR · hedef karşı bant (seçilemez) | 3167 | -0,087 | 3116 | -0,066 | +0,002 |
| bant filtresi yok · stop 1.5 ATR · 1:2 (seçilemez) | 2307 | -0,089 | 2467 | -0,057 | +0,007 |
| dar bant < 1 × ort. · stop 1 ATR · hedef karşı bant | 1513 | -0,101 | 1487 | -0,049 | +0,032 |
| dar bant < 1 × ort. · stop 1 ATR · 1:2 | 1526 | -0,124 | 1525 | -0,055 | +0,013 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1.5 | 1538 | -0,127 | 1545 | -0,067 | +0,002 |
| bant filtresi yok · stop 1 ATR · 1:1.5 (seçilemez) | 3812 | -0,132 | 3824 | -0,111 | -0,013 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1 | 1566 | -0,137 | 1561 | -0,103 | -0,025 |
| dar bant < 0.8 × ort. · stop 1 ATR · hedef karşı bant | 2119 | -0,141 | 2094 | -0,079 | -0,001 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1.5 | 2158 | -0,145 | 2206 | -0,083 | -0,012 |
| bant filtresi yok · stop 1 ATR · hedef karşı bant (seçilemez) | 3713 | -0,146 | 3638 | -0,098 | -0,010 |
| bant filtresi yok · stop 1 ATR · 1:2 (seçilemez) | 3517 | -0,147 | 3570 | -0,092 | -0,009 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:2 | 2120 | -0,147 | 2155 | -0,068 | -0,002 |
| bant filtresi yok · stop 1 ATR · 1:1 (seçilemez) | 4072 | -0,155 | 4055 | -0,131 | -0,037 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1 | 2217 | -0,156 | 2235 | -0,104 | -0,031 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 → ilk yarı +0,006 R (292), ikinci yarı +0,008 R (302)
- 1h: dar bant < 1 × ort. · stop 2 ATR · 1:1 → ilk yarı -0,029 R (789), ikinci yarı -0,078 R (809)
- 4h: dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 → ilk yarı -0,048 R (335), ikinci yarı +0,000 R (365)

## Heikin Ashi Smoothed

**Seçilen (ilk yarıya göre):** stop 2 ATR · 1:2 + takip

- İlk yarı: 1091 işlem · net ort. +0,023 R
- **İkinci yarı (doğrulama): 1190 işlem · net ort. +0,007 R · kazanan %34 · t 0,2**
- Tüm veri: 2281 işlem · net +0,015 R (maliyetsiz +0,085 R) · PF 1,02 · ort. süre 24,9 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,109 · 116 · %14 | -0,156 · 136 · %23 | +0,023 · 109 · %18 | +0,076 · 107 · %8 |
| 1h | +0,001 · 401 · %31 | +0,020 · 359 · %23 | +0,016 · 349 · %28 | +0,014 · 294 · %18 |
| 4h | +0,217 · 117 · %16 | -0,038 · 105 · %16 | -0,132 · 110 · %17 | +0,099 · 78 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 2 ATR · 1:2 + takip | 1091 | +0,023 | 1190 | +0,007 | +0,085 |
| stop 2 ATR · renk dönünce çıkış | 2273 | +0,014 | 2249 | +0,007 | +0,080 |
| stop 3 ATR · renk dönünce çıkış | 2273 | +0,010 | 2248 | +0,003 | +0,054 |
| stop 2 ATR · 1:2 | 1116 | -0,004 | 1203 | -0,036 | +0,048 |
| stop 1.5 ATR · renk dönünce çıkış | 2273 | -0,005 | 2250 | +0,025 | +0,100 |
| stop 1 ATR · renk dönünce çıkış | 2273 | -0,006 | 2251 | +0,042 | +0,147 |
| stop 2 ATR · 1:1.5 | 1295 | -0,011 | 1352 | -0,011 | +0,053 |
| stop 2 ATR · 1:1 | 1523 | -0,026 | 1571 | -0,060 | +0,017 |
| stop 2 ATR · 1:3 | 863 | -0,038 | 922 | -0,111 | +0,004 |
| stop 3 ATR · 1:3 | 451 | -0,049 | 447 | -0,173 | -0,033 |
| stop 3 ATR · 1:1 | 963 | -0,057 | 1022 | -0,043 | -0,003 |
| stop 1 ATR · 1:2 + takip | 2030 | -0,059 | 2044 | +0,047 | +0,110 |
| stop 3 ATR · 1:2 + takip | 582 | -0,081 | 643 | -0,078 | -0,016 |
| stop 1.5 ATR · 1:2 + takip | 1554 | -0,082 | 1588 | +0,074 | +0,081 |
| stop 3 ATR · 1:2 | 615 | -0,083 | 651 | -0,107 | -0,033 |
| stop 1.5 ATR · 1:1.5 | 1728 | -0,094 | 1762 | -0,019 | +0,022 |
| stop 1.5 ATR · 1:1 | 1899 | -0,095 | 1927 | -0,057 | -0,001 |
| stop 1 ATR · 1:2 | 2044 | -0,098 | 2066 | -0,036 | +0,045 |
| stop 3 ATR · 1:1.5 | 740 | -0,100 | 804 | -0,049 | -0,019 |
| stop 1.5 ATR · 1:2 | 1580 | -0,111 | 1614 | +0,017 | +0,035 |
| stop 1.5 ATR · 1:3 | 1343 | -0,120 | 1337 | -0,006 | +0,027 |
| stop 1 ATR · 1:3 | 1883 | -0,120 | 1898 | +0,003 | +0,058 |
| stop 1 ATR · 1:1 | 2183 | -0,121 | 2161 | -0,092 | +0,000 |
| stop 1 ATR · 1:1.5 | 2115 | -0,121 | 2126 | -0,054 | +0,022 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1 ATR · renk dönünce çıkış → ilk yarı +0,088 R (480), ikinci yarı +0,020 R (461)
- 1h: stop 2 ATR · 1:2 + takip → ilk yarı +0,015 R (666), ikinci yarı +0,010 R (737)
- 4h: stop 2 ATR · 1:2 → ilk yarı +0,142 R (194), ikinci yarı -0,055 R (225)

## Heikin Ashi Smoothed + ADX

**Seçilen (ilk yarıya göre):** ADX ≥ 30 · stop 2 ATR · 1:2 + takip

- İlk yarı: 282 işlem · net ort. +0,092 R
- **İkinci yarı (doğrulama): 281 işlem · net ort. -0,061 R · kazanan %33 · t -0,7**
- Tüm veri: 563 işlem · net +0,016 R (maliyetsiz +0,080 R) · PF 1,02 · ort. süre 31,7 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,207 · 31 · %8 | +0,270 · 14 · %3 | -0,068 · 26 · %6 | -0,184 · 27 · %8 |
| 1h | +0,054 · 93 · %10 | -0,087 · 71 · %14 | -0,024 · 101 · %10 | +0,148 · 102 · %11 |
| 4h | +0,304 · 25 · %7 | -0,166 · 21 · %7 | -0,007 · 26 · %5 | +0,108 · 26 · %10 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| ADX ≥ 30 · stop 2 ATR · 1:2 + takip | 282 | +0,092 | 281 | -0,061 | +0,080 |
| ADX ≥ 25 · stop 2 ATR · 1:2 + takip | 495 | +0,045 | 525 | -0,058 | +0,059 |
| ADX ≥ 20 · stop 2 ATR · renk dönünce çıkış | 1171 | +0,023 | 1177 | -0,004 | +0,073 |
| ADX ≥ 25 · stop 2 ATR · renk dönünce çıkış | 685 | +0,021 | 675 | -0,018 | +0,063 |
| ADX ≥ 30 · stop 2 ATR · renk dönünce çıkış | 394 | +0,004 | 337 | -0,085 | +0,018 |
| ADX ≥ 20 · stop 1.5 ATR · renk dönünce çıkış | 1171 | -0,010 | 1177 | +0,016 | +0,086 |
| ADX ≥ 20 · stop 2 ATR · 1:2 + takip | 745 | -0,021 | 823 | -0,031 | +0,042 |
| ADX ≥ 25 · stop 1.5 ATR · renk dönünce çıkış | 685 | -0,029 | 675 | +0,029 | +0,078 |
| ADX ≥ 30 · stop 1.5 ATR · 1:2 + takip | 301 | -0,032 | 304 | -0,033 | +0,040 |
| ADX ≥ 30 · stop 1.5 ATR · renk dönünce çıkış | 394 | -0,071 | 337 | -0,038 | +0,013 |
| ADX ≥ 20 · stop 1.5 ATR · 1:2 + takip | 905 | -0,080 | 978 | +0,026 | +0,055 |
| ADX ≥ 25 · stop 1.5 ATR · 1:2 + takip | 542 | -0,088 | 587 | +0,030 | +0,049 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: ADX ≥ 20 · stop 1.5 ATR · renk dönünce çıkış → ilk yarı +0,392 R (231), ikinci yarı +0,013 R (200)
- 1h: ADX ≥ 30 · stop 2 ATR · 1:2 + takip → ilk yarı +0,020 R (171), ikinci yarı +0,041 R (196)
- 4h: ADX ≥ 30 · stop 2 ATR · 1:2 + takip → ilk yarı +0,404 R (56), ikinci yarı -0,378 R (42)

## Üçgen formasyonları

**Seçilen (ilk yarıya göre):** stop 1.5 ATR · hedef formasyon yüksekliği

- İlk yarı: 364 işlem · net ort. -0,018 R
- **İkinci yarı (doğrulama): 342 işlem · net ort. -0,129 R · kazanan %20 · t -1,1**
- Tüm veri: 706 işlem · net -0,072 R (maliyetsiz +0,032 R) · PF 0,92 · ort. süre 26,7 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,117 · 45 · %17 | -0,890 · 34 · %26 | -0,402 · 31 · %17 | -0,457 · 38 · %22 |
| 1h | +0,045 · 139 · %21 | -0,008 · 101 · %15 | +0,092 · 93 · %17 | +0,098 · 106 · %16 |
| 4h | -0,115 · 28 · %15 | -0,138 · 39 · %12 | -0,303 · 23 · %16 | +0,204 · 29 · %8 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 1.5 ATR · hedef formasyon yüksekliği | 364 | -0,018 | 342 | -0,129 | +0,032 |
| stop 1.5 ATR · 1:3 | 386 | -0,024 | 381 | -0,127 | +0,012 |
| stop 2 ATR · 1:2 | 358 | -0,043 | 349 | -0,032 | +0,031 |
| stop 2 ATR · 1:2 + takip | 356 | -0,052 | 349 | -0,055 | +0,017 |
| stop 1.5 ATR · 1:2 + takip | 402 | -0,059 | 388 | -0,019 | +0,044 |
| stop 2 ATR · 1:1.5 | 372 | -0,062 | 358 | +0,029 | +0,048 |
| stop 1 ATR · 1:3 | 450 | -0,075 | 426 | -0,033 | +0,059 |
| stop 1 ATR · hedef formasyon yüksekliği | 415 | -0,080 | 389 | +0,014 | +0,103 |
| stop 1.5 ATR · 1:2 | 403 | -0,081 | 388 | -0,031 | +0,024 |
| stop 2 ATR · hedef formasyon yüksekliği | 326 | -0,083 | 306 | -0,164 | -0,036 |
| stop 1.5 ATR · 1:1.5 | 410 | -0,090 | 398 | -0,054 | +0,006 |
| stop 1 ATR · 1:2 + takip | 456 | -0,097 | 434 | -0,009 | +0,060 |
| stop 2 ATR · 1:3 | 329 | -0,113 | 328 | -0,050 | -0,002 |
| stop 1 ATR · 1:1.5 | 462 | -0,129 | 440 | -0,053 | +0,017 |
| stop 1 ATR · 1:2 | 457 | -0,131 | 435 | -0,030 | +0,029 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1.5 ATR · 1:1.5 → ilk yarı -0,152 R (83), ikinci yarı -0,185 R (76)
- 1h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,109 R (236), ikinci yarı -0,006 R (203)
- 4h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,280 R (52), ikinci yarı -0,361 R (67)

## EMA 20/50 + hacim + Heikin Ashi

**Seçilen (ilk yarıya göre):** RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR

- İlk yarı: 1445 işlem · net ort. +0,013 R
- **İkinci yarı (doğrulama): 1524 işlem · net ort. -0,044 R · kazanan %25 · t -1,1**
- Tüm veri: 2969 işlem · net -0,016 R (maliyetsiz +0,069 R) · PF 0,96 · ort. süre 9,2 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,019 · 284 · %32 | -0,090 · 103 · %17 | +0,113 · 87 · %15 | -0,047 · 111 · %16 |
| 1h | -0,012 · 793 · %39 | -0,182 · 415 · %59 | -0,056 · 313 · %33 | +0,107 · 315 · %13 |
| 4h | +0,048 · 187 · %19 | -0,003 · 119 · %16 | +0,074 · 124 · %12 | +0,115 · 118 · %10 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1445 | +0,013 | 1524 | -0,044 | +0,069 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1440 | +0,011 | 1517 | -0,042 | +0,048 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1434 | +0,003 | 1506 | -0,027 | +0,031 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1790 | -0,002 | 1810 | -0,051 | +0,056 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1785 | -0,002 | 1803 | -0,046 | +0,038 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1779 | -0,005 | 1792 | -0,030 | +0,024 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 3 ATR | 1703 | -0,010 | 1814 | -0,046 | +0,011 |
| RSI yok · çıkış EMA 20 teması · acil stop 3 ATR | 2060 | -0,015 | 2106 | -0,046 | +0,008 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 2 ATR | 1703 | -0,019 | 1814 | -0,068 | +0,015 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 1.5 ATR | 1703 | -0,023 | 1813 | -0,089 | +0,022 |
| RSI yok · çıkış EMA 20 teması · acil stop 2 ATR | 2060 | -0,026 | 2106 | -0,068 | +0,011 |
| RSI yok · çıkış EMA 20 teması · acil stop 1.5 ATR | 2060 | -0,032 | 2105 | -0,089 | +0,017 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR → ilk yarı -0,036 R (289), ikinci yarı -0,003 R (294)
- 1h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR → ilk yarı -0,003 R (888), ikinci yarı -0,054 R (939)
- 4h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR → ilk yarı +0,164 R (264), ikinci yarı -0,042 R (284)
