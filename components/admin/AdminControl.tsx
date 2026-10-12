'use client';

/**
 * Admin Control: one owner panel (opened from the 3-line menu or the Jarvis owner buttons) with every owner
 * report in tabs, so no separate URLs are needed. Data comes only from owner-checked APIs: the signed owner
 * session (set by the Jarvis owner code) or the code typed here.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { X, Users, Star, ShieldAlert, RefreshCw, Lock, Loader2, Sliders } from 'lucide-react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import { RatingsReport, type RatingsReportData } from './RatingsReport';
import { VisitorsReport, type VisitorsReportData } from './VisitorsReport';

export type AdminTab = 'visitors' | 'ratings' | 'security';

interface SecurityLog {
  id: string;
  ip: string;
  timestamp: string;
  reason: string;
}

export function AdminControl({ initialTab, onClose }: { initialTab?: AdminTab | null; onClose: () => void }) {
  const [tab, setTab] = useState<AdminTab>(initialTab || 'visitors');
  const [needCode, setNeedCode] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [visitors, setVisitors] = useState<VisitorsReportData | null>(null);
  const [ratings, setRatings] = useState<RatingsReportData | null>(null);
  const [security, setSecurity] = useState<SecurityLog[] | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  useOverlayHistory(true, onClose);

  // Page behind stays still while the panel is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [v, r, s] = await Promise.all([
        fetch('/api/admin/visitors', { cache: 'no-store' }),
        fetch('/api/rating', { cache: 'no-store' }),
        fetch('/api/jarvis/admin', { cache: 'no-store' }).catch(() => null),
      ]);
      if (v.status === 401 || r.status === 401) {
        setNeedCode(true);
        return;
      }
      if (v.status === 429 || r.status === 429) {
        setError('Too many opens this hour. Please wait a little.');
        return;
      }
      const vData = await v.json().catch(() => null);
      const rData = await r.json().catch(() => null);
      if (vData?.success) setVisitors(vData);
      if (rData?.success) setRatings(rData);
      if (s && s.ok) {
        const sData = await s.json().catch(() => null);
        setSecurity(Array.isArray(sData?.failedLogs) ? sData.failedLogs : []);
      } else setSecurity([]);
      setNeedCode(false);
      setLoadedAt(new Date());
    } catch {
      setError('No connection. Try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Owner code here signs the owner in for 2 hours (same server check as Jarvis), then the reports load.
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/jarvis/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        setCode('');
        await load();
        return;
      }
      setError(res.status === 429 ? 'Locked after too many tries. Please wait.' : 'Wrong code.');
    } catch {
      setError('No connection. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const TABS: [AdminTab, string, React.ComponentType<{ className?: string }>][] = [
    ['visitors', 'Visitors', Users],
    ['ratings', 'Ratings', Star],
    ['security', 'Security', ShieldAlert],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin Control"
      className="fixed inset-0 z-[70] bg-[#03050a] text-slate-100 overflow-y-auto overscroll-contain"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-16">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg border border-[#ffaa00]/50 bg-[#ffaa00]/10 flex items-center justify-center shadow-[0_0_16px_rgba(255,170,0,0.18)]">
            <Sliders className="w-5 h-5 text-[#ffcf66]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-mono text-base sm:text-lg tracking-[0.2em] uppercase text-white">Admin Control</h2>
            <p className="font-mono text-[11px] text-[#ffcf66]/80 tracking-wider">Owner · Aliya Khan</p>
          </div>
          <div className="ms-auto flex items-center gap-2">
            {!needCode && (
              <button type="button" onClick={load} disabled={busy} className="rt-btn !min-h-[40px] !px-3" aria-label="Refresh">
                <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <button type="button" onClick={onClose} className="rt-btn !min-h-[40px] !px-3" aria-label="Close">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {needCode ? (
          <form onSubmit={verify} className="mt-8 max-w-sm flex flex-col gap-3 rt-card">
            <p className="rt-label flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Owner verification
            </p>
            <p className="text-sm text-slate-400">Your owner session has ended. Enter the owner code to open Admin Control.</p>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rt-input"
              style={{ fontSize: '16px' }}
              autoFocus
              aria-label="Owner code"
            />
            <button type="submit" disabled={!code || busy} className="rt-btn rt-btn--solid">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Open
            </button>
            {error && <p className="text-sm text-[#ff8a8a]">{error}</p>}
          </form>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-1.5 border-b border-[#38e8ff]/15 pb-3" role="tablist">
              {TABS.map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`adm-tab ${tab === id ? 'is-on' : ''}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
              {loadedAt && <span className="ms-auto font-mono text-[11px] text-slate-500">Updated {loadedAt.toLocaleTimeString()}</span>}
            </div>
            {error && <p className="mt-3 text-sm text-[#ff8a8a]">{error}</p>}

            <div className="mt-4">
              {busy && !visitors && !ratings && (
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading...
                </p>
              )}
              {tab === 'visitors' && visitors && <VisitorsReport report={visitors} />}
              {tab === 'ratings' && ratings && <RatingsReport report={ratings} />}
              {tab === 'security' && (
                <div className="rt-card">
                  <p className="rt-label">Wrong owner-code tries</p>
                  <p className="mt-1 text-[11px] font-mono text-slate-500">Recent failed tries on the server (IP partly hidden). Locked automatically after 5 tries.</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {(!security || security.length === 0) && <li className="text-sm text-slate-500">No failed tries. All clear.</li>}
                    {security?.map((l) => (
                      <li key={l.id} className="flex flex-wrap gap-x-3 text-[13px] py-1 border-b border-[#38e8ff]/10 font-mono">
                        <span className="text-slate-400">{new Date(l.timestamp).toLocaleString()}</span>
                        <span className="text-slate-200">{l.ip}</span>
                        <span className="text-[#f9a8d4]">{l.reason.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
