'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { RatingButton } from './rating/RatingButton';
import { Home, Clock, Cpu, MapPin, Layers, Megaphone, User, Mail, ChevronRight, Sliders } from 'lucide-react';
import { isOwnerUi, openAdminControl, OWNER_EVENT } from '@/lib/ownerState';
import { useOverlayHistory, runWhenHistoryIdle } from '@/hooks/use-overlay-history';

const MENU_ICONS = [Home, Clock, Cpu, MapPin, Layers, Megaphone, User, Mail];

export function Navbar() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#hero');
  const [menuActive, setMenuActive] = useState('#hero');
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  // Owner verified (Jarvis owner code): the menu also shows "Admin Control"
  const [owner, setOwner] = useState(false);
  const [adminPending, setAdminPending] = useState(false);

  useEffect(() => {
    setOwner(isOwnerUi());
    const onOwner = (e: Event) => setOwner(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener(OWNER_EVENT, onOwner);
    return () => window.removeEventListener(OWNER_EVENT, onOwner);
  }, []);

  // Open Admin Control after the menu has closed (its history entry is removed first)
  useEffect(() => {
    if (mobileMenuOpen || !adminPending) return;
    setAdminPending(false);
    runWhenHistoryIdle(() => openAdminControl());
  }, [mobileMenuOpen, adminPending]);

  // Back button closes the menu instead of leaving the site
  useOverlayHistory(mobileMenuOpen, () => setMobileMenuOpen(false));

  // Light scroll-spy for the 4 centre links (underline follows the section in view)
  useEffect(() => {
    const ids = ['hero', 'projects', 'about', 'contact'];
    let raf = 0;
    const measure = () => {
      raf = 0;
      let current = 'hero';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveHref(`#${current}`);
    };
    // At most one measurement per frame (scroll events can fire many times per frame)
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Which of the 8 sections is in view (only computed while the menu is open)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const ids = ['hero', 'timeline', 'tech', 'places', 'projects', 'advertise', 'about', 'contact'];
    let current = 'hero';
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    }
    setMenuActive(`#${current}`);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // After the menu is closed (and its history entry removed) scroll to the chosen section
  useEffect(() => {
    if (mobileMenuOpen || !pendingHref) return;
    const href = pendingHref;
    setPendingHref(null);
    runWhenHistoryIdle(() => {
      const el = document.getElementById(href.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        try {
          window.history.replaceState(window.history.state, '', href);
        } catch {
          /* ignore */
        }
      } else {
        window.location.hash = href;
      }
    });
  }, [mobileMenuOpen, pendingHref, reduceMotion]);

  const navLinks = [
    { href: '#hero', label: t.nav.home },
    { href: '#timeline', label: t.nav.timeline },
    { href: '#tech', label: t.nav.tech },
    { href: '#places', label: t.nav.places },
    { href: '#projects', label: t.nav.projects },
    { href: '#advertise', label: t.nav.advertise },
    { href: '#about', label: t.nav.about },
    { href: '#contact', label: t.nav.contact },
  ];

  // Centre links on desktop (all 8 stay reachable through the hamburger menu)
  const mainLinks = [
    { href: '#hero', label: t.nav.home },
    { href: '#about', label: t.nav.about },
    { href: '#projects', label: t.nav.projects },
    { href: '#contact', label: t.nav.contact },
  ];

  const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.045, delayChildren: reduceMotion ? 0 : 0.12 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: reduceMotion ? 0 : -14 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 32 } },
    exit: { opacity: 0, x: reduceMotion ? 0 : -8, transition: { duration: 0.12 } },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#05070a] border-b border-[#38e8ff]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-1 focus:ring-[#38e8ff]"
        >
          <div className="w-9 h-9 rounded-md bg-[#0b0f17] border border-[#38e8ff]/60 flex items-center justify-center shadow-[0_0_12px_rgba(56,232,255,0.3)] shrink-0">
            <span className="relative w-5 h-5 rounded-full border-[3px] border-[#38e8ff] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38e8ff]" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold tracking-wider text-slate-100 group-hover:text-[#38e8ff] transition-colors uppercase">
              HAYAATI WEB
            </span>
            <span className="font-mono text-[9px] text-[#38e8ff]/70 tracking-widest -mt-0.5">
              {t.nav.brandSubtitle}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links (4 main links) */}
        <nav
          aria-label={t.nav.home}
          className="hidden lg:flex items-center gap-1 xl:gap-3 rtl:space-x-reverse"
        >
          {mainLinks.map((link) => {
            const active = activeHref === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative px-2.5 xl:px-4 py-2 text-[11px] xl:text-xs font-mono uppercase tracking-wider transition-colors min-h-[44px] flex items-center ${
                  active ? 'text-white' : 'text-slate-300 hover:text-[#38e8ff]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-2 xl:inset-x-3 bottom-1 h-[2px] bg-[#38e8ff] shadow-[0_0_8px_#38e8ff] transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                />
              </a>
            );
          })}
        </nav>

        {/* Right Action Bar (Language + Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <RatingButton />
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#38e8ff] hover:text-white bg-[#0b0f17] border border-[#38e8ff]/50 rounded-md shadow-[0_0_10px_rgba(56,232,255,0.2)]"
            aria-label={mobileMenuOpen ? t.nav.close : t.nav.menu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-panel"
          >
            {/* Three lines that morph into an X */}
            <span className="relative block w-5 h-4" aria-hidden="true">
              <motion.span
                className="absolute left-0 top-0 h-0.5 w-full rounded bg-current"
                animate={mobileMenuOpen ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
              <motion.span
                className="absolute left-0 top-[7px] h-0.5 w-full rounded bg-current"
                animate={mobileMenuOpen ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.18 }}
              />
              <motion.span
                className="absolute left-0 top-[14px] h-0.5 w-full rounded bg-current"
                animate={mobileMenuOpen ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Compact HUD menu panel (anchored under the navbar, page dimmed behind) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="menu-backdrop"
              className="fixed inset-x-0 bottom-0 top-16 z-[45] bg-[#02040a]/65 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="menu-panel"
              id="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.menu}
              className="fixed top-[4.25rem] inset-x-3 sm:inset-x-auto sm:end-4 sm:w-[23rem] z-50 max-h-[calc(100dvh-5.5rem)]"
              style={{ transformOrigin: 'top center' }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18, scaleY: 0.9, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scaleY: 1, filter: 'blur(0px)' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scaleY: 0.94, filter: 'blur(6px)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.9 }}
            >
              <div className="relative">
                <span className="hx-glow" aria-hidden="true" />
                <div className="hx-frame">
                  <div className="hx-body p-3.5 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#38e8ff] tracking-widest mb-2.5 pb-2 border-b border-[#38e8ff]/15">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#38e8ff] opacity-70 animate-ping motion-reduce:animate-none" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#38e8ff]" />
                      </span>
                      <span className="min-w-0 break-words">
                        {t.footer.quickLinks} {'//'} {t.nav.menuSysHeader}
                      </span>
                    </div>

                    <motion.nav
                      aria-label={t.nav.menu}
                      className="flex flex-col gap-1"
                      variants={listVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      {navLinks.map((link, i) => {
                        const Icon = MENU_ICONS[i];
                        const active = menuActive === link.href;
                        return (
                          <motion.a
                            key={link.href}
                            href={link.href}
                            variants={itemVariants}
                            aria-current={active ? 'true' : undefined}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.preventDefault();
                              setPendingHref(link.href);
                              setMobileMenuOpen(false);
                            }}
                            className={`group relative flex items-center gap-3 px-3 min-h-[44px] font-mono text-[13px] border transition-colors ${
                              active
                                ? 'text-white border-[#38e8ff]/50 bg-gradient-to-r from-[#38e8ff]/15 via-[#818cf8]/10 to-transparent rtl:bg-gradient-to-l'
                                : 'text-slate-300 border-transparent hover:text-[#38e8ff] hover:border-[#38e8ff]/30 hover:bg-[#38e8ff]/[0.06]'
                            }`}
                          >
                            <span
                              className={`absolute start-0 top-1.5 bottom-1.5 w-[2px] rounded-full transition-opacity ${
                                active ? 'bg-[#38e8ff] shadow-[0_0_8px_#38e8ff] opacity-100' : 'bg-[#38e8ff] opacity-0 group-hover:opacity-60'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="text-[10px] tabular-nums text-[#38e8ff]/60 w-5 shrink-0" aria-hidden="true">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#38e8ff]' : 'text-slate-400 group-hover:text-[#38e8ff]'}`} aria-hidden="true" />
                            <span className="flex-1 min-w-0 break-words leading-tight">{link.label}</span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 rtl:-scale-x-100 transition-all ${
                                active ? 'text-[#38e8ff] opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                              }`}
                              aria-hidden="true"
                            />
                          </motion.a>
                        );
                      })}
                    </motion.nav>

                    {owner && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminPending(true);
                          setMobileMenuOpen(false);
                        }}
                        className="group mt-2 w-full relative flex items-center gap-3 px-3 min-h-[44px] font-mono text-[13px] border border-[#ffaa00]/40 bg-gradient-to-r from-[#ffaa00]/12 via-[#ffaa00]/5 to-transparent rtl:bg-gradient-to-l text-[#ffcf66] hover:border-[#ffaa00]/70 transition-colors"
                      >
                        <span className="text-[10px] tabular-nums text-[#ffaa00]/60 w-5 shrink-0" aria-hidden="true">
                          ◆
                        </span>
                        <Sliders className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 min-w-0 text-start uppercase tracking-wider">Admin Control</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100 opacity-70" aria-hidden="true" />
                      </button>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-[#38e8ff]/15 text-[10px] font-mono text-slate-500 text-center break-words">
                      {t.nav.locationDomain}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
