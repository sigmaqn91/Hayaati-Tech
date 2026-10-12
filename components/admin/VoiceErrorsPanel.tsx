'use client';

/** Admin Control > Voice errors: the real technical cause of every failed Jarvis voice session (visitors only see a calm notice). */

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

export interface VoiceErrorRow {
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

export interface VoiceErrorsData {
  total: number;
  latest: VoiceErrorRow[];
}

const MODE_LABEL: Record<string, string> = { normal: 'Jarvis', quick: 'Quick Tour', full: 'Premium Tour' };

function wait(s: number | null) {
  if (!s) return '';
  if (s >= 3600) return `${Math.round(s / 360) / 10} h`;
  if (s >= 60) return `${Math.round(s / 60)} min`;
  return `${s} s`;
}

export function VoiceErrorsPanel({ report, onCleared }: { report: VoiceErrorsData; onCleared: () => void }) {
  const [busy, setBusy] = useState(false);

  const clear = async () => {
    if (busy || !window.confirm('Clear all voice error reports?')) return;
    setBusy(true);
    try {
      await fetch('/api/admin/voice-errors', { method: 'DELETE' });
      onCleared();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rt-card">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="rt-label">Voice errors</p>
          <p className="mt-1 text-[11px] font-mono text-slate-500">
            {report.total} total · showing latest {report.latest.length}. Visitors only see a calm notice.
          </p>
        </div>
        {report.latest.length > 0 && (
          <button type="button" onClick={clear} disabled={busy} className="rt-btn !min-h-[40px] !px-3 ms-auto" aria-label="Clear voice errors">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
      <ul className="mt-2 flex flex-col">
        {report.latest.length === 0 && <li className="text-sm text-slate-500">No voice errors. All clear.</li>}
        {report.latest.map((e) => (
          <li key={e.id} className="py-2 border-b border-[#38e8ff]/10 font-mono text-[13px]">
            <div className="flex flex-wrap gap-x-3">
              <span className="text-slate-400">{new Date(e.at).toLocaleString()}</span>
              <span className="text-[#f9a8d4]">{e.type.replace(/_/g, ' ')}</span>
              <span className="text-slate-200">{MODE_LABEL[e.mode] || e.mode}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-slate-400">
              {e.code && <span>code {e.code}</span>}
              {e.status !== null && <span>status {e.status}</span>}
              {e.reason && <span>reason {e.reason}</span>}
              {e.retryAfter ? <span>retry after {wait(e.retryAfter)}</span> : null}
              {e.layer && e.layer !== 'NONE' && <span>{e.layer}</span>}
              {e.vid && <span>visitor {e.vid.slice(0, 8)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
