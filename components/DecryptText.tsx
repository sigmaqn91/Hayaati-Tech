'use client';

import React, { useEffect, useState } from 'react';

interface DecryptTextProps {
  text: string;
  className?: string;
  speed?: number;
}

const CHARS = '01#%&*+<>[]_/~X@';

export function DecryptText({ text, className = '', speed = 25 }: DecryptTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
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
