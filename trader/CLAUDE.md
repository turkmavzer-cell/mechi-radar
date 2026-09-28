# trader/ — Claude için kurallar

Bu klasör **Mechi Trader**: Mechi Radar stratejilerini FxPro cTrader hesabında otomatik uygulayan cBot.
Önce `README.md`, sonra `docs/` altındaki belgeleri sırayla oku.

## Kullanıcı
- Türkçe konuşur; yanıtlar Türkçe, kısa, maddeli, dalkavukluksuz.
- **Yalnızca telefon** kullanır. Bilgisayar gerektiren adım önerme; gerekiyorsa açıkça "bilgisayar gerekir" de ve alternatif sun.
- Kredi kartı isteyen servis önerme.

## Değişmez kurallar
1. **Strateji kuralları `docs/02-STRATEJI-SPEC.md`'dir.** Referans uygulama `../src/core/` (TypeScript). C# Core bununla
   birebir aynı sonucu vermeli; formülü "daha iyi" diye değiştirme. Değişiklik önce Mechi Radar'da yapılır, sonra buraya taşınır.
2. **cTrader hazır indikatörlerini sinyal için kullanma**; formüller Core'da elle yazılır ve testle doğrulanır.
3. **Risk kuralları (`docs/03-RISK.md`) kodda zorunludur.** SL'siz emir, etiketsiz pozisyon, lot yuvarlayıp riski büyütme yok.
4. **Canlı hesap için kod/ayar önerme** — `docs/05-TEST-PLANI.md` §5 şartları sağlanmadan ve kullanıcı açıkça istemeden.
5. Geçmiş test sonuçlarını olduğundan iyi anlatma. Kenar ince; maliyetler hariç. "Garanti", "kesin kazanç" gibi ifade yok.
6. Core, cTrader'a bağımlı olmayan saf C#'tır; testler Linux'ta `dotnet test` ile çalışmalı.

## Derleme ve doğrulama
- Değişiklikten sonra: `dotnet build` ve `dotnet test` (trader/ içinde). Kırmızıysa push etme.
- Eşleşme testi fixture'ları Mechi Radar'dan üretilir (`research/export-fixtures.ts`, GitHub Actions). Elle CSV düzenleme.
- `.algo` sürümleri GitHub Actions ile Release'e yüklenir (`trader-v1.0.<n>`); Mechi Radar APK sürümleriyle karışmaz.

## Git
- Mechi Radar ile aynı depo (`turkmavzer-cell/mechi-radar`). Trader değişiklikleri `trader/` ve kendi workflow dosyasıyla sınırlı kalsın;
  uygulama kodunu (`src/`) değiştirmen gerekiyorsa ayrıca belirt.
