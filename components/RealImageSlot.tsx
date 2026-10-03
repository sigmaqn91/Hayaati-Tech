'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface RealImageSlotProps {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
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
}: RealImageSlotProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#080b11] border border-[#1e293b] select-none ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      {/* Fallback dark panel when local file hasn't been generated yet or failed to load */}
      {(!isLoaded || hasError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#070a0f] border border-[#1e293b]">
          <div className="absolute top-2 left-2 text-[10px] font-mono text-[#38e8ff]/60 tracking-wider">
            OPTICAL CHANNEL
          </div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#38e8ff]/50 rounded-full" />
          
          <span className="text-xs font-mono text-slate-400 max-w-[85%] font-medium">
            {title}
          </span>
          <span className="text-[10px] font-mono text-slate-600 mt-2">
            PHOTOREALISTIC FRAME PENDING
          </span>
          
          <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-700">
            SYS//800x500
          </div>
        </div>
      )}
    </div>
  );
}
