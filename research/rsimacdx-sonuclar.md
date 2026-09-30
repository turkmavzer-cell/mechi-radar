# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 15m | 2026-07-08 – 2026-09-30 | 5619 | yok |
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17131 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4438 | yok |
| Japan 225 | 15m | 2026-07-22 – 2026-09-30 | 4500 | var |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13718 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3713 | var |
| Nasdaq 100 | 15m | 2026-07-22 – 2026-09-30 | 4511 | var |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13688 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3705 | var |
| Altın | 15m | 2026-07-22 – 2026-09-30 | 4513 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13727 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3715 | var |

## RSI + MACD · RSI üst/alt çizgide çıkış

**Seçilen (ilk yarıya göre):** RSI 70/30 çizgisinde çıkış · acil stop 3 ATR

- İlk yarı: 718 işlem · net ort. -0,004 R
- **İkinci yarı (doğrulama): 685 işlem · net ort. -0,074 R · kazanan %42 · t -1,6**
- Tüm veri: 1403 işlem · net -0,038 R (maliyetsiz +0,014 R) · PF 0,93 · ort. süre 29,9 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,134 · 75 · %14 | -0,085 · 71 · %12 | -0,068 · 64 · %11 | +0,306 · 65 · %4 |
| 1h | -0,080 · 260 · %31 | -0,066 · 217 · %25 | -0,069 · 227 · %24 | +0,038 · 200 · %10 |
| 4h | +0,066 · 56 · %5 | -0,113 · 54 · %13 | -0,100 · 58 · %13 | -0,022 · 56 · %7 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI 70/30 çizgisinde çıkış · acil stop 3 ATR | 718 | -0,004 | 685 | -0,074 | +0,014 |
| RSI 80/20 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 3 ATR (seçilemez) | 1926 | -0,019 | 1932 | -0,013 | +0,024 |
| RSI 80/20 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 2 ATR (seçilemez) | 1907 | -0,029 | 1916 | -0,021 | +0,035 |
| RSI 70/30 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 3 ATR | 1926 | -0,033 | 1934 | -0,026 | +0,009 |
| RSI 65/35 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 3 ATR (seçilemez) | 1926 | -0,036 | 1936 | -0,021 | +0,009 |
| RSI 70/30 çizgisinde çıkış · acil stop 2 ATR | 871 | -0,040 | 854 | -0,065 | +0,017 |
| RSI 65/35 çizgisinde çıkış · acil stop 3 ATR (seçilemez) | 868 | -0,040 | 889 | -0,046 | +0,002 |
| RSI 80/20 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 1.5 ATR (seçilemez) | 1892 | -0,046 | 1900 | -0,021 | +0,047 |
| RSI 70/30 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 2 ATR | 1907 | -0,048 | 1918 | -0,040 | +0,014 |
| RSI 65/35 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 2 ATR (seçilemez) | 1907 | -0,050 | 1920 | -0,034 | +0,014 |
| RSI 65/35 çizgisinde çıkış · acil stop 2 ATR (seçilemez) | 1015 | -0,073 | 1037 | -0,025 | +0,014 |
| RSI 70/30 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 1.5 ATR | 1892 | -0,074 | 1902 | -0,041 | +0,019 |
| RSI 65/35 çizgisinde çıkış (veya RSI 50 ters tarafa geçince) · acil stop 1.5 ATR (seçilemez) | 1892 | -0,076 | 1904 | -0,036 | +0,019 |
| RSI 65/35 çizgisinde çıkış · acil stop 1.5 ATR (seçilemez) | 1137 | -0,129 | 1153 | -0,038 | -0,004 |
| RSI 70/30 çizgisinde çıkış · acil stop 1.5 ATR | 1007 | -0,130 | 984 | -0,060 | -0,009 |
| RSI 80/20 çizgisinde çıkış · acil stop 3 ATR (seçilemez) | 417 | -0,196 | 358 | -0,091 | -0,058 |
| RSI 80/20 çizgisinde çıkış · acil stop 2 ATR (seçilemez) | 561 | -0,200 | 502 | -0,004 | -0,002 |
| RSI 80/20 çizgisinde çıkış · acil stop 1.5 ATR (seçilemez) | 714 | -0,321 | 619 | -0,006 | -0,055 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI 70/30 çizgisinde çıkış · acil stop 3 ATR → ilk yarı +0,061 R (142), ikinci yarı -0,069 R (133)
- 1h: RSI 70/30 çizgisinde çıkış · acil stop 3 ATR → ilk yarı -0,017 R (463), ikinci yarı -0,081 R (441)
- 4h: RSI 70/30 çizgisinde çıkış · acil stop 2 ATR → ilk yarı -0,003 R (140), ikinci yarı -0,140 R (143)
