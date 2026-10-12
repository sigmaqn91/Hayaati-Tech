'use client';

/**
 * DeviceBrain — refines the boot script's first guess (lib/deviceProfile.ts) once the page is running.
 * Nothing visible on its own; it only lowers the device tier when the device really needs it:
 *
 *  1. GPU check (once, in idle time): a tiny throw-away WebGL test. Software drawing, missing WebGL or a known
 *     entry-level phone GPU means the device gets the lighter "low" tier.
 *  2. Real smoothness: while the visitor scrolls, frame gaps are sampled. If the page keeps dropping well below
 *     smooth (< ~24 fps over several scrolls), the tier is lowered right away and remembered for a few days.
 *  3. Crash memory: if the page died while open on screen (a phone browser running out of memory and reloading the
 *     tab), the next visit starts in the lighter tier, so it does not crash again.
 *  4. Network: when the connection turns slow, photos start downloading closer to the screen so the visible ones
 *     finish first (AnimationGovernor reads it).
 */

import { useEffect } from 'react';
import { getDeviceProfile, lowerTier, setSlowNet } from '@/lib/deviceProfile';

const ALIVE_KEY = 'hy-alive';
const HEARTBEAT_MS = 5000;

// Entry-level phone GPUs that struggle with many glass/photo layers at once.
const WEAK_GPU =
  /Mali-(4\d\d|T[67]\d\d|G(31|51|52|57)\b)|Adreno \(TM\) (3\d\d|4\d\d|5[0-4]\d|60\d|61[0-3])\b|PowerVR (Rogue )?G?E?8[0-3]\d\d|PowerVR SGX|IMG BXE|Vivante|VideoCore/i;
const SOFTWARE_GPU = /SwiftShader|llvmpipe|softpipe|Software Rasterizer|Microsoft Basic Render/i;

function probeGpu(): void {
  const p = getDeviceProfile();
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const gl = (canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ||
      null) as WebGLRenderingContext | null;
    if (!gl) {
      if (p.touch) lowerTier('low', 'no-gpu');
      return;
    }
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    const maxTex = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
    if (SOFTWARE_GPU.test(renderer) && p.touch) lowerTier('low', 'software-gpu');
    else if (p.touch && WEAK_GPU.test(renderer)) lowerTier('low', 'entry-gpu');
    else if (maxTex && maxTex < 4096) lowerTier('low', 'small-gpu');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    /* probing is optional */
  }
}

export function DeviceBrain() {
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const timers: number[] = [];
    const cleanups: Array<() => void> = [];
    const forced = /[?&]device=(high|mid|low)/.test(location.search);

    // ---- 1. GPU check, after the first screen is up ----
    const idle = (fn: () => void, timeout: number) => {
      if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout });
      else timers.push(window.setTimeout(fn, 200));
    };
    if (!forced) idle(probeGpu, 3000);

    // ---- 3. Crash memory ----
    // Each open tab keeps a heartbeat entry while it is on screen. An entry that stopped beating without the page
    // being closed or hidden means that tab died on screen (out of memory) -> lighter tier from now on.
    const tabId = Math.random().toString(36).slice(2);
    type Alive = Record<string, number>;
    const readAlive = (): Alive => {
      try {
        return JSON.parse(localStorage.getItem(ALIVE_KEY) || '{}') as Alive;
      } catch {
        return {};
      }
    };
    const writeAlive = (a: Alive) => {
      try {
        localStorage.setItem(ALIVE_KEY, JSON.stringify(a));
      } catch {}
    };
    const now0 = Date.now();
    const prev = readAlive();
    let crashed = false;
    for (const [id, at] of Object.entries(prev)) {
      const age = now0 - at;
      if (age > HEARTBEAT_MS * 2.5 && age < 10 * 60e3) crashed = true;
      if (age > HEARTBEAT_MS * 2.5) delete prev[id];
    }
    writeAlive(prev);
    if (crashed && !forced && getDeviceProfile().touch) lowerTier('low', 'crashed-before', 7);

    const beat = () => {
      if (document.hidden) return;
      const a = readAlive();
      a[tabId] = Date.now();
      writeAlive(a);
    };
    const leave = () => {
      const a = readAlive();
      delete a[tabId];
      writeAlive(a);
    };
    const onVis = () => (document.hidden ? leave() : beat());
    beat();
    const hb = window.setInterval(beat, HEARTBEAT_MS);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', leave);
    cleanups.push(() => {
      window.clearInterval(hb);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', leave);
      leave();
    });

    // ---- 2. Real smoothness while scrolling ----
    // Frames are only sampled for one second after a scroll, so nothing runs while the visitor just reads.
    if (!forced) {
      let sampling = false;
      let badRounds = 0;
      let rounds = 0;
      let raf = 0;
      const sample = () => {
        if (sampling || document.hidden) return;
        sampling = true;
        const gaps: number[] = [];
        let last = 0;
        const start = performance.now();
        const tick = (t: number) => {
          if (last) gaps.push(t - last);
          last = t;
          if (t - start < 1000) {
            raf = requestAnimationFrame(tick);
            return;
          }
          sampling = false;
          if (gaps.length < 3) return;
          gaps.sort((a, b) => a - b);
          const median = gaps[Math.floor(gaps.length / 2)];
          const worst = gaps[Math.floor(gaps.length * 0.9)];
          rounds++;
          // < ~24 fps typical, or regular freezes of a quarter second.
          if (median > 42 || worst > 250) badRounds++;
          if (badRounds >= 4 && badRounds / rounds >= 0.5 && getDeviceProfile().tier !== 'low') {
            lowerTier(getDeviceProfile().tier === 'high' ? 'mid' : 'low', 'slow-frames', 3);
            badRounds = 0;
            rounds = 0;
          }
        };
        raf = requestAnimationFrame(tick);
      };
      // Ignore the first seconds (hero is still starting up and every device is busy then).
      const armAt = performance.now() + 6000;
      const onScroll = () => {
        if (performance.now() > armAt) sample();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
      });
    }

    // ---- 4. Network speed ----
    const conn = (navigator as Navigator & {
      connection?: EventTarget & { effectiveType?: string; downlink?: number; saveData?: boolean };
    }).connection;
    if (conn && typeof conn.addEventListener === 'function') {
      const onNet = () =>
        setSlowNet(
          !!conn.saveData ||
            /(^|-)2g|3g/.test(conn.effectiveType || '') ||
            (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 1.5)
        );
      conn.addEventListener('change', onNet);
      cleanups.push(() => conn.removeEventListener('change', onNet));
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
