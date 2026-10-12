'use client';

import React, { useEffect, useState } from 'react';
import { Compass, Crown } from 'lucide-react';
import { PremiumTourDialog } from './PremiumTourDialog';
import { OPEN_PREMIUM_EVENT, startQuickTour } from '@/lib/tourCoupon';
import { Beam } from '@/components/Beam';
import { playPress } from '@/lib/couponSounds';

const warmJarvis = () => window.dispatchEvent(new CustomEvent('jarvis:warm'));

/** Quick Tour (free, ~3 min) and Premium Tour (full, ~14 min, coupon) buttons in the hero panel. */
export function TourButtons() {
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const onStatus = (e: Event) => {
      const state = (e as CustomEvent<{ state?: string }>).detail?.state;
      setRunning(state === 'connecting' || state === 'live');
    };
    const onOpen = () => setPremiumOpen(true);
    window.addEventListener('jarvis:tour-status', onStatus);
    window.addEventListener(OPEN_PREMIUM_EVENT, onOpen);
    return () => {
      window.removeEventListener('jarvis:tour-status', onStatus);
      window.removeEventListener(OPEN_PREMIUM_EVENT, onOpen);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => !running && startQuickTour()}
        onPointerEnter={warmJarvis}
        onFocus={warmJarvis}
        disabled={running}
        aria-label="Quick Tour with Jarvis, about 3 minutes, free"
        className="tour-btn w-full px-2.5 sm:px-4 py-2.5 min-h-[48px] flex items-center justify-center gap-2.5 bg-[#05101c]/70 border border-[#38e8ff]/30 hover:border-[#38e8ff] hover:bg-[#38e8ff]/10 text-slate-100 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight transition-all cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-default"
      >
        <Compass className="w-4 h-4 shrink-0 text-[#38e8ff]" />
        <span>Quick Tour</span>
        <span className="tour-btn__time">3 min</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (running) return;
          playPress();
          setPremiumOpen(true);
        }}
        onPointerEnter={warmJarvis}
        onFocus={warmJarvis}
        disabled={running}
        aria-haspopup="dialog"
        aria-label="Premium Tour with Jarvis, the full tour, about 14 minutes"
        className="tour-btn tour-btn--premium relative w-full px-2.5 sm:px-4 py-2.5 min-h-[48px] flex items-center justify-center gap-2.5 text-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight transition-all cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-default"
      >
        <Beam />
        <Crown className="relative w-4 h-4 shrink-0 text-[#e9d5ff]" />
        <span className="relative">Premium Tour</span>
        <span className="relative tour-btn__time">14 min</span>
      </button>

      <PremiumTourDialog open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}
