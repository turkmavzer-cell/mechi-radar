// Yerelde bir kontrol turu çalıştırır; bildirimleri konsola yazar.
// Kullanım: DATA_DIR=yerel-veri npm run radar
import { fileStore } from './fileStore';
import { buildPushMessages } from './notify';
import { runRadar } from './radar';

const dataDir = process.env.DATA_DIR || 'local-data';

runRadar({
  store: fileStore(dataDir),
  fetchFn: fetch,
  notify: async (items) => {
    for (const m of buildPushMessages(items)) console.log(`[bildirim] ${m.title}\n  ${m.body}`);
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
