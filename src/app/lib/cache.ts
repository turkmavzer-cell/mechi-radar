// Ekranların son hesaplanan sonuçlarını hızlı açılış için saklar.
// Kaybolması sorun değil (yeniden hesaplanır); önemli veri burada tutulmaz.
const PREFIX = 'mechi-cache:';

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Depolama doluysa veya kapalıysa önbelleksiz devam edilir.
  }
}
