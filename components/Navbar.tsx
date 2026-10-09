'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState('#hero');

  // Light scroll-spy for the 4 centre links (underline follows the section in view)
  useEffect(() => {
    const ids = ['hero', 'projects', 'about', 'contact'];
    const onScroll = () => {
      let current = 'hero';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveHref(`#${current}`);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  // Centre links on desktop (all 8 stay reachable through the hamburger drawer)
  const mainLinks = [
    { href: '#hero', label: t.nav.home },
    { href: '#about', label: t.nav.about },
    { href: '#projects', label: t.nav.projects },
    { href: '#contact', label: t.nav.contact },
  ];

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
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#38e8ff] hover:text-white bg-[#0b0f17] border border-[#38e8ff]/50 rounded-md shadow-[0_0_10px_rgba(56,232,255,0.2)]"
            aria-label={mobileMenuOpen ? t.nav.close : t.nav.menu}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 top-16 z-50 bg-[#05070a] border-t border-[#1e293b] p-6 flex flex-col justify-between overflow-y-auto"
        >
          <div className="flex flex-col space-y-2">
            <div className="text-[10px] font-mono text-[#38e8ff] tracking-widest mb-3 border-b border-[#1e293b] pb-2">
              {t.footer.quickLinks} {'//'} {t.nav.menuSysHeader}
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 min-h-[44px] flex items-center text-sm font-mono text-slate-200 hover:text-[#38e8ff] hover:bg-[#0b0f17] border border-[#1e293b] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-6 border-t border-[#1e293b] mt-6 flex flex-col gap-3">
            <div className="text-[10px] font-mono text-slate-500 text-center">
              {t.nav.locationDomain}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
