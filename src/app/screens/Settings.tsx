import { useState } from 'react';
import type { AuthApi } from '../lib/auth';
import { requestTestPush, signOut } from '../lib/firebase';
import type { PushStatus } from '../lib/push';
import { SignInCard } from '../ui';

interface Props {
  auth: AuthApi;
  pushStatus: PushStatus | null;
}

const PUSH_TEXT: Record<PushStatus, string> = {
  granted: 'Açık',
  denied: 'Kapalı. Telefon Ayarlar → Uygulamalar → Mechi Radar → Bildirimler bölümünden izin ver.',
  unsupported: 'Bu cihazda desteklenmiyor',
};

export function SettingsScreen({ auth, pushStatus }: Props) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const test = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await requestTestPush();
      setMsg({ ok: true, text: 'İstek gönderildi. Test bildirimi sunucunun bir sonraki kontrolünde, en geç ~5 dakika içinde gelir.' });
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

      <h2>Hesap</h2>
      {auth.user ? (
        <div className="card">
          <div className="kv">
            <span>Google hesabı</span>
            <b>{auth.user.email}</b>
          </div>
          {auth.role === 'denied' && (
            <div className="small neg">Bu uygulama başka bir hesaba bağlı. Çıkış yapıp doğru hesapla giriş yap.</div>
          )}
          {auth.role === 'error' && <div className="small neg">Sunucuya bağlanılamadı: {auth.error}</div>}
          <button className="btn ghost" onClick={() => signOut()}>
            Çıkış yap
          </button>
        </div>
      ) : (
        <SignInCard role={auth.role} reason="İzleme listen ve bildirimlerin Google hesabına bağlı. İlk giriş yapan hesap uygulamanın sahibi olur." />
      )}

      {auth.role === 'owner' && (
        <>
          <h2>Bildirimler</h2>
          <div className="card">
            <div className="kv">
              <span>Telefon bildirimi</span>
              <b className={pushStatus === 'granted' ? 'up' : ''}>{pushStatus ? PUSH_TEXT[pushStatus] : 'Kontrol ediliyor…'}</b>
            </div>
            <button className="btn" onClick={test} disabled={busy}>
              {busy ? 'Gönderiliyor…' : 'Test bildirimi iste'}
            </button>
            {msg && <div className={`small ${msg.ok ? 'pos' : 'neg'}`}>{msg.text}</div>}
            <div className="small muted">
              Bir enstrümanın detayına girip 🔔 ile zaman dilimi seçtiğinde, o dilimdeki yeni sinyaller telefona bildirim olarak gelir.
            </div>
          </div>
        </>
      )}

      <h2>Nasıl çalışır</h2>
      <ul className="steps small">
        <li>Sunucu (Google Apps Script) her 5 dakikada bir izleme listeni kontrol eder; sonuçlar Firebase'e yazılır.</li>
        <li>Sinyaller mum kapanışında kesinleşir. Bildirim yalnızca 🔔 açtığın zaman dilimleri için gelir.</li>
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
