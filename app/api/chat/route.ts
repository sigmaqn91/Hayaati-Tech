import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkChatRateLimit, RATE_CONFIG } from '@/lib/rateLimit';
import { verifyOwnerSession } from '@/lib/jarvisAuth';
import { buildJarvisKnowledge } from '@/lib/jarvisKnowledge';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BASE_SYSTEM_INSTRUCTION = `
You are Jarvis, the HAYAATI Cognitive Assistant, the built-in holographic navigation intelligence for Hayaati Web Technology (www.hayaatiweb.site).
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
- Strictly adhere to facts: Never invent fake company releases, prices, statistics, people, or identities. The owner and founder of Hayaati Web Technology is Aliya Khan. If a fact or name is not present in the supplied Hayaati knowledge, say that you do not have that information rather than guessing. Always maintain an honest, inspiring, and cinematic tone.
- Keep responses concise (2 to 4 sentences usually, max 6 sentences).
`;

export async function POST(req: NextRequest) {
  try {
    const isOwner = verifyOwnerSession(req);

    // 1. Quota & Rate Limit Check via lib/rateLimit.ts (dual-key: cookie + salted IP hash)
    // Rate limits strictly apply to public visitors; bypassed for verified owner
    let rateCheck: any = { allowed: true };
    if (!isOwner) {
      rateCheck = await checkChatRateLimit(req);
      if (!rateCheck.allowed) {
        console.warn(`[Assistant Rate Limited] Reason: ${rateCheck.reason}, RetryAfter: ${rateCheck.retryAfterSeconds}s`);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);

        const code = rateCheck.reason === 'global_cap' ? 'quota_reached' : 'rate_limited';
        const userMessage =
          rateCheck.reason === 'global_cap'
            ? 'Daily conversation quota reached. Please return tomorrow.'
            : 'Rate limit reached. Please pause a moment before sending another message.';

        return NextResponse.json(
          {
            error: userMessage,
            code,
            retryAfterSeconds: rateCheck.retryAfterSeconds,
          },
          { status: 429, headers }
        );
      }
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload.', code: 'generic_error' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, history, language, grounded } = body || {};
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

    const userLang = typeof language === 'string' && language.trim() ? language.trim() : 'en';

    // Intercept identity claims in public mode for instant defense
    const claimRegex = /\b(i am|my name is|im)\s+(aliya|aliya khan|the owner|the founder|admin|boss)\b/i;
    if (!isOwner && claimRegex.test(message.trim())) {
      const promptReply = 'Identity claim noted. Please provide your verification code.';
      return NextResponse.json({
        reply: promptReply,
        requiresVerification: true,
        isOwner: false,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // In dev mode, return fallback response if API key is not configured so the UI remains testable
    if (!apiKey || apiKey === 'disabled') {
      if (process.env.NODE_ENV === 'development') {
        console.info('[Gemini Chat Dev Fallback]: Missing GEMINI_API_KEY in dev mode. Serving simulated response.');
        const devReplies: Record<string, string> = {
          en: `[Dev Mode Preview] Welcome to Hayaati Web Technology. I am calibrated to assist you across the 2030, 2035, and 2050 timeline frontiers, deep tech catalogue, and future city postcards.`,
          hi: `[डेव मोड पूर्वावलोकन] हयाती वेब टेक्नोलॉजी में आपका स्वागत है। मैं 2030, 2035 और 2050 की भविष्य की समयसीमा और तकनीकी कैटलॉग के साथ आपकी सहायता के लिए तैयार हूँ।`,
          ar: `[معاينة وضع التطوير] مرحبًا بكم في هيااتي لتكنولوجيا الويب. يسعدني إرشادكم عبر آفاق 2030 و2035 و2050.`,
          es: `[Modo Dev] Bienvenido a Hayaati Web Technology. Estoy calibrado para guiarle a través de los horizontes 2030, 2035 y 2050.`,
          fr: `[Mode Dev] Bienvenue chez Hayaati Web Technology. Je suis calibré pour vous guider à travers les horizons 2030, 2035 et 2050.`,
        };
        const reply = devReplies[userLang] || devReplies['en'];
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);
        return NextResponse.json({ reply }, { status: 200, headers });
      }

      console.warn('[Gemini Chat]: Missing or disabled GEMINI_API_KEY on production server.');
      return NextResponse.json(
        {
          error: 'AI assistant is currently offline for calibration. You can explore all website sections.',
          code: 'server_busy',
        },
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const primaryModel = process.env.GEMINI_CHAT_MODEL || 'gemini-flash-latest';
    const candidateModels = [
      primaryModel,
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

    // Build language-specific system instruction
    const langInstruction = `
Language Instructions:
- Reply in the visitor's selected language: "${userLang}".
- Use natural, native-level wording and phrasing.
- If the visitor speaks or writes in another language or script (e.g., Hinglish / Urdu in Roman letters), reply naturally in that exact language and script.
- Do NOT use literal mechanical translations. No English words unless they are brand names (Hayaati, Gemini) or technical proper nouns.
`;

    // Same website status + owner facts the voice Jarvis uses, so typed answers know the site too.
    const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n${langInstruction}\n${buildJarvisKnowledge('')}`;

    // Pass conversation history safely
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if ((item.role === 'user' || item.role === 'model') && typeof item.text === 'string' && item.text.trim()) {
          contents.push({
            role: item.role,
            parts: [{ text: item.text.trim().slice(0, 1000) }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // Grounding: search grounding only when grounded === true and appropriate, do NOT ground blindly
    const tools = grounded === true ? [{ googleSearch: {} }] : undefined;

    let response: any = null;
    let lastError: any = null;

    // Model execution with prioritized fallback sequence
    for (const modelName of candidateModels) {
      try {
        const generationPromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 800,
            ...(tools ? { tools } : {}),
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(Object.assign(new Error('Gemini Chat request timed out'), { code: 'timeout', status: 504 })), 20000);
        });
        response = await Promise.race([generationPromise, timeoutPromise]);
        const replyText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText && replyText.trim().length > 0) {
          break; // Successful generation
        }
      } catch (modelErr: any) {
        lastError = modelErr;
        const errStatus = modelErr?.status || modelErr?.statusCode || 500;
        const errMsg = modelErr?.message || String(modelErr);
        // Log exact error status code and sanitized message (never visitor words or API key)
        console.error(`[Gemini Chat Model Error] Model: ${modelName}, Status: ${errStatus}, Error: ${errMsg.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    if (!response) {
      const errStatus = lastError?.status || lastError?.statusCode || 500;
      const rawMsg = lastError?.message || String(lastError || '');
      const errMsg = rawMsg.replace(/key=[^&\s]+/gi, 'key=REDACTED');
      console.error(`[Gemini Chat Fatal Exhaustion] Status: ${errStatus}, Message: ${errMsg}`);

      let code = 'generic_error';
      let status = 500;
      let error = 'Cognitive service temporarily unavailable.';

      if (errStatus === 429 || /quota|resource_exhausted/i.test(rawMsg)) {
        code = 'quota_reached';
        status = 429;
        error = 'Conversation quota reached. Please try again later.';
      } else if (errStatus === 401) {
        code = 'unauthorized';
        status = 401;
        error = 'AI authentication failed. Please try again later.';
      } else if (errStatus === 403) {
        code = 'forbidden';
        status = 403;
        error = 'AI access was denied. Please try again later.';
      } else if (errStatus === 404) {
        code = 'model_not_found';
        status = 404;
        error = 'AI model endpoint was not found. Please try again later.';
      } else if (errStatus === 504 || /timed out|timeout/i.test(rawMsg)) {
        code = 'timeout';
        status = 504;
        error = 'AI response timed out. Please try again.';
      } else if (errStatus === 503 || /overloaded|unavailable|busy/i.test(rawMsg)) {
        code = 'server_busy';
        status = 503;
        error = 'Cognitive service is temporarily busy. Please try again.';
      } else if (errStatus >= 500) {
        code = 'server_error';
        status = 500;
        error = 'Cognitive service encountered a server error. Please try again.';
      }

      return NextResponse.json(
        { error, code },
        { status, headers: { 'Content-Type': 'application/json' } }
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

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (rateCheck.cookieToSet) headers.set('Set-Cookie', rateCheck.cookieToSet);

    return NextResponse.json(
      { reply: replyText.trim(), isOwner },
      { status: 200, headers }
    );
  } catch (fatalErr: any) {
    const errStatus = fatalErr?.status || fatalErr?.statusCode || 500;
    const rawMsg = fatalErr?.message || String(fatalErr);
    console.error(`[Gemini Chat Fatal] Status: ${errStatus}, Message: ${rawMsg.replace(/key=[^&\s]+/gi, 'key=REDACTED')}`);
    const status = errStatus === 429 || errStatus === 401 || errStatus === 403 || errStatus === 404 || errStatus === 504
      ? errStatus
      : 500;
    const code = errStatus === 504 ? 'timeout' : errStatus === 429 ? 'quota_reached' : 'server_error';
    const error = errStatus === 504
      ? 'AI response timed out. Please try again.'
      : errStatus === 429
        ? 'Conversation quota reached. Please try again later.'
        : 'Fatal processing error. Please try again.';
    return NextResponse.json(
      { error, code },
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
