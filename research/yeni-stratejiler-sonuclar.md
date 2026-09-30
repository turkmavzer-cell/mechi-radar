# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5612 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17141 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4440 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4493 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13738 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3718 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4504 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13717 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4506 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13753 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3720 | var |

## EMA 21/55 geri çekilmesi

**Seçilen (ilk yarıya göre):** her geri çekilme · stop 2 ATR · 1:3

- İlk yarı: 920 işlem · net ort. +0,009 R
- **İkinci yarı (doğrulama): 939 işlem · net ort. -0,011 R · kazanan %27 · t -0,2**
- Tüm veri: 1859 işlem · net -0,001 R (maliyetsiz +0,076 R) · PF 1,00 · ort. süre 32,1 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,356 · 98 · %36 | -0,075 · 105 · %22 | -0,043 · 75 · %20 | +0,014 · 97 · %16 |
| 1h | +0,105 · 324 · %22 | -0,103 · 299 · %41 | +0,041 · 290 · %23 | -0,044 · 261 · %30 |
| 4h | +0,078 · 88 · %13 | -0,037 · 75 · %11 | +0,131 · 79 · %9 | +0,352 · 68 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| her geri çekilme · stop 2 ATR · 1:3 | 920 | +0,009 | 939 | -0,011 | +0,076 |
| ilk geri çekilme · stop 2 ATR · 1:3 | 540 | +0,006 | 538 | +0,005 | +0,083 |
| ilk geri çekilme · stop 2 ATR · 1:2.5 | 555 | +0,005 | 561 | -0,034 | +0,060 |
| ilk geri çekilme · stop 2 ATR · 1:2 + takip | 572 | +0,004 | 587 | -0,001 | +0,075 |
| ilk geri çekilme · stop 2 ATR · 1:2 | 573 | -0,013 | 588 | -0,015 | +0,057 |
| ilk geri çekilme · stop 2 ATR · 1:1.5 | 589 | -0,019 | 601 | -0,030 | +0,042 |
| ilk geri çekilme · stop 1.5 ATR · 1:2 + takip | 621 | -0,029 | 643 | -0,042 | +0,050 |
| her geri çekilme · stop 2 ATR · 1:1.5 | 1356 | -0,037 | 1376 | -0,032 | +0,029 |
| ilk geri çekilme · stop 2 ATR · 1:1 | 608 | -0,041 | 624 | -0,073 | +0,005 |
| ilk geri çekilme · stop 1.5 ATR · 1:2 | 622 | -0,042 | 643 | -0,074 | +0,025 |
| her geri çekilme · stop 2 ATR · 1:2.5 | 1029 | -0,043 | 1058 | +0,005 | +0,053 |
| ilk geri çekilme · stop 1.5 ATR · 1:2.5 | 615 | -0,056 | 641 | -0,059 | +0,028 |
| ilk geri çekilme · stop 1.5 ATR · 1:3 | 605 | -0,056 | 634 | -0,073 | +0,023 |
| her geri çekilme · stop 2 ATR · 1:2 + takip | 1143 | -0,056 | 1174 | +0,029 | +0,057 |
| her geri çekilme · stop 1.5 ATR · 1:2 + takip | 1647 | -0,063 | 1619 | -0,031 | +0,036 |
| ilk geri çekilme · stop 1 ATR · 1:3 | 649 | -0,079 | 672 | -0,038 | +0,060 |
| her geri çekilme · stop 2 ATR · 1:2 | 1164 | -0,081 | 1197 | +0,007 | +0,032 |
| her geri çekilme · stop 2 ATR · 1:1 | 1633 | -0,085 | 1651 | -0,050 | -0,009 |
| ilk geri çekilme · stop 1.5 ATR · 1:1.5 | 627 | -0,089 | 647 | -0,062 | +0,005 |
| ilk geri çekilme · stop 1.5 ATR · 1:1 | 632 | -0,095 | 660 | -0,113 | -0,028 |
| her geri çekilme · stop 1.5 ATR · 1:2 | 1679 | -0,097 | 1646 | -0,063 | -0,000 |
| ilk geri çekilme · stop 1 ATR · 1:2.5 | 649 | -0,122 | 673 | -0,041 | +0,035 |
| her geri çekilme · stop 1.5 ATR · 1:2.5 | 1546 | -0,127 | 1514 | -0,035 | +0,002 |
| her geri çekilme · stop 1 ATR · 1:2 + takip | 2369 | -0,127 | 2278 | -0,042 | +0,027 |
| her geri çekilme · stop 1.5 ATR · 1:1 | 2163 | -0,128 | 2111 | -0,093 | -0,037 |
| her geri çekilme · stop 1 ATR · 1:3 | 2130 | -0,128 | 2088 | -0,086 | +0,006 |
| her geri çekilme · stop 1.5 ATR · 1:1.5 | 1877 | -0,128 | 1843 | -0,060 | -0,017 |
| her geri çekilme · stop 1.5 ATR · 1:3 | 1406 | -0,129 | 1373 | -0,034 | +0,003 |
| ilk geri çekilme · stop 1 ATR · 1:2 + takip | 651 | -0,131 | 675 | +0,011 | +0,059 |
| ilk geri çekilme · stop 1 ATR · 1:2 | 651 | -0,132 | 675 | -0,065 | +0,016 |
| ilk geri çekilme · stop 1 ATR · 1:1.5 | 651 | -0,149 | 675 | -0,121 | -0,023 |
| her geri çekilme · stop 1 ATR · 1:2.5 | 2258 | -0,150 | 2191 | -0,067 | +0,001 |
| ilk geri çekilme · stop 1 ATR · 1:1 | 653 | -0,150 | 678 | -0,091 | -0,011 |
| her geri çekilme · stop 1 ATR · 1:2 | 2437 | -0,177 | 2344 | -0,108 | -0,035 |
| her geri çekilme · stop 1 ATR · 1:1.5 | 2606 | -0,182 | 2513 | -0,128 | -0,049 |
| her geri çekilme · stop 1 ATR · 1:1 | 2858 | -0,189 | 2769 | -0,113 | -0,046 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: ilk geri çekilme · stop 1.5 ATR · 1:2.5 → ilk yarı +0,153 R (133), ikinci yarı -0,001 R (148)
- 1h: her geri çekilme · stop 2 ATR · 1:3 → ilk yarı -0,007 R (582), ikinci yarı +0,014 R (592)
- 4h: her geri çekilme · stop 2 ATR · 1:3 → ilk yarı +0,196 R (150), ikinci yarı +0,056 R (160)

## Bollinger + Stokastik

**Seçilen (ilk yarıya göre):** dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant

- İlk yarı: 1369 işlem · net ort. -0,036 R
- **İkinci yarı (doğrulama): 1373 işlem · net ort. -0,007 R · kazanan %39 · t -0,2**
- Tüm veri: 2742 işlem · net -0,022 R (maliyetsiz +0,054 R) · PF 0,97 · ort. süre 12,5 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,093 · 149 · %25 | +0,241 · 129 · %16 | +0,056 · 111 · %16 | -0,068 · 142 · %19 |
| 1h | -0,131 · 510 · %52 | +0,019 · 412 · %33 | +0,014 · 370 · %24 | -0,087 · 418 · %35 |
| 4h | +0,124 · 138 · %16 | +0,000 · 129 · %10 | +0,041 · 110 · %10 | -0,040 · 124 · %16 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| dar bant < 1 × ort. · stop 1.5 ATR · hedef karşı bant | 1369 | -0,036 | 1373 | -0,007 | +0,054 |
| dar bant < 1 × ort. · stop 2 ATR · hedef karşı bant | 1259 | -0,036 | 1274 | -0,023 | +0,030 |
| bant filtresi yok · stop 2 ATR · 1:2 (seçilemez) | 1547 | -0,047 | 1669 | +0,017 | +0,054 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1 | 1272 | -0,050 | 1310 | -0,033 | +0,015 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1 | 1412 | -0,056 | 1445 | -0,023 | +0,029 |
| dar bant < 1 × ort. · stop 2 ATR · 1:1.5 | 1159 | -0,060 | 1239 | -0,040 | +0,011 |
| bant filtresi yok · stop 2 ATR · hedef karşı bant (seçilemez) | 2774 | -0,063 | 2731 | -0,059 | -0,000 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:1.5 | 1363 | -0,063 | 1404 | -0,029 | +0,027 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1 | 1687 | -0,064 | 1783 | -0,050 | +0,001 |
| dar bant < 1 × ort. · stop 1.5 ATR · 1:2 | 1292 | -0,065 | 1358 | -0,022 | +0,034 |
| dar bant < 0.8 × ort. · stop 2 ATR · hedef karşı bant | 1712 | -0,067 | 1716 | -0,045 | +0,004 |
| bant filtresi yok · stop 2 ATR · 1:1 (seçilemez) | 2442 | -0,072 | 2571 | -0,053 | -0,003 |
| bant filtresi yok · stop 1.5 ATR · 1:1 (seçilemez) | 3249 | -0,073 | 3293 | -0,076 | -0,000 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:2 | 1215 | -0,073 | 1369 | -0,010 | +0,027 |
| dar bant < 1 × ort. · stop 2 ATR · 1:2 | 1027 | -0,074 | 1111 | +0,020 | +0,041 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 | 1949 | -0,075 | 2024 | -0,058 | +0,005 |
| bant filtresi yok · stop 2 ATR · 1:1.5 (seçilemez) | 1899 | -0,078 | 2048 | -0,039 | +0,005 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1.5 | 1835 | -0,082 | 1933 | -0,059 | +0,005 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · hedef karşı bant | 1892 | -0,083 | 1894 | -0,045 | +0,013 |
| dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 | 1448 | -0,085 | 1602 | -0,055 | -0,007 |
| bant filtresi yok · stop 1.5 ATR · 1:1.5 (seçilemez) | 2741 | -0,085 | 2870 | -0,061 | +0,004 |
| dar bant < 0.8 × ort. · stop 1.5 ATR · 1:2 | 1687 | -0,086 | 1809 | -0,063 | +0,004 |
| bant filtresi yok · stop 1.5 ATR · hedef karşı bant (seçilemez) | 3166 | -0,087 | 3116 | -0,066 | +0,003 |
| bant filtresi yok · stop 1.5 ATR · 1:2 (seçilemez) | 2306 | -0,089 | 2467 | -0,057 | +0,008 |
| dar bant < 1 × ort. · stop 1 ATR · hedef karşı bant | 1512 | -0,101 | 1488 | -0,050 | +0,032 |
| dar bant < 1 × ort. · stop 1 ATR · 1:2 | 1525 | -0,123 | 1526 | -0,056 | +0,013 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1.5 | 1537 | -0,126 | 1546 | -0,067 | +0,002 |
| bant filtresi yok · stop 1 ATR · 1:1.5 (seçilemez) | 3811 | -0,131 | 3824 | -0,112 | -0,013 |
| dar bant < 1 × ort. · stop 1 ATR · 1:1 | 1565 | -0,136 | 1561 | -0,105 | -0,025 |
| dar bant < 0.8 × ort. · stop 1 ATR · hedef karşı bant | 2118 | -0,140 | 2095 | -0,079 | -0,001 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1.5 | 2157 | -0,145 | 2207 | -0,084 | -0,012 |
| bant filtresi yok · stop 1 ATR · hedef karşı bant (seçilemez) | 3712 | -0,146 | 3639 | -0,099 | -0,010 |
| bant filtresi yok · stop 1 ATR · 1:2 (seçilemez) | 3516 | -0,146 | 3571 | -0,092 | -0,009 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:2 | 2119 | -0,147 | 2156 | -0,069 | -0,002 |
| bant filtresi yok · stop 1 ATR · 1:1 (seçilemez) | 4071 | -0,155 | 4054 | -0,132 | -0,037 |
| dar bant < 0.8 × ort. · stop 1 ATR · 1:1 | 2216 | -0,156 | 2235 | -0,105 | -0,032 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: dar bant < 0.8 × ort. · stop 2 ATR · 1:1.5 → ilk yarı +0,009 R (291), ikinci yarı +0,005 R (303)
- 1h: dar bant < 1 × ort. · stop 2 ATR · 1:1 → ilk yarı -0,029 R (789), ikinci yarı -0,078 R (809)
- 4h: dar bant < 0.8 × ort. · stop 1.5 ATR · 1:1 → ilk yarı -0,048 R (335), ikinci yarı +0,000 R (365)

## Heikin Ashi Smoothed

**Seçilen (ilk yarıya göre):** stop 2 ATR · 1:2 + takip

- İlk yarı: 1091 işlem · net ort. +0,023 R
- **İkinci yarı (doğrulama): 1189 işlem · net ort. +0,008 R · kazanan %34 · t 0,2**
- Tüm veri: 2280 işlem · net +0,015 R (maliyetsiz +0,086 R) · PF 1,02 · ort. süre 24,9 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | +0,119 · 115 · %14 | -0,156 · 136 · %23 | +0,023 · 109 · %18 | +0,076 · 107 · %8 |
| 1h | +0,001 · 401 · %31 | +0,020 · 359 · %23 | +0,016 · 349 · %28 | +0,014 · 294 · %18 |
| 4h | +0,217 · 117 · %16 | -0,038 · 105 · %16 | -0,132 · 110 · %17 | +0,099 · 78 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| stop 2 ATR · 1:2 + takip | 1091 | +0,023 | 1189 | +0,008 | +0,086 |
| stop 2 ATR · renk dönünce çıkış | 2273 | +0,014 | 2247 | +0,008 | +0,081 |
| stop 3 ATR · renk dönünce çıkış | 2273 | +0,010 | 2246 | +0,004 | +0,054 |
| stop 2 ATR · 1:2 | 1116 | -0,004 | 1202 | -0,035 | +0,048 |
| stop 1.5 ATR · renk dönünce çıkış | 2273 | -0,005 | 2249 | +0,026 | +0,101 |
| stop 1 ATR · renk dönünce çıkış | 2273 | -0,006 | 2251 | +0,042 | +0,147 |
| stop 2 ATR · 1:1.5 | 1295 | -0,011 | 1351 | -0,010 | +0,053 |
| stop 2 ATR · 1:1 | 1523 | -0,026 | 1569 | -0,058 | +0,017 |
| stop 2 ATR · 1:3 | 863 | -0,038 | 920 | -0,113 | +0,003 |
| stop 3 ATR · 1:3 | 451 | -0,049 | 447 | -0,173 | -0,033 |
| stop 3 ATR · 1:1 | 963 | -0,057 | 1022 | -0,043 | -0,003 |
| stop 1 ATR · 1:2 + takip | 2030 | -0,059 | 2043 | +0,046 | +0,109 |
| stop 3 ATR · 1:2 + takip | 582 | -0,081 | 642 | -0,082 | -0,018 |
| stop 1.5 ATR · 1:2 + takip | 1554 | -0,082 | 1587 | +0,073 | +0,081 |
| stop 3 ATR · 1:2 | 615 | -0,083 | 651 | -0,107 | -0,033 |
| stop 1.5 ATR · 1:1.5 | 1728 | -0,094 | 1761 | -0,018 | +0,022 |
| stop 1.5 ATR · 1:1 | 1899 | -0,095 | 1926 | -0,057 | -0,001 |
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
| stop 1 ATR · 1:3 | 450 | -0,075 | 425 | -0,031 | +0,061 |
| stop 1 ATR · hedef formasyon yüksekliği | 415 | -0,080 | 388 | +0,016 | +0,105 |
| stop 1.5 ATR · 1:2 | 403 | -0,081 | 388 | -0,031 | +0,024 |
| stop 2 ATR · hedef formasyon yüksekliği | 326 | -0,083 | 306 | -0,164 | -0,036 |
| stop 1.5 ATR · 1:1.5 | 410 | -0,090 | 398 | -0,054 | +0,006 |
| stop 1 ATR · 1:2 + takip | 456 | -0,097 | 433 | -0,007 | +0,061 |
| stop 2 ATR · 1:3 | 329 | -0,113 | 328 | -0,050 | -0,002 |
| stop 1 ATR · 1:1.5 | 462 | -0,129 | 439 | -0,050 | +0,018 |
| stop 1 ATR · 1:2 | 457 | -0,131 | 434 | -0,028 | +0,030 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: stop 1.5 ATR · 1:1.5 → ilk yarı -0,152 R (83), ikinci yarı -0,185 R (76)
- 1h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,109 R (236), ikinci yarı -0,006 R (203)
- 4h: stop 1.5 ATR · hedef formasyon yüksekliği → ilk yarı +0,280 R (52), ikinci yarı -0,361 R (67)

## EMA 20/50 + hacim + Heikin Ashi

**Seçilen (ilk yarıya göre):** RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR

- İlk yarı: 1445 işlem · net ort. +0,013 R
- **İkinci yarı (doğrulama): 1523 işlem · net ort. -0,045 R · kazanan %25 · t -1,1**
- Tüm veri: 2968 işlem · net -0,016 R (maliyetsiz +0,069 R) · PF 0,96 · ort. süre 9,2 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,019 · 284 · %32 | -0,090 · 103 · %17 | +0,113 · 87 · %15 | -0,056 · 110 · %16 |
| 1h | -0,012 · 793 · %39 | -0,182 · 415 · %59 | -0,056 · 313 · %33 | +0,107 · 315 · %13 |
| 4h | +0,048 · 187 · %19 | -0,003 · 119 · %16 | +0,074 · 124 · %12 | +0,115 · 118 · %10 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1445 | +0,013 | 1523 | -0,045 | +0,069 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1440 | +0,011 | 1516 | -0,042 | +0,048 |
| RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1434 | +0,003 | 1505 | -0,027 | +0,031 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR | 1790 | -0,002 | 1809 | -0,051 | +0,056 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 2 ATR | 1785 | -0,002 | 1802 | -0,047 | +0,038 |
| RSI yok · çıkış EMA 20 altı kapanış · acil stop 3 ATR | 1779 | -0,005 | 1791 | -0,031 | +0,024 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 3 ATR | 1703 | -0,010 | 1813 | -0,046 | +0,011 |
| RSI yok · çıkış EMA 20 teması · acil stop 3 ATR | 2060 | -0,015 | 2105 | -0,046 | +0,008 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 2 ATR | 1703 | -0,019 | 1813 | -0,068 | +0,015 |
| RSI 50 filtresi · çıkış EMA 20 teması · acil stop 1.5 ATR | 1703 | -0,023 | 1812 | -0,089 | +0,022 |
| RSI yok · çıkış EMA 20 teması · acil stop 2 ATR | 2060 | -0,026 | 2105 | -0,068 | +0,011 |
| RSI yok · çıkış EMA 20 teması · acil stop 1.5 ATR | 2060 | -0,032 | 2104 | -0,088 | +0,017 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 3 ATR → ilk yarı -0,036 R (289), ikinci yarı -0,005 R (293)
- 1h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 2 ATR → ilk yarı -0,003 R (888), ikinci yarı -0,054 R (939)
- 4h: RSI 50 filtresi · çıkış EMA 20 altı kapanış · acil stop 1.5 ATR → ilk yarı +0,164 R (264), ikinci yarı -0,042 R (284)
