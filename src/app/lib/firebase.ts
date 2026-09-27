import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  signInWithCredential,
  signInWithPopup,
  signOut as fbSignOut,
  type Auth,
} from 'firebase/auth';
import { doc, getDoc, initializeFirestore, persistentLocalCache, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

export interface FirebaseHandles {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

const native = Capacitor.isNativePlatform();

function init(): FirebaseHandles | null {
  if (!firebaseConfig) return null;
  const app = initializeApp(firebaseConfig);
  const auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
    // Android WebView'de açılır pencere çalışmaz; orada yerel Google girişi kullanılır.
    popupRedirectResolver: native ? undefined : browserPopupRedirectResolver,
  });
  // Son veriler telefonda önbelleklenir; internet yokken de son durum görünür.
  const db = initializeFirestore(app, { localCache: persistentLocalCache() });
  return { app, auth, db };
}

export const fb = init();

export async function signInWithGoogle(): Promise<void> {
  if (!fb) throw new Error('Firebase ayarlanmamış.');
  if (native) {
    const res = await FirebaseAuthentication.signInWithGoogle();
    const idToken = res.credential?.idToken;
    if (!idToken) throw new Error('Google girişi tamamlanamadı.');
    await signInWithCredential(fb.auth, GoogleAuthProvider.credential(idToken));
  } else {
    await signInWithPopup(fb.auth, new GoogleAuthProvider());
  }
}

export async function signOut(): Promise<void> {
  if (!fb) return;
  if (native) await FirebaseAuthentication.signOut().catch(() => undefined);
  await fbSignOut(fb.auth);
}

/** İlk giriş yapan hesap uygulamanın sahibi olur (firestore.rules yalnızca bir kez yazmaya izin verir). */
export async function claimOwner(): Promise<boolean> {
  const uid = fb?.auth.currentUser?.uid;
  if (!fb || !uid) return false;
  const ref = doc(fb.db, 'meta', 'access');
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.get('owner') === uid;
  await setDoc(ref, { owner: uid, email: fb.auth.currentUser?.email ?? null, since: serverTimestamp() });
  return true;
}

/** Test bildirimi isteği bırakır; sunucu bir sonraki kontrolde (en geç ~5 dk) gönderir. */
export async function requestTestPush(): Promise<void> {
  const uid = fb?.auth.currentUser?.uid;
  if (!fb || !uid) throw new Error('Giriş gerekli.');
  await setDoc(doc(fb.db, 'requests', 'testPush'), { uid, at: serverTimestamp() });
}
