# Platform kararı

Kısıt: kullanıcı yalnızca telefon kullanıyor, kredi kartı gerektiren servislerden kaçınıyor, hesap FxPro'da.

## Seçenekler

| | **cTrader cBot + cTrader Cloud** | MT5 Expert Advisor + VPS | cTrader Open API + kendi sunucu |
|---|---|---|---|
| Dil | C# (.NET) | MQL5 | Herhangi (TypeScript olabilir) |
| 7/24 çalışma | cTrader Cloud, **ücretsiz** | Windows VPS (MQL5 VPS ~10–15 $/ay veya FxPro VPS şartlı) | Sürekli açık sunucu gerekir (çoğu kart ister) |
| Telefondan başlatma | **Evet** (cTrader Mobile → Cloud) | Hayır; kurulum masaüstü MT5'ten, VPS'e Uzak Masaüstü | Sunucuya bağlı |
| Derleme | `dotnet build` + `cTrader.Automate` NuGet → `.algo` (GitHub Actions'ta yapılabilir) | MetaEditor (Windows) | Normal derleme |
| Geçmiş test | cTrader masaüstü; ayrıca Mechi Radar'ın kendi test motoru | MT5 Strategy Tester (masaüstü) | Kendi motorumuz |
| Kısıt | Demo hesapta aynı anda **1**, canlıda **10** bulut örneği; bulutta dosya/ağ erişimi kısıtlı | VPS maliyeti, bilgisayar ihtiyacı | En çok iş, OAuth uygulama onayı |

**Karar: cTrader cBot + cTrader Cloud.** Tek telefonla kurulabilen, ücretsiz ve 7/24 çalışan tek seçenek.

Alternatif: kullanıcı ileride bilgisayar edinirse ya da cTrader Cloud kısıtları (1 demo örneği vb.) yetmezse MT5 EA yazılabilir.
Strateji kuralları platformdan bağımsız olarak `02-STRATEJI-SPEC.md`'de tanımlı olduğu için geçiş mümkün.

## Doğrulanması gerekenler (Aşama 0)

Aşağıdakiler web kaynaklarına dayanıyor; kodlamaya başlamadan önce kullanıcının hesabında kontrol edilmeli:

1. FxPro'da **cTrader** hesabı (demo) açılabiliyor mu? (FxPro, MT4/MT5 yanında cTrader da sunuyor.)
2. FxPro cTrader Mobile'da **Algo → cBot → Cloud'da başlat** seçeneği görünüyor mu?
3. cTrader Mobile, GitHub'dan indirilen bir `.algo` dosyasını **açıp yükleyebiliyor mu**?
4. FxPro cTrader'da Japan 225 sembolünün **tam adı**, lot adımı, en küçük lot, işlem saatleri ve tipik spread.
5. Bulutta çalışan cBot'un `MarketData.GetBars(TimeFrame.Hour4)` gibi **başka zaman dilimi** verisine erişebildiği.

## Kaynaklar

- Spotware: [cTrader 5.0 — ücretsiz algo barındırma ve bulutta çalıştırma](https://www.spotware.com/news/ctrader-5-0/)
- cTrader Help: [Cloud features](https://help.ctrader.com/ctrader-algo/documentation/cloud-features/), [Start a cBot](https://help.ctrader.com/cbots/how-tos/start-a-cbot/), [Install algos](https://help.ctrader.com/ctrader-algo/how-tos/all-algos/install-algos/), [Visual Studio ve diğer IDE'ler](https://help.ctrader.com/ctrader-algo/documentation/visual-studio-ides/)
- NuGet: [cTrader.Automate](https://www.nuget.org/packages/cTrader.Automate/)
- MT5: [MetaTrader VPS](https://www.metatrader5.com/en/trading-platform/vps) — mobil MT5 EA çalıştırmaz, VPS masaüstü terminalden kiralanır
- FxPro: [VPS SSS](https://www.fxpro.com/help-section/faq/vps)
