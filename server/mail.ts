import nodemailer from 'nodemailer';
import { TF_LONG_LABEL } from '../src/core/candles';
import { formatPrice, formatTime, signalLine, signalTitle, strategyName, strengthLabel } from '../src/core/labels';
import type { SignalEvent } from '../src/core/types';

export interface MailItem {
  event: SignalEvent;
  name: string;
}

export interface Mail {
  subject: string;
  text: string;
  html: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

export function buildMail(items: MailItem[]): Mail {
  const subject =
    items.length === 1 ? signalLine(items[0].event, items[0].name) : `Mechi Radar · ${items.length} yeni sinyal`;
  const blocks = items.map(({ event: e, name }) => {
    const lines = [
      signalLine(e, name),
      `${signalTitle(e)} (${strategyName(e)}, ${TF_LONG_LABEL[e.tf]})`,
      strengthLabel(e.dir, e.strength),
      `Kapanış: ${formatPrice(e.close)} · Mum: ${formatTime(e.time)}`,
    ].filter(Boolean);
    return lines;
  });
  const footer = 'Mechi Radar · Bu mail teknik gösterge bilgisidir, yatırım tavsiyesi değildir.';
  const text = blocks.map((b) => b.join('\n')).join('\n\n') + `\n\n${footer}\n`;
  const html =
    blocks
      .map(
        (b) =>
          `<div style="margin:0 0 16px;font-family:Arial,sans-serif"><div style="font-weight:bold;font-size:15px;color:${
            b[0].startsWith('▲') ? '#15803d' : '#b91c1c'
          }">${esc(b[0])}</div>${b
            .slice(1)
            .map((l) => `<div style="font-size:13px;color:#333">${esc(l)}</div>`)
            .join('')}</div>`,
      )
      .join('') + `<div style="font-size:11px;color:#888;font-family:Arial,sans-serif">${esc(footer)}</div>`;
  return { subject, text, html };
}

export async function sendMail(mail: Mail): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.MAIL_TO || user;
  if (process.env.DRY_RUN === '1' || !user || !pass) {
    console.log(`[mail atlanıyor${!user || !pass ? ': GMAIL_USER/GMAIL_APP_PASSWORD tanımlı değil' : ''}]`);
    console.log(`Konu: ${mail.subject}\n${mail.text}`);
    return false;
  }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass: pass.replace(/\s+/g, '') } });
  await transport.sendMail({ from: `Mechi Radar <${user}>`, to, subject: mail.subject, text: mail.text, html: mail.html });
  console.log(`Mail gönderildi: ${mail.subject}`);
  return true;
}
