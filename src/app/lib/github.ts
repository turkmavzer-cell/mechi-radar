import type { AppSettings } from './storage';

// Veriler reponun "data" dalında durur: config.json, state.json, signals.json, scan.json.
const BRANCH = 'data';
const API = 'https://api.github.com';

function decodeBase64(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function headers(s: AppSettings): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (s.token) h.Authorization = `Bearer ${s.token.trim()}`;
  return h;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function explain(status: number): string {
  if (status === 401) return 'Token geçersiz veya süresi dolmuş.';
  if (status === 403) return 'Token yetkisi yetersiz ya da istek sınırı aşıldı.';
  if (status === 404) return 'Dosya veya repo bulunamadı. İlk kontrol henüz çalışmamış olabilir.';
  return `GitHub hatası (${status}).`;
}

export async function readFile<T>(s: AppSettings, path: string): Promise<{ data: T; sha: string } | null> {
  if (!s.token) {
    // Token yoksa herkese açık ham dosya okunur (GitHub önbelleği yüzünden birkaç dakika gecikebilir).
    const res = await fetch(`https://raw.githubusercontent.com/${s.owner}/${s.repo}/${BRANCH}/${path}?t=${Date.now()}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new GitHubError(explain(res.status), res.status);
    return { data: (await res.json()) as T, sha: '' };
  }
  const res = await fetch(`${API}/repos/${s.owner}/${s.repo}/contents/${path}?ref=${BRANCH}&t=${Date.now()}`, {
    headers: headers(s),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new GitHubError(explain(res.status), res.status);
  const j = (await res.json()) as { content?: string; sha: string; download_url?: string };
  if (j.content) return { data: JSON.parse(decodeBase64(j.content)) as T, sha: j.sha };
  // 1 MB üstü dosyalarda içerik gelmez; indirme adresinden okunur.
  const raw = await fetch(j.download_url!, { headers: headers(s) });
  return { data: (await raw.json()) as T, sha: j.sha };
}

async function writeFile(s: AppSettings, path: string, data: unknown, sha: string, message: string) {
  const res = await fetch(`${API}/repos/${s.owner}/${s.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(s), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      branch: BRANCH,
      sha: sha || undefined,
      content: encodeBase64(JSON.stringify(data, null, 1) + '\n'),
    }),
  });
  if (!res.ok) throw new GitHubError(explain(res.status), res.status);
}

/** Dosyayı okuyup değiştirir ve yazar; araya başka bir yazma girerse yeniden dener. */
export async function updateFile<T>(
  s: AppSettings,
  path: string,
  mutate: (current: T) => T,
  message: string,
): Promise<T> {
  if (!s.token) throw new GitHubError('Değişiklik için Ayarlar ekranından GitHub token girilmeli.', 401);
  for (let attempt = 0; ; attempt++) {
    const cur = await readFile<T>(s, path);
    if (!cur) throw new GitHubError(explain(404), 404);
    const next = mutate(cur.data);
    try {
      await writeFile(s, path, next, cur.sha, message);
      return next;
    } catch (err) {
      if (attempt < 2 && err instanceof GitHubError && (err.status === 409 || err.status === 422)) continue;
      throw err;
    }
  }
}

export async function testConnection(s: AppSettings): Promise<string> {
  const res = await fetch(`${API}/repos/${s.owner}/${s.repo}`, { headers: headers(s) });
  if (!res.ok) throw new GitHubError(explain(res.status), res.status);
  const j = (await res.json()) as { permissions?: { push?: boolean } };
  if (!s.token) return 'Repo bulundu. Token girilmediği için yalnızca görüntüleme yapılabilir.';
  if (!j.permissions?.push) throw new GitHubError('Token bu repoya yazma yetkisine sahip değil (Contents: Read and write gerekli).', 403);
  return 'Bağlantı başarılı. İzleme listesini uygulamadan değiştirebilirsin.';
}
