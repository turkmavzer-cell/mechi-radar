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
import { initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { firebaseConfig } from './firebaseConfig';

export interface FirebaseHandles {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
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
  const functions = getFunctions(app, 'europe-west1');
  return { app, auth, db, functions };
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

export async function claimOwner(): Promise<boolean> {
  if (!fb) return false;
  const res = await httpsCallable<unknown, { isOwner: boolean }>(fb.functions, 'claimOwner')({});
  return res.data.isOwner;
}

export async function sendTestPush(): Promise<number> {
  if (!fb) return 0;
  const res = await httpsCallable<unknown, { sent: number }>(fb.functions, 'testPush')({});
  return res.data.sent;
}
