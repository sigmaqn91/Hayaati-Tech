import { NextRequest, NextResponse } from 'next/server';
import { checkRatingRateLimit } from '@/lib/rateLimit';
import { clearVoiceErrors, readVoiceErrors } from '@/lib/voiceErrorStore';
import { verifyOwnerCode, verifyOwnerSession } from '@/lib/jarvisAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Owner only: signed-in owner session or the owner code (header x-admin-code). */
async function guard(req: NextRequest): Promise<NextResponse | null> {
  const rate = await checkRatingRateLimit(req, 'rating-admin');
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  if (rate.cookieToSet) headers.set('Set-Cookie', rate.cookieToSet);
  if (!rate.allowed) return new NextResponse(JSON.stringify({ success: false, code: 'rate_limited' }), { status: 429, headers });
  const code = req.headers.get('x-admin-code')?.trim() || '';
  const allowed = verifyOwnerSession(req) || (code.length > 0 && verifyOwnerCode(code));
  if (!allowed) return new NextResponse(JSON.stringify({ success: false, code: 'unauthorized' }), { status: 401, headers });
  return null;
}

const json = (body: unknown, status = 200) =>
  new NextResponse(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  return json({ success: true, ...(await readVoiceErrors(100)) });
}

export async function DELETE(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  return json({ success: await clearVoiceErrors() });
}
