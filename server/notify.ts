import { TF_LABEL } from '../src/core/candles';
import { formatPrice, signalTitle, strengthLabel } from '../src/core/labels';
import type { AlertItem } from './radar';

export interface PushMessage {
  title: string;
  body: string;
  /** Bildirime dokununca açılacak enstrüman. */
  data: { symbol: string; name: string; tf: string };
}

const MAX_SINGLE = 3;

/**
 * Sinyalleri telefon bildirimlerine çevirir.
 * Az sinyal varsa her biri ayrı bildirim, çoksa tek özet bildirim.
 */
export function buildPushMessages(items: AlertItem[]): PushMessage[] {
  const one = ({ event: e, name }: AlertItem): PushMessage => ({
    title: `${e.dir === 'up' ? '▲' : '▼'} ${name} · ${TF_LABEL[e.tf]}`,
    body: [signalTitle(e), strengthLabel(e.dir, e.strength), `Kapanış ${formatPrice(e.close)}`].filter(Boolean).join(' · '),
    data: { symbol: e.symbol, name, tf: e.tf },
  });
  if (items.length <= MAX_SINGLE) return items.map(one);
  const first = items[0];
  return [
    {
      title: `Mechi Radar · ${items.length} yeni sinyal`,
      body: items
        .slice(0, 6)
        .map(({ event: e, name }) => `${e.dir === 'up' ? '▲' : '▼'} ${name} ${TF_LABEL[e.tf]}: ${signalTitle(e)}`)
        .join('\n'),
      data: { symbol: first.event.symbol, name: first.name, tf: first.event.tf },
    },
  ];
}
