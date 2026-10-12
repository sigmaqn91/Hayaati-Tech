'use client';

/** Owner-only ratings report: open /ratings and enter the Jarvis owner code (also inside Admin Control in the menu). */

import React, { useState } from 'react';
import { Star, Lock, Loader2 } from 'lucide-react';
import { RatingsReport, type RatingsReportData } from '@/components/admin/RatingsReport';

export default function RatingsPage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<RatingsReportData | null>(null);

  const load = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/rating', { headers: { 'x-admin-code': code }, cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setReport(data);
      else setError(res.status === 429 ? 'Too many tries. Wait an hour.' : 'Wrong code.');
    } catch {
      setError('No connection.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-mono text-lg tracking-widest uppercase text-[#38e8ff] flex items-center gap-2">
          <Star className="w-5 h-5 fill-[#38e8ff]/40" /> Website ratings
        </h1>

        {!report && (
          <form onSubmit={load} className="mt-6 max-w-sm flex flex-col gap-3">
            <label className="text-sm text-slate-400">Owner code (same as the Jarvis owner code)</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rt-input"
              style={{ fontSize: '16px' }}
              autoFocus
            />
            <button type="submit" disabled={!code || busy} className="rt-btn rt-btn--solid">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Open
            </button>
            {error && <p className="text-sm text-[#ff8a8a]">{error}</p>}
          </form>
        )}

        {report && <RatingsReport report={report} />}
      </div>
    </main>
  );
}
