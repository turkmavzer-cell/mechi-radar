# Mechi Radar

İzleme listendeki hisse, endeks ve pariteleri EMA stratejileriyle takip eder. Sinyal oluşunca telefona bildirim gönderir ve Android uygulamasında gösterir.

## Nasıl çalışır

```
Google Apps Script (5 dk'da bir, "tick")
  → Yahoo Finance mumları (toplu, paralel)
  → EMA hesabı ve sinyaller (src/core, server/radar.ts)
  → Firestore: radar/state, radar/signals, radar/scan
  → FCM: 🔔 açık zaman dilimlerindeki yeni sinyaller telefona bildirim

Mechi Radar APK
  → Google ile giriş (ilk giriş yapan hesap sahip olur)
  → Firestore'u canlı dinler, izleme listesini (radar/config) değiştirir
  → Grafik ve Keşfet için Yahoo'ya doğrudan bağlanır
```

Kredi kartı gerekmez: Firebase ücretsiz planda (Firestore, Auth, FCM), zamanlanmış kontrol Apps Script'te çalışır.

### Stratejiler

| Strateji | Kural | Mesaj |
|---|---|---|
| EMA 5·8·13 | EMA5 > EMA8 > EMA13 ve üçü de yükseliyor (düşüş: tersi). Sinyaller sırayla değişir: yükselişten sonra yeni yükseliş için önce düşüş dizilimi ve düşüş sinyali gerekir (tersi de aynı). | 15/20/30 dk: *Kısa vade*, 1/2/4 s: *Orta vade*, 1 g: *Uzun vade* … yükseliş/düşüş başlangıcı |
| EMA 20·50 pullback | Kopuş: EMA 20, EMA 50'yi aşağıdan yukarı keser → fiyat EMA 20'ye geri çekilir → geri çekilme öncesi tepenin üstünde kapanış (kırılım). EMA 50 altında kapanış senaryoyu iptal eder; yeni kesişim beklenir. Düşüş: tersi. | Pullback onayı · yükseliş/düşüş devamı |
| Üçlü Onay (MACD + RSI + Bollinger) | MACD çizgisi 0'ı keser; en fazla 3 mum öncesinde/sonrasında RSI(14) 50'yi keser (sıra fark etmez); son kesişimden sonraki 3 mum içinde Bollinger orta bandının (SMA 20) üstünde kapanan ilk mumda ok. Düşüş: tersi. Göstergeler çizilmez. | Üçlü onay · yükseliş/düşüş |
| MACD (12, 26, 9) | MACD çizgisi 0'ı yukarı keser (AL) / aşağı keser (SAT). Grafikte alt panelde MACD, sinyal ve histogram. | MACD sıfırı yukarı/aşağı kesti |
| Stokastik-RSI-ATR | Bir üst zaman diliminde Stokastik %K (14,3,3) son 3 kapanmış mumdan birinde 20 altı (long) / 80 üstü (short) iken RSI(14) kendi SMA 14'ünü yukarı / aşağı keser; mum kapanışında giriş. Stop giriş ∓ 1,5×ATR(14), hedef 2R. Pozisyon hedef/stopla kapanır. Test: `research/SRATR.md`. | LONG/SHORT GİRİŞ · Stop · Hedef |
| SRA + EMA 200 / SRA + ADX | Stokastik-RSI-ATR'ye tek ek şart: fiyat EMA 200'ün sinyal yönündeki tarafında olmalı / ADX(14) < 25. Testte ikisi de hem seçim hem doğrulama yarısında mevcut stratejiden iyi çıktı. | LONG/SHORT GİRİŞ · Stop · Hedef |
| Supertrend (10, 3) | Yön değişimi | Supertrend yükselişe/düşüşe döndü |
| Altın / Ölüm kesişimi | SMA 50, SMA 200'ü yukarı / aşağı keser | Altın kesişim / Ölüm kesişimi |
| Donchian 20 (Turtle) | Kapanış önceki 20 mumun zirvesini / dibini kırar; sinyal yalnızca kırılım yönü değişince | 20 mumun zirvesi/dibi kırıldı |
| EMA 200 filtresi | Yükseliş EMA 200 üstünde → *Güçlü*, altında → *Zayıf · tepki yükselişi*. Düşüş EMA 200 altında → *Güçlü*, üstünde → *Zayıf · düzeltme* | Etiket |

- Sinyaller yalnızca **kapanmış mumlarda** hesaplanır.
- Zaman dilimleri: 15 dk, 20 dk, 30 dk, 1 s, 2 s, 4 s, 1 g. 20 dk / 2 s / 4 s mumlar 5 dk ve 1 saatlik mumlar birleştirilerek üretilir; TradingView değerleriyle küçük farklar olabilir.
- Bildirim varsayılan olarak **kapalıdır**; enstrüman detayında 🔔 ile zaman dilimi seçilir.
- Tarayıcı (varsayılan BIST 30, 4 s + 1 g) saatte bir çalışır, bildirim göndermez.

## Bileşenler

| Klasör | İçerik |
|---|---|
| `src/core/` | Ortak motor: EMA, mum birleştirme, stratejiler, Yahoo istemcisi, etiketler |
| `server/` | Kontrol turu (`radar.ts`), bildirim metinleri, yerel test için dosya deposu |
| `apps-script/` | Apps Script giriş noktası (`tick`, `doGet`), Firestore REST dönüştürücü, manifest |
| `src/app/` | React arayüzü (Radar, Keşfet, Tarayıcı, Ayarlar) |
| `android/` | Capacitor Android projesi (`google-services.json` dahil) |
| `firestore.rules` | Yalnızca sahip hesabın okuyup yazabilmesi |

Firebase projesi: `banded-elevator-478108-q9` ("Mechi Radar").

## APK

`main` dalına her gönderimde **Actions → Android APK** çalışır ve APK'yı **Releases** bölümüne koyar (telefondan doğrudan indirilir). Tüm sürümler `android/app/build.gradle` içindeki imza ayarıyla repodaki `keystore/debug.keystore` anahtarıyla imzalanır; derleme imzayı doğrular. Güncelleme eskisinin üzerine kurulur.

## Bilinen sınırlar

- Apps Script ücretsiz hesaplarda günde toplam 90 dakika tetikleyici çalışma süresi verir. Her tur birkaç saniye sürdüğü için 5 dakikalık aralık bu sınırın altında kalır; izleme listesi çok büyürse aralık 10 dakikaya çıkarılmalı.
- Google zamanlanmış tetikleyicileri zaman zaman birkaç dakika geciktirebilir.
- Yahoo Finance resmi olmayan bir kaynak; bazı piyasalarda 15–20 dk gecikmeli ve ileride erişim kısıtlanabilir.
- Teknik gösterge bilgisidir, yatırım tavsiyesi değildir.

## Geliştirme

```bash
npm install
npm test               # strateji ve kontrol turu testleri
npm run build          # web derlemesi (dist/)
npm run build:script   # Apps Script paketi (apps-script/dist/)
npm run radar          # kontrol turunu yerelde çalıştırır (local-data/ klasörüne yazar)
```
