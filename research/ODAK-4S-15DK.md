# 4s ve 15dk strateji testi: USDJPY, Japan 225, Nasdaq 100, Altın

- Ön kayıt (sonuçlardan önce): `ODAK-4S-15DK-KURAL.md`
- Tüm tablolar (otomatik): `odak-4s-15dk-sonuclar.md`
- Kod: `research/focus.ts`, yeni adaylar `src/core/boxes.ts`

## Veri

- 4s: Aralık 2023 / Mayıs 2024 – Eylül 2026 (~29–34 ay), enstrüman başına ~3.700–4.400 mum.
- 15dk: yalnızca Temmuz – Eylül 2026 (**~2,5 ay**, Yahoo sınırı). 15dk sonuçları bu yüzden zayıf kanıttır.
- Vekil veriler: Japan 225 = `NIY=F`, Nasdaq 100 = `NQ=F`, Altın = `GC=F` (vadeli). FxPro CFD fiyatları farklıdır.

## Karar kuralına göre geçenler (maliyet dahil)

### 4s

| Sıra | Strateji | Çıkış | Geçtiği enstrümanlar | Ort. net R | Uygulamada |
|---|---|---|---|---|---|
| 1 | SAR + EMA 200 + MACD | takip eden TP | Nasdaq 100, Altın | +0,436 | zaten var |
| 2 | SRA + ADX | takip eden TP | Japan 225, Altın | +0,421 | zaten var |
| 3 | SRA + ADX | sabit 2R | Japan 225, Altın | +0,328 | zaten var |
| 4 | SAR + EMA 200 + MACD | sabit 2R | Nasdaq 100, Altın | +0,265 | zaten var |
| 5 | **Supertrend + EMA 200** | takip eden TP | USDJPY, Japan 225 | +0,210 | **eklendi** |
| 6 | Squeeze | takip eden TP | USDJPY, Japan 225 | +0,177 | zaten var |
| 7 | SRA | takip eden TP | Japan 225, Nasdaq 100 | +0,120 | zaten var |
| 8 | **UT Bot + EMA 200** | sabit 2R | USDJPY, Altın | +0,097 | **eklendi** |
| 9 | SRA | sabit 2R | USDJPY, Japan 225 | +0,082 | zaten var |
| 10 | EMA 50 geri çekilmesi (yeni aday) | sabit 2R | USDJPY, Altın | +0,068 | eklenmedi (ilk 2 dışında) |

### 15dk

| Sıra | Strateji | Çıkış | Geçtiği enstrümanlar | Ort. net R | Uygulamada |
|---|---|---|---|---|---|
| 1 | **Connors RSI(2)** | takip eden TP | Nasdaq 100, Altın | +0,141 | **eklendi** |
| 2 | **UT Bot + EMA 200** | takip eden TP | Nasdaq 100, Altın | +0,120 | **eklendi** |

Geçen tüm adaylarda t < 2: **kanıt yetersiz**.

### Ön kayıttaki belirsizlik ve seçilen yorum

Kural "her zaman diliminde geçen en iyi en fazla 2 aday eklenir; zaten uygulamada olan eklenmez" diyor. 4s'te ilk dört sıra
zaten uygulamada. İki yorum mümkün: (a) ilk 2 zaten var → 4s'ten hiçbir şey eklenmez; (b) uygulamada olmayan en iyi 2 aday
eklenir. **(b) uygulandı** (kullanıcı yeni strateji eklenmesini istedi). (a) yorumunda 4s için yeni strateji eklenmezdi.

## Ne kadar güvenilir?

- **Şans düzeyi:** Gerçek üstünlüğü olmayan (ortalama 0) bir strateji bir enstrümanda iki yarıda da pozitif çıkma şansına
  kabaca %25 sahiptir; 4 enstrümanın en az 2'sinde bunu yapma olasılığı ≈ %26'dır. 68 denemenin 12'si geçti (%18).
  **Geçen oranı şansla beklenenden yüksek değil.** Bu testte geçmek, stratejinin işe yaradığını göstermez; yalnızca açıkça
  kötü olanları eler. Ön kayıttaki kural bu açıdan gevşek kaldı.
- Hiçbir aday 4 enstrümanın hepsinde çalışmadı; geçenler 2 enstrümanda geçti.
- 15dk'da maliyet işlem başına ~0,15R (USDJPY, Japan 225) — 4s'te ~0,05–0,10R. 15dk'da kârlı görünen stratejilerin çoğu
  maliyet × 2'de sıfıra iner.
- Takip eden TP hemen her stratejide sabit 2R'den iyi (önceki bulguyla tutarlı).

## Enstrümana göre not

- **USDJPY:** 4s'te Supertrend + EMA 200 (takip) ve UT Bot (sabit) hafif pozitif; 15dk'da neredeyse her şey negatif (maliyet).
- **Japan 225:** 4s'te SRA + ADX en tutarlı (+0,53R takipte, t 2,0). 15dk'da SAR + MACD maliyet dahil +0,21R (sabit) /
  +0,30R (takip), 82 işlem, 2,3 ay — Mechi Trader'ın ilk stratejisi için olumlu ama kısa dönem.
- **Nasdaq 100:** 4s'te SAR + MACD en iyi (+0,51R takipte, t 2,0); 15dk'da UT Bot ve RSI(2) (takip) pozitif.
- **Altın:** 4s'te çoğu trend stratejisi pozitif (dönem boyunca güçlü yükseliş trendi; bu durum trend stratejilerini
  kayırır). 15dk'da RSI(2) ve UT Bot pozitif.

## Belgeden gelen yeni adaylar

- Donchian 55 + EMA 200: 4s'te altında pozitif, Nasdaq'ta negatif; geçmedi.
- RSI(2) + SMA 5 çıkışı: 4s'te sıfır civarı, 15dk'da açıkça negatif (maliyet); geçmedi.
- EMA 50 geri çekilmesi: 4s'te USDJPY ve altında geçti ama sıralamada ilk 2 yeni aday dışında kaldı; 15dk'da negatif.
- VWAP / açılış aralığı ve Japan 225 açılış boşluğu test edilmedi (hacim ve seans verisi yok).

## Sınırlamalar

- Maliyet varsayımları (USDJPY, Nasdaq, altın spread/komisyon/swap) **doğrulanmadı**; Japan 225 swap birimi doğrulanmadı.
- Vadeli vekil fiyatlar CFD ile aynı değil; mum sınırları ve seans saatleri farklı olabilir.
- Aynı mumda stop ve hedef → stop (temkinli). Takip mum bazında; gerçekte tik bazında çalışır.
- 4s ~2,5 yıl tek piyasa rejimi (altın ve Nasdaq'ta güçlü yükseliş).
