import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory rate limiting store for assistant chat
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PROMPTS_PER_WINDOW = 25; // Cost protection: max 25 requests per IP per 10 mins

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_PROMPTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

const SYSTEM_INSTRUCTION = `
You are the HAYAATI Cognitive Assistant, the built-in holographic navigation intelligence for Hayaati Web Technology (www.hayaatiweb.site).
Owner & Lead Architect: Aliya Khan.
Contact Email: Hayaati.Technology@gmail.com.

Mission & Persona:
- You speak with calm, precise, cinematic authority (futuristic, polite, technical yet clear).
- You can respond naturally in English, Urdu, Hindi, or any language the user addresses you in.
- You guide visitors through the three eras of the future timeline:
  1. Era 2030: The Cognitive Foundation (edge AI, eVTOL urban sky taxis, solid-state battery storage, adaptive smart glass).
  2. Era 2035: The Biomechanical Synthesis (neural motor cortex links, autonomous medical pods, grown structural mycelium, maglev hyper-tubes).
  3. Era 2050: The Planetary & Orbital Horizon (commercial fusion baseload power, lunar south-pole water ice harvesters, oceanic carbon scrubbers, rotating torus ring orbital research habitats).
- You explain concepts from the 7 Tech Catalogue frontiers: Future AI, Vehicles & Transit, Devices & Bionics, Home & Workplace, Health & Biology, Energy & Climate, Deep Space.
- You explain the 8 Cities & Places postcards (Neo-Songdo smart street, Marina Vertical Spire Singapore, Polynesian floating ocean city, Rub' al Khali desert solar arcology, Artemis Shackleton Moon base, Ares Jezero Mars colony, Rotterdam clean port, Aura orbital ring).
- For projects: State honestly that Aliya Khan's official portfolio is being calibrated and visitors can check back or submit their own projects for review.
- For advertising/listing: State that anyone with a pioneering project or research can submit via the "Advertise / List Your Project" form, reviewed directly by Aliya Khan.
- Strictly adhere to facts: Never invent fake company releases, prices, or statistics. Always maintain an honest, inspiring, and cinematic tone.
- Keep responses concise (2 to 4 sentences usually, max 6 sentences).
`;

// Recommended current model with fallback resilience
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            'Assistant query rate limit reached. Please wait a brief moment before sending another message.',
        },
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, history } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 500 characters.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured on the server environment. Please set GEMINI_API_KEY in your Vercel settings and redeploy.',
        },
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history safely if provided
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: String(item.text).slice(0, 500) }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // Execute generation with primary model and automatic fallback on 404
    let replyText = '';
    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
    let lastError: Error | null = null;

    for (const modelToUse of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelToUse,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 350,
          },
        });

        replyText = response.text || 'Transmission received. Exploring horizon parameters.';
        break; // Success, break loop
      } catch (genErr: unknown) {
        lastError = genErr instanceof Error ? genErr : new Error(String(genErr));
        const errMsg = lastError.message.toLowerCase();
        // If not found or unsupported, try next fallback model
        if (errMsg.includes('not found') || errMsg.includes('404') || errMsg.includes('no longer available')) {
          continue;
        } else {
          // For other errors (e.g. rate limit / auth), throw immediately
          throw genErr;
        }
      }
    }

    if (!replyText && lastError) {
      throw lastError;
    }

    return NextResponse.json(
      { reply: replyText },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    let cleanMessage = 'The cognitive assistant encountered an unexpected error. Please try again.';

    if (err instanceof Error) {
      const raw = err.message;
      if (raw.includes('429') || raw.includes('quota') || raw.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          {
            error:
              'The AI assistant has reached its current computational quota. Please wait a moment before sending another query.',
          },
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (raw.includes('API_KEY_INVALID') || raw.includes('403')) {
        cleanMessage = 'Invalid GEMINI_API_KEY. Please verify your API key in Vercel settings.';
      } else if (raw.includes('503') || raw.includes('overloaded')) {
        cleanMessage = 'The AI model is temporarily busy. Please retry in a few seconds.';
      } else {
        // Clean error message without exposing raw JSON dumps
        cleanMessage = 'Cognitive engine transmission failure. Please try again shortly.';
      }
    }

    return NextResponse.json(
      { error: cleanMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
