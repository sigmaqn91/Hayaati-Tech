import { NextRequest, NextResponse } from 'next/server';
import { checkVoiceActionLimit } from '@/lib/rateLimit';
import { guestCookie, readGuestPass, redeemGuest } from '@/lib/guestStore';
import { issueGuestCoupon } from '@/lib/couponStore';
import { detectFromUa } from '@/lib/visitorDetect';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Guest: { code } uses a guest code from Aliya Khan once. GET says whether this browser already is a guest. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  // 10 tries per 10 minutes: codes cannot be guessed.
  const limit = await checkVoiceActionLimit(req, 'guest', 10, 600);
  if (!limit.ok) return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });

  const d = detectFromUa(req.headers.get('user-agent') || '');
  const usedOn = [d.brand, d.model, d.os, d.browser].filter(Boolean).join(' ') || d.type;
  const result = await redeemGuest(body.code, usedOn);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: result.reason === 'store_error' ? 503 : 400 });
  }

  // Perk "premium_tour": a Premium Tour coupon made for this browser (used up when the tour starts).
  const issued = result.record.perks.includes('premium_tour') ? await issueGuestCoupon(req) : null;
  const res = NextResponse.json({ ok: true, name: result.record.name, perks: result.record.perks, coupon: issued?.code || null });
  res.headers.append('Set-Cookie', guestCookie(result.record));
  if (issued?.cookieToSet) res.headers.append('Set-Cookie', issued.cookieToSet);
  return res;
}

export async function GET(req: NextRequest) {
  const pass = await readGuestPass(req);
  return NextResponse.json(pass ? { guest: true, name: pass.name, perks: pass.perks } : { guest: false }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
