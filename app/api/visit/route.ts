import { NextRequest, NextResponse } from 'next/server';
import { checkVisitRateLimit } from '@/lib/rateLimit';
import { startVisit, updateVisit, updateGeo, type StoredVisit } from '@/lib/visitorStore';
import { checkFreshness, detectFromUa } from '@/lib/visitorDetect';
import { verifyOwnerSession } from '@/lib/jarvisAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ID_RE = /^[a-z0-9-]{8,64}$/i;
const SECTION_RE = /^[a-z0-9-]{1,32}$/i;

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) : '';
const num = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : undefined;
};
const bool = (v: unknown) => v === true;
const headerText = (req: NextRequest, name: string) => {
  const raw = req.headers.get(name) || '';
  try {
    return clean(decodeURIComponent(raw), 60);
  } catch {
    return clean(raw, 60);
  }
};

const headerNum = (req: NextRequest, name: string) => {
  const n = Number(req.headers.get(name));
  return req.headers.get(name) && Number.isFinite(n) ? n : undefined;
};

const ok = () => new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

/** Anonymous visit message from the page (sent with sendBeacon after the page is idle, and when it is hidden). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return ok();
  }

  const id = clean(body.id, 64);
  const vid = clean(body.vid, 64);
  if (!ID_RE.test(id) || !ID_RE.test(vid)) return ok();

  const rate = await checkVisitRateLimit(req);
  if (!rate.allowed) return ok();

  const sections = Array.isArray(body.sections)
    ? body.sections.filter((s): s is string => typeof s === 'string' && SECTION_RE.test(s)).slice(0, 40)
    : [];
  const seconds = Math.round(num(body.seconds, 24 * 3600) || 0);

  if (body.kind === 'geo') {
    // Exact location: only sent by the browser after the visitor's own permission (already given, or allowed in the browser's box).
    const lat = Number(body.lat);
    const lon = Number(body.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      await updateGeo(id, vid, {
        lat: Math.round(lat * 10000) / 10000,
        lon: Math.round(lon * 10000) / 10000,
        accuracy: Math.round(num(body.accuracy, 100000) || 0),
        at: new Date().toISOString(),
      });
    }
    return ok();
  }

  if (body.kind === 'update') {
    await updateVisit(id, vid, sections, seconds);
    return ok();
  }

  const d = (body.device && typeof body.device === 'object' ? body.device : {}) as Record<string, unknown>;
  // The server's own User-Agent is the trusted one; the page adds what only the browser knows (model, screen ...).
  const ua = clean(req.headers.get('user-agent'), 400);
  const server = detectFromUa(ua);
  const pickStr = (k: string, max = 60) => clean(d[k], max) || (server as Record<string, unknown>)[k] as string || '';

  const device = {
    type: pickStr('type', 12) || 'unknown',
    desktopMode: bool(d.desktopMode),
    brand: pickStr('brand'),
    model: pickStr('model'),
    modelGuess: clean(d.modelGuess, 80),
    arch: clean(d.arch, 24),
    gpu: clean(d.gpu, 80),
    os: pickStr('os', 30),
    osVersion: pickStr('osVersion', 20),
    browser: pickStr('browser', 30),
    browserVersion: pickStr('browserVersion', 24),
    engine: pickStr('engine', 12),
    engineVersion: pickStr('engineVersion', 24),
    inApp: pickStr('inApp', 30),
  };
  // Search engines, link previews and test robots are not visitors: not stored.
  if (server.type === 'bot' || device.type === 'bot') return ok();
  const fresh = checkFreshness(device);

  const now = new Date().toISOString();
  const visit: StoredVisit = {
    id,
    vid,
    startedAt: now,
    updatedAt: now,
    returning: bool(body.returning),
    owner: verifyOwnerSession(req) || bool(body.owner) || undefined,
    ...device,
    browserOld: fresh.browserOld,
    osOld: fresh.osOld,
    browserLimited: fresh.browserLimited,
    screen: clean(d.screen, 20),
    viewport: clean(d.viewport, 20),
    dpr: num(d.dpr, 10) || 1,
    touch: bool(d.touch),
    language: clean(d.language, 20),
    siteLanguage: clean(body.siteLanguage, 8),
    timezone: clean(d.timezone, 50),
    memoryGb: num(d.memoryGb, 64),
    cpuCores: num(d.cpuCores, 256),
    network: clean(d.network, 10) || undefined,
    country: clean(req.headers.get('x-vercel-ip-country'), 4) || undefined,
    region: headerText(req, 'x-vercel-ip-country-region') || undefined,
    city: headerText(req, 'x-vercel-ip-city') || undefined,
    ipLat: headerNum(req, 'x-vercel-ip-latitude'),
    ipLon: headerNum(req, 'x-vercel-ip-longitude'),
    ipTimezone: headerText(req, 'x-vercel-ip-timezone') || undefined,
    postal: headerText(req, 'x-vercel-ip-postal-code') || undefined,
    ipHash: rate.identity.ipHash || undefined,
    referrer: clean(body.referrer, 120) || undefined,
    page: clean(body.page, 80) || '/',
    sections,
    seconds,
    ua,
  };

  await startVisit(visit);
  return ok();
}
