import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRatingRateLimit } from '@/lib/rateLimit';
import { RATING_ITEM_IDS, RATING_ISSUE_IDS } from '@/lib/ratingCatalog';
import { saveRating, readRatings, type StoredRating } from '@/lib/ratingStore';
import { verifyOwnerCode, verifyOwnerSession } from '@/lib/jarvisAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200, cookie?: string) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  if (cookie) headers.set('Set-Cookie', cookie);
  return new NextResponse(JSON.stringify(body), { status, headers });
}

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '';

/** Visitor sends a rating. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ success: false, code: 'bad_request' }, 400);
  }

  // Honeypot field: real visitors never fill it.
  if (clean(body.website, 200)) return json({ success: true });

  const stars = Number(body.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return json({ success: false, code: 'stars_required' }, 400);
  }

  const verdicts: Record<string, 'good' | 'bad'> = {};
  if (body.verdicts && typeof body.verdicts === 'object') {
    for (const [id, v] of Object.entries(body.verdicts as Record<string, unknown>).slice(0, 400)) {
      if (RATING_ITEM_IDS.has(id) && (v === 'good' || v === 'bad')) verdicts[id] = v;
    }
  }
  const issues = Array.isArray(body.issues)
    ? Array.from(new Set(body.issues.filter((i): i is string => typeof i === 'string' && RATING_ISSUE_IDS.has(i))))
    : [];
  const message = clean(body.message, 1500);
  const name = clean(body.name, 80);
  let email = clean(body.email, 120);
  if (email && !EMAIL_REGEX.test(email)) email = '';

  const rate = await checkRatingRateLimit(req);
  if (!rate.allowed) {
    return json({ success: false, code: 'rate_limited', retryAfterSeconds: rate.retryAfterSeconds }, 429, rate.cookieToSet);
  }

  const record: StoredRating = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    stars,
    verdicts,
    issues,
    message,
    name: name || undefined,
    email: email || undefined,
    lang: clean(body.lang, 8) || undefined,
    viewport: clean(body.viewport, 20) || undefined,
    country: clean(req.headers.get('x-vercel-ip-country'), 4) || undefined,
  };

  const ok = await saveRating(record);
  if (!ok) {
    console.error('[Rating] not stored: no storage configured (UPSTASH_REDIS_REST_URL / SMTP_*)');
    return json({ success: false, code: 'storage_unavailable' }, 503, rate.cookieToSet);
  }
  return json({ success: true, id: record.id }, 200, rate.cookieToSet);
}

/** Owner report: needs the Jarvis owner code (header x-admin-code) or a signed-in owner session. */
export async function GET(req: NextRequest) {
  const rate = await checkRatingRateLimit(req, 'rating-admin');
  if (!rate.allowed) return json({ success: false, code: 'rate_limited' }, 429, rate.cookieToSet);

  const code = req.headers.get('x-admin-code')?.trim() || '';
  const allowed = verifyOwnerSession(req) || (code.length > 0 && verifyOwnerCode(code));
  if (!allowed) return json({ success: false, code: 'unauthorized' }, 401, rate.cookieToSet);

  const report = await readRatings(300);
  return json({ success: true, ...report }, 200, rate.cookieToSet);
}
