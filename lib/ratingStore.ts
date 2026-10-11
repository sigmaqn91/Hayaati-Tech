/**
 * Website rating storage (server only).
 *
 * Main store: Upstash Redis (Vercel Marketplace "Upstash for Redis"; the same UPSTASH_REDIS_REST_URL / _TOKEN
 * or KV_REST_API_URL / _TOKEN variables the chat rate limiter already reads). Every rating is kept in full
 * (newest 10,000) plus running totals for stars and for each section / card.
 * Copy by email: when SMTP_* is set (same settings as the contact form), each rating is also mailed to the owner.
 * Local development without Redis: ratings go to .data/ratings.jsonl.
 */

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { RATING_ISSUES, STAR_LABELS } from '@/lib/ratingCatalog';

export interface StoredRating {
  id: string;
  createdAt: string;
  stars: number;
  verdicts: Record<string, 'good' | 'bad'>;
  issues: string[];
  message: string;
  name?: string;
  email?: string;
  lang?: string;
  viewport?: string;
  country?: string;
}

const rawUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const REDIS_URL =
  rawUrl && rawToken && rawUrl.trim().toLowerCase() !== 'disabled' && rawToken.trim().toLowerCase() !== 'disabled'
    ? rawUrl.replace(/\/+$/, '')
    : null;
const REDIS_TOKEN = REDIS_URL ? rawToken! : null;

const LIST_KEY = 'hayaati:ratings';
const STATS_KEY = 'hayaati:ratings:stats';
const VERDICT_KEY = 'hayaati:ratings:verdicts';
const ISSUE_KEY = 'hayaati:ratings:issues';
const MAX_KEPT = 10000;

const LOCAL_FILE = path.join(process.cwd(), '.data', 'ratings.jsonl');
const isProd = process.env.NODE_ENV === 'production';

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function ratingStorageStatus() {
  return { redis: Boolean(REDIS_URL), email: smtpConfigured(), local: !isProd && !REDIS_URL };
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

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function sendEmailCopy(r: StoredRating): Promise<boolean> {
  if (!smtpConfigured()) return false;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const good = Object.entries(r.verdicts).filter(([, v]) => v === 'good').map(([k]) => k);
    const bad = Object.entries(r.verdicts).filter(([, v]) => v === 'bad').map(([k]) => k);
    const issues = r.issues.map((i) => RATING_ISSUES.find((x) => x.id === i)?.label || i);
    const stars = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
    const html = `
      <div style="font-family:system-ui,sans-serif;font-size:14px;color:#0f172a">
        <h2 style="margin:0 0 8px">New website rating: ${stars} (${r.stars}/5 · ${STAR_LABELS[r.stars - 1]})</h2>
        <p><b>Good:</b> ${good.length ? escapeHtml(good.join(', ')) : '-'}</p>
        <p><b>Needs work:</b> ${bad.length ? escapeHtml(bad.join(', ')) : '-'}</p>
        <p><b>What is lacking:</b> ${issues.length ? escapeHtml(issues.join(', ')) : '-'}</p>
        <p><b>Message:</b><br>${r.message ? escapeHtml(r.message).replace(/\n/g, '<br>') : '-'}</p>
        <p style="color:#64748b">${escapeHtml([r.name, r.email, r.lang, r.viewport, r.country, r.createdAt].filter(Boolean).join(' · '))}</p>
      </div>`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.RATING_NOTIFY_EMAIL || process.env.SMTP_TO || 'Hayaati.Technology@gmail.com',
      replyTo: r.email || undefined,
      subject: `Website rating ${r.stars}/5 ${stars}`,
      html,
    });
    return true;
  } catch (e) {
    console.error('[Rating] email copy failed', e instanceof Error ? e.message : e);
    return false;
  }
}

/** Saves one rating. Returns true when it is stored somewhere permanent (Redis, email or local file). */
export async function saveRating(r: StoredRating): Promise<boolean> {
  let stored = false;

  if (REDIS_URL) {
    const cmds: (string | number)[][] = [
      ['LPUSH', LIST_KEY, JSON.stringify(r)],
      ['LTRIM', LIST_KEY, 0, MAX_KEPT - 1],
      ['HINCRBY', STATS_KEY, 'count', 1],
      ['HINCRBY', STATS_KEY, 'starsSum', r.stars],
      ['HINCRBY', STATS_KEY, `star${r.stars}`, 1],
    ];
    for (const [id, v] of Object.entries(r.verdicts)) cmds.push(['HINCRBY', VERDICT_KEY, `${id}:${v}`, 1]);
    for (const i of r.issues) cmds.push(['HINCRBY', ISSUE_KEY, i, 1]);
    stored = (await pipeline(cmds)) !== null;
  }

  const mailed = await sendEmailCopy(r);
  stored = stored || mailed;

  if (!stored && !isProd) {
    try {
      fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
      fs.appendFileSync(LOCAL_FILE, JSON.stringify(r) + '\n');
      stored = true;
    } catch {}
  }
  return stored;
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

export interface RatingReport {
  storage: ReturnType<typeof ratingStorageStatus>;
  stats: Record<string, number>;
  verdicts: Record<string, number>;
  issues: Record<string, number>;
  latest: StoredRating[];
}

/** Owner view: totals and the newest ratings. */
export async function readRatings(limit = 300): Promise<RatingReport> {
  const storage = ratingStorageStatus();
  if (REDIS_URL) {
    const res = await pipeline([
      ['HGETALL', STATS_KEY],
      ['HGETALL', VERDICT_KEY],
      ['HGETALL', ISSUE_KEY],
      ['LRANGE', LIST_KEY, 0, limit - 1],
    ]);
    if (res) {
      const latest = (Array.isArray(res[3]) ? res[3] : [])
        .map((s) => {
          try {
            return JSON.parse(String(s)) as StoredRating;
          } catch {
            return null;
          }
        })
        .filter((x): x is StoredRating => Boolean(x));
      return { storage, stats: toNumMap(res[0]), verdicts: toNumMap(res[1]), issues: toNumMap(res[2]), latest };
    }
  }

  // Local development file
  const stats: Record<string, number> = {};
  const verdicts: Record<string, number> = {};
  const issues: Record<string, number> = {};
  let all: StoredRating[] = [];
  try {
    all = fs
      .readFileSync(LOCAL_FILE, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l) as StoredRating);
  } catch {}
  for (const r of all) {
    stats.count = (stats.count || 0) + 1;
    stats.starsSum = (stats.starsSum || 0) + r.stars;
    stats[`star${r.stars}`] = (stats[`star${r.stars}`] || 0) + 1;
    for (const [id, v] of Object.entries(r.verdicts)) verdicts[`${id}:${v}`] = (verdicts[`${id}:${v}`] || 0) + 1;
    for (const i of r.issues) issues[i] = (issues[i] || 0) + 1;
  }
  return { storage, stats, verdicts, issues, latest: all.reverse().slice(0, limit) };
}
