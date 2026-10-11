'use client';

import React from 'react';
import { Star } from 'lucide-react';

/** Header button next to the language button: opens the rating popup. */
export function RatingButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('rating:open'))}
      aria-label="Rate this website"
      title="Rate this website"
      className="lang-btn rate-btn flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] text-xs font-mono text-slate-100 hover:text-white bg-[#08141c] border border-[#38e8ff]/55 hover:border-[#38e8ff] cursor-pointer"
    >
      <Star className="rate-btn__star w-3.5 h-3.5 text-[#38e8ff] fill-[#38e8ff]/35" />
      <span className="uppercase tracking-wider">Rate</span>
    </button>
  );
}

export default RatingButton;
