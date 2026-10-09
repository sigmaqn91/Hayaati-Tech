'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { defaultBundle, languageList, loadLanguageBundle } from '@/locales';
import { detectDefaultLanguage } from '@/lib/geoLanguage';
import { SupportedLanguage, TranslationSchema, ContentSchema, LanguageBundle } from '@/locales/types';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
  content: ContentSchema;
  isRtl: boolean;
  languages: typeof languageList;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: defaultBundle.ui,
  content: defaultBundle.content,
  isRtl: false,
  languages: languageList,
});

// Start downloading the visitor's language as early as possible: the inline boot script in <head>
// has already chosen it (saved choice, else country, else browser language) and written it to <html lang>.
if (typeof window !== 'undefined') {
  try {
    const early = document.documentElement.lang as SupportedLanguage;
    if (early && early !== 'en' && languageList.some((l) => l.code === early)) {
      loadLanguageBundle(early).catch(() => {});
    }
  } catch {}
}

function clearLangPending() {
  try {
    document.documentElement.removeAttribute('data-lang-pending');
  } catch {}
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [bundle, setBundle] = useState<LanguageBundle>(defaultBundle);

  // First visit: open in the language of the visitor's country (India -> Hindi, USA -> English,
  // Saudi Arabia -> Arabic ...). A language the visitor picked earlier always wins.
  useEffect(() => {
    let target: SupportedLanguage = 'en';
    try {
      const stored = localStorage.getItem('hayaati_lang') as SupportedLanguage | null;
      if (stored && languageList.some((l) => l.code === stored)) target = stored;
      else target = detectDefaultLanguage();
    } catch {
      target = detectDefaultLanguage();
    }
    if (target === 'en') {
      clearLangPending();
      return;
    }
    let alive = true;
    loadLanguageBundle(target)
      .then((loadedBundle) => {
        if (!alive) return;
        setLanguageState(target);
        setBundle(loadedBundle);
      })
      .finally(() => {
        // Let React paint the new language first, then fade the page in.
        requestAnimationFrame(() => requestAnimationFrame(clearLangPending));
      });
    return () => {
      alive = false;
    };
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    try {
      localStorage.setItem('hayaati_lang', lang);
    } catch {
      // Storage unavailable
    }
    // Switch text and language together (no half-English frame while the bundle downloads).
    loadLanguageBundle(lang).then((loadedBundle) => {
      setLanguageState(lang);
      setBundle(loadedBundle);
    });
  }, []);

  const isRtl = language === 'ur' || language === 'ar';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [isRtl, language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: bundle.ui,
        content: bundle.content,
        isRtl,
        languages: languageList,
      }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-sans text-right rtl-layout' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
