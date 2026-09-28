import { TF_LABEL } from '../src/core/candles';
import { formatPrice, signalTitle, strategyName, strengthLabel } from '../src/core/labels';
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
export function buildPushMessages(input: AlertItem[]): PushMessage[] {
  // Stokastik-RSI-ATR sürümleri aynı mumda aynı girişi verirse tek bildirimde birleştirilir.
  const also = new Map<AlertItem, string[]>();
  const items: AlertItem[] = [];
  const seen = new Map<string, AlertItem>();
  for (const it of input) {
    const e = it.event;
    const key = e.levels ? `${e.symbol}|${e.tf}|${e.time}|${e.dir}` : '';
    const first = key ? seen.get(key) : undefined;
    if (first) {
      also.get(first)!.push(strategyName(e));
      continue;
    }
    if (key) {
      seen.set(key, it);
      also.set(it, [strategyName(e)]);
    }
    items.push(it);
  }
  const one = (it: AlertItem): PushMessage => {
    const { event: e, name } = it;
    return {
      title: `${e.dir === 'up' ? '▲' : '▼'} ${name} · ${TF_LABEL[e.tf]}`,
      body: [
        signalTitle(e),
        also.get(it)?.join(', ') ?? '',
        strengthLabel(e.dir, e.strength),
        e.levels ? '' : `Kapanış ${formatPrice(e.close)}`,
      ]
        .filter(Boolean)
        .join(' · '),
      data: { symbol: e.symbol, name, tf: e.tf },
    };
  };
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
