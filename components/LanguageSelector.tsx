'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/locales/types';
import { Globe, X, Search, Check } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      triggerButtonRef.current?.focus();
    }, 220);
  }, []);

  // Manage body scroll lock and initial non-autofocus focus
  useEffect(() => {
    if (!isOpen) return;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Keyboard navigation & Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab' && modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

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
        ref={triggerButtonRef}
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t.languageSelector.selectLanguage}
        suppressHydrationWarning
        className="lang-btn flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] text-xs font-mono text-slate-100 hover:text-white bg-[#08141c] border border-[#38e8ff]/55 hover:border-[#38e8ff] cursor-pointer"
      >
        <Globe className="lang-btn__globe w-3.5 h-3.5 text-[#38e8ff]" />
        <span className="uppercase" suppressHydrationWarning>{currentLangObj.code}</span>
        <span className="hidden sm:inline text-slate-400" suppressHydrationWarning>({currentLangObj.native})</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.languageSelector.dialogTitle}
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 transition-opacity duration-200 ${
            !isClosing ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={modalContainerRef}
            className={`w-full sm:max-w-lg bg-[#0b0f17] border border-[#38e8ff]/40 shadow-2xl relative flex flex-col max-h-[85vh] sm:max-h-[80vh] rounded-t-xl sm:rounded-none transition-all duration-200 ease-out transform ${
              !isClosing
                ? 'translate-y-0 scale-100 opacity-100'
                : 'translate-y-8 sm:translate-y-0 sm:scale-95 opacity-0'
            }`}
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#070a0f] shrink-0">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#38e8ff]" />
                <h2 className="text-sm font-mono tracking-wider text-slate-100 uppercase">
                  {t.languageSelector.dialogTitle} ({languages.length} {t.languageSelector.languagesCountSuffix})
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3.5 sm:p-4 border-b border-[#1e293b] bg-[#070a0f] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.languageSelector.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-4 py-2.5 text-base sm:text-sm bg-[#05070a] border border-[#1e293b] text-white focus:outline-none focus:border-[#38e8ff] font-mono rounded-none"
                />
              </div>
            </div>

            {/* Language Grid */}
            <div
              className="p-3.5 sm:p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1"
              style={{ overscrollBehavior: 'contain' }}
            >
              {filtered.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code as SupportedLanguage);
                      handleClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-left min-h-[44px] text-xs border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff]'
                        : 'bg-[#080b11] border-[#1e293b] text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs sm:text-sm">{item.native}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.name} {item.rtl ? '(RTL)' : ''}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#38e8ff] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#1e293b] bg-[#070a0f] flex justify-end shrink-0">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-xs font-mono bg-[#111723] text-slate-300 hover:text-white border border-[#1e293b] min-h-[44px] cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
