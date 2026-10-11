/**
 * Rate Limiting & Safety Quota Manager for Hayaati Web Technology.
 * 
 * Supports:
 * - Distributed Upstash Redis REST when configured; in-memory fallback with exactly ONE warning log
 * - Dual-key visitor identity: HMAC-signed httpOnly cookie (SESSION_SIGNING_SECRET) + salted IP hash
 * - Stricter key wins to prevent quota reset on cookie/cache clear
 * - Fallback shared strict 'anonymous' bucket if neither cookie nor IP is available
 * - Atomic increment with expiry for all counters (10 min chat, 1 hr voice, 1 day global)
 * - F7 Fix: global daily counter increments ONLY for requests that pass visitor limits
 * - Shared voice counters (hourly, daily minutes, concurrency) with retryAfterSeconds
 * - Safe: Never prints or exposes secrets; never crashes
 */

import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export interface RateLimitConfig {
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

// ==========================================
// 1. Storage & Upstash Redis REST Integration
// ==========================================

const rawUpstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const rawUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const isRedisDisabled =
  !rawUpstashUrl ||
  !rawUpstashToken ||
  rawUpstashUrl.trim().toLowerCase() === 'disabled' ||
  rawUpstashToken.trim().toLowerCase() === 'disabled';

const UPSTASH_URL = isRedisDisabled ? null : rawUpstashUrl.replace(/\/+$/, '');
const UPSTASH_TOKEN = isRedisDisabled ? null : rawUpstashToken;

let hasLoggedRedisWarning = false;
function logRedisWarningOnce() {
  if (!hasLoggedRedisWarning && isRedisDisabled) {
    console.warn('[RateLimit]: Upstash Redis REST is not configured or disabled. Using in-memory fallback store.');
    hasLoggedRedisWarning = true;
  }
}

let hasLoggedSigningSecretWarning = false;
function logSigningSecretWarningOnce() {
  if (!hasLoggedSigningSecretWarning && !process.env.SESSION_SIGNING_SECRET) {
    console.warn('[RateLimit]: SESSION_SIGNING_SECRET is not configured. Visitor cookie signing disabled; using IP key only.');
    hasLoggedSigningSecretWarning = true;
  }
}

// In-Memory store for fallback or local execution
interface InMemoryItem {
  count: number;
  expiresAt: number;
}
const inMemoryCounters = new Map<string, InMemoryItem>();
let inMemoryActiveVoiceSessions = 0;

// Clean expired items periodically
function cleanInMemoryStore() {
  const now = Date.now();
  for (const [key, item] of inMemoryCounters.entries()) {
    if (item.expiresAt <= now) {
      inMemoryCounters.delete(key);
    }
  }
}

async function executeRedisCommand(command: (string | number)[]): Promise<unknown> {
  logRedisWarningOnce();
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * Atomic increment with TTL.
 * Returns { count, ttlRemaining }
 */
async function atomicIncrement(key: string, ttlSeconds: number): Promise<{ count: number; ttlRemaining: number }> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const count = (await executeRedisCommand(['INCR', key])) as number;
      if (typeof count === 'number') {
        if (count === 1) {
          await executeRedisCommand(['EXPIRE', key, ttlSeconds]);
        }
        let ttl = (await executeRedisCommand(['TTL', key])) as number;
        if (typeof ttl !== 'number' || ttl < 0) {
          ttl = ttlSeconds;
        }
        return { count, ttlRemaining: ttl };
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  // In-Memory Fallback
  cleanInMemoryStore();
  const now = Date.now();
  const existing = inMemoryCounters.get(key);
  if (!existing || existing.expiresAt <= now) {
    const expiresAt = now + ttlSeconds * 1000;
    inMemoryCounters.set(key, { count: 1, expiresAt });
    return { count: 1, ttlRemaining: ttlSeconds };
  }

  existing.count += 1;
  const ttlRemaining = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
  return { count: existing.count, ttlRemaining };
}

/**
 * Read-only check for a key's count and remaining TTL without incrementing.
 */
async function getCounter(key: string): Promise<{ count: number; ttlRemaining: number }> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      // GET and TTL together (one network wait instead of two).
      const [raw, ttlRaw] = await Promise.all([executeRedisCommand(['GET', key]), executeRedisCommand(['TTL', key])]);
      const count = raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      let ttl = ttlRaw as number;
      if (typeof ttl !== 'number' || ttl < 0) ttl = 0;
      return { count: isNaN(count) ? 0 : count, ttlRemaining: ttl };
    } catch {
      // Fall through
    }
  }

  cleanInMemoryStore();
  const existing = inMemoryCounters.get(key);
  if (!existing || existing.expiresAt <= Date.now()) {
    return { count: 0, ttlRemaining: 0 };
  }
  const ttlRemaining = Math.max(1, Math.ceil((existing.expiresAt - Date.now()) / 1000));
  return { count: existing.count, ttlRemaining };
}

/**
 * Decrement or decrement by amount (safe floor at 0).
 */
async function decrementCounter(key: string, amount = 1): Promise<number> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const res = await executeRedisCommand(['DECRBY', key, amount]);
      if (typeof res === 'number') {
        if (res < 0) await executeRedisCommand(['SET', key, 0]);
        return Math.max(0, res);
      }
    } catch {
      // Fall through
    }
  }

  const existing = inMemoryCounters.get(key);
  if (existing) {
    existing.count = Math.max(0, existing.count - amount);
    return existing.count;
  }
  return 0;
}

// ==========================================
// 2. Visitor Identity: Signed Cookie & Salted IP Hash
// ==========================================

const COOKIE_NAME = '__hayaati_vid';
const IP_SALT = 'hayaati_salt_v3_cognitive_horizon_2030';

export interface VisitorIdentity {
  visitorId: string | null;
  ipHash: string | null;
  cookieToSet?: string;
  keys: string[];
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function signVisitorId(visitorId: string, secret: string): string {
  const sig = crypto.createHmac('sha256', secret).update(visitorId).digest('hex');
  return `${visitorId}.${sig}`;
}

function verifySignedVisitorId(cookieValue: string, secret: string): string | null {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [visitorId, sig] = parts;
  if (!visitorId || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', secret).update(visitorId).digest('hex');
  if (timingSafeEqualStr(sig, expectedSig)) {
    return visitorId;
  }
  return null;
}

function hashIp(rawIp: string): string | null {
  const clean = rawIp.trim().toLowerCase();
  if (
    !clean ||
    clean === 'unknown-client' ||
    clean === 'unknown' ||
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    clean.startsWith('172.')
  ) {
    return null;
  }
  return crypto.createHash('sha256').update(`${IP_SALT}:${clean}`).digest('hex').slice(0, 24);
}

/**
 * Extracts and verifies visitor identity from request.
 * Returns visitorId, salted ipHash, and cookieToSet if a fresh cookie was generated.
 */
export function getVisitorIdentity(reqOrIp: NextRequest | Request | string): VisitorIdentity {
  const signingSecret = process.env.SESSION_SIGNING_SECRET?.trim() || null;
  if (!signingSecret) {
    logSigningSecretWarningOnce();
  }

  let cookieHeader: string | null = null;
  let rawIp = '';

  if (typeof reqOrIp === 'string') {
    rawIp = reqOrIp;
  } else if ('headers' in reqOrIp) {
    const headers = reqOrIp.headers;
    cookieHeader = headers.get('cookie') || null;
    const xff = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
    rawIp = xff.split(',')[0].trim();
  }

  let visitorId: string | null = null;
  let cookieToSet: string | undefined = undefined;

  // 1. Verify existing cookie if secret is available
  if (signingSecret && cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (match && match[1]) {
      visitorId = verifySignedVisitorId(decodeURIComponent(match[1]), signingSecret);
    }
  }

  // 2. If no valid visitorId and secret is configured, issue a signed one
  if (!visitorId && signingSecret) {
    visitorId = crypto.randomUUID();
    const signedValue = signVisitorId(visitorId, signingSecret);
    const isProd = process.env.NODE_ENV === 'production';
    cookieToSet = `${COOKIE_NAME}=${encodeURIComponent(signedValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${
      isProd ? '; Secure' : ''
    }`;
  }

  const ipHash = hashIp(rawIp);

  // 3. Assemble verification keys
  const keys: string[] = [];
  if (visitorId) keys.push(`vid:${visitorId}`);
  if (ipHash) keys.push(`ip:${ipHash}`);

  // 4. If neither visitorId nor ipHash can be resolved, use shared strict 'anon:shared' bucket
  if (keys.length === 0) {
    keys.push('anon:shared');
  }

  return { visitorId, ipHash, cookieToSet, keys };
}

// ==========================================
// 3. Chat Rate Limiting (10 min window)
// ==========================================

export async function checkChatRateLimit(reqOrIp: NextRequest | Request | string): Promise<{
  allowed: boolean;
  reason?: 'visitor_limit' | 'global_cap';
  remaining?: number;
  retryAfterSeconds?: number;
  cookieToSet?: string;
}> {
  logRedisWarningOnce();
  const identity = getVisitorIdentity(reqOrIp);
  const CHAT_WINDOW_SECONDS = 10 * 60; // 10 minutes
  const today = new Date().toISOString().slice(0, 10);
  const globalKey = `global:chat:${today}`;

  // STEP 1: Check visitor rate limits across BOTH keys (stricter result wins).
  // Do NOT increment yet to protect global cap from rejected requests (Fix F7).
  let maxUsage = 0;
  let maxTtl = CHAT_WINDOW_SECONDS;

  for (const key of identity.keys) {
    const chatKey = `rate:chat:${key}`;
    const counter = await getCounter(chatKey);
    if (counter.count > maxUsage) {
      maxUsage = counter.count;
    }
    if (counter.ttlRemaining > 0) {
      maxTtl = counter.ttlRemaining;
    }
    if (counter.count >= RATE_CONFIG.chatLimitPerVisitor) {
      return {
        allowed: false,
        reason: 'visitor_limit',
        remaining: 0,
        retryAfterSeconds: counter.ttlRemaining || CHAT_WINDOW_SECONDS,
        cookieToSet: identity.cookieToSet,
      };
    }
  }

  // STEP 2: Check Global Daily Chat Cap before incrementing
  const globalCounter = await getCounter(globalKey);
  if (globalCounter.count >= RATE_CONFIG.globalDailyChatCap) {
    const secondsUntilMidnight = Math.max(
      60,
      Math.floor((new Date(today + 'T23:59:59.999Z').getTime() - Date.now()) / 1000)
    );
    return {
      allowed: false,
      reason: 'global_cap',
      remaining: 0,
      retryAfterSeconds: globalCounter.ttlRemaining || secondsUntilMidnight,
      cookieToSet: identity.cookieToSet,
    };
  }

  // STEP 3: Request passed visitor checks! Increment visitor counters for both keys atomically.
  let strictestCount = 0;
  for (const key of identity.keys) {
    const chatKey = `rate:chat:${key}`;
    const result = await atomicIncrement(chatKey, CHAT_WINDOW_SECONDS);
    if (result.count > strictestCount) {
      strictestCount = result.count;
    }
  }

  // STEP 4: Increment Global Daily Chat Cap (Fix F7: only requests that passed visitor check increment global cap)
  await atomicIncrement(globalKey, 86400);

  const remaining = Math.max(0, RATE_CONFIG.chatLimitPerVisitor - strictestCount);
  return {
    allowed: true,
    remaining,
    cookieToSet: identity.cookieToSet,
  };
}

// ==========================================
// 4. Voice Rate Limiting & Concurrency (Shared Store)
// ==========================================

const CONCURRENCY_KEY = 'concurrency:voice:active';

export async function checkVoiceSessionLimit(reqOrIp: NextRequest | Request | string): Promise<{
  allowed: boolean;
  reason?: 'visitor_limit' | 'global_cap' | 'concurrency_limit';
  retryAfterSeconds?: number;
  cookieToSet?: string;
}> {
  logRedisWarningOnce();
  const identity = getVisitorIdentity(reqOrIp);
  const VOICE_HOUR_SECONDS = 60 * 60; // 1 hour
  const today = new Date().toISOString().slice(0, 10);
  const globalVoiceKey = `global:voice:minutes:${today}`;

  // All reads go out at the same time (they used to run one after another = slow "connecting").
  // The decision order below is unchanged.
  const concurrencyRead: Promise<number> =
    UPSTASH_URL && UPSTASH_TOKEN
      ? executeRedisCommand(['GET', CONCURRENCY_KEY])
          .then((v) => (v ? parseInt(String(v), 10) || 0 : 0))
          .catch(() => inMemoryActiveVoiceSessions)
      : Promise.resolve(inMemoryActiveVoiceSessions);
  const [globalMinutes, activeConcurrencyRead, visitorCounters] = await Promise.all([
    getCounter(globalVoiceKey),
    concurrencyRead,
    Promise.all(identity.keys.map((key) => getCounter(`rate:voice:hour:${key}`))),
  ]);

  // 1. Check Global Daily Voice Minutes Cap
  if (globalMinutes.count >= RATE_CONFIG.globalDailyVoiceMinutesCap) {
    const secondsUntilMidnight = Math.max(
      60,
      Math.floor((new Date(today + 'T23:59:59.999Z').getTime() - Date.now()) / 1000)
    );
    return {
      allowed: false,
      reason: 'global_cap',
      retryAfterSeconds: globalMinutes.ttlRemaining || secondsUntilMidnight,
      cookieToSet: identity.cookieToSet,
    };
  }

  // 2. Check Global Concurrency Limit
  const activeConcurrency = activeConcurrencyRead;

  if (activeConcurrency >= RATE_CONFIG.maxConcurrentVoiceSessions) {
    return {
      allowed: false,
      reason: 'concurrency_limit',
      retryAfterSeconds: 30,
      cookieToSet: identity.cookieToSet,
    };
  }

  // 3. Check Visitor Hourly Limit across both keys (stricter wins)
  for (const counter of visitorCounters) {
    if (counter.count >= RATE_CONFIG.voiceSessionsPerHour) {
      return {
        allowed: false,
        reason: 'visitor_limit',
        retryAfterSeconds: counter.ttlRemaining || VOICE_HOUR_SECONDS,
        cookieToSet: identity.cookieToSet,
      };
    }
  }

  return {
    allowed: true,
    cookieToSet: identity.cookieToSet,
  };
}

/**
 * Records the start of a voice session:
 * Increments visitor hourly count and concurrency slot in the shared store.
 */
export async function recordVoiceSessionStart(
  reqOrIdentity: NextRequest | Request | VisitorIdentity | string
): Promise<void> {
  const identity =
    typeof reqOrIdentity === 'object' && 'keys' in reqOrIdentity
      ? (reqOrIdentity as VisitorIdentity)
      : getVisitorIdentity(reqOrIdentity);

  const VOICE_HOUR_SECONDS = 60 * 60;

  // Hourly counters (both keys) and the concurrency slot are updated in parallel (same result, less waiting).
  const hourly = identity.keys.map((key) => atomicIncrement(`rate:voice:hour:${key}`, VOICE_HOUR_SECONDS));

  const concurrency = (async () => {
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      try {
        await executeRedisCommand(['INCR', CONCURRENCY_KEY]);
        // Concurrency key safety TTL in case server crashes
        await executeRedisCommand(['EXPIRE', CONCURRENCY_KEY, 300]);
      } catch {
        inMemoryActiveVoiceSessions += 1;
      }
    } else {
      inMemoryActiveVoiceSessions += 1;
    }
  })();

  await Promise.all([...hourly, concurrency]);
}

/**
 * Refunds a voice session if token creation failed on our side.
 */
export async function refundVoiceSession(
  reqOrIdentity: NextRequest | Request | VisitorIdentity | string
): Promise<void> {
  const identity =
    typeof reqOrIdentity === 'object' && 'keys' in reqOrIdentity
      ? (reqOrIdentity as VisitorIdentity)
      : getVisitorIdentity(reqOrIdentity);

  for (const key of identity.keys) {
    const voiceKey = `rate:voice:hour:${key}`;
    await decrementCounter(voiceKey, 1);
  }

  // Decrement concurrency
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      await decrementCounter(CONCURRENCY_KEY, 1);
    } catch {
      inMemoryActiveVoiceSessions = Math.max(0, inMemoryActiveVoiceSessions - 1);
    }
  } else {
    inMemoryActiveVoiceSessions = Math.max(0, inMemoryActiveVoiceSessions - 1);
  }
}

/**
 * Releases a voice session when finished.
 * Safely decrements active concurrency and increments daily voice minutes.
 */
export async function releaseVoiceSession(durationSeconds: number): Promise<void> {
  // Decrement active concurrency slot
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      await decrementCounter(CONCURRENCY_KEY, 1);
    } catch {
      inMemoryActiveVoiceSessions = Math.max(0, inMemoryActiveVoiceSessions - 1);
    }
  } else {
    inMemoryActiveVoiceSessions = Math.max(0, inMemoryActiveVoiceSessions - 1);
  }

  // Accumulate daily voice minutes
  if (durationSeconds > 0) {
    const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const today = new Date().toISOString().slice(0, 10);
    const globalVoiceKey = `global:voice:minutes:${today}`;

    if (UPSTASH_URL && UPSTASH_TOKEN) {
      try {
        await executeRedisCommand(['INCRBY', globalVoiceKey, minutes]);
        await executeRedisCommand(['EXPIRE', globalVoiceKey, 86400]);
      } catch {
        // Fallback
      }
    } else {
      const existing = inMemoryCounters.get(globalVoiceKey);
      const expiresAt = Date.now() + 86400 * 1000;
      if (existing) {
        existing.count += minutes;
      } else {
        inMemoryCounters.set(globalVoiceKey, { count: minutes, expiresAt });
      }
    }
  }
}

// ==========================================
// 6. Enquiry / Form Submission Rate Limiting
// ==========================================

export async function checkEnquiryRateLimit(reqOrIp: NextRequest | Request | string): Promise<{
  allowed: boolean;
  reason?: 'visitor_limit';
  retryAfterSeconds?: number;
  cookieToSet?: string;
}> {
  logRedisWarningOnce();
  const identity = getVisitorIdentity(reqOrIp);
  const ENQUIRY_WINDOW_SECONDS = 10 * 60; // 10 minutes
  const ENQUIRY_LIMIT = 5;

  let maxUsage = 0;
  let maxTtl = ENQUIRY_WINDOW_SECONDS;

  for (const key of identity.keys) {
    const enquiryKey = `rate:enquiry:${key}`;
    const counter = await getCounter(enquiryKey);
    if (counter.count > maxUsage) {
      maxUsage = counter.count;
    }
    if (counter.ttlRemaining > 0) {
      maxTtl = counter.ttlRemaining;
    }
    if (counter.count >= ENQUIRY_LIMIT) {
      return {
        allowed: false,
        reason: 'visitor_limit',
        retryAfterSeconds: counter.ttlRemaining || ENQUIRY_WINDOW_SECONDS,
        cookieToSet: identity.cookieToSet,
      };
    }
  }

  // Increment across all identity keys
  for (const key of identity.keys) {
    const enquiryKey = `rate:enquiry:${key}`;
    await atomicIncrement(enquiryKey, ENQUIRY_WINDOW_SECONDS);
  }

  return {
    allowed: true,
    cookieToSet: identity.cookieToSet,
  };
}

// ==========================================
// 7. Jarvis Voice (TTS / STT) Rate Limiting
// ==========================================

export async function checkVoiceActionLimit(
  reqOrIp: NextRequest | Request | string,
  kind = 'voice',
  limit = 24,
  windowSeconds = 600
): Promise<{ ok: boolean; retryAfter?: number }> {
  logRedisWarningOnce();
  const identity = getVisitorIdentity(reqOrIp);
  let maxUsage = 0;
  let maxTtl = windowSeconds;

  for (const key of identity.keys) {
    const rateKey = `rate:jarvis_voice_${kind}:${key}`;
    const counter = await getCounter(rateKey);
    if (counter.count > maxUsage) {
      maxUsage = counter.count;
    }
    if (counter.ttlRemaining > 0) {
      maxTtl = counter.ttlRemaining;
    }
    if (counter.count >= limit) {
      return {
        ok: false,
        retryAfter: counter.ttlRemaining || maxTtl || windowSeconds,
      };
    }
  }

  for (const key of identity.keys) {
    const rateKey = `rate:jarvis_voice_${kind}:${key}`;
    await atomicIncrement(rateKey, windowSeconds);
  }

  return { ok: true };
}

// ==========================================
// 8. Website Rating submissions
// ==========================================

/** One visitor can send at most 3 ratings per hour (stops spam; a real visitor rates once). */
export async function checkRatingRateLimit(
  reqOrIp: NextRequest | Request | string,
  kind: 'rating' | 'rating-admin' = 'rating'
): Promise<{
  allowed: boolean;
  retryAfterSeconds?: number;
  cookieToSet?: string;
}> {
  logRedisWarningOnce();
  const identity = getVisitorIdentity(reqOrIp);
  const WINDOW_SECONDS = 60 * 60;
  // Owner report page: up to 30 opens / code tries per hour (blocks code guessing).
  const LIMIT = kind === 'rating' ? 3 : 30;

  for (const key of identity.keys) {
    const counter = await getCounter(`rate:${kind}:${key}`);
    if (counter.count >= LIMIT) {
      return { allowed: false, retryAfterSeconds: counter.ttlRemaining || WINDOW_SECONDS, cookieToSet: identity.cookieToSet };
    }
  }
  for (const key of identity.keys) {
    await atomicIncrement(`rate:${kind}:${key}`, WINDOW_SECONDS);
  }
  return { allowed: true, cookieToSet: identity.cookieToSet };
}
