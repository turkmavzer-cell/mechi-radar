import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { claimOwner, fb } from './firebase';

/**
 * loading: kontrol ediliyor · signedOut: giriş yok · owner: uygulamanın sahibi
 * denied: başka bir Google hesabı (uygulama zaten bir hesaba bağlı) · error: bağlantı hatası
 */
export type Role = 'loading' | 'signedOut' | 'owner' | 'denied' | 'error';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(fb ? 'loading' : 'signedOut');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fb) return;
    return onAuthStateChanged(fb.auth, async (u) => {
      setUser(u);
      setError(null);
      if (!u) {
        setRole('signedOut');
        return;
      }
      setRole('loading');
      try {
        setRole((await claimOwner()) ? 'owner' : 'denied');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setRole('error');
      }
    });
  }, []);

  return { user, role, error };
}

export type AuthApi = ReturnType<typeof useAuth>;
