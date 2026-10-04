'use client';

import React, { useEffect, useRef } from 'react';

// true = hero photo wapas dikhao (animation halka glow ban jaata hai). false = poora black + animation.
const SHOW_PHOTO = false;

type Vec = [number, number, number];

export default function HeroCosmos() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const c = ctx;

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    let quality = cores <= 4 || mem <= 4 || window.innerWidth < 600 ? 1 : 2;

    let W = 1;
    let H = 1;
    let dpr = 1;

    // ---------- geometry (computed once) ----------
    const norm = (v: Vec): Vec => {
      const l = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / l, v[1] / l, v[2] / l];
    };
    const sph = (lat: number, lon: number): Vec => [
      Math.cos(lat) * Math.cos(lon),
      Math.sin(lat),
      Math.cos(lat) * Math.sin(lon),
    ];
    const meridians: Vec[][] = [];
    for (let m = 0; m < 12; m++) {
      const lon = (m / 12) * Math.PI * 2;
      const line: Vec[] = [];
      for (let k = 0; k <= 36; k++) line.push(sph(-Math.PI / 2 + (k / 36) * Math.PI, lon));
      meridians.push(line);
    }
    const parallels: Vec[][] = [];
    [-60, -40, -20, 0, 20, 40, 60].forEach((deg) => {
      const lat = (deg * Math.PI) / 180;
      const line: Vec[] = [];
      for (let k = 0; k <= 56; k++) line.push(sph(lat, (k / 56) * Math.PI * 2));
      parallels.push(line);
    });
    const nodes: Vec[] = [];
    for (let i = 0; i < 38; i++) {
      nodes.push(sph(Math.asin(Math.random() * 2 - 1), Math.random() * Math.PI * 2));
    }
    const links: Array<[number, number]> = [];
    for (let i = 0; i < 14; i++) {
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      if (b === a) b = (b + 7) % nodes.length;
      links.push([a, b]);
    }
    const arcCache: Vec[][] = links.map(([ia, ib]) => {
      const out: Vec[] = [];
      for (let k = 0; k <= 24; k++) {
        const u = k / 24;
        const p = norm([
          nodes[ia][0] * (1 - u) + nodes[ib][0] * u,
          nodes[ia][1] * (1 - u) + nodes[ib][1] * u,
          nodes[ia][2] * (1 - u) + nodes[ib][2] * u,
        ]);
        const lift = 1 + 0.2 * Math.sin(Math.PI * u);
        out.push([p[0] * lift, p[1] * lift, p[2] * lift]);
      }
      return out;
    });

    // ---------- galaxy dust ring ----------
    type Dust = { a: number; r: number; j: number; sp: number; s: number };
    let dust: Dust[] = [];
    // ---------- circuit traces ----------
    type Trace = { pts: Array<[number, number]>; len: number; sp: number; off: number; col: string };
    let traces: Trace[] = [];
    const buildTraces = () => {
      const n = quality === 2 ? 7 : quality === 1 ? 4 : 0;
      traces = [];
      for (let side = 0; side < 2; side++) {
        for (let i = 0; i < n; i++) {
          let x = side === 0 ? 0 : W;
          let y = H * (0.1 + (i + Math.random() * 0.6) * (0.78 / Math.max(n, 1)));
          const pts: Array<[number, number]> = [[x, y]];
          const dir = side === 0 ? 1 : -1;
          let len = 0;
          const steps = 4 + Math.floor(Math.random() * 3);
          for (let k = 0; k < steps; k++) {
            const hx = (30 + Math.random() * 90) * dir;
            x += hx;
            pts.push([x, y]);
            len += Math.abs(hx);
            const vy = (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 46);
            y += vy;
            pts.push([x, y]);
            len += Math.abs(vy);
            if (Math.abs(x - (side === 0 ? 0 : W)) > W * 0.26) break;
          }
          traces.push({ pts, len, sp: 60 + Math.random() * 90, off: Math.random() * len, col: i % 3 === 0 ? '255,176,32' : i % 2 ? '139,123,255' : '56,232,255' });
        }
      }
    };
    const buildDust = () => {
      const n = quality === 2 ? 320 : quality === 1 ? 140 : 0;
      dust = [];
      for (let i = 0; i < n; i++) {
        dust.push({ a: Math.random() * Math.PI * 2, r: 1.3 + Math.random() * 0.95, j: (Math.random() - 0.5) * 0.08, sp: (0.05 + Math.random() * 0.12) * (Math.random() < 0.5 ? 1 : 0.6), s: Math.random() < 0.15 ? 2 : 1.2 });
      }
    };

    // ---------- data streams ----------
    type Stream = { x: number; y: number; v: number; len: number; g: string };
    let streams: Stream[] = [];
    const GLYPHS = '01<>/[]{}#%&+*=~';
    const buildStreams = () => {
      const count = quality === 2 ? 22 : quality === 1 ? 11 : 0;
      streams = [];
      for (let i = 0; i < count; i++) {
        streams.push({
          x: ((i + Math.random() * 0.8) / Math.max(count, 1)) * W,
          y: Math.random() * H,
          v: 40 + Math.random() * 90,
          len: 60 + Math.random() * 110,
          g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        });
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, quality === 2 ? 1.5 : 1);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStreams();
      buildTraces();
      buildDust();
    };

    // ---------- drawing ----------
    const draw = (ts: number, dt: number) => {
      c.setLineDash([]);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = 1;
      if (SHOW_PHOTO) c.clearRect(0, 0, W, H);
      else {
        c.fillStyle = '#000';
        c.fillRect(0, 0, W, H);
      }
      const cx = W / 2;
      const cy = H * 0.42;
      const R = Math.min(W * 0.42, H * 0.3);
      const horizon = H * 0.64;
      const photoMul = SHOW_PHOTO ? 0.55 : 1;

      // 1. aurora glows
      c.globalCompositeOperation = 'lighter';
      const blob = (x: number, y: number, r: number, col: string) => {
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, col);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);
      };
      const bigR = Math.max(W, H) * 0.55;
      blob(W * (0.18 + 0.08 * Math.sin(ts * 0.15)), H * (0.22 + 0.05 * Math.cos(ts * 0.2)), bigR, 'rgba(56,232,255,' + 0.15 * photoMul + ')');
      blob(W * (0.84 + 0.06 * Math.cos(ts * 0.13)), H * (0.3 + 0.06 * Math.sin(ts * 0.17)), bigR, 'rgba(139,123,255,' + 0.17 * photoMul + ')');
      blob(W * 0.5, H * 0.95, bigR * 0.8, 'rgba(255,176,32,' + 0.07 * photoMul + ')');

      // 2. perspective grid floor
      const floorH = H - horizon;
      const off = (ts * 0.35) % 1;
      c.lineWidth = 1;
      const rows = quality === 0 ? 10 : 16;
      for (let k = 0; k < rows; k++) {
        const t = (k + off) / rows;
        const p = Math.pow(t, 2.2);
        const y = horizon + floorH * p;
        c.strokeStyle = (k % 4 === 0 ? 'rgba(139,123,255,' : 'rgba(56,232,255,') + (0.09 + 0.55 * p) * photoMul + ')';
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(W, y);
        c.stroke();
      }
      const cols = quality === 0 ? 7 : 12;
      const spread = W / (cols * 0.7);
      c.beginPath();
      for (let i = -cols; i <= cols; i++) {
        c.moveTo(cx + i * spread * 0.05, horizon);
        c.lineTo(cx + i * spread, H);
      }
      c.strokeStyle = 'rgba(56,232,255,' + 0.3 * photoMul + ')';
      c.stroke();
      // horizon glow
      const hg = c.createLinearGradient(0, horizon - 70, 0, horizon + 2);
      hg.addColorStop(0, 'rgba(139,123,255,0)');
      hg.addColorStop(1, 'rgba(139,123,255,' + 0.22 * photoMul + ')');
      c.fillStyle = hg;
      c.fillRect(0, horizon - 70, W, 72);
      const hl = c.createLinearGradient(0, 0, W, 0);
      hl.addColorStop(0, 'rgba(56,232,255,0)');
      hl.addColorStop(0.5, 'rgba(56,232,255,' + 0.85 * photoMul + ')');
      hl.addColorStop(1, 'rgba(56,232,255,0)');
      c.fillStyle = hl;
      c.fillRect(0, horizon - 1, W, 2);

      // 3. globe
      const yaw = ts * 0.2;
      const tilt = 0.38;
      const cyaw = Math.cos(yaw);
      const syaw = Math.sin(yaw);
      const ctl = Math.cos(tilt);
      const stl = Math.sin(tilt);
      const P = (v: Vec, s: number): [number, number, number] => {
        const x1 = v[0] * cyaw + v[2] * syaw;
        const z1 = -v[0] * syaw + v[2] * cyaw;
        const y2 = v[1] * ctl - z1 * stl;
        const z2 = v[1] * stl + z1 * ctl;
        return [cx + x1 * R * s, cy - y2 * R * s, z2];
      };
      const segs = (lines: Vec[][], front: boolean) => {
        c.beginPath();
        for (const line of lines) {
          let prev: [number, number, number] | null = null;
          for (const v of line) {
            const q = P(v, 1);
            if (prev && (prev[2] + q[2] > 0) === front) {
              c.moveTo(prev[0], prev[1]);
              c.lineTo(q[0], q[1]);
            }
            prev = q;
          }
        }
      };
      const all = meridians.concat(parallels);
      c.lineWidth = 1;
      segs(all, false);
      c.strokeStyle = 'rgba(139,123,255,' + 0.18 * photoMul + ')';
      c.stroke();
      segs(all, true);
      c.strokeStyle = 'rgba(70,235,255,' + 0.62 * photoMul + ')';
      c.stroke();
      // inner glow
      blob(cx, cy, R * 1.15, 'rgba(56,232,255,' + 0.17 * photoMul + ')');

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const q = P(nodes[i], 1);
        if (q[2] < -0.1) continue;
        const pulse = 1 + 0.6 * Math.sin(ts * 2 + i);
        c.fillStyle = i % 5 === 0 ? 'rgba(255,176,32,' + 0.9 * photoMul + ')' : 'rgba(120,240,255,' + 0.85 * photoMul + ')';
        c.beginPath();
        c.arc(q[0], q[1], (q[2] > 0 ? 2.8 : 1.6) * pulse, 0, Math.PI * 2);
        c.fill();
      }
      // arcs and traveling pulses
      if (quality > 0) {
        for (let i = 0; i < arcCache.length; i++) {
          const arc = arcCache[i];
          c.beginPath();
          let started = false;
          for (let k = 0; k < arc.length; k++) {
            const q = P(arc[k], 1);
            if (q[2] > 0) {
              if (!started) {
                c.moveTo(q[0], q[1]);
                started = true;
              } else c.lineTo(q[0], q[1]);
            } else started = false;
          }
          c.strokeStyle = 'rgba(255,176,32,' + 0.28 * photoMul + ')';
          c.stroke();
          const u = (ts * 0.3 + i * 0.173) % 1;
          const idx = Math.min(arc.length - 1, Math.floor(u * (arc.length - 1)));
          const q = P(arc[idx], 1);
          if (q[2] > 0) {
            c.fillStyle = 'rgba(255,230,170,' + 0.95 * photoMul + ')';
            c.beginPath();
            c.arc(q[0], q[1], 2.4, 0, Math.PI * 2);
            c.fill();
          }
        }
      }

      // 4. HUD rings, ticks, radar sweep
      c.lineWidth = 1;
      c.setLineDash([2, 10]);
      c.lineDashOffset = -ts * 14;
      c.strokeStyle = 'rgba(56,232,255,' + 0.85 * photoMul + ')';
      c.beginPath();
      c.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([60, 24, 8, 24]);
      c.lineDashOffset = ts * 22;
      c.strokeStyle = 'rgba(160,140,255,' + 0.8 * photoMul + ')';
      c.beginPath();
      c.arc(cx, cy, R * 1.24, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([]);
      c.beginPath();
      const rot = ts * 0.05;
      for (let k = 0; k < 72; k++) {
        const a = rot + (k / 72) * Math.PI * 2;
        const r1 = R * 1.32;
        const r2 = r1 + (k % 6 === 0 ? 14 : 6);
        c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      }
      c.strokeStyle = 'rgba(56,232,255,' + 0.55 * photoMul + ')';
      c.stroke();
      const anyCtx = c as unknown as { createConicGradient?: (a: number, x: number, y: number) => CanvasGradient };
      if (quality > 0 && typeof anyCtx.createConicGradient === 'function') {
        const cg = anyCtx.createConicGradient(ts * 1.1, cx, cy);
        cg.addColorStop(0, 'rgba(90,240,255,' + 0.34 * photoMul + ')');
        cg.addColorStop(0.03, 'rgba(56,232,255,' + 0.16 * photoMul + ')');
        cg.addColorStop(0.2, 'rgba(56,232,255,0)');
        cg.addColorStop(1, 'rgba(56,232,255,0)');
        c.fillStyle = cg;
        c.beginPath();
        c.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
        c.fill();
      }

      // 5. orbit rings with satellites
      const orbits: Array<[number, number, number, number]> = [
        [1.5, -0.35, 0.34, 0.6],
        [1.78, 0.5, 0.3, -0.45],
        [2.1, -0.12, 0.26, 0.32],
      ];
      for (let o = 0; o < orbits.length; o++) {
        const [rm, rotA, sq, spd] = orbits[o];
        const rr = R * rm;
        c.save();
        c.translate(cx, cy);
        c.rotate(rotA);
        c.scale(1, sq);
        c.lineWidth = 1.2;
        c.strokeStyle = 'rgba(56,232,255,' + (0.34 - o * 0.06) * photoMul + ')';
        c.beginPath();
        c.arc(0, 0, rr, 0, Math.PI * 2);
        c.stroke();
        c.restore();
        const ca = Math.cos(rotA);
        const sa = Math.sin(rotA);
        for (let tr = 0; tr < 7; tr++) {
          const ang = ts * spd + o * 2 - tr * 0.07;
          const ex = Math.cos(ang) * rr;
          const ey = Math.sin(ang) * rr * sq;
          const x = cx + ex * ca - ey * sa;
          const y = cy + ex * sa + ey * ca;
          c.fillStyle = (o === 1 ? 'rgba(255,176,32,' : 'rgba(150,245,255,') + (1 - tr / 7) * 0.9 * photoMul + ')';
          c.beginPath();
          c.arc(x, y, tr === 0 ? 3 : 2 - tr * 0.18, 0, Math.PI * 2);
          c.fill();
        }
      }

      // 6. falling data streams
      if (streams.length) {
        c.font = '12px ui-monospace, Menlo, Consolas, monospace';
        for (const s of streams) {
          s.y += s.v * dt;
          if (s.y - s.len > H) {
            s.y = -10;
            s.x = Math.random() * W;
            s.g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          for (let j = 0; j < s.len; j += 8) {
            const a = (1 - j / s.len) * 0.34 * photoMul;
            c.fillStyle = 'rgba(56,232,255,' + a + ')';
            c.fillRect(s.x, s.y - j, 1.5, 8);
          }
          c.fillStyle = 'rgba(200,255,255,' + 0.85 * photoMul + ')';
          c.fillText(s.g, s.x - 3, s.y + 11);
        }
      }

      // 6b. galaxy dust ring (tilted disc around the globe)
      if (dust.length) {
        const tr = 1.05;
        const ctr = Math.cos(tr);
        const str = Math.sin(tr);
        for (const d of dust) {
          const ang = d.a + ts * d.sp;
          const x = Math.cos(ang) * d.r * R;
          const z = Math.sin(ang) * d.r * R;
          const y = d.j * R;
          const sx = cx + x;
          const sy = cy - (y * ctr - z * str) * 0.55;
          const depth = y * str + z * ctr;
          const al = (depth > 0 ? 0.85 : 0.35) * photoMul;
          c.fillStyle = d.s > 1.5 ? 'rgba(255,214,140,' + al + ')' : 'rgba(150,235,255,' + al * 0.8 + ')';
          c.fillRect(sx, sy, d.s, d.s);
        }
      }

      // 6c. circuit traces with traveling pulses
      if (traces.length) {
        c.lineWidth = 1;
        for (const t of traces) {
          c.beginPath();
          c.moveTo(t.pts[0][0], t.pts[0][1]);
          for (let k = 1; k < t.pts.length; k++) c.lineTo(t.pts[k][0], t.pts[k][1]);
          c.strokeStyle = 'rgba(' + t.col + ',' + 0.2 * photoMul + ')';
          c.stroke();
          const last = t.pts[t.pts.length - 1];
          c.fillStyle = 'rgba(' + t.col + ',' + 0.7 * photoMul + ')';
          c.fillRect(last[0] - 2, last[1] - 2, 4, 4);
          let dpos = (t.off + ts * t.sp) % t.len;
          for (let k = 1; k < t.pts.length; k++) {
            const ax = t.pts[k - 1][0];
            const ay = t.pts[k - 1][1];
            const bx = t.pts[k][0];
            const by = t.pts[k][1];
            const sl = Math.hypot(bx - ax, by - ay);
            if (dpos <= sl) {
              const u = dpos / sl;
              c.fillStyle = 'rgba(255,255,255,' + 0.95 * photoMul + ')';
              c.beginPath();
              c.arc(ax + (bx - ax) * u, ay + (by - ay) * u, 2.2, 0, Math.PI * 2);
              c.fill();
              break;
            }
            dpos -= sl;
          }
        }
      }

      // 7. scan beam
      const sy = (((ts * 0.1) % 1.3) - 0.15) * H;
      const sg = c.createLinearGradient(0, sy - 80, 0, sy + 80);
      sg.addColorStop(0, 'rgba(56,232,255,0)');
      sg.addColorStop(0.5, 'rgba(56,232,255,' + 0.1 * photoMul + ')');
      sg.addColorStop(1, 'rgba(56,232,255,0)');
      c.fillStyle = sg;
      c.fillRect(0, sy - 80, W, 160);

      // 8. readability veil + vignette
      c.globalCompositeOperation = 'source-over';
      const vr = Math.max(W * 0.55, H * 0.4);
      const veil = c.createRadialGradient(cx, H * 0.58, 0, cx, H * 0.58, vr);
      veil.addColorStop(0, 'rgba(0,0,0,0.5)');
      veil.addColorStop(0.65, 'rgba(0,0,0,0.2)');
      veil.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = veil;
      c.fillRect(0, 0, W, H);
      const vg = c.createRadialGradient(cx, H * 0.5, Math.min(W, H) * 0.35, cx, H * 0.5, Math.hypot(W, H) * 0.62);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.7)');
      c.fillStyle = vg;
      c.fillRect(0, 0, W, H);
    };

    // ---------- loop control ----------
    let raf = 0;
    let running = false;
    let last = 0;
    let frames = 0;
    let acc = 0;
    let visible = true;

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const dtMs = now - last;
      if (dtMs < (quality === 2 ? 14 : 30)) return;
      last = now;
      draw(now / 1000, Math.min(dtMs, 60) / 1000);
      acc += dtMs;
      frames++;
      if (frames >= 90) {
        const avg = acc / frames;
        if ((quality === 2 && avg > 26) || (quality === 1 && avg > 45)) {
          quality = quality === 2 ? 1 : 0;
          resize();
        }
        frames = 0;
        acc = 0;
      }
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    resize();
    if (reduce) draw(2.5, 0);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        sync();
      });
      io.observe(canvas);
    } else {
      sync();
    }
    const onVis = () => sync();
    document.addEventListener('visibilitychange', onVis);

    let ro: ResizeObserver | null = null;
    const onResize = () => {
      resize();
      if (reduce) draw(2.5, 0);
    };
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', onResize);
    }

    return () => {
      stop();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        display: 'block',
        pointerEvents: 'none',
        background: SHOW_PHOTO ? 'transparent' : '#000',
      }}
    />
  );
}
