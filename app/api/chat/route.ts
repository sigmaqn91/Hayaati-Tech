import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkChatRateLimit, RATE_CONFIG } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BASE_SYSTEM_INSTRUCTION = `
You are the HAYAATI Cognitive Assistant, the built-in holographic navigation intelligence for Hayaati Web Technology (www.hayaatiweb.site).
Owner & Lead Architect: Aliya Khan. Contact Email: Hayaati.Technology@gmail.com.

Mission & Persona:
- You speak with calm, precise, cinematic authority (futuristic, polite, technical yet clear).
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

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ip = forwarded.split(',')[0].trim() || 'unknown-client';

    // 1. Quota & Rate Limit Check
    const rateCheck = await checkChatRateLimit(ip);
    if (!rateCheck.allowed) {
      console.warn(`[Assistant Rate Limited] IP: ${ip} Reason: ${rateCheck.reason}`);
      return NextResponse.json(
        {
          error: 'Rate limit or safety quota reached.',
          code: 'quota_reached',
        },
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, history, language } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > RATE_CONFIG.maxMessageChars) {
      return NextResponse.json(
        {
          error: `Message exceeds maximum allowed length of ${RATE_CONFIG.maxMessageChars} characters.`,
          code: 'generic_error',
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'disabled') {
      console.warn('[Gemini Chat]: Missing or disabled GEMINI_API_KEY on server. AI assistant is safely offline.');
      return NextResponse.json(
        {
          error: 'AI assistant is currently offline for calibration. You can explore all website sections.',
          code: 'server_busy',
        },
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Official Model Fallback Sequence (Prioritizing gemini-3.8-flash)
    const primaryModel = process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash';
    const candidateModels = [
      primaryModel,
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

    // Build language-specific system instruction
    const userLang = typeof language === 'string' && language.trim() ? language.trim() : 'en';
    const langInstruction = `
Language Instructions:
- Reply in the visitor's selected language: "${userLang}".
- Use natural, native-level wording and phrasing.
- If the visitor speaks or writes in another language or script (e.g., Hinglish / Urdu in Roman letters), reply naturally in that exact language and script.
- Do NOT use literal mechanical translations. No English words unless they are brand names (Hayaati, Gemini) or technical proper nouns.
`;

    const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n${langInstruction}`;

    // Format chat history safely
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-4)) {
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

    let response: any = null;
    let lastError: any = null;

    // Model execution with automatic fallback
    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 350,
          },
        });
        const replyText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText && replyText.trim().length > 0) {
          break; // successfully generated
        }
      } catch (modelErr: unknown) {
        lastError = modelErr;
        const errStatus = (modelErr as any)?.status || (modelErr as any)?.statusCode || 500;
        const errName = modelErr instanceof Error ? modelErr.name : 'UnknownError';
        const errMsg = modelErr instanceof Error ? modelErr.message : String(modelErr);
        console.error(`[Gemini Chat Error] Attempt with model '${modelName}' failed:`, {
          status: errStatus,
          name: errName,
          message: errMsg,
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!response) {
      const errMsg = lastError instanceof Error ? lastError.message : String(lastError || '');
      console.error('[Gemini Chat Error]: All candidate models failed. Final error:', errMsg);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { error: 'Rate limit or quota reached.', code: 'quota_reached' },
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (errMsg.includes('503') || errMsg.includes('overloaded') || errMsg.includes('UNAVAILABLE') || errMsg.includes('busy')) {
        return NextResponse.json(
          { error: 'The AI model is temporarily busy. Please retry in a few seconds.', code: 'server_busy' },
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.json(
        { error: 'Cognitive service error.', code: 'generic_error' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const replyText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText || replyText.trim().length === 0) {
      console.error('[Gemini Chat Error]: Model returned empty response text.');
      return NextResponse.json(
        { error: 'Empty response received.', code: 'generic_error' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(
      { reply: replyText.trim() },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (fatalErr: unknown) {
    console.error('[Gemini Chat Fatal Exception]:', {
      name: fatalErr instanceof Error ? fatalErr.name : 'FatalException',
      message: fatalErr instanceof Error ? fatalErr.message : String(fatalErr),
    });
    return NextResponse.json(
      { error: 'Fatal processing error.', code: 'generic_error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
