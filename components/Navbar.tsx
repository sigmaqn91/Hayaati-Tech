'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Menu, X, Compass } from 'lucide-react';

export function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#05070a] border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-1 focus:ring-[#38e8ff]"
        >
          <div className="w-7 h-7 bg-[#0b0f17] border border-[#38e8ff]/50 flex items-center justify-center text-[#38e8ff] shadow-[0_0_10px_rgba(56,232,255,0.25)]">
            <Compass className="w-4 h-4 text-[#38e8ff] transition-transform duration-300 group-hover:rotate-45" />
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

        {/* Desktop Navigation Links */}
        <nav
          aria-label={t.nav.home}
          className="hidden xl:flex items-center space-x-1 rtl:space-x-reverse"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2.5 py-2 text-xs font-mono text-slate-300 hover:text-[#38e8ff] hover:bg-[#0b0f17] border border-transparent hover:border-[#1e293b] transition-all min-h-[44px] flex items-center"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Bar (Language + Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-[#38e8ff] bg-[#0b0f17] border border-[#1e293b]"
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
          className="xl:hidden fixed inset-0 top-16 z-50 bg-[#05070a] border-t border-[#1e293b] p-6 flex flex-col justify-between overflow-y-auto"
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
