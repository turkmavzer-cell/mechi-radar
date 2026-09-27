import { Preferences } from '@capacitor/preferences';

// Küçük anahtar/değer ayarları ve son indirilen verinin önbelleği.
// Önemli veriler (izleme listesi, sinyaller) GitHub'daki data dalında durur.

export interface AppSettings {
  schemaVersion: 1;
  owner: string;
  repo: string;
  token: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: 1,
  owner: 'turkmavzer-cell',
  repo: 'mechi-radar',
  token: '',
};

async function getJson<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

async function setJson(key: string, value: unknown): Promise<void> {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

export async function loadSettings(): Promise<AppSettings> {
  const s = await getJson<Partial<AppSettings>>('settings');
  return { ...DEFAULT_SETTINGS, ...(s ?? {}), schemaVersion: 1 };
}

export const saveSettings = (s: AppSettings) => setJson('settings', s);

export const loadCache = <T>(name: string) => getJson<T>(`cache:${name}`);
export const saveCache = (name: string, value: unknown) => setJson(`cache:${name}`, value);
