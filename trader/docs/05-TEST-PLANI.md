# Test planı

## 1. Birim testleri (her derlemede)

- Her indikatör için küçük elle hesaplanmış örnekler (ör. RSI'ın ilk geçerli değeri, Stokastik en yüksek = en düşük durumu).
- Üst zaman dilimi eşlemesi: oluşan üst mum asla kullanılmıyor; haftalık birleştirme Pazartesi 00:00 UTC.
- Risk: hacim lot adımına aşağı yuvarlanıyor, en küçük lotun altında işlem yok, günlük limit ve art arda stop sayacı.

## 2. Mechi Radar ile eşleşme (parity) testi

Amaç: aynı mumlar verildiğinde C# Core'un Mechi Radar ile **birebir aynı** sinyalleri üretmesi.

1. Mechi Radar deposuna `research/export-fixtures.ts` betiği eklenir. Birkaç sembol ve zaman dilimi için (Japan 225 dahil)
   mumları ve beklenen sonuçları CSV olarak `trader/fixtures/` klasörüne yazar:
   - `candles_<sembol>_<tf>.csv`: `t,o,h,l,c`
   - `higher_<sembol>_<tf>.csv`: üst zaman dilimi mumları
   - `expected_<strateji>_<sembol>_<tf>.csv`: `i,dir,entry,stop,target,exitI,outcome`
   - `indicators_<sembol>_<tf>.csv`: RSI, RSI ortalaması, üst TF %K, ATR (her mum için)
2. xUnit testi, CSV mumlarını Core'a verir ve sonuçları karşılaştırır:
   - İndikatörler: mutlak fark < 1e-9.
   - Sinyaller ve simülasyon sonuçları: **tam eşleşme** (indeks, yön, sonuç).
3. Veri Yahoo'dan geldiği için betik GitHub Actions'ta çalıştırılır (`research-sratr.yml` benzeri) ve CSV'ler depoya işlenir.

## 3. cTrader geçmiş testi (isteğe bağlı)

cTrader masaüstü gerektirir. Bilgisayar olmadığı sürece atlanır. Mechi Radar geçmiş testleri yerine geçer.

## 4. Demo ileri testi (zorunlu)

- FxPro cTrader **demo** hesabı, cTrader Cloud'da 1 bot örneği (demo sınırı), `RiskPercent = 1`.
- Önerilen: Japan 225, 4s, SRA (Mechi Radar testinde en tutarlı sonuç veren sembol ve zaman dilimi). En az **8 hafta**.
- Her hafta kontrol:
  - Botun açtığı her işlemin Mechi Radar grafiğinde aynı mumda LONG/SHORT kutusu var mı? Yoksa neden (veri farkı, spread filtresi, lot)?
  - SL/TP her pozisyonda var mı, doğru mesafede mi?
  - Gerçek spread ve kayma, stop mesafesinin yüzde kaçı?

## 5. Canlıya geçiş şartları (hepsi)

1. Eşleşme testleri yeşil.
2. Demo'da en az 8 hafta ve en az 20 kapanmış işlem.
3. Demo'da kural dışı davranış yok: SL'siz pozisyon, çift pozisyon, limit aşımı, etiketsiz işlem.
4. Demo sonucu, maliyetler dahil, aynı dönemin Mechi Radar sonucundan belirgin kötü değil (fark büyükse nedeni bulunmuş olmalı).
5. Kullanıcı açık onay verdi. İlk canlı hafta `RiskPercent ≤ 0,25`.

> Not: 20–30 işlem, stratejinin kârlı olduğunu **kanıtlamaz**; yalnızca botun kurallara uygun çalıştığını gösterir.
