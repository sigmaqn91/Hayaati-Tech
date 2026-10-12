// One-time Premium Tour coupons ("first time free"). Server only.
// Every visitor (signed cookie id and salted IP hash, same identity as the rate limits) gets ONE code ever.
// A code works once: it is marked used on the server the moment the full tour starts, so it can never be
// reused, shared around or guessed. Nothing here is visible to Jarvis; Jarvis can never make or read a code.

import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { getVisitorIdentity, kvDel, kvGet, kvSet } from '@/lib/rateLimit';

const CODE_TTL = 60 * 60 * 24 * 60; // an unused code stays valid for 60 days
const VISITOR_TTL = 60 * 60 * 24 * 365; // "first time free": one code per visitor per year
const RESTORE_WINDOW_MS = 90 * 1000; // a tour that failed to connect gives the code back (only right after it was used)

// No 0/O/1/I/L: easy to read and type on a phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

interface CouponRecord {
  keys: string[];
  createdAt: number;
  usedAt?: number;
}

const codeKey = (code: string) => `coupon:code:${code}`;
const usedKey = (code: string) => `coupon:used:${code}`;
const visitorKey = (key: string) => `coupon:visitor:${key}`;

export function normalizeCoupon(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = clean.startsWith('HY') ? clean.slice(2) : clean;
  if (body.length !== 8 || [...body].some((c) => !ALPHABET.includes(c))) return null;
  return `HY-${body.slice(0, 4)}-${body.slice(4)}`;
}

function newCode() {
  const bytes = crypto.randomBytes(8);
  let body = '';
  for (const b of bytes) body += ALPHABET[b % ALPHABET.length];
  return `HY-${body.slice(0, 4)}-${body.slice(4)}`;
}

async function readRecord(code: string): Promise<CouponRecord | null> {
  const raw = await kvGet(codeKey(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CouponRecord;
  } catch {
    return null;
  }
}

export type CouponRequestResult =
  | { ok: true; code: string; reused: boolean; cookieToSet?: string }
  | { ok: false; reason: 'already_used' | 'store_error'; cookieToSet?: string };

/** Gives this visitor their coupon: the same unused code again if they already have one, else a new code. */
export async function requestCoupon(req: NextRequest | Request): Promise<CouponRequestResult> {
  const identity = getVisitorIdentity(req);
  const cookieToSet = identity.cookieToSet;

  for (const key of identity.keys) {
    const existing = await kvGet(visitorKey(key));
    if (!existing) continue;
    const record = await readRecord(existing);
    if (!record) continue;
    if (record.usedAt) return { ok: false, reason: 'already_used', cookieToSet };
    return { ok: true, code: existing, reused: true, cookieToSet };
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const code = newCode();
    const record: CouponRecord = { keys: identity.keys, createdAt: Date.now() };
    if (!(await kvSet(codeKey(code), JSON.stringify(record), CODE_TTL, true))) continue;
    await Promise.all(identity.keys.map((key) => kvSet(visitorKey(key), code, VISITOR_TTL)));
    return { ok: true, code, reused: false, cookieToSet };
  }
  return { ok: false, reason: 'store_error', cookieToSet };
}

export type CouponRedeemResult = { ok: true; code: string } | { ok: false; reason: 'invalid' | 'already_used' | 'not_yours' };

/** Marks the code used (atomic: two tabs racing with the same code cannot both win). */
export async function redeemCoupon(req: NextRequest | Request, raw: unknown): Promise<CouponRedeemResult> {
  const code = normalizeCoupon(raw);
  if (!code) return { ok: false, reason: 'invalid' };
  const record = await readRecord(code);
  if (!record) return { ok: false, reason: 'invalid' };
  if (record.usedAt) return { ok: false, reason: 'already_used' };
  const identity = getVisitorIdentity(req);
  if (!record.keys.some((k) => identity.keys.includes(k))) return { ok: false, reason: 'not_yours' };
  if (!(await kvSet(usedKey(code), String(Date.now()), CODE_TTL, true))) return { ok: false, reason: 'already_used' };
  record.usedAt = Date.now();
  await kvSet(codeKey(code), JSON.stringify(record), CODE_TTL);
  return { ok: true, code };
}

/** The tour could not connect at all: give the code back, but only within a moment of using it. */
export async function restoreCoupon(req: NextRequest | Request, raw: unknown): Promise<void> {
  const code = normalizeCoupon(raw);
  if (!code) return;
  const record = await readRecord(code);
  if (!record?.usedAt || Date.now() - record.usedAt > RESTORE_WINDOW_MS) return;
  const identity = getVisitorIdentity(req);
  if (!record.keys.some((k) => identity.keys.includes(k))) return;
  delete record.usedAt;
  await kvSet(codeKey(code), JSON.stringify(record), CODE_TTL);
  await kvDel(usedKey(code));
}

/** Read-only check used by the coupon box before the tour starts. */
export async function couponStatus(req: NextRequest | Request, raw: unknown): Promise<'valid' | 'invalid' | 'already_used' | 'not_yours'> {
  const code = normalizeCoupon(raw);
  if (!code) return 'invalid';
  const record = await readRecord(code);
  if (!record) return 'invalid';
  if (record.usedAt) return 'already_used';
  const identity = getVisitorIdentity(req);
  return record.keys.some((k) => identity.keys.includes(k)) ? 'valid' : 'not_yours';
}
