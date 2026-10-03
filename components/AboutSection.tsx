'use client';

import React from 'react';
import Image from 'next/image';
import { aboutData } from '@/data/about';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Globe, Shield, Terminal } from 'lucide-react';

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      aria-label="About Architect Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Optional Owner Photo Slot (Per Section 3: replaceable, never fake or AI generate her photo) */}
        <div className="lg:col-span-4">
          <div className="relative overflow-hidden bg-[#0b0f17] border border-[#1e293b] aspect-square flex flex-col items-center justify-center p-6 text-center hud-frame">
            {aboutData.photoUrl ? (
              <Image
                src={aboutData.photoUrl}
                alt="Aliya Khan, Founder of Hayaati Web Technology"
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover"
              />
            ) : (
              /* Honest Placeholder when photo is pending release from Aliya */
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#070a0f] border border-[#38e8ff]/40 flex items-center justify-center text-[#38e8ff] mx-auto">
                  <User className="w-8 h-8 text-[#38e8ff]" />
                </div>
                <div className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                  {aboutData.ownerName}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {aboutData.role}
                </div>
                <div className="pt-2 text-[10px] font-mono text-slate-600 border-t border-[#1e293b]">
                  PORTRAIT SLOT: Awaiting official photo upload by Aliya Khan to /public/images/about/
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio & Dossier Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 bg-[#0b0f17] border border-[#1e293b] space-y-6 hud-frame">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#38e8ff]" />
                <span className="font-mono text-xs text-[#38e8ff] uppercase tracking-wider font-bold">
                  FOUNDER DOSSIER // ARCHITECT PROFILE
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                STATUS: ACTIVE
              </span>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {aboutData.bio ? (
                <p>{aboutData.bio}</p>
              ) : (
                /* Honest Pending Bio Notice */
                <div className="p-5 bg-[#070a0f] border-l-2 border-l-[#38e8ff] border-y border-r border-[#1e293b] text-xs font-mono text-slate-300 space-y-3">
                  <div className="text-white font-bold uppercase tracking-wider">
                    Official Biography Statement:
                  </div>
                  <p className="leading-relaxed">
                    {t.about.bioPlaceholder}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-[#1e293b] flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#38e8ff]" />
                    <span>Per Master Specification: No fictional background, fabricated credentials, or AI-generated bio are permitted.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Contact Matrix */}
            <div className="pt-6 border-t border-[#1e293b] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#070a0f] border border-[#1e293b] space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Official Communication Channel
                </span>
                <a
                  href={`mailto:${aboutData.email}`}
                  className="text-xs font-mono text-[#38e8ff] hover:underline flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{aboutData.email}</span>
                </a>
              </div>

              <div className="p-4 bg-[#070a0f] border border-[#1e293b] space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  Live Web Production Domain
                </span>
                <a
                  href={`https://${aboutData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-slate-300 hover:text-[#38e8ff] flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-[#38e8ff]" />
                  <span>{aboutData.domain}</span>
                </a>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-600 flex items-center gap-2">
              <Terminal className="w-3 h-3 text-slate-600" />
              <span>EDITABLE ARCHIVE // DATA SOURCE: data/about.ts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
