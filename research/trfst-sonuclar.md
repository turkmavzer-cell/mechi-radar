# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5627 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17133 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4439 | yok |
| USDJPY | 1d | 2016-09-29 – 2026-09-28 | 2600 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4508 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13720 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |
| Japan 225 | 1d | 2016-09-30 – 2026-09-29 | 2512 | yok |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4519 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13690 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3706 | var |
| Nasdaq 100 | 1d | 2016-09-30 – 2026-09-29 | 2513 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4521 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13729 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3716 | var |
| Altın | 1d | 2016-09-30 – 2026-09-29 | 2512 | var |

## TRF + Supertrend (kullanıcı kuralı)

**Seçilen (ilk yarıya göre):** Kullanıcı kuralı: TRF Long/Short ile giriş, TRF ters sinyalde kâr al, Supertrend çizgisi stop

- İlk yarı: 2432 işlem · net ort. -0,005 R
- **İkinci yarı (doğrulama): 2453 işlem · net ort. -0,001 R · kazanan %35 · t -0,0**
- Tüm veri: 4885 işlem · net -0,003 R (maliyetsiz +0,036 R) · PF 0,99 · ort. süre 12,7 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,058 · 253 · %20 | -0,038 · 213 · %14 | -0,019 · 210 · %12 | -0,011 · 220 · %14 |
| 1h | +0,036 · 769 · %15 | -0,063 · 694 · %39 | -0,024 · 680 · %27 | +0,059 · 625 · %11 |
| 4h | +0,052 · 198 · %8 | +0,001 · 180 · %11 | -0,011 · 176 · %15 | +0,063 · 173 · %6 |
| 1d | -0,019 · 118 · %8 | -0,071 · 141 · %11 | -0,025 · 120 · %7 | +0,065 · 115 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| Kullanıcı kuralı: TRF Long/Short ile giriş, TRF ters sinyalde kâr al, Supertrend çizgisi stop | 2432 | -0,005 | 2453 | -0,001 | +0,036 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: Kullanıcı kuralı: TRF Long/Short ile giriş, TRF ters sinyalde kâr al, Supertrend çizgisi stop → ilk yarı -0,010 R (446), ikinci yarı -0,054 R (450)
- 1h: Kullanıcı kuralı: TRF Long/Short ile giriş, TRF ters sinyalde kâr al, Supertrend çizgisi stop → ilk yarı -0,003 R (1383), ikinci yarı +0,006 R (1385)
- 4h: Kullanıcı kuralı: TRF Long/Short ile giriş, TRF ters sinyalde kâr al, Supertrend çizgisi stop → ilk yarı +0,025 R (354), ikinci yarı +0,028 R (373)
- 1d: Kullanıcı kuralı: TRF Long/Short ile giriş, TRF ters sinyalde kâr al, Supertrend çizgisi stop → ilk yarı -0,050 R (249), ikinci yarı +0,019 R (245)
