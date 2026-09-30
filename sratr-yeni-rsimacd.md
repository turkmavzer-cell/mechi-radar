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

## RSI + MACD

**Seçilen (ilk yarıya göre):** RSI keser, MACD 0 üstünde · stop 2 ATR · 1:2 + takip

- İlk yarı: 853 işlem · net ort. -0,011 R
- **İkinci yarı (doğrulama): 865 işlem · net ort. +0,011 R · kazanan %34 · t 0,2**
- Tüm veri: 1718 işlem · net -0,000 R (maliyetsiz +0,072 R) · PF 1,00 · ort. süre 23,3 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 15m | -0,108 · 90 · %18 | -0,284 · 91 · %26 | +0,185 · 74 · %13 | +0,117 · 80 · %14 |
| 1h | -0,018 · 322 · %31 | -0,022 · 271 · %26 | +0,098 · 262 · %28 | +0,034 · 245 · %14 |
| 4h | +0,013 · 79 · %17 | -0,009 · 66 · %10 | +0,044 · 68 · %9 | -0,183 · 70 · %15 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| RSI keser, MACD 0 üstünde · stop 2 ATR · 1:2 + takip | 853 | -0,011 | 865 | +0,011 | +0,072 |
| RSI keser, MACD 0 üstünde · stop 2 ATR · RSI 50'nin ters tarafına geçince çıkış | 1907 | -0,023 | 1916 | -0,011 | +0,045 |
| hangisi son keserse · stop 2 ATR · RSI 50'nin ters tarafına geçince çıkış | 3218 | -0,025 | 3186 | -0,018 | +0,042 |
| hangisi son keserse · stop 1.5 ATR · RSI 50'nin ters tarafına geçince çıkış | 3193 | -0,032 | 3157 | -0,017 | +0,060 |
| RSI keser, MACD 0 üstünde · stop 1.5 ATR · RSI 50'nin ters tarafına geçince çıkış | 1892 | -0,035 | 1900 | -0,008 | +0,060 |
| RSI keser, MACD 0 üstünde · stop 2 ATR · 1:1.5 | 939 | -0,037 | 978 | -0,016 | +0,038 |
| hangisi son keserse · stop 2 ATR · 1:2 + takip | 1124 | -0,038 | 1144 | -0,004 | +0,050 |
| RSI keser, MACD 0 üstünde · stop 2 ATR · 1:2 | 859 | -0,038 | 869 | -0,028 | +0,036 |
| RSI keser, MACD 0 üstünde · stop 1.5 ATR · 1:2 + takip | 1072 | -0,052 | 1097 | -0,009 | +0,054 |
| hangisi son keserse · stop 2 ATR · 1:2 | 1132 | -0,054 | 1152 | -0,034 | +0,025 |
| hangisi son keserse · stop 2 ATR · 1:1.5 | 1296 | -0,055 | 1310 | +0,003 | +0,038 |
| hangisi son keserse · stop 1 ATR · RSI 50'nin ters tarafına geçince çıkış | 3149 | -0,061 | 3134 | -0,027 | +0,079 |
| hangisi son keserse · stop 1.5 ATR · 1:2 + takip | 1606 | -0,062 | 1634 | -0,009 | +0,048 |
| hangisi son keserse · stop 2 ATR · 1:1 | 1520 | -0,065 | 1504 | -0,051 | +0,002 |
| hangisi son keserse · stop 2 ATR · 1:3 | 897 | -0,080 | 868 | -0,035 | +0,020 |
| RSI keser, MACD 0 üstünde · stop 1.5 ATR · 1:2 | 1079 | -0,080 | 1100 | -0,030 | +0,027 |
| RSI keser, MACD 0 üstünde · stop 2 ATR · 1:1 | 1068 | -0,086 | 1077 | -0,068 | -0,016 |
| RSI keser, MACD 0 üstünde · stop 2 ATR · 1:3 | 700 | -0,091 | 728 | -0,066 | +0,000 |
| RSI keser, MACD 0 üstünde · stop 1 ATR · RSI 50'nin ters tarafına geçince çıkış | 1867 | -0,093 | 1886 | -0,016 | +0,066 |
| hangisi son keserse · stop 1.5 ATR · 1:2 | 1615 | -0,099 | 1640 | -0,038 | +0,012 |
| hangisi son keserse · stop 1.5 ATR · 1:1 | 1988 | -0,100 | 1987 | -0,101 | -0,026 |
| hangisi son keserse · stop 1.5 ATR · 1:1.5 | 1775 | -0,110 | 1806 | -0,054 | -0,004 |
| hangisi son keserse · stop 1.5 ATR · 1:3 | 1367 | -0,116 | 1369 | -0,031 | +0,013 |
| RSI keser, MACD 0 üstünde · stop 1.5 ATR · 1:1.5 | 1166 | -0,119 | 1173 | -0,061 | -0,011 |
| RSI keser, MACD 0 üstünde · stop 1 ATR · 1:3 | 1306 | -0,120 | 1305 | -0,044 | +0,034 |
| RSI keser, MACD 0 üstünde · stop 1.5 ATR · 1:3 | 960 | -0,127 | 974 | -0,059 | -0,003 |
| RSI keser, MACD 0 üstünde · stop 1.5 ATR · 1:1 | 1258 | -0,130 | 1266 | -0,110 | -0,044 |
| hangisi son keserse · stop 1 ATR · 1:2 + takip | 2346 | -0,132 | 2306 | -0,017 | +0,041 |
| hangisi son keserse · stop 1 ATR · 1:3 | 2154 | -0,134 | 2144 | -0,027 | +0,034 |
| hangisi son keserse · stop 1 ATR · 1:1 | 2599 | -0,142 | 2550 | -0,135 | -0,030 |
| hangisi son keserse · stop 1 ATR · 1:1.5 | 2473 | -0,144 | 2443 | -0,118 | -0,021 |
| RSI keser, MACD 0 üstünde · stop 1 ATR · 1:1.5 | 1466 | -0,160 | 1446 | -0,132 | -0,035 |
| RSI keser, MACD 0 üstünde · stop 1 ATR · 1:1 | 1534 | -0,161 | 1515 | -0,160 | -0,051 |
| RSI keser, MACD 0 üstünde · stop 1 ATR · 1:2 + takip | 1409 | -0,163 | 1381 | -0,018 | +0,026 |
| hangisi son keserse · stop 1 ATR · 1:2 | 2365 | -0,169 | 2317 | -0,097 | -0,022 |
| RSI keser, MACD 0 üstünde · stop 1 ATR · 1:2 | 1420 | -0,178 | 1386 | -0,105 | -0,029 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 15m: RSI keser, MACD 0 üstünde · stop 2 ATR · RSI 50'nin ters tarafına geçince çıkış → ilk yarı -0,004 R (409), ikinci yarı -0,087 R (373)
- 1h: RSI keser, MACD 0 üstünde · stop 2 ATR · 1:2 + takip → ilk yarı -0,012 R (553), ikinci yarı +0,052 R (547)
- 4h: RSI keser, MACD 0 üstünde · stop 2 ATR · 1:3 → ilk yarı +0,102 R (107), ikinci yarı -0,275 R (121)
