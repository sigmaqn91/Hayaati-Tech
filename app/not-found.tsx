'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="w-16 h-1 bg-[#38e8ff] mb-6" />
      <span className="text-xs text-[#38e8ff] tracking-widest uppercase mb-2">
        {t.notFound.errorTag}
      </span>
      <h1 className="text-3xl font-bold text-white mb-4">
        {t.notFound.title}
      </h1>
      <p className="text-slate-400 max-w-md text-sm mb-8 font-sans">
        {t.notFound.description}
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#38e8ff] text-[#05070a] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 transition-colors"
      >
        {t.notFound.returnBtn}
      </Link>
    </div>
  );
}
