import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifyOwnerSession } from '@/lib/jarvisAuth';
import { allowVoice } from '@/lib/jarvisVoiceLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Verified working TTS models tested with Google GenAI SDK (verified working first)
const VERIFIED_TTS_MODELS = [
  'gemini-3.8-flash-lite-tts',
  'gemini-3.8-flash-tts',
  'gemini-2.5-flash-preview-tts',
  'gemini-3.1-flash-tts-preview',
];

export async function POST(req: NextRequest) {
  try {
    // 1. Owner bypass check (exact same check used by /api/jarvis/chat)
    const isOwner = verifyOwnerSession(req);

    // 2. Normal visitor rate limit check
    if (!isOwner) {
      const limitResult = await allowVoice(req, 'tts');
      if (!limitResult.ok) {
        return NextResponse.json(
          {
            error: 'Voice synthesis limit reached for this session. Please wait before retrying.',
            retryAfter: limitResult.retryAfter,
          },
          { status: 429 }
        );
      }
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in voice synthesis request.' },
        { status: 400 }
      );
    }

    const { text, voice } = body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'No text provided for synthesis.' },
        { status: 400 }
      );
    }

    const cleanText = text.trim().slice(0, 2000);
    const chosenVoice = voice || process.env.GEMINI_TTS_VOICE || 'Kore';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'disabled') {
      return NextResponse.json(
        { error: 'Voice synthesis service is currently offline.' },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-tts',
        },
      },
    });

    const envModel = process.env.GEMINI_TTS_MODEL?.trim();
    const candidateModels = envModel
      ? [envModel, ...VERIFIED_TTS_MODELS.filter((m) => m !== envModel)]
      : VERIFIED_TTS_MODELS;

    let audioData: string | null = null;
    let mimeType = 'audio/wav';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: cleanText }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          audioData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'audio/wav';
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[TTS Model Failed]: ${model} - ${err?.message || err}`);
      }
    }

    if (!audioData) {
      console.error('[TTS Generation Exhausted]: All verified models failed.', lastError?.message || lastError);
      return NextResponse.json(
        { error: 'Voice audio generation failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audio: audioData,
      mimeType,
      isOwner,
    });
  } catch (fatal: any) {
    console.error('[TTS Fatal Error]:', fatal?.message || fatal);
    return NextResponse.json(
      { error: 'Internal server error during speech synthesis.' },
      { status: 500 }
    );
  }
}
