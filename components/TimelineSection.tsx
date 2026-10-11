'use client';

import React, { useEffect, useState } from 'react';
import { timelineEras, TimelineCardData } from '@/data/future';
import { RealImageSlot } from './RealImageSlot';
import { TechCardModal } from './TechCardModal';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Calendar, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { Beam } from '@/components/Beam';

export function TimelineSection() {
  const { t, content } = useLanguage();
  const [selectedEraIndex, setSelectedEraIndex] = useState(0);
  const [activeModalCard, setActiveModalCard] = useState<TimelineCardData | null>(null);

  // Jarvis website actions (same as tapping an era button or a card)
  useEffect(() => {
    const onEra = (e: Event) => {
      const era = (e as CustomEvent<{ era?: string }>).detail?.era;
      const index = timelineEras.findIndex((x) => x.era === era);
      if (index >= 0) setSelectedEraIndex(index);
    };
    const onCard = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string; kind?: string }>).detail;
      if (detail?.kind !== 'timeline') return;
      const index = timelineEras.findIndex((x) => x.cards.some((c) => c.id === detail.id));
      if (index < 0) return;
      setSelectedEraIndex(index);
      setActiveModalCard(timelineEras[index].cards.find((c) => c.id === detail.id) || null);
    };
    const onClose = () => setActiveModalCard(null);
    window.addEventListener('jarvis:show-era', onEra);
    window.addEventListener('jarvis:open-card', onCard);
    window.addEventListener('jarvis:close-popups', onClose);
    return () => {
      window.removeEventListener('jarvis:show-era', onEra);
      window.removeEventListener('jarvis:open-card', onCard);
      window.removeEventListener('jarvis:close-popups', onClose);
    };
  }, []);

  const currentEra = timelineEras[selectedEraIndex];
  const eraContent = content.eras[currentEra.id] || {
    title: '',
    yearLabel: `ERA // ${currentEra.year}`,
    story: '',
    breakthroughs: [],
    bannerAlt: '',
    bannerPrompt: '',
  };

  return (
    <section
      id="timeline"
      aria-label={t.timeline.title}
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
      {/* Section Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <Clock className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.timeline.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.timeline.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.timeline.subtitle}
        </p>
      </div>

      {/* Era Navigation Selector (2030 -> 2035 -> 2050) */}
      <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-[#1e293b]">
        {timelineEras.map((era, index) => {
          const isActive = index === selectedEraIndex;
          const localizedTitle = content.eras[era.id]?.title || '';
          const localizedYearLabel = content.eras[era.id]?.yearLabel || `ERA // ${era.year}`;
          return (
            <button
              key={era.id}
              onClick={() => setSelectedEraIndex(index)}
              className={`flex items-center gap-2.5 px-5 py-3 min-h-[44px] font-mono text-xs uppercase tracking-wider transition-all border cursor-pointer ${
                isActive
                  ? 'eb-tab-active bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff] shadow-[0_0_12px_rgba(56,232,255,0.2)]'
                  : 'bg-[#0b0f17] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-bold">{localizedYearLabel}</span>
              {localizedTitle ? (
                <span className="hidden sm:inline text-slate-400 text-[11px]"> — {localizedTitle}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Selected Era Main Display Container */}
      <div className="space-y-12">
        {/* Panoramic Banner (Era Banner luxury animation: halo, dual border light, photo HUD, live glass text area) */}
        <div className="eb-stage">
        <div className="eb-aura" aria-hidden="true"><Beam /></div>
        <div className="relative overflow-hidden bg-[#0b0f17] border border-[#1e293b] hud-frame ms-card eb-card">
          <Beam />
          <div className="eb-photo">
          <RealImageSlot
            src={currentEra.bannerImage}
            alt={eraContent.bannerAlt || eraContent.title}
            title={`${eraContent.yearLabel} — ${eraContent.title}`}
            width={1600}
            height={700}
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="w-full h-[280px] sm:h-[380px] md:h-[460px] object-cover"
            original
          />
            {/* Thin HUD effects at the photo edges; the photo stays fully visible */}
            <div className="eb-photo-fx" aria-hidden="true">
              <span className="eb-corner eb-tl" />
              <span className="eb-corner eb-tr" />
              <span className="eb-corner eb-bl" />
              <span className="eb-corner eb-br" />
              <span className="eb-scan" />
              <span className="eb-sheen" />
              <span className="eb-seam" />
            </div>
          </div>

          {/* Banner HUD Info Overlay */}
          <div className="ms-body eb-body p-6 md:p-8 bg-[#0b0f17] border-t border-[#1e293b]">
            {/* Moving high-tech background inside the banner text area, under dark glass (richer than the cards) */}
            <div className="ms-body-bg" aria-hidden="true">
              <span className="ms-b-aurora" />
              <span className="ms-b-grid" />
              <span className="ms-b-streak" />
              <span className="ms-b-streak" />
              <span className="eb-b-aurora2" />
              <span className="eb-b-streak3" />
              <span className="eb-b-dust" />
              <span className="eb-b-radar" />
              <span className="eb-b-wave" />
              <span className="ms-b-glass" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#38e8ff]" />
                <span className="font-mono text-xs text-[#38e8ff] uppercase tracking-widest font-bold">
                  {eraContent.yearLabel} — {t.timeline.chronoMap}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-500">
                {t.timeline.statusPrefix}: {currentEra.id.toUpperCase()}
              </div>
            </div>

            <h3 className="eb-title text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              {eraContent.title}
            </h3>

            {/* Story & Breakthroughs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#1e293b]">
              {/* "A Day in This Era" Story */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-[#38e8ff] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.timeline.storyTitle}</span>
                </div>
                <div className="eb-panel p-5 bg-[#070a0f] border-l-2 border-l-[#38e8ff] border-y border-r border-[#1e293b] text-sm text-slate-300 leading-relaxed font-sans">
                  &quot;{eraContent.story}&quot;
                </div>
              </div>

              {/* Key Breakthroughs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-[#38e8ff] uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t.timeline.breakthroughsTitle}</span>
                </div>
                <ul className="space-y-2.5">
                  {eraContent.breakthroughs.map((breakthrough, idx) => (
                    <li
                      key={idx}
                      className="eb-panel eb-item p-3 bg-[#070a0f] border border-[#1e293b] text-xs font-mono text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38e8ff] mt-1.5 shrink-0" />
                      <span>{breakthrough}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* 4 Breakthrough Cards Grid for Current Era */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-[#38e8ff]" />
              {t.timeline.breakthroughsTitle} — {eraContent.yearLabel}
            </h4>
            <span className="text-xs font-mono text-slate-500">
              {currentEra.cards.length} {t.timeline.specificationsCount}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {currentEra.cards.map((card) => {
              const cardContent = content.timelineCards[card.id] || {
                title: '',
                description: '',
                breakthrough: '',
                alt: '',
                prompt: '',
              };

              return (
                <div
                  key={card.id}
                  onClick={() => setActiveModalCard(card)}
                  className="group flex flex-col bg-[#0b0f17] border border-[#1e293b] hover:border-[#38e8ff]/60 transition-all duration-300 cursor-pointer hud-frame ms-card ab-card"
                >
                  <Beam />
                  {/* Card Image Slot */}
                  <div className="relative">
                    <RealImageSlot
                      src={card.image}
                      alt={cardContent.alt || cardContent.title}
                      title={cardContent.title}
                      width={800}
                      height={500}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="w-full h-[200px] lg:h-auto lg:!aspect-[227/100] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#05070a]/90 border border-[#1e293b] text-[10px] font-mono text-[#38e8ff]">
                      {card.year}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="ms-body p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Moving high-tech background inside the card, under dark glass (About-section style) */}
                    <div className="ms-body-bg" aria-hidden="true">
                      <span className="ms-b-aurora" />
                      <span className="ms-b-grid" />
                      <span className="ms-b-streak" />
                      <span className="ms-b-streak" />
                      <span className="ms-b-glass" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-bold text-white text-base group-hover:text-[#38e8ff] transition-colors leading-snug">
                        {cardContent.title}
                      </h5>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {cardContent.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-[11px] font-mono text-slate-500 group-hover:text-[#38e8ff]">
                      <span>{t.tech.viewDossier}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal Component */}
      <TechCardModal
        card={activeModalCard}
        onClose={() => setActiveModalCard(null)}
      />
    </section>
  );
}
