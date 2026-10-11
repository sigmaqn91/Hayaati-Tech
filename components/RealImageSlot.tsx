'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface RealImageSlotProps {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Serve the original file exactly as uploaded (no resize or recompress). */
  original?: boolean;
}

export function RealImageSlot({
  src,
  alt,
  title,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  original = false,
}: RealImageSlotProps) {
  const { t } = useLanguage();
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // Already in the browser cache (e.g. the same photo opened in a card popup): show it at once, no fade.
  const [instant, setInstant] = useState(false);
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) {
      setInstant(true);
      setIsLoaded(true);
    }
  }, []);
  // Card photos are already small 800px WebP files: serve them as they are, so a card and its popup
  // use the exact same file (the popup opens instantly from cache instead of downloading a new size).
  // Big banners (wider than 1200) still go through Next's resizer.
  const isLocal = src.startsWith('/') && (width <= 1200 || original);

  return (
    <div
      data-image-slot={isLoaded && !hasError ? 'real' : 'pending'}
      className={`relative overflow-hidden bg-[#080b11] border border-[#1e293b] select-none ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          ref={imgRef}
          priority={priority}
          sizes={sizes}
          unoptimized={isLocal}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover ${instant ? '' : 'transition-opacity duration-500'} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      {/* Fallback dark panel when local file hasn't been generated yet or failed to load */}
      {(!isLoaded || hasError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#070a0f] border border-[#1e293b]">
          <div className="absolute top-2 left-2 text-[10px] font-mono text-[#38e8ff]/60 tracking-wider">
            {t.imageSlot.opticalChannel}
          </div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#38e8ff]/50 rounded-full" />
          
          <span className="text-xs font-mono text-slate-400 max-w-[85%] font-medium">
            {title}
          </span>
          <span className="text-[10px] font-mono text-slate-600 mt-2">
            {t.imageSlot.framePending}
          </span>
          
          <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-700">
            {t.imageSlot.sysDim}
          </div>
        </div>
      )}
    </div>
  );
}
