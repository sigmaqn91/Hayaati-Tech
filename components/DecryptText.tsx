'use client';

import React, { useEffect, useState } from 'react';

interface DecryptTextProps {
  text: string;
  className?: string;
  speed?: number;
}

const CHARS = '01#%&*+<>[]_/~X@';

function splitUnits(text: string): string[] {
  try {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const seg = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(seg.segment(text), (s: any) => s.segment as string);
    }
  } catch (e) {}
  return Array.from(text);
}

export function DecryptText({ text, className = '', speed = 25 }: DecryptTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const units = splitUnits(text);
    let iteration = 0;
    const maxIterations = units.length;

    const interval = setInterval(() => {
      setDisplayText(() =>
        units
          .map((unit, index) => {
            if (/^\s+$/.test(unit)) return unit;
            if (index < iteration) {
              return unit;
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }

      iteration += 1;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayText}</span>;
}
