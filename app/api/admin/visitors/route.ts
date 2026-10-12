import { NextRequest, NextResponse } from 'next/server';
import { checkRatingRateLimit } from '@/lib/rateLimit';
import { readVisits } from '@/lib/visitorStore';
import { verifyOwnerCode, verifyOwnerSession } from '@/lib/jarvisAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Owner report of visitors: needs the signed-in owner session or the owner code (header x-admin-code). */
export async function GET(req: NextRequest) {
  const rate = await checkRatingRateLimit(req, 'rating-admin');
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  if (rate.cookieToSet) headers.set('Set-Cookie', rate.cookieToSet);
  if (!rate.allowed) return new NextResponse(JSON.stringify({ success: false, code: 'rate_limited' }), { status: 429, headers });

  const code = req.headers.get('x-admin-code')?.trim() || '';
  const allowed = verifyOwnerSession(req) || (code.length > 0 && verifyOwnerCode(code));
  if (!allowed) return new NextResponse(JSON.stringify({ success: false, code: 'unauthorized' }), { status: 401, headers });

  const report = await readVisits(500);
  return new NextResponse(JSON.stringify({ success: true, ...report }), { status: 200, headers });
}
