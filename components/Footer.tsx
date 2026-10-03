'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Globe, Shield, Terminal } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  const links = [
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
    <footer className="bg-[#05070a] border-t border-[#1e293b] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-[#1e293b]">
          {/* Col 1: Identity & Founder */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#38e8ff]" />
              <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
                HAYAATI WEB TECHNOLOGY
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm">
              Dedicated frontier architecture examining cognitive systems, sustainable urban ecologies, and planetary infrastructure across 2030 to 2050.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1">
              Architect / Owner: <span className="text-slate-200">Aliya Khan</span>
            </div>
          </div>

          {/* Col 2: Navigation Index */}
          <div className="flex flex-col space-y-3">
            <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider">
              {t.footer.quickLinks}
            </div>
            <ul className="grid grid-cols-2 gap-2 text-xs font-mono">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-[#38e8ff] transition-colors py-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Domain & Direct Transmissions */}
          <div className="flex flex-col space-y-3">
            <div className="text-xs font-mono text-[#38e8ff] uppercase tracking-wider">
              Direct Contact & Domain
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#38e8ff]" />
                <a
                  href="https://www.hayaatiweb.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#38e8ff] text-slate-300 transition-colors"
                >
                  www.hayaatiweb.site
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#38e8ff]" />
                <a
                  href="mailto:Hayaati.Technology@gmail.com"
                  className="hover:text-[#38e8ff] text-slate-300 transition-colors"
                >
                  Hayaati.Technology@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-2">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>{t.footer.systemDesignation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex items-start gap-2 max-w-2xl">
            <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
            <p>{t.footer.disclaimer}</p>
          </div>
          <div className="shrink-0 text-slate-400">
            {t.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
