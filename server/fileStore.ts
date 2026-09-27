import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RadarStore } from './radar';

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    console.warn(`${path} okunamadı`);
    return null;
  }
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 1) + '\n');
}

/** Yerel geliştirme ve testler için JSON dosyalarında saklama. */
export function fileStore(dir: string): RadarStore {
  mkdirSync(dir, { recursive: true });
  return {
    async load() {
      return {
        config: readJson(join(dir, 'config.json')),
        state: readJson(join(dir, 'state.json')),
        signals: readJson(join(dir, 'signals.json')) ?? [],
      };
    },
    async saveConfig(config) {
      writeJson(join(dir, 'config.json'), config);
    },
    async save({ state, signals, scan }) {
      writeJson(join(dir, 'state.json'), state);
      writeJson(join(dir, 'signals.json'), signals);
      if (scan) writeJson(join(dir, 'scan.json'), scan);
    },
  };
}
