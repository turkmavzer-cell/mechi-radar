# Mechi Radar

İzleme listendeki hisse, endeks ve pariteleri EMA stratejileriyle takip eder. Yön değişimi olduğunda mail atar ve Android uygulamasında gösterir.

## Nasıl çalışır

```
GitHub Actions (5 dk'da bir) → Yahoo Finance mum verisi → EMA hesabı → sinyal
        ↓                                                       ↓
  "data" dalına yazar (state/signals/scan.json)          Gmail ile mail (🔔 açıksa)
        ↓
  Mechi Radar APK buradan okur, izleme listesini buraya yazar (config.json)
```

### Stratejiler

| Strateji | Kural | Mesaj |
|---|---|---|
| EMA 5·8·13 | EMA5 > EMA8 > EMA13 ve üçü de yükseliyor (düşüş: tersi). Sinyaller sırayla değişir: yükselişten sonra yeni yükseliş için önce düşüş dizilimi ve düşüş sinyali gerekir (tersi de aynı). | 15/20/30 dk: *Kısa vade*, 1/2/4 s: *Orta vade*, 1 g: *Uzun vade* … yükseliş/düşüş başlangıcı |
| EMA 20·50 pullback | Kopuş: EMA 20, EMA 50'yi aşağıdan yukarı keser → fiyat EMA 20'ye geri çekilir → geri çekilme öncesi tepenin üstünde kapanış (kırılım). EMA 50 altında kapanış senaryoyu iptal eder; yeni kesişim beklenir. Düşüş: tersi. | Pullback onayı · yükseliş/düşüş devamı |
| Üçlü Onay (MACD + RSI + Bollinger) | MACD çizgisi 0'ı keser; en fazla 3 mum öncesinde/sonrasında RSI(14) 50'yi keser (sıra fark etmez); son kesişimden sonraki 3 mum içinde Bollinger orta bandının (SMA 20) üstünde kapanan ilk mumda ok. Düşüş: tersi. Göstergeler çizilmez. | Üçlü onay · yükseliş/düşüş |
| Supertrend (10, 3) | Yön değişimi | Supertrend yükselişe/düşüşe döndü |
| Altın / Ölüm kesişimi | SMA 50, SMA 200'ü yukarı / aşağı keser | Altın kesişim / Ölüm kesişimi |
| Donchian 20 (Turtle) | Kapanış önceki 20 mumun zirvesini / dibini kırar; sinyal yalnızca kırılım yönü değişince | 20 mumun zirvesi/dibi kırıldı |
| EMA 200 filtresi | Yükseliş EMA 200 üstünde → *Güçlü*, altında → *Zayıf · tepki yükselişi*. Düşüş EMA 200 altında → *Güçlü*, üstünde → *Zayıf · düzeltme* | Etiket |

- Sinyaller yalnızca **kapanmış mumlarda** hesaplanır.
- Zaman dilimleri: 15 dk, 20 dk, 30 dk, 1 s, 2 s, 4 s, 1 g. 20 dk / 2 s / 4 s mumlar Yahoo'nun 5 dk ve 1 saatlik mumları birleştirilerek üretilir. Seanslı piyasalarda (hisse/endeks) mumlar seans açılışından başlar. Bu yüzden TradingView değerleriyle küçük farklar olabilir.
- Mail varsayılan olarak **kapalıdır**. Uygulamada enstrümanın detayından istediğin zaman dilimlerine 🔔 koyarsın.
- Tarayıcı (varsayılan BIST 30, 4 s + 1 g) saatte bir çalışır, mail atmaz.

## Kurulum (bir kez)

### 1. Gmail uygulama şifresi
1. Google hesabında **2 adımlı doğrulama** açık olmalı.
2. https://myaccount.google.com/apppasswords → ad olarak "Mechi Radar" yaz → **Oluştur**.
3. Çıkan 16 haneli şifreyi kopyala.

### 2. GitHub Secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Ad | Değer |
|---|---|
| `GMAIL_USER` | Gmail adresin (ör. `ad@gmail.com`) |
| `GMAIL_APP_PASSWORD` | 16 haneli uygulama şifresi |
| `MAIL_TO` | (isteğe bağlı) Mailin gideceği adres; boşsa `GMAIL_USER` |

Mail adresi public repoda görünmesin diye config dosyasında değil, Secrets'ta tutulur.

### 3. İlk çalıştırma ve test maili
Repo → **Actions → Radar kontrol → Run workflow** → "Test maili gönder" kutusunu işaretle → **Run**.
Birkaç dakika içinde test maili gelmeli ve `data` dalı oluşmalı. Sonrasında kontrol her 5 dakikada otomatik çalışır.

### 4. APK
`main` dalına her gönderimde **Actions → Android APK** çalışır. APK iki yerde yayınlanır:
- **Releases** (repo ana sayfası sağ tarafı): telefondan doğrudan `.apk` indirilir.
- Actions çalışmasının **Artifacts** bölümü (zip içinde).

Tüm sürümler `android/app/build.gradle` içindeki imza ayarıyla repodaki `keystore/debug.keystore` anahtarıyla imzalanır; derleme imzayı doğrular. Güncelleme eskisinin üzerine kurulur.

### 5. Uygulamada token
GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
- Repository access: **Only select repositories → mechi-radar**
- Permissions → **Contents: Read and write**

Token'ı uygulamada **Ayarlar**'a yapıştır → **Kaydet ve test et**. Token yalnızca telefonda saklanır.

## Bilinen sınırlar

- GitHub zamanlanmış işleri yoğunlukta 5–20 dk geciktirebilir, nadiren atlayabilir.
- Public repolarda 60 gün boyunca repo etkinliği olmazsa GitHub zamanlanmış işleri durdurabilir. Böyle olursa GitHub mail atar; Actions sekmesinden tek tıkla yeniden açılır.
- Yahoo Finance resmi olmayan bir kaynak. Bazı piyasalarda 15–20 dk gecikmeli; ileride erişim kısıtlanabilir.
- Bu repo public: izleme listesi ve sinyaller herkese açık görünür. Şifreler ve mail adresi Secrets'ta gizlidir.
- Teknik gösterge bilgisidir, yatırım tavsiyesi değildir.

## Geliştirme

```bash
npm install
npm test          # strateji ve sunucu testleri
npm run build     # web derlemesi (dist/)
npm run radar     # kontrolü yerelde çalıştırır (DATA_DIR=data-branch, DRY_RUN=1 ile mail atmaz)
```

- `src/core/`: ortak motor (EMA, mum birleştirme, stratejiler, Yahoo)
- `server/`: GitHub Actions betiği ve mail
- `src/app/`: React arayüzü
- `android/`: Capacitor Android projesi
