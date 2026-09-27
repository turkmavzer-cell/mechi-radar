import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import type { RadarConfig, RadarState, ScanResult, SignalEvent } from '../../src/core/types';
import { buildPushMessages, type PushMessage } from '../../server/notify';
import { runRadar, type RadarStore } from '../../server/radar';

// Firestore düzeni:
//   radar/config   izleme listesi ve tarayıcı ayarı (uygulama yazar)
//   radar/state    güncel durum      radar/signals  { items: SignalEvent[] }
//   radar/scan     tarayıcı sonucu   meta/access    { owner: uid }
//   devices/{fcmToken}  { uid, updatedAt }

setGlobalOptions({ region: 'europe-west1', maxInstances: 1 });
initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

function firestoreStore(fs: Firestore): RadarStore {
  const doc = (id: string) => fs.collection('radar').doc(id);
  return {
    async load() {
      const [c, s, g] = await fs.getAll(doc('config'), doc('state'), doc('signals'));
      return {
        config: c.exists ? (c.data() as RadarConfig) : null,
        state: s.exists ? (s.data() as RadarState) : null,
        signals: g.exists ? ((g.data()!.items as SignalEvent[]) ?? []) : [],
      };
    },
    async saveConfig(config) {
      await doc('config').set(config);
    },
    async save({ state, signals, scan }) {
      const batch = fs.batch();
      batch.set(doc('state'), state);
      batch.set(doc('signals'), { items: signals });
      if (scan) batch.set(doc('scan'), scan as ScanResult);
      await batch.commit();
    },
  };
}

async function ownerUid(): Promise<string | null> {
  const snap = await db.doc('meta/access').get();
  return (snap.get('owner') as string | undefined) ?? null;
}

async function sendPush(messages: PushMessage[], uid?: string): Promise<number> {
  let q = db.collection('devices').limit(20);
  if (uid) q = q.where('uid', '==', uid);
  const tokens = (await q.get()).docs.map((d) => d.id);
  if (!tokens.length) {
    console.log('Kayıtlı cihaz yok, bildirim gönderilmedi');
    return 0;
  }
  let sent = 0;
  for (const m of messages) {
    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: m.title, body: m.body },
      data: m.data,
      android: { priority: 'high', notification: { channelId: 'signals', sound: 'default' } },
    });
    sent += res.successCount;
    // Uygulama silinmiş / token değişmiş cihazları temizle.
    await Promise.all(
      res.responses.map((r, i) =>
        r.error?.code === 'messaging/registration-token-not-registered' || r.error?.code === 'messaging/invalid-argument'
          ? db.collection('devices').doc(tokens[i]).delete()
          : null,
      ),
    );
  }
  return sent;
}

/** Her 5 dakikada izleme listesini kontrol eder, yeni sinyalleri telefona bildirir. */
export const radarTick = onSchedule(
  { schedule: 'every 5 minutes', timeZone: 'Etc/UTC', timeoutSeconds: 240, memory: '512MiB', retryCount: 0 },
  async () => {
    const owner = await ownerUid();
    await runRadar({
      store: firestoreStore(db),
      fetchFn: fetch,
      notify: async (items) => sendPush(buildPushMessages(items), owner ?? undefined),
    });
  },
);

/** İlk giriş yapan Google hesabı uygulamanın sahibi olur; sonrakiler reddedilir. */
export const claimOwner = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Giriş gerekli');
  const ref = db.doc('meta/access');
  const owner = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.get('owner') as string | undefined;
    if (current) return current;
    tx.set(ref, { owner: uid, email: req.auth?.token.email ?? null, since: new Date().toISOString() });
    return uid;
  });
  return { isOwner: owner === uid };
});

/** Ayarlar ekranındaki "Test bildirimi gönder" düğmesi. */
export const testPush = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid || uid !== (await ownerUid())) throw new HttpsError('permission-denied', 'Yetki yok');
  const sent = await sendPush(
    [
      {
        title: 'Mechi Radar · test bildirimi',
        body: 'Bildirimler çalışıyor. Sinyaller bu şekilde gelecek.',
        data: { symbol: '', name: '', tf: '' },
      },
    ],
    uid,
  );
  return { sent };
});
