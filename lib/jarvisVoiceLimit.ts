import type { NextRequest } from 'next/server';
import { checkVoiceActionLimit } from './rateLimit';

export type VoiceKind = 'tts' | 'stt' | string;

export interface VoiceLimitResult {
  ok: boolean;
  retryAfter?: number;
}

/**
 * Checks and increments rate limit for Jarvis voice interactions (TTS/STT).
 * Delegates to the shared limiter in rateLimit.ts (with Redis and in-memory fallback),
 * allowing limits to survive page refresh and serverless invocations.
 */
export async function allowVoice(
  req: NextRequest | Request | string,
  kind: VoiceKind = 'voice'
): Promise<VoiceLimitResult> {
  const limit = parseInt(process.env.JARVIS_VOICE_LIMIT_PER_10_MIN || '24', 10);
  const windowSeconds = 10 * 60; // 10 minutes

  return await checkVoiceActionLimit(req, kind, limit, windowSeconds);
}
