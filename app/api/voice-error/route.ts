import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkVisitRateLimit } from '@/lib/rateLimit';
import { saveVoiceError } from '@/lib/voiceErrorStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ID_RE = /^[a-z0-9-]{8,64}$/i;
const TOKEN_RE = /^[A-Za-z0-9_.-]{1,40}$/;
const MODES = ['normal', 'quick', 'full'];

const ok = () => new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
const word = (v: unknown) => (typeof v === 'string' && TOKEN_RE.test(v.trim()) ? v.trim() : '');
const num = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), max) : null;
};

/** Anonymous technical report from the page when Jarvis voice fails. Only short whitelisted fields are kept. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return ok();
  }

  const type = word(body.type);
  if (!type) return ok();

  const rate = await checkVisitRateLimit(req);
  if (!rate.allowed) return ok();

  const vid = typeof body.vid === 'string' && ID_RE.test(body.vid) ? body.vid : '';
  await saveVoiceError({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    type,
    code: word(body.code),
    status: num(body.status, 999),
    reason: word(body.reason),
    retryAfter: num(body.retryAfter, 31_536_000),
    mode: MODES.includes(body.mode as string) ? (body.mode as string) : 'normal',
    vid,
    layer: word(body.layer),
  });
  return ok();
}
