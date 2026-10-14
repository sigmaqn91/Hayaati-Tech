/**
 * Visitor analytics storage (server only). Same Upstash Redis as the ratings (UPSTASH_REDIS_REST_URL / _TOKEN or
 * KV_REST_API_URL / _TOKEN). Local development without Redis: .data/visits.jsonl.
 *
 * Kept per visit (newest 20,000): anonymous visitor id, device / browser / OS, screen, language, approximate
 * country + city (from Vercel), sections seen, time on site. The IP address is never stored, only a salted hash.
 * Running totals (devices, brands, browsers, OS, countries, outdated ...) are kept forever.
 */

import fs from 'fs';
import path from 'path';

export interface StoredVisit {
  id: string;
  vid: string;
  startedAt: string;
  updatedAt: string;
  returning: boolean;
  owner?: boolean;
  type: string;
  desktopMode: boolean;
  brand: string;
  model: string;
  modelGuess?: string;
  arch?: string;
  gpu?: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  engine: string;
  engineVersion: string;
  inApp: string;
  browserOld: boolean;
  osOld: boolean;
  browserLimited: boolean;
  screen: string;
  viewport: string;
  dpr: number;
  touch: boolean;
  language: string;
  siteLanguage: string;
  timezone: string;
  memoryGb?: number;
  cpuCores?: number;
  network?: string;
  country?: string;
  region?: string;
  city?: string;
  /** Approximate position from the visitor's IP address (Vercel), city level */
  ipLat?: number;
  ipLon?: number;
  ipTimezone?: string;
  postal?: string;
  /** Exact position, only when the visitor allowed it in the browser */
  geo?: { lat: number; lon: number; accuracy: number; at: string };
  ipHash?: string;
  referrer?: string;
  page: string;
  sections: string[];
  seconds: number;
  ua: string;
}

const rawUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const REDIS_URL =
  rawUrl && rawToken && rawUrl.trim().toLowerCase() !== 'disabled' && rawToken.trim().toLowerCase() !== 'disabled'
    ? rawUrl.replace(/\/+$/, '')
    : null;
const REDIS_TOKEN = REDIS_URL ? rawToken! : null;

const DATA_KEY = 'hayaati:visits:data'; // hash visitId -> JSON
const INDEX_KEY = 'hayaati:visits:index'; // sorted set visitId by start time
const STATS_KEY = 'hayaati:visits:stats'; // hash of running totals
const UNIQUE_KEY = 'hayaati:visits:unique'; // HyperLogLog of visitor ids
const MAX_KEPT = 20000;

const LOCAL_FILE = path.join(process.cwd(), '.data', 'visits.jsonl');
const isProd = process.env.NODE_ENV === 'production';

export function visitStorageStatus() {
  return { redis: Boolean(REDIS_URL), local: !isProd && !REDIS_URL };
}

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

const field = (v: string) => (v || 'Unknown').replace(/[:\n]/g, ' ').slice(0, 60);

/** Totals counted once per visit, when it starts. */
function statFields(v: StoredVisit): string[] {
  const day = v.startedAt.slice(0, 10);
  const f = [
    'total',
    `day:${day}`,
    `type:${field(v.type)}`,
    `brand:${field(v.brand)}`,
    `os:${field(v.os)}`,
    `browser:${field(v.browser)}`,
    `country:${field(v.country || '')}`,
    `lang:${field(v.siteLanguage || v.language)}`,
  ];
  if (v.desktopMode) f.push('desktopMode');
  if (v.browserOld) f.push('browserOld');
  if (v.osOld) f.push('osOld');
  if (v.browserOld || v.osOld) f.push('outdated');
  if (v.browserLimited) f.push('browserLimited');
  if (v.inApp) f.push(`inApp:${field(v.inApp)}`);
  if (v.returning) f.push('returning');
  return f;
}

/** First message of a visit: stores it and counts it in the totals. */
export async function startVisit(v: StoredVisit): Promise<boolean> {
  if (REDIS_URL) {
    const ts = Date.parse(v.startedAt) || Date.now();
    const cmds: (string | number)[][] = [
      ['HSET', DATA_KEY, v.id, JSON.stringify(v)],
      ['ZADD', INDEX_KEY, ts, v.id],
    ];
    // The owner's own visits are listed (marked "You") but not counted in the totals.
    if (!v.owner) {
      cmds.push(['PFADD', UNIQUE_KEY, v.vid]);
      for (const f of statFields(v)) cmds.push(['HINCRBY', STATS_KEY, f, 1]);
    }
    const res = await pipeline(cmds);
    if (res) {
      // Keep the newest MAX_KEPT visits in full (totals stay). Checked on about 1 visit in 20.
      if (Math.random() > 0.05) return true;
      const count = await pipeline([['ZCARD', INDEX_KEY]]);
      const n = count ? Number(count[0]) || 0 : 0;
      if (n > MAX_KEPT + 200) {
        const old = await pipeline([['ZRANGE', INDEX_KEY, 0, n - MAX_KEPT - 1]]);
        const ids = old && Array.isArray(old[0]) ? (old[0] as string[]) : [];
        if (ids.length) await pipeline([['HDEL', DATA_KEY, ...ids], ['ZREM', INDEX_KEY, ...ids]]);
      }
      return true;
    }
    return false;
  }
  if (!isProd) {
    try {
      fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
      fs.appendFileSync(LOCAL_FILE, JSON.stringify(v) + '\n');
      return true;
    } catch {}
  }
  return false;
}

/** Later messages of the same visit: sections seen and time on site. */
export async function updateVisit(id: string, vid: string, sections: string[], seconds: number): Promise<boolean> {
  const merge = (v: StoredVisit): StoredVisit => ({
    ...v,
    sections: Array.from(new Set([...(v.sections || []), ...sections])).slice(0, 40),
    seconds: Math.max(v.seconds || 0, seconds),
    updatedAt: new Date().toISOString(),
  });
  if (REDIS_URL) {
    const got = await pipeline([['HGET', DATA_KEY, id]]);
    if (!got || typeof got[0] !== 'string') return false;
    let v: StoredVisit;
    try {
      v = JSON.parse(got[0]) as StoredVisit;
    } catch {
      return false;
    }
    if (v.vid !== vid) return false;
    return (await pipeline([['HSET', DATA_KEY, id, JSON.stringify(merge(v))]])) !== null;
  }
  if (!isProd) {
    try {
      const lines = fs.readFileSync(LOCAL_FILE, 'utf8').split('\n').filter(Boolean);
      const out = lines.map((l) => {
        const v = JSON.parse(l) as StoredVisit;
        return v.id === id && v.vid === vid ? JSON.stringify(merge(v)) : l;
      });
      fs.writeFileSync(LOCAL_FILE, out.join('\n') + '\n');
      return true;
    } catch {}
  }
  return false;
}

/** Exact position of a visit (sent only after the visitor allowed location in the browser). */
export async function updateGeo(id: string, vid: string, geo: NonNullable<StoredVisit['geo']>): Promise<boolean> {
  const merge = (v: StoredVisit): StoredVisit => ({ ...v, geo, updatedAt: new Date().toISOString() });
  if (REDIS_URL) {
    const got = await pipeline([['HGET', DATA_KEY, id]]);
    if (!got || typeof got[0] !== 'string') return false;
    let v: StoredVisit;
    try {
      v = JSON.parse(got[0]) as StoredVisit;
    } catch {
      return false;
    }
    if (v.vid !== vid) return false;
    return (await pipeline([['HSET', DATA_KEY, id, JSON.stringify(merge(v))]])) !== null;
  }
  if (!isProd) {
    try {
      const lines = fs.readFileSync(LOCAL_FILE, 'utf8').split('\n').filter(Boolean);
      const out = lines.map((l) => {
        const v = JSON.parse(l) as StoredVisit;
        return v.id === id && v.vid === vid ? JSON.stringify(merge(v)) : l;
      });
      fs.writeFileSync(LOCAL_FILE, out.join('\n') + '\n');
      return true;
    } catch {}
  }
  return false;
}

function toNumMap(flat: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (Array.isArray(flat)) {
    for (let i = 0; i + 1 < flat.length; i += 2) out[String(flat[i])] = Number(flat[i + 1]) || 0;
  } else if (flat && typeof flat === 'object') {
    for (const [k, v] of Object.entries(flat as Record<string, unknown>)) out[k] = Number(v) || 0;
  }
  return out;
}

export interface VisitReport {
  storage: ReturnType<typeof visitStorageStatus>;
  stats: Record<string, number>;
  unique: number;
  latest: StoredVisit[];
}

/** Owner view: totals and the newest visits (with the owner's own visits marked). */
export async function readVisits(limit = 300): Promise<VisitReport> {
  const storage = visitStorageStatus();
  if (REDIS_URL) {
    const res = await pipeline([
      ['HGETALL', STATS_KEY],
      ['PFCOUNT', UNIQUE_KEY],
      ['ZREVRANGE', INDEX_KEY, 0, limit - 1],
    ]);
    if (res) {
      const ids = Array.isArray(res[2]) ? (res[2] as string[]) : [];
      let latest: StoredVisit[] = [];
      if (ids.length) {
        const got = await pipeline([['HMGET', DATA_KEY, ...ids]]);
        const rows = got && Array.isArray(got[0]) ? (got[0] as (string | null)[]) : [];
        latest = rows
          .map((s) => {
            try {
              return s ? (JSON.parse(s) as StoredVisit) : null;
            } catch {
              return null;
            }
          })
          .filter((x): x is StoredVisit => Boolean(x));
      }
      return { storage, stats: toNumMap(res[0]), unique: Number(res[1]) || 0, latest };
    }
  }

  // Local development file
  let all: StoredVisit[] = [];
  try {
    all = fs
      .readFileSync(LOCAL_FILE, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as StoredVisit);
  } catch {}
  const stats: Record<string, number> = {};
  for (const v of all) if (!v.owner) for (const f of statFields(v)) stats[f] = (stats[f] || 0) + 1;
  return { storage, stats, unique: new Set(all.filter((v) => !v.owner).map((v) => v.vid)).size, latest: all.reverse().slice(0, limit) };
}
