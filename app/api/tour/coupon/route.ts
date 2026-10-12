import { NextRequest, NextResponse } from 'next/server';
import { couponStatus, requestCoupon } from '@/lib/couponStore';
import { verifyOwnerSession } from '@/lib/jarvisAuth';
import { checkVoiceActionLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Premium Tour coupon: { action: 'request' } gives this visitor their one free code,
// { action: 'check', code } says whether a code can still be used (it is only used up when the tour starts).
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // The founder can request and test as many coupons as she likes, but only while owner mode is ON:
  // the signed owner session alone is not enough (it can outlive owner mode for up to 2 hours), so the page
  // also says owner mode is on. Without a valid signed session that flag does nothing.
  const owner = verifyOwnerSession(req) && body?.ownerMode === true;
  const limit = owner ? { ok: true as const, retryAfter: 0 } : await checkVoiceActionLimit(req, 'coupon', 20, 600);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, reason: 'rate_limited', retryAfterSeconds: limit.retryAfter }, { status: 429 });
  }

  if (body?.action === 'check') {
    const status = await couponStatus(req, body?.code, owner);
    return NextResponse.json({ ok: status === 'valid', status });
  }

  if (body?.action === 'request') {
    const result = await requestCoupon(req, owner);
    const res = result.ok
      ? NextResponse.json({ ok: true, code: result.code, reused: result.reused })
      : NextResponse.json({ ok: false, reason: result.reason }, { status: result.reason === 'already_used' ? 409 : 503 });
    if (result.cookieToSet) res.headers.set('Set-Cookie', result.cookieToSet);
    return res;
  }

  return NextResponse.json({ ok: false, reason: 'unknown_action' }, { status: 400 });
}
