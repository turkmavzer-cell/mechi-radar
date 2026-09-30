# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5628 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17133 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4439 | yok |
| USDJPY | 1d | 2016-09-29 – 2026-09-28 | 2600 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4509 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13720 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |
| Japan 225 | 1d | 2016-09-30 – 2026-09-29 | 2512 | yok |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4520 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13690 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3706 | var |
| Nasdaq 100 | 1d | 2016-09-30 – 2026-09-29 | 2513 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4522 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13729 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3716 | var |
| Altın | 1d | 2016-09-30 – 2026-09-29 | 2512 | var |

## TRF + Supertrend · ATR kâr al

**Seçilen (ilk yarıya göre):** 2 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır)

- İlk yarı: 2432 işlem · net ort. -0,016 R
- **İkinci yarı (doğrulama): 2456 işlem · net ort. -0,006 R · kazanan %42 · t -0,5**
- Tüm veri: 4888 işlem · net -0,011 R (maliyetsiz +0,024 R) · PF 0,96 · ort. süre 8,3 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,103 · 254 · %25 | -0,002 · 213 · %10 | -0,011 · 210 · %13 | -0,000 · 220 · %7 |
| 1h | +0,026 · 769 · %14 | -0,081 · 695 · %44 | -0,036 · 680 · %27 | +0,011 · 625 · %10 |
| 4h | +0,026 · 198 · %5 | +0,047 · 181 · %7 | -0,001 · 176 · %12 | +0,051 · 173 · %6 |
| 1d | -0,034 · 118 · %7 | +0,002 · 141 · %9 | +0,045 · 120 · %3 | +0,058 · 115 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| 2 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) | 2432 | -0,016 | 2456 | -0,006 | +0,024 |
| 1 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) | 2432 | -0,019 | 2457 | -0,003 | +0,021 |
| 1.5 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) | 2432 | -0,025 | 2456 | -0,008 | +0,018 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: 1 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) → ilk yarı +0,004 R (446), ikinci yarı -0,045 R (451)
- 1h: 2 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) → ilk yarı -0,022 R (1383), ikinci yarı -0,016 R (1386)
- 4h: 2 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) → ilk yarı +0,002 R (354), ikinci yarı +0,058 R (374)
- 1d: 1 ATR kârdan sonra ilk ters mumda kâr al (TRF ters sinyali de kâr aldırır) → ilk yarı +0,004 R (249), ikinci yarı +0,051 R (245)

## TRF + Supertrend · ek yöntem

**Seçilen (ilk yarıya göre):** TRF kâr alı ancak 1R kârdan sonra

- İlk yarı: 1455 işlem · net ort. -0,008 R
- **İkinci yarı (doğrulama): 1432 işlem · net ort. -0,002 R · kazanan %41 · t -0,1**
- Tüm veri: 2887 işlem · net -0,005 R (maliyetsiz +0,045 R) · PF 0,99 · ort. süre 30,6 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,144 · 140 · %21 | -0,083 · 131 · %12 | -0,062 · 126 · %14 | -0,016 · 127 · %15 |
| 1h | +0,072 · 440 · %18 | -0,105 · 420 · %43 | +0,009 · 420 · %22 | +0,092 · 351 · %12 |
| 4h | +0,027 · 120 · %14 | +0,028 · 96 · %7 | -0,019 · 116 · %13 | +0,127 · 99 · %7 |
| 1d | -0,033 · 60 · %8 | -0,160 · 112 · %19 | -0,033 · 67 · %7 | +0,122 · 62 · %6 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| karşılaştırma: kullanıcı kuralı (filtre yok) (seçilemez) | 2432 | -0,005 | 2454 | -0,001 | +0,036 |
| TRF kâr alı ancak 1R kârdan sonra | 1455 | -0,008 | 1432 | -0,002 | +0,045 |
| ADX ≥ 25 iken giriş | 730 | -0,009 | 771 | -0,019 | +0,018 |
| ADX ≥ 20 iken giriş | 1293 | -0,018 | 1375 | -0,001 | +0,025 |
| tekrar girişte yeni dip/tepe şartı | 1045 | -0,032 | 1077 | -0,035 | -0,002 |
| tekrar girişte yeni dip/tepe + TRF kâr alı ancak 1R kârdan sonra | 964 | -0,044 | 976 | -0,017 | +0,014 |
| ADX ≥ 20 + yeni dip/tepe + TRF kâr alı 1R kârdan sonra | 693 | -0,052 | 752 | -0,021 | +0,008 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: ADX ≥ 25 iken giriş → ilk yarı +0,066 R (149), ikinci yarı +0,059 R (127)
- 1h: TRF kâr alı ancak 1R kârdan sonra → ilk yarı +0,013 R (822), ikinci yarı +0,016 R (809)
- 4h: TRF kâr alı ancak 1R kârdan sonra → ilk yarı +0,022 R (219), ikinci yarı +0,054 R (212)
- 1d: tekrar girişte yeni dip/tepe şartı → ilk yarı -0,045 R (135), ikinci yarı -0,046 R (114)
