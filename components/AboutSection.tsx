'use client';

import React from 'react';
import { aboutData } from '@/data/about';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Globe } from 'lucide-react';
import { FounderPortrait } from '@/components/FounderPortrait';

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      aria-label={t.about.title}
      className="ab-section relative overflow-hidden border-b border-[#1e293b]"
    >
      {/* Moving futuristic background behind dark glass */}
      <div className="ab-bg" aria-hidden="true">
        <div className="ab-aurora" />
        <div className="ab-grid" />
        <div className="ab-floor" />
        <div className="ab-streaks">
          <i /><i /><i /><i /><i /><i />
        </div>
        <div className="ab-dust" />
        <div className="ab-veil" />
      </div>

      <div className="relative z-[1] py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <User className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.about.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.about.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.about.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:grid-cols-[480px_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-10 items-start">
        {/* Owner Photo Slot */}
        <div>
          <div className="ab-card relative overflow-hidden bg-[#0b0f17] border border-[#1e293b] aspect-square flex flex-col items-center justify-center p-6 text-center hud-frame">
            {aboutData.photoUrl ? (
              <FounderPortrait
                src={aboutData.photoUrl}
                alt={t.about.photoAlt}
                name={aboutData.ownerName}
                title={t.about.architectTitle}
              />
            ) : (
              /* Honest Placeholder */
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#070a0f] border border-[#38e8ff]/40 flex items-center justify-center text-[#38e8ff] mx-auto">
                  <User className="w-8 h-8 text-[#38e8ff]" />
                </div>
                <div className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                  {aboutData.ownerName}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {t.about.architectTitle}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio & Dossier Details */}
        <div className="md:self-stretch">
          <div className="ab-card ab-glass relative h-full p-6 sm:p-8 border border-[#1e293b] space-y-5 hud-frame flex flex-col justify-center">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#38e8ff]" />
                <span className="font-mono text-xs text-[#38e8ff] uppercase tracking-wider font-bold">
                  {t.about.architectTitle} {'//'} {aboutData.ownerName}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {t.common.status}: {t.common.operational}
              </span>
            </div>

            {/* Main details, larger text */}
            <div className="pl-5 border-l-2 border-l-[#38e8ff] space-y-4">
              <div className="text-lg sm:text-xl text-white font-semibold tracking-tight leading-snug">
                {t.about.leadArchitect}
              </div>
              <p className="text-base text-slate-300 leading-relaxed font-sans">
                {t.about.bioPlaceholder}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Remaining details in a compact strip */}
      <div className="ab-card ab-glass relative mt-8 px-6 py-4 border border-[#1e293b] hud-frame flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">{t.about.contactDirect}</span>
          <a href={`mailto:${aboutData.email}`} className="text-sm font-mono text-[#38e8ff] hover:underline flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{aboutData.email}</span>
          </a>
        </div>
        <span className="hidden md:block w-px h-9 bg-[#1e293b]" />
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">{t.footer.liveDomainLabel}</span>
          <a
            href={`https://${aboutData.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-slate-300 hover:text-[#38e8ff] flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-[#38e8ff]" />
            <span>{aboutData.domain}</span>
          </a>
        </div>
      </div>
      </div>
    </section>
  );
}
