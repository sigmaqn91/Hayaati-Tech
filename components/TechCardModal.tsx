'use client';

import React, { useEffect } from 'react';
import { TechCard, TimelineCard } from '@/data/future';
import { RealImageSlot } from './RealImageSlot';
import { X, Cpu, Clock, Layers, Sparkles } from 'lucide-react';

interface TechCardModalProps {
  card: TechCard | TimelineCard | null;
  onClose: () => void;
}

export function TechCardModal({ card, onClose }: TechCardModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!card) return null;

  const isTimeline = 'breakthrough' in card;
  const howItWorks = isTimeline ? (card as TimelineCard).breakthrough : (card as TechCard).howItWorks;
  const category = 'category' in card ? (card as TechCard).category : 'chronology';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-card-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-[#0b0f17] border border-[#38e8ff]/60 shadow-[0_0_30px_rgba(56,232,255,0.2)] my-8 hud-frame">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#070a0f]">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-[#38e8ff]" />
            <span className="font-mono text-xs text-[#38e8ff] uppercase tracking-widest">
              SPECIFICATION DOSSIER // {card.id.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close specification dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Real Image Slot (large resolution view) */}
          <div className="w-full">
            <RealImageSlot
              src={card.image}
              alt={card.alt}
              title={card.title}
              width={1200}
              height={650}
              sizes="(max-width: 768px) 100vw, 800px"
              className="w-full h-auto max-h-[360px] object-cover"
            />
          </div>

          {/* Meta Tags Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#070a0f] border border-[#38e8ff]/40 text-[#38e8ff] font-mono text-xs uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>HORIZON {card.era}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#070a0f] border border-[#1e293b] text-slate-300 font-mono text-xs uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>DOMAIN: {category.toUpperCase()}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 id="modal-card-title" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {card.title}
            </h3>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Architectural Overview</span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {card.description}
            </p>
          </div>

          {/* How It Could Work */}
          <div className="p-4 bg-[#070a0f] border-l-2 border-l-[#38e8ff] border-y border-r border-[#1e293b]">
            <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#38e8ff]" />
              <span>How it could work (Theoretical Mechanics)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
              {howItWorks}
            </p>
          </div>

          {/* Image Prompt Reference Display (Honest transparency per Master Spec) */}
          <div className="p-3 bg-[#05070a] border border-[#1e293b] text-[11px] font-mono text-slate-500">
            <span className="text-slate-400 block font-semibold mb-1">OPTICAL SPECIFICATION // PHOTOREALISTIC PROMPT:</span>
            <span className="italic">{card.imagePrompt}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e293b] bg-[#070a0f]">
          <div className="text-[10px] font-mono text-slate-500">
            HAYAATI // FUTURE ARCHIVE DOSSIER
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#111723] hover:bg-[#38e8ff] hover:text-[#05070a] text-slate-200 font-mono text-xs uppercase tracking-wider border border-[#1e293b] hover:border-[#38e8ff] transition-all cursor-pointer min-h-[44px]"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
