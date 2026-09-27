import { useEffect, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useAuth } from './lib/auth';
import { useRadarData } from './lib/data';
import { fb } from './lib/firebase';
import { initPush, type PushStatus } from './lib/push';
import { RadarScreen } from './screens/Radar';
import { ExploreScreen } from './screens/Explore';
import { ScannerScreen } from './screens/Scanner';
import { SettingsScreen } from './screens/Settings';
import { DetailScreen } from './screens/Detail';

type Tab = 'radar' | 'explore' | 'scanner' | 'settings';

export interface OpenTarget {
  symbol: string;
  name: string;
}

interface Toast {
  title: string;
  body: string;
  target: OpenTarget | null;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'radar', label: 'Radar', icon: '◎' },
  { id: 'explore', label: 'Keşfet', icon: '⌕' },
  { id: 'scanner', label: 'Tarayıcı', icon: '☰' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('radar');
  const [detail, setDetail] = useState<OpenTarget | null>(null);
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const auth = useAuth();
  const api = useRadarData(auth.role === 'owner');
  const detailRef = useRef(detail);
  detailRef.current = detail;

  // Android geri tuşu: önce detay ekranını kapat, sonra uygulamadan çık.
  useEffect(() => {
    const sub = CapApp.addListener('backButton', () => {
      if (detailRef.current) setDetail(null);
      else CapApp.exitApp();
    });
    return () => {
      sub.then((s) => s.remove());
    };
  }, []);

  // Sahip hesapla giriş yapılınca bildirim izni istenir ve cihaz kaydedilir.
  const uid = auth.user?.uid;
  useEffect(() => {
    if (auth.role !== 'owner' || !uid) return;
    initPush(uid, {
      onOpen: (t) => setDetail(t),
      onForeground: (title, body, target) => setToast({ title, body, target }),
    })
      .then(setPushStatus)
      .catch(() => setPushStatus('denied'));
  }, [auth.role, uid]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(id);
  }, [toast]);

  if (!fb) {
    return (
      <div className="content">
        <header className="top">
          <h1>Mechi Radar</h1>
        </header>
        <div className="notice">Firebase ayarları bu sürümde yok. Uygulamanın güncel sürümünü kur.</div>
      </div>
    );
  }

  return (
    <div className="shell">
      <main className="content">
        {tab === 'radar' && <RadarScreen api={api} role={auth.role} onOpen={setDetail} />}
        {tab === 'explore' && <ExploreScreen onOpen={setDetail} />}
        {tab === 'scanner' && <ScannerScreen api={api} role={auth.role} onOpen={setDetail} />}
        {tab === 'settings' && <SettingsScreen auth={auth} pushStatus={pushStatus} />}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="ico">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      {detail && <DetailScreen target={detail} api={api} role={auth.role} onClose={() => setDetail(null)} />}
      {toast && (
        <button
          className="toast"
          onClick={() => {
            if (toast.target) setDetail(toast.target);
            setToast(null);
          }}
        >
          <b>{toast.title}</b>
          <span>{toast.body}</span>
        </button>
      )}
    </div>
  );
}
