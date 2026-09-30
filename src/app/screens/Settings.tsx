import { useState } from 'react';
import { testConnection } from '../lib/github';
import type { AppSettings } from '../lib/storage';

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => Promise<void>;
  onSaved: () => void;
}

export function SettingsScreen({ settings, onSave, onSaved }: Props) {
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const clean = { ...form, token: form.token.trim(), owner: form.owner.trim(), repo: form.repo.trim() };
    try {
      const text = await testConnection(clean);
      await onSave(clean);
      onSaved();
      setMsg({ ok: true, text });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <header className="top">
        <h1>Ayarlar</h1>
      </header>

      <h2>GitHub bağlantısı</h2>
      <div className="card">
        <label>
          <span className="small muted">Token</span>
          <input
            type="password"
            value={form.token}
            onChange={(e) => setForm({ ...form, token: e.target.value })}
            placeholder="github_pat_…"
            autoComplete="off"
          />
        </label>
        <div className="two">
          <label>
            <span className="small muted">Hesap</span>
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </label>
          <label>
            <span className="small muted">Repo</span>
            <input value={form.repo} onChange={(e) => setForm({ ...form, repo: e.target.value })} />
          </label>
        </div>
        <button className="btn" onClick={save} disabled={busy}>
          {busy ? 'Kontrol ediliyor…' : 'Kaydet ve test et'}
        </button>
        {msg && <div className={`small ${msg.ok ? 'pos' : 'neg'}`}>{msg.text}</div>}
      </div>

      <h2>Token nasıl alınır</h2>
      <ol className="steps small">
        <li>GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</li>
        <li>Repository access: Only select repositories → mechi-radar</li>
        <li>Permissions → Contents: Read and write</li>
        <li>Oluşan token'ı kopyalayıp yukarıya yapıştır.</li>
      </ol>

      <h2>Nasıl çalışır</h2>
      <ul className="steps small">
        <li>GitHub her 5 dakikada bir izleme listeni kontrol eder (GitHub bazen birkaç dakika geciktirir).</li>
        <li>Sinyaller mum kapanışında kesinleşir. Mail yalnızca 🔔 açtığın zaman dilimleri için gelir.</li>
        <li>EMA 5·8·13: üç ortalama sıralı ve aynı yöne eğimliyse yön başlangıcı. Sinyaller sırayla değişir: yükseliş sinyalinden sonra yeni yükseliş için önce düşüş sinyali gelmelidir.</li>
        <li>EMA 20·50: EMA 20, EMA 50'yi yukarı keser (kopuş) → fiyat EMA 20'ye geri çekilir → geri çekilme öncesi tepenin üstünde kapanışla onay (kırılım). EMA 50 altında kapanış senaryoyu iptal eder.</li>
        <li>Üçlü Onay: MACD mavi çizgisi 0'ı keser, en fazla 3 mum öncesinde/sonrasında RSI(14) 50'yi keser ve mum Bollinger orta bandının (SMA 20) üstünde kapanır (düşüşte tersi). Grafikte sadece ok görünür.</li>
        <li>Stokastik-RSI-ATR: bir üst zaman diliminde (15/20dk→1s, 30dk→2s, 1s→4s, 2s/4s→1g, 1g→haftalık) Stokastik 20 altındayken RSI(14) kendi ortalamasını (SMA 14) yukarı keserse LONG, 80 üstündeyken aşağı keserse SHORT. Stop 1,5 ATR, hedef stop mesafesinin 2 katı. Pozisyon kapanmadan yeni sinyal verilmez; bildirimde giriş, stop ve hedef yazar.</li>
        <li>SRA + EMA 200 ve SRA + ADX: aynı strateji, tek ek şartla. EMA 200: fiyat EMA 200 üstündeyse yalnızca LONG, altındaysa yalnızca SHORT. ADX: ADX(14) 25 altındayken (güçlü trend yokken) giriş. İkisi de testte mevcut stratejiden daha iyi sonuç verdi (research/SRATR.md).</li>
        <li>SAR + MACD: Parabolic SAR fiyatın altına geçer, fiyat EMA 200 üstünde ve MACD sinyal çizgisinin üstündeyse LONG (short tersi). Squeeze: Bollinger bantları Keltner kanalının dışına çıkıp sıkışma bitince, momentum ve SMA 50 yönünde giriş. İkisinde de stop 1,5 ATR, hedef 2R.</li>
        <li>Supertrend + EMA 200, UT Bot + EMA 200 ve Connors RSI(2): USDJPY, Japan 225, Nasdaq 100 ve altında 4 saatlik/15 dakikalık maliyet dahil testte en az iki enstrümanda geçenler. Stop 1,5 ATR, hedef 2R. Kanıt zayıf: geçme oranı şans düzeyinden yüksek değil, 15 dakikalık veri yalnızca ~2,5 ay (research/ODAK-4S-15DK.md).</li>
        <li>Takip eden TP: kutulu stratejilerde hedefe (2R) ulaşınca işlem kapanmaz; stop, görülen en iyi fiyatın 1,5 ATR gerisine konur (başta ≈ +1R) ve fiyat ilerledikçe onu takip eder; fiyat dönünce kârla kapanır. Başlangıç stopu aynı kalır. Geçmiş testte tüm stratejilerde işlem başına kazancı iki katından fazla artırdı.</li>
        <li>MACD: mavi çizgi (MACD) 0'ı yukarı keserse AL, aşağı keserse SAT. Grafiğin altında MACD paneli görünür.</li>
        <li>Bollinger Dönüşü: kapanış alt bandın dışından içeri döner (▲) / üst banttan içeri (▼). Stokastik: %K, %D'yi 20 altında yukarı / 80 üstünde aşağı keser. RSI Uyumsuzluğu: fiyat yeni dip yaparken RSI daha yüksek dip yapar (▲), tepede tersi (▼).</li>
        <li>Strateji karnesi: her enstrümanın kendi geçmişinde stratejilerin 10 mum sonraki isabeti ve rastgele girişe göre farkı. "Genel" sütunu 18 enstrümanlık araştırmanın sonucudur.</li>
        <li>Supertrend (10, 3): yön değişiminde sinyal.</li>
        <li>Altın / Ölüm kesişimi: SMA 50, SMA 200'ü yukarı / aşağı keser.</li>
        <li>Donchian 20 (Turtle kırılımı): kapanış önceki 20 mumun zirvesini / dibini kırar.</li>
        <li>Sinyal geçmişindeki yüzde: sinyal kapanışından aynı stratejinin bir sonraki sinyaline (yoksa şu ana) kadar olan değişim ve bu arada görülen en iyi seviye.</li>
        <li>EMA 200 üstündeki yükseliş "Güçlü", altındaki "Zayıf · tepki yükselişi" olarak etiketlenir.</li>
        <li>Veri: Yahoo Finance (resmi olmayan, bazı piyasalarda 15–20 dk gecikmeli).</li>
      </ul>
      <p className="legend muted small">Mechi Radar teknik gösterge bilgisi verir, yatırım tavsiyesi değildir.</p>
    </div>
  );
}
