'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation, languageList } from '@/locales';
import { SupportedLanguage, TranslationSchema } from '@/locales/types';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
  isRtl: boolean;
  languages: typeof languageList;
}

const defaultTranslation = getTranslation('en');

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: defaultTranslation,
  isRtl: false,
  languages: languageList,
});

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('hayaati_lang') as SupportedLanguage | null;
    if (stored && languageList.some((l) => l.code === stored)) {
      return stored;
    }
    if (navigator.language) {
      const browserCode = navigator.language.slice(0, 2).toLowerCase() as SupportedLanguage;
      if (languageList.some((l) => l.code === browserCode)) {
        return browserCode;
      }
    }
  } catch {
    // Storage unavailable
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);
  const [translation, setTranslation] = useState<TranslationSchema>(() => getTranslation(language));

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    const trans = getTranslation(lang);
    setTranslation(trans);
    try {
      localStorage.setItem('hayaati_lang', lang);
    } catch {
      // Storage unavailable
    }
  };

  const isRtl = translation.meta.rtl;

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
        t: translation,
        isRtl,
        languages: languageList,
      }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-sans text-right' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
