# 1000 $ senaryosu: EMA 21/55 kesişimi, 30 Eylül 2025 – 30 Eylül 2026

## Varsayımlar

- Kural: EMA 21 > EMA 55 → LONG, < → SHORT; sinyal mum kapanışında, giriş kapanış fiyatından; ters kesişimde aynı fiyattan dönüş; stop/hedef yok.
- Başlangıç: 30 Eylül 2025'te pozisyonsuz; ilk işlem o tarihten sonraki ilk kesişimde (EMA'lar önceki verilerle ısınmış). Açık kalan son işlem son kapanışla değerlenir.
- Pozisyon büyüklüğü = o anki bakiye × kaldıraç / giriş fiyatı; bileşik. Getiri yüzde üzerinden hesaplanır (Japan 225 yen, kur etkisi yok sayıldı).
- Maliyet (her girişte): spread + 0,5 × spread kayma + komisyon. Japan 225 17 puan (FxPro ekranı), Nasdaq 2 puan, altın 0,35 $ + %0,007, USDJPY 0,006 + %0,007 (Japan 225 dışı DOĞRULANMADI).
- Swap: her 21:00 UTC geçişinde pozisyon × yıllık oran / 360 (FX/altında Çarşamba, endekslerde Cuma 3 gün). Japan 225/Nasdaq uzun %6,53, kısa %3,06; altın %5 / %1; USDJPY %0 / %4 (birim/oranlar DOĞRULANMADI).
- Düşüş: her mumda mum içi en kötü fiyatla özsermaye üzerinden. Stop-out: marj %5 (1:20) ve stop-out %20 varsayımıyla özsermaye pozisyonun %1'ine inerse hesap kapanır (FxPro koşulları DOĞRULANMADI).
- Veri: Yahoo Finance (Japan 225 = NIY=F CME vadeli, Nasdaq = NQ=F, altın = GC=F); 4s mumlar 1s'ten birleştirildi.

## Sonuçlar

| Enstrüman | Zaman dilimi | Kaldıraç | Bitiş bakiyesi | Getiri | İşlem | Kazanan | Maks. düşüş (özsermaye) | En kötü işlem | En düşük bakiye | Stop-out |
|---|---|---|---|---|---|---|---|---|---|---|
| USDJPY | 4h | 1x | 862 $ | -13,8% | 29 | %14 | %15,4 | -2,1% | 847 $ | hayır |
| USDJPY | 4h | 5x | 455 $ | -54,5% | 29 | %14 | %58,3 | -10,6% | 419 $ | hayır |
| Japan 225 | 4h | 1x | 1.181 $ | +18,1% | 21 | %38 | %14,8 | -3,3% | 950 $ | hayır |
| Japan 225 | 4h | 5x | 1.773 $ | +77,3% | 21 | %38 | %54,8 | -16,3% | 676 $ | hayır |
| Japan 225 | 4h | 10x | 1.877 $ | +87,7% | 21 | %38 | %81,5 | -32,6% | 332 $ | hayır |
| Japan 225 | 1h | 1x | 761 $ | -23,9% | 104 | %28 | %34,6 | -3,8% | 719 $ | hayır |
| Japan 225 | 1h | 5x | 160 $ | -84,0% | 104 | %28 | %91,7 | -19,2% | 126 $ | hayır |
| Japan 225 | 1h | 10x | 9 $ | -99,1% | 104 | %28 | %99,7 | -38,5% | 6 $ | hayır |
| Nasdaq 100 | 4h | 1x | 872 $ | -12,8% | 29 | %24 | %24,9 | -5,5% | 806 $ | hayır |
| Nasdaq 100 | 4h | 5x | 367 $ | -63,3% | 29 | %24 | %78,7 | -27,6% | 294 $ | hayır |
| Altın | 4h | 1x | 1.004 $ | +0,4% | 24 | %29 | %28,1 | -4,3% | 868 $ | hayır |
| Altın | 4h | 5x | 711 $ | -28,9% | 24 | %29 | %79,7 | -21,5% | 367 $ | hayır |

## Japan 225 · 4s · ay sonu bakiyesi (açık pozisyon kapanışla değerlenmiş)

| Ay sonu | 1x | 5x | 10x |
|---|---|---|---|
| 2025-09 | 1.000 $ | 1.000 $ | 1.000 $ |
| 2025-10 | 1.109 $ | 1.468 $ | 1.749 $ |
| 2025-11 | 1.015 $ | 984 $ | 810 $ |
| 2025-12 | 972 $ | 789 $ | 514 $ |
| 2026-01 | 1.002 $ | 904 $ | 653 $ |
| 2026-02 | 1.089 $ | 1.288 $ | 1.192 $ |
| 2026-03 | 1.020 $ | 987 $ | 773 $ |
| 2026-04 | 1.081 $ | 1.251 $ | 1.130 $ |
| 2026-05 | 1.121 $ | 1.406 $ | 1.269 $ |
| 2026-06 | 1.129 $ | 1.419 $ | 1.215 $ |
| 2026-07 | 1.184 $ | 1.749 $ | 1.756 $ |
| 2026-08 | 1.137 $ | 1.482 $ | 1.335 $ |
| 2026-09 | 1.181 $ | 1.773 $ | 1.877 $ |
