# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5620 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17131 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4438 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4501 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13718 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3713 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4512 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13688 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3705 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4514 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13727 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3715 | var |

## EMA 21/55 kırılım · EMA 21 çıkışı

**Seçilen (ilk yarıya göre):** her geri çekilme · stop dibin altı (en az 1 ATR) · EMA 21 altı kapanışta çıkış

- İlk yarı: 1351 işlem · net ort. -0,026 R
- **İkinci yarı (doğrulama): 1375 işlem · net ort. -0,042 R · kazanan %27 · t -1,1**
- Tüm veri: 2726 işlem · net -0,034 R (maliyetsiz +0,035 R) · PF 0,92 · ort. süre 11,8 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,090 · 163 · %26 | -0,085 · 134 · %24 | -0,038 · 134 · %26 | +0,001 · 125 · %20 |
| 1h | -0,042 · 504 · %41 | -0,104 · 415 · %46 | -0,028 · 378 · %25 | +0,091 · 406 · %20 |
| 4h | -0,043 · 126 · %15 | -0,203 · 127 · %23 | -0,084 · 106 · %16 | +0,146 · 108 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · sabit 1:2 (karşılaştırma) (seçilemez) | 428 | +0,015 | 451 | -0,085 | +0,044 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · sabit 1:2 (karşılaştırma) (seçilemez) | 428 | +0,005 | 450 | -0,093 | +0,032 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · sabit 1:2 (karşılaştırma) (seçilemez) | 695 | -0,008 | 670 | -0,031 | +0,059 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · sabit 1:3 (karşılaştırma) (seçilemez) | 561 | -0,022 | 539 | -0,069 | +0,044 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · sabit 1:2 (karşılaştırma) (seçilemez) | 690 | -0,022 | 657 | -0,049 | +0,040 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · EMA 21 altı kapanışta çıkış | 1351 | -0,026 | 1375 | -0,042 | +0,035 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · EMA 21 altı kapanışta çıkış | 1353 | -0,030 | 1376 | -0,044 | +0,037 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 21 altı kapanışta çıkış | 510 | -0,032 | 528 | -0,050 | +0,028 |
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · EMA 21 altı kapanışta çıkış | 510 | -0,033 | 528 | -0,050 | +0,031 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · sabit 1:3 (karşılaştırma) (seçilemez) | 559 | -0,036 | 531 | -0,036 | +0,050 |
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · sabit 1:3 (karşılaştırma) (seçilemez) | 387 | -0,052 | 397 | -0,140 | -0,005 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · sabit 1:3 (karşılaştırma) (seçilemez) | 387 | -0,059 | 396 | -0,103 | +0,006 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: her geri çekilme · stop dibin altı (en az 1 ATR) · EMA 21 altı kapanışta çıkış → ilk yarı +0,002 R (287), ikinci yarı -0,118 R (269)
- 1h: kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · EMA 21 altı kapanışta çıkış → ilk yarı +0,007 R (316), ikinci yarı -0,058 R (318)
- 4h: kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 21 altı kapanışta çıkış → ilk yarı +0,031 R (80), ikinci yarı -0,120 R (92)

## EMA 21/55 kırılım · kârdan sonra EMA 21 çıkışı

**Seçilen (ilk yarıya göre):** kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · 1R kârdan sonra EMA 21 altı kapanışta çıkış

- İlk yarı: 469 işlem · net ort. +0,081 R
- **İkinci yarı (doğrulama): 502 işlem · net ort. -0,096 R · kazanan %35 · t -1,2**
- Tüm veri: 971 işlem · net -0,011 R (maliyetsiz +0,070 R) · PF 0,98 · ort. süre 26,0 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,225 · 58 · %21 | +0,063 · 63 · %16 | -0,102 · 48 · %15 | +0,350 · 39 · %5 |
| 1h | +0,001 · 167 · %23 | -0,116 · 146 · %20 | +0,083 · 146 · %25 | +0,046 · 136 · %17 |
| 4h | +0,087 · 43 · %9 | -0,375 · 44 · %16 | -0,041 · 41 · %12 | +0,073 · 40 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · 1R kârdan sonra EMA 21 altı kapanışta çıkış | 469 | +0,081 | 502 | -0,096 | +0,070 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · 1R kârdan sonra EMA 21 altı kapanışta çıkış | 469 | +0,071 | 501 | -0,066 | +0,077 |
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · 2R kârdan sonra EMA 21 altı kapanışta çıkış | 428 | +0,065 | 451 | -0,068 | +0,085 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · 1.5R kârdan sonra EMA 21 altı kapanışta çıkış | 447 | +0,054 | 482 | -0,075 | +0,068 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · 2R kârdan sonra EMA 21 altı kapanışta çıkış | 428 | +0,052 | 450 | -0,029 | +0,095 |
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · 1.5R kârdan sonra EMA 21 altı kapanışta çıkış | 447 | +0,050 | 483 | -0,109 | +0,052 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · 1R kârdan sonra EMA 21 altı kapanışta çıkış | 856 | +0,045 | 886 | -0,026 | +0,088 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · 1R kârdan sonra EMA 21 altı kapanışta çıkış | 852 | +0,037 | 876 | -0,026 | +0,079 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · 1.5R kârdan sonra EMA 21 altı kapanışta çıkış | 756 | +0,036 | 784 | -0,058 | +0,072 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · 1.5R kârdan sonra EMA 21 altı kapanışta çıkış | 746 | +0,032 | 771 | -0,070 | +0,059 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · 2R kârdan sonra EMA 21 altı kapanışta çıkış | 675 | +0,031 | 641 | -0,038 | +0,084 |
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · 0.5R kârdan sonra EMA 21 altı kapanışta çıkış | 493 | +0,017 | 520 | -0,071 | +0,049 |
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · 0.5R kârdan sonra EMA 21 altı kapanışta çıkış | 493 | +0,012 | 519 | -0,044 | +0,057 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · 2R kârdan sonra EMA 21 altı kapanışta çıkış | 669 | +0,011 | 627 | -0,051 | +0,064 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · 0.5R kârdan sonra EMA 21 altı kapanışta çıkış | 1053 | -0,003 | 1064 | -0,038 | +0,056 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · 0.5R kârdan sonra EMA 21 altı kapanışta çıkış | 1046 | -0,004 | 1055 | -0,040 | +0,051 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: her geri çekilme · stop dibin altı (en az 1 ATR) · 1R kârdan sonra EMA 21 altı kapanışta çıkış → ilk yarı +0,168 R (166), ikinci yarı -0,059 R (162)
- 1h: kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · 2R kârdan sonra EMA 21 altı kapanışta çıkış → ilk yarı +0,073 R (274), ikinci yarı -0,022 R (278)
- 4h: kesişim başına 1 · stop dibin altı (en az 1 ATR) · 1.5R kârdan sonra EMA 21 altı kapanışta çıkış → ilk yarı +0,109 R (75), ikinci yarı -0,222 R (87)
