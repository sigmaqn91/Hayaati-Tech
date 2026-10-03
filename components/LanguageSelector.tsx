'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/locales/types';
import { Globe, X, Search, Check, AlertCircle } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filtered = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select international language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] text-xs font-mono text-slate-300 hover:text-[#38e8ff] bg-[#080b11] border border-[#1e293b] hover:border-[#38e8ff]/50 transition-colors cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-[#38e8ff]" />
        <span className="uppercase">{currentLangObj.code}</span>
        <span className="hidden sm:inline text-slate-400">({currentLangObj.native})</span>
      </button>

      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div className="w-full max-w-lg bg-[#0b0f17] border border-[#38e8ff]/40 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#070a0f]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#38e8ff]" />
                <span className="text-sm font-mono tracking-wider text-slate-100 uppercase">
                  {t.nav.language} Selector (24 Languages)
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Close language selector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Honest Review Notice */}
            <div className="p-4 bg-[#080b11] border-b border-[#1e293b] text-xs text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#ffb020] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-medium block">
                  Linguistic Integrity Disclosure:
                </span>
                English is the authored primary text. Non-English translations are generated computationally and are pending certified human linguistic review. RTL formatting is enabled for Urdu and Arabic.
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[#1e293b] bg-[#070a0f]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter language (e.g. Hindi, Français, 日本語)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#05070a] border border-[#1e293b] text-white focus:outline-none focus:border-[#38e8ff] font-mono"
                  autoFocus
                />
              </div>
            </div>

            {/* Language Grid */}
            <div className="p-4 max-h-[340px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filtered.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code as SupportedLanguage);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-left min-h-[44px] text-xs border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff]'
                        : 'bg-[#080b11] border-[#1e293b] text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{item.native}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.name} {item.rtl ? '(RTL)' : ''}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#38e8ff]" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#1e293b] bg-[#070a0f] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-mono bg-[#111723] text-slate-300 hover:text-white border border-[#1e293b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
