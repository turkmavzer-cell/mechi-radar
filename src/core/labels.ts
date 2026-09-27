import { TF_LABEL } from './candles';
import type { SignalEvent, Strength, TfStatus, Timeframe, Direction } from './types';

export function horizon(tf: Timeframe): string {
  if (tf === '15m' || tf === '20m' || tf === '30m') return 'Kısa vade';
  if (tf === '1d') return 'Uzun vade';
  return 'Orta vade';
}

export function signalTitle(e: Pick<SignalEvent, 'strategy' | 'dir' | 'tf'>): string {
  const word = e.dir === 'up' ? 'yükseliş' : 'düşüş';
  if (e.strategy === 'ema5813') return `${horizon(e.tf)} ${word} başlangıcı`;
  return `Pullback onayı · ${word} devamı`;
}

export function strengthLabel(dir: Direction, s: Strength): string {
  if (s === 'unknown') return '';
  if (s === 'strong') return 'Güçlü · ana trend yönünde';
  return dir === 'up' ? 'Zayıf · tepki yükselişi (EMA 200 altı)' : 'Zayıf · düzeltme (EMA 200 üstü)';
}

export function strengthShort(s: Strength): string {
  return s === 'strong' ? 'Güçlü' : s === 'weak' ? 'Zayıf' : '';
}

export function strategyName(e: Pick<SignalEvent, 'strategy'>): string {
  return e.strategy === 'ema5813' ? 'EMA 5·8·13' : 'EMA 20·50';
}

/** Mail konusu: "▲ USDJPY · 15dk · Kısa vade yükseliş başlangıcı · Güçlü" */
export function signalLine(e: SignalEvent, name?: string): string {
  const arrow = e.dir === 'up' ? '▲' : '▼';
  const s = strengthShort(e.strength);
  return [`${arrow} ${name || e.symbol}`, TF_LABEL[e.tf], signalTitle(e), s].filter(Boolean).join(' · ');
}

export function alignText(st: TfStatus): string {
  if (st.align === 'up') return 'Yükseliş dizilimi';
  if (st.align === 'down') return 'Düşüş dizilimi';
  return 'Dizilim yok';
}

export function pullbackText(st: TfStatus): string {
  const up = st.pullbackDir === 'up';
  switch (st.pullback) {
    case 'trend':
      return `${up ? 'Yukarı' : 'Aşağı'} kesişim · geri çekilme bekleniyor`;
    case 'pulled':
      return st.pullbackLevel != null
        ? `Geri çekilmede · ${formatPrice(st.pullbackLevel)} ${up ? 'üstü' : 'altı'} kapanış bekleniyor`
        : 'Geri çekilmede · kırılım bekleniyor';
    case 'confirmed':
      return `Kırılım onaylandı · ${up ? 'yükseliş' : 'düşüş'} devam ediyor`;
    default:
      return 'EMA 20/50 kesişimi bekleniyor';
  }
}

export function ema200Text(st: TfStatus): string {
  if (st.above200 === null) return 'Veri yetersiz';
  return st.above200 ? 'Fiyat EMA 200 üstünde' : 'Fiyat EMA 200 altında';
}

export function formatPrice(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  const digits = abs >= 1000 ? 2 : abs >= 10 ? 2 : abs >= 1 ? 4 : 5;
  return v.toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
}
