# Yol haritası

## Aşama 0 — Doğrulama (kullanıcı, telefon)
- [ ] FxPro cTrader demo hesabı açıldı
- [ ] cTrader Mobile'da Algo → cBots → Cloud seçeneği var
- [ ] Deneme `.algo` dosyası telefondan yüklenebildi (Aşama 1'deki "Merhaba" botu)
- [ ] Japan 225 sembol adı, lot adımı, en küçük lot, tipik spread not edildi

## Aşama 1 — İskelet ve derleme hattı
- [ ] `trader/` .NET çözümü: Core, Bot, Tests
- [ ] GitHub Actions: test + `.algo` derleme + Release (`trader-v1.0.<n>`)
- [ ] "Merhaba" cBot: başlayınca sembol, zaman dilimi, bakiye ve üst TF son kapanmış mumunu loglar; işlem açmaz

## Aşama 2 — Core: indikatörler ve SRA
- [ ] Sma, Rma, Ema, Rsi, Stoch, Atr (+ birim testleri)
- [ ] Üst zaman dilimi eşlemesi + haftalık birleştirme
- [ ] SRA sinyali ve pozisyon simülasyonu (Mechi Radar `simulate` ile aynı)
- [ ] Mechi Radar'da `research/export-fixtures.ts` + GitHub Actions ile CSV üretimi
- [ ] Eşleşme testleri yeşil

## Aşama 3 — Bot: emir ve risk
- [ ] Hacim hesabı, SL/TP'li piyasa emri, etiket
- [ ] Günlük limit, art arda stop, toplam düşüş, spread filtresi, `Enabled`
- [ ] Yeniden başlatmada açık pozisyonu tanıma
- [ ] Demo'da ilk işlem (kullanıcı kontrol eder)

## Aşama 4 — Demo ileri testi (en az 8 hafta)
- [ ] Haftalık kontrol listesi (`05-TEST-PLANI.md` §4)
- [ ] Canlıya geçiş şartları değerlendirmesi

## Aşama 5 — Genişletme (isteğe bağlı)
- [ ] SRA + EMA 200, SRA + ADX, SAR + MACD, Squeeze
- [ ] Birden fazla sembol / zaman dilimi (canlıda en fazla 10 bulut örneği)
- [ ] Canlı hesap (kullanıcı onayıyla, düşük risk)
