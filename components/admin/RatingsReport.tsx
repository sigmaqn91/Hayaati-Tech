'use client';

/** Owner ratings report (used by the Admin Control panel and the /ratings page). */

import React, { useMemo } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { buildRatingAreas, RATING_ISSUES, STAR_LABELS } from '@/lib/ratingCatalog';

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
export interface RatingsReportData {
  storage: { redis: boolean; email: boolean; local: boolean };
  stats: Record<string, number>;
  verdicts: Record<string, number>;
  issues: Record<string, number>;
  latest: StoredRating[];
}

export function RatingsReport({ report }: { report: RatingsReportData }) {
  const { t, content } = useLanguage();

  const labels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of buildRatingAreas(t, content)) {
      map[a.id] = a.label;
      for (const it of a.items) map[it.id] = `${it.label} (${a.label})`;
    }
    return map;
  }, [t, content]);

  const count = report.stats.count || 0;
  const avg = count ? (report.stats.starsSum || 0) / count : 0;

  const verdictRows = useMemo(() => {
    const rows: Record<string, { good: number; bad: number }> = {};
    for (const [k, n] of Object.entries(report.verdicts)) {
      const i = k.lastIndexOf(':');
      const id = k.slice(0, i);
      const v = k.slice(i + 1) as 'good' | 'bad';
      rows[id] = rows[id] || { good: 0, bad: 0 };
      rows[id][v] += n;
    }
    return Object.entries(rows).sort((a, b) => b[1].bad - a[1].bad || b[1].good - a[1].good);
  }, [report]);

  return (
    <>
      <p className="mt-2 text-xs font-mono text-slate-500">
        Storage: {report.storage.redis ? 'Upstash Redis ✓' : 'Redis not connected'} · Email copy: {report.storage.email ? 'on ✓' : 'off'}
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rt-card">
          <p className="rt-label">Ratings</p>
          <p className="mt-2 text-3xl font-semibold">{count}</p>
        </div>
        <div className="rt-card">
          <p className="rt-label">Average</p>
          <p className="mt-2 text-3xl font-semibold">
            {avg.toFixed(2)} <span className="text-base text-slate-400">/ 5</span>
          </p>
        </div>
        <div className="rt-card">
          <p className="rt-label">Stars</p>
          <div className="mt-2 flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = report.stats[`star${s}`] || 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-20 text-slate-400">{s}★ {STAR_LABELS[s - 1]}</span>
                  <span className="flex-1 h-2 rounded bg-[#0e1522] overflow-hidden">
                    <span className="block h-full bg-[#38e8ff]" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
                  </span>
                  <span className="w-8 text-end">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rt-card">
          <p className="rt-label">Sections & cards (most &quot;needs work&quot; first)</p>
          <ul className="mt-2 flex flex-col gap-1 max-h-[28rem] overflow-y-auto">
            {verdictRows.length === 0 && <li className="text-sm text-slate-500">Nothing marked yet.</li>}
            {verdictRows.map(([id, v]) => (
              <li key={id} className="flex items-center gap-2 text-[13px] py-1 border-b border-[#38e8ff]/10">
                <span className="flex-1 min-w-0 break-words">{labels[id] || id}</span>
                <span className="flex items-center gap-1 text-[#38e8ff]"><ThumbsUp className="w-3.5 h-3.5" />{v.good}</span>
                <span className="flex items-center gap-1 text-[#f472b6] w-12 justify-end"><ThumbsDown className="w-3.5 h-3.5" />{v.bad}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rt-card">
          <p className="rt-label">What is lacking</p>
          <ul className="mt-2 flex flex-col gap-1">
            {RATING_ISSUES.map((i) => (
              <li key={i.id} className="flex items-center gap-2 text-[13px] py-1 border-b border-[#38e8ff]/10">
                <span className="flex-1">{i.label}</span>
                <span className="font-mono">{report.issues[i.id] || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rt-card mt-3">
        <p className="rt-label">Latest ratings</p>
        <ul className="mt-2 flex flex-col gap-2">
          {report.latest.length === 0 && <li className="text-sm text-slate-500">No ratings yet.</li>}
          {report.latest.map((r) => {
            const bad = Object.entries(r.verdicts).filter(([, v]) => v === 'bad').map(([k]) => labels[k] || k);
            const good = Object.entries(r.verdicts).filter(([, v]) => v === 'good').map(([k]) => labels[k] || k);
            return (
              <li key={r.id} className="rt-area p-3 text-[13px]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[#38e8ff]">{'★'.repeat(r.stars)}<span className="text-slate-600">{'★'.repeat(5 - r.stars)}</span></span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(r.createdAt).toLocaleString()} {[r.country, r.lang, r.viewport].filter(Boolean).join(' · ')}
                  </span>
                  {(r.name || r.email) && <span className="text-slate-300">{[r.name, r.email].filter(Boolean).join(' · ')}</span>}
                </div>
                {r.message && <p className="mt-1.5 text-slate-200 whitespace-pre-wrap break-words">{r.message}</p>}
                {r.issues.length > 0 && (
                  <p className="mt-1 text-slate-400">Lacking: {r.issues.map((i) => RATING_ISSUES.find((x) => x.id === i)?.label || i).join(', ')}</p>
                )}
                {bad.length > 0 && <p className="mt-1 text-[#f9a8d4]">Needs work: {bad.join(', ')}</p>}
                {good.length > 0 && <p className="mt-1 text-[#7dd3fc]">Good: {good.join(', ')}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
