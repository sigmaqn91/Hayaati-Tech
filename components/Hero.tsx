'use client';

import HeroCosmos from './HeroCosmos';
import { HeroAdvert } from './ad/HeroAdvert';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { HeroStarfield } from './HeroStarfield';
import { DecryptText } from './DecryptText';
import { ArrowRight, Layers } from 'lucide-react';
import DevBanner from './DevBanner';

interface HeroProps {
  onOpenAssistant?: () => void;
  assistantOverlay?: React.ReactNode;
}

const LATIN_LANGUAGES = new Set(['en', 'fr', 'de', 'es', 'pt', 'it', 'tr', 'id', 'vi']);

export function Hero({ onOpenAssistant, assistantOverlay }: HeroProps) {
  const { t, language, isRtl } = useLanguage();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [headlineHeight, setHeadlineHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Parallax is written straight to the element (no React re-render per scroll event) and only while the hero is on screen.
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = parallaxRef.current;
      if (el) el.style.transform = `translateY(${Math.min(window.scrollY * 0.15, 80)}px)`;
    };
    const handleScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const isLatin = LATIN_LANGUAGES.has(language);

  // Split headline into two balanced lines across all script sentence delimiters
  const rawHeadline = t.hero.headline || '';
  const delimiterMatch = rawHeadline.match(/^(.*?[.!?|।۔。])\s*(.+)$/);
  let line1 = rawHeadline;
  let line2 = '';
  if (delimiterMatch) {
    line1 = delimiterMatch[1].trim();
    line2 = delimiterMatch[2].trim();
  } else {
    const words = rawHeadline.split(' ');
    if (words.length > 3) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(' ');
      line2 = words.slice(mid).join(' ');
    }
  }

  // Keep headline height fixed to prevent page jumps during decryption and language switches
  useEffect(() => {
    const updateHeadlineHeight = () => {
      if (headlineRef.current) {
        const height = headlineRef.current.offsetHeight;
        if (height > 0) {
          setHeadlineHeight(height);
        }
      }
    };

    updateHeadlineHeight();
    window.addEventListener('resize', updateHeadlineHeight);
    return () => window.removeEventListener('resize', updateHeadlineHeight);
  }, [language, line1, line2]);

  return (
    <section
      id="hero"
      aria-label={t.nav.home}
      className="hero-v2 relative min-h-[100svh] flex flex-col overflow-hidden bg-[#05070a] border-b border-[#1e293b]"
    >
      <HeroCosmos />
      <DevBanner />
      {/* Background Image Container with subtle parallax */}
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden will-change-transform"
      >
        {!heroImageError ? (
          <Image
            src="/images/hero/hero-main.webp"
            alt={t.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            referrerPolicy="no-referrer"
            onError={() => setHeroImageError(true)}
            onLoad={() => setImageLoaded(true)}
            className={`object-cover object-center transition-opacity duration-1000 ${
              imageLoaded ? 'opacity-60' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Fallback architectural grid panel when hero image is not rendered */}
        {(!imageLoaded || heroImageError) && (
          <div className="absolute inset-0 bg-[#070a0f] opacity-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111723_1px,transparent_1px),linear-gradient(to_bottom,#111723_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />
          </div>
        )}

        {/* Soft vignette: keeps the picture visible but the edges dark */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/20 to-[#05070a]/40" />
      </div>

      {/* Static scanline texture overlay */}
      <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />

      {/* Soft cyan/violet glow behind the orb + dark side shade so the glass panel stays readable */}
      <div className="hero-v2-glow absolute inset-0 z-[2] pointer-events-none" aria-hidden="true" />
      <div className="hero-v2-shade absolute inset-0 z-[2] pointer-events-none" aria-hidden="true" />

      {/* Hero Canvas Starfield / Perspective Data Grid */}
      <HeroStarfield hasImage={imageLoaded && !heroImageError} />

      {/* Embedded Jarvis stays inside the hero stage; its orb sits behind the content layers. */}
      {assistantOverlay}

      {/* Hero content: glass HUD panel (left on desktop, below the orb on mobile) */}
      <div
        dir="ltr"
        className="hero-content relative z-20 lg:min-h-[100svh] flex-none flex flex-col justify-start lg:justify-center pointer-events-none"
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="hero-panel-wrap mx-auto lg:mx-0 w-full max-w-[46rem] lg:w-[min(50vw,42rem)]"
          >
            <div className="hero-panel pointer-events-auto">
              <span className="hero-panel__glow" aria-hidden="true" />
              <span className="hero-panel__ring" aria-hidden="true" />
              <span className="hero-panel__glass" aria-hidden="true" />
              {/* Corner / edge tick marks */}
              <span className="hero-panel__tick hero-panel__tick--a" style={{ top: -1, left: '64%', width: 54, height: 3 }} aria-hidden="true" />
              <span className="hero-panel__tick hero-panel__tick--b" style={{ bottom: -1, left: '14%', width: 40, height: 3 }} aria-hidden="true" />
              <span className="hero-panel__tick hero-panel__tick--c" style={{ left: -1, top: '38%', width: 3, height: 26 }} aria-hidden="true" />
              <span className="hero-panel__tick hero-panel__tick--d" style={{ right: -1, top: '27%', width: 3, height: 28 }} aria-hidden="true" />
              {/* Looping light runners that travel around the panel edge */}
              <span className="hero-panel__runner hero-panel__runner--h" aria-hidden="true" />
              <span className="hero-panel__runner hero-panel__runner--v" aria-hidden="true" />

              <div className="hero-panel__body flex flex-col items-start text-start">
                {/* System Online HUD Badge */}
                <div className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 px-3.5 py-1.5 rounded-lg bg-[#05070a]/60 border border-[#38e8ff]/40 shadow-[0_0_12px_rgba(56,232,255,0.15)] mb-4">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-[#38e8ff] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38e8ff]" />
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-[#38e8ff] uppercase font-bold">
                    {t.hero.online}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">|</span>
                  <span className="font-mono text-[9px] sm:text-[10px] text-slate-300 break-all">
                    {t.hero.systemStatus}
                  </span>
                </div>

                {/* Headline with thin vertical cyan line */}
                <div className="relative w-full ps-4 lg:ps-5 mb-1">
                  <span
                    className="absolute start-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-[#38e8ff] via-[#38e8ff]/50 to-[#38e8ff]/10"
                    aria-hidden="true"
                  />
                  {/* Main Headline Split into Two Balanced Lines */}
                  <h1
                    ref={headlineRef}
                    className={`hero-headline font-bold tracking-tight text-white text-start ${
                      isLatin ? 'leading-[1.15]' : 'leading-[1.45]'
                    }`}
                    style={{
                      textWrap: 'balance',
                      overflowWrap: 'break-word',
                      wordBreak: isLatin ? 'normal' : 'break-word',
                      minHeight: headlineHeight ? `${headlineHeight}px` : undefined,
                    }}
                  >
                    {/* Line 1 */}
                    <span className="block text-slate-100 min-h-[1.25em]">
                      <DecryptText key={`${language}-${line1}`} text={line1} speed={25} />
                    </span>
                    {/* Line 2 (Key Phrase with cyan-to-blue-to-violet gradient & soft glow) */}
                    {line2 ? (
                      <span className="block mt-0.5 bg-gradient-to-r from-[#38e8ff] via-[#4f8dff] to-[#c084fc] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,232,255,0.35)] font-extrabold min-h-[1.25em]">
                        <DecryptText key={`${language}-${line2}`} text={line2} speed={25} />
                      </span>
                    ) : null}
                  </h1>
                </div>

                {/* Small gradient underline */}
                <div className="w-24 h-0.5 bg-gradient-to-r from-[#38e8ff] to-transparent rtl:bg-gradient-to-l mt-2.5 mb-3" />

                {/* Subtitle */}
                <p
                  className={`hero-panel__subtitle text-slate-200 max-w-[62ch] mb-5 font-normal text-sm sm:text-[0.95rem] lg:text-base ${
                    isLatin ? 'leading-relaxed' : 'leading-[1.6]'
                  }`}
                >
                  {t.hero.subtitle}
                </p>

                {/* Exploration CTAs: stacked on desktop, Explore + (Activate | Projects) row on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 w-full">
                  {/* Primary Exploration CTA */}
                  <a
                    href="#timeline"
                    aria-label={t.hero.exploreCta}
                    className="col-span-2 lg:col-span-1 w-full px-4 py-3 min-h-[48px] flex items-center justify-center gap-2.5 bg-[#38e8ff] text-[#05070a] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-center leading-tight hover:bg-[#38e8ff]/90 shadow-[0_0_22px_rgba(56,232,255,0.35)] transition-all cursor-pointer rounded-md"
                  >
                    <span>{t.hero.exploreCta}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 text-[#05070a] rtl:-scale-x-100" />
                  </a>

                  {/* Embedded Jarvis CTA (onClick untouched) */}
                  <button
                    onClick={onOpenAssistant}
                    className="w-full px-2.5 sm:px-4 py-2.5 min-h-[48px] flex items-center justify-center gap-2.5 bg-[#05101c]/70 border border-[#38e8ff]/45 hover:border-[#38e8ff] hover:bg-[#38e8ff]/10 text-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight shadow-[0_0_18px_rgba(56,232,255,0.2)] hover:shadow-[0_0_30px_rgba(56,232,255,0.4)] transition-all cursor-pointer rounded-md"
                    aria-label="Activate Jarvis"
                  >
                    <div className="relative w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      <span className="absolute inset-0 rounded-full bg-[#38e8ff] opacity-40 animate-ping motion-reduce:animate-none [animation-duration:2.5s]" />
                      <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#38e8ff] via-[#818cf8] to-[#c084fc] opacity-60 blur-xs animate-pulse motion-reduce:animate-none" />
                      <span
                        className="relative z-10 w-4 h-4 rounded-full shadow-[0_0_10px_#38e8ff]"
                        style={{
                          background:
                            'radial-gradient(circle at 35% 30%, #ffffff 0%, #38e8ff 45%, #1e40af 80%, #050b18 100%)',
                        }}
                      />
                    </div>
                    <span className="text-slate-100 tracking-widest font-bold">Activate Jarvis</span>
                  </button>

                  {/* Secondary CTA */}
                  <a
                    href="#projects"
                    aria-label={t.hero.projectsCta}
                    className="w-full px-2.5 sm:px-4 py-2.5 min-h-[48px] flex items-center justify-center gap-2.5 bg-[#05101c]/70 text-slate-100 border border-[#38e8ff]/30 hover:border-[#38e8ff] hover:bg-[#38e8ff]/10 hover:text-white font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight transition-all cursor-pointer rounded-md"
                  >
                    <Layers className="w-4 h-4 shrink-0 text-[#38e8ff]" />
                    <span>{t.hero.projectsCta}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Monospace Telemetry Details Bar */}
            <div className="mt-4 px-1 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-500 gap-x-3 gap-y-1">
              <span>{t.hero.coordinates}</span>
              <span className="text-[#38e8ff]/80 font-semibold tracking-wider">{t.hero.timelineSpan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic advertisement: fills the space under the hero panel */}
      <HeroAdvert />
    </section>
  );
}
