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
        <li>EMA 5·8·13: üç ortalama sıralı ve aynı yöne eğimliyse yön başlangıcı.</li>
        <li>EMA 20·50: EMA 20, EMA 50'yi yukarı keser (kopuş) → fiyat EMA 20'ye geri çekilir → geri çekilme öncesi tepenin üstünde kapanışla onay (kırılım). EMA 50 altında kapanış senaryoyu iptal eder.</li>
        <li>Üçlü Onay: MACD 0'ı, RSI(14) 50'yi ve fiyat Bollinger orta bandını (SMA 20) aynı yönde keser; üçü en fazla 10 mum arayla. Grafikte sadece ok görünür.</li>
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
