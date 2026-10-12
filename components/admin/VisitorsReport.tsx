'use client';

/** Owner visitors report (Admin Control > Visitors): totals, breakdowns and every recent visit. */

import React, { useMemo, useState } from 'react';
import { Smartphone, Tablet, Monitor, Watch, Tv, Gamepad2, Bot, HelpCircle, AlertTriangle, Search, Repeat, Crown } from 'lucide-react';

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

export function VisitorsReport({ report }: { report: VisitorsReportData }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const s = report.stats;
  const total = s.total || 0;
  const today = s[`day:${new Date().toISOString().slice(0, 10)}`] || 0;
  const outdated = s.outdated || 0;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return report.latest.filter((v) => {
      if (filter === 'outdated' && !(v.browserOld || v.osOld || v.browserLimited)) return false;
      if (filter === 'owner' && !v.owner) return false;
      if (['phone', 'tablet', 'computer', 'watch'].includes(filter) && v.type !== filter) return false;
      if (!q) return true;
      return [v.brand, v.model, v.os, v.osVersion, v.browser, v.browserVersion, countryName(v.country), v.city, v.language, v.inApp]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [report.latest, filter, query]);

  const FILTERS: [Filter, string][] = [
    ['all', 'All'],
    ['phone', 'Phones'],
    ['tablet', 'Tablets'],
    ['computer', 'Computers'],
    ['watch', 'Watches'],
    ['outdated', 'Outdated'],
    ['owner', 'My visits'],
  ];

  return (
    <>
      <p className="text-xs font-mono text-slate-500">
        Storage: {report.storage.redis ? 'Upstash Redis ✓' : report.storage.local ? 'local file (development)' : 'Redis not connected'} · Anonymous: no names, no IP addresses, no device IDs.
      </p>

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
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rt-tag !min-h-[32px] ${filter === f ? "is-on" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {rows.length === 0 && <li className="text-sm text-slate-500">No visits here yet.</li>}
          {rows.map((v) => {
            const Icon = TYPE_ICON[v.type] || HelpCircle;
            const deviceName = [v.brand, v.model && v.model !== v.brand ? v.model : ''].filter(Boolean).join(' ') || TYPE_LABEL[v.type] || 'Unknown device';
            const engineNote = v.engine === 'Chromium' && v.browser !== 'Chrome' && v.engineVersion ? ` · Chromium ${v.engineVersion.split('.')[0]}` : '';
            return (
              <li key={v.id} className="rt-area p-3 text-[13px]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1.5 text-slate-100 font-medium">
                    <Icon className="w-4 h-4 text-[#38e8ff]" aria-hidden="true" />
                    {deviceName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{TYPE_LABEL[v.type] || v.type}</span>
                  {v.desktopMode && <span className="adm-badge">Desktop mode</span>}
                  {v.owner && (
                    <span className="adm-badge adm-badge--gold">
                      <Crown className="w-3 h-3" aria-hidden="true" /> You
                    </span>
                  )}
                  {v.returning && (
                    <span className="adm-badge">
                      <Repeat className="w-3 h-3" aria-hidden="true" /> Returning
                    </span>
                  )}
                  <span className="ms-auto font-mono text-[11px] text-slate-500">{new Date(v.startedAt).toLocaleString()}</span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300">
                  <span>
                    {v.os || 'Unknown OS'} {v.osVersion}
                    {v.osOld && <span className="adm-badge adm-badge--warn ms-1.5"><AlertTriangle className="w-3 h-3" aria-hidden="true" /> Old OS</span>}
                  </span>
                  <span>
                    {v.browser || 'Unknown browser'} {shortVer(v.browserVersion)}
                    <span className="text-slate-500">{engineNote}</span>
                    {v.browserOld && <span className="adm-badge adm-badge--warn ms-1.5"><AlertTriangle className="w-3 h-3" aria-hidden="true" /> Old browser</span>}
                    {v.browserLimited && <span className="adm-badge adm-badge--warn ms-1.5">Lite browser</span>}
                  </span>
                  {v.inApp && <span className="text-slate-400">inside {v.inApp}</span>}
                </div>

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-slate-400">
                  {v.country && (
                    <span>
                      {flag(v.country)} {[v.city, countryName(v.country)].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <span>Screen {v.screen}{v.dpr ? ` @${v.dpr}x` : ''}</span>
                  {v.memoryGb ? <span>{v.memoryGb} GB RAM</span> : null}
                  {v.cpuCores ? <span>{v.cpuCores} cores</span> : null}
                  {v.network && <span>{v.network.toUpperCase()}</span>}
                  <span>{v.language}{v.siteLanguage ? ` → site ${v.siteLanguage}` : ''}</span>
                  <span>Time {duration(v.seconds)}</span>
                  {v.referrer && <span>from {v.referrer}</span>}
                </div>

                {v.sections.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {v.sections.map((sec) => (
                      <span key={sec} className="adm-badge adm-badge--soft">
                        {SECTION_LABEL[sec] || sec}
                      </span>
                    ))}
                  </div>
                )}

                <details className="mt-1.5">
                  <summary className="cursor-pointer text-[11px] font-mono text-slate-500 hover:text-slate-300">Technical details</summary>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
                    {v.ua}
                    <br />
                    Viewport {v.viewport} · Touch {v.touch ? 'yes' : 'no'} · Timezone {v.timezone || '-'} · Engine {v.engine} {v.engineVersion} · Visitor #{v.vid.slice(0, 8)}
                  </p>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
