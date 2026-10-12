/**
 * Guest passes (server only). Aliya Khan creates a code in Admin Control > Guests and sends it to a friend.
 * The friend opens "Guest" in the 3-line menu and enters it: the code works ONCE (marked used atomically on the
 * server), and that browser gets the guest perks. Codes can be revoked before they are used.
 *
 * Perks are a list, so future guest features only add a new perk name here and a check where it applies.
 * Today: 'premium_tour' = one Premium Full Tour without a coupon.
 */

import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { kvGet, kvSet } from '@/lib/rateLimit';

export type GuestPerk = 'premium_tour';
export const DEFAULT_GUEST_PERKS: GuestPerk[] = ['premium_tour'];

export interface GuestRecord {
  code: string;
  name: string;
  perks: GuestPerk[];
  createdAt: string;
  usedAt?: string;
  usedOn?: string; // short device text of the browser that used it
  revokedAt?: string;
}

const TTL = 60 * 60 * 24 * 365 * 2; // two years
const INDEX_KEY = 'guest:index';
const codeKey = (code: string) => `guest:code:${code}`;
const usedKey = (code: string) => `guest:used:${code}`;
const MAX_INDEX = 500;

// Same easy-to-type alphabet as the tour coupons (no 0/O/1/I/L).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const GUEST_COOKIE = '__hayaati_guest';
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function normalizeGuestCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = clean.startsWith('G') && clean.length === 9 ? clean.slice(1) : clean;
  if (body.length !== 8 || [...body].some((c) => !ALPHABET.includes(c))) return null;
  return `G-${body.slice(0, 4)}-${body.slice(4)}`;
}

function newCode() {
  let body = '';
  for (const b of crypto.randomBytes(8)) body += ALPHABET[b % ALPHABET.length];
  return `G-${body.slice(0, 4)}-${body.slice(4)}`;
}

async function readIndex(): Promise<string[]> {
  try {
    const raw = await kvGet(INDEX_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function readGuest(code: string): Promise<GuestRecord | null> {
  try {
    const raw = await kvGet(codeKey(code));
    return raw ? (JSON.parse(raw) as GuestRecord) : null;
  } catch {
    return null;
  }
}

/** Owner: makes a new one-time guest code. */
export async function createGuest(name: string): Promise<GuestRecord | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const record: GuestRecord = {
      code: newCode(),
      name: name || 'Guest',
      perks: DEFAULT_GUEST_PERKS,
      createdAt: new Date().toISOString(),
    };
    if (!(await kvSet(codeKey(record.code), JSON.stringify(record), TTL, true))) continue;
    const index = [record.code, ...(await readIndex())].slice(0, MAX_INDEX);
    await kvSet(INDEX_KEY, JSON.stringify(index), TTL);
    return record;
  }
  return null;
}

/** Owner: list of guest codes, newest first. */
export async function listGuests(): Promise<GuestRecord[]> {
  const index = await readIndex();
  const rows = await Promise.all(index.map((c) => readGuest(c)));
  return rows.filter((r): r is GuestRecord => Boolean(r));
}

/** Owner: switch off a code that has not been used yet (or remove a used guest's access). */
export async function revokeGuest(raw: unknown): Promise<boolean> {
  const code = normalizeGuestCode(raw);
  if (!code) return false;
  const record = await readGuest(code);
  if (!record) return false;
  record.revokedAt = new Date().toISOString();
  return kvSet(codeKey(code), JSON.stringify(record), TTL);
}

export type GuestRedeemResult =
  | { ok: true; record: GuestRecord }
  | { ok: false; reason: 'invalid' | 'already_used' | 'revoked' | 'store_error' };

/** Guest: uses the code (atomic: two browsers racing with the same code cannot both win). */
export async function redeemGuest(raw: unknown, usedOn: string): Promise<GuestRedeemResult> {
  const code = normalizeGuestCode(raw);
  if (!code) return { ok: false, reason: 'invalid' };
  const record = await readGuest(code);
  if (!record) return { ok: false, reason: 'invalid' };
  if (record.revokedAt) return { ok: false, reason: 'revoked' };
  if (record.usedAt) return { ok: false, reason: 'already_used' };
  if (!(await kvSet(usedKey(code), String(Date.now()), TTL, true))) return { ok: false, reason: 'already_used' };
  record.usedAt = new Date().toISOString();
  record.usedOn = usedOn.slice(0, 80);
  if (!(await kvSet(codeKey(code), JSON.stringify(record), TTL))) return { ok: false, reason: 'store_error' };
  return { ok: true, record };
}

// ---------- Guest cookie (signed; lets future guest features know this browser is a guest) ----------

function secret() {
  return process.env.SESSION_SIGNING_SECRET || process.env.JARVIS_SESSION_SECRET || 'hayaati-guest-fallback-secret';
}

export function guestCookie(record: GuestRecord): string {
  const payload = Buffer.from(JSON.stringify({ code: record.code, name: record.name, perks: record.perks, exp: Date.now() + GUEST_COOKIE_MAX_AGE * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${GUEST_COOKIE}=${payload}.${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${GUEST_COOKIE_MAX_AGE}${secure}`;
}

/** Guest pass of this request, if any (signature, expiry and revoke checked). */
export async function readGuestPass(req: NextRequest | Request): Promise<{ code: string; name: string; perks: GuestPerk[] } | null> {
  const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${GUEST_COOKIE}=([^;]+)`));
  if (!m) return null;
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    const record = await readGuest(String(data.code));
    if (!record || record.revokedAt) return null;
    return { code: record.code, name: record.name, perks: record.perks };
  } catch {
    return null;
  }
}
