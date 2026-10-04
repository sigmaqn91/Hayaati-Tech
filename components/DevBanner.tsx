'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { DecryptText } from './DecryptText';
import { DEV_BANNER_TEXT } from '../lib/devBannerText';

type ConnectionStatus = 'standby' | 'connected' | 'rate_limited' | 'missing_key';

export default function DevBanner() {
  const [lang, setLang] = useState('en');
  const [status, setStatus] = useState<ConnectionStatus>('standby');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Strictly hide in production unless explicit override is provided
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_SHOW_DEV_BANNER !== 'true';

  useEffect(() => {
    const read = () => {
      const l = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
      setLang(DEV_BANNER_TEXT[l] ? l : 'en');
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => obs.disconnect();
  }, []);

  // Single read-only health check on mount to /api/assistant/voice with action=status
  const checkHealthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.configured) {
          setStatus('connected');
        } else {
          setStatus('missing_key');
        }
      } else if (res.status === 429) {
        setStatus('rate_limited');
      } else if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        if (data.code === 'missing_api_key' || !data.configured) {
          setStatus('missing_key');
        } else {
          setStatus('rate_limited');
        }
      } else {
        setStatus('missing_key');
      }
    } catch {
      setStatus('rate_limited');
    }
  }, []);

  useEffect(() => {
    if (isProduction) return;
    checkHealthStatus();
  }, [checkHealthStatus, isProduction]);

  // Manual Test Voice Token button: requests a real session token and immediately releases the slot
  const handleTestToken = async () => {
    if (isTesting) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/assistant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session', language: lang }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        setTestResult(`200 OK — Model: ${data.model || 'gemini-3.8-live'}`);
        setStatus('connected');
        // Cleanly release the test slot so concurrent quota is immediately restored
        fetch('/api/assistant/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'release', durationSeconds: 1 }),
          keepalive: true,
        }).catch(() => {});
      } else if (res.status === 429) {
        setTestResult(`429 Rate Limited (${data.code || 'quota_reached'})`);
        setStatus('rate_limited');
      } else if (res.status === 503) {
        setTestResult(`503 Offline (${data.code || 'server_busy'})`);
        if (data.code === 'missing_api_key') {
          setStatus('missing_key');
        } else {
          setStatus('rate_limited');
        }
      } else {
        setTestResult(`${res.status} Error (${data.code || 'generic_error'})`);
        setStatus('missing_key');
      }
    } catch (err: any) {
      setTestResult(`Network Error: ${err.message || 'Failed to fetch'}`);
      setStatus('rate_limited');
    } finally {
      setIsTesting(false);
    }
  };

  if (isProduction) {
    return null;
  }

  const t = DEV_BANNER_TEXT[lang] || DEV_BANNER_TEXT.en;

  // Status Pill Configurations
  const statusConfig = {
    connected: {
      label: 'Live API Connected',
      badgeClass: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      dotClass: 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]',
      icon: CheckCircle2,
    },
    rate_limited: {
      label: 'Offline (Rate Limited/Busy)',
      badgeClass: 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      dotClass: 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]',
      icon: AlertTriangle,
    },
    missing_key: {
      label: 'Offline (Missing API Key)',
      badgeClass: 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
      icon: XCircle,
    },
    standby: {
      label: 'Standby',
      badgeClass: 'bg-slate-900/80 border-slate-700 text-slate-400',
      dotClass: 'bg-slate-500',
      icon: Clock,
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className="absolute top-20 left-0 right-0 z-30 flex flex-col items-center gap-2 px-4 pointer-events-none select-none text-center"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-2xl w-full bg-[#0a1119]/95 backdrop-blur-md border border-amber-500/40 rounded-lg p-3 sm:p-4 shadow-[0_0_24px_rgba(245,158,11,0.15)] pointer-events-auto">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse" />
            <span className="font-mono text-xs tracking-widest text-amber-400 uppercase font-bold">
              <DecryptText text={t.title} />
            </span>
          </div>

          {/* Status Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium ${statusConfig.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            <StatusIcon className="w-3 h-3 shrink-0" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Subtitle Message */}
        <div className="text-xs text-slate-300 mt-2 font-sans text-left sm:text-center leading-relaxed">
          {t.sub}
        </div>

        {/* Action & Diagnostics Bar */}
        <div className="mt-3 pt-2.5 border-t border-[#1e293b]/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestToken}
              disabled={isTesting}
              className="px-3 py-1.5 bg-[#0e1622] hover:bg-[#152336] text-[#38e8ff] border border-[#38e8ff]/40 hover:border-[#38e8ff] rounded text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[32px]"
              aria-label={'Test Voice Token'}
            >
              {isTesting ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[#38e8ff]" />
              ) : (
                <Sparkles className="w-3 h-3 text-[#38e8ff]" />
              )}
              <span>{isTesting ? 'Testing...' : 'Test Voice Token'}</span>
            </button>

            <button
              onClick={checkHealthStatus}
              title="Refresh Status"
              className="p-1.5 text-slate-400 hover:text-white border border-[#1e293b] rounded bg-[#0b0f17] hover:border-slate-500 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label={'Refresh Status'}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {testResult && (
            <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#05070a] border border-[#1e293b] text-slate-300">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
