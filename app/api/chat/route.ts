import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory rate limiting store for assistant chat
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PROMPTS_PER_WINDOW = 60; // Generous limit for normal user conversation

function isRateLimited(ip: string): boolean {
  // If IP is generic or missing on serverless, don't penalize visitors
  if (!ip || ip === 'unknown-client' || ip === '127.0.0.1') {
    return false;
  }

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

// Robust model candidates: try the most reliable models in sequence
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-3.8-flash',
  'gemini-1.5-flash',
  'models/gemini-2.0-flash',
  'models/gemini-3.8-flash',
];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';

    if (isRateLimited(ip)) {
      console.warn(`[Assistant Rate Limited] IP: ${ip}`);
      return NextResponse.json(
        {
          error:
            'Assistant query rate limit reached (60 queries per 10 minutes). Please wait a moment before sending another message.',
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
      console.error('[Gemini API Error]: GEMINI_API_KEY environment variable is not defined on server.');
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured on the server. Please verify your environment variable in Vercel.',
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

    let replyText = '';
    let lastError: Error | null = null;

    // Iterate through candidates until one succeeds
    for (const modelToUse of CANDIDATE_MODELS) {
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

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          replyText = text.trim();
          break; // Success!
        }
      } catch (genErr: unknown) {
        lastError = genErr instanceof Error ? genErr : new Error(String(genErr));
        console.warn(`[Gemini Attempt Failed on model: ${modelToUse}]:`, lastError.message);
        // Continue to the next fallback candidate model!
        continue;
      }
    }

    if (!replyText) {
      throw lastError || new Error('All candidate models failed to return a response.');
    }

    return NextResponse.json(
      { reply: replyText },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    // Log the EXACT error to Vercel console for debugging
    console.error('[HAYAATI CHAT API FATAL ERROR]:', err);

    let cleanMessage = 'The cognitive assistant encountered an error. Please try again.';

    if (err instanceof Error) {
      const raw = err.message;
      if (raw.includes('429') || raw.includes('quota') || raw.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          {
            error:
              'The AI assistant has reached its computational rate limit. Please wait a brief moment before sending another query.',
          },
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (raw.includes('API_KEY_INVALID') || raw.includes('403')) {
        cleanMessage = 'Invalid GEMINI_API_KEY. Please verify your API key in Vercel settings.';
      } else {
        cleanMessage = 'Transmission interrupted. Please retry your inquiry.';
      }
    }

    return NextResponse.json(
      { error: cleanMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
