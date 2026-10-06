import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { verifyOwnerSession } from '@/lib/jarvisAuth';
import { allowVoice } from '@/lib/jarvisVoiceLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Verified working STT / audio models tested with Google GenAI SDK (verified working first)
const VERIFIED_STT_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
];

export async function POST(req: NextRequest) {
  try {
    // 1. Owner bypass check (exact same check used by /api/jarvis/chat)
    const isOwner = verifyOwnerSession(req);

    // 2. Normal visitor rate limit check
    if (!isOwner) {
      const limitResult = await allowVoice(req, 'stt');
      if (!limitResult.ok) {
        return NextResponse.json(
          {
            error: 'Speech recognition limit reached for this session. Please wait before retrying.',
            retryAfter: limitResult.retryAfter,
          },
          { status: 429 }
        );
      }
    }

    let audioBase64 = '';
    let mimeType = 'audio/wav';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = (formData.get('audio') || formData.get('file')) as File | null;
      if (!file) {
        return NextResponse.json(
          { error: 'No audio file found in form data.' },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      audioBase64 = buffer.toString('base64');
      mimeType = file.type || 'audio/wav';
    } else {
      let body: any = {};
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON payload in audio transcription request.' },
          { status: 400 }
        );
      }
      audioBase64 = body?.audio || '';
      if (body?.mimeType) {
        mimeType = body.mimeType;
      }
    }

    if (!audioBase64 || typeof audioBase64 !== 'string' || !audioBase64.trim()) {
      return NextResponse.json(
        { error: 'Missing audio payload.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'disabled') {
      return NextResponse.json(
        { error: 'Speech transcription service is currently offline.' },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-stt',
        },
      },
    });

    const envModel = process.env.GEMINI_STT_MODEL?.trim();
    const candidateModels = envModel
      ? [envModel, ...VERIFIED_STT_MODELS.filter((m) => m !== envModel)]
      : VERIFIED_STT_MODELS;

    let transcript = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: audioBase64.trim(),
                  },
                },
                {
                  text: 'Transcribe the spoken words in this audio exactly. Output ONLY the verbatim speech text. If the audio is silent or contains no intelligible words, output an empty response.',
                },
              ],
            },
          ],
        });

        const rawText = response.text || '';
        transcript = rawText.trim();
        break; // Successfully transcribed
      } catch (err: any) {
        lastError = err;
        console.warn(`[STT Model Failed]: ${model} - ${err?.message || err}`);
      }
    }

    if (!transcript && lastError) {
      console.error('[STT Processing Exhausted]: All verified models failed.', lastError?.message || lastError);
      return NextResponse.json(
        { error: 'Speech transcription failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: transcript,
      transcript,
      isOwner,
    });
  } catch (fatal: any) {
    console.error('[STT Fatal Error]:', fatal?.message || fatal);
    return NextResponse.json(
      { error: 'Internal server error during speech transcription.' },
      { status: 500 }
    );
  }
}
