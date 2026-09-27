import { useEffect, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useRadarData } from './lib/data';
import { loadSettings, saveSettings, type AppSettings } from './lib/storage';
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

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'radar', label: 'Radar', icon: '◎' },
  { id: 'explore', label: 'Keşfet', icon: '⌕' },
  { id: 'scanner', label: 'Tarayıcı', icon: '☰' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙' },
];

export function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [tab, setTab] = useState<Tab>('radar');
  const [detail, setDetail] = useState<OpenTarget | null>(null);
  const api = useRadarData(settings);
  const detailRef = useRef(detail);
  detailRef.current = detail;

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

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

  const updateSettings = async (s: AppSettings) => {
    await saveSettings(s);
    setSettings(s);
  };

  if (!settings) return <div className="splash">Mechi Radar</div>;

  return (
    <div className="shell">
      <main className="content">
        {tab === 'radar' && <RadarScreen api={api} onOpen={setDetail} hasToken={!!settings.token} />}
        {tab === 'explore' && <ExploreScreen onOpen={setDetail} />}
        {tab === 'scanner' && <ScannerScreen api={api} onOpen={setDetail} />}
        {tab === 'settings' && <SettingsScreen settings={settings} onSave={updateSettings} onSaved={api.refresh} />}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="ico">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      {detail && <DetailScreen target={detail} api={api} hasToken={!!settings.token} onClose={() => setDetail(null)} />}
    </div>
  );
}
