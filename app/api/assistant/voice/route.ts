import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkVoiceSessionLimit, releaseVoiceSession } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// List of languages supported for Gemini native voice audio
const VOICE_SUPPORTED_LANGUAGES = new Set([
  'en', 'hi', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'ar', 'pt', 'it', 'ru', 'tr', 'id'
]);

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';

    // 1. Quota & Session Limit Check
    const sessionCheck = await checkVoiceSessionLimit(ip);
    if (!sessionCheck.allowed) {
      console.warn(`[Voice Session Blocked] IP: ${ip} Reason: ${sessionCheck.reason}`);
      return NextResponse.json(
        {
          error: 'Voice session limit reached.',
          code: sessionCheck.reason === 'concurrency_limit' ? 'server_busy' : 'quota_reached',
        },
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { action, query, language } = body || {};
    const userLang = typeof language === 'string' ? language.toLowerCase() : 'en';

    // 2. Check language voice compatibility
    if (!VOICE_SUPPORTED_LANGUAGES.has(userLang)) {
      releaseVoiceSession(0);
      return NextResponse.json(
        {
          error: 'Voice conversation is not available in this language yet.',
          code: 'voice_not_supported',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'disabled') {
      releaseVoiceSession(0);
      console.warn('[Gemini Voice Server]: GEMINI_API_KEY is not configured or disabled on the server.');
      return NextResponse.json(
        { error: 'Voice transmission service is currently offline.', code: 'server_busy' },
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Live model and voice configurations
    const liveModel = process.env.GEMINI_LIVE_MODEL || 'gemini-3.8-live';
    const voiceName = process.env.GEMINI_VOICE || 'Kore';
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 3. Ephemeral Live Token Creation for real-time WebSocket session
    // Live models must NOT be called via unary generateContent. They connect via the Gemini Live API.
    // We create a short-lived token on the server so GEMINI_API_KEY is never exposed in the browser.
    if (action === 'session' || !query) {
      try {
        const token = await ai.authTokens.create({
          config: {
            uses: 10,
            expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          },
        });

        // Release rate limit counter safely
        releaseVoiceSession(15);

        return NextResponse.json(
          {
            token: token.name,
            model: liveModel,
            voiceName,
            language: userLang,
          },
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (tokenErr: any) {
        releaseVoiceSession(0);
        const status = tokenErr?.status || tokenErr?.statusCode || 500;
        const rawMessage = tokenErr?.message || String(tokenErr);
        // Log exact error status code and message from Gemini API (never the key or visitor's words)
        console.error(`[Gemini Voice Live Token Error] HTTP Status: ${status}, Message: ${rawMessage.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`);

        let code = 'generic_error';
        if (status === 429 || /quota/i.test(rawMessage)) {
          code = 'quota_reached';
        } else if (status === 503 || /busy|unavailable/i.test(rawMessage)) {
          code = 'server_busy';
        } else if (status === 404 || /not found/i.test(rawMessage)) {
          code = 'model_not_found';
        } else if (status === 401 || status === 403 || /permission/i.test(rawMessage)) {
          code = 'permission_denied';
        }

        return NextResponse.json(
          {
            error: `Voice session initialization failed: ${rawMessage.slice(0, 120)}`,
            code,
            statusCode: status,
          },
          { status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Fallback Unary Text-to-Speech (using proper TTS model for generateContent, NOT live model)
    const systemInstruction = `
You are the HAYAATI Voice Assistant for Hayaati Web Technology. You speak with a warm, calm, human, and conversational tone with native pronunciation and inflection for ${userLang}.
Guidelines:
- Reply in ${userLang}.
- Pronounce names, phrases, and technical concepts with fluent native accent.
- Keep responses short and conversational (1 to 3 sentences max).
- If the visitor speaks in a different language, answer in that language.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: String(query).slice(0, 500) }],
          },
        ],
        config: {
          systemInstruction,
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
      });

      const part = response?.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        releaseVoiceSession(0);
        console.error('[Gemini Voice API Error] generateContent returned no audio part.');
        return NextResponse.json(
          { error: 'Speech synthesis returned empty audio data.', code: 'generic_error' },
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      releaseVoiceSession(15);
      return NextResponse.json(
        {
          audioData: base64Audio,
          mimeType,
          replyText: response.text || '',
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (ttsErr: any) {
      releaseVoiceSession(0);
      const status = ttsErr?.status || ttsErr?.statusCode || 500;
      const rawMessage = ttsErr?.message || String(ttsErr);
      // Log exact status code and message from Gemini API, never the key or visitor's words
      console.error(`[Gemini Voice TTS Error] HTTP Status: ${status}, Message: ${rawMessage.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`);

      let code = 'generic_error';
      if (status === 429 || /quota/i.test(rawMessage)) {
        code = 'quota_reached';
      } else if (status === 503 || /busy|unavailable/i.test(rawMessage)) {
        code = 'server_busy';
      }

      return NextResponse.json(
        {
          error: `Audio generation failed (${status})`,
          code,
          statusCode: status,
        },
        { status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    releaseVoiceSession(0);
    const status = err?.status || err?.statusCode || 500;
    const msg = err?.message || String(err);
    console.error(`[Gemini Voice Fatal] HTTP Status: ${status}, Message: ${msg.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`);
    return NextResponse.json(
      { error: 'Voice transmission encountered an internal error.', code: 'generic_error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
