# Ön kayıt: 4 saatlik ve 15 dakikalık strateji testi (USDJPY, Japan 225, Nasdaq 100, Altın)

Bu dosya sonuçlar görülmeden önce yazıldı ve ayrı commit olarak kaydedildi. Sonuç raporu: `ODAK-4S-15DK.md`.

## Enstrümanlar ve veri (Yahoo Finance)

| Enstrüman | Yahoo sembolü | Not |
|---|---|---|
| USDJPY | `USDJPY=X` | spot |
| Japan 225 | `NIY=F` | CME Nikkei vadeli (yen); FxPro #Japan225 yerine vekil |
| Nasdaq 100 | `NQ=F` | vadeli, ~23 saat işlem (CFD'ye nakit endeksten yakın) |
| Altın | `GC=F` | vadeli; XAUUSD yerine vekil |

- **4s:** 1 saatlik veriden (Yahoo sınırı ~730 gün) birleştirilir.
- **15dk:** 5 dakikalık veriden (Yahoo sınırı ~60 gün) birleştirilir. **Süre kısa olduğu için 15dk sonuçları en iyi hâlde "kanıt zayıf" olarak raporlanır.**

## Adaylar

Mevcut 11 kutu stratejisi (`BOX_CANDIDATES`), SRA ailesi (SRA, SRA + EMA 200, SRA + ADX) ve araştırma belgesinden
("Otomatik İşlem Stratejileri Karşılaştırması") uyarlanan 3 yeni aday:

- **Donchian 55 + EMA 200:** kapanış önceki 55 mumun zirvesini kırar ve fiyat EMA 200 üstünde → LONG (short tersi).
- **RSI(2) + SMA 5 çıkışı:** fiyat SMA 200 üstünde ve RSI(2) 10 altına iner → LONG; kapanış SMA 5 üstüne çıkınca çıkış (short tersi: SMA 200 altı, RSI(2) 90 üstü, SMA 5 altına kapanışta çıkış).
- **EMA 200 trendinde EMA 50 geri çekilmesi:** fiyat ve EMA 50, EMA 200 üstünde; mumun dibi EMA 50'ye değer, kapanış EMA 50 üstünde ve mum yeşil → LONG; kapanış EMA 50 altına inerse çıkış (short tersi).

Belgedeki VWAP/açılış aralığı ve Japan 225 açılış boşluğu stratejileri test edilmez: FX ve CFD verisinde gerçek hacim yok ve
seans açılışı tanımı vekil vadeli verisiyle güvenilir değil.

Tüm adaylarda aynı kutu kuralları: stop 1,5 × ATR(14), hedef 2R, aynı mumda stop ve hedef → stop, tek pozisyon.
Kural çıkışlı adaylarda (RSI-2, EMA 50 geri çekilmesi) stop/hedef yanında kural çıkışı da geçerli (hangisi önce gelirse).
İki çıkış türü ayrı raporlanır: **sabit 2R** ve **takip eden TP** (hedefte kapanmaz, en iyi fiyatın 1,5 ATR gerisinden takip).

## Maliyetler (işlem başına, R'ye çevrilir)

| Enstrüman | Spread | Kayma | Komisyon | Swap (yıllık %, uzun / kısa) |
|---|---|---|---|---|
| USDJPY | 0,6 pip (0,006) — DOĞRULANMADI | 0,5 × spread | %0,007 (cTrader 35 $/milyon, gidiş-dönüş) — DOĞRULANMADI | 0 / 4 — DOĞRULANMADI |
| Japan 225 | 17 puan (kullanıcı ekranı) | 0,5 × spread | 0 (kullanıcı ekranı) | 6,5306 / 3,0551 (birim doğrulanmadı) |
| Nasdaq 100 | 2,0 puan — DOĞRULANMADI | 0,5 × spread | 0 | 6,5306 / 3,0551 — DOĞRULANMADI |
| Altın | 0,35 $ — DOĞRULANMADI | 0,5 × spread | %0,007 — DOĞRULANMADI | 5 / 1 — DOĞRULANMADI |

- Swap her 21:00 UTC geçişinde fiyat × oran / 360; FX ve altında Çarşamba, endekslerde Cuma geçişi 3 gün sayılır.
- Duyarlılık: maliyet × 0 (maliyetler hariç) ve × 2.

## Karar kuralı

Her aday × zaman dilimi × çıkış türü × enstrüman için (maliyet dahil):

1. İşlem sayısı ≥ 20 (4s) / ≥ 15 (15dk).
2. Net ortalama R, verinin ilk ve ikinci yarısında (zamana göre) ayrı ayrı > 0.
3. İşlem başı %1 risk, bileşik, en büyük düşüş < %20.

- Bir aday bir zaman diliminde **4 enstrümanın en az 2'sinde** 1–3'ü sağlarsa **geçer**.
- Sıralama: geçtiği enstrümanlardaki net ortalama R'nin ortalaması.
- t istatistiği yalnızca bilgi: t < 2 ise "kanıt yetersiz" notu.
- **Uygulamaya ekleme:** her zaman diliminde geçen en iyi en fazla 2 aday (çıkış türüyle birlikte). Zaten uygulamada olan
  (SRA ailesi, SAR + MACD, Squeeze) geçerse eklenmez, raporda "zaten var" denir. Hiçbiri geçmezse hiçbir şey eklenmez.
- Toplam deneme: 17 aday × 2 çıkış × 2 zaman dilimi × 4 enstrüman; seçim yanlılığı raporda belirtilir.
