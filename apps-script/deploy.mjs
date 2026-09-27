// Apps Script projesini oluşturur/günceller ve web uygulaması olarak yayınlar.
// Kullanım: SCRIPT_TOKEN=<script.projects + script.deployments yetkili erişim anahtarı> node apps-script/deploy.mjs
// İlk çalıştırmada apps-script/deploy.json oluşturulur (scriptId, deploymentId).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const token = process.env.SCRIPT_TOKEN;
if (!token) throw new Error('SCRIPT_TOKEN gerekli');
const API = 'https://script.googleapis.com/v1';
const statePath = join(here, 'deploy.json');
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};

async function call(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(json)}`);
  return json;
}

const dist = join(here, 'dist');
const files = [
  { name: 'appsscript', type: 'JSON', source: readFileSync(join(dist, 'appsscript.json'), 'utf8') },
  { name: 'Code', type: 'SERVER_JS', source: readFileSync(join(dist, 'Code.js'), 'utf8') },
  { name: 'Globals', type: 'SERVER_JS', source: readFileSync(join(dist, 'Globals.js'), 'utf8') },
];

if (!state.scriptId) {
  const p = await call('POST', '/projects', { title: 'Mechi Radar' });
  state.scriptId = p.scriptId;
  console.log('Proje oluşturuldu:', state.scriptId);
}
await call('PUT', `/projects/${state.scriptId}/content`, { files });
const v = await call('POST', `/projects/${state.scriptId}/versions`, { description: new Date().toISOString() });
const config = { versionNumber: v.versionNumber, manifestFileName: 'appsscript', description: 'Mechi Radar' };
const d = state.deploymentId
  ? await call('PUT', `/projects/${state.scriptId}/deployments/${state.deploymentId}`, { deploymentConfig: config })
  : await call('POST', `/projects/${state.scriptId}/deployments`, config);
state.deploymentId = d.deploymentId;
const web = (d.entryPoints ?? []).find((e) => e.entryPointType === 'WEB_APP');
state.webAppUrl = web?.webApp?.url ?? state.webAppUrl;
writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
console.log(`Sürüm ${v.versionNumber} yayınlandı.`);
console.log('Web uygulaması:', state.webAppUrl);
