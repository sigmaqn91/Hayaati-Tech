'use client';

import React from 'react';
import { aboutData } from '@/data/about';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Globe } from 'lucide-react';
import { FounderPortrait } from '@/components/FounderPortrait';
import { Beam } from '@/components/Beam';

export function AboutSection() {
  const { t } = useLanguage();
  // Her name inside the heading gets its own elegant font; the rest of the (translated) title stays as is.
  const nameAt = t.about.title.indexOf(aboutData.ownerName);
  const titleParts =
    nameAt >= 0 ? [t.about.title.slice(0, nameAt), t.about.title.slice(nameAt + aboutData.ownerName.length)] : null;

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
      {/* Heading card: same dark glass + pool-water light as the details card, full width */}
      <div className="ab-card ab-glass ab-water-card relative mb-8 p-6 sm:p-8 border border-[#1e293b] hud-frame">
        <Beam />
        <div className="ab-water" aria-hidden="true">
          <span className="ab-water-a" />
          <span className="ab-water-b" />
          <span className="ab-water-shine" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <User className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.about.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {titleParts ? (
            <>
              {titleParts[0]}
              <span className="ab-name">{aboutData.ownerName}</span>
              {titleParts[1]}
            </>
          ) : (
            t.about.title
          )}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.about.subtitle}
        </p>
      </div>

      {/* Founder photo on top (full width, square like the original file), details card below */}
      <div className="space-y-8">
        {/* Owner Photo Slot: era-banner style halo, dual border light and moving light over the photo */}
        <div className="eb-stage">
          <div className="eb-aura" aria-hidden="true"><Beam /></div>
          <div className="ab-card eb-card relative overflow-hidden bg-[#0b0f17] border border-[#1e293b] aspect-square flex flex-col items-center justify-center p-6 text-center hud-frame">
            <Beam />
            {aboutData.photoUrl ? (
              <>
                <FounderPortrait
                  src={aboutData.photoUrl}
                  alt={t.about.photoAlt}
                  name={aboutData.ownerName}
                  title={t.about.architectTitle}
                />
                {/* Thin light effects passing over the photo; the photo pixels stay untouched */}
                <div className="eb-photo-fx" aria-hidden="true">
                  <span className="eb-corner eb-tl" />
                  <span className="eb-corner eb-tr" />
                  <span className="eb-corner eb-bl" />
                  <span className="eb-corner eb-br" />
                  <span className="eb-scan" />
                  <span className="eb-sheen" />
                  <span className="eb-seam" />
                </div>
              </>
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
        <div className="ab-card ab-glass ab-water-card relative p-6 sm:p-8 border border-[#1e293b] space-y-5 hud-frame">
          <Beam />
          {/* Soft moving pool-water light and glass shine behind the text */}
          <div className="ab-water" aria-hidden="true">
            <span className="ab-water-a" />
            <span className="ab-water-b" />
            <span className="ab-water-shine" />
          </div>
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

          {/* Email and website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#1e293b]">
            <div className="space-y-1 px-4 py-3 border border-[#1e293b] bg-[#04060a]/40">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">{t.about.contactDirect}</span>
              <a href={`mailto:${aboutData.email}`} className="text-sm font-mono text-[#38e8ff] hover:underline flex items-center gap-2 break-all">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{aboutData.email}</span>
              </a>
            </div>
            <div className="space-y-1 px-4 py-3 border border-[#1e293b] bg-[#04060a]/40">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">{t.footer.liveDomainLabel}</span>
              <a
                href={`https://${aboutData.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-slate-300 hover:text-[#38e8ff] flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-[#38e8ff] shrink-0" />
                <span>{aboutData.domain}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
