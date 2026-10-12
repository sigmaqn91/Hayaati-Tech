'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { crispPixelRatio } from '@/lib/crispPixels';

// Smooth-shrink layers cost graphics memory: each one holds the full original photo on the GPU. With all 55 photos
// layered at once (~345 MB), phones ran short of graphics memory (black boxes, blinking, tab crashes). Now a photo has
// its layer only while it is on or near the screen (60% of a screen ahead/behind, so the switch is never seen).
// Same file, same size, same crop. (Weak phones keep these layers too: in low-memory tests a photo layer is the
// most reliable way for a photo to appear at once, so they are kept, just not for off-screen photos.)
const wantsCrisp = new WeakMap<Element, boolean>();
let crispIo: IntersectionObserver | null = null;
const setCrisp = (img: HTMLElement, on: boolean) => {
  if (on) img.style.setProperty('will-change', 'transform', 'important');
  else img.style.removeProperty('will-change');
};
function crispObserver(): IntersectionObserver | null {
  if (crispIo || typeof IntersectionObserver === 'undefined') return crispIo;
  crispIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) setCrisp(e.target as HTMLElement, e.isIntersecting && !!wantsCrisp.get(e.target));
    },
    { rootMargin: '60% 0px 60% 0px' }
  );
  return crispIo;
}

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
  const imgEl = useRef<HTMLImageElement | null>(null);
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    imgEl.current = img;
    if (img && img.complete && img.naturalWidth > 0) {
      setInstant(true);
      setIsLoaded(true);
    }
  }, []);
  // Big original shown much smaller (e.g. a 1586px postcard in a 450px card): phone Chrome draws such a
  // shrunk photo grainy/noisy. Giving the photo its own drawing layer makes Chrome shrink it smoothly, so it
  // looks crystal clear at normal size (same file, same size and crop). Only for strongly shrunk photos;
  // lightly shrunk ones are already sharp and stay as they are.
  useEffect(() => {
    const img = imgEl.current;
    if (!img || !isLoaded) return;
    const io = crispObserver();
    const check = () => {
      const r = img.getBoundingClientRect();
      if (!img.naturalWidth || r.width < 2) return;
      const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight) * crispPixelRatio(4);
      wantsCrisp.set(img, 1 / scale > 1.8);
      if (io) {
        // Re-evaluate through the watcher (it knows whether the photo is near the screen).
        io.unobserve(img);
        io.observe(img);
      }
    };
    check();
    // Only width changes can change the shrink factor. Phone address-bar slides (height only) fire "resize" on
    // every scroll direction change; skipping them saves a layout read per photo at exactly that moment.
    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      check();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      io?.unobserve(img);
      setCrisp(img, false);
    };
  }, [isLoaded, src]);

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
