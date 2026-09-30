# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5606 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17128 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4437 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4486 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13715 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3712 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4497 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13685 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3704 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4499 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13724 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |

## EMA 21/55 geri çekilmesi

**Seçilen (ilk yarıya göre):** her geri çekilme · stop 2 ATR · 1:3

- İlk yarı: 920 işlem · net ort. +0,030 R
- **İkinci yarı (doğrulama): 950 işlem · net ort. -0,002 R · kazanan %27 · t -0,0**
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
| her geri çekilme · stop 2 ATR · 1:3 | 920 | +0,030 | 950 | -0,002 | +0,091 |
| ilk geri çekilme · stop 2 ATR · 1:2.5 | 561 | +0,005 | 560 | -0,008 | +0,074 |
| ilk geri çekilme · stop 2 ATR · 1:2 + takip | 578 | +0,004 | 585 | -0,004 | +0,073 |
| ilk geri çekilme · stop 2 ATR · 1:3 | 544 | -0,003 | 532 | +0,023 | +0,089 |
| ilk geri çekilme · stop 1.5 ATR · 1:2 + takip | 623 | -0,005 | 643 | -0,045 | +0,061 |
| ilk geri çekilme · stop 2 ATR · 1:2 | 579 | -0,009 | 586 | +0,004 | +0,069 |
| ilk geri çekilme · stop 2 ATR · 1:1.5 | 594 | -0,015 | 600 | -0,017 | +0,051 |
| ilk geri çekilme · stop 1.5 ATR · 1:2 | 624 | -0,031 | 643 | -0,061 | +0,037 |
| her geri çekilme · stop 2 ATR · 1:2.5 | 1048 | -0,032 | 1074 | +0,008 | +0,061 |
| ilk geri çekilme · stop 1.5 ATR · 1:2.5 | 619 | -0,035 | 641 | -0,044 | +0,047 |
| her geri çekilme · stop 2 ATR · 1:1.5 | 1380 | -0,039 | 1390 | -0,024 | +0,032 |
| ilk geri çekilme · stop 1.5 ATR · 1:3 | 610 | -0,040 | 633 | -0,035 | +0,052 |
| her geri çekilme · stop 1.5 ATR · 1:2 + takip | 1647 | -0,044 | 1636 | -0,022 | +0,050 |
| ilk geri çekilme · stop 2 ATR · 1:1 | 609 | -0,047 | 622 | -0,061 | +0,009 |
| her geri çekilme · stop 2 ATR · 1:2 + takip | 1166 | -0,048 | 1207 | +0,025 | +0,059 |
| ilk geri çekilme · stop 1 ATR · 1:3 | 649 | -0,063 | 668 | -0,044 | +0,066 |
| her geri çekilme · stop 2 ATR · 1:2 | 1187 | -0,067 | 1223 | +0,011 | +0,041 |
| ilk geri çekilme · stop 1.5 ATR · 1:1.5 | 628 | -0,071 | 647 | -0,055 | +0,018 |
| her geri çekilme · stop 1.5 ATR · 1:2 | 1672 | -0,082 | 1657 | -0,052 | +0,014 |
| her geri çekilme · stop 2 ATR · 1:1 | 1657 | -0,083 | 1662 | -0,044 | -0,004 |
| ilk geri çekilme · stop 1 ATR · 1:2 + takip | 650 | -0,085 | 669 | +0,007 | +0,081 |
| her geri çekilme · stop 1 ATR · 1:2 + takip | 2326 | -0,087 | 2277 | -0,035 | +0,053 |
| ilk geri çekilme · stop 1.5 ATR · 1:1 | 632 | -0,090 | 654 | -0,118 | -0,026 |
| ilk geri çekilme · stop 1 ATR · 1:2.5 | 649 | -0,096 | 669 | -0,051 | +0,044 |
| her geri çekilme · stop 1.5 ATR · 1:3 | 1402 | -0,097 | 1387 | -0,019 | +0,028 |
| her geri çekilme · stop 1.5 ATR · 1:2.5 | 1536 | -0,101 | 1525 | -0,022 | +0,022 |
| her geri çekilme · stop 1.5 ATR · 1:1.5 | 1877 | -0,102 | 1850 | -0,057 | -0,002 |
| her geri çekilme · stop 1 ATR · 1:3 | 2105 | -0,104 | 2096 | -0,070 | +0,028 |
| her geri çekilme · stop 1 ATR · 1:2.5 | 2235 | -0,116 | 2193 | -0,060 | +0,024 |
| her geri çekilme · stop 1.5 ATR · 1:1 | 2151 | -0,117 | 2112 | -0,096 | -0,032 |
| ilk geri çekilme · stop 1 ATR · 1:2 | 650 | -0,123 | 669 | -0,070 | +0,019 |
| ilk geri çekilme · stop 1 ATR · 1:1 | 652 | -0,141 | 674 | -0,095 | -0,008 |
| ilk geri çekilme · stop 1 ATR · 1:1.5 | 650 | -0,141 | 669 | -0,129 | -0,022 |
| her geri çekilme · stop 1 ATR · 1:2 | 2391 | -0,148 | 2343 | -0,095 | -0,011 |
| her geri çekilme · stop 1 ATR · 1:1.5 | 2563 | -0,159 | 2499 | -0,125 | -0,033 |
| her geri çekilme · stop 1 ATR · 1:1 | 2801 | -0,167 | 2762 | -0,112 | -0,032 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: ilk geri çekilme · stop 1.5 ATR · 1:2.5 → ilk yarı +0,145 R (131), ikinci yarı +0,008 R (150)
- 1h: her geri çekilme · stop 2 ATR · 1:3 → ilk yarı +0,026 R (575), ikinci yarı +0,041 R (599)
- 4h: ilk geri çekilme · stop 2 ATR · 1:3 → ilk yarı +0,218 R (93), ikinci yarı -0,134 R (94)

## Bollinger + Stokastik

**Seçilen (ilk yarıya göre):** dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant

- İlk yarı: 1258 işlem · net ort. -0,040 R
- **İkinci yarı (doğrulama): 1267 işlem · net ort. -0,027 R · kazanan %46 · t -0,8**
- Tüm veri: 2525 işlem · net -0,033 R (maliyetsiz +0,026 R) · PF 0,94 · ort. süre 15,0 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,154 · 140 · %29 | +0,223 · 119 · %12 | +0,088 · 106 · %14 | -0,049 · 133 · %15 |
| 1h | -0,087 · 463 · %37 | +0,011 · 381 · %24 | -0,062 · 358 · %26 | -0,117 · 376 · %38 |
| 4h | +0,049 · 123 · %19 | -0,028 · 114 · %11 | +0,073 · 101 · %8 | -0,002 · 111 · %14 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant | 1258 | -0,040 | 1267 | -0,027 | +0,026 |
| dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant | 1365 | -0,042 | 1366 | -0,017 | +0,046 |
| bant filtresi yok · stop 2 ATR · 1:2 (seçilemez) | 1599 | -0,050 | 1673 | +0,002 | +0,044 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1 | 1279 | -0,058 | 1302 | -0,042 | +0,007 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1.5 | 1180 | -0,061 | 1232 | -0,050 | +0,005 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1 | 1407 | -0,063 | 1432 | -0,035 | +0,020 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1 | 1706 | -0,064 | 1781 | -0,059 | -0,004 |
| bant filtresi yok · stop 2 ATR · 1:1.5 (seçilemez) | 1960 | -0,065 | 2055 | -0,046 | +0,007 |
| bant filtresi yok · stop 2 ATR · hedef karşı bant (seçilemez) | 2748 | -0,069 | 2721 | -0,061 | -0,003 |
| dar bant < 0.8 × ort. · stop 2 ATR · hedef karşı bant | 1700 | -0,070 | 1716 | -0,051 | +0,000 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1.5 | 1372 | -0,070 | 1396 | -0,041 | +0,018 |
| dar bant < 1 × ort. · stop 2 ATR · 1:2 | 1054 | -0,071 | 1107 | -0,001 | +0,031 |
| bant filtresi yok · stop 2 ATR · 1:1 (seçilemez) | 2478 | -0,073 | 2565 | -0,056 | -0,005 |
| bant filtresi yok · stop 1.5 ATR · 1:1 (seçilemez) | 3269 | -0,074 | 3285 | -0,079 | -0,002 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:2 | 1318 | -0,074 | 1349 | -0,039 | +0,020 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:2 | 1251 | -0,075 | 1376 | -0,024 | +0,019 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 | 1491 | -0,078 | 1605 | -0,061 | -0,008 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 | 1947 | -0,082 | 2018 | -0,063 | -0,001 |
| bant filtresi yok · stop 1.5 ATR · 1:2 (seçilemez) | 2382 | -0,083 | 2472 | -0,063 | +0,007 |
| bant filtresi yok · stop 1.5 ATR · 1:1.5 (seçilemez) | 2800 | -0,085 | 2866 | -0,067 | +0,001 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · hedef karşı bant | 1876 | -0,086 | 1889 | -0,050 | +0,009 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:2 | 1731 | -0,087 | 1811 | -0,072 | -0,001 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1.5 | 1865 | -0,087 | 1930 | -0,070 | -0,003 |
| bant filtresi yok · stop 1.5 ATR · hedef karşı bant (seçilemez) | 3126 | -0,093 | 3101 | -0,070 | -0,002 |
| dar bant < 1 × ort. · stop 1 ATR · hedef karşı bant | 1499 | -0,103 | 1480 | -0,057 | +0,028 |
| bant filtresi yok · stop 1 ATR · 1:1.5 (seçilemez) | 3797 | -0,127 | 3809 | -0,111 | -0,010 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1.5 | 1523 | -0,134 | 1532 | -0,077 | -0,005 |
| dar bant < 1 × ort. · stop 1 ATR · 1:2 | 1512 | -0,134 | 1516 | -0,068 | +0,003 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1 | 1549 | -0,136 | 1545 | -0,102 | -0,022 |
| dar bant < 0.8 × ort. · stop 1 ATR · hedef karşı bant | 2091 | -0,136 | 2090 | -0,077 | +0,004 |
| bant filtresi yok · stop 1 ATR · hedef karşı bant (seçilemez) | 3643 | -0,142 | 3617 | -0,097 | -0,005 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1.5 | 2138 | -0,145 | 2199 | -0,080 | -0,009 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:2 | 2112 | -0,147 | 2153 | -0,076 | -0,005 |
| bant filtresi yok · stop 1 ATR · 1:1 (seçilemez) | 4027 | -0,150 | 4030 | -0,127 | -0,031 |
| bant filtresi yok · stop 1 ATR · 1:2 (seçilemez) | 3522 | -0,150 | 3557 | -0,096 | -0,012 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1 | 2185 | -0,152 | 2222 | -0,098 | -0,025 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 → ilk yarı +0,009 R (291), ikinci yarı +0,008 R (302)
- 1h: dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant → ilk yarı -0,037 R (790), ikinci yarı -0,092 R (788)
- 4h: dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant → ilk yarı -0,076 R (244), ikinci yarı +0,124 R (251)

## Heikin Ashi Smoothed

**Seçilen (ilk yarıya göre):** stop 3 ATR · renk dönünce çıkış

- İlk yarı: 1189 işlem · net ort. +0,009 R
- **İkinci yarı (doğrulama): 1163 işlem · net ort. +0,049 R · kazanan %35 · t 1,4**
- Tüm veri: 2352 işlem · net +0,029 R (maliyetsiz +0,078 R) · PF 1,08 · ort. süre 20,4 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,107 · 143 · %12 | -0,124 · 121 · %17 | +0,179 · 113 · %11 | +0,052 · 119 · %6 |
| 1h | +0,154 · 424 · %8 | -0,054 · 360 · %28 | -0,094 · 350 · %31 | +0,094 · 331 · %12 |
| 4h | +0,058 · 108 · %10 | -0,122 · 100 · %14 | -0,190 · 89 · %22 | +0,206 · 94 · %9 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 3 ATR · renk dönünce çıkış | 1189 | +0,009 | 1163 | +0,049 | +0,078 |
| stop 2 ATR · renk dönünce çıkış | 1297 | -0,002 | 1286 | +0,036 | +0,089 |
| stop 1 ATR · renk dönünce çıkış | 1648 | -0,004 | 1603 | +0,075 | +0,166 |
| stop 2 ATR · 1:2 + takip | 1056 | -0,018 | 1133 | +0,001 | +0,063 |
| stop 2 ATR · 1:1.5 | 1230 | -0,027 | 1265 | -0,038 | +0,032 |
| stop 1.5 ATR · renk dönünce çıkış | 1431 | -0,035 | 1414 | +0,043 | +0,095 |
| stop 2 ATR · 1:3 | 842 | -0,037 | 890 | -0,134 | -0,007 |
| stop 2 ATR · 1:2 | 1076 | -0,042 | 1138 | -0,046 | +0,024 |
| stop 1 ATR · 1:2 + takip | 1954 | -0,045 | 1933 | +0,060 | +0,124 |
| stop 1.5 ATR · 1:2 + takip | 1484 | -0,049 | 1468 | +0,058 | +0,089 |
| stop 2 ATR · 1:1 | 1416 | -0,052 | 1457 | -0,073 | -0,002 |
| stop 3 ATR · 1:1 | 952 | -0,061 | 981 | -0,044 | -0,005 |
| stop 3 ATR · 1:2 + takip | 573 | -0,071 | 634 | -0,061 | -0,002 |
| stop 1.5 ATR · 1:2 | 1498 | -0,081 | 1485 | -0,008 | +0,037 |
| stop 3 ATR · 1:3 | 450 | -0,084 | 442 | -0,145 | -0,036 |
| stop 1.5 ATR · 1:1.5 | 1632 | -0,084 | 1626 | -0,029 | +0,022 |
| stop 1 ATR · 1:2 | 1962 | -0,091 | 1948 | -0,033 | +0,050 |
| stop 1.5 ATR · 1:1 | 1788 | -0,092 | 1777 | -0,070 | -0,005 |
| stop 1.5 ATR · 1:3 | 1271 | -0,102 | 1246 | -0,036 | +0,020 |
| stop 3 ATR · 1:1.5 | 733 | -0,102 | 787 | -0,071 | -0,031 |
| stop 3 ATR · 1:2 | 602 | -0,102 | 642 | -0,097 | -0,038 |
| stop 1 ATR · 1:3 | 1806 | -0,106 | 1784 | +0,003 | +0,065 |
| stop 1 ATR · 1:1.5 | 2027 | -0,124 | 2006 | -0,052 | +0,022 |
| stop 1 ATR · 1:1 | 2093 | -0,125 | 2054 | -0,085 | +0,003 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 3 ATR · renk dönünce çıkış → ilk yarı +0,086 R (257), ikinci yarı +0,019 R (239)
- 1h: stop 3 ATR · renk dönünce çıkış → ilk yarı -0,004 R (736), ikinci yarı +0,064 R (729)
- 4h: stop 1 ATR · 1:2 + takip → ilk yarı +0,154 R (337), ikinci yarı -0,039 R (331)

## Üçgen formasyonları

**Seçilen (ilk yarıya göre):** stop 1.5 ATR · 1:3

- İlk yarı: 383 işlem · net ort. +0,015 R
- **İkinci yarı (doğrulama): 379 işlem · net ort. -0,102 R · kazanan %25 · t -1,2**
- Tüm veri: 762 işlem · net -0,043 R (maliyetsiz +0,045 R) · PF 0,95 · ort. süre 17,0 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,432 · 44 · %20 | -0,183 · 34 · %9 | -0,274 · 30 · %14 | -0,533 · 44 · %24 |
| 1h | -0,017 · 154 · %25 | -0,106 · 117 · %21 | +0,048 · 98 · %11 | +0,135 · 117 · %12 |
| 4h | -0,030 · 31 · %9 | +0,095 · 37 · %7 | -0,233 · 24 · %13 | +0,666 · 32 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 1.5 ATR · 1:3 | 383 | +0,015 | 379 | -0,102 | +0,045 |
| stop 1.5 ATR · hedef formasyon yüksekliği | 360 | +0,006 | 340 | -0,102 | +0,059 |
| stop 1.5 ATR · 1:2 + takip | 399 | -0,011 | 387 | -0,001 | +0,078 |
| stop 2 ATR · 1:2 | 356 | -0,021 | 346 | -0,015 | +0,051 |
| stop 2 ATR · 1:2 + takip | 354 | -0,024 | 346 | -0,053 | +0,033 |
| stop 1 ATR · 1:3 | 445 | -0,030 | 430 | -0,010 | +0,097 |
| stop 1.5 ATR · 1:2 | 400 | -0,045 | 387 | -0,015 | +0,052 |
| stop 2 ATR · 1:1.5 | 368 | -0,045 | 356 | +0,048 | +0,067 |
| stop 1 ATR · hedef formasyon yüksekliği | 408 | -0,050 | 389 | +0,053 | +0,142 |
| stop 1.5 ATR · 1:1.5 | 408 | -0,062 | 395 | -0,042 | +0,027 |
| stop 1 ATR · 1:2 + takip | 451 | -0,068 | 437 | +0,029 | +0,097 |
| stop 2 ATR · hedef formasyon yüksekliği | 322 | -0,070 | 302 | -0,141 | -0,016 |
| stop 1 ATR · 1:1.5 | 459 | -0,092 | 443 | -0,052 | +0,039 |
| stop 1 ATR · 1:2 | 452 | -0,095 | 438 | -0,021 | +0,055 |
| stop 2 ATR · 1:3 | 331 | -0,107 | 326 | -0,058 | -0,002 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1.5 ATR · 1:1.5 → ilk yarı -0,152 R (83), ikinci yarı -0,174 R (75)
- 1h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,157 R (230), ikinci yarı +0,000 R (205)
- 4h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,232 R (54), ikinci yarı -0,265 R (64)

## EMA 20/50 + hacim + Heikin Ashi

**Seçilen (ilk yarıya göre):** RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR

- İlk yarı: 1433 işlem · net ort. +0,014 R
- **İkinci yarı (doğrulama): 1507 işlem · net ort. -0,040 R · kazanan %25 · t -1,0**
- Tüm veri: 2940 işlem · net -0,014 R (maliyetsiz +0,072 R) · PF 0,97 · ort. süre 9,2 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,017 · 282 · %32 | -0,089 · 103 · %17 | +0,113 · 87 · %15 | -0,056 · 111 · %16 |
| 1h | -0,015 · 790 · %41 | -0,157 · 404 · %54 | -0,061 · 313 · %34 | +0,108 · 309 · %15 |
| 4h | +0,046 · 188 · %19 | +0,015 · 116 · %15 | +0,050 · 122 · %13 | +0,128 · 115 · %10 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1433 | +0,014 | 1507 | -0,040 | +0,072 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1429 | +0,009 | 1498 | -0,041 | +0,048 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1421 | +0,002 | 1488 | -0,026 | +0,031 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1783 | +0,000 | 1788 | -0,047 | +0,060 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1779 | -0,003 | 1779 | -0,045 | +0,039 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1771 | -0,005 | 1769 | -0,029 | +0,025 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 3 ATR | 1687 | -0,011 | 1796 | -0,049 | +0,009 |
| RSI yok · çıkış EMA 20 teması · acil stop 3 ATR | 2049 | -0,016 | 2083 | -0,049 | +0,006 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 2 ATR | 1687 | -0,017 | 1796 | -0,075 | +0,013 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 1.5 ATR | 1687 | -0,019 | 1796 | -0,097 | +0,020 |
| RSI yok · çıkış EMA 20 teması · acil stop 2 ATR | 2049 | -0,024 | 2083 | -0,074 | +0,009 |
| RSI yok · çıkış EMA 20 teması · acil stop 1.5 ATR | 2049 | -0,028 | 2083 | -0,096 | +0,016 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR → ilk yarı -0,036 R (289), ikinci yarı -0,004 R (291)
- 1h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR → ilk yarı -0,005 R (881), ikinci yarı -0,053 R (925)
- 4h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR → ilk yarı +0,159 R (259), ikinci yarı -0,035 R (282)
