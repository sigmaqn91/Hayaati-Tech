'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { loadLanguageBundle } from '@/locales';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/locales/types';
import { Globe, X, Search, Check } from 'lucide-react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import { Beam } from '@/components/Beam';

export function LanguageSelector() {
  const { language, setLanguage, languages, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  // The picked language is applied right after the sheet has closed, so the closing animation never
  // competes with the whole page re-rendering in the new language.
  const pendingLangRef = useRef<SupportedLanguage | null>(null);

  const handleOpen = () => {
    setIsDesktop(window.matchMedia('(min-width: 640px)').matches);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Back button closes only this popup
  useOverlayHistory(isOpen, handleClose);

  // Manage body scroll lock and initial non-autofocus focus
  useEffect(() => {
    if (!isOpen) return;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    // Freeze the animated hero canvases behind the popup (they are hidden by the dark layer anyway).
    document.documentElement.classList.add('bg-paused');
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.documentElement.classList.remove('bg-paused');
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

  // GPU-only motion (transform + opacity). No blur filters: they made the popup heavy on phones.
  const panelInitial = reduceMotion
    ? { opacity: 0 }
    : isDesktop
    ? { opacity: 0, scale: 0.94, y: 14 }
    : { y: '100%', opacity: 1 };
  const panelAnimate = isDesktop || reduceMotion
    ? { opacity: 1, scale: 1, y: 0 }
    : { y: 0, opacity: 1 };
  const panelExit = reduceMotion
    ? { opacity: 0 }
    : isDesktop
    ? { opacity: 0, scale: 0.97, y: 8 }
    : { y: '100%', opacity: 1 };
  const panelTransition = isDesktop
    ? { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

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
        <Beam />
        <span className="lang-btn__sheen" aria-hidden="true" />
        <Globe className="lang-btn__globe w-3.5 h-3.5 text-[#38e8ff]" />
        <span className="uppercase" suppressHydrationWarning>{currentLangObj.code}</span>
        <span className="hidden sm:inline text-slate-400" suppressHydrationWarning>({currentLangObj.native})</span>
      </button>

      <AnimatePresence
        onExitComplete={() => {
          triggerButtonRef.current?.focus({ preventScroll: true });
          const next = pendingLangRef.current;
          pendingLangRef.current = null;
          if (next && next !== language) setLanguage(next);
        }}
      >
        {isOpen && (
          <motion.div
            key="lang-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t.languageSelector.dialogTitle}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#02040a]/[0.86]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              ref={modalContainerRef}
              className="relative w-full sm:max-w-xl flex flex-col max-h-[88dvh] sm:max-h-[80dvh]"
              initial={panelInitial}
              animate={panelAnimate}
              exit={panelExit}
              transition={panelTransition}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', willChange: 'transform, opacity' }}
            >
              <span className="hx-glow" aria-hidden="true" />
              <div className="hx-frame hx-frame--sheet flex flex-col min-h-0 flex-1">
                <div className="hx-body flex flex-col min-h-0 flex-1">
                  {/* Mobile sheet grabber */}
                  <div className="sm:hidden flex justify-center pt-2.5" aria-hidden="true">
                    <span className="h-1 w-10 rounded-full bg-[#38e8ff]/35" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 px-5 pt-3 sm:pt-4 pb-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#38e8ff]/40 bg-[#38e8ff]/10 shadow-[0_0_16px_rgba(56,232,255,0.25)]">
                        <Globe className="w-5 h-5 text-[#38e8ff]" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-sm font-mono tracking-wider text-slate-100 uppercase break-words leading-tight">
                          {t.languageSelector.dialogTitle}
                        </h2>
                        <p className="mt-0.5 text-[11px] font-mono text-[#38e8ff]/80">
                          {languages.length} {t.languageSelector.languagesCountSuffix}
                        </p>
                      </div>
                    </div>
                    <button
                      ref={closeButtonRef}
                      onClick={handleClose}
                      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg border border-transparent hover:border-[#38e8ff]/40 hover:bg-[#38e8ff]/10 transition-colors cursor-pointer shrink-0"
                      aria-label={t.common.close}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="px-4 sm:px-5 pb-3 shrink-0">
                    <div className="relative group">
                      <span className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-[#38e8ff]/0 via-[#38e8ff]/0 to-[#c084fc]/0 opacity-0 group-focus-within:opacity-100 group-focus-within:from-[#38e8ff]/60 group-focus-within:via-[#818cf8]/50 group-focus-within:to-[#c084fc]/60 blur-[2px] transition-opacity" aria-hidden="true" />
                      <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#38e8ff]/70 pointer-events-none z-10" />
                      <input
                        type="text"
                        placeholder={t.languageSelector.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ fontSize: '16px' }}
                        className="relative w-full ps-10 pe-4 py-3 text-base bg-[#05080f] border border-[#38e8ff]/25 focus:border-[#38e8ff]/70 text-white placeholder-slate-500 focus:outline-none font-mono rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Language Grid */}
                  <div
                    className="px-4 sm:px-5 pb-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 min-h-0 content-start"
                    style={{ overscrollBehavior: 'contain' }}
                  >
                    {filtered.map((item, i) => {
                      const isSelected = item.code === language;
                      return (
                        <button
                          key={item.code}
                          style={{ animationDelay: `${Math.min(i, 14) * 10 + 40}ms` }}
                          onPointerDown={() => {
                            loadLanguageBundle(item.code as SupportedLanguage).catch(() => {});
                          }}
                          onClick={() => {
                            loadLanguageBundle(item.code as SupportedLanguage).catch(() => {});
                            pendingLangRef.current = item.code as SupportedLanguage;
                            handleClose();
                          }}
                          aria-pressed={isSelected}
                          className={`lang-card relative flex items-center justify-between gap-2 px-3 py-2.5 text-start min-h-[52px] rounded-lg border transition-colors cursor-pointer overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#38e8ff]/20 via-[#818cf8]/10 to-transparent border-[#38e8ff] text-[#38e8ff] shadow-[0_0_18px_rgba(56,232,255,0.35),inset_0_0_14px_rgba(56,232,255,0.12)]'
                              : 'bg-[#080c14]/80 border-[#38e8ff]/10 text-slate-300 hover:border-[#38e8ff]/50 hover:bg-[#38e8ff]/[0.07] hover:text-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-sm leading-tight break-words">{item.native}</div>
                            <div className="mt-0.5 text-[10px] text-slate-500 font-mono break-words">
                              {item.name} {item.rtl ? '(RTL)' : ''}
                            </div>
                          </div>
                          {isSelected && (
                            <motion.span
                              initial={reduceMotion ? false : { scale: 0, rotate: -40 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#38e8ff] text-[#05070a] shadow-[0_0_10px_#38e8ff]"
                            >
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </motion.span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-4 sm:px-5 py-3 border-t border-[#38e8ff]/15 flex justify-end shrink-0">
                    <button
                      onClick={handleClose}
                      className="px-5 py-2 text-xs font-mono rounded-lg bg-[#0e1522] text-slate-300 hover:text-white border border-[#38e8ff]/25 hover:border-[#38e8ff]/60 min-h-[44px] cursor-pointer transition-colors"
                    >
                      {t.common.close}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
