'use client';

import React, { useEffect, useRef } from 'react';
import { crispPixelRatio } from '@/lib/crispPixels';
import { getDeviceProfile } from '@/lib/deviceProfile';

interface HeroStarfieldProps {
  hasImage?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  isViolet: boolean;
}

export function HeroStarfield({ hasImage = false, className = '' }: HeroStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    // Detect prefers-reduced-motion
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mql.matches;

    // Soft background layer (mostly shown at 40% opacity): 1x pixels on phones; on computers the screen's real
    // pixel density (up to 2x) so thin grid lines stay sharp on 4K / Retina screens.
    // Phones in the mobile layout and light-tier devices: 1x pixels, ~30 fps.
    const device = getDeviceProfile();
    const isPhone = window.innerWidth < 768 || device.tier === 'low';
    const getDpr = () => (isPhone ? 1 : crispPixelRatio(2));
    const minFrameGap = isPhone ? 32 : 15; // ~30 fps on phones, ~60 on desktop

    // Static part (background gradient, horizon, radial fan lines) is pre-drawn once per resize.
    const staticLayer = document.createElement('canvas');
    const staticCtx = staticLayer.getContext('2d');

    let width = 0;
    let height = 0;

    // Points capped at ~70 on phone, ~120 on desktop
    const particles: Particle[] = [];

    const initParticles = (count: number) => {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        const isViolet = Math.random() < 0.38;
        particles.push({
          x: Math.random() * (width || 800),
          y: Math.random() * (height || 600),
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          radius: Math.random() * 1.2 + 0.8,
          baseAlpha: Math.random() * 0.35 + 0.35,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.025 + 0.015,
          isViolet,
        });
      }
    };

    const resize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const parentWidth = parent?.clientWidth || window.innerWidth;
      const parentHeight = parent?.clientHeight || window.innerHeight;

      const dpr = getDpr();
      // Phone browsers fire "resize" every time the address bar slides in/out while scrolling. The hero keeps its
      // size then, so the canvas is no longer thrown away and rebuilt (that was a hitch on every scroll-up).
      if (width === parentWidth && height === parentHeight && canvas.width === Math.round(parentWidth * dpr)) return;
      width = parentWidth;
      height = parentHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStatic(dpr);

      const targetCount = width < 768 ? 70 : 120;
      if (particles.length === 0 || Math.abs(particles.length - targetCount) > 20) {
        initParticles(targetCount);
      }
    };

    const buildStatic = (dpr: number) => {
      if (!staticCtx || width === 0 || height === 0) return;
      staticLayer.width = Math.round(width * dpr);
      staticLayer.height = Math.round(height * dpr);
      const ctx = staticCtx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 1. Near-black base gradient (deep dark cinematic space)
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#090e18');
      bgGrad.addColorStop(0.55, '#05070a');
      bgGrad.addColorStop(1, '#020305');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Slowly moving perspective grid in faint cyan
      // Horizon sits at ~54% of hero height
      const horizonY = height * 0.54;
      const vpX = width * 0.5;

      // Draw faint horizon glow line
      const horizonGrad = ctx.createLinearGradient(0, 0, width, 0);
      horizonGrad.addColorStop(0, 'rgba(56, 232, 255, 0)');
      horizonGrad.addColorStop(0.5, 'rgba(56, 232, 255, 0.18)');
      horizonGrad.addColorStop(1, 'rgba(56, 232, 255, 0)');
      ctx.beginPath();
      ctx.strokeStyle = horizonGrad;
      ctx.lineWidth = 1;
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Perspective radial lines (fanning out from vanishing point)
      const numRadials = width < 768 ? 14 : 22;
      const spread = width * 1.8;
      for (let i = 0; i <= numRadials; i++) {
        const factor = (i / numRadials - 0.5) * 2; // -1 to 1
        const bottomX = vpX + factor * (spread * 0.5);

        ctx.beginPath();
        const radGrad = ctx.createLinearGradient(vpX, horizonY, bottomX, height);
        radGrad.addColorStop(0, 'rgba(56, 232, 255, 0)');
        radGrad.addColorStop(0.3, 'rgba(56, 232, 255, 0.08)');
        radGrad.addColorStop(1, 'rgba(56, 232, 255, 0.02)');
        ctx.strokeStyle = radGrad;
        ctx.lineWidth = 0.75;
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

    };

    resize();
    // Debounced resize (window + hero height changes, e.g. when the Jarvis transcript opens)
    let resizeTimer = 0;
    const scheduleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 160);
    };
    window.addEventListener('resize', scheduleResize);
    const parentRo =
      typeof ResizeObserver !== 'undefined' && canvas.parentElement ? new ResizeObserver(scheduleResize) : null;
    if (parentRo && canvas.parentElement) parentRo.observe(canvas.parentElement);

    // Pause off-screen using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
        wake();
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Tab visibility handling
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      wake();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Render logic
    let lastTime = performance.now();
    let gridOffset = 0;

    const drawFrame = (time: number) => {
      if (width === 0 || height === 0) return;

      // 1-2. Pre-rendered static background (gradient, horizon glow, radial fan)
      if (staticLayer.width > 0) {
        ctx.drawImage(staticLayer, 0, 0, width, height);
      }
      const horizonY = height * 0.54;
      const gridHeight = height - horizonY;

      // Perspective horizontal lines (transversals moving forward toward viewer)
      const numLines = 14;
      for (let i = 0; i <= numLines; i++) {
        const depth = (i + gridOffset) / numLines;
        if (depth <= 0.02 || depth > 1) continue;

        // Exponential curve for realistic 3D perspective foreshortening
        const curvedDepth = Math.pow(depth, 2.2);
        const y = horizonY + gridHeight * curvedDepth;

        // Alpha peaks midway and smoothly fades at horizon and bottom edge
        const edgeFade = Math.sin(depth * Math.PI);
        const lineAlpha = edgeFade * 0.12;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(56, 232, 255, ${lineAlpha})`;
        ctx.lineWidth = 0.75 + curvedDepth * 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Thin glowing lines connecting nearby points with gentle pulse
      const maxConnectDist = width < 768 ? 95 : 125;
      const maxDistSq = maxConnectDist * maxConnectDist;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const proximity = 1 - dist / maxConnectDist;
            const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + (i + j) * 0.4);
            const lineAlpha = proximity * (0.12 + 0.1 * pulse);

            ctx.beginPath();
            if (p1.isViolet && p2.isViolet) {
              ctx.strokeStyle = `rgba(192, 132, 252, ${lineAlpha})`;
            } else if (!p1.isViolet && !p2.isViolet) {
              ctx.strokeStyle = `rgba(56, 232, 255, ${lineAlpha})`;
            } else {
              ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
            }
            ctx.lineWidth = 0.6;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 4. Floating glowing data points in cyan and violet
      for (const p of particles) {
        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase);
        const currentAlpha = Math.max(0.15, Math.min(0.9, p.baseAlpha + pulse * 0.25));

        const colorCore = p.isViolet
          ? `rgba(216, 180, 254, ${currentAlpha})`
          : `rgba(165, 243, 252, ${currentAlpha})`;
        const colorHalo = p.isViolet
          ? `rgba(168, 85, 247, ${currentAlpha * 0.25})`
          : `rgba(56, 232, 255, ${currentAlpha * 0.25})`;

        // Outer soft glow ring without blur filter
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = colorHalo;
        ctx.fill();

        // Inner bright point core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorCore;
        ctx.fill();
      }
    };

    const updateState = (dt: number) => {
      // Perspective grid moves slowly forward
      gridOffset = (gridOffset + dt * 0.00035) % 1;

      // Update particle positions
      const margin = 20;
      for (const p of particles) {
        p.x += p.vx * (dt * 0.06);
        p.y += p.vy * (dt * 0.06);

        if (p.x < -margin) p.x = width + margin;
        if (p.x > width + margin) p.x = -margin;
        if (p.y < -margin) p.y = height + margin;
        if (p.y > height + margin) p.y = -margin;
      }
    };

    const loop = (currentTime: number) => {
      // Off-screen or hidden tab: stop asking for frames at all (an idle loop still wakes the page 60x a second
      // while the visitor scrolls the rest of the site). wake() restarts it when the hero comes back.
      if (!isVisible || !isTabVisible) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(loop);
      if (currentTime - lastTime < minFrameGap) return;
      const dt = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      if (isVisible && isTabVisible && !prefersReducedMotion && !document.documentElement.classList.contains('bg-paused')) {
        updateState(dt);
        drawFrame(currentTime);
      }
    };

    function wake() {
      if (animationFrameId !== null || prefersReducedMotion || !isVisible || !isTabVisible) return;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }

    // If reduced motion is requested, render a still frame and do not loop
    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      animationFrameId = requestAnimationFrame(loop);
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        drawFrame(0);
      } else if (animationFrameId === null) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    mql.addEventListener('change', handleMotionChange);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', scheduleResize);
      window.clearTimeout(resizeTimer);
      parentRo?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mql.removeEventListener('change', handleMotionChange);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-700 ${
        hasImage ? 'opacity-40' : 'opacity-100'
      } ${className}`}
    />
  );
}
