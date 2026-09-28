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

# Kayıp oranını azaltmak için ek indikatör testi

Mevcut kurallar (stop 1,5 ATR, hedef 1:2) sabit tutularak girişe **tek bir ek şart** eklendi; 11 aday ve bunların ikili
birleşimleri denendi. Aşırı uyumu önlemek için her serinin **ilk yarısında seçim**, **ikinci yarısında doğrulama** yapıldı.
Tam tablo: `research/sratr-filtre-sonuclar.md`.

| Sürüm | İlk yarı ort. R | İkinci yarı ort. R | İkinci yarı hedef % | Toplam işlem |
|---|---|---|---|---|
| Mevcut | +0,032 | +0,014 | %33,8 | 16.261 |
| **+ EMA 200 trend yönü** | **+0,091** | **+0,060** | %35,3 | 2.144 |
| **+ ADX < 25** | **+0,063** | **+0,059** | %35,3 | 5.862 |
| + Bollinger orta bant | +0,046 | +0,025 | %34,2 | 13.976 |
| + Bollinger banda temas | +0,039 | +0,031 | %34,4 | 9.735 |
| + RSI 50 bölgesi | +0,038 | +0,012 | %33,7 | 14.502 |
| + MACD histogramı | +0,033 | +0,017 | %33,9 | 15.649 |
| + Mum yönü | +0,030 | +0,014 | %33,8 | 15.671 |
| + Üst TF Stokastik dönüşü | +0,029 | +0,001 | %33,4 | 6.331 |
| + ADX > 20 | +0,027 | +0,004 | %33,5 | 13.993 |
| + EMA 50 trend yönü | +0,023 | +0,094 | %36,5 | 1.622 |
| + Supertrend | +0,005 | +0,034 | %34,5 | 1.991 |

**Eklenenler:** EMA 200 ve ADX < 25 — ilk yarıda en iyi iki aday; ikinci yarıda da mevcut stratejinin yaklaşık 4 katı ortalama R.

- **SRA + EMA 200** özellikle 2s (+0,14R), 4s (+0,17R) ve günlükte (+0,50R, 84 işlem) iyi; mevcut strateji günlükte zararda.
  Sinyal sayısı ~7'de 1'e düşer.
- **SRA + ADX** sinyallerin ~3'te 1'ini tutar; 2s (+0,11R) ve 4s (+0,16R) en iyi.
- **Kayıp oranı yalnızca biraz düşüyor** (stop olan işlemler %66'dan %64–65'e). İyileşme, zarar eden işlemlerin daha çok elenmesinden
  ve kazananların korunmasından geliyor; hedefe ulaşma oranı 1:2 hedefte %33–36 bandında kalıyor. Kaybı belirgin azaltmanın yolu
  hedefi yakınlaştırmak (1:1'de %51) ama o zaman işlem başına kazanç düşüyor.
- İkili birleşimlerden **EMA 200 + EMA 50** her iki yarıda +0,18/+0,26R verdi ama yalnızca ~650 işlem; örnek küçük olduğu için eklenmedi.
- İstatistik: ikinci yarıda ortalama R'nin sıfırdan farkı ADX sürümünde z≈2,2, EMA 200 sürümünde z≈1,4 (örnek küçük). Sonuçlar spread/komisyon hariç.
