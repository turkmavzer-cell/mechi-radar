# Stokastik-RSI-ATR: stop/hedef seçimi

**Kurallar:** Bir üst zaman diliminde kapanmış son 3 mumdan birinde Stokastik %K (14,3,3) 20 altı (long) / 80 üstü (short) iken,
işlem zaman diliminde RSI(14) kendi SMA 14'ünü yukarı / aşağı keserse mum kapanışında giriş. Pozisyon yalnızca hedef ya da stopla kapanır;
açık pozisyon varken yeni sinyal yok. Aynı mumda stop ve hedef görülürse stop sayılır.

**Veri:** 18 enstrüman (döviz, endeks, emtia, ABD/BIST hisseleri, kripto). 15–30dk: son 60 gün, 1–4s: son 2 yıl, 1g: son 10 yıl.
Sonuçlar **spread/komisyon hariç**. Tam tablo: `research/sratr-sonuclar.md`.

## Tüm zaman dilimleri (özet)

| Stop | Hedef | İşlem | Hedefe ulaşan | Ort. R | Kâr faktörü |
|---|---|---|---|---|---|
| 1,5 ATR | 1:3 | 14.812 | %25,7 | +0,029 | 1,04 |
| **1,5 ATR** | **1:2** | **16.261** | **%34,1** | **+0,023** | **1,04** |
| 1,5 ATR | 1:1,5 | 16.991 | %40,9 | +0,023 | 1,04 |
| 1,5 ATR | 1:1 | 18.009 | %50,8 | +0,016 | 1,03 |
| 2 ATR | 1:2 | 13.291 | %33,9 | +0,016 | 1,02 |
| 2 ATR | 1:3 | 11.080 | %25,1 | +0,006 | 1,01 |

## Zaman dilimine göre (1,5 ATR · 1:2)

| 15dk | 20dk | 30dk | 1s | 2s | 4s | 1g |
|---|---|---|---|---|---|---|
| +0,019R | +0,049R | +0,075R | +0,002R | +0,051R | +0,077R | −0,042R |

## Karar ve yorum

- **Seçilen: stop 1,5 ATR, hedef 1:2.** 1,5 ATR stop her hedefte 2 ATR'den iyi. 1:3 hedef ortalamada çok az önde ama fark
  istatistik olarak anlamsız ve işlemlerin yalnızca dörtte biri hedefe ulaşıyor; 1:2 daha dengeli.
- Kenar **çok ince**: işlem başına ortalama +0,02R. Spread ve komisyon bunu, özellikle 15dk–1s'te, kolayca sıfırlar.
- En iyi sonuç **30dk, 2s ve 4s**'te (+0,05…+0,08R). **Günlükte (haftalık filtreyle) strateji her kombinasyonda zararda.**
- Üst zaman dilimi filtresinde "anlık" ile "son 3 mum" arasında fark yok; son 3 mum biraz daha çok sinyal veriyor.
