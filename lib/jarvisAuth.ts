import crypto from 'crypto';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = '__jarvis_admin_session';
const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60; // 2 hours

// In-memory verification attempts store: ip -> { count, lockedUntil, attempts }
interface AttemptRecord {
  count: number;
  lockedUntil: number;
  lastAttemptAt: number;
}
const attemptStore = new Map<string, AttemptRecord>();

// Failed verification audit log for Admin panel
export interface FailedAuditLog {
  id: string;
  ip: string;
  timestamp: string;
  reason: string;
}
export const failedAuditLogs: FailedAuditLog[] = [];

function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  const xff = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
  const ip = xff.split(',')[0].trim();
  return ip || '127.0.0.1';
}

/**
 * Checks verification attempt rate limit.
 * Max 5 attempts per 15 minutes per IP.
 */
export function checkVerifyRateLimit(req: NextRequest | Request): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = attemptStore.get(ip);

  if (record) {
    if (record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    // Reset window after 15 minutes of inactivity
    if (now - record.lastAttemptAt > 15 * 60 * 1000) {
      attemptStore.delete(ip);
    }
  }

  return { allowed: true };
}

/**
 * Record a failed attempt with backoff.
 */
export function recordFailedVerifyAttempt(req: NextRequest | Request, reason = 'invalid_credentials') {
  const ip = getClientIp(req);
  const now = Date.now();
  const existing = attemptStore.get(ip) || { count: 0, lockedUntil: 0, lastAttemptAt: now };

  existing.count += 1;
  existing.lastAttemptAt = now;

  if (existing.count >= 5) {
    // 15 min base lockout + exponential backoff
    const multiplier = Math.min(4, existing.count - 4);
    existing.lockedUntil = now + multiplier * 15 * 60 * 1000;
  }

  attemptStore.set(ip, existing);

  // Add audit log
  failedAuditLogs.unshift({
    id: `fail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ip: ip.replace(/\.\d+$/, '.xxx'), // Mask last octet for safety
    timestamp: new Date().toISOString(),
    reason,
  });

  if (failedAuditLogs.length > 50) {
    failedAuditLogs.pop();
  }
}

/**
 * Reset failed attempts upon successful verification.
 */
export function resetVerifyAttempts(req: NextRequest | Request) {
  const ip = getClientIp(req);
  attemptStore.delete(ip);
}

function getSigningSecret(): string {
  return (
    process.env.JARVIS_SESSION_SECRET ||
    process.env.SESSION_SIGNING_SECRET ||
    'fallback-in-memory-ephemeral-session-secret-matrix-999'
  );
}

/**
 * Issues signed session cookie for verified owner.
 */
export function createOwnerSessionToken(): { token: string; cookieString: string } {
  const secret = getSigningSecret();
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = JSON.stringify({
    role: 'owner',
    issuedAt: Date.now(),
    expiresAt,
    salt: crypto.randomBytes(16).toString('hex'),
  });

  const payloadBase64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('hex');
  const token = `${payloadBase64}.${signature}`;

  const isProd = process.env.NODE_ENV === 'production';
  const cookieString = `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${
    isProd ? '; Secure' : ''
  }`;

  return { token, cookieString };
}

/**
 * Verifies if the request possesses a valid, non-expired owner session token.
 */
export function verifyOwnerSession(req: NextRequest | Request): boolean {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  if (!match || !match[1]) return false;

  const rawToken = match[1].trim();
  const parts = rawToken.split('.');
  if (parts.length !== 2) return false;

  const [payloadBase64, providedSig] = parts;
  const secret = getSigningSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadBase64).digest('hex');

  if (providedSig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.role !== 'owner') return false;
    if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Constant-time code check against JARVIS_ADMIN_CODE.
 */
export function verifyOwnerCode(providedCode: string): boolean {
  const adminCode = process.env.JARVIS_ADMIN_CODE?.trim();
  if (!adminCode) {
    console.warn('[Jarvis Auth]: JARVIS_ADMIN_CODE is not configured in environment.');
    return false;
  }

  // Use SHA-256 digests for constant-length constant-time comparison to avoid length leakage
  const expectedHash = crypto.createHash('sha256').update(adminCode).digest();
  const providedHash = crypto.createHash('sha256').update(providedCode).digest();

  return crypto.timingSafeEqual(expectedHash, providedHash);
}

/**
 * Creates expiration cookie string for logout.
 */
export function createLogoutCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
    isProd ? '; Secure' : ''
  }`;
}
