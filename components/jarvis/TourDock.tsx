'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface TourProgress {
  active?: boolean;
  mode?: 'quick' | 'full';
  index?: number;
  total?: number;
  label?: string;
  startedAt?: number;
  maxSeconds?: number;
}

interface TourDockProps {
  mode: 'quick' | 'full';
  speaking: boolean;
  onEnd: () => void;
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.max(0, Math.floor(sec % 60))).padStart(2, '0')}`;

/**
 * Small glass bar at the bottom of the screen while a Jarvis tour runs: which tour, how far it is, the time,
 * and an "End tour" button. It sits above card popups so the visitor can always stop the tour.
 * Rendered into <body> (the Jarvis overlay lives inside the hero, where fixed positioning would not work).
 */
export function TourDock({ mode, speaking, onEnd }: TourDockProps) {
  const [progress, setProgress] = useState<TourProgress>({});
  const [now, setNow] = useState(() => Date.now());
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onProgress = (e: Event) => setProgress((e as CustomEvent<TourProgress>).detail || {});
    window.addEventListener('jarvis:tour-progress', onProgress);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    // Once a second is enough for the clock (no per-frame re-render).
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener('jarvis:tour-progress', onProgress);
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  const total = progress.total || 0;
  const step = total ? Math.min(total, (progress.index || 0) + 1) : 0;
  const pct = total ? Math.round((step / total) * 100) : 0;
  const elapsed = progress.startedAt ? (now - progress.startedAt) / 1000 : 0;
  const title = mode === 'full' ? 'Premium Tour' : 'Quick Tour';

  return createPortal(
    <div
      data-jarvis-ui
      role="status"
      aria-live="polite"
      className={`tour-dock fixed left-1/2 bottom-4 z-[60] w-[min(560px,calc(100%-32px))] -translate-x-1/2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="tour-dock__glass relative overflow-hidden rounded-2xl border border-[#38e8ff]/35 bg-[#060a12]/80 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(56,232,255,0.14)]">
        <span className="tour-dock__sheen" aria-hidden="true" />
        <div className="relative flex items-center gap-3 px-4 py-3">
          <span className={`tour-dock__orb ${speaking ? 'is-speaking' : ''}`} aria-hidden="true">
            <span />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <span className="text-[#38e8ff] font-bold">Jarvis</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-100 font-semibold">{title}</span>
              <span className="ms-auto text-slate-400 tabular-nums tracking-normal">
                {progress.maxSeconds ? mmss(Math.max(0, Math.ceil(progress.maxSeconds - elapsed))) : ''}
              </span>
            </div>
            <div className="mt-1 truncate text-[12.5px] text-slate-300">
              {progress.label || 'Starting the tour…'}
            </div>
          </div>
          <button
            type="button"
            onClick={onEnd}
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full border border-white/15 bg-white/[0.04] text-[11px] font-mono uppercase tracking-wider text-slate-200 hover:border-[#38e8ff]/60 hover:text-white transition-colors cursor-pointer"
            aria-label="End tour"
          >
            <X className="w-3.5 h-3.5" />
            <span>End tour</span>
          </button>
        </div>
        <div className="relative h-[3px] bg-white/[0.06]">
          <span
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#38e8ff] via-[#7aa2ff] to-[#c084fc] transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
