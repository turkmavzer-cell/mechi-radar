# Yeni 5 strateji: stop/hedef testi (maliyet dahil)

Bu dosya `research/yeni-stratejiler.ts` ile otomatik üretildi. Maliyetler: `ODAK-4S-15DK-KURAL.md` ile aynı varsayımlar.
Seçim yalnızca verinin **ilk yarısıyla** yapıldı (4 enstrüman × 15dk/1s/4s, tüm işlemler birlikte); ikinci yarı doğrulama.

## Veri

| Enstrüman | Zaman dilimi | Dönem | Mum | Hacim |
|---|---|---|---|---|
| USDJPY | 1h | 2023-12-14 – 2026-09-30 | 17144 | yok |
| USDJPY | 4h | 2023-12-14 – 2026-09-30 | 4440 | yok |
| USDJPY | 1d | 2016-09-29 – 2026-09-28 | 2600 | yok |
| Japan 225 | 1h | 2024-05-08 – 2026-09-30 | 13719 | var |
| Japan 225 | 4h | 2024-05-08 – 2026-09-30 | 3713 | var |
| Japan 225 | 1d | 2016-09-30 – 2026-09-29 | 2512 | yok |
| Nasdaq 100 | 1h | 2024-05-08 – 2026-09-30 | 13720 | var |
| Nasdaq 100 | 4h | 2024-05-08 – 2026-09-30 | 3714 | var |
| Nasdaq 100 | 1d | 2016-09-30 – 2026-09-29 | 2513 | var |
| Altın | 1h | 2024-05-08 – 2026-09-30 | 13756 | var |
| Altın | 4h | 2024-05-08 – 2026-09-30 | 3720 | var |
| Altın | 1d | 2016-09-30 – 2026-09-29 | 2512 | var |

## Twin Range Filter + Supertrend

**Seçilen (ilk yarıya göre):** Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış

- İlk yarı: 414 işlem · net ort. +0,006 R
- **İkinci yarı (doğrulama): 416 işlem · net ort. +0,139 R · kazanan %37 · t 1,8**
- Tüm veri: 830 işlem · net +0,073 R (maliyetsiz +0,154 R) · PF 1,15 · ort. süre 37,7 mum

Seçilen ayarın enstrüman × zaman dilimi dökümü (net ort. R · işlem · en büyük düşüş %1 riskte):

| Zaman dilimi | USDJPY | Japan 225 | Nasdaq 100 | Altın |
|---|---|---|---|---|
| 1h | +0,095 · 160 · %15 | -0,047 · 144 · %19 | -0,096 · 160 · %20 | +0,323 · 115 · %6 |
| 4h | -0,082 · 41 · %10 | +0,029 · 34 · %6 | +0,166 · 38 · %2 | +0,250 · 32 · %6 |
| 1d | -0,193 · 19 · %5 | +0,002 · 49 · %9 | +0,783 · 16 · %2 | +0,413 · 22 · %4 |

<details><summary>Tüm seçenekler (ilk yarıya göre sıralı)</summary>

| Seçenek | İlk yarı işlem | İlk yarı net R | İkinci yarı işlem | İkinci yarı net R | Tüm veri maliyetsiz R |
|---|---|---|---|---|---|
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 190 | +0,273 | 188 | +0,238 | +0,386 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 211 | +0,253 | 215 | +0,183 | +0,343 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 228 | +0,148 | 214 | +0,267 | +0,330 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 205 | +0,132 | 194 | +0,198 | +0,293 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 213 | +0,131 | 220 | +0,226 | +0,275 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 104 | +0,129 | 129 | -0,027 | +0,133 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 104 | +0,128 | 131 | -0,020 | +0,136 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 173 | +0,121 | 137 | +0,397 | +0,381 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 194 | +0,112 | 201 | +0,227 | +0,268 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 161 | +0,110 | 124 | +0,393 | +0,375 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 207 | +0,099 | 179 | +0,329 | +0,326 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 107 | +0,092 | 120 | -0,087 | +0,110 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 228 | +0,085 | 199 | +0,304 | +0,302 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 285 | +0,085 | 322 | +0,118 | +0,191 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 108 | +0,082 | 120 | -0,087 | +0,105 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 249 | +0,073 | 284 | +0,107 | +0,182 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 282 | +0,064 | 324 | +0,179 | +0,213 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 262 | +0,062 | 233 | +0,279 | +0,277 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 185 | +0,060 | 151 | +0,269 | +0,286 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 243 | +0,060 | 266 | +0,033 | +0,132 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 120 | +0,060 | 139 | +0,040 | +0,158 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 267 | +0,060 | 297 | +0,052 | +0,138 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 242 | +0,057 | 270 | +0,127 | +0,184 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 201 | +0,055 | 170 | +0,277 | +0,283 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 229 | +0,053 | 209 | +0,261 | +0,269 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 219 | +0,053 | 242 | +0,088 | +0,165 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 264 | +0,052 | 292 | +0,120 | +0,171 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 308 | +0,045 | 335 | +0,148 | +0,180 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 248 | +0,040 | 284 | +0,131 | +0,179 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 119 | +0,036 | 136 | +0,035 | +0,145 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 136 | +0,026 | 149 | -0,025 | +0,084 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 109 | +0,023 | 122 | -0,037 | +0,078 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 137 | +0,017 | 153 | +0,005 | +0,097 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 110 | +0,013 | 122 | -0,037 | +0,073 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 122 | +0,006 | 129 | -0,073 | +0,052 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 414 | +0,006 | 416 | +0,139 | +0,154 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 440 | +0,005 | 448 | +0,160 | +0,161 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 97 | +0,004 | 107 | -0,013 | +0,118 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 399 | +0,001 | 409 | +0,128 | +0,138 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 428 | -0,002 | 445 | +0,127 | +0,131 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 124 | -0,011 | 129 | -0,073 | +0,043 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 365 | -0,012 | 367 | +0,116 | +0,124 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 95 | -0,015 | 106 | -0,040 | +0,095 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 465 | -0,018 | 483 | +0,118 | +0,125 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 457 | -0,021 | 473 | +0,083 | +0,093 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 392 | -0,027 | 397 | +0,109 | +0,108 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 416 | -0,032 | 429 | +0,087 | +0,089 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 415 | -0,034 | 429 | +0,109 | +0,111 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 365 | -0,037 | 367 | +0,115 | +0,120 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 100 | -0,043 | 105 | +0,010 | +0,068 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 391 | -0,056 | 396 | +0,117 | +0,106 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 102 | -0,062 | 105 | +0,010 | +0,058 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 96 | -0,086 | 100 | -0,046 | +0,041 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 92 | -0,090 | 101 | +0,059 | +0,073 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 97 | -0,096 | 100 | -0,046 | +0,036 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:2 (karşılaştırma) (seçilemez) | 93 | -0,100 | 101 | +0,059 | +0,067 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 90 | -0,157 | 96 | +0,076 | +0,075 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 97 | -0,158 | 111 | -0,045 | +0,019 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 91 | -0,166 | 96 | +0,076 | +0,070 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · sabit 1:3 (karşılaştırma) (seçilemez) | 98 | -0,167 | 111 | -0,045 | +0,014 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 163 | -0,181 | 174 | +0,027 | -0,016 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 161 | -0,195 | 173 | +0,029 | -0,021 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 139 | -0,197 | 148 | -0,059 | -0,066 |
| Long→Buy en fazla 20 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 163 | -0,216 | 174 | +0,075 | +0,005 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 138 | -0,216 | 147 | -0,057 | -0,075 |
| Long→Buy en fazla 10 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 139 | -0,224 | 148 | -0,076 | -0,077 |
| Long→Buy en fazla 20 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 161 | -0,239 | 173 | +0,080 | -0,004 |
| Long→Buy en fazla 10 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 138 | -0,254 | 147 | -0,071 | -0,091 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 105 | -0,270 | 110 | -0,058 | -0,095 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 20 mumun dibi · Supertrend çizgisinde çıkış | 106 | -0,275 | 110 | -0,058 | -0,098 |
| Long→Buy en fazla 5 mum · bacak başına 1 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 106 | -0,318 | 110 | -0,088 | -0,124 |
| Long→Buy en fazla 5 mum · bacak başına 2 LONG · LONG'da Stok. RSI şartı · stop son 10 mumun dibi · Supertrend çizgisinde çıkış | 106 | -0,323 | 110 | -0,088 | -0,126 |

</details>

Zaman dilimine göre ilk yarıda en iyi seçenek ve ikinci yarısı:

- 1h: Long→Buy en fazla 10 mum · bacak başına 2 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış → ilk yarı -0,003 R (298), ikinci yarı +0,131 R (311)
- 4h: Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 20 mumun dibi · Supertrend çizgisinde çıkış → ilk yarı +0,026 R (75), ikinci yarı +0,077 R (79)
- 1d: Long→Buy en fazla 20 mum · bacak başına 1 LONG · stop son 10 mumun dibi · Supertrend çizgisinde çıkış → ilk yarı +0,167 R (63), ikinci yarı +0,197 R (50)
