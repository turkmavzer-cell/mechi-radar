import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { fb } from './firebase';

export type PushStatus = 'unsupported' | 'denied' | 'granted';

export interface PushTarget {
  symbol: string;
  name: string;
}

export interface PushHandlers {
  /** Bildirime dokunulduğunda. */
  onOpen: (t: PushTarget) => void;
  /** Uygulama açıkken gelen bildirim (Android bunu kendiliğinden göstermez). */
  onForeground: (title: string, body: string, t: PushTarget | null) => void;
}

let listening = false;
let currentUid: string | null = null;

/** Bildirim iznini ister, cihazı kaydeder ve FCM token'ını Firestore'a yazar. */
export async function initPush(uid: string, handlers: PushHandlers): Promise<PushStatus> {
  if (!Capacitor.isNativePlatform() || !fb) return 'unsupported';
  currentUid = uid;

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive !== 'granted') perm = await PushNotifications.requestPermissions();
  if (perm.receive !== 'granted') return 'denied';

  await PushNotifications.createChannel({
    id: 'signals',
    name: 'Sinyaller',
    description: 'EMA sinyal bildirimleri',
    importance: 5,
    visibility: 1,
    vibration: true,
  });

  if (!listening) {
    listening = true;
    const handles = fb;
    await PushNotifications.addListener('registration', async (token) => {
      if (!currentUid) return;
      await setDoc(doc(handles.db, 'devices', token.value), {
        uid: currentUid,
        platform: 'android',
        updatedAt: serverTimestamp(),
      });
    });
    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Bildirim kaydı başarısız', err);
    });
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const d = action.notification.data as Partial<PushTarget> | undefined;
      if (d?.symbol) handlers.onOpen({ symbol: d.symbol, name: d.name || d.symbol });
    });
    await PushNotifications.addListener('pushNotificationReceived', (n) => {
      const d = n.data as Partial<PushTarget> | undefined;
      handlers.onForeground(n.title ?? '', n.body ?? '', d?.symbol ? { symbol: d.symbol, name: d.name || d.symbol } : null);
    });
  }
  await PushNotifications.register();
  return 'granted';
}
