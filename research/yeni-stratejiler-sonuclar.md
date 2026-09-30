# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5617 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17131 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4438 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4498 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13718 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3713 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4509 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13688 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3705 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4511 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13727 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3715 | var |

## EMA 21/55 geri çekilmesi

**Seçilen (ilk yarıya göre):** kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3

- İlk yarı: 314 işlem · net ort. +0,054 R
- **İkinci yarı (doğrulama): 330 işlem · net ort. +0,030 R · kazanan %28 · t 0,3**
- Tüm veri: 644 işlem · net +0,042 R (maliyetsiz +0,118 R) · PF 1,05 · ort. süre 28,0 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,071 · 40 · %11 | -0,052 · 34 · %10 | +0,321 · 29 · %11 | -0,182 · 32 · %12 |
| 1h | +0,110 · 116 · %15 | +0,030 · 91 · %16 | -0,031 · 101 · %20 | -0,168 · 99 · %20 |
| 4h | +0,427 · 27 · %4 | -0,050 · 23 · %6 | +0,398 · 27 · %5 | +0,222 · 25 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 314 | +0,054 | 330 | +0,030 | +0,118 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 439 | +0,049 | 432 | +0,055 | +0,130 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 439 | +0,049 | 432 | +0,055 | +0,130 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 429 | +0,049 | 429 | +0,054 | +0,128 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 317 | +0,048 | 334 | +0,075 | +0,134 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 | 440 | +0,046 | 432 | +0,055 | +0,128 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 438 | +0,044 | 450 | +0,006 | +0,093 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 436 | +0,040 | 446 | +0,076 | +0,129 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 315 | +0,038 | 330 | +0,030 | +0,110 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 315 | +0,038 | 330 | +0,030 | +0,110 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 446 | +0,038 | 451 | +0,080 | +0,131 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 446 | +0,038 | 451 | +0,080 | +0,131 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 449 | +0,035 | 456 | +0,009 | +0,092 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 | 316 | +0,035 | 330 | +0,030 | +0,108 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 318 | +0,033 | 334 | +0,075 | +0,127 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 318 | +0,033 | 334 | +0,075 | +0,127 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 449 | +0,033 | 456 | +0,009 | +0,091 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 492 | +0,033 | 511 | +0,038 | +0,113 |
| ESKİ KURAL: her geri çekilme · filtre yok · stop 2 ATR · 1:3 (seçilemez) | 922 | +0,032 | 948 | -0,004 | +0,091 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 534 | +0,032 | 534 | +0,057 | +0,124 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 450 | +0,031 | 456 | +0,009 | +0,089 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 + takip | 447 | +0,030 | 451 | +0,080 | +0,128 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 + takip | 319 | +0,030 | 334 | +0,075 | +0,125 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 541 | +0,017 | 544 | +0,051 | +0,113 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 512 | +0,016 | 541 | +0,032 | +0,095 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 516 | +0,013 | 549 | +0,001 | +0,076 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 579 | +0,007 | 584 | -0,007 | +0,073 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 564 | +0,004 | 581 | +0,010 | +0,080 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 | 545 | +0,002 | 531 | +0,017 | +0,089 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 318 | +0,002 | 335 | +0,062 | +0,103 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip | 573 | +0,002 | 596 | -0,006 | +0,071 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 580 | -0,005 | 585 | +0,000 | +0,069 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 318 | -0,007 | 334 | +0,014 | +0,072 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 574 | -0,011 | 597 | +0,020 | +0,076 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 319 | -0,011 | 335 | +0,062 | +0,096 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 319 | -0,011 | 335 | +0,062 | +0,096 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 512 | -0,013 | 542 | +0,042 | +0,084 |
| kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 436 | -0,013 | 447 | +0,095 | +0,111 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:2 | 320 | -0,014 | 335 | +0,062 | +0,095 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 | 565 | -0,015 | 582 | +0,032 | +0,080 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 602 | -0,018 | 613 | -0,031 | +0,047 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 446 | -0,018 | 452 | +0,101 | +0,112 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 446 | -0,018 | 452 | +0,101 | +0,112 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 319 | -0,023 | 334 | +0,014 | +0,064 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 319 | -0,023 | 334 | +0,014 | +0,064 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 320 | -0,026 | 334 | +0,014 | +0,063 |
| kesişim başına 1 · kopuş 0 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:2 | 447 | -0,027 | 452 | +0,101 | +0,108 |
| kesişim başına 1 · kopuş 0.25 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 591 | -0,033 | 614 | -0,012 | +0,049 |
| kesişim başına 1 · kopuş 0.5 ATR · EMA arası 0 ATR · stop 2 ATR · 1:3 + 1R'de başa baş | 578 | -0,033 | 598 | -0,017 | +0,046 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: kesişim başına 1 · kopuş 0 ATR · EMA arası 0 ATR · stop 2 ATR · 1:2 + takip → ilk yarı +0,138 R (119), ikinci yarı -0,000 R (131)
- 1h: kesişim başına 1 · kopuş 1 ATR · EMA arası 0.5 ATR · stop 2 ATR · 1:3 → ilk yarı +0,032 R (263), ikinci yarı -0,028 R (269)
- 4h: kesişim başına 1 · kopuş 1 ATR · EMA arası 1 ATR · stop 2 ATR · 1:3 → ilk yarı +0,452 R (55), ikinci yarı +0,039 R (47)

## Bollinger + Stokastik

**Seçilen (ilk yarıya göre):** dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant

- İlk yarı: 1259 işlem · net ort. -0,041 R
- **İkinci yarı (doğrulama): 1267 işlem · net ort. -0,027 R · kazanan %46 · t -0,8**
- Tüm veri: 2526 işlem · net -0,034 R (maliyetsiz +0,026 R) · PF 0,94 · ort. süre 15,0 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,154 · 140 · %29 | +0,212 · 120 · %12 | +0,088 · 106 · %14 | -0,049 · 133 · %15 |
| 1h | -0,087 · 463 · %37 | +0,011 · 381 · %24 | -0,062 · 358 · %26 | -0,117 · 376 · %38 |
| 4h | +0,049 · 123 · %19 | -0,028 · 114 · %11 | +0,073 · 101 · %8 | -0,002 · 111 · %14 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant | 1259 | -0,041 | 1267 | -0,027 | +0,026 |
| dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant | 1366 | -0,043 | 1367 | -0,018 | +0,046 |
| bant filtresi yok · stop 2 ATR · 1:2 (seçilemez) | 1599 | -0,050 | 1675 | +0,001 | +0,044 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1 | 1280 | -0,059 | 1302 | -0,042 | +0,006 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1.5 | 1181 | -0,062 | 1232 | -0,050 | +0,005 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1 | 1408 | -0,064 | 1434 | -0,034 | +0,020 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1 | 1707 | -0,065 | 1781 | -0,059 | -0,004 |
| bant filtresi yok · stop 2 ATR · 1:1.5 (seçilemez) | 1961 | -0,066 | 2055 | -0,046 | +0,007 |
| bant filtresi yok · stop 2 ATR · hedef karşı bant (seçilemez) | 2748 | -0,069 | 2723 | -0,061 | -0,003 |
| dar bant < 0.8 × ort. · stop 2 ATR · hedef karşı bant | 1700 | -0,070 | 1717 | -0,052 | -0,000 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1.5 | 1373 | -0,071 | 1397 | -0,041 | +0,017 |
| dar bant < 1 × ort. · stop 2 ATR · 1:2 | 1054 | -0,071 | 1108 | -0,002 | +0,031 |
| bant filtresi yok · stop 2 ATR · 1:1 (seçilemez) | 2479 | -0,073 | 2567 | -0,056 | -0,005 |
| bant filtresi yok · stop 1.5 ATR · 1:1 (seçilemez) | 3270 | -0,074 | 3291 | -0,078 | -0,001 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:2 | 1319 | -0,074 | 1351 | -0,041 | +0,019 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:2 | 1251 | -0,075 | 1378 | -0,025 | +0,018 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 | 1492 | -0,078 | 1605 | -0,061 | -0,008 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 | 1948 | -0,082 | 2021 | -0,061 | -0,000 |
| bant filtresi yok · stop 1.5 ATR · 1:2 (seçilemez) | 2383 | -0,083 | 2474 | -0,064 | +0,007 |
| bant filtresi yok · stop 1.5 ATR · 1:1.5 (seçilemez) | 2801 | -0,085 | 2870 | -0,067 | +0,001 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · hedef karşı bant | 1877 | -0,087 | 1890 | -0,051 | +0,009 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:2 | 1732 | -0,087 | 1813 | -0,073 | -0,002 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1.5 | 1866 | -0,087 | 1931 | -0,071 | -0,004 |
| bant filtresi yok · stop 1.5 ATR · hedef karşı bant (seçilemez) | 3127 | -0,093 | 3103 | -0,070 | -0,002 |
| dar bant < 1 × ort. · stop 1 ATR · hedef karşı bant | 1500 | -0,104 | 1481 | -0,058 | +0,028 |
| bant filtresi yok · stop 1 ATR · 1:1.5 (seçilemez) | 3798 | -0,128 | 3815 | -0,111 | -0,010 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1.5 | 1524 | -0,134 | 1533 | -0,076 | -0,005 |
| dar bant < 1 × ort. · stop 1 ATR · 1:2 | 1513 | -0,135 | 1517 | -0,068 | +0,002 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1 | 1550 | -0,136 | 1547 | -0,102 | -0,022 |
| dar bant < 0.8 × ort. · stop 1 ATR · hedef karşı bant | 2092 | -0,137 | 2092 | -0,078 | +0,003 |
| bant filtresi yok · stop 1 ATR · hedef karşı bant (seçilemez) | 3644 | -0,143 | 3621 | -0,098 | -0,006 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1.5 | 2139 | -0,145 | 2201 | -0,080 | -0,009 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:2 | 2113 | -0,147 | 2155 | -0,077 | -0,005 |
| bant filtresi yok · stop 1 ATR · 1:1 (seçilemez) | 4028 | -0,150 | 4035 | -0,127 | -0,031 |
| bant filtresi yok · stop 1 ATR · 1:2 (seçilemez) | 3523 | -0,151 | 3563 | -0,096 | -0,012 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1 | 2186 | -0,152 | 2225 | -0,099 | -0,025 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 → ilk yarı +0,006 R (292), ikinci yarı +0,008 R (302)
- 1h: dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant → ilk yarı -0,037 R (790), ikinci yarı -0,092 R (788)
- 4h: dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant → ilk yarı -0,076 R (244), ikinci yarı +0,124 R (251)

## Heikin Ashi Smoothed

**Seçilen (ilk yarıya göre):** stop 2 ATR · renk dönünce çıkış

- İlk yarı: 2273 işlem · net ort. +0,012 R
- **İkinci yarı (doğrulama): 2235 işlem · net ort. +0,008 R · kazanan %31 · t 0,2**
- Tüm veri: 4508 işlem · net +0,010 R (maliyetsiz +0,081 R) · PF 1,02 · ort. süre 18,9 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,091 · 278 · %21 | -0,229 · 220 · %42 | +0,119 · 215 · %29 | +0,015 · 228 · %15 |
| 1h | +0,101 · 819 · %25 | -0,081 · 683 · %55 | -0,031 · 666 · %46 | +0,090 · 642 · %17 |
| 4h | +0,018 · 208 · %23 | -0,135 · 196 · %25 | -0,115 · 168 · %25 | +0,097 · 185 · %16 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 2 ATR · renk dönünce çıkış | 2273 | +0,012 | 2235 | +0,008 | +0,081 |
| stop 1 ATR · renk dönünce çıkış | 2273 | +0,008 | 2237 | +0,052 | +0,161 |
| stop 2 ATR · 1:2 + takip | 1130 | +0,007 | 1200 | -0,007 | +0,070 |
| stop 3 ATR · renk dönünce çıkış | 2273 | +0,007 | 2234 | +0,005 | +0,054 |
| stop 1.5 ATR · renk dönünce çıkış | 2273 | -0,002 | 2236 | +0,028 | +0,104 |
| stop 2 ATR · 1:2 | 1155 | -0,016 | 1210 | -0,052 | +0,034 |
| stop 2 ATR · 1:1.5 | 1327 | -0,020 | 1360 | -0,019 | +0,045 |
| stop 2 ATR · 1:1 | 1549 | -0,039 | 1575 | -0,054 | +0,014 |
| stop 2 ATR · 1:3 | 894 | -0,043 | 946 | -0,092 | +0,011 |
| stop 3 ATR · 1:3 | 473 | -0,046 | 460 | -0,172 | -0,031 |
| stop 1 ATR · 1:2 + takip | 2060 | -0,053 | 2043 | +0,056 | +0,118 |
| stop 3 ATR · 1:1 | 1007 | -0,060 | 1037 | -0,052 | -0,009 |
| stop 3 ATR · 1:2 + takip | 605 | -0,074 | 668 | -0,085 | -0,016 |
| stop 1.5 ATR · 1:2 + takip | 1609 | -0,080 | 1594 | +0,064 | +0,076 |
| stop 3 ATR · 1:2 | 639 | -0,082 | 673 | -0,111 | -0,035 |
| stop 3 ATR · 1:1.5 | 779 | -0,084 | 818 | -0,054 | -0,014 |
| stop 1.5 ATR · 1:1.5 | 1772 | -0,098 | 1766 | -0,020 | +0,020 |
| stop 1 ATR · 1:2 | 2074 | -0,099 | 2065 | -0,032 | +0,047 |
| stop 1.5 ATR · 1:1 | 1919 | -0,101 | 1924 | -0,057 | -0,003 |
| stop 1.5 ATR · 1:2 | 1635 | -0,114 | 1615 | +0,006 | +0,027 |
| stop 1 ATR · 1:3 | 1922 | -0,124 | 1892 | -0,003 | +0,053 |
| stop 1.5 ATR · 1:3 | 1386 | -0,127 | 1335 | -0,032 | +0,010 |
| stop 1 ATR · 1:1.5 | 2127 | -0,128 | 2115 | -0,052 | +0,020 |
| stop 1 ATR · 1:1 | 2187 | -0,129 | 2149 | -0,092 | -0,002 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1 ATR · renk dönünce çıkış → ilk yarı +0,088 R (480), ikinci yarı +0,020 R (461)
- 1h: stop 2 ATR · renk dönünce çıkış → ilk yarı +0,010 R (1413), ikinci yarı +0,036 R (1397)
- 4h: stop 2 ATR · 1:2 → ilk yarı +0,140 R (199), ikinci yarı -0,092 R (218)

## Heikin Ashi Smoothed + ADX

**Seçilen (ilk yarıya göre):** ADX ≥ 30 · stop 2 ATR · 1:2 + takip

- İlk yarı: 278 işlem · net ort. +0,140 R
- **İkinci yarı (doğrulama): 293 işlem · net ort. -0,136 R · kazanan %31 · t -1,6**
- Tüm veri: 571 işlem · net -0,002 R (maliyetsiz +0,062 R) · PF 1,00 · ort. süre 28,2 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,207 · 31 · %8 | +0,181 · 15 · %3 | -0,068 · 26 · %6 | -0,184 · 27 · %8 |
| 1h | -0,016 · 93 · %11 | -0,105 · 72 · %15 | -0,055 · 105 · %12 | +0,171 · 102 · %10 |
| 4h | +0,156 · 26 · %8 | -0,166 · 21 · %7 | -0,046 · 27 · %6 | +0,289 · 26 · %8 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| ADX ≥ 30 · stop 2 ATR · 1:2 + takip | 278 | +0,140 | 293 | -0,136 | +0,062 |
| ADX ≥ 25 · stop 2 ATR · 1:2 + takip | 509 | +0,049 | 536 | -0,091 | +0,044 |
| ADX ≥ 30 · stop 2 ATR · renk dönünce çıkış | 331 | +0,034 | 338 | -0,120 | +0,014 |
| ADX ≥ 25 · stop 2 ATR · renk dönünce çıkış | 640 | +0,030 | 668 | -0,035 | +0,060 |
| ADX ≥ 20 · stop 2 ATR · renk dönünce çıkış | 1127 | +0,017 | 1155 | -0,008 | +0,070 |
| ADX ≥ 25 · stop 1.5 ATR · renk dönünce çıkış | 640 | +0,003 | 668 | +0,006 | +0,085 |
| ADX ≥ 20 · stop 1.5 ATR · renk dönünce çıkış | 1127 | -0,008 | 1155 | +0,009 | +0,086 |
| ADX ≥ 30 · stop 1.5 ATR · 1:2 + takip | 292 | -0,010 | 312 | -0,085 | +0,023 |
| ADX ≥ 30 · stop 1.5 ATR · renk dönünce çıkış | 331 | -0,032 | 338 | -0,089 | +0,013 |
| ADX ≥ 20 · stop 2 ATR · 1:2 + takip | 769 | -0,032 | 822 | -0,067 | +0,018 |
| ADX ≥ 25 · stop 1.5 ATR · 1:2 + takip | 558 | -0,078 | 593 | +0,007 | +0,043 |
| ADX ≥ 20 · stop 1.5 ATR · 1:2 + takip | 925 | -0,091 | 974 | +0,011 | +0,041 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: ADX ≥ 20 · stop 1.5 ATR · renk dönünce çıkış → ilk yarı +0,392 R (231), ikinci yarı +0,013 R (200)
- 1h: ADX ≥ 30 · stop 2 ATR · 1:2 + takip → ilk yarı +0,100 R (164), ikinci yarı -0,066 R (208)
- 4h: ADX ≥ 30 · stop 2 ATR · 1:2 + takip → ilk yarı +0,406 R (58), ikinci yarı -0,397 R (42)

## Üçgen formasyonları

**Seçilen (ilk yarıya göre):** stop 1.5 ATR · 1:3

- İlk yarı: 383 işlem · net ort. +0,015 R
- **İkinci yarı (doğrulama): 380 işlem · net ort. -0,104 R · kazanan %24 · t -1,2**
- Tüm veri: 763 işlem · net -0,045 R (maliyetsiz +0,043 R) · PF 0,94 · ort. süre 17,0 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,432 · 44 · %20 | -0,183 · 34 · %9 | -0,299 · 31 · %14 | -0,533 · 44 · %24 |
| 1h | -0,017 · 154 · %25 | -0,106 · 117 · %21 | +0,048 · 98 · %11 | +0,135 · 117 · %12 |
| 4h | -0,030 · 31 · %9 | +0,095 · 37 · %7 | -0,233 · 24 · %13 | +0,666 · 32 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 1.5 ATR · 1:3 | 383 | +0,015 | 380 | -0,104 | +0,043 |
| stop 1.5 ATR · hedef formasyon yüksekliği | 360 | +0,006 | 341 | -0,104 | +0,058 |
| stop 1.5 ATR · 1:2 + takip | 399 | -0,011 | 388 | -0,003 | +0,077 |
| stop 2 ATR · 1:2 | 356 | -0,021 | 347 | -0,018 | +0,050 |
| stop 2 ATR · 1:2 + takip | 354 | -0,024 | 347 | -0,056 | +0,032 |
| stop 1 ATR · 1:3 | 445 | -0,030 | 431 | -0,012 | +0,096 |
| stop 1.5 ATR · 1:2 | 400 | -0,045 | 388 | -0,018 | +0,051 |
| stop 2 ATR · 1:1.5 | 368 | -0,045 | 357 | +0,045 | +0,066 |
| stop 1 ATR · hedef formasyon yüksekliği | 408 | -0,050 | 390 | +0,050 | +0,141 |
| stop 1.5 ATR · 1:1.5 | 408 | -0,062 | 396 | -0,044 | +0,026 |
| stop 1 ATR · 1:2 + takip | 451 | -0,068 | 438 | +0,027 | +0,096 |
| stop 2 ATR · hedef formasyon yüksekliği | 322 | -0,070 | 303 | -0,144 | -0,018 |
| stop 1 ATR · 1:1.5 | 459 | -0,092 | 444 | -0,054 | +0,038 |
| stop 1 ATR · 1:2 | 452 | -0,095 | 439 | -0,023 | +0,054 |
| stop 2 ATR · 1:3 | 331 | -0,107 | 327 | -0,061 | -0,003 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1.5 ATR · 1:1.5 → ilk yarı -0,152 R (83), ikinci yarı -0,185 R (76)
- 1h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,157 R (230), ikinci yarı +0,000 R (205)
- 4h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,232 R (54), ikinci yarı -0,265 R (64)

## EMA 20/50 + hacim + Heikin Ashi

**Seçilen (ilk yarıya göre):** RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR

- İlk yarı: 1435 işlem · net ort. +0,014 R
- **İkinci yarı (doğrulama): 1511 işlem · net ort. -0,039 R · kazanan %25 · t -1,0**
- Tüm veri: 2946 işlem · net -0,013 R (maliyetsiz +0,073 R) · PF 0,97 · ort. süre 9,2 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,019 · 284 · %32 | -0,089 · 103 · %17 | +0,113 · 87 · %15 | -0,047 · 112 · %16 |
| 1h | -0,014 · 792 · %40 | -0,157 · 404 · %54 | -0,061 · 313 · %34 | +0,106 · 310 · %15 |
| 4h | +0,046 · 188 · %19 | +0,015 · 116 · %15 | +0,050 · 122 · %13 | +0,128 · 115 · %10 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1435 | +0,014 | 1511 | -0,039 | +0,073 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1432 | +0,008 | 1505 | -0,040 | +0,048 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1425 | +0,001 | 1495 | -0,025 | +0,031 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1785 | +0,000 | 1792 | -0,047 | +0,061 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1782 | -0,003 | 1786 | -0,044 | +0,039 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1775 | -0,006 | 1776 | -0,029 | +0,025 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 3 ATR | 1688 | -0,011 | 1802 | -0,049 | +0,009 |
| RSI yok · çıkış EMA 20 teması · acil stop 3 ATR | 2050 | -0,016 | 2089 | -0,049 | +0,006 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 2 ATR | 1688 | -0,017 | 1802 | -0,075 | +0,013 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 1.5 ATR | 1688 | -0,019 | 1800 | -0,097 | +0,021 |
| RSI yok · çıkış EMA 20 teması · acil stop 2 ATR | 2050 | -0,024 | 2089 | -0,073 | +0,009 |
| RSI yok · çıkış EMA 20 teması · acil stop 1.5 ATR | 2050 | -0,028 | 2087 | -0,095 | +0,016 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR → ilk yarı -0,036 R (290), ikinci yarı -0,003 R (294)
- 1h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR → ilk yarı -0,005 R (883), ikinci yarı -0,052 R (928)
- 4h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR → ilk yarı +0,159 R (259), ikinci yarı -0,035 R (282)
