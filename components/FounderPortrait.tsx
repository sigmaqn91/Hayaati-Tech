'use client';

import React, { useEffect, useRef, useState } from 'react';

/*
  Founder portrait for the About frame.
  - The file on the server is tile-scrambled, so opening its URL directly shows a jumbled picture.
    The canvas puts the tiles back in order and shows the photo at full quality.
  - Right-click, long-press and drag are blocked. If a save still gets through, it lands on the
    invisible decoy <img> on top, which is a tiny blurred copy.
  - Screenshots cannot be blocked by any website.
*/

const GRID = 10;
const TILE = 96;
const PAD = 4;
const CELL = TILE + PAD * 2;
const SIZE = GRID * TILE;
// PERM[i] = original tile index stored at scrambled position i
const PERM = [
  19, 62, 0, 51, 55, 39, 8, 75, 33, 16, 2, 63, 79, 45, 65, 34, 6, 27, 38, 64, 36, 24, 10, 43, 11, 71, 85, 92, 46, 41,
  77, 9, 56, 28, 86, 48, 91, 32, 88, 68, 54, 18, 83, 20, 14, 99, 66, 31, 17, 15, 84, 29, 3, 87, 53, 57, 30, 90, 37, 12,
  22, 72, 49, 44, 69, 52, 97, 13, 67, 21, 60, 76, 42, 81, 26, 78, 95, 74, 98, 25, 82, 1, 23, 61, 7, 93, 58, 50, 59, 35,
  80, 47, 96, 94, 40, 4, 5, 70, 73, 89,
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
  const depthRef = useRef<HTMLDivElement>(null);
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
      ctx.imageSmoothingQuality = 'high';
      PERM.forEach((s, i) => {
        const sx = (i % GRID) * CELL + PAD;
        const sy = Math.floor(i / GRID) * CELL + PAD;
        ctx.drawImage(img, sx, sy, TILE, TILE, (s % GRID) * TILE, Math.floor(s / GRID) * TILE, TILE, TILE);
      });
      setDrawn(true);
    };
    img.src = src;
  }, [src]);

  // Reveal when the frame comes into view; subtle scroll depth afterwards
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

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = frame.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // -1 (frame below viewport) .. 1 (frame above viewport)
        const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / vh));
        if (depthRef.current) depthRef.current.style.transform = `translate3d(0, ${(p * 14).toFixed(2)}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
      <div ref={depthRef} className="absolute -inset-[4%] will-change-transform">
        <canvas ref={canvasRef} className="founder-photo block w-full h-full" />
      </div>

      {/* Soft shade at the bottom so the name reads well */}
      <div className="founder-shade pointer-events-none absolute inset-0" />

      {/* Single slow light sweep */}
      <div className="founder-sweep pointer-events-none absolute inset-0 overflow-hidden">
        <span />
      </div>

      {/* Thin hairline frame drawn in from the corners */}
      <div className="founder-lines pointer-events-none absolute inset-3 sm:inset-4">
        <i className="t" />
        <i className="r" />
        <i className="b" />
        <i className="l" />
      </div>

      <div className="founder-caption pointer-events-none absolute left-8 right-8 bottom-7 sm:left-10 sm:bottom-9 text-left">
        <span className="founder-rule block h-px bg-white/60 mb-3" />
        <Typed text={name} start={on} delay={1500} step={70} className="block text-white text-lg sm:text-xl font-light uppercase tracking-[0.32em]" />
        <Typed text={title} start={on} delay={1500 + name.length * 70 + 200} step={28} className="block mt-1.5 text-[10px] sm:text-[11px] text-white/70 uppercase tracking-[0.28em]" />
      </div>

      {/* Invisible decoy: any "save image" gets only this tiny blurred copy */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={DECOY} alt="" aria-hidden="true" draggable={false} className="founder-decoy absolute inset-0 w-full h-full" />
    </div>
  );
}
