import { NextRequest, NextResponse } from 'next/server';
import {
  checkVerifyRateLimit,
  recordFailedVerifyAttempt,
  resetVerifyAttempts,
  verifyOwnerCode,
  createOwnerSessionToken,
} from '@/lib/jarvisAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate-limit check: max 5 attempts per 15 mins per IP
    const rateCheck = checkVerifyRateLimit(req);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification matrix locked due to repeated invalid attempts. Please hold.',
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed verification packet.' },
        { status: 400 }
      );
    }

    const { code } = body;
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      recordFailedVerifyAttempt(req, 'empty_code');
      return NextResponse.json(
        { success: false, error: 'Verification failed. Access denied.' },
        { status: 401 }
      );
    }

    // 2. Constant-time check against JARVIS_ADMIN_CODE
    const isValid = verifyOwnerCode(code.trim());
    if (!isValid) {
      recordFailedVerifyAttempt(req, 'invalid_code');
      return NextResponse.json(
        { success: false, error: 'Verification failed. Access denied.' },
        { status: 401 }
      );
    }

    // 3. Reset rate limiter on successful match
    resetVerifyAttempts(req);

    // 4. Issue signed, httpOnly, secure, SameSite=Strict session cookie (2 hours)
    const { cookieString } = createOwnerSessionToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': cookieString,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Owner clearance confirmed. Welcome back, Aliya Khan.',
        isOwner: true,
      },
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error('[Jarvis Verify Fatal Error]:', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'Internal verification exception.' },
      { status: 500 }
    );
  }
}
