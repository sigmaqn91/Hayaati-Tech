'use client';

import React, { useEffect, useState } from 'react';
import { TechCardData, TimelineCardData } from '@/data/future';
import { RealImageSlot } from './RealImageSlot';
import { useLanguage } from '@/context/LanguageContext';
import { X, Cpu, Clock, Layers, Sparkles } from 'lucide-react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';

interface TechCardModalProps {
  card: TechCardData | TimelineCardData | null;
  onClose: () => void;
}

export function TechCardModal({ card: openCard, onClose }: TechCardModalProps) {
  const { t, content } = useLanguage();
  // The popup opens large with a soft zoom and, when closed, fades out before it leaves (GPU-only animation).
  const [card, setCard] = useState(openCard);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (openCard) {
      setCard(openCard);
      setClosing(false);
      return;
    }
    setClosing(true);
    const id = window.setTimeout(() => {
      setCard(null);
      setClosing(false);
    }, 180);
    return () => window.clearTimeout(id);
  }, [openCard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Back button closes this modal instead of leaving the site
  useOverlayHistory(!!openCard, onClose);

  if (!card) return null;

  const isTimeline = card.id.startsWith('tl-');
  const localizedTimeline = isTimeline ? content.timelineCards?.[card.id] : null;
  const localizedTech = !isTimeline ? content.techCards?.[card.id] : null;

  const displayTitle = localizedTimeline?.title || localizedTech?.title || '';
  const displayDescription = localizedTimeline?.description || localizedTech?.description || '';
  const displayHowItWorks = localizedTimeline?.breakthrough || localizedTech?.howItWorks || '';
  const displayAlt = localizedTimeline?.alt || localizedTech?.alt || displayTitle;
  const displayPrompt = localizedTimeline?.prompt || localizedTech?.prompt || '';

  const categoryKey = !isTimeline && 'category' in card ? (card as TechCardData).category : 'ai';
  const categoryLabel = t.tech.categories[categoryKey] || categoryKey;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-card-title"
      data-closing={closing ? '' : undefined}
      className="tcm-backdrop fixed inset-0 z-50 flex p-4 bg-black/85 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Keyed by card: when Jarvis moves to the next card the popup switches straight to it with a quick pop */}
      <div key={card.id} className="tcm-panel relative w-full max-w-3xl bg-[#0b0f17] border border-[#38e8ff]/60 shadow-[0_0_30px_rgba(56,232,255,0.2)] m-auto hud-frame">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#070a0f]">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-[#38e8ff]" />
            <span className="font-mono text-xs text-[#38e8ff] uppercase tracking-widest">
              {t.tech.systemsIndex} {'//'} {card.id.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={t.tech.modalClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Real Image Slot */}
          <div className="w-full">
            <RealImageSlot
              src={card.image}
              alt={displayAlt}
              title={displayTitle}
              width={1200}
              height={650}
              // Loads at once (no lazy wait): the same file is usually already in the cache from the card grid,
              // so the popup opens with its photo instead of an empty frame.
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="w-full h-auto max-h-[360px] object-cover"
            />
          </div>

          {/* Meta Tags Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#070a0f] border border-[#38e8ff]/40 text-[#38e8ff] font-mono text-xs uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.places.horizonLabel} {card.era}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#070a0f] border border-[#1e293b] text-slate-300 font-mono text-xs uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.advertise.form.category}: {categoryLabel}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 id="modal-card-title" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {displayTitle}
            </h3>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.tech.architectureMechanics}</span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {displayDescription}
            </p>
          </div>

          {/* How It Could Work */}
          <div className="p-4 bg-[#070a0f] border-l-2 border-l-[#38e8ff] border-y border-r border-[#1e293b]">
            <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#38e8ff]" />
              <span>{t.tech.howItWorksLabel} ({t.tech.underlyingMechanism})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
              {displayHowItWorks}
            </p>
          </div>

          {/* Image Prompt Reference Display */}
          {displayPrompt ? (
            <div className="p-3 bg-[#05070a] border border-[#1e293b] text-[11px] font-mono text-slate-500">
              <span className="text-slate-400 block font-semibold mb-1 uppercase">
                {t.tech.architectureMechanics} {'//'} {t.tech.promptLabel}:
              </span>
              <span className="italic">{displayPrompt}</span>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e293b] bg-[#070a0f]">
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            HAYAATI {'//'} {t.tech.viewDossier}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#111723] hover:bg-[#38e8ff] hover:text-[#05070a] text-slate-200 font-mono text-xs uppercase tracking-wider border border-[#1e293b] hover:border-[#38e8ff] transition-all cursor-pointer min-h-[44px]"
          >
            {t.tech.modalClose}
          </button>
        </div>
      </div>
    </div>
  );
}
