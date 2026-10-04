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

    const { query, language } = body;
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
      console.warn('[Gemini Voice]: GEMINI_API_KEY is not configured or disabled on the server. Voice is safely disabled.');
      return NextResponse.json(
        { error: 'Voice transmission is currently offline for calibration.', code: 'server_busy' },
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const liveModel = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
    const voiceName = process.env.GEMINI_VOICE || 'Kore';
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are the HAYAATI Voice Assistant for Hayaati Web Technology. You speak with a warm, calm, human, and conversational tone with native pronunciation and inflection for ${userLang}.
Guidelines:
- Reply in ${userLang}.
- Pronounce names, phrases, and technical concepts with fluent native accent.
- Keep responses short and conversational (1 to 3 sentences max).
- If the visitor speaks in a different language, answer in that language.
`;

    // Attempt native audio generation
    let base64Audio = '';
    let replyText = '';
    const modelsToTry = [
      liveModel,
      'gemini-2.5-flash-native-audio-preview-12-2025',
      'gemini-3.8-flash-tts',
      'gemini-3.8-flash',
    ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [{ text: String(query || 'Hello').slice(0, 500) }],
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
        if (part?.inlineData?.data) {
          base64Audio = part.inlineData.data;
          replyText = response.text || '';
          break;
        }
      } catch (voiceErr: unknown) {
        console.warn(`[Voice Model Fallback]: ${modelName} failed:`, voiceErr instanceof Error ? voiceErr.message : voiceErr);
        continue;
      }
    }

    if (!base64Audio) {
      releaseVoiceSession(0);
      console.error('[Gemini Voice Error]: All native audio generation attempts failed.');
      return NextResponse.json(
        { error: 'Could not generate native voice audio.', code: 'generic_error' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Release session counter
    releaseVoiceSession(15);

    return NextResponse.json(
      {
        audioData: base64Audio,
        mimeType: 'audio/wav',
        replyText,
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    releaseVoiceSession(0);
    console.error('[Gemini Voice Fatal]:', err);
    return NextResponse.json(
      { error: 'Voice transmission failed.', code: 'generic_error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
