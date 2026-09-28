# Mechi Radar — Claude için kurallar

## Kullanıcı
- Türkçe konuşur; yanıtlar Türkçe, kısa, maddeli, dalkavukluksuz.
- **Yalnızca telefon** kullanır; bilgisayar gerektiren adım önerme.
- Kredi kartı isteyen servis önerme.
- **Soru sorduğunda sadece cevap ver; kod değiştirme, dosya yazma, push yapma.** İş yapılmasını açıkça isterse yap.

## Proje
- React + Vite + TypeScript + Capacitor Android uygulaması. APK, `main`'e push edilince GitHub Actions ile derlenip Releases'e yüklenir.
- Strateji kodu `src/core/`; geçmiş veri testleri `research/` (Yahoo verisi bu ortamdan erişilemez, testler `research-sratr.yml` ile GitHub Actions'ta çalışır).
- Firebase geçişi `firebase-gecis` dalında (yerelde `gecis`); `main` değişiklikleri oraya birleştirilir.
- Otomatik işlem botu ayrı depoda: `turkmavzer-cell/Mechi-Trader` (strateji kodu oraya `reference/` olarak kopyalanır).
- Değişiklikten sonra: `npx tsc --noEmit -p .`, `npm test`, `npm run build`.
