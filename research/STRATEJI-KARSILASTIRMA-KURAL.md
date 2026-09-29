# Ön kayıt: günlük strateji karşılaştırması — karar kuralı

Bu dosya **sonuçlar hesaplanmadan önce** yazıldı ve ayrı bir commit olarak işlendi. Sonradan değiştirilmez.
Rapor: `STRATEJI-KARSILASTIRMA.md`.

## Adaylar (parametreler sabit, optimizasyon yok)

| Kod | Strateji | Yön | Giriş | Çıkış | Zorunlu stop |
|---|---|---|---|---|---|
| A | Donchian 55/20 (Turtle) | L+S | Kapanış > önceki 55 günün en yüksek high'ı (bugün hariç); short simetrik | Kapanış < önceki 20 günün en düşük low'u (short simetrik), o kapanışta | 2 × ATR(20) |
| B | TSMOM 12 ay | L+S | Ayın son işlem günü kapanışı: 252 günlük getiri > 0 LONG, < 0 SHORT | Sonraki ay sonu; yön değişirse çevir | 3 × ATR(20); stop sonrası ay sonuna kadar işlem yok |
| C | Connors RSI(2) + SMA 200 | L | Kapanış > SMA200 ve RSI(2) < 10 | Kapanış > SMA5 olduğunda o kapanışta; ya da 10. işlem günü kapanışı | 3 × ATR(14) |
| D | Ay dönümü (TOM) | L | Ayın sondan ikinci işlem günü kapanışı | Yeni ayın 3. işlem günü kapanışı | 3 × ATR(14) |
| E1 | SAR + EMA 200 + MACD (mevcut) | L+S | Mevcut kural | 2R hedef | 1,5 × ATR(14) |
| E2 | SRA (mevcut, üst TF haftalık) | L+S | Mevcut kural | 2R hedef | 1,5 × ATR(14) |
| F | Al ve tut | — | — | — | — (yalnız getiri ve en büyük düşüş) |

Ortak: giriş sinyal mumunun kapanışı; R = ilk stop mesafesi; aynı anda tek pozisyon; stop mum içinde kontrol edilir,
açılış stopun ötesindeyse açılış fiyatından çıkılır (A–D). Aynı mumda stop ve kural çıkışı olursa stop sayılır.
Ay sonu / ayın n. işlem günü, verideki işlem günlerinden belirlenir (borsa takvimi önceden bilinir kabulü).

## Maliyetler

Spread + kayma: işlem başına bir kez `1,5 × spread` endeks puanı. Swap: giriş ve çıkış tarihi arasındaki takvim gecesi başına
(Cuma → Pazartesi 3 gece). Komisyon 0.

| | Spread | Swap |
|---|---|---|
| Japan 225 (^N225) | 17 puan (FxPro #Japan225, gözlenen) | uzun −6,5306, kısa −3,0551 "pip": birim doğrulanmadı → (a) puan/gece, (b) yıllık % |
| S&P 500 (^GSPC) | 0,7 puan (FxPro #USSPX500, kullanıcı ekranında gözlenen) | **doğrulanmadı** → varsayım: yıllık %, Japan 225 ile aynı oranlar |
| Nasdaq 100 (^NDX) | **doğrulanmadı** → varsayım 2,0 puan | **doğrulanmadı** → varsayım: yıllık %, Japan 225 ile aynı oranlar |

**Karar için kullanılan maliyet:** her işlemde (a) ve (b) yorumlarından **yüksek olanı** (temkinli).

## Karar kuralı

Enstrüman bazında (maliyet sonrası, temkinli swap):
1. Ortalama net R/işlem **hem ilk hem ikinci yarıda > 0** (dönem, tarihe göre ortadan ikiye bölünür; işlem giriş tarihine göre atanır).
2. Tüm dönemde t-istatistiği (ortalama / (std / √n)) ≥ 2. **Sağlamazsa aday elenmez**, "kanıt yetersiz" olarak işaretlenir.
3. %1 risk, bileşik, en büyük düşüş < %30.

Aday **geçer** ancak: üç enstrümanın **en az ikisinde** hem 1. hem 3. şart sağlanıyorsa. 2. şart her enstrüman için ayrıca raporlanır.

Geçenler arasında sıralama: (maliyet sonrası R/işlem × √(yılda işlem)), 1. ve 3. şartı sağlayan enstrümanların ortalaması.
Tek "kazanan" ilan edilmez. 6 aday × 3 enstrüman = 18 deneme; seçim yanlılığı nedeniyle en iyi sonuç temkinli yorumlanır.

## Duyarlılık (seçimde kullanılmaz)

Ana parametre ±%25: A 40/15 ve 70/25; B 189 ve 315 gün; C RSI eşiği 5 ve 15; D çıkış günü 2 ve 4; E1/E2 stop 1,125 ve 1,875 ATR.
Maliyet sonrası tüm dönem ortalama R'nin işareti taban sonuçtan farklıysa (1. şartı sağlayan enstrümanlarda) "kırılgan".
