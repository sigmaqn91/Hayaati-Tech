'use client';

import HeroCosmos from './HeroCosmos';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { HeroStarfield } from './HeroStarfield';
import { DecryptText } from './DecryptText';
import { ArrowDown, Layers } from 'lucide-react';
import DevBanner from './DevBanner';

interface HeroProps {
  onOpenAssistant?: () => void;
  assistantOverlay?: React.ReactNode;
}

const LATIN_LANGUAGES = new Set(['en', 'fr', 'de', 'es', 'pt', 'it', 'tr', 'id', 'vi']);

export function Hero({ onOpenAssistant, assistantOverlay }: HeroProps) {
  const { t, language } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [heroImageError, setHeroImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [headlineHeight, setHeadlineHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLatin = LATIN_LANGUAGES.has(language);
  const talkToLabel = t.assistant.talkTo;

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
      className="relative min-h-[92vh] flex items-center justify-center pt-64 pb-16 overflow-hidden bg-[#05070a] border-b border-[#1e293b]"
    >
      <HeroCosmos />
      <DevBanner />
      {/* Background Image Container with subtle parallax */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
        style={{
          transform: `translateY(${Math.min(scrollY * 0.15, 80)}px)`,
        }}
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
            className={`object-cover object-center opacity-35 transition-opacity duration-1000 ${
              imageLoaded ? 'opacity-35' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Fallback architectural grid panel when hero image is not rendered */}
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

      {/* Hero Canvas Starfield / Perspective Data Grid */}
      <HeroStarfield hasImage={imageLoaded && !heroImageError} />

      {/* Embedded Jarvis stays inside the hero stage; its orb sits behind the content layers. */}
      {assistantOverlay}

      {/* Hero Content Box */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* System Online HUD Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0b0f17] border border-[#38e8ff]/40 shadow-[0_0_12px_rgba(56,232,255,0.15)] mb-5">
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

        {/* Monospace Label Above Headline */}
        <div className="text-[10px] sm:text-xs font-mono tracking-widest text-[#38e8ff]/80 uppercase mb-2">
          {t.hero.timelineSpan}
        </div>

        {/* Main Headline Split into Two Balanced Lines */}
        <h1
          ref={headlineRef}
          className={`font-bold tracking-tight text-white max-w-4xl text-center mx-auto mb-2 min-h-[4.5rem] sm:min-h-[6rem] md:min-h-[7.5rem] lg:min-h-[9rem] ${
            isLatin ? 'leading-[1.18]' : 'leading-[1.45]'
          }`}
          style={{
            fontSize: 'clamp(1.5rem, 4.2vw + 0.35rem, 3.85rem)',
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
          {/* Line 2 (Key Phrase with cyan-to-violet gradient & soft glow) */}
          {line2 ? (
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-[#38e8ff] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,232,255,0.4)] font-extrabold min-h-[1.25em]">
              <DecryptText key={`${language}-${line2}`} text={line2} speed={25} />
            </span>
          ) : null}
        </h1>

        {/* Thin Animated Line Under Heading */}
        <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#38e8ff] to-transparent my-5 animate-pulse" />

        {/* Subtitle */}
        <p
          className={`text-slate-300 max-w-2xl leading-relaxed mb-8 font-normal text-sm sm:text-base md:text-lg ${
            isLatin ? '' : 'leading-[1.6]'
          }`}
          style={{ textWrap: 'balance' }}
        >
          {t.hero.subtitle}
        </p>

        {/* Exploration CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          {/* Primary Exploration CTA */}
          <a
            href="#timeline"
            aria-label={t.hero.exploreCta}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] flex items-center justify-center gap-2 bg-[#38e8ff] text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 shadow-[0_0_20px_rgba(56,232,255,0.25)] transition-all cursor-pointer rounded-none"
          >
            <span>{t.hero.exploreCta}</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#05070a]" />
          </a>

          {/* Embedded Jarvis CTA: same row as the existing hero actions. */}
          <button
            onClick={onOpenAssistant}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] flex items-center justify-center gap-3 bg-[#070a0f]/90 border border-[#38e8ff] hover:bg-[#38e8ff]/10 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(56,232,255,0.35)] hover:shadow-[0_0_35px_rgba(56,232,255,0.5)] transition-all cursor-pointer rounded-none"
            aria-label="Activate Jarvis"
          >
            <div className="relative w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#38e8ff] opacity-40 animate-ping [animation-duration:2.5s]" />
              <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#38e8ff] via-[#818cf8] to-[#c084fc] opacity-60 blur-xs animate-pulse" />
              <span
                className="relative z-10 w-4 h-4 rounded-full shadow-[0_0_10px_#38e8ff]"
                style={{
                  background:
                    'radial-gradient(circle at 35% 30%, #ffffff 0%, #38e8ff 45%, #1e40af 80%, #050b18 100%)',
                }}
              />
            </div>
            <span className="text-[#38e8ff] group-hover:text-white transition-colors tracking-widest font-bold">
              Activate Jarvis
            </span>
          </button>

          {/* Secondary CTA */}
          <a
            href="#projects"
            aria-label={t.hero.projectsCta}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] flex items-center justify-center gap-2 bg-[#0b0f17] text-slate-200 border border-[#1e293b] hover:border-[#38e8ff]/50 hover:text-white font-mono text-xs font-medium uppercase tracking-wider transition-all cursor-pointer rounded-none"
          >
            <Layers className="w-3.5 h-3.5 text-[#38e8ff]" />
            <span>{t.hero.projectsCta}</span>
          </a>
        </div>

        {/* Monospace Telemetry Details Bar */}
        <div className="mt-12 pt-6 border-t border-[#1e293b] w-full max-w-2xl flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-3">
          <div className="flex items-center gap-2">
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
