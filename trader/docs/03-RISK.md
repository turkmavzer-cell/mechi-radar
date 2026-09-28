# Risk yönetimi

Botun en önemli kısmı. Aşağıdaki kurallar **kodda zorunlu**, parametreyle kapatılamaz (yalnızca değerleri değişir).

## Pozisyon büyüklüğü

- `risk tutarı = bakiye × RiskPercent / 100`
- `hacim = risk tutarı / (stop mesafesi (pip) × pip değeri)` → sembolün lot adımına **aşağı** yuvarlanır.
- Hesaplanan hacim en küçük lotun altındaysa işlem **açılmaz** (loglanır). En küçük lota yuvarlanıp risk büyütülmez.

| Parametre | Demo varsayılanı | Canlı başlangıç |
|---|---|---|
| `RiskPercent` | 1,0 | **0,25–0,5** |
| `MaxOpenPositions` (tüm botlar) | 3 | 1–2 |

## Durdurma kuralları

| Kural | Varsayılan | Davranış |
|---|---|---|
| Günlük zarar limiti | −3R (veya bakiyenin %3'ü) | Gün sonuna kadar yeni işlem yok |
| Art arda stop | 6 | Bot yeni işlem açmaz, loglar; kullanıcı yeniden başlatır |
| Toplam düşüş (başlangıç bakiyesine göre) | %15 | Bot durur (`Stop()`), açık pozisyonlar SL/TP ile kalır |
| Spread filtresi | spread > stop mesafesinin %10'u | Sinyal atlanır |
| Veri yetersiz | < 300 mum ya da üst TF < 60 mum | Sinyal atlanır |
| `Enabled = false` | — | Acil durdurma: yeni işlem yok |

## Emir güvenliği

- Her emir **SL ve TP ile birlikte** gönderilir. SL'siz pozisyon açılmaz; emir SL/TP'siz dolarsa hemen kapatılır.
- Kayma (slippage) üst sınırı parametresi (`MaxSlippagePips`).
- Her pozisyon, bot etiketi (`Label = "MechiTrader-SRA-<sembol>-<tf>"`) ile açılır. Bot yalnızca kendi etiketli pozisyonlarını yönetir,
  kullanıcının elle açtığı işlemlere dokunmaz.
- Yeniden başlatmada bot açık pozisyonlarını etiketten tanır ve "açık pozisyon varken yeni sinyal yok" kuralını sürdürür.
- Hafta sonu / piyasa kapalıyken emir denenmez; reddedilen emir tekrar denenmez, loglanır.

## Canlıya geçiş

Yalnızca `05-TEST-PLANI.md` → "Canlıya geçiş şartları" sağlanınca ve kullanıcı açıkça onaylayınca. İlk canlı hafta `RiskPercent ≤ 0,25`.
