/**
 * Rate Limiting & Safety Quota Manager for Hayaati Web Technology.
 * Supports:
 * - Per-visitor chat message limits
 * - Per-visitor voice session limits
 * - Global daily safety cap (protects project from free-tier exhaustion)
 * - Distributed Upstash Redis / Vercel KV when configured
 * - In-memory fallback when KV is not configured (with note on serverless persistence)
 */

interface RateLimitConfig {
  chatLimitPerVisitor: number; // default: 20 per 10 mins
  voiceSessionsPerHour: number; // default: 3 per hour
  voiceSessionMaxSeconds: number; // default: 180 seconds
  maxConcurrentVoiceSessions: number; // default: 5
  globalDailyChatCap: number; // default: 500
  globalDailyVoiceMinutesCap: number; // default: 60
  maxMessageChars: number; // default: 500
}

export const RATE_CONFIG: RateLimitConfig = {
  chatLimitPerVisitor: parseInt(process.env.CHAT_LIMIT_PER_VISITOR || '20', 10),
  voiceSessionsPerHour: parseInt(process.env.VOICE_SESSIONS_PER_VISITOR_PER_HOUR || '3', 10),
  voiceSessionMaxSeconds: parseInt(process.env.VOICE_SESSION_MAX_SECONDS || '180', 10),
  maxConcurrentVoiceSessions: parseInt(process.env.MAX_CONCURRENT_VOICE_SESSIONS || '5', 10),
  globalDailyChatCap: parseInt(process.env.GLOBAL_DAILY_CHAT_CAP || '500', 10),
  globalDailyVoiceMinutesCap: parseInt(process.env.GLOBAL_DAILY_VOICE_MINUTES_CAP || '60', 10),
  maxMessageChars: parseInt(process.env.MAX_MESSAGE_CHARS || '500', 10),
};

// In-memory fallback maps
const inMemoryChatMap = new Map<string, number[]>();
const inMemoryVoiceMap = new Map<string, number[]>();
let inMemoryDailyChatCount = 0;
let inMemoryDailyChatDate = new Date().toISOString().slice(0, 10);
let inMemoryDailyVoiceMinutes = 0;
let inMemoryDailyVoiceDate = new Date().toISOString().slice(0, 10);
let activeVoiceSessionsCount = 0;

const rawUpstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const rawUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const isRedisDisabled =
  !rawUpstashUrl ||
  !rawUpstashToken ||
  rawUpstashUrl.trim().toLowerCase() === 'disabled' ||
  rawUpstashToken.trim().toLowerCase() === 'disabled';

const UPSTASH_URL = isRedisDisabled ? null : rawUpstashUrl;
const UPSTASH_TOKEN = isRedisDisabled ? null : rawUpstashToken;

let hasLoggedRedisWarning = false;
function logRedisWarningOnce() {
  if (!hasLoggedRedisWarning && isRedisDisabled) {
    console.warn('[RateLimit]: Upstash Redis / KV is not configured or disabled. Using in-memory fallback counters.');
    hasLoggedRedisWarning = true;
  }
}

async function redisCommand(command: string[]): Promise<unknown> {
  logRedisWarningOnce();
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/${command.join('/')}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

export async function checkChatRateLimit(ip: string): Promise<{
  allowed: boolean;
  reason?: 'visitor_limit' | 'global_cap';
  remaining?: number;
}> {
  logRedisWarningOnce();
  const today = new Date().toISOString().slice(0, 10);

  // 1. Check Global Daily Cap
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const globalKey = `global:chat:${today}`;
      const count = ((await redisCommand(['INCR', globalKey])) as number) || 1;
      await redisCommand(['EXPIRE', globalKey, '86400']);
      if (count > RATE_CONFIG.globalDailyChatCap) {
        return { allowed: false, reason: 'global_cap' };
      }
    } catch {
      // fallback to memory
    }
  } else {
    if (inMemoryDailyChatDate !== today) {
      inMemoryDailyChatDate = today;
      inMemoryDailyChatCount = 0;
    }
    inMemoryDailyChatCount++;
    if (inMemoryDailyChatCount > RATE_CONFIG.globalDailyChatCap) {
      return { allowed: false, reason: 'global_cap' };
    }
  }

  const cleanIp = ip?.trim().toLowerCase();
  if (
    !cleanIp ||
    cleanIp === 'unknown-client' ||
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('172.')
  ) {
    return { allowed: true, remaining: RATE_CONFIG.chatLimitPerVisitor };
  }

  // 2. Check Visitor Limit (10 min window)
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const key = `rate:chat:${ip}`;
      const count = ((await redisCommand(['INCR', key])) as number) || 1;
      if (count === 1) {
        await redisCommand(['EXPIRE', key, '600']);
      }
      if (count > RATE_CONFIG.chatLimitPerVisitor) {
        return { allowed: false, reason: 'visitor_limit', remaining: 0 };
      }
      return { allowed: true, remaining: Math.max(0, RATE_CONFIG.chatLimitPerVisitor - count) };
    } catch {
      // fallback to memory
    }
  }

  const timestamps = inMemoryChatMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);
  if (validTimestamps.length >= RATE_CONFIG.chatLimitPerVisitor) {
    inMemoryChatMap.set(ip, validTimestamps);
    return { allowed: false, reason: 'visitor_limit', remaining: 0 };
  }
  validTimestamps.push(now);
  inMemoryChatMap.set(ip, validTimestamps);
  return {
    allowed: true,
    remaining: RATE_CONFIG.chatLimitPerVisitor - validTimestamps.length,
  };
}

export async function checkVoiceSessionLimit(ip: string): Promise<{
  allowed: boolean;
  reason?: 'visitor_limit' | 'global_cap' | 'concurrency_limit';
}> {
  const today = new Date().toISOString().slice(0, 10);
  if (inMemoryDailyVoiceDate !== today) {
    inMemoryDailyVoiceDate = today;
    inMemoryDailyVoiceMinutes = 0;
  }
  if (inMemoryDailyVoiceMinutes >= RATE_CONFIG.globalDailyVoiceMinutesCap) {
    return { allowed: false, reason: 'global_cap' };
  }
  if (activeVoiceSessionsCount >= RATE_CONFIG.maxConcurrentVoiceSessions) {
    return { allowed: false, reason: 'concurrency_limit' };
  }
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const timestamps = inMemoryVoiceMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);
  if (validTimestamps.length >= RATE_CONFIG.voiceSessionsPerHour) {
    return { allowed: false, reason: 'visitor_limit' };
  }
  validTimestamps.push(now);
  inMemoryVoiceMap.set(ip, validTimestamps);
  activeVoiceSessionsCount++;
  return { allowed: true };
}

export function releaseVoiceSession(durationSeconds: number) {
  activeVoiceSessionsCount = Math.max(0, activeVoiceSessionsCount - 1);
  inMemoryDailyVoiceMinutes += Math.ceil(durationSeconds / 60);
}
