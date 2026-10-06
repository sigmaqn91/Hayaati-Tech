'use client';

import React, { useEffect, useRef } from 'react';

export interface JarvisBackdropProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  loudness: number;
  centerY?: number; // Normalized vertical center: 0.0 - 1.0 (e.g. 0.46)
  orbRadius?: number; // Radius in pixels
}

export const JarvisBackdrop: React.FC<JarvisBackdropProps> = ({
  state,
  loudness = 0,
  centerY = 0.46,
  orbRadius = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const loudnessRef = useRef(loudness);
  const centerYRef = useRef(centerY);
  const orbRadiusRef = useRef(orbRadius);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    loudnessRef.current = loudness;
  }, [loudness]);

  useEffect(() => {
    centerYRef.current = centerY;
  }, [centerY]);

  useEffect(() => {
    orbRadiusRef.current = orbRadius;
  }, [orbRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isReducedMotion = false;

    if (typeof window !== 'undefined') {
      isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let angle1 = 0;
    let angle2 = 0;
    let angle3 = 0;
    let pulsePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * centerYRef.current;
      const currentRadius = Math.max(60, orbRadiusRef.current);
      const curLoudness = loudnessRef.current || 0;
      const curState = stateRef.current;

      // Color scheme: cyan (#38e8ff) with amber warning for listening
      const primaryRgb = curState === 'listening' ? '255, 170, 0' : '56, 232, 255';
      const secondaryRgb = '0, 180, 255';

      // 1. Perspective Background Subtle Grid
      ctx.save();
      ctx.strokeStyle = `rgba(${secondaryRgb}, 0.04)`;
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Crosshair Axis Lines through Center
      ctx.save();
      ctx.strokeStyle = `rgba(${primaryRgb}, 0.08)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.restore();

      // 3. Concentric HUD Rings sitting exactly around orbRadius
      const ring1Radius = currentRadius + 18 + curLoudness * 12;
      const ring2Radius = currentRadius + 44 + Math.sin(pulsePhase) * 4;
      const ring3Radius = currentRadius + 85 + curLoudness * 22;
      const ring4Radius = currentRadius + 130;

      // Outer Glow Halo
      const gradient = ctx.createRadialGradient(cx, cy, currentRadius * 0.8, cx, cy, ring3Radius * 1.2);
      gradient.addColorStop(0, `rgba(${primaryRgb}, 0.0)`);
      gradient.addColorStop(0.5, `rgba(${primaryRgb}, ${0.04 + curLoudness * 0.06})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, ring3Radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Ring 1: Close dashed precision ring
      ctx.save();
      ctx.strokeStyle = `rgba(${primaryRgb}, ${0.25 + curLoudness * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, ring1Radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ring 2: Segmented rotating tick ring
      ctx.save();
      ctx.translate(cx, cy);
      if (!isReducedMotion) {
        ctx.rotate(angle1);
      }
      ctx.strokeStyle = `rgba(${primaryRgb}, ${0.3 + curLoudness * 0.4})`;
      ctx.lineWidth = 1.5;
      const numSegments = 16;
      for (let i = 0; i < numSegments; i++) {
        const segAngle = (i * Math.PI * 2) / numSegments;
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, ring2Radius, segAngle, segAngle + 0.18);
          ctx.stroke();
        }
      }
      // Radial tick notches on Ring 2
      ctx.strokeStyle = `rgba(${primaryRgb}, 0.25)`;
      ctx.lineWidth = 1;
      const numTicks = 32;
      for (let i = 0; i < numTicks; i++) {
        const a = (i * Math.PI * 2) / numTicks;
        const tickLen = i % 4 === 0 ? 6 : 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * ring2Radius, Math.sin(a) * ring2Radius);
        ctx.lineTo(Math.cos(a) * (ring2Radius + tickLen), Math.sin(a) * (ring2Radius + tickLen));
        ctx.stroke();
      }
      ctx.restore();

      // Ring 3: Counter-rotating orbital guide with degree markings
      ctx.save();
      ctx.translate(cx, cy);
      if (!isReducedMotion) {
        ctx.rotate(angle2);
      }
      ctx.strokeStyle = `rgba(${secondaryRgb}, 0.18)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12, 2, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, ring3Radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ring 4: Faint outer boundary arc segments
      ctx.save();
      ctx.translate(cx, cy);
      if (!isReducedMotion) {
        ctx.rotate(angle3);
      }
      ctx.strokeStyle = `rgba(${primaryRgb}, 0.12)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, ring4Radius, a + 0.1, a + 0.5);
        ctx.stroke();
      }
      ctx.restore();

      // Corner Precision HUD Reticles
      ctx.save();
      ctx.strokeStyle = `rgba(${primaryRgb}, 0.15)`;
      ctx.lineWidth = 1;
      const cornerSize = 16;
      const offset = 24;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(offset, offset + cornerSize);
      ctx.lineTo(offset, offset);
      ctx.lineTo(offset + cornerSize, offset);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - offset - cornerSize, offset);
      ctx.lineTo(width - offset, offset);
      ctx.lineTo(width - offset, offset + cornerSize);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(offset, height - offset - cornerSize);
      ctx.lineTo(offset, height - offset);
      ctx.lineTo(offset + cornerSize, height - offset);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - offset - cornerSize, height - offset);
      ctx.lineTo(width - offset, height - offset);
      ctx.lineTo(width - offset, height - offset - cornerSize);
      ctx.stroke();
      ctx.restore();

      // Animation speeds according to state
      if (!isReducedMotion) {
        const speedMultiplier =
          curState === 'thinking' ? 2.8 : curState === 'speaking' ? 1.4 : curState === 'listening' ? 1.2 : 0.8;

        angle1 += 0.0035 * speedMultiplier;
        angle2 -= 0.002 * speedMultiplier;
        angle3 += 0.001 * speedMultiplier;
        pulsePhase += 0.035;

        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{ display: 'block' }}
    />
  );
};
