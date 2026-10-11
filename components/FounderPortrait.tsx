'use client';

import React, { useEffect, useRef, useState } from 'react';

/*
  Founder portrait for the About frame.
  - The file on the server is tile-scrambled, so opening its URL directly shows a jumbled picture.
    The canvas puts the tiles back in order and shows the photo at full original quality (exact pixels).
  - Right-click, long-press and drag are blocked. If a save still gets through, it lands on the
    invisible decoy <img> on top, which is a tiny blurred copy.
  - Screenshots cannot be blocked by any website.
*/

// Lossless PNG (1254 x 1254 original, 11 x 11 tiles of 114px, no padding needed),
// so the rebuilt photo is pixel-for-pixel the original file.
const GRID = 11;
const TILE = 114;
const PAD = 0;
const CELL = TILE + PAD * 2;
const SIZE = GRID * TILE;
// PERM[i] = original tile index stored at scrambled position i
const PERM = [
  69, 74, 21, 70, 71, 104, 9, 120, 51, 54, 115, 79, 87, 96, 73, 75, 12, 107, 31, 68, 42, 10, 93, 49, 89, 83, 98, 112, 52, 114,
  81, 86, 108, 33, 48, 92, 101, 95, 103, 111, 64, 50, 110, 26, 23, 56, 41, 102, 76, 116, 100, 18, 94, 22, 11, 55, 82, 118, 106, 39,
  109, 14, 34, 15, 6, 66, 80, 59, 40, 36, 46, 72, 117, 99, 8, 57, 20, 13, 65, 113, 28, 38, 25, 105, 53, 32, 17, 2, 37, 78,
  58, 91, 47, 24, 19, 30, 29, 0, 3, 60, 16, 67, 77, 84, 27, 119, 85, 97, 90, 1, 88, 4, 61, 45, 5, 7, 35, 43, 63, 44,
  62,
];

const DECOY =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAUABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDj1Qsavw2ZUKx70zCRtj1q3PKI40w2alstJdRrREGioGnkJyAcUVPKyuYqyMS2c0oYsRk0UVoZmtAi+UvAoooqSz//2Q==';

const block = (e: React.SyntheticEvent) => e.preventDefault();

function Typed({ text, start, delay, step, className }: { text: string; start: boolean; delay: number; step: number; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="founder-char"
          style={{ transitionDelay: start ? `${delay + i * step}ms` : '0ms', opacity: start ? 1 : 0, filter: start ? 'blur(0)' : 'blur(4px)' }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}

export function FounderPortrait({ src, alt, name, title }: { src: string; alt: string; name: string; title: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);

  // Rebuild the photo from its scrambled tiles
  useEffect(() => {
    const img = new window.Image();
    img.decoding = 'async';
    img.onload = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (!c || !ctx) return;
      c.width = SIZE;
      c.height = SIZE;
      ctx.imageSmoothingEnabled = false; // 1:1 tile copy, exact pixels
      PERM.forEach((s, i) => {
        const sx = (i % GRID) * CELL + PAD;
        const sy = Math.floor(i / GRID) * CELL + PAD;
        ctx.drawImage(img, sx, sy, TILE, TILE, (s % GRID) * TILE, Math.floor(s / GRID) * TILE, TILE, TILE);
      });
      setDrawn(true);
    };
    img.src = src;
  }, [src]);

  // Reveal when the frame comes into view (no scroll zoom/shift, so the photo is never cropped or upscaled)
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setStill(true);
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(frame);

    return () => {
      io.disconnect();
    };
  }, []);

  const on = drawn && inView;

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={alt}
      className={`founder-portrait absolute inset-0 select-none ${on ? 'is-on' : ''} ${still ? 'is-still' : ''}`}
      onContextMenu={block}
      onDragStart={block}
    >
      <div className="absolute inset-0">
        <canvas ref={canvasRef} className="founder-photo block w-full h-full" />
      </div>

      {/* Soft shade at the bottom so the name reads well */}
      <div className="founder-shade pointer-events-none absolute inset-0" />

      <div className="founder-caption pointer-events-none absolute left-10 right-10 bottom-10 sm:left-14 sm:bottom-14 text-left whitespace-nowrap">
        <span className="founder-rule block h-px bg-white/60 mb-3" />
        <Typed text={name} start={on} delay={1500} step={70} className="block text-white text-lg sm:text-2xl font-light uppercase tracking-[0.32em]" />
        <Typed text={title} start={on} delay={1500 + name.length * 70 + 200} step={28} className="block mt-1.5 text-[10px] sm:text-xs text-white/70 uppercase tracking-[0.28em]" />
      </div>

      {/* Invisible decoy: any "save image" gets only this tiny blurred copy */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={DECOY} alt="" aria-hidden="true" draggable={false} className="founder-decoy absolute inset-0 w-full h-full" />
    </div>
  );
}
