/**
 * Voice error reports (server only). Same Upstash Redis as the visitors / ratings (UPSTASH_REDIS_REST_URL / _TOKEN
 * or KV_REST_API_URL / _TOKEN). Local development without Redis: .data/voice-errors.jsonl.
 *
 * Only short technical fields are kept (code, status, reason, retry time, tour mode, anonymous visitor id).
 * No tokens, keys, message text or IP address is ever stored.
 */

import fs from 'fs';
import path from 'path';

export interface VoiceErrorReport {
  id: string;
  at: string;
  type: string;
  code: string;
  status: number | null;
  reason: string;
  retryAfter: number | null;
  mode: string;
  vid: string;
  layer: string;
}

const rawUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const REDIS_URL =
  rawUrl && rawToken && rawUrl.trim().toLowerCase() !== 'disabled' && rawToken.trim().toLowerCase() !== 'disabled'
    ? rawUrl.replace(/\/+$/, '')
    : null;
const REDIS_TOKEN = REDIS_URL ? rawToken! : null;

const LIST_KEY = 'hayaati:voiceerrors:list';
const TOTAL_KEY = 'hayaati:voiceerrors:total';
const MAX_KEPT = 300;

const LOCAL_FILE = path.join(process.cwd(), '.data', 'voice-errors.jsonl');
const isProd = process.env.NODE_ENV === 'production';

async function pipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(data) || data.some((d) => d && d.error)) return null;
    return data.map((d) => d.result);
  } catch {
    return null;
  }
}

export async function saveVoiceError(r: VoiceErrorReport): Promise<boolean> {
  if (REDIS_URL) {
    const res = await pipeline([
      ['LPUSH', LIST_KEY, JSON.stringify(r)],
      ['LTRIM', LIST_KEY, 0, MAX_KEPT - 1],
      ['INCR', TOTAL_KEY],
    ]);
    return Boolean(res);
  }
  if (!isProd) {
    try {
      fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
      fs.appendFileSync(LOCAL_FILE, JSON.stringify(r) + '\n');
      return true;
    } catch {}
  }
  return false;
}

export interface VoiceErrorSummary {
  total: number;
  latest: VoiceErrorReport[];
}

function parse(s: unknown): VoiceErrorReport | null {
  try {
    return typeof s === 'string' ? (JSON.parse(s) as VoiceErrorReport) : null;
  } catch {
    return null;
  }
}

export async function readVoiceErrors(limit = 100): Promise<VoiceErrorSummary> {
  if (REDIS_URL) {
    const res = await pipeline([['LRANGE', LIST_KEY, 0, limit - 1], ['GET', TOTAL_KEY]]);
    if (res) {
      const rows = Array.isArray(res[0]) ? (res[0] as unknown[]) : [];
      return { total: Number(res[1]) || 0, latest: rows.map(parse).filter((x): x is VoiceErrorReport => Boolean(x)) };
    }
    return { total: 0, latest: [] };
  }
  try {
    const all = fs
      .readFileSync(LOCAL_FILE, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => parse(l))
      .filter((x): x is VoiceErrorReport => Boolean(x));
    return { total: all.length, latest: all.reverse().slice(0, limit) };
  } catch {
    return { total: 0, latest: [] };
  }
}

export async function clearVoiceErrors(): Promise<boolean> {
  if (REDIS_URL) return Boolean(await pipeline([['DEL', LIST_KEY], ['DEL', TOTAL_KEY]]));
  if (!isProd) {
    try {
      fs.rmSync(LOCAL_FILE, { force: true });
      return true;
    } catch {}
  }
  return false;
}
