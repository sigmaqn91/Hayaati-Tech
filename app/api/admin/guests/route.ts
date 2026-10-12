import { NextRequest, NextResponse } from 'next/server';
import { checkRatingRateLimit } from '@/lib/rateLimit';
import { verifyOwnerCode, verifyOwnerSession } from '@/lib/jarvisAuth';
import { createGuest, listGuests, revokeGuest } from '@/lib/guestStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function isOwner(req: NextRequest) {
  const code = req.headers.get('x-admin-code')?.trim() || '';
  return verifyOwnerSession(req) || (code.length > 0 && verifyOwnerCode(code));
}

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Owner: all guest codes. */
export async function GET(req: NextRequest) {
  const rate = await checkRatingRateLimit(req, 'rating-admin');
  if (!rate.allowed) return json({ success: false, code: 'rate_limited' }, 429);
  if (!(await isOwner(req))) return json({ success: false, code: 'unauthorized' }, 401);
  return json({ success: true, guests: await listGuests() });
}

/** Owner: { action: 'create', name } makes a new one-time code; { action: 'revoke', code } switches one off. */
export async function POST(req: NextRequest) {
  if (!(await isOwner(req))) return json({ success: false, code: 'unauthorized' }, 401);
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (body.action === 'create') {
    const name = typeof body.name === 'string' ? body.name.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 40) : '';
    const guest = await createGuest(name);
    return guest ? json({ success: true, guest }) : json({ success: false, code: 'store_error' }, 503);
  }
  if (body.action === 'revoke') {
    return (await revokeGuest(body.code)) ? json({ success: true }) : json({ success: false, code: 'not_found' }, 404);
  }
  return json({ success: false, code: 'unknown_action' }, 400);
}
