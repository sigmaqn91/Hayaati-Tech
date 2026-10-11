'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createSculpture, type SculptureEngine } from './sculptureEngine';

// Looping cinematic advertisement for the hero (UI only, English copy built from real site information).
interface AdScene {
  kicker: string;
  lines: string[];
  sub: string;
  tagR: string[];
  tagL: string;
  cta?: boolean;
}

const SCENES: AdScene[] = [
  {
    kicker: 'HAYAATI WEB TECHNOLOGY',
    lines: ['BORN OF', 'THE FUTURE'],
    sub: 'Futuristic websites and AI experiences, architected by Aliya Khan.',
    tagR: ['BUILT FOR', '2030 – 2050'],
    tagL: 'ARCHITECTED BY ALIYA KHAN',
  },
  {
    kicker: 'THE BLUEPRINT',
    lines: ['TOMORROW,', 'IN MOTION'],
    sub: 'Human innovation, cognitive machines, orbital colonies and sustainable habitats across 2030, 2035 and 2050.',
    tagR: ['THREE', 'ERAS'],
    tagL: 'A CINEMATIC TIMELINE',
  },
  {
    kicker: 'MEET JARVIS',
    lines: ['A VOICE THAT', 'SPEAKS YOU'],
    sub: 'A voice and chat assistant on the site that answers in 30 languages, live.',
    tagR: ['30', 'LANGUAGES'],
    tagL: 'SPEAK OR TYPE TO BEGIN',
  },
  {
    kicker: 'FUTURE TECH CATALOGUE',
    lines: ['42 FRONTIERS', 'EXPLORED'],
    sub: 'Seven foundational domains of future technology, from cognitive AI to bionics and smart habitats.',
    tagR: ['7', 'DOMAINS'],
    tagL: 'BLUEPRINTS AND MECHANISMS',
  },
  {
    kicker: 'WEB DESIGN',
    lines: ['INTERFACES THAT', 'FEEL LIKE 2050'],
    sub: 'Premium business websites with cinematic motion, built to present your brand clearly.',
    tagR: ['DESIGNED', 'TO LAST'],
    tagL: 'SMOOTH. MODERN. HUMAN.',
  },
  {
    kicker: 'HAYAATIWEB.SITE',
    lines: ['LET US BUILD', 'WHAT IS NEXT'],
    sub: 'Founded and built by Aliya Khan. Start your project, or list yours with us.',
    tagR: ['HAYAATI', 'WEB TECHNOLOGY'],
    tagL: 'FOUNDER  ·  ALIYA KHAN',
    cta: true,
  },
];

const SCENE_SECONDS = 5.6;
const OUT_SECONDS = 0.75;

function renderLines(lines: string[], seconds: number) {
  let n = 0;
  return lines.map((line, li) => (
    <span className="ad-line" key={li}>
      {line.split(' ').map((word, wi) => {
        const i = n++;
        return (
          <span className="ad-w" key={`${li}-${wi}`}>
            <span
              className="ad-w__in"
              style={{
                animationDelay: `${0.18 + i * 0.1}s, ${seconds - OUT_SECONDS}s`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  ));
}

export function HeroAdvert() {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scene, setScene] = useState(0);
  const [reduced, setReduced] = useState(false);
  const engineRef = useRef<SculptureEngine | null>(null);
  const sceneRef = useRef(0);

  // Elegant serif for the display type (loaded without blocking, falls back to Georgia)
  useEffect(() => {
    if (document.getElementById('ad-serif-font')) return;
    const link = document.createElement('link');
    link.id = 'ad-serif-font';
    link.rel = 'stylesheet';
    link.href =
      // Modern display set: Unbounded (titles), Sora (text), JetBrains Mono (HUD labels). Cormorant kept as fallback.
      'https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;500&family=Sora:wght@300;400;500&family=JetBrains+Mono:wght@500;700&family=Cormorant+Garamond:wght@400;500&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = mql.matches;
    setReduced(reduce);

    const lowPower =
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency || 4) <= 4 ||
      ((navigator as unknown as { deviceMemory?: number }).deviceMemory || 4) <= 4;
    const engine = createSculpture(canvas, { lowPower });
    if (!engine) {
      root.classList.add('is-live');
      return;
    }
    engineRef.current = engine;

    const stage = canvas.parentElement as HTMLElement;
    const fit = () => {
      const r = stage.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
      engine.resize(Math.round(r.width), Math.round(r.height), ratio);
      if (reduce) engine.drawStill();
    };
    fit();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(fit);
      ro.observe(stage);
    } else {
      window.addEventListener('resize', fit);
    }

    if (reduce) {
      canvas.classList.add('is-live');
      root.classList.add('is-live');
      return () => {
        if (ro) ro.disconnect();
        else window.removeEventListener('resize', fit);
        engine.destroy();
      };
    }

    // Only run while visible on screen and the tab is active
    let visible = true;
    let running = false;
    let raf = 0;
    let clock = 0; // seconds of visible time
    let sceneClock = 0;
    let last = 0;
    let lastDraw = 0;
    const minGap = lowPower ? 1000 / 30 : 1000 / 45;
    let shown = false;

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < minGap) return;
      if (document.documentElement.classList.contains('bg-paused')) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      lastDraw = now;
      clock += dt;
      sceneClock += dt;
      if (sceneClock >= SCENE_SECONDS) {
        sceneClock = 0;
        sceneRef.current = (sceneRef.current + 1) % SCENES.length;
        engine.setScene(sceneRef.current);
        setScene(sceneRef.current);
      }
      engine.frame(clock);
      if (!shown) {
        shown = true;
        // Sculpture and words start together: the copy waits (paused) until the first picture is drawn.
        requestAnimationFrame(() => {
          canvas.classList.add('is-live');
          root.classList.add('is-live');
        });
      }
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      lastDraw = 0;
      // First picture right away, so the advert starts fading in immediately (not a few frames later).
      if (!shown) {
        engine.frame(clock);
        shown = true;
        requestAnimationFrame(() => {
          canvas.classList.add('is-live');
          root.classList.add('is-live');
        });
      }
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };
    engine.setScene(0);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          sync();
        },
        { threshold: 0.05 }
      );
      io.observe(root);
    }
    // On the first screen: start at once instead of waiting for the observer's first report.
    const box = root.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) sync();
    else if (!io) sync();
    const onVis = () => sync();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', fit);
      document.removeEventListener('visibilitychange', onVis);
      engine.destroy();
    };
  }, []);

  const s = reduced ? SCENES[SCENES.length - 1] : SCENES[scene];
  const idx = reduced ? SCENES.length - 1 : scene;

  return (
    <section
      ref={rootRef}
      aria-label="Hayaati Web Technology advertisement"
      className="hero-ad pointer-events-none"
      dir="ltr"
    >
      <div className="hero-ad__stage">
        <canvas ref={canvasRef} aria-hidden="true" className="hero-ad__canvas" />

        <div key={`scene-${idx}`} className={`hero-ad__copy ${reduced ? 'is-static' : ''}`}>
          <p
            className="ad-kicker"
            style={{ animationDelay: `0.05s, ${SCENE_SECONDS - OUT_SECONDS}s` }}
          >
            {s.kicker}
          </p>
          <h2 className="ad-title">{renderLines(s.lines, SCENE_SECONDS)}</h2>
          <p
            className="ad-sub"
            style={{ animationDelay: `0.9s, ${SCENE_SECONDS - OUT_SECONDS}s` }}
          >
            {s.sub}
          </p>
          {s.cta && (
            <div
              className="ad-cta pointer-events-auto"
              style={{ animationDelay: `1.25s, ${SCENE_SECONDS - OUT_SECONDS}s` }}
            >
              <a href="#contact" className="ad-btn ad-btn--solid">
                START YOUR PROJECT
              </a>
              <a href="#advertise" className="ad-btn ad-btn--ghost">
                ADVERTISE WITH US
              </a>
            </div>
          )}
          <div
            className="ad-tag ad-tag--r"
            style={{ animationDelay: `0.7s, ${SCENE_SECONDS - OUT_SECONDS}s` }}
          >
            {s.tagR.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div
            className="ad-tag ad-tag--l"
            style={{ animationDelay: `1.0s, ${SCENE_SECONDS - OUT_SECONDS}s` }}
          >
            {s.tagL}
          </div>
        </div>

        <div className="ad-progress" aria-hidden="true">
          {SCENES.map((_, i) => (
            <span key={i} className={`ad-progress__seg ${i < idx ? 'is-done' : ''}`}>
              {i === idx && !reduced ? (
                <i key={`fill-${idx}`} style={{ animationDuration: `${SCENE_SECONDS}s` }} />
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroAdvert;
