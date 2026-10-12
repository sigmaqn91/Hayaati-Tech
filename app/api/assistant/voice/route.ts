import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import { verifyOwnerSession } from '@/lib/jarvisAuth';
import {
  checkVoiceSessionLimit,
  recordVoiceSessionStart,
  refundVoiceSession,
  releaseVoiceSession,
  RATE_CONFIG,
  type VoiceSessionKind,
} from '@/lib/rateLimit';
import { redeemCoupon, restoreCoupon } from '@/lib/couponStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty or non-JSON body defaults to session request
      body = {};
    }

    const action = body?.action || 'session';
    // Tours start only from the Quick Tour / Premium Tour buttons; everything else is a normal Jarvis session.
    const kind: VoiceSessionKind = body?.tour === 'quick' ? 'quick' : body?.tour === 'full' ? 'full' : 'normal';

    // 1. Session Release / End Action: release concurrency slot & track daily minutes
    if (action === 'release' || action === 'end') {
      const durationSeconds =
        typeof body?.durationSeconds === 'number' && body.durationSeconds > 0
          ? Math.min(body.durationSeconds, RATE_CONFIG.voiceSessionMaxSeconds)
          : 0;
      await releaseVoiceSession(durationSeconds);
      return NextResponse.json({ success: true, released: true });
    }

    // 1b. Refund Action: the token was issued but the Live connection / microphone failed,
    // so give back the concurrency slot AND the visitor's hourly attempt.
    if (action === 'refund') {
      await refundVoiceSession(req, kind);
      if (kind === 'full' && body?.coupon) await restoreCoupon(req, body.coupon);
      return NextResponse.json({ success: true, refunded: true });
    }

    // 2. Heartbeat Action: keepalive indicator
    if (action === 'heartbeat') {
      return NextResponse.json({ success: true, active: true });
    }

    // 3. Read-Only Status Health Check Action (does not increment rate limits or consume session slots)
    if (action === 'status') {
      const apiKey = process.env.GEMINI_API_KEY;
      const isConfigured = Boolean(apiKey && apiKey !== 'disabled');
      const liveModel = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';

      return NextResponse.json({
        ok: true,
        configured: isConfigured,
        model: liveModel,
        status: isConfigured ? 'operational' : 'missing_api_key',
        sessionMaxSeconds: RATE_CONFIG.voiceSessionMaxSeconds,
      });
    }

    // 3. New Session Request (action === 'session')
    if (action === 'session') {
      const { language } = body;
      const isOwner = verifyOwnerSession(req);
      const userLang = typeof language === 'string' ? language.toLowerCase().trim() : 'en';

      const apiKey = process.env.GEMINI_API_KEY;
      const hasKey = Boolean(apiKey && apiKey !== 'disabled');
      // Gemini Live model and voice configurations
      const liveModel = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
      const voiceName = process.env.GEMINI_VOICE || 'Capella';

      // SPEED: the Google token is requested at the same time as the limit checks (they used to run one after
      // another). If the visitor is over a limit, the unused token simply expires; nothing is consumed.
      const tokenPromise: Promise<{ token?: any; error?: any }> | null = hasKey
        ? new GoogleGenAI({
            apiKey: apiKey as string,
            httpOptions: {
              apiVersion: 'v1beta',
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          }).authTokens
            .create({
              config: {
                uses: 1,
                expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
                // Lock the ephemeral token to the exact Live model + audio modality only.
                // lockAdditionalFields: [] is REQUIRED: without it Gemini locks the whole
                // config, and the client's own systemInstruction / speechConfig /
                // transcription settings make the Live connection get rejected.
                liveConnectConstraints: {
                  model: liveModel,
                  config: {
                    responseModalities: [Modality.AUDIO],
                  },
                },
                lockAdditionalFields: [],
              } as any,
            })
            .then(
              (token) => ({ token }),
              (error) => ({ error })
            )
        : null;

      // Check Rate, Concurrency, and Quota Limits
      const sessionCheck = await checkVoiceSessionLimit(req, kind);
      if (!sessionCheck.allowed) {
        console.warn(`[Voice Session Blocked] Reason: ${sessionCheck.reason}`);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (sessionCheck.cookieToSet) headers.set('Set-Cookie', sessionCheck.cookieToSet);
        return NextResponse.json(
          {
            error: 'Voice session limit reached.',
            code: sessionCheck.reason === 'concurrency_limit' ? 'server_busy' : 'quota_reached',
            reason: sessionCheck.reason,
            retryAfterSeconds: sessionCheck.retryAfterSeconds,
          },
          { status: 429, headers }
        );
      }

      if (!hasKey || !tokenPromise) {
        console.warn('[Gemini Voice Server]: GEMINI_API_KEY is not configured or disabled on the server.');
        return NextResponse.json(
          { error: 'Voice transmission service is currently offline.', code: 'server_busy' },
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Premium full tour: the one-time coupon is used up here, only after every other check passed
      // (so a busy server never wastes it). The verified owner can always run it without a coupon.
      if (kind === 'full' && !isOwner) {
        const redeemed = await redeemCoupon(req, body?.coupon);
        if (!redeemed.ok) {
          return NextResponse.json(
            { error: 'Coupon not accepted.', code: 'coupon_rejected', reason: redeemed.reason },
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      const sessionMaxSeconds =
        kind === 'quick'
          ? Math.min(RATE_CONFIG.quickTourMaxSeconds, RATE_CONFIG.voiceSessionMaxSeconds)
          : RATE_CONFIG.voiceSessionMaxSeconds;

      console.info(`[Gemini Voice Server] Live model: ${liveModel}`);

      // Acquire concurrency slot & visitor hourly usage in shared store (in parallel with the token finishing)
      const [, tokenResult] = await Promise.all([recordVoiceSessionStart(req, kind), tokenPromise]);

      // The API key remains strictly server-side; client receives ONLY the short-lived single-use token.
      try {
        if (tokenResult.error) throw tokenResult.error;
        const token = tokenResult.token;

        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (sessionCheck.cookieToSet) headers.set('Set-Cookie', sessionCheck.cookieToSet);

        return NextResponse.json(
          {
            token: token.name,
            model: liveModel,
            voice: voiceName,
            voiceName,
            language: userLang,
            sessionMaxSeconds,
            tour: kind === 'normal' ? null : kind,
            isOwner,
          },
          { status: 200, headers }
        );
      } catch (tokenErr: any) {
        // Token creation failed: refund session slot so visitor is not penalized
        await refundVoiceSession(req, kind);
        if (kind === 'full' && body?.coupon) await restoreCoupon(req, body.coupon);
        const status = tokenErr?.status || tokenErr?.statusCode || 500;
        const rawMessage = tokenErr?.message || String(tokenErr);

        console.error(
          `[Gemini Voice Live Token Error] HTTP Status: ${status}, Message: ${rawMessage.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`
        );

        let code = 'generic_error';
        if (status === 429 || /quota/i.test(rawMessage)) {
          code = 'quota_reached';
        } else if (status === 503 || /busy|unavailable/i.test(rawMessage)) {
          code = 'server_busy';
        }

        return NextResponse.json(
          {
            error: 'Voice connection failed. Unable to initialize secure voice session.',
            code,
            statusCode: status,
          },
          {
            status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 4. Broken unary TTS fallback is completely replaced:
    // Live models use bidiGenerateContent over WebSocket, NOT unary generateContent.
    // Unary TTS and Live voice must never be conflated.
    return NextResponse.json(
      {
        error: 'Voice connection failed. Real-time voice uses the Live WebSocket protocol.',
        code: 'voice_connection_failed',
      },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500;
    const msg = err?.message || String(err);
    console.error(
      `[Gemini Voice Fatal] HTTP Status: ${status}, Message: ${msg.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`
    );
    return NextResponse.json(
      { error: 'Voice connection failed.', code: 'generic_error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
