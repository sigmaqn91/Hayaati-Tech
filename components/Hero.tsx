'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { HeroStarfield } from './HeroStarfield';
import { DecryptText } from './DecryptText';
import { ArrowDown, Layers, Terminal } from 'lucide-react';

export function Hero() {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Gentle parallax factor (subtle 0.15 ratio)
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#05070a] border-b border-[#1e293b]"
    >
      {/* Background Image Container with gentle parallax */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
        style={{
          transform: `translateY(${Math.min(scrollY * 0.15, 80)}px)`,
        }}
      >
        {!heroImageError ? (
          <Image
            src="/images/hero/hero-main.webp"
            alt="Cinematic vision of futuristic metropolis 2030–2050"
            fill
            priority
            sizes="100vw"
            referrerPolicy="no-referrer"
            onError={() => setHeroImageError(true)}
            onLoad={() => setImageLoaded(true)}
            className={`object-cover object-center opacity-35 transition-opacity duration-1000 ${
              imageLoaded ? 'opacity-35' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Fallback solid architectural grid panel when hero image is not yet rendered to disk */}
        {(!imageLoaded || heroImageError) && (
          <div className="absolute inset-0 bg-[#070a0f] opacity-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111723_1px,transparent_1px),linear-gradient(to_bottom,#111723_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />
          </div>
        )}

        {/* Dark radial gradient vignette for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/70 to-[#05070a]/90" />
      </div>

      {/* Static scanline texture overlay */}
      <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />

      {/* Hero Canvas Starfield / Data Grid (Max 60 particles, pauses off-screen) */}
      <HeroStarfield />

      {/* Hero Content Box */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* System Online HUD Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0b0f17] border border-[#38e8ff]/40 shadow-[0_0_12px_rgba(56,232,255,0.15)] mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38e8ff] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38e8ff]" />
          </span>
          <span className="font-mono text-[11px] tracking-widest text-[#38e8ff] uppercase font-bold">
            {t.hero.online}
          </span>
          <span className="text-slate-600 font-mono text-[10px]">|</span>
          <span className="font-mono text-[10px] text-slate-400">
            {t.hero.systemStatus}
          </span>
        </div>

        {/* Main Headline with Decrypt Effect */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          <DecryptText text={t.hero.headline} speed={22} />
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mb-10 font-normal">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Primary CTA */}
          <a
            href="#timeline"
            className="w-full sm:w-auto px-7 py-3.5 min-h-[48px] flex items-center justify-center gap-2 bg-[#38e8ff] text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 shadow-[0_0_20px_rgba(56,232,255,0.3)] transition-all cursor-pointer"
          >
            <span>{t.hero.exploreCta}</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#05070a]" />
          </a>

          {/* Secondary CTA */}
          <a
            href="#projects"
            className="w-full sm:w-auto px-7 py-3.5 min-h-[48px] flex items-center justify-center gap-2 bg-[#0b0f17] text-slate-200 border border-[#1e293b] hover:border-[#38e8ff]/50 hover:text-white font-mono text-xs font-medium uppercase tracking-wider transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#38e8ff]" />
            <span>{t.hero.projectsCta}</span>
          </a>
        </div>

        {/* Monospace Telemetry Details Bar */}
        <div className="mt-14 pt-6 border-t border-[#1e293b] w-full max-w-2xl flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-[#38e8ff]/70" />
            <span>{t.hero.coordinates}</span>
          </div>
          <div className="text-[#38e8ff]/80 font-semibold tracking-wider">
            {t.hero.timelineSpan}
          </div>
        </div>
      </div>
    </section>
  );
}
