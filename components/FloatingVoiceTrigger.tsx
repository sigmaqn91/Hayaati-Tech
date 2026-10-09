'use client';

import React, { useState, useEffect } from 'react';

interface FloatingVoiceTriggerProps {
  onOpen: () => void;
}

export function FloatingVoiceTrigger({ onOpen }: FloatingVoiceTriggerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear once visitor scrolls past hero section (~450px)
      setVisible(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside aria-label="JARVIS" className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onOpen}
        aria-label="JARVIS"
        className="group relative flex items-center gap-3 px-4 py-2.5 bg-[#070a0f] border border-[#38e8ff]/50 hover:border-[#38e8ff] shadow-[0_0_25px_rgba(56,232,255,0.3)] transition-all duration-300 cursor-pointer rounded-full min-h-[48px]"
      >
        {/* Glowing Arc Reactor mini launcher icon */}
        <div className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-[#38e8ff] opacity-60 animate-ping [animation-duration:2.5s]" />
          <div className="absolute -inset-1 rounded-full border border-dashed border-[#38e8ff]/70 animate-[spin_8s_linear_infinite]" />
          <div
            className="w-4 h-4 rounded-full relative z-10 shadow-[0_0_12px_#38e8ff]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #ffffff 0%, #38e8ff 45%, #0088ff 80%, #050b18 100%)',
            }}
          />
        </div>
        {/* Label */}
        <span className="font-mono text-xs font-bold tracking-widest text-[#38e8ff] group-hover:text-white transition-colors pr-1">
          JARVIS
        </span>
      </button>
    </aside>
  );
}
