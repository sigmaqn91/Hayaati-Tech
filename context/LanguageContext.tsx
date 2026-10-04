'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { defaultBundle, languageList, loadLanguageBundle } from '@/locales';
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [bundle, setBundle] = useState<LanguageBundle>(defaultBundle);

  // Restore stored user preference safely after hydration (defaulting strictly to English on first visit)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hayaati_lang') as SupportedLanguage | null;
      if (stored && stored !== 'en' && languageList.some((l) => l.code === stored)) {
        loadLanguageBundle(stored).then((loadedBundle) => {
          setLanguageState(stored);
          setBundle(loadedBundle);
        });
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hayaati_lang', lang);
    } catch {
      // Storage unavailable
    }

    // Dynamically load the language bundle
    loadLanguageBundle(lang).then((loadedBundle) => {
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
