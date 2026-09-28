# Mechi Trader

Mechi Radar'daki kutulu stratejileri (önce **SRA · Stokastik-RSI-ATR**) FxPro hesabında **otomatik** çalıştıran işlem botu.
Sinyal geldiğinde pozisyonu açar, stop ve hedefi koyar; pozisyon hedef ya da stopla kapanır.

> **Durum:** Planlama. Kod henüz yazılmadı. Başlamak için `PROJE_PROMPTU.md` içeriğini yeni bir Claude Code oturumuna ver.

## Neden cTrader Cloud

Kullanıcı yalnızca telefon kullanıyor. MT5 mobil uygulaması Expert Advisor çalıştıramıyor; MT5 için masaüstü + 7/24 açık bir
Windows VPS (aylık ücretli) gerekiyor. cTrader ise cBot'ları **ücretsiz bulutta** 7/24 çalıştırıyor ve bot **telefondan** başlatılabiliyor.
Ayrıntı ve alternatifler: [`docs/01-PLATFORM-KARARI.md`](docs/01-PLATFORM-KARARI.md).

```
GitHub (C# kaynak) ──Actions: dotnet build──▶ .algo dosyası (Release)
                                                   │ telefonda indir, cTrader Mobile ile aç
                                                   ▼
                                    cTrader Mobile ─▶ cBot'u "Cloud"da başlat
                                                   │
                                                   ▼
                                     cTrader Cloud (7/24) ─▶ FxPro hesabı: emir, stop, hedef
```

## Belgeler

| Dosya | İçerik |
|---|---|
| [`PROJE_PROMPTU.md`](PROJE_PROMPTU.md) | Projeyi baştan kurduracak hazır prompt |
| [`CLAUDE.md`](CLAUDE.md) | Bu klasörde çalışan Claude oturumları için kurallar |
| [`docs/01-PLATFORM-KARARI.md`](docs/01-PLATFORM-KARARI.md) | cTrader Cloud / MT5 + VPS / cTrader Open API karşılaştırması |
| [`docs/02-STRATEJI-SPEC.md`](docs/02-STRATEJI-SPEC.md) | Stratejilerin birebir kuralları ve indikatör formülleri |
| [`docs/03-RISK.md`](docs/03-RISK.md) | Pozisyon büyüklüğü, günlük zarar limiti, acil durdurma |
| [`docs/04-MIMARI.md`](docs/04-MIMARI.md) | cBot yapısı, parametreler, loglama, derleme hattı |
| [`docs/05-TEST-PLANI.md`](docs/05-TEST-PLANI.md) | Mechi Radar ile eşleşme testi, demo ileri testi, canlıya geçiş şartları |
| [`docs/06-TELEFON-KURULUM.md`](docs/06-TELEFON-KURULUM.md) | Sadece telefonla kurulum adımları |
| [`docs/07-YOL-HARITASI.md`](docs/07-YOL-HARITASI.md) | Aşamalar ve yapılacaklar listesi |

## Önemli uyarılar

- **Önce demo.** Canlı hesaba geçiş, `docs/05-TEST-PLANI.md`'deki şartlar sağlanmadan yapılmaz.
- Geçmiş test sonuçları (Mechi Radar `research/`) spread/komisyon hariçtir ve kenar incedir: SRA'da işlem başına ortalama
  +0,01…+0,08R. Japan 225 4s'te son 11 ayda sonuç başa baş (+2R / 55 işlem). Otomatik işlem bu tabloyu iyileştirmez; sadece uygular.
- Kaldıraçlı CFD işlemleri sermayenin tamamını kaybettirebilir.
- Türkiye'de yerleşik kişilerin SPK lisansı olmayan yurt dışı aracı kurumlarla işlem yapması hukuken sorunlu olabilir.
  Bu projenin kapsamı dışında, kullanıcının sorumluluğundadır.
- Bu proje yatırım tavsiyesi değildir.
