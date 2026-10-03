'use client';

import React, { useState, useMemo } from 'react';
import { techCatalogue, TechCard } from '@/data/future';
import { RealImageSlot } from './RealImageSlot';
import { TechCardModal } from './TechCardModal';
import { useLanguage } from '@/context/LanguageContext';
import { Cpu, Search, Sparkles, Filter, ArrowUpRight } from 'lucide-react';

export function TechCatalogueSection() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalCard, setActiveModalCard] = useState<TechCard | null>(null);

  const categories = [
    { id: 'all', label: t.tech.categories.all },
    { id: 'ai', label: t.tech.categories.ai },
    { id: 'vehicles', label: t.tech.categories.vehicles },
    { id: 'devices', label: t.tech.categories.devices },
    { id: 'home-work', label: t.tech.categories.homeWork },
    { id: 'health', label: t.tech.categories.health },
    { id: 'energy', label: t.tech.categories.energy },
    { id: 'space', label: t.tech.categories.space },
  ];

  const eraFilters = ['all', '2030', '2035', '2040', '2045', '2050'];

  const filteredCards = useMemo(() => {
    return techCatalogue.filter((card) => {
      const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
      const matchesEra = selectedEra === 'all' || card.era === selectedEra;
      const matchesQuery =
        searchQuery.trim() === '' ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.howItWorks.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesEra && matchesQuery;
    });
  }, [selectedCategory, selectedEra, searchQuery]);

  return (
    <section
      id="tech"
      aria-label="Future Tech Catalogue Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <Cpu className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.tech.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.tech.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.tech.subtitle}
        </p>
      </div>

      {/* Category Tabs (no page reload) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                isActive
                  ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff] shadow-[0_0_12px_rgba(56,232,255,0.2)]'
                  : 'bg-[#0b0f17] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Bar (Search + Era filter) */}
      <div className="p-4 bg-[#0b0f17] border border-[#1e293b] mb-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search paradigm, materials, or theoretical mechanisms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#05070a] border border-[#1e293b] text-white focus:outline-none focus:border-[#38e8ff] font-mono min-h-[40px]"
          />
        </div>

        {/* Era Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#38e8ff]" />
            ERA:
          </span>
          <div className="flex items-center gap-1">
            {eraFilters.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={`px-2.5 py-1.5 min-h-[36px] text-xs font-mono uppercase transition-colors border cursor-pointer ${
                  selectedEra === era
                    ? 'bg-[#38e8ff] text-[#05070a] font-bold border-[#38e8ff]'
                    : 'bg-[#070a0f] text-slate-400 border-[#1e293b] hover:text-white'
                }`}
              >
                {era === 'all' ? 'All' : era}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveModalCard(card)}
            className="group flex flex-col bg-[#0b0f17] border border-[#1e293b] hover:border-[#38e8ff]/60 transition-all duration-300 cursor-pointer hud-frame"
          >
            {/* Real Image Slot (800x500) */}
            <div className="relative">
              <RealImageSlot
                src={card.image}
                alt={card.alt}
                title={card.title}
                width={800}
                height={500}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full h-[220px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-[#05070a]/90 border border-[#1e293b] text-[10px] font-mono text-[#38e8ff]">
                HORIZON {card.era}
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#05070a]/90 border border-[#1e293b] text-[9px] font-mono text-slate-400 uppercase">
                {card.category}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-lg group-hover:text-[#38e8ff] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#38e8ff] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                  {card.description}
                </p>
              </div>

              {/* How It Could Work */}
              <div className="p-3 bg-[#070a0f] border-l-2 border-l-[#38e8ff] border-y border-r border-[#1e293b] space-y-1">
                <div className="text-[10px] font-mono text-[#38e8ff] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#38e8ff]" />
                  <span>{t.tech.howItWorksLabel}</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 line-clamp-2">
                  {card.howItWorks}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Search / Filter State */}
      {filteredCards.length === 0 && (
        <div className="p-12 text-center bg-[#0b0f17] border border-[#1e293b]">
          <p className="text-sm font-mono text-slate-400 mb-3">
            No specifications found matching the current query or filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedEra('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-[#111723] border border-[#1e293b] text-xs font-mono text-[#38e8ff] hover:bg-[#38e8ff] hover:text-[#05070a] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Detail Modal Component */}
      <TechCardModal
        card={activeModalCard}
        onClose={() => setActiveModalCard(null)}
      />
    </section>
  );
}
