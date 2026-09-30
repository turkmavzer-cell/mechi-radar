# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5621 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17144 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4440 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4502 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13741 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3718 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4513 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13720 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4515 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13756 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3720 | var |

## EMA 21/55 kırılım · EMA 55 çıkışı

**Seçilen (ilk yarıya göre):** kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 55'e değince çıkış

- İlk yarı: 510 işlem · net ort. -0,074 R
- **İkinci yarı (doğrulama): 530 işlem · net ort. -0,043 R · kazanan %24 · t -0,6**
- Tüm veri: 1040 işlem · net -0,058 R (maliyetsiz +0,015 R) · PF 0,86 · ort. süre 18,9 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,106 · 65 · %14 | -0,144 · 65 · %20 | +0,277 · 53 · %8 | -0,035 · 48 · %7 |
| 1h | +0,012 · 180 · %15 | -0,229 · 161 · %31 | -0,158 · 150 · %30 | -0,017 · 146 · %20 |
| 4h | +0,139 · 43 · %10 | -0,296 · 45 · %13 | +0,058 · 42 · %5 | +0,204 · 42 · %5 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 55'e değince çıkış | 510 | -0,074 | 530 | -0,043 | +0,015 |
| kesişim başına 1 · stop dibin altı (en az 0.5 ATR) · EMA 55'e değince çıkış | 510 | -0,085 | 530 | -0,045 | +0,012 |
| her geri çekilme · stop dibin altı (en az 1 ATR) · EMA 55'e değince çıkış (seçilemez) | 1330 | -0,095 | 1298 | -0,072 | -0,010 |
| her geri çekilme · stop dibin altı (en az 0.5 ATR) · EMA 55'e değince çıkış (seçilemez) | 1330 | -0,105 | 1298 | -0,081 | -0,015 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 55'e değince çıkış → ilk yarı -0,093 R (114), ikinci yarı +0,063 R (117)
- 1h: kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 55'e değince çıkış → ilk yarı -0,120 R (315), ikinci yarı -0,072 R (322)
- 4h: kesişim başına 1 · stop dibin altı (en az 1 ATR) · EMA 55'e değince çıkış → ilk yarı +0,132 R (81), ikinci yarı -0,077 R (91)
