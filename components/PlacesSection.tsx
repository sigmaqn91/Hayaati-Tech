'use client';

import React, { useState } from 'react';
import { placesData, PlaceCardData } from '@/data/places';
import { RealImageSlot } from './RealImageSlot';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Calendar, Layers, X, BookOpen, Compass } from 'lucide-react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import { Orbitron, JetBrains_Mono } from 'next/font/google';

// HUD fonts for the labels over the postcard images
const hudDisplay = Orbitron({ subsets: ['latin'], weight: ['600', '800'], variable: '--pc-font-display', display: 'swap' });
const hudMono = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '700'], variable: '--pc-font-mono', display: 'swap' });

interface LocalizedPlace extends PlaceCardData {
  title: string;
  location: string;
  story: string;
  infrastructureTags: string[];
  alt: string;
  prompt: string;
}

export function PlacesSection() {
  const { t, content } = useLanguage();
  const [selectedPlace, setSelectedPlace] = useState<LocalizedPlace | null>(null);

  // Back button closes the place dossier instead of leaving the site
  useOverlayHistory(!!selectedPlace, () => setSelectedPlace(null));

  return (
    <section
      id="places"
      aria-label={t.places.title}
      className="pc-section relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
      {/* Section Header */}
      <div className="relative z-[1] mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.places.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.places.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.places.subtitle}
        </p>
      </div>

      {/* 8 Postcards Grid */}
      <div className="relative z-[1] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {placesData.map((place) => {
          const placeContent = content.places[place.id] || {
            title: '',
            location: '',
            story: '',
            infrastructureTags: [],
            alt: '',
            prompt: '',
          };

          const localizedPlace: LocalizedPlace = {
            ...place,
            title: placeContent.title,
            location: placeContent.location,
            story: placeContent.story,
            infrastructureTags: placeContent.infrastructureTags,
            alt: placeContent.alt || placeContent.title,
            prompt: placeContent.prompt,
          };

          return (
            <div
              key={place.id}
              onClick={() => setSelectedPlace(localizedPlace)}
              className="pc-card group relative flex flex-col bg-[#0b0f17]/10 border border-[#1e293b] hover:border-[#38e8ff]/60 transition-all duration-300 cursor-pointer hud-frame"
            >
              {/* Real Image Slot */}
              <div className="relative">
                <RealImageSlot
                  src={place.image}
                  alt={localizedPlace.alt}
                  title={localizedPlace.title}
                  width={800}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="w-full h-[210px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className={`pc-badge ${hudDisplay.variable} ${hudMono.variable} absolute top-2 right-2 px-2.5 py-0.5 text-[10px] flex items-center gap-1.5`}>
                  <span className="pc-badge__key">{t.common.year}</span>
                  <span className="pc-badge__sep" aria-hidden="true" />
                  <span className="pc-badge__year">{place.year}</span>
                </div>
                <div className={`pc-badge ${hudDisplay.variable} ${hudMono.variable} absolute bottom-2 left-2 px-2 py-0.5 text-[10px] flex items-center gap-1.5`}>
                  <span className="pc-badge__dot w-1.5 h-1.5 rounded-full bg-[#38e8ff]" />
                  <span className="pc-badge__tag">{t.places.horizonLabel}</span>
                  <span className="pc-badge__sep" aria-hidden="true" />
                  <span className="pc-badge__text">{t.places.infrastructureLabel}</span>
                </div>
              </div>

              {/* Postcard Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-[#38e8ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-[#38e8ff]" />
                    <span className="line-clamp-1">{localizedPlace.location}</span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#38e8ff] transition-colors leading-snug">
                    {localizedPlace.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {localizedPlace.story}
                  </p>
                </div>

                {/* Infrastructure Tags Preview */}
                <div className="pt-3 border-t border-[#1e293b] flex flex-wrap gap-1.5">
                  {localizedPlace.infrastructureTags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#070a0f] border border-[#1e293b] text-[9px] font-mono text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {localizedPlace.infrastructureTags.length > 2 && (
                    <span className="text-[9px] font-mono text-[#38e8ff]/80 self-center">
                      +{localizedPlace.infrastructureTags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Place Postcard Dossier Modal */}
      {selectedPlace && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="place-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPlace(null);
          }}
        >
          <div className="relative w-full max-w-3xl bg-[#0b0f17] border border-[#38e8ff]/60 shadow-[0_0_30px_rgba(56,232,255,0.2)] my-8 hud-frame">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#070a0f]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-[#38e8ff]" />
                <span className="font-mono text-xs text-[#38e8ff] uppercase tracking-widest">
                  {t.places.horizonLabel} {'//'} {selectedPlace.id.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                aria-label={t.common.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="relative">
                <RealImageSlot
                  src={selectedPlace.image}
                  alt={selectedPlace.alt}
                  title={selectedPlace.title}
                  width={1200}
                  height={650}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="w-full h-auto max-h-[360px] object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-[#05070a]/90 border border-[#38e8ff]/40 text-[11px] font-mono text-[#38e8ff] flex items-center gap-1.5 backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38e8ff] animate-pulse" />
                  <span>{t.places.horizonLabel} {'//'} {t.places.infrastructureLabel}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#070a0f] border border-[#38e8ff]/40 text-[#38e8ff] font-mono text-xs uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.places.horizonLabel} {selectedPlace.year}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#070a0f] border border-[#1e293b] text-slate-300 font-mono text-xs uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedPlace.location}</span>
                </div>
              </div>

              <div>
                <h3 id="place-modal-title" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedPlace.title}
                </h3>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.places.aDayInPlace}</span>
                </div>
                <div className="p-5 bg-[#070a0f] border-l-2 border-l-[#38e8ff] border-y border-r border-[#1e293b] text-sm text-slate-200 leading-relaxed font-sans">
                  &quot;{selectedPlace.story}&quot;
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.places.infrastructureLabel}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPlace.infrastructureTags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#070a0f] border border-[#1e293b] text-xs font-mono text-slate-300 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38e8ff]" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlace.prompt ? (
                <div className="p-3 bg-[#05070a] border border-[#1e293b] text-[11px] font-mono text-slate-500">
                  <span className="text-slate-400 block font-semibold mb-1 uppercase">
                    {t.places.infrastructureLabel} {'//'} {t.places.promptLabel}:
                  </span>
                  <span className="italic">{selectedPlace.prompt}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e293b] bg-[#070a0f]">
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                HAYAATI {'//'} {t.places.viewLocation}
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-5 py-2 bg-[#111723] hover:bg-[#38e8ff] hover:text-[#05070a] text-slate-200 font-mono text-xs uppercase tracking-wider border border-[#1e293b] hover:border-[#38e8ff] transition-all cursor-pointer min-h-[44px]"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
