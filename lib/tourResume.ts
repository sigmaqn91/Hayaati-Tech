// Resume tickets for tours. A long tour can outlive one Gemini Live connection (Google renews connections
// after about ten minutes, and a network hiccup can drop one). The tour then reconnects by itself with this
// signed ticket: no second coupon, no extra hourly attempt, and never longer than the tour's own end time.

import crypto from 'crypto';
import { kvSet } from '@/lib/rateLimit';
import type { VoiceSessionKind } from '@/lib/rateLimit';

const MAX_RESUMES = 4;

function secret() {
  return (
    process.env.SESSION_SIGNING_SECRET ||
    process.env.JARVIS_SESSION_SECRET ||
    'fallback-in-memory-ephemeral-session-secret-matrix-999'
  );
}

interface TicketPayload {
  id: string;
  kind: Exclude<VoiceSessionKind, 'normal'>;
  /** Unix ms when the tour must be over. */
  endsAt: number;
  n: number;
}

const sign = (body: string) => crypto.createHmac('sha256', secret()).update(`tour-resume:${body}`).digest('base64url');

export function createResumeTicket(kind: TicketPayload['kind'], endsAt: number, n = 0): string {
  const body = Buffer.from(
    JSON.stringify({ id: crypto.randomBytes(9).toString('base64url'), kind, endsAt, n } satisfies TicketPayload)
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

/** Checks a ticket and uses it up (each ticket works once; the new session gets a fresh one). */
export async function redeemResumeTicket(ticket: unknown): Promise<TicketPayload | null> {
  if (typeof ticket !== 'string' || ticket.length > 400) return null;
  const [body, sig] = ticket.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  let p: TicketPayload;
  try {
    p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if ((p.kind !== 'quick' && p.kind !== 'full') || typeof p.endsAt !== 'number' || p.n >= MAX_RESUMES) return null;
  const left = Math.floor((p.endsAt - Date.now()) / 1000);
  if (left < 20) return null;
  const fresh = await kvSet(`tour:resume:${p.id}`, '1', Math.min(3600, left + 120), true);
  return fresh ? p : null;
}
