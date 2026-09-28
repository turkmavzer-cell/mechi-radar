# Telefonla kurulum

Bilgisayar gerekmez. Adımlar cTrader ve FxPro arayüzüne göre değişebilir; farklıysa ekran görüntüsüyle bildir.

## A. Hesap (bir kez)

1. FxPro Direct (uygulama veya web) → **Yeni hesap** → Platform: **cTrader** → **Demo**.
2. Play Store'dan **cTrader** (Spotware) ya da FxPro cTrader uygulamasını kur; demo hesapla giriş yap (cTrader ID).
3. Japan 225 sembolünü bul, tam adını ve sözleşme bilgilerini (lot adımı, en küçük lot) not et.

## B. Botu yükleme (her yeni sürümde)

1. GitHub → `mechi-radar` → **Releases** → en son `trader-v…` sürümü → `MechiTrader.algo` dosyasını indir.
2. Dosyaya dokun → **cTrader ile aç** (açmazsa: cTrader → Algo → cBots → Yükle/Upload → dosyayı seç).
3. cTrader → **Algo** → **cBots** listesinde `MechiTrader` görünmeli.

## C. Başlatma

1. `MechiTrader` → **+ Örnek ekle (instance)** → sembol: Japan 225, zaman dilimi: 4s.
2. Parametreler: `Strategy = SRA`, `RiskPercent = 1` (demo), diğerleri varsayılan.
3. **Cloud'da başlat** (Start in Cloud). Telefon kapansa da bot çalışır.
4. Log sekmesinde `Başladı · SRA · Japan225 · H4 · üst TF D1` satırını gör.

## D. Takip ve durdurma

- Pozisyonlar ve bildirimler cTrader'ın kendi ekranında.
- Acil durdurma: bot örneği → **Durdur**. Açık pozisyonlar SL/TP ile brokerde kalır; istersen elle kapat.
- Parametre değiştirmek için: durdur → parametreyi değiştir → yeniden Cloud'da başlat.
