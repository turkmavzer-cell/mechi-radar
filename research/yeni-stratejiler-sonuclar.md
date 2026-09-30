# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5609 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17129 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4438 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4489 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13716 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3713 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4500 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13686 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3705 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4502 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13725 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3715 | var |

## EMA 21/55 geri çekilmesi

**Seçilen (ilk yarıya göre):** her geri çekilme · stop 2 ATR · 1:3

- İlk yarı: 921 işlem · net ort. +0,033 R
- **İkinci yarı (doğrulama): 949 işlem · net ort. -0,005 R · kazanan %27 · t -0,1**
- Tüm veri: 1870 işlem · net +0,014 R (maliyetsiz +0,091 R) · PF 1,02 · ort. süre 31,7 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,356 · 98 · %36 | -0,075 · 105 · %22 | -0,043 · 75 · %20 | +0,014 · 97 · %16 |
| 1h | +0,105 · 324 · %22 | -0,080 · 292 · %36 | +0,053 · 294 · %23 | +0,048 · 264 · %21 |
| 4h | +0,078 · 88 · %13 | -0,118 · 73 · %15 | +0,081 · 79 · %11 | +0,323 · 81 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| her geri çekilme · stop 2 ATR · 1:3 | 921 | +0,033 | 949 | -0,005 | +0,091 |
| ilk geri çekilme · stop 2 ATR · 1:2.5 | 562 | +0,010 | 559 | -0,012 | +0,074 |
| ilk geri çekilme · stop 2 ATR · 1:2 + takip | 579 | +0,007 | 584 | -0,007 | +0,073 |
| ilk geri çekilme · stop 2 ATR · 1:3 | 545 | +0,002 | 531 | +0,017 | +0,089 |
| ilk geri çekilme · stop 1.5 ATR · 1:2 + takip | 624 | -0,002 | 642 | -0,047 | +0,061 |
| ilk geri çekilme · stop 2 ATR · 1:2 | 580 | -0,005 | 585 | +0,000 | +0,069 |
| ilk geri çekilme · stop 2 ATR · 1:1.5 | 595 | -0,013 | 599 | -0,019 | +0,051 |
| ilk geri çekilme · stop 1.5 ATR · 1:2 | 625 | -0,028 | 642 | -0,064 | +0,037 |
| her geri çekilme · stop 2 ATR · 1:2.5 | 1049 | -0,029 | 1073 | +0,006 | +0,061 |
| ilk geri çekilme · stop 1.5 ATR · 1:2.5 | 620 | -0,031 | 640 | -0,047 | +0,047 |
| ilk geri çekilme · stop 1.5 ATR · 1:3 | 611 | -0,035 | 632 | -0,039 | +0,052 |
| her geri çekilme · stop 2 ATR · 1:1.5 | 1381 | -0,038 | 1389 | -0,025 | +0,032 |
| her geri çekilme · stop 1.5 ATR · 1:2 + takip | 1648 | -0,043 | 1635 | -0,023 | +0,050 |
| ilk geri çekilme · stop 2 ATR · 1:1 | 610 | -0,046 | 621 | -0,062 | +0,009 |
| her geri çekilme · stop 2 ATR · 1:2 + takip | 1167 | -0,046 | 1206 | +0,023 | +0,059 |
| ilk geri çekilme · stop 1 ATR · 1:3 | 650 | -0,058 | 667 | -0,049 | +0,066 |
| her geri çekilme · stop 2 ATR · 1:2 | 1188 | -0,066 | 1222 | +0,009 | +0,041 |
| ilk geri çekilme · stop 1.5 ATR · 1:1.5 | 629 | -0,069 | 646 | -0,057 | +0,018 |
| her geri çekilme · stop 1.5 ATR · 1:2 | 1673 | -0,080 | 1656 | -0,053 | +0,014 |
| ilk geri çekilme · stop 1 ATR · 1:2 + takip | 651 | -0,081 | 668 | +0,004 | +0,081 |
| her geri çekilme · stop 2 ATR · 1:1 | 1658 | -0,082 | 1662 | -0,044 | -0,004 |
| her geri çekilme · stop 1 ATR · 1:2 + takip | 2327 | -0,086 | 2278 | -0,036 | +0,053 |
| ilk geri çekilme · stop 1.5 ATR · 1:1 | 633 | -0,089 | 653 | -0,119 | -0,026 |
| ilk geri çekilme · stop 1 ATR · 1:2.5 | 650 | -0,093 | 668 | -0,055 | +0,044 |
| her geri çekilme · stop 1.5 ATR · 1:3 | 1403 | -0,094 | 1386 | -0,021 | +0,028 |
| her geri çekilme · stop 1.5 ATR · 1:2.5 | 1537 | -0,100 | 1525 | -0,022 | +0,023 |
| her geri çekilme · stop 1.5 ATR · 1:1.5 | 1878 | -0,101 | 1850 | -0,057 | -0,001 |
| her geri çekilme · stop 1 ATR · 1:3 | 2106 | -0,102 | 2096 | -0,072 | +0,028 |
| her geri çekilme · stop 1 ATR · 1:2.5 | 2236 | -0,115 | 2194 | -0,060 | +0,025 |
| her geri çekilme · stop 1.5 ATR · 1:1 | 2152 | -0,116 | 2112 | -0,096 | -0,031 |
| ilk geri çekilme · stop 1 ATR · 1:2 | 651 | -0,120 | 668 | -0,073 | +0,019 |
| ilk geri çekilme · stop 1 ATR · 1:1.5 | 651 | -0,139 | 668 | -0,131 | -0,022 |
| ilk geri çekilme · stop 1 ATR · 1:1 | 653 | -0,139 | 673 | -0,096 | -0,008 |
| her geri çekilme · stop 1 ATR · 1:2 | 2392 | -0,148 | 2344 | -0,095 | -0,011 |
| her geri çekilme · stop 1 ATR · 1:1.5 | 2564 | -0,158 | 2499 | -0,126 | -0,033 |
| her geri çekilme · stop 1 ATR · 1:1 | 2802 | -0,167 | 2763 | -0,112 | -0,032 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: ilk geri çekilme · stop 1.5 ATR · 1:2.5 → ilk yarı +0,162 R (132), ikinci yarı -0,008 R (149)
- 1h: her geri çekilme · stop 2 ATR · 1:3 → ilk yarı +0,026 R (575), ikinci yarı +0,041 R (599)
- 4h: ilk geri çekilme · stop 2 ATR · 1:3 → ilk yarı +0,218 R (93), ikinci yarı -0,134 R (94)

## Bollinger + Stokastik

**Seçilen (ilk yarıya göre):** dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant

- İlk yarı: 1258 işlem · net ort. -0,040 R
- **İkinci yarı (doğrulama): 1268 işlem · net ort. -0,028 R · kazanan %46 · t -0,8**
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
| dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant | 1258 | -0,040 | 1268 | -0,028 | +0,026 |
| dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant | 1365 | -0,042 | 1366 | -0,017 | +0,046 |
| bant filtresi yok · stop 2 ATR · 1:2 (seçilemez) | 1599 | -0,050 | 1675 | +0,001 | +0,044 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1 | 1279 | -0,058 | 1303 | -0,043 | +0,006 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1.5 | 1180 | -0,061 | 1233 | -0,051 | +0,005 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1 | 1407 | -0,063 | 1433 | -0,035 | +0,020 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1 | 1706 | -0,064 | 1782 | -0,060 | -0,004 |
| bant filtresi yok · stop 2 ATR · 1:1.5 (seçilemez) | 1960 | -0,065 | 2056 | -0,047 | +0,007 |
| bant filtresi yok · stop 2 ATR · hedef karşı bant (seçilemez) | 2748 | -0,069 | 2723 | -0,061 | -0,003 |
| dar bant < 0.8 × ort. · stop 2 ATR · hedef karşı bant | 1700 | -0,070 | 1717 | -0,052 | -0,000 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1.5 | 1372 | -0,070 | 1396 | -0,041 | +0,018 |
| dar bant < 1 × ort. · stop 2 ATR · 1:2 | 1054 | -0,071 | 1108 | -0,002 | +0,031 |
| bant filtresi yok · stop 2 ATR · 1:1 (seçilemez) | 2478 | -0,073 | 2567 | -0,056 | -0,005 |
| bant filtresi yok · stop 1.5 ATR · 1:1 (seçilemez) | 3269 | -0,074 | 3287 | -0,078 | -0,001 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:2 | 1318 | -0,074 | 1350 | -0,040 | +0,020 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:2 | 1251 | -0,075 | 1378 | -0,025 | +0,018 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 | 1491 | -0,078 | 1606 | -0,062 | -0,008 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 | 1947 | -0,082 | 2019 | -0,062 | -0,001 |
| bant filtresi yok · stop 1.5 ATR · 1:2 (seçilemez) | 2382 | -0,083 | 2473 | -0,063 | +0,007 |
| bant filtresi yok · stop 1.5 ATR · 1:1.5 (seçilemez) | 2800 | -0,085 | 2868 | -0,066 | +0,002 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · hedef karşı bant | 1876 | -0,086 | 1889 | -0,050 | +0,009 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:2 | 1731 | -0,087 | 1812 | -0,073 | -0,002 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1.5 | 1865 | -0,087 | 1930 | -0,070 | -0,003 |
| bant filtresi yok · stop 1.5 ATR · hedef karşı bant (seçilemez) | 3126 | -0,093 | 3102 | -0,070 | -0,001 |
| dar bant < 1 × ort. · stop 1 ATR · hedef karşı bant | 1499 | -0,103 | 1481 | -0,058 | +0,028 |
| bant filtresi yok · stop 1 ATR · 1:1.5 (seçilemez) | 3797 | -0,127 | 3812 | -0,111 | -0,010 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1.5 | 1523 | -0,134 | 1533 | -0,077 | -0,005 |
| dar bant < 1 × ort. · stop 1 ATR · 1:2 | 1512 | -0,134 | 1517 | -0,068 | +0,002 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1 | 1549 | -0,136 | 1546 | -0,102 | -0,022 |
| dar bant < 0.8 × ort. · stop 1 ATR · hedef karşı bant | 2091 | -0,136 | 2091 | -0,077 | +0,004 |
| bant filtresi yok · stop 1 ATR · hedef karşı bant (seçilemez) | 3643 | -0,142 | 3620 | -0,097 | -0,005 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1.5 | 2138 | -0,145 | 2200 | -0,080 | -0,009 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:2 | 2112 | -0,147 | 2154 | -0,077 | -0,005 |
| bant filtresi yok · stop 1 ATR · 1:1 (seçilemez) | 4027 | -0,150 | 4031 | -0,127 | -0,031 |
| bant filtresi yok · stop 1 ATR · 1:2 (seçilemez) | 3522 | -0,150 | 3561 | -0,095 | -0,011 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1 | 2185 | -0,152 | 2223 | -0,099 | -0,025 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 → ilk yarı +0,009 R (291), ikinci yarı +0,005 R (303)
- 1h: dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant → ilk yarı -0,037 R (790), ikinci yarı -0,092 R (788)
- 4h: dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant → ilk yarı -0,076 R (244), ikinci yarı +0,124 R (251)

## Heikin Ashi Smoothed

**Seçilen (ilk yarıya göre):** stop 2 ATR · renk dönünce çıkış

- İlk yarı: 2061 işlem · net ort. +0,008 R
- **İkinci yarı (doğrulama): 2041 işlem · net ort. +0,005 R · kazanan %31 · t 0,1**
- Tüm veri: 4102 işlem · net +0,006 R (maliyetsiz +0,077 R) · PF 1,01 · ort. süre 18,7 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,128 · 258 · %18 | -0,226 · 196 · %38 | +0,117 · 199 · %26 | +0,016 · 205 · %12 |
| 1h | +0,108 · 751 · %23 | -0,074 · 622 · %48 | -0,064 · 599 · %52 | +0,085 · 584 · %18 |
| 4h | -0,019 · 187 · %24 | -0,144 · 174 · %24 | -0,138 · 152 · %23 | +0,081 · 175 · %15 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 2 ATR · renk dönünce çıkış | 2061 | +0,008 | 2041 | +0,005 | +0,077 |
| stop 3 ATR · renk dönünce çıkış | 2158 | +0,005 | 2108 | -0,013 | +0,044 |
| stop 1.5 ATR · renk dönünce çıkış | 2053 | +0,002 | 2020 | +0,015 | +0,100 |
| stop 1 ATR · renk dönünce çıkış | 2116 | -0,000 | 2089 | +0,052 | +0,156 |
| stop 2 ATR · 1:2 + takip | 1056 | -0,018 | 1133 | +0,001 | +0,063 |
| stop 2 ATR · 1:1.5 | 1230 | -0,027 | 1267 | -0,036 | +0,033 |
| stop 2 ATR · 1:3 | 842 | -0,037 | 890 | -0,134 | -0,007 |
| stop 2 ATR · 1:2 | 1076 | -0,042 | 1138 | -0,046 | +0,024 |
| stop 1 ATR · 1:2 + takip | 1954 | -0,045 | 1934 | +0,060 | +0,123 |
| stop 1.5 ATR · 1:2 + takip | 1484 | -0,049 | 1468 | +0,058 | +0,089 |
| stop 2 ATR · 1:1 | 1416 | -0,052 | 1457 | -0,073 | -0,002 |
| stop 3 ATR · 1:1 | 952 | -0,061 | 984 | -0,045 | -0,005 |
| stop 3 ATR · 1:2 + takip | 573 | -0,071 | 635 | -0,063 | -0,003 |
| stop 1.5 ATR · 1:2 | 1498 | -0,081 | 1487 | -0,005 | +0,038 |
| stop 3 ATR · 1:3 | 450 | -0,084 | 443 | -0,147 | -0,037 |
| stop 1.5 ATR · 1:1.5 | 1632 | -0,084 | 1626 | -0,029 | +0,022 |
| stop 1 ATR · 1:2 | 1962 | -0,091 | 1949 | -0,034 | +0,050 |
| stop 1.5 ATR · 1:1 | 1788 | -0,092 | 1778 | -0,070 | -0,005 |
| stop 1.5 ATR · 1:3 | 1271 | -0,102 | 1246 | -0,036 | +0,020 |
| stop 3 ATR · 1:1.5 | 733 | -0,102 | 789 | -0,074 | -0,033 |
| stop 3 ATR · 1:2 | 602 | -0,102 | 643 | -0,098 | -0,039 |
| stop 1 ATR · 1:3 | 1806 | -0,106 | 1787 | +0,006 | +0,067 |
| stop 1 ATR · 1:1.5 | 2027 | -0,124 | 2008 | -0,052 | +0,022 |
| stop 1 ATR · 1:1 | 2093 | -0,125 | 2056 | -0,085 | +0,003 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 2 ATR · renk dönünce çıkış → ilk yarı +0,056 R (440), ikinci yarı -0,023 R (418)
- 1h: stop 2 ATR · renk dönünce çıkış → ilk yarı +0,007 R (1274), ikinci yarı +0,029 R (1282)
- 4h: stop 1 ATR · 1:2 + takip → ilk yarı +0,154 R (337), ikinci yarı -0,039 R (331)

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
| stop 1 ATR · 1:3 | 445 | -0,030 | 430 | -0,010 | +0,097 |
| stop 1.5 ATR · 1:2 | 400 | -0,045 | 388 | -0,018 | +0,051 |
| stop 2 ATR · 1:1.5 | 368 | -0,045 | 357 | +0,045 | +0,066 |
| stop 1 ATR · hedef formasyon yüksekliği | 408 | -0,050 | 389 | +0,053 | +0,142 |
| stop 1.5 ATR · 1:1.5 | 408 | -0,062 | 396 | -0,044 | +0,026 |
| stop 1 ATR · 1:2 + takip | 451 | -0,068 | 437 | +0,029 | +0,097 |
| stop 2 ATR · hedef formasyon yüksekliği | 322 | -0,070 | 303 | -0,144 | -0,018 |
| stop 1 ATR · 1:1.5 | 459 | -0,092 | 443 | -0,052 | +0,039 |
| stop 1 ATR · 1:2 | 452 | -0,095 | 438 | -0,021 | +0,055 |
| stop 2 ATR · 1:3 | 331 | -0,107 | 327 | -0,061 | -0,003 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1.5 ATR · 1:1.5 → ilk yarı -0,152 R (83), ikinci yarı -0,185 R (76)
- 1h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,157 R (230), ikinci yarı +0,000 R (205)
- 4h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,232 R (54), ikinci yarı -0,265 R (64)

## EMA 20/50 + hacim + Heikin Ashi

**Seçilen (ilk yarıya göre):** RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR

- İlk yarı: 1435 işlem · net ort. +0,014 R
- **İkinci yarı (doğrulama): 1510 işlem · net ort. -0,040 R · kazanan %25 · t -1,0**
- Tüm veri: 2945 işlem · net -0,014 R (maliyetsiz +0,072 R) · PF 0,97 · ort. süre 9,2 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,019 · 284 · %32 | -0,089 · 103 · %17 | +0,113 · 87 · %15 | -0,056 · 111 · %16 |
| 1h | -0,014 · 792 · %40 | -0,157 · 404 · %54 | -0,061 · 313 · %34 | +0,106 · 310 · %15 |
| 4h | +0,046 · 188 · %19 | +0,015 · 116 · %15 | +0,050 · 122 · %13 | +0,128 · 115 · %10 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1435 | +0,014 | 1510 | -0,040 | +0,072 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1432 | +0,008 | 1504 | -0,041 | +0,048 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1425 | +0,001 | 1494 | -0,025 | +0,031 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1785 | +0,000 | 1791 | -0,047 | +0,060 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1782 | -0,003 | 1785 | -0,045 | +0,039 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1775 | -0,006 | 1775 | -0,029 | +0,025 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 3 ATR | 1688 | -0,011 | 1801 | -0,049 | +0,009 |
| RSI yok · çıkış EMA 20 teması · acil stop 3 ATR | 2050 | -0,016 | 2088 | -0,049 | +0,006 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 2 ATR | 1688 | -0,017 | 1801 | -0,074 | +0,013 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 1.5 ATR | 1688 | -0,019 | 1799 | -0,096 | +0,021 |
| RSI yok · çıkış EMA 20 teması · acil stop 2 ATR | 2050 | -0,024 | 2088 | -0,073 | +0,010 |
| RSI yok · çıkış EMA 20 teması · acil stop 1.5 ATR | 2050 | -0,028 | 2086 | -0,095 | +0,016 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR → ilk yarı -0,036 R (290), ikinci yarı -0,005 R (293)
- 1h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR → ilk yarı -0,005 R (883), ikinci yarı -0,052 R (928)
- 4h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR → ilk yarı +0,159 R (259), ikinci yarı -0,035 R (282)
