'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface FloatingVoiceTriggerProps {
  onOpen: () => void;
}

export function FloatingVoiceTrigger({ onOpen }: FloatingVoiceTriggerProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear once visitor scrolls past hero section (~450px)
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const label = t.assistant.talkTo;

  return (
    <aside aria-label={label} className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onOpen}
        aria-label={label}
        className="group relative flex items-center gap-3 px-4 py-2.5 bg-[#070a0f] border border-[#38e8ff]/50 hover:border-[#38e8ff] shadow-[0_0_25px_rgba(56,232,255,0.3)] transition-all duration-300 cursor-pointer rounded-full min-h-[48px]"
      >
        {/* Glowing mini orb icon */}
        <div className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-[#38e8ff] opacity-60 animate-ping [animation-duration:2.5s]" />
          <div
            className="w-5 h-5 rounded-full relative z-10 shadow-[0_0_10px_#38e8ff]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #ffffff 0%, #38e8ff 35%, #1e40af 70%, #050b18 100%)',
            }}
          />
        </div>
        {/* Label */}
        <span className="font-mono text-xs font-semibold tracking-wider text-slate-100 group-hover:text-[#38e8ff] transition-colors pr-1">
          {label}
        </span>
      </button>
    </aside>
  );
}
