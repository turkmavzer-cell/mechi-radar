# Mechi Radar · Strateji Araştırması

*Tarih: 28 Eylül 2026 · Veri: Yahoo Finance · 18 enstrüman × 7 zaman dilimi × 24 strateji*

## 1. Kısa sonuç

- **Test edilen 24 stratejinin hiçbiri büyük bir üstünlük göstermedi.** En iyi sonuçlar, rastgele girişe göre **+2 ila +3 puan** (örneğin rastgele %49,6 iken strateji %52,4). 166 strateji × zaman dilimi kombinasyonunun 11'i istatistiksel olarak anlamlı çıktı (|z| ≥ 2); saf şansla yaklaşık 8 beklenir. Yani sonuçların büyük kısmı gürültüden ayırt edilemiyor.
- **Tek tutarlı desen: ortalamaya dönüş stratejileri** (Bollinger dönüşü, Stokastik, RSI uyumsuzluğu) **20dk, 30dk ve 4s** mumlarında birlikte pozitif. En güçlüleri **Bollinger dönüşü 4s** (z = +3,0; verinin iki yarısında da pozitif; 18 enstrümanın 13'ünde rastgeleyi geçiyor) ve **Stokastik 4s** (z = +3,2; 18'in 16'sında).
- **Trend takip stratejileri gün içi (15dk–2s) mumlarda ortalamada rastgeleden kötü**, günlük mumda hafif pozitif. Bu, akademik literatürdeki "trend takibi uzun vadede çalışır" bulgusuyla uyumlu.
- **Mum formasyonları ve algoritmik grafik formasyonları** genel olarak rastgele düzeyinde; günlük mumda negatif. En belirgin: günlük çekiç/kayan yıldız, özellikle dövizde **ters çalışıyor** (−10,9 puan).
- **Ortalama getiriler çok küçük** (sinyal başına %0,01–0,1). Spread ve komisyon düşülünce çoğu strateji kârlı olmaz. Bu sonuçlar "hangi sinyal biraz daha güvenilir" sorusunun cevabıdır, "bu strateji para kazandırır" kanıtı değildir.

## 2. Yöntem

| | |
|---|---|
| Enstrümanlar | EURUSD, USDJPY, GBPUSD · S&P 500, Nasdaq 100, DAX, Japan 225 vadeli, BIST 100 · Altın, Ham petrol · Apple, Microsoft, Nvidia, THYAO, GARAN, ASELS · Bitcoin, Ethereum |
| Veri aralığı | 15/20/30dk: son 60 gün (5dk mumlardan) · 1/2/4s: son 2 yıl (1s mumlardan) · 1g: son 10 yıl |
| Ölçüt | **İsabet**: sinyalden 10 mum sonra fiyat sinyal yönünde mi (5 ve 20 mum da ölçüldü) |
| Kıyas | **Rastgele giriş**: aynı dönemde her mumda aynı yön dağılımıyla giriş yapılsaydı isabet ne olurdu (yükselen piyasada "al" sinyallerinin kolay tutmasını düzeltir) |
| Fark | İsabet − rastgele (puan). Tablolardaki ana sayı budur |
| Anlamlılık | z = fark / standart hata. \|z\| ≥ 2 kalın gösterildi |
| Kararlılık | Veri ikiye bölündü; iki yarıda da pozitif mi? |
| Hile kontrolü | Tüm stratejiler rastgele üretilmiş fiyatta çalıştırıldı; hepsi %50 civarında çıktı → kodda geleceğe bakma hatası yok |
| Dahil değil | Spread, komisyon, kayma, stop/hedef yönetimi, parametre optimizasyonu (tüm parametreler standart değerler) |

Kod: `src/core/lab.ts` (stratejiler ve ölçüm), `research/backtest.ts` (çalıştırıcı). Ham sonuçlar reponun `research` dalında.

## 3. Sonuçlar

### 3.1 Strateji × zaman dilimi (rastgeleye göre puan farkı, 10 mum)

`·` = 100'den az sinyal. **Kalın** = istatistiksel olarak anlamlı (|z| ≥ 2).

| Strateji | Tür | 15dk | 20dk | 30dk | 1s | 2s | 4s | 1g | En iyi |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| RSI uyumsuzluğu | Dönüş | -0,8 | +0,9 | +2,8 | +1,3 | +1,8 | +2,4 | -2,2 | 30dk (+2,8) |
| Altın/Ölüm kesişimi | Trend | -1,1 | +2,7 | -1,7 | -0,5 | -3,1 | -3,9 | +2,8 | 1g (+2,8) |
| Bollinger dönüşü | Dönüş | +0,9 | **+1,9** | **+2,6** | -0,2 | +0,9 | **+2,7** | +0,3 | 4s (+2,7) |
| Stokastik 14,3,3 | Dönüş | +0,5 | +1,5 | +2,1 | **-1,0** | +0,2 | **+2,7** | -1,3 | 4s (+2,7) |
| TTM Squeeze | Momentum | -2,1 | -2,1 | **-6,2** | -0,9 | +0,3 | +0,7 | +2,3 | 1g (+2,3) |
| Omuz-baş-omuz | Formasyon | +2,0 | · | · | +0,4 | +1,7 | -3,0 | -3,8 | 15dk (+2,0) |
| ADX/DMI | Trend | +1,8 | +0,6 | -2,6 | **-2,1** | -2,1 | -1,5 | +0,5 | 15dk (+1,8) |
| EMA 20·50 pullback | Trend | -3,5 | +0,3 | -2,8 | -1,5 | -1,8 | -2,7 | +1,8 | 1g (+1,8) |
| RSI(2) Connors | Dönüş | -0,2 | +0,2 | +1,0 | +0,1 | -1,0 | -0,5 | +1,7 | 1g (+1,7) |
| MACD sinyal kesişimi | Momentum | +0,3 | +0,1 | -0,4 | +0,2 | +0,9 | +1,3 | -0,8 | 4s (+1,3) |
| Ichimoku TK | Trend | -1,8 | **-4,5** | -3,7 | -0,4 | +0,9 | +0,8 | +1,3 | 1g (+1,3) |
| İç mum kırılımı | Mum | +0,3 | -1,0 | -1,0 | -0,5 | +1,3 | +0,1 | -1,7 | 2s (+1,3) |
| Donchian 20 | Trend | -0,2 | -1,4 | -1,2 | -0,1 | +1,2 | +0,2 | +0,3 | 2s (+1,2) |
| EMA 9×21 | Trend | -0,2 | +0,7 | -2,0 | +0,3 | +0,8 | +1,1 | +1,2 | 1g (+1,2) |
| Yutan mum | Mum | -0,1 | +0,9 | +0,7 | -0,5 | -1,6 | -1,0 | +1,1 | 1g (+1,1) |
| EMA 5·8·13 | Trend | -0,7 | -0,5 | -1,4 | -0,3 | +0,5 | +1,1 | +0,2 | 4s (+1,1) |
| Üçlü Onay | Momentum | -0,0 | -0,4 | -1,6 | +0,4 | +1,1 | +0,6 | -0,1 | 2s (+1,1) |
| Parabolic SAR | Trend | -0,3 | +0,1 | -1,0 | -0,2 | +0,0 | +0,6 | +1,0 | 1g (+1,0) |
| İkili dip / tepe | Formasyon | -0,8 | +0,2 | -1,8 | +0,1 | +0,0 | -1,8 | +0,9 | 1g (+0,9) |
| Supertrend 10,3 | Trend | -1,0 | -2,0 | +0,1 | -0,9 | -0,3 | +0,9 | -0,4 | 4s (+0,9) |
| Trend çizgisi kırılımı | Formasyon | -0,6 | +0,7 | -0,4 | +0,2 | +0,8 | +0,7 | **-2,5** | 2s (+0,8) |
| Çekiç / kayan yıldız | Mum | -1,1 | +0,6 | +0,7 | -0,2 | +0,2 | -0,5 | **-5,1** | 30dk (+0,7) |
| Yapı kırılımı (BOS) | Formasyon | +0,2 | -0,6 | -1,2 | -0,5 | +0,6 | -1,0 | -1,4 | 2s (+0,6) |
| Heikin Ashi | Trend | **-1,2** | +0,2 | +0,3 | -0,1 | +0,2 | +0,4 | -0,6 | 4s (+0,4) |

### 3.2 En iyi 12 kombinasyon (ayrıntılı)

| Strateji | Zaman | Sinyal | İsabet 5/10/20 mum | Rastgele | Fark | z | Ort. getiri (10 mum) | 1. yarı / 2. yarı | Rastgeleyi geçen enstrüman |
|---|---|---:|---|---:|---:|---:|---:|---|---|
| RSI uyumsuzluğu | 30dk | 369 | %50,4 / %52,3 / %53,4 | %49,5 | +2,8 | +1,1 | -0,089% | %48,0 / %56,1 | 11/18 |
| Altın/Ölüm kesişimi | 1g | 222 | %47,3 / %52,7 / %53,2 | %49,9 | +2,8 | +0,8 | +0,388% | %49,5 / %55,4 | 9/18 |
| Bollinger dönüşü | 4s | 2926 | %50,8 / %52,4 / %52,4 | %49,6 | +2,7 | +3,0 | +0,095% | %51,7 / %53,0 | 13/18 |
| Altın/Ölüm kesişimi | 20dk | 245 | %50,2 / %52,7 / %52,2 | %49,9 | +2,7 | +0,9 | +0,075% | %48,6 / %56,0 | 8/18 |
| Stokastik 14,3,3 | 4s | 3531 | %50,8 / %51,3 / %50,6 | %48,6 | +2,7 | +3,2 | +0,031% | %50,6 / %52,1 | 16/18 |
| Bollinger dönüşü | 30dk | 1708 | %52,1 / %52,4 / %55,4 | %49,8 | +2,6 | +2,2 | +0,011% | %55,3 / %49,5 | 12/18 |
| RSI uyumsuzluğu | 4s | 801 | %49,4 / %50,6 / %47,8 | %48,2 | +2,4 | +1,3 | -0,107% | %50,4 / %50,7 | 11/18 |
| TTM Squeeze | 1g | 1092 | %50,9 / %53,8 / %51,0 | %51,5 | +2,3 | +1,5 | +0,514% | %54,8 / %52,7 | 12/18 |
| Stokastik 14,3,3 | 30dk | 1941 | %50,7 / %51,4 / %51,3 | %49,2 | +2,1 | +1,9 | +0,002% | %52,8 / %49,9 | 10/18 |
| Omuz-baş-omuz | 15dk | 106 | %49,1 / %52,8 / %50,9 | %50,8 | +2,0 | +0,4 | -0,001% | %60,4 / %45,3 | 4/8 |
| Bollinger dönüşü | 20dk | 2748 | %49,5 / %51,7 / %51,6 | %49,8 | +1,9 | +2,0 | -0,010% | %50,9 / %52,6 | 13/18 |
| ADX/DMI | 15dk | 993 | %47,7 / %51,9 / %48,3 | %50,0 | +1,8 | +1,1 | +0,029% | %54,5 / %49,1 | 12/18 |

### 3.3 Strateji türü × zaman dilimi (ortalama fark)

| Tür | 15dk | 20dk | 30dk | 1s | 2s | 4s | 1g |
|---|---:|---:|---:|---:|---:|---:|---:|
| Trend | -0,82 | -0,38 | -1,59 | -0,58 | -0,37 | -0,29 | +0,81 |
| Momentum | -0,63 | -0,80 | -2,74 | -0,09 | +0,77 | +0,86 | +0,46 |
| Dönüş | +0,11 | +1,15 | +2,15 | +0,05 | +0,47 | +1,83 | -0,37 |
| Mum | -0,31 | +0,14 | +0,14 | -0,40 | -0,06 | -0,47 | -1,86 |
| Formasyon | +0,22 | +0,08 | -1,14 | +0,05 | +0,80 | -1,25 | -1,70 |
| **Hepsi** | -0,40 | -0,04 | -0,80 | -0,29 | +0,15 | +0,02 | -0,18 |

**Okuma:** Dönüş stratejileri 20dk, 30dk ve 4s'te öne çıkıyor. Trend ve momentum ancak 2s ve üstünde sıfırın üstüne çıkıyor, en iyisi günlük. Mum ve formasyonlar günlükte negatif. Tüm stratejilerin ortalaması her zaman diliminde sıfıra yakın; en iyi ortalama 2s ve 4s'te.

### 3.4 Varlık sınıfına göre (seçilmiş kombinasyonlar)

| Strateji · zaman | Döviz | Endeks | Emtia | Hisse | Kripto |
|---|---:|---:|---:|---:|---:|
| Bollinger dönüşü · 4s | +2,7 | -0,6 | -0,4 | +5,7 | +5,9 |
| Stokastik 14,3,3 · 4s | +3,5 | -0,1 | +2,8 | +3,6 | +4,1 |
| Bollinger dönüşü · 20dk | +2,9 | +2,4 | +1,5 | +2,3 | -0,2 |
| RSI uyumsuzluğu · 30dk | +13,4 | +7,7 | -14,6 | -0,6 | +6,5 |
| RSI(2) Connors · 1g | -0,3 | -0,3 | +2,2 | +4,0 | +2,3 |
| EMA 5·8·13 · 4s | +2,7 | -1,8 | +2,0 | +3,1 | -0,4 |
| Üçlü Onay · 2s | +1,2 | +2,7 | +1,8 | +6,1 | -5,1 |
| TTM Squeeze · 1g | -0,6 | +6,8 | +4,2 | +1,5 | +1,4 |
| Altın/Ölüm kesişimi · 1g | +0,0 | +5,6 | +3,3 | +1,9 | +3,0 |
| Çekiç / kayan yıldız · 1g | -10,9 | +3,5 | -3,6 | -2,6 | -2,5 |

**Okuma:** Aynı strateji farklı piyasalarda çok farklı sonuç veriyor. Örneğin Üçlü Onay 2s hisselerde +6,1, kriptoda −5,1. Bu yüzden uygulamaya **her enstrümanın kendi geçmişinden hesaplanan strateji karnesi** eklendi.

### 3.5 Mevcut stratejilerin durumu

| Strateji | En iyi zaman dilimi | Değerlendirme |
|---|---|---|
| EMA 5·8·13 | 4s (+1,1) | Gün içinde rastgele düzeyinde; 4s'te döviz, emtia ve hissede pozitif, endeks ve kriptoda değil. **15dk yerine 4s kullanmak daha tutarlı.** |
| EMA 20·50 pullback | 1g (+1,8) | Gün içinde negatif (15dk −3,5). **Yalnızca günlükte anlamlı**; sinyal az. |
| Üçlü Onay | 2s (+1,1) | 2s'te 18 enstrümanın 14'ünde rastgeleyi geçiyor; en iyi hisselerde. Kriptoda kullanma. |
| Supertrend 10,3 | 4s (+0,9) | Zayıf. |
| Altın/Ölüm kesişimi | 1g (+2,8) | Az sinyal (222), anlamlı değil ama literatürle uyumlu. Gün içi mumlarda anlamsız. |
| Donchian 20 | 2s (+1,2) | Zayıf. |

## 4. Uygulamaya yansıyanlar

1. **Üç yeni strateji eklendi:** Bollinger Dönüşü, Stokastik, RSI Uyumsuzluğu. Bu testte en tutarlı sonucu veren grup bunlar.
2. **Strateji karnesi (detay ekranı):** Her enstrümanın o anki zaman dilimindeki geçmişinde 24 stratejinin isabeti, rastgeleye göre farkı ve bu araştırmadaki genel sonucu gösteriliyor.
3. **Genel test notu:** Grafik altında seçili stratejinin bu araştırmadaki sonucu yazıyor.

## 5. Önerilen kullanım

- **Dönüş sinyalleri (Bollinger, Stokastik) → 4s**, ikincil olarak 20dk/30dk. Döviz, hisse ve kriptoda daha iyi; endekslerde nötr.
- **Trend sinyalleri (5·8·13, EMA 20·50, altın kesişim) → 4s ve günlük.** 15dk'da trend sinyallerini tek başına kullanma.
- **Tek sinyal yerine uyum ara:** Örneğin 4s'te Bollinger dönüşü ▲ gelirken günlükte trend yukarıysa. (Bu birleşik kural test edilmedi; önerilen bir sonraki araştırma adımı.)
- **Karneye bak:** Aynı strateji her enstrümanda farklı çalışıyor. Karnede az sinyalli (≈30'dan az) satırlara güvenme.
- **Maliyet:** Kısa zaman dilimlerinde sinyal başına ortalama hareket spread ve komisyondan küçük olabilir.

## 6. Strateji kataloğu: yaygın olandan az bilinene

Durum: ✅ bu çalışmada test edildi · ⏳ test edilebilir, sonraki adım · ❌ algoritmik olarak tutarlı tanımlanamıyor veya veri gerektiriyor (hacim vb.)

### 6.1 Trend takip
| Strateji | Durum | Not |
|---|---|---|
| Hareketli ortalama kesişimleri (EMA 9×21, 5·8·13, SMA 50×200) | ✅ | Literatürde en çok çalışılan kural (Brock vd. 1992). Günlükte hafif pozitif. |
| Donchian / Turtle kırılımı | ✅ | Zayıf. |
| Supertrend, Parabolic SAR | ✅ | Zayıf. |
| Ichimoku (Tenkan×Kijun, bulut) | ✅ | Gün içi negatif, günlük +1,3. |
| ADX / DMI | ✅ | Tutarsız. |
| Heikin Ashi renk değişimi | ✅ | Rastgele düzeyinde. |
| Zaman serisi momentumu (12 aylık getiri) | ⏳ | Akademik olarak en güçlü kanıtı olan trend yaklaşımı; aylık ölçekte. |
| Hull MA, KAMA, Keltner kanal kırılımı | ⏳ | Yaygın ama bağımsız kanıt az. |

### 6.2 Momentum
| Strateji | Durum | Not |
|---|---|---|
| MACD sinyal kesişimi | ✅ | 4s +1,3. |
| Üçlü Onay (MACD 0 + RSI 50 + Bollinger orta) | ✅ | 2s +1,1; hisselerde güçlü. |
| TTM Squeeze | ✅ | Günlükte +2,3, gün içinde negatif. |
| ROC, CCI | ⏳ | |

### 6.3 Ortalamaya dönüş
| Strateji | Durum | Not |
|---|---|---|
| Bollinger bant dönüşü | ✅ | **En tutarlı sonuç** (4s, 20dk, 30dk). |
| Stokastik %K×%D (20/80) | ✅ | **4s'te 18 enstrümanın 16'sında pozitif.** |
| RSI uyumsuzluğu | ✅ | 30dk–4s pozitif, anlamlılık sınırda. |
| RSI(2) Connors | ✅ | Günlükte hisse ve kriptoda pozitif. |
| Williams %R, VWAP bantları | ⏳ | VWAP hacim gerektirir; döviz için Yahoo'da hacim yok. |

### 6.4 Mum formasyonları
| Strateji | Durum | Not |
|---|---|---|
| Yutan mum | ✅ | Rastgele düzeyinde. |
| Çekiç / kayan yıldız (pin bar) | ✅ | **Günlükte ters çalışıyor** (−5,1; dövizde −10,9). |
| İç mum (inside bar) kırılımı | ✅ | Rastgele düzeyinde. |
| Doji, sabah/akşam yıldızı, üç asker/karga, harami, NR7 | ⏳ | Literatürde genel olarak zayıf (Marshall vd. 2006). |

### 6.5 Grafik formasyonları
| Strateji | Durum | Not |
|---|---|---|
| İkili dip / tepe | ✅ | Pivot tabanlı tespit; rastgele düzeyinde. |
| Omuz-baş-omuz ve ters OBO | ✅ | Az sinyal; tutarsız. |
| Yapı kırılımı (BOS, son pivot tepe/dip) | ✅ | Rastgele düzeyinde. |
| Üçgenler, bayrak/flama, kama, fincan-kulp, dikdörtgen | ⏳ | Algoritmik tespit mümkün ama parametreye çok duyarlı. Bulkowski'nin istatistikleri (ör. ikili dip ~%12 başarısızlık) günlük ABD hisselerinde ve kendi tanımlarıyla; bizim ölçütümüzle doğrudan karşılaştırılamaz. |

### 6.6 Çizgi çizilerek yapılan analizler
| Strateji | Durum | Not |
|---|---|---|
| Trend çizgisi kırılımı (son iki pivot) | ✅ | Gün içi nötr, **günlükte negatif** (−2,5). |
| Destek/direnç (pivot seviyeleri) | ✅ | Yapı kırılımı ile ölçüldü. |
| Kanal / regresyon kanalı | ⏳ | |
| Fibonacci düzeltme (%38,2/%50/%61,8) ve uzatma | ⏳ | Hangi tepe-dibin seçileceği özneldir; kanıt zayıf. |
| Pivot noktaları (günlük P, R1, S1) | ⏳ | Gün içi için test edilebilir. |
| Andrews dirgeni, Gann açıları | ❌ | Çizim noktası seçimi öznel. |

### 6.7 Az bilinen / ileri yaklaşımlar
| Yaklaşım | Durum | Not |
|---|---|---|
| Elliott dalgaları | ❌ | Dalga sayımı özneldir; aynı grafikte farklı sayımlar yapılabilir. Bağımsız kanıt yok. |
| Harmonik formasyonlar (Gartley, Bat, Butterfly, Crab) | ⏳ | Fibonacci oranlarıyla tanımlı; algoritmik tespit mümkün, kanıt zayıf. |
| Wyckoff (birikim/dağıtım) | ❌ | Hacim ve öznel evre tanımı gerektirir. |
| Smart Money Concepts (order block, FVG, likidite avı) | ⏳ | FVG (üç mum boşluğu) algoritmik tanımlanabilir; akademik kanıt yok. |
| Hacim/piyasa profili | ❌ | Hacim verisi gerekir. |
| Renko, Kagi, Nokta-Şekil | ⏳ | Farklı grafik tipleri; üstünde aynı kurallar denenebilir. |
| DeMark TD Sequential | ⏳ | Tanımlı sayım; test edilebilir. |
| Döngüler (Hurst), mevsimsellik | ⏳ | Özellikle mevsimsellik günlük veride test edilebilir. |

## 7. Akademik bulgular

- **Brock, Lakonishok, LeBaron (1992):** Dow Jones'ta 1897–1986 arası hareketli ortalama ve kırılım kuralları istatistiksel olarak anlamlı getiri sağladı. ([Journal of Finance](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.1992.tb04681.x))
- **Sullivan, Timmermann, White (1999):** Aynı kurallar veri madenciliği düzeltmesiyle incelendiğinde 1986 sonrası örnek dışı dönemde üstünlük kayboldu. ([Journal of Finance](https://onlinelibrary.wiley.com/doi/abs/10.1111/0022-1082.00163))
- **Lo, Mamaysky, Wang (2000):** Grafik formasyonlarını (OBO, ikili dip vb.) algoritmik tespit ettiler; bazılarının "bir miktar ek bilgi" taşıdığını buldular. ([NBER](https://www.nber.org/papers/w7613))
- **Park & Irwin (2007):** 95 modern çalışmanın 56'sı pozitif, 20'si negatif, 19'u karışık sonuç buldu; ancak çoğunda veri madenciliği, maliyet ve risk ölçümü sorunları var. Kârlılık 1990'ların başından sonra azalıyor. ([Journal of Economic Surveys](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-6419.2007.00519.x))
- **Neely, Weller, Ulrich (2009):** Dövizde teknik kuralların 1970–80'lerdeki getirileri gerçekti ama 1990'ların başında hareketli ortalama ve filtre kuralları için ortadan kalktı. ([SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1403345))
- **Marshall, Young, Rose (2006):** Mum formasyonları DJIA hisselerinde (1992–2002) rastgele işlemden anlamlı üstünlük sağlamadı. ([Journal of Banking & Finance](https://ideas.repec.org/a/eee/jbfina/v30y2006i8p2303-2323.html))
- **Moskowitz, Ooi, Pedersen (2012); Hurst, Ooi, Pedersen (2017):** 12 aylık zaman serisi momentumu (trend takibi) 58–67 vadeli piyasada ve 1880'den bu yana her on yılda pozitif getiri sağladı. Uzun vadeli, çok piyasalı ve risk yönetimli bir yaklaşım; gün içi sinyallerle aynı şey değil. ([Time Series Momentum](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2089463), [A Century of Evidence](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2993026))
- **Bulkowski (Encyclopedia of Chart Patterns):** Formasyon başarı istatistikleri yayınladı (ör. ters OBO ~%11, ikili dip ~%12 başarısızlık). Bunlar günlük ABD hisselerinde, kendi tanımları ve "başarısızlık" ölçütüyle; bizim yön isabeti ölçütümüzle doğrudan karşılaştırılamaz. ([thepatternsite.com](https://thepatternsite.com/hsb.html))

**Bizim sonuçlarımız bu tabloyla tutarlı:** Basit teknik kuralların üstünlüğü günümüz piyasalarında küçük; en fazla kanıtı uzun vadeli trend takibi ve (bu testte) orta vadeli ortalamaya dönüş taşıyor.

## 8. Sınırlamalar

- Gün içi veriler yalnızca son 60 gün (15–30dk) ve 2 yıl (1–4s). Tek bir piyasa rejimini yansıtabilir.
- 166 kombinasyon test edildi; bu kadar çok testte bazı "iyi" sonuçlar şans eseri çıkar. Tek başına bir kombinasyonun iyi görünmesi yeterli kanıt değil; tutarlı desenler (aynı strateji ailesi, komşu zaman dilimleri, verinin iki yarısı, çok sayıda enstrüman) daha değerli.
- Yön isabeti ölçüldü; stop, hedef ve pozisyon büyüklüğü ile yapılan gerçek işlem sonuçları farklı olur.
- Parametreler standart değerlerde (RSI 14, Bollinger 20/2 vb.); optimize edilmedi. Bu, sonuçları daha güvenilir kılar ama en iyi parametreleri göstermez.

## 9. Sonraki adımlar (öneri)

1. **Birleşik kurallar:** 4s dönüş sinyali + günlük trend filtresi.
2. **Stop/hedef ile gerçek işlem simülasyonu:** Kâr faktörü ve maksimum düşüş.
3. **Test edilmeyen formasyonlar:** Üçgen, bayrak, FVG, harmonikler, TD Sequential, pivot noktaları.
4. **Periyodik yeniden test:** Bu araştırmayı birkaç ayda bir tekrarlayıp uygulamadaki "Genel" sütununu güncellemek.

*Bu çalışma bilgi amaçlıdır, yatırım tavsiyesi değildir.*
