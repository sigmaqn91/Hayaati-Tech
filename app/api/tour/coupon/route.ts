import { NextRequest, NextResponse } from 'next/server';
import { couponStatus, requestCoupon } from '@/lib/couponStore';
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

  const limit = await checkVoiceActionLimit(req, 'coupon', 20, 600);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, reason: 'rate_limited', retryAfterSeconds: limit.retryAfter }, { status: 429 });
  }

  if (body?.action === 'check') {
    const status = await couponStatus(req, body?.code);
    return NextResponse.json({ ok: status === 'valid', status });
  }

  if (body?.action === 'request') {
    const result = await requestCoupon(req);
    const res = result.ok
      ? NextResponse.json({ ok: true, code: result.code, reused: result.reused })
      : NextResponse.json({ ok: false, reason: result.reason }, { status: result.reason === 'already_used' ? 409 : 503 });
    if (result.cookieToSet) res.headers.set('Set-Cookie', result.cookieToSet);
    return res;
  }

  return NextResponse.json({ ok: false, reason: 'unknown_action' }, { status: 400 });
}
