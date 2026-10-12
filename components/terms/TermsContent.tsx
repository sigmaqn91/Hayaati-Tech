'use client';

/**
 * Terms & Conditions text in the site language (all 30). English is built in; any other language's text is
 * downloaded only when that language is picked (locales/terms/*.json), so the page follows the language button.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, Crown, Gift } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import en from '@/locales/terms/en.json';

type TermsSection = {
  t: string;
  p?: string[];
  list?: string[];
  after?: string[];
  plans?: boolean;
};
export type TermsText = {
  back: string;
  title: string;
  effective: string;
  sections: TermsSection[];
  plans: {
    free: { name: string; items: string[] };
    premium: { name: string; items: string[] };
  };
  siteData: string;
};
export type TermsValues = Record<'email' | 'voicePerHour' | 'voiceMin' | 'chat' | 'chars' | 'quickMin' | 'quickPerHour', string>;

const cache: Record<string, TermsText> = { en: en as TermsText };

// Wide-spaced mono capitals suit Latin / Cyrillic only; other scripts (Hindi, Urdu, Chinese ...) break apart when spaced.
const SPACED = new Set(['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'pl', 'tr', 'id', 'vi', 'sw', 'ru']);
const Spaced = React.createContext(true);

function fill(s: string, v: TermsValues) {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? v[k as keyof TermsValues] : m));
}

/** Text with the contact email turned into a link. */
function WithEmail({ text, v }: { text: string; v: TermsValues }) {
  const parts = fill(text, v).split(v.email);
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a href={`mailto:${v.email}`} className="text-[#38e8ff] hover:underline" dir="ltr">
              {v.email}
            </a>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  const spaced = React.useContext(Spaced);
  return (
    <section className="mt-10 scroll-mt-24" id={`s${n}`}>
      <h2
        className={`flex items-baseline gap-3 text-[#38e8ff] ${spaced ? 'font-mono text-[13px] tracking-[0.18em] uppercase' : 'text-[15px] font-semibold'}`}
      >
        <span className="text-[#38e8ff]/50 tabular-nums">{String(n).padStart(2, '0')}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export function TermsContent({ values }: { values: TermsValues }) {
  const { language, isRtl } = useLanguage();
  const [text, setText] = useState<TermsText>(cache[language] || cache.en);

  useEffect(() => {
    let alive = true;
    if (cache[language]) {
      setText(cache[language]);
      return;
    }
    import(`@/locales/terms/${language}.json`)
      .then((m: { default: TermsText }) => {
        cache[language] = m.default;
        if (alive) setText(m.default);
      })
      .catch(() => {
        if (alive) setText(cache.en);
      });
    return () => {
      alive = false;
    };
  }, [language]);

  const spaced = SPACED.has(language);
  const plans = [
    { icon: Sparkles, tone: 'border-[#38e8ff]/25', ...text.plans.free },
    { icon: Crown, tone: 'border-[#a78bfa]/40', ...text.plans.premium },
  ];

  return (
    <Spaced.Provider value={spaced}>
      <div className="max-w-3xl mx-auto" dir={isRtl || language === 'fa' ? 'rtl' : 'ltr'} lang={language}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-slate-400 ${spaced ? 'font-mono text-xs tracking-widest uppercase' : 'text-sm'} hover:text-[#38e8ff] transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /> {text.back}
          </Link>
          <div className="ms-auto">
            <LanguageSelector />
          </div>
        </div>

        <header className="mt-8 pb-6 border-b border-[#38e8ff]/15">
          <p className="rt-label flex items-center gap-2">
            <FileText className="w-4 h-4" aria-hidden="true" /> Hayaati Web Technology
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">{text.title}</h1>
          <p className={`mt-2 text-xs text-slate-500 ${spaced ? 'font-mono' : ''}`}>{text.effective}</p>
        </header>

        {text.sections.map((s, i) => (
          <Section key={i} n={i + 1} title={s.t}>
            {s.plans && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((p) => (
                  <div key={p.name} className={`rt-card !p-4 border ${p.tone}`}>
                    <p
                      className={`flex items-center gap-2 text-white ${spaced ? 'font-mono text-[13px] tracking-[0.16em] uppercase' : 'text-[15px] font-semibold'}`}
                    >
                      <p.icon className="w-4 h-4 text-[#38e8ff]" aria-hidden="true" /> {p.name}
                    </p>
                    <ul className="mt-3 space-y-2 text-[14px] text-slate-300">
                      {p.items.map((it) => (
                        <li key={it} className="flex gap-2">
                          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#38e8ff]" aria-hidden="true" />
                          <span>{fill(it, values)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {s.p?.map((para, j) =>
              i === 5 && j === 0 ? (
                <p key={j} className="flex gap-2">
                  <Gift className="w-4 h-4 mt-1 shrink-0 text-[#a5b4fc]" aria-hidden="true" />
                  <span>
                    <WithEmail text={para} v={values} />
                  </span>
                </p>
              ) : (
                <p key={j}>
                  <WithEmail text={para} v={values} />
                </p>
              ),
            )}
            {s.list && (
              <ul className="list-disc ps-5 space-y-2">
                {s.list.map((li, j) => (
                  <li key={j}>{fill(li, values)}</li>
                ))}
              </ul>
            )}
            {s.after?.map((para, j) => (
              <p key={`a${j}`}>{fill(para, values)}</p>
            ))}
          </Section>
        ))}

        <footer className="mt-14 pt-5 border-t border-[#38e8ff]/10 text-[11px] leading-relaxed text-slate-500">
          <p>{fill(text.siteData, values)}</p>
          <p className="mt-3">© {new Date().getFullYear()} Hayaati Web Technology</p>
        </footer>
      </div>
    </Spaced.Provider>
  );
}
