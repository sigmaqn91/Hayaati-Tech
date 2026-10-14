'use client';

/** Owner visitors report (Admin Control > Visitors): totals, breakdowns and every recent visit. */

import React, { useMemo, useState } from 'react';
import { MapPin, ShieldAlert, Globe2, LayoutGrid, Smartphone, Tablet, Monitor, Watch, Tv, Gamepad2, Bot, HelpCircle, AlertTriangle, Search, Repeat, Crown } from 'lucide-react';

export interface VisitRow {
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
  ipLat?: number;
  ipLon?: number;
  ipTimezone?: string;
  postal?: string;
  geo?: { lat: number; lon: number; accuracy: number; at: string };
  ipHash?: string;
  referrer?: string;
  page: string;
  sections: string[];
  seconds: number;
  ua: string;
}
export interface VisitorsReportData {
  storage: { redis: boolean; local: boolean };
  stats: Record<string, number>;
  unique: number;
  latest: VisitRow[];
}

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Smartphone,
  tablet: Tablet,
  computer: Monitor,
  watch: Watch,
  tv: Tv,
  console: Gamepad2,
  bot: Bot,
};
const TYPE_LABEL: Record<string, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  computer: 'Computer',
  watch: 'Smart watch',
  tv: 'Smart TV',
  console: 'Game console',
  bot: 'Bot / crawler',
  unknown: 'Unknown',
};

const SECTION_LABEL: Record<string, string> = {
  hero: 'Home',
  timeline: 'Eras',
  tech: 'Catalogue',
  places: 'Places',
  projects: 'Projects',
  advertise: 'Advertise',
  about: 'About',
  contact: 'Contact',
};

function flag(cc?: string) {
  if (!cc || !/^[A-Z]{2}$/i.test(cc)) return '';
  return String.fromCodePoint(...cc.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
}

let regionNames: Intl.DisplayNames | null = null;
function countryName(cc?: string) {
  if (!cc) return '';
  try {
    regionNames = regionNames || new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(cc.toUpperCase()) || cc;
  } catch {
    return cc;
  }
}

function duration(s: number) {
  if (!s) return '-';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const shortVer = (v: string) => (v ? v.split('.').slice(0, 2).join('.') : '');

/** Bars of one breakdown (e.g. "brand:Samsung" fields from the totals). */
function Breakdown({ title, stats, prefix, total, nameOf }: { title: string; stats: Record<string, number>; prefix: string; total: number; nameOf?: (k: string) => string }) {
  const rows = Object.entries(stats)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, n]) => [k.slice(prefix.length), n] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return (
    <div className="rt-card">
      <p className="rt-label">{title}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {rows.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
        {rows.map(([k, n]) => (
          <div key={k} className="flex items-center gap-2 text-xs font-mono">
            <span className="w-28 shrink-0 truncate text-slate-300" title={nameOf ? nameOf(k) : k}>
              {nameOf ? nameOf(k) : k}
            </span>
            <span className="flex-1 h-2 rounded bg-[#0e1522] overflow-hidden">
              <span className="block h-full bg-gradient-to-r from-[#38e8ff] to-[#818cf8]" style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
            </span>
            <span className="w-14 text-end text-slate-400">
              {n} <span className="text-slate-600">{total ? Math.round((n / total) * 100) : 0}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Filter = 'all' | 'phone' | 'tablet' | 'computer' | 'watch' | 'outdated' | 'owner';
type Tab = 'overview' | 'device' | 'browser' | 'location' | 'security';

const TABS: [Tab, string, React.ComponentType<{ className?: string }>][] = [
  ['overview', 'Overview', LayoutGrid],
  ['device', 'Device', Smartphone],
  ['browser', 'Browser & OS', Globe2],
  ['location', 'Location', MapPin],
  ['security', 'Security', ShieldAlert],
];

const deviceName = (v: VisitRow) =>
  [v.brand, v.model && v.model !== v.brand ? v.model : ''].filter(Boolean).join(' ') || TYPE_LABEL[v.type] || 'Unknown device';

const mapsLink = (lat: number, lon: number) => `https://www.google.com/maps?q=${lat},${lon}`;

/** UTC offset (minutes) of a time zone right now; used to compare zones that have different names but the same time. */
function tzOffset(tz: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date());
    const name = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const m = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!m) return name === 'GMT' ? 0 : null;
    return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
  } catch {
    return null;
  }
}

interface Flag {
  label: string;
  warn: boolean;
}

function securityFlags(v: VisitRow, ipCount: Record<string, number>): Flag[] {
  const out: Flag[] = [];
  if (v.timezone && v.ipTimezone) {
    const a = tzOffset(v.timezone);
    const b = tzOffset(v.ipTimezone);
    if (a !== null && b !== null && a !== b) out.push({ label: `Device time zone (${v.timezone}) differs from IP location (${v.ipTimezone}): possible VPN / proxy`, warn: true });
  }
  if (v.ipHash && (ipCount[v.ipHash] || 0) >= 8) out.push({ label: `Same network visited ${ipCount[v.ipHash]} times`, warn: false });
  if (v.browserOld) out.push({ label: 'Old browser', warn: true });
  if (v.osOld) out.push({ label: 'Old OS', warn: true });
  if (v.browserLimited) out.push({ label: 'Lite browser', warn: true });
  if (v.desktopMode) out.push({ label: 'Phone using Desktop site mode', warn: false });
  if (v.inApp) out.push({ label: `Opened inside ${v.inApp}`, warn: false });
  return out;
}

function Row({ v, children }: { v: VisitRow; children: React.ReactNode }) {
  const Icon = TYPE_ICON[v.type] || HelpCircle;
  return (
    <li className="rt-area p-3 text-[13px]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5 text-slate-100 font-medium">
          <Icon className="w-4 h-4 text-[#38e8ff]" aria-hidden="true" />
          {deviceName(v)}
        </span>
        {v.owner && (
          <span className="adm-badge adm-badge--gold">
            <Crown className="w-3 h-3" aria-hidden="true" /> You
          </span>
        )}
        <span className="ms-auto font-mono text-[11px] text-slate-500">{new Date(v.startedAt).toLocaleString()}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-slate-300">{children}</div>
    </li>
  );
}

const Kv = ({ k, v }: { k: string; v?: React.ReactNode }) =>
  v ? (
    <span>
      <span className="text-slate-500">{k}: </span>
      {v}
    </span>
  ) : null;

export function VisitorsReport({ report }: { report: VisitorsReportData }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const s = report.stats;
  const total = s.total || 0;
  const today = s[`day:${new Date().toISOString().slice(0, 10)}`] || 0;
  const outdated = s.outdated || 0;

  const ipCount = useMemo(() => {
    const c: Record<string, number> = {};
    for (const v of report.latest) if (v.ipHash) c[v.ipHash] = (c[v.ipHash] || 0) + 1;
    return c;
  }, [report.latest]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return report.latest.filter((v) => {
      if (filter === 'outdated' && !(v.browserOld || v.osOld || v.browserLimited)) return false;
      if (filter === 'owner' && !v.owner) return false;
      if (['phone', 'tablet', 'computer', 'watch'].includes(filter) && v.type !== filter) return false;
      if (!q) return true;
      return [v.brand, v.model, v.modelGuess, v.os, v.osVersion, v.browser, v.browserVersion, countryName(v.country), v.city, v.region, v.language, v.inApp]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [report.latest, filter, query]);

  const flagged = useMemo(
    () => report.latest.map((v) => ({ v, flags: securityFlags(v, ipCount) })).filter((x) => x.flags.length > 0),
    [report.latest, ipCount]
  );
  const vpnSuspects = flagged.filter((x) => x.flags.some((f) => f.label.includes('VPN'))).length;
  const exactCount = report.latest.filter((v) => v.geo).length;

  const FILTERS: [Filter, string][] = [
    ['all', 'All'],
    ['phone', 'Phones'],
    ['tablet', 'Tablets'],
    ['computer', 'Computers'],
    ['watch', 'Watches'],
    ['outdated', 'Outdated'],
    ['owner', 'My visits'],
  ];

  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="rt-label me-auto">Latest visits ({rows.length})</p>
        <label className="relative">
          <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="rt-input !py-1.5 !ps-8 w-44"
            style={{ fontSize: '16px' }}
            aria-label="Search visits"
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {FILTERS.map(([f, label]) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className={`rt-tag !min-h-[32px] ${filter === f ? 'is-on' : ''}`}>
            {label}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <>
      <p className="text-xs font-mono text-slate-500">
        Storage: {report.storage.redis ? 'Upstash Redis ✓' : report.storage.local ? 'local file (development)' : 'Redis not connected'} · For visitor safety only: no names, no IP addresses stored (only a salted hash).
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Visitor sections">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`adm-tab ${tab === t ? 'is-on' : ''}`}>
            <Icon className="w-3.5 h-3.5 inline me-1.5 -mt-0.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rt-card">
              <p className="rt-label">Visits</p>
              <p className="mt-2 text-3xl font-semibold">{total}</p>
            </div>
            <div className="rt-card">
              <p className="rt-label">Unique visitors</p>
              <p className="mt-2 text-3xl font-semibold">{report.unique}</p>
              <p className="text-[11px] text-slate-500 font-mono">{s.returning || 0} returning visits</p>
            </div>
            <div className="rt-card">
              <p className="rt-label">Today</p>
              <p className="mt-2 text-3xl font-semibold">{today}</p>
            </div>
            <div className="rt-card">
              <p className="rt-label">Outdated browser / phone</p>
              <p className="mt-2 text-3xl font-semibold text-[#ffcf66]">
                {outdated} <span className="text-base text-slate-400">{total ? Math.round((outdated / total) * 100) : 0}%</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {s.desktopMode || 0} in desktop mode · {s.browserLimited || 0} lite browsers
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Breakdown title="Devices" stats={s} prefix="type:" total={total} nameOf={(k) => TYPE_LABEL[k] || k} />
            <Breakdown title="Brands" stats={s} prefix="brand:" total={total} />
            <Breakdown title="Browsers" stats={s} prefix="browser:" total={total} />
            <Breakdown title="Operating systems" stats={s} prefix="os:" total={total} />
            <Breakdown title="Countries" stats={s} prefix="country:" total={total} nameOf={(k) => `${flag(k)} ${countryName(k) || k}`.trim()} />
            <Breakdown title="Site language" stats={s} prefix="lang:" total={total} />
          </div>

          <div className="rt-card mt-3">
            {toolbar}
            <ul className="mt-3 flex flex-col gap-2">
              {rows.length === 0 && <li className="text-sm text-slate-500">No visits here yet.</li>}
              {rows.map((v) => (
                <Row key={v.id} v={v}>
                  <span>{[v.os || 'Unknown OS', v.osVersion].filter(Boolean).join(' ')}</span>
                  <span>{[v.browser || 'Unknown browser', shortVer(v.browserVersion)].filter(Boolean).join(' ')}</span>
                  {v.country && (
                    <span>
                      {flag(v.country)} {[v.city, countryName(v.country)].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span className="text-slate-400">Time {duration(v.seconds)}</span>
                  {v.sections.length > 0 && (
                    <span className="flex flex-wrap gap-1">
                      {v.sections.map((sec) => (
                        <span key={sec} className="adm-badge adm-badge--soft">
                          {SECTION_LABEL[sec] || sec}
                        </span>
                      ))}
                    </span>
                  )}
                </Row>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === 'device' && (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Breakdown title="Device type" stats={s} prefix="type:" total={total} nameOf={(k) => TYPE_LABEL[k] || k} />
            <Breakdown title="Brands" stats={s} prefix="brand:" total={total} />
          </div>
          <div className="rt-card mt-3">
            {toolbar}
            <ul className="mt-3 flex flex-col gap-2">
              {rows.length === 0 && <li className="text-sm text-slate-500">No visits here yet.</li>}
              {rows.map((v) => (
                <Row key={v.id} v={v}>
                  <Kv k="Type" v={TYPE_LABEL[v.type] || v.type} />
                  <Kv k="Brand" v={v.brand} />
                  <Kv k="Model" v={v.model} />
                  <Kv k="Best guess" v={v.modelGuess ? `${v.modelGuess} (browser hides exact model)` : ''} />
                  <Kv k="Screen" v={v.screen ? `${v.screen}${v.dpr ? ` @${v.dpr}x` : ''}` : ''} />
                  <Kv k="RAM" v={v.memoryGb ? `${v.memoryGb} GB (approx.)` : ''} />
                  <Kv k="CPU cores" v={v.cpuCores} />
                  <Kv k="CPU" v={v.arch} />
                  <Kv k="Graphics" v={v.gpu} />
                  <Kv k="Touch" v={v.touch ? 'yes' : 'no'} />
                  <Kv k="Network" v={v.network?.toUpperCase()} />
                  {v.desktopMode && <span className="adm-badge">Desktop site mode</span>}
                </Row>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === 'browser' && (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Breakdown title="Browsers" stats={s} prefix="browser:" total={total} />
            <Breakdown title="Operating systems" stats={s} prefix="os:" total={total} />
            <Breakdown title="Opened inside an app" stats={s} prefix="inApp:" total={total} />
          </div>
          <div className="rt-card mt-3">
            {toolbar}
            <ul className="mt-3 flex flex-col gap-2">
              {rows.length === 0 && <li className="text-sm text-slate-500">No visits here yet.</li>}
              {rows.map((v) => (
                <Row key={v.id} v={v}>
                  <Kv k="OS" v={[v.os || 'Unknown', v.osVersion].filter(Boolean).join(' ')} />
                  <Kv k="Browser" v={[v.browser || 'Unknown', v.browserVersion].filter(Boolean).join(' ')} />
                  <Kv k="Engine" v={[v.engine, v.engineVersion && v.engineVersion.split('.')[0]].filter(Boolean).join(' ')} />
                  <Kv k="In-app" v={v.inApp} />
                  {v.osOld && <span className="adm-badge adm-badge--warn"><AlertTriangle className="w-3 h-3" aria-hidden="true" /> Old OS</span>}
                  {v.browserOld && <span className="adm-badge adm-badge--warn"><AlertTriangle className="w-3 h-3" aria-hidden="true" /> Old browser</span>}
                  {v.browserLimited && <span className="adm-badge adm-badge--warn">Lite browser</span>}
                  <details className="basis-full">
                    <summary className="cursor-pointer text-[11px] font-mono text-slate-500 hover:text-slate-300">User-Agent</summary>
                    <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{v.ua}</p>
                  </details>
                </Row>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === 'location' && (
        <>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rt-card">
              <p className="rt-label">Exact location shared</p>
              <p className="mt-2 text-3xl font-semibold">{exactCount}</p>
              <p className="text-[11px] text-slate-500 font-mono">of {report.latest.length} recent visits, only with the visitor&apos;s browser permission</p>
            </div>
            <Breakdown title="Countries" stats={s} prefix="country:" total={total} nameOf={(k) => `${flag(k)} ${countryName(k) || k}`.trim()} />
          </div>
          <div className="rt-card mt-3">
            {toolbar}
            <ul className="mt-3 flex flex-col gap-2">
              {rows.length === 0 && <li className="text-sm text-slate-500">No visits here yet.</li>}
              {rows.map((v) => (
                <Row key={v.id} v={v}>
                  {v.geo ? (
                    <span>
                      <span className="adm-badge adm-badge--soft">Exact (permission)</span>{' '}
                      <a className="text-[#38e8ff] underline" href={mapsLink(v.geo.lat, v.geo.lon)} target="_blank" rel="noopener noreferrer">
                        {v.geo.lat}, {v.geo.lon}
                      </a>{' '}
                      <span className="text-slate-500">±{v.geo.accuracy} m</span>
                    </span>
                  ) : (
                    <span className="text-slate-500">Exact location: not shared</span>
                  )}
                  {v.country && (
                    <span>
                      <span className="adm-badge">By IP, approx.</span>{' '}
                      {flag(v.country)} {[v.city, v.region, countryName(v.country)].filter(Boolean).join(', ')}
                      {v.postal ? ` ${v.postal}` : ''}
                      {v.ipLat !== undefined && v.ipLon !== undefined && (
                        <>
                          {' '}
                          <a className="text-[#38e8ff] underline" href={mapsLink(v.ipLat, v.ipLon)} target="_blank" rel="noopener noreferrer">
                            map
                          </a>
                        </>
                      )}
                    </span>
                  )}
                  <Kv k="Device time zone" v={v.timezone} />
                  <Kv k="IP time zone" v={v.ipTimezone} />
                  <Kv k="Language" v={v.language} />
                </Row>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === 'security' && (
        <>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rt-card">
              <p className="rt-label">Flagged visits</p>
              <p className="mt-2 text-3xl font-semibold text-[#ffcf66]">{flagged.length}</p>
              <p className="text-[11px] text-slate-500 font-mono">of {report.latest.length} recent</p>
            </div>
            <div className="rt-card">
              <p className="rt-label">Possible VPN / proxy</p>
              <p className="mt-2 text-3xl font-semibold">{vpnSuspects}</p>
              <p className="text-[11px] text-slate-500 font-mono">time zone differs from IP</p>
            </div>
            <div className="rt-card">
              <p className="rt-label">Outdated</p>
              <p className="mt-2 text-3xl font-semibold">{outdated}</p>
              <p className="text-[11px] text-slate-500 font-mono">browser or phone software</p>
            </div>
            <div className="rt-card">
              <p className="rt-label">Lite browsers</p>
              <p className="mt-2 text-3xl font-semibold">{s.browserLimited || 0}</p>
            </div>
          </div>
          <div className="rt-card mt-3">
            <p className="rt-label">Flagged visits ({flagged.length})</p>
            <ul className="mt-3 flex flex-col gap-2">
              {flagged.length === 0 && <li className="text-sm text-slate-500">Nothing suspicious in recent visits.</li>}
              {flagged.map(({ v, flags }) => (
                <Row key={v.id} v={v}>
                  <span className="flex flex-col gap-1">
                    {flags.map((f) => (
                      <span key={f.label} className={f.warn ? 'text-[#ffcf66]' : 'text-slate-300'}>
                        {f.warn ? '⚠ ' : '• '}
                        {f.label}
                      </span>
                    ))}
                  </span>
                  <Kv k="OS" v={[v.os, v.osVersion].filter(Boolean).join(' ')} />
                  <Kv k="Browser" v={[v.browser, shortVer(v.browserVersion)].filter(Boolean).join(' ')} />
                  <Kv k="Place" v={[v.city, countryName(v.country)].filter(Boolean).join(', ')} />
                  <Kv k="Network" v={v.ipHash ? `#${v.ipHash.slice(0, 8)}` : ''} />
                </Row>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
