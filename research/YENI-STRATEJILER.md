# Yeni 5 strateji (video ekran görüntülerinden): kural, test, seçilen ayar

- Tüm tablolar (otomatik): `yeni-stratejiler-sonuclar.md` · kod: `src/core/setups.ts`, test: `research/yeni-stratejiler.ts`
- Veri: USDJPY, Japan 225 (`NIY=F`), Nasdaq 100 (`NQ=F`), altın (`GC=F`); 15dk (~2,5 ay), 1s ve 4s (~2,5 yıl).
- Maliyetler `ODAK-4S-15DK-KURAL.md` ile aynı (USDJPY/Nasdaq/altın varsayımları doğrulanmadı).
- **Seçim yöntemi:** her stratejinin stop/hedef seçenekleri verinin **ilk yarısında** (tüm enstrüman ve zaman dilimleri birlikte)
  net ortalama R'ye göre sıralandı; en iyisi seçildi. **İkinci yarı** seçilenin doğrulamasıdır.

## Sonuç özeti

| Strateji | Seçilen ayar | İlk yarı (seçim) | İkinci yarı (doğrulama) | Maliyetsiz (tüm veri) |
|---|---|---|---|---|
| EMA 21/55 geri çekilmesi | her geri çekilme · stop 2 ATR · **1:3** | +0,033R (921) | −0,005R (949) | +0,091R |
| Bollinger + Stokastik | dar bant filtresi (< ortalama) · stop 2 ATR · hedef karşı bant | −0,040R (1258) | −0,028R (1268) | +0,026R |
| Heikin Ashi Smoothed | ters renkte çıkış **ve ters yönde giriş** · acil stop 2 ATR | +0,014R (2273) | +0,008R (2247), t 0,2 | +0,081R |
| Üçgen formasyonları | stop 1,5 ATR · 1:3 | +0,015R (383) | −0,104R (380) | +0,045R |
| EMA 20/50 + hacim + HA | RSI 50 filtresi · EMA 20 altı kapanışta çıkış · acil stop 1,5 ATR | +0,014R (1435) | −0,040R (1510) | +0,072R |

(parantez içi: işlem sayısı; R işlem başına net ortalama)

**Değerlendirme:** Maliyetler hariç beşi de hafif pozitif (+0,03 ile +0,09R), maliyet dahil hepsi sıfır civarında.
Hiçbirinde doğrulama yarısında anlamlı kâr yok (en iyisi HA Smoothed +0,005R, t 0,1). Kullanıcı isteğiyle
uygulamaya eklendi; gerçek parayla kullanım için dayanak yok.

## Strateji başına notlar

### EMA 21/55 geri çekilmesi — ödül/risk sorusu
Kural: EMA 21 > EMA 55 (yukarı kesişimden sonra) iken mumun dibi EMA 21'e değer, kapanış EMA 21 ve EMA 55 üstünde, mum yeşil → LONG; short tersi.
- Hedef büyüdükçe ve stop genişledikçe sonuç düzenli iyileşiyor: stop 2 ATR'de 1:1 → −0,08R, 1:2 → −0,07R, 1:2,5 → −0,03R, **1:3 → +0,03R** (ilk yarı).
- Stop 1 ATR hep en kötü (fitillerle erken stop). Takip eden TP 1:2'ye göre biraz iyi, 1:3'ten iyi değil.
- "Yalnızca kesişimden sonraki ilk geri çekilme" seçeneği işlem sayısını yarıya indiriyor, sonucu iyileştirmiyor.
- En iyi zaman dilimi 4s (altında +0,32R, Nasdaq +0,08R, USDJPY +0,08R; Japan 225 −0,12R). 15dk'da negatif.

### EMA 21/55 — güncelleme (kullanıcı isteği: tekrar sinyal yok, kopuş ve mesafe şartı)
Yeni kural: EMA 21, EMA 55'i kestikten sonra **(1)** kesişim başına tek işlem (ters kesişime kadar aynı yönde yeni sinyal yok),
**(2)** geri çekilmeden önce fiyat EMA 21'den kopmuş olmalı (bir mumun dibi EMA 21'in en az X ATR üstünde; short tersi),
**(3)** girişte EMA 21 ile EMA 55 arası en az Y ATR. X ve Y 0 / 0,25 / 0,5 / 1 ve 0 / 0,5 / 1 ATR denendi.

| Kural | İşlem | İlk yarı | İkinci yarı | Maliyetsiz |
|---|---|---|---|---|
| Eski (her geri çekilme, filtre yok, 1:3) | 1.870 | +0,032R | −0,004R | +0,091R |
| **Yeni (kopuş 1 ATR, EMA arası 1 ATR, 1:3)** | 644 | +0,054R | +0,030R | +0,118R |
| Yeni, 1:2 + takip | 651 | +0,048R | +0,075R | +0,134R |
| Yeni, 1:3 + 1R'de başa baş | 652 | −0,007R | +0,014R | +0,072R |

- Filtreler yatay piyasadaki sinyallerin yaklaşık üçte ikisini eliyor; kalan işlemler ortalamada daha iyi. Komşu eşiklerin hepsi
  iki yarıda da pozitif (sonuç tek bir eşiğe bağlı değil). Yine de t < 1: kanıt zayıf.
- En iyi zaman dilimi 4s: USDJPY +0,43R, Nasdaq +0,40R, altın +0,22R (enstrüman başına 23–27 işlem, az).
- **Başa baş stop** (1R kârda stopu girişe çekmek) sonucu kötüleştirdi: kâra geçip geri dönen işlemlerin bir kısmı sonra hedefe
  gidiyordu, başa baş bunları erken kapatıyor.

### Bollinger + Stokastik
Ekran görüntüsündeki gibi uygulandı: **üst banda değip Stokastik %K (mavi) %D'yi aşağı kesince SAT**, alt bant + yukarı kesişimde AL
(mesajda "üst bantta al" yazıyordu; hedef alt bant olduğu ve görselde üst bantta SAT olduğu için satış olarak alındı).
Stokastik 14, 1, 3 (görseldeki ayar). Bant genişliği son 100 mumun ortalamasının altındaysa sinyal yok.
- Tüm seçenekler maliyet dahil negatif; hedef karşı bant, 1:1 ve 1:2 arasında belirgin fark yok.
- Dar bant filtresi sonucu iyileştiriyor (filtresiz −0,09R → filtreli −0,04R) ama pozitife çevirmiyor.
- Japan 225 15dk'da +0,22R (119 işlem, kısa dönem) tek olumlu hücre.

### Heikin Ashi Smoothed
TradingView "Smoothed Heiken Ashi" (10, 10): renk yeşile dönünce AL, kırmızıya dönünce SAT.
- En iyi çıkış: **ters renge dönünce kapat ve aynı kapanışta ters yönde gir** (görseldeki AL/SAT sırası) + acil stop 2 ATR.
  Sabit hedefler (1:1–1:3) daha kötü.
- **Düzeltme:** ilk sürümde renk dönüşü yalnızca açık işlemi kapatıyor, aynı mumdaki ters sinyal atlanıyordu (LONG'ların çoğu
  kaçıyordu). Düzeltmeden sonra işlem sayısı ~2.350'den ~4.100'e çıktı; net sonuç +0,029R'den +0,006R'ye düştü.
- **İkinci düzeltme:** acil stopla kapanan mumda renk aynı kapanışta dönerse de ters yönde işlem açılır (ör. USDJPY 4s
  14/09 11:00: SHORT mum içinde stop oldu, kapanışta renk yeşile döndü → LONG). Bu kural yalnızca bu stratejide geçerli.
- İkinci düzeltmeden sonraki testte ilk yarıda en iyi seçenek "stop 2 ATR · 1:2 + takip" çıktı (+0,023R), ama bu sabit çıkışlı
  bir sürüm ve renk dönüşünde işlemi kapatmıyor. Uygulamada kullanıcının tarif ettiği renk dönüşü çıkışı (stop 2 ATR; ilk yarı
  +0,014R) bırakıldı; ikinci yarıda ikisi aynı (+0,008R).
- Sonuç: işlem başına ≈ +0,01R, yani maliyet sonrası başa baş.

### Heikin Ashi Smoothed + ADX (ayrı strateji)
Yatay piyasayı elemek için: renk dönüşünde yalnızca ADX(14) eşiğin üstündeyse yeni işlem açılır; eşiğin altında renk dönüşü
yalnızca açık işlemi kapatır. Eşik 20 / 25 / 30, stop 1,5 / 2 ATR, çıkış renk dönüşü ya da 1:2 + takip denendi.
- İlk yarıda en iyi: ADX ≥ 30 · 1:2 + takip (+0,092R) → **ikinci yarıda −0,061R**; tutmadı.
- Renk dönüşü çıkışlı en iyi: **ADX ≥ 20 · stop 2 ATR** → ilk yarı +0,023R, ikinci yarı −0,004R (filtresiz HA: +0,014 / +0,007R).
- **Sonuç: ADX filtresi testte sonucu iyileştirmedi.** İşlem sayısı yarıya iniyor (maliyet ve ekran başında geçen süre azalır)
  ama işlem başına kazanç artmıyor. Kullanıcı isteğiyle uygulamaya ayrı strateji olarak eklendi (ADX ≥ 20, stop 2 ATR, renk dönüşü çıkışı).

### Üçgen formasyonları
Tepe/dip noktalarıyla (iki yanda 5 mum) son iki tepe ve son iki dipten direnç/destek çizgisi. Yatay = 20 mumda 0,5 ATR'den az değişim.
Yükselen üçgen (yatay direnç + yükselen destek) yukarı kırılımda AL; alçalan üçgen (düşen direnç + yatay destek) aşağı kırılımda SAT;
simetrik iki yöne. Grafikte formasyon çizgileri sarı gösterilir.
- Az işlem (15dk'da 30–44). 15dk'da açıkça negatif. 1s/4s altında pozitif; genel sonuç doğrulamada −0,10R.
- "Formasyon yüksekliği kadar hedef" 1s ve 4s'te ilk yarıda en iyiydi ama ikinci yarıda tutmadı.

### EMA 20/50 + hacim + Heikin Ashi
EMA 20 > EMA 50 iken geri çekilme (son 6 mumdaki kırmızı Heikin Ashi dizisinde dip EMA 20'ye değdi), bu sırada hacim 20 mum
ortalamasının 1,2 katını aştı, sonra Heikin Ashi yeşile döndü → AL. Short tersi.
- İstenen çıkış "mum EMA 20'ye değince" (hem kâr hem stop) test edildi: −0,02R (ilk yarı) / −0,05 ile −0,10R (ikinci yarı).
  Giriş EMA 20 yakınında olduğu için çoğu işlem bir iki mumda küçük kâr/zararla kapanıyor.
- "EMA 20 altında kapanınca çık" biraz daha iyi ve RSI(14) > 50 filtresi ekleyince ilk yarıda en iyi (+0,014R); doğrulamada −0,04R.
- USDJPY'de Yahoo hacim vermediği için hacim şartı aranmadı; vadeli verilerin hacmi FxPro CFD hacmiyle aynı değildir.

## Seçimin kararsızlığı

Aynı test bir gün sonraki veriyle yeniden çalıştırıldığında Bollinger (stop 2 → 1,5 ATR) ve üçgen (1:3 → formasyon yüksekliği)
için seçilen ayar değişti; farklar işlem başına 0,01–0,03R. Bu, ayarlar arasında gerçek bir fark olmadığını, sonuçların
gürültü düzeyinde olduğunu gösterir. Uygulamadaki ayarlar değiştirilmedi.

## Sınırlamalar
- 15dk verisi ~2,5 ay; vekil vadeli fiyatlar CFD ile aynı değil; maliyet varsayımları doğrulanmadı.
- Mum içi sıra bilinmiyor: aynı mumda stop ve hedef → stop.
- 5 strateji × 12–36 seçenek denendi; ilk yarı seçimi bu seçim yanlılığını azaltır ama ortadan kaldırmaz.
