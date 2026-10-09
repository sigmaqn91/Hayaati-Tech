// Cinematic "liquid glass" sculpture for the hero advertisement (canvas 2D, no external libraries).
// A parametric mesh morphs between shapes, is drawn as luminous glass wires with depth shading,
// glints and a particle burst on every scene change. Pure TypeScript, no React.

type RGB = [number, number, number];

const PALETTES: RGB[][] = [
  [[56, 232, 255], [79, 141, 255], [192, 132, 252]],
  [[192, 132, 252], [129, 140, 248], [56, 232, 255]],
  [[120, 245, 255], [56, 232, 255], [225, 250, 255]],
  [[79, 141, 255], [167, 139, 250], [244, 143, 220]],
  [[255, 190, 70], [56, 232, 255], [192, 132, 252]],
  [[56, 232, 255], [79, 141, 255], [192, 132, 252]],
];

const TAU = Math.PI * 2;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

type ShapeFn = (u: number, v: number, out: Float32Array, o: number) => void;

const SHAPES: ShapeFn[] = [
  // 0: torus
  (u, v, out, o) => {
    const th = u * TAU;
    const ph = v * TAU;
    const R = 0.92;
    const r = 0.4;
    out[o] = (R + r * Math.cos(ph)) * Math.cos(th);
    out[o + 1] = (R + r * Math.cos(ph)) * Math.sin(th);
    out[o + 2] = r * Math.sin(ph);
  },
  // 1: sphere
  (u, v, out, o) => {
    const th = u * TAU;
    const ph = v * Math.PI;
    const r = 1.12;
    out[o] = r * Math.sin(ph) * Math.cos(th);
    out[o + 1] = r * Math.cos(ph);
    out[o + 2] = r * Math.sin(ph) * Math.sin(th);
  },
  // 2: three-lobed ribbon knot
  (u, v, out, o) => {
    const th = u * TAU;
    const ph = v * TAU;
    const R = 0.86 + 0.3 * Math.cos(3 * th);
    const a = 0.46 * Math.cos(ph);
    const b = 0.1 * Math.sin(ph);
    const nx = Math.cos(th);
    const ny = Math.sin(th);
    out[o] = (R + a) * nx;
    out[o + 1] = (R + a) * ny;
    out[o + 2] = 0.42 * Math.sin(3 * th) + b + 0.22 * Math.sin(ph) * Math.cos(3 * th);
  },
  // 3: spiked bloom
  (u, v, out, o) => {
    const th = u * TAU;
    const ph = v * Math.PI;
    const spike = Math.pow(Math.abs(Math.sin(5 * th) * Math.sin(4 * ph)), 1.6);
    const r = 0.72 + 0.5 * spike;
    out[o] = r * Math.sin(ph) * Math.cos(th);
    out[o + 1] = r * Math.cos(ph);
    out[o + 2] = r * Math.sin(ph) * Math.sin(th);
  },
  // 4: twisted helix tower
  (u, v, out, o) => {
    const th = u * TAU + v * 5.4;
    const y = (v - 0.5) * 2.5;
    const r = 0.58 + 0.2 * Math.cos(v * TAU * 2) + 0.14 * Math.cos(u * TAU * 3 + v * 6);
    out[o] = r * Math.cos(th);
    out[o + 1] = y;
    out[o + 2] = r * Math.sin(th);
  },
  // 5: wide orbit disc (thin double ring)
  (u, v, out, o) => {
    const th = u * TAU;
    const ph = v * TAU;
    const R = 1.0 + 0.22 * Math.cos(ph);
    out[o] = R * Math.cos(th);
    out[o + 1] = 0.1 * Math.sin(ph) + 0.12 * Math.sin(th * 2);
    out[o + 2] = R * Math.sin(th) * 0.9;
  },
];

export interface SculptureEngine {
  resize(w: number, h: number, dpr: number): void;
  setScene(index: number): void;
  frame(t: number): void;
  drawStill(): void;
  destroy(): void;
}

export function createSculpture(canvas: HTMLCanvasElement, opts: { lowPower: boolean }): SculptureEngine | null {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;
  const c = ctx;

  const N = opts.lowPower ? 44 : 64;
  const M = opts.lowPower ? 15 : 22;
  const COUNT = N * (M + 1);

  const shapeData: Float32Array[] = SHAPES.map((fn) => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j <= M; j++) fn(i / N, j / M, arr, (i * (M + 1) + j) * 3);
    }
    return arr;
  });

  const px = new Float32Array(COUNT);
  const py = new Float32Array(COUNT);
  const pz = new Float32Array(COUNT);

  // Edges: along u (wrap) and along v
  const edgeA: number[] = [];
  const edgeB: number[] = [];
  const edgeJ: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j <= M; j++) {
      const a = i * (M + 1) + j;
      edgeA.push(a);
      edgeB.push(((i + 1) % N) * (M + 1) + j);
      edgeJ.push(j);
      if (j < M) {
        edgeA.push(a);
        edgeB.push(a + 1);
        edgeJ.push(j);
      }
    }
  }
  const EDGES = edgeA.length;
  const bucketOf = new Uint8Array(EDGES);

  // Soft sprites
  const makeSprite = (size: number, stops: Array<[number, string]>) => {
    const s = document.createElement('canvas');
    s.width = size;
    s.height = size;
    const sc = s.getContext('2d');
    if (sc) {
      const g = sc.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      stops.forEach(([p, col]) => g.addColorStop(p, col));
      sc.fillStyle = g;
      sc.fillRect(0, 0, size, size);
    }
    return s;
  };
  const glintSprite = makeSprite(48, [
    [0, 'rgba(255,255,255,1)'],
    [0.18, 'rgba(210,250,255,0.85)'],
    [0.5, 'rgba(90,220,255,0.22)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  const haloSprite = makeSprite(128, [
    [0, 'rgba(255,255,255,0.55)'],
    [0.25, 'rgba(255,255,255,0.22)'],
    [0.6, 'rgba(255,255,255,0.06)'],
    [1, 'rgba(0,0,0,0)'],
  ]);

  // Ambient dust ring + burst particles
  const DUST = opts.lowPower ? 60 : 110;
  const dustA = new Float32Array(DUST);
  const dustR = new Float32Array(DUST);
  const dustS = new Float32Array(DUST);
  const dustY = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustA[i] = Math.random() * TAU;
    dustR[i] = 1.35 + Math.random() * 0.9;
    dustS[i] = (0.05 + Math.random() * 0.16) * (Math.random() < 0.5 ? 1 : -1);
    dustY[i] = (Math.random() - 0.5) * 0.35;
  }
  const BURST_MAX = opts.lowPower ? 140 : 260;
  const bx = new Float32Array(BURST_MAX);
  const by = new Float32Array(BURST_MAX);
  const bvx = new Float32Array(BURST_MAX);
  const bvy = new Float32Array(BURST_MAX);
  const blife = new Float32Array(BURST_MAX);
  const bmax = new Float32Array(BURST_MAX);
  const bsize = new Float32Array(BURST_MAX);
  const bcol = new Uint8Array(BURST_MAX);

  let W = 1;
  let H = 1;
  let dpr = 1;
  let from = 0;
  let to = 0;
  let morphStart = -10;
  let lastT = 0;
  let sceneIdx = 0;
  let palFrom = PALETTES[0];
  let palTo = PALETTES[0];
  let palStart = -10;
  const PAL_TIME = 1.6;

  const curPal = (t: number): RGB[] => {
    const k = easeInOut(clamp01((t - palStart) / PAL_TIME));
    return palFrom.map((a, i) => [
      a[0] + (palTo[i][0] - a[0]) * k,
      a[1] + (palTo[i][1] - a[1]) * k,
      a[2] + (palTo[i][2] - a[2]) * k,
    ] as RGB);
  };

  const resize = (w: number, h: number, ratio: number) => {
    W = Math.max(1, w);
    H = Math.max(1, h);
    dpr = ratio;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
  };

  const spawnBurst = (t: number) => {
    const pal = curPal(t);
    const cx = W / 2;
    const cy = H / 2;
    for (let i = 0; i < BURST_MAX; i++) {
      const a = Math.random() * TAU;
      const sp = (60 + Math.pow(Math.random(), 0.6) * 340) * (Math.min(W, H) / 380);
      bx[i] = cx + Math.cos(a) * 6;
      by[i] = cy + Math.sin(a) * 6;
      bvx[i] = Math.cos(a) * sp;
      bvy[i] = Math.sin(a) * sp * 0.82;
      bmax[i] = 1.1 + Math.random() * 1.3;
      blife[i] = bmax[i];
      bsize[i] = 0.8 + Math.random() * 1.9;
      bcol[i] = Math.random() < 0.18 ? 3 : Math.floor(Math.random() * 3);
    }
    void pal;
  };

  const setScene = (index: number) => {
    const target = ((index % SHAPES.length) + SHAPES.length) % SHAPES.length;
    const prevIdx = sceneIdx;
    sceneIdx = index;
    if (target === to && morphStart > -5) {
      // same shape requested again: still refresh palette + burst
    }
    from = to;
    to = target;
    morphStart = lastT;
    palFrom = curPal(lastT);
    palTo = PALETTES[((index % PALETTES.length) + PALETTES.length) % PALETTES.length];
    palStart = lastT;
    if (prevIdx !== index) spawnBurst(lastT);
  };

  const rgba = (col: RGB, a: number) => `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a})`;

  const render = (t: number, dt: number, still: boolean) => {
    lastT = t;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2;
    const S = Math.min(W, H * 1.05) * 0.34;
    const pal = curPal(t);

    // morph
    const p = clamp01((t - morphStart) / 1.9);
    const e = easeInOut(p);
    const swirl = Math.sin(Math.PI * p);
    const A = shapeData[from];
    const B = shapeData[to];

    const ay = t * 0.33 + sceneIdx * 0.9;
    const ax = 0.5 + 0.16 * Math.sin(t * 0.27);
    const cyw = Math.cos(ay);
    const syw = Math.sin(ay);
    const cxw = Math.cos(ax);
    const sxw = Math.sin(ax);
    const breathe = 1 + 0.035 * Math.sin(t * 1.3) + 0.12 * swirl * 0.4;

    c.globalCompositeOperation = 'lighter';

    // big soft halo behind the sculpture
    const haloR = S * 2.5 * (1 + 0.05 * Math.sin(t * 0.9));
    c.globalAlpha = 0.5;
    const haloTint = pal[0];
    c.drawImage(tint(haloSprite, haloTint), cx - haloR, cy - haloR, haloR * 2, haloR * 2);
    c.globalAlpha = 0.28;
    const haloR2 = S * 1.5;
    c.drawImage(tint(haloSprite, pal[2]), cx + S * 0.2 - haloR2, cy - S * 0.1 - haloR2, haloR2 * 2, haloR2 * 2);
    c.globalAlpha = 1;

    let zMax = -9;
    for (let i = 0; i < COUNT; i++) {
      const o = i * 3;
      let x = A[o] + (B[o] - A[o]) * e;
      let y = A[o + 1] + (B[o + 1] - A[o + 1]) * e;
      let z = A[o + 2] + (B[o + 2] - A[o + 2]) * e;
      if (swirl > 0.001) {
        const w = swirl * 0.28;
        x += Math.sin(y * 3.1 + t * 2.4) * w;
        y += Math.sin(z * 3.3 + t * 2.1) * w;
        z += Math.sin(x * 3.2 + t * 2.7) * w;
      }
      x *= breathe;
      y *= breathe;
      z *= breathe;
      // rotate Y
      const x1 = x * cyw + z * syw;
      const z1 = -x * syw + z * cyw;
      // rotate X
      const y2 = y * cxw - z1 * sxw;
      const z2 = y * sxw + z1 * cxw;
      const f = 3.4 / (3.4 - z2);
      px[i] = cx + x1 * f * S;
      py[i] = cy - y2 * f * S;
      pz[i] = z2;
      if (z2 > zMax) zMax = z2;
    }

    // bucket edges: colour (3) x depth (3)
    for (let k = 0; k < EDGES; k++) {
      const z = (pz[edgeA[k]] + pz[edgeB[k]]) * 0.5;
      const depth = z > 0.38 ? 2 : z > -0.32 ? 1 : 0;
      const cb = edgeJ[k] < M * 0.34 ? 0 : edgeJ[k] < M * 0.68 ? 1 : 2;
      bucketOf[k] = cb * 3 + depth;
    }
    const alphaByDepth = [0.1, 0.3, 0.62];
    const widthByDepth = [0.5, 0.75, 1.15];
    for (let b = 0; b < 9; b++) {
      const cb = (b / 3) | 0;
      const depth = b % 3;
      c.beginPath();
      for (let k = 0; k < EDGES; k++) {
        if (bucketOf[k] !== b) continue;
        c.moveTo(px[edgeA[k]], py[edgeA[k]]);
        c.lineTo(px[edgeB[k]], py[edgeB[k]]);
      }
      c.strokeStyle = rgba(pal[cb], alphaByDepth[depth]);
      c.lineWidth = widthByDepth[depth];
      c.stroke();
    }

    // glints (metal / glass highlights)
    for (let i = 0; i < COUNT; i += 1) {
      if ((i * 7 + 3) % 13 !== 0) continue;
      const z = pz[i];
      if (z < 0.35) continue;
      const tw = 0.55 + 0.45 * Math.sin(t * 3.2 + i * 1.7);
      const a = clamp01((z - 0.35) * 1.8) * tw;
      if (a < 0.08) continue;
      const g = 9 + 16 * a;
      c.globalAlpha = a;
      c.drawImage(glintSprite, px[i] - g, py[i] - g, g * 2, g * 2);
    }
    c.globalAlpha = 1;

    // ambient dust ring
    const tr = 1.05;
    const ctr = Math.cos(tr);
    const str = Math.sin(tr);
    for (let i = 0; i < DUST; i++) {
      const ang = dustA[i] + t * dustS[i];
      const x = Math.cos(ang) * dustR[i];
      const z = Math.sin(ang) * dustR[i];
      const y = dustY[i];
      const sx = cx + x * S;
      const sy = cy - (y * ctr - z * str) * S * 0.62;
      const depth = y * str + z * ctr;
      const al = depth > 0 ? 0.8 : 0.3;
      c.fillStyle = rgba(i % 5 === 0 ? pal[2] : pal[0], al);
      const s = i % 7 === 0 ? 2 : 1.3;
      c.fillRect(sx, sy, s, s);
    }

    // burst particles
    if (!still) {
      const drag = Math.exp(-1.7 * dt);
      for (let i = 0; i < BURST_MAX; i++) {
        if (blife[i] <= 0) continue;
        blife[i] -= dt;
        bvx[i] *= drag;
        bvy[i] *= drag;
        bx[i] += bvx[i] * dt;
        by[i] += bvy[i] * dt;
        const a = clamp01(blife[i] / bmax[i]);
        c.fillStyle = bcol[i] === 3 ? `rgba(255,255,255,${a})` : rgba(pal[bcol[i]], a * 0.9);
        const s = bsize[i] * (0.5 + a);
        c.fillRect(bx[i], by[i], s, s);
      }
      // flash ring at the start of a morph
      if (p < 0.45) {
        const k = p / 0.45;
        c.strokeStyle = rgba(pal[0], (1 - k) * 0.5);
        c.lineWidth = 1.5 + (1 - k) * 2;
        c.beginPath();
        c.arc(cx, cy, S * (0.5 + k * 2.4), 0, TAU);
        c.stroke();
      }
    }
    c.globalCompositeOperation = 'source-over';
  };

  // tinted halo cache
  const tintCache = new Map<string, HTMLCanvasElement>();
  function tint(sprite: HTMLCanvasElement, col: RGB): HTMLCanvasElement {
    const key = `${(col[0] / 8) | 0}-${(col[1] / 8) | 0}-${(col[2] / 8) | 0}-${sprite.width}`;
    const hit = tintCache.get(key);
    if (hit) return hit;
    const out = document.createElement('canvas');
    out.width = sprite.width;
    out.height = sprite.height;
    const oc = out.getContext('2d');
    if (oc) {
      oc.drawImage(sprite, 0, 0);
      oc.globalCompositeOperation = 'source-in';
      oc.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
      oc.fillRect(0, 0, out.width, out.height);
    }
    if (tintCache.size > 40) tintCache.clear();
    tintCache.set(key, out);
    return out;
  }

  let prevT = 0;
  return {
    resize,
    setScene,
    frame(t: number) {
      const dt = Math.min(0.1, Math.max(0.001, t - prevT || 0.016));
      prevT = t;
      render(t, dt, false);
    },
    drawStill() {
      render(2.6, 0.016, true);
    },
    destroy() {
      tintCache.clear();
    },
  };
}
