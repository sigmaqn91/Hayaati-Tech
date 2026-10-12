// Sounds for the Premium Tour coupon flow (button press, request flying to the desk printer, traffic light,
// countdown, receipt printing, gift wrap and arrival). Everything is synthesised live with the Web Audio API:
// nothing to download, so there is no loading delay, and the sounds play the instant their moment happens.
// The audio context is unlocked on the visitor's own click (browsers only allow sound after a tap).

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let out: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let crinkleBuf: AudioBuffer | null = null;

function makeNoise(c: Ctx, seconds: number) {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/** Crumpling paper: sparse sharp crackles of random strength (what makes wrapping paper sound real). */
function makeCrinkle(c: Ctx, seconds: number) {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  let i = 0;
  while (i < d.length) {
    const amp = Math.pow(Math.random(), 2.2);
    const len = Math.floor(c.sampleRate * (0.0006 + Math.random() * 0.004));
    for (let k = 0; k < len && i + k < d.length; k++) d[i + k] += (Math.random() * 2 - 1) * amp * (1 - k / len);
    i += Math.floor(c.sampleRate * (0.001 + Math.random() * 0.012));
  }
  return b;
}

function ready(): Ctx | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC({ latencyHint: 'interactive' });
    } catch {
      return null;
    }
    // Loud and full, but never clipping: a gentle limiter in front of the speakers.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.12;
    out = ctx.createGain();
    out.gain.value = 1;
    out.connect(limiter);
    limiter.connect(ctx.destination);
    noiseBuf = makeNoise(ctx, 2);
    crinkleBuf = makeCrinkle(ctx, 2);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Call from inside a click handler, so the following sounds are allowed to play. */
export function unlockCouponSounds() {
  ready();
}

// ---------- building blocks ----------

interface Env {
  gain: number;
  attack?: number;
  decay: number;
}

function env(c: Ctx, t: number, { gain, attack = 0.002, decay }: Env) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function tone(
  t: number,
  freq: number,
  e: Env,
  opts: { type?: OscillatorType; to?: number; pan?: number; dest?: AudioNode } = {},
) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = opts.type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (e.attack || 0.002) + e.decay);
  const g = env(c, t, e);
  o.connect(g);
  connect(g, opts.pan, opts.dest);
  o.start(t);
  o.stop(t + (e.attack || 0.002) + e.decay + 0.05);
}

function noise(
  t: number,
  dur: number,
  e: Env,
  f: { type?: BiquadFilterType; freq: number; to?: number; q?: number; pan?: number; panTo?: number; buf?: AudioBuffer | null },
) {
  const c = ctx!;
  const s = c.createBufferSource();
  s.buffer = f.buf || noiseBuf;
  s.loop = true;
  const bq = c.createBiquadFilter();
  bq.type = f.type || 'bandpass';
  bq.frequency.setValueAtTime(f.freq, t);
  if (f.to) bq.frequency.exponentialRampToValueAtTime(f.to, t + dur);
  bq.Q.value = f.q ?? 1;
  const g = env(c, t, e);
  s.connect(bq);
  bq.connect(g);
  if (f.panTo !== undefined && c.createStereoPanner) {
    const p = c.createStereoPanner();
    p.pan.setValueAtTime(f.pan ?? 0, t);
    p.pan.linearRampToValueAtTime(f.panTo, t + dur);
    g.connect(p);
    p.connect(out!);
  } else connect(g, f.pan);
  s.start(t, Math.random() * 1.5);
  s.stop(t + dur + 0.05);
}

function connect(node: AudioNode, pan?: number, dest?: AudioNode) {
  const c = ctx!;
  if (pan && c.createStereoPanner) {
    const p = c.createStereoPanner();
    p.pan.value = pan;
    node.connect(p);
    p.connect(dest || out!);
  } else node.connect(dest || out!);
}

/** A glassy bell: a few slightly inharmonic partials, the high ones fading first. */
function bell(t: number, freq: number, gain: number, decay = 1.4, pan = 0) {
  const partials: [number, number, number][] = [
    [1, 1, 1],
    [2.0, 0.42, 0.7],
    [3.01, 0.22, 0.45],
    [4.18, 0.12, 0.3],
    [5.43, 0.06, 0.2],
  ];
  for (const [r, a, d] of partials) tone(t, freq * r, { gain: gain * a, attack: 0.004, decay: decay * d }, { pan });
}

/** A solid little relay inside the machine switching over: two close clicks, a tiny body thump. */
function relay(t: number) {
  noise(t, 0.012, { gain: 0.9, decay: 0.012 }, { freq: 3200, q: 1.4 });
  noise(t + 0.014, 0.01, { gain: 0.5, decay: 0.01 }, { freq: 4200, q: 2 });
  tone(t, 210, { gain: 0.45, decay: 0.05 }, { to: 120 });
}

const now = () => ctx!.currentTime + 0.005;

// ---------- the sounds ----------

/** A soft, expensive-feeling button press: a dry tactile click with a low body. */
export function playPress() {
  if (!ready()) return;
  const t = now();
  noise(t, 0.008, { gain: 0.85, decay: 0.008 }, { type: 'highpass', freq: 2400 });
  tone(t, 170, { gain: 0.7, decay: 0.07 }, { to: 85 });
  tone(t + 0.002, 2900, { gain: 0.12, decay: 0.02 });
}

/** The founder section opens: an airy shimmer that swells and settles. */
export function playReveal() {
  if (!ready()) return;
  const t = now() + 0.03;
  noise(t, 0.9, { gain: 0.22, attack: 0.25, decay: 0.65 }, { freq: 5200, to: 2600, q: 0.7 });
  [659.25, 987.77, 1318.5].forEach((f, i) =>
    tone(t + i * 0.06, f, { gain: 0.16 - i * 0.03, attack: 0.18, decay: 1.2 }, { pan: (i - 1) * 0.35 }),
  );
}

/** The request flies to the printer like a sent letter: a whoosh across the room, then it lands in the slot. */
export function playSend(ms: number) {
  if (!ready()) return;
  const t = now();
  const d = ms / 1000;
  noise(t, d * 0.9, { gain: 0.75, attack: d * 0.38, decay: d * 0.52 }, { freq: 500, to: 2200, q: 1.1, pan: -0.6, panTo: 0.5 });
  noise(t + d * 0.1, d * 0.7, { gain: 0.25, attack: d * 0.3, decay: d * 0.4 }, { type: 'highpass', freq: 5000, pan: -0.4, panTo: 0.5 });
  // lands: a light paper tap into the slot, the machine wakes up with a soft hum
  const land = t + d * 0.92;
  noise(land, 0.03, { gain: 0.6, decay: 0.03 }, { freq: 1800, q: 1.2, pan: 0.4 });
  tone(land, 140, { gain: 0.35, decay: 0.08 }, { to: 90, pan: 0.4 });
  tone(land + 0.03, 110, { gain: 0.08, attack: 0.08, decay: 0.35 }, { type: 'sawtooth', to: 165 });
}

/** Yellow light comes on: relay click and a warm, calm two-note "please wait" chime. */
export function playYellow() {
  if (!ready()) return;
  const t = now();
  relay(t);
  bell(t + 0.03, 783.99, 0.36, 1.1);
  bell(t + 0.2, 659.25, 0.3, 1.3);
}

/** One second of the countdown: a precise mechanical tick; the last three are a touch brighter. */
export function playTick(left: number) {
  if (!ready()) return;
  const t = now();
  const last = left <= 3;
  const hi = left % 2 === 0;
  noise(t, 0.012, { gain: last ? 0.85 : 0.65, decay: 0.012 }, { freq: hi ? 4200 : 3400, q: 6 });
  tone(t, hi ? 1850 : 1560, { gain: last ? 0.3 : 0.2, decay: 0.035 });
  tone(t, 420, { gain: 0.18, decay: 0.03 });
}

/** Green light: relay click and a bright rising chime, approved. */
export function playGreen() {
  if (!ready()) return;
  const t = now();
  relay(t);
  [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => bell(t + 0.03 + i * 0.075, f, 0.3 - i * 0.03, 1.5, (i - 1.5) * 0.2));
}

/** Red light: relay click and a low, soft descending tone, no coupon. */
export function playRed() {
  if (!ready()) return;
  const t = now();
  relay(t);
  tone(t + 0.03, 329.63, { gain: 0.42, attack: 0.01, decay: 0.32 }, { type: 'triangle' });
  tone(t + 0.3, 261.63, { gain: 0.42, attack: 0.01, decay: 0.55 }, { type: 'triangle' });
  tone(t + 0.3, 130.81, { gain: 0.2, attack: 0.02, decay: 0.5 });
}

/**
 * A thermal receipt printer: the stepper motor buzzes line by line ("zzrt zzrt zzrt") with paper sliding out,
 * then the receipt is torn off against the cutter.
 */
export function playPrint(ms: number) {
  if (!ready()) return;
  const c = ctx!;
  const t0 = now();
  const total = ms / 1000;
  const tearAt = total - 0.22;

  // Motor: a buzzy oscillator, gated into short line bursts, with a little pitch wander like a real stepper.
  const motor = c.createOscillator();
  motor.type = 'square';
  const wobble = c.createOscillator();
  wobble.frequency.value = 37;
  const wobbleGain = c.createGain();
  wobbleGain.gain.value = 28;
  wobble.connect(wobbleGain);
  wobbleGain.connect(motor.frequency);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1500;
  bp.Q.value = 1.3;
  const gate = c.createGain();
  gate.gain.setValueAtTime(0.0001, t0);
  motor.connect(bp);
  bp.connect(gate);
  gate.connect(out!);

  let t = t0;
  let line = 0;
  while (t < t0 + tearAt - 0.08) {
    const on = 0.055 + Math.random() * 0.03;
    const f = 980 + Math.random() * 140 + (line % 3) * 40;
    motor.frequency.setValueAtTime(f, t);
    gate.gain.setValueAtTime(0.0001, t);
    gate.gain.exponentialRampToValueAtTime(0.32, t + 0.006);
    gate.gain.setValueAtTime(0.3, t + on - 0.01);
    gate.gain.exponentialRampToValueAtTime(0.0001, t + on);
    // paper friction under each line and a tiny feed click
    noise(t, on, { gain: 0.16, attack: 0.005, decay: on }, { type: 'highpass', freq: 3600 });
    noise(t + on, 0.008, { gain: 0.3, decay: 0.008 }, { freq: 2600, q: 3 });
    t += on + 0.022 + Math.random() * 0.012;
    line++;
  }
  // low hum of the machine body underneath
  tone(t0, 120, { gain: 0.1, attack: 0.05, decay: tearAt }, { type: 'triangle' });
  motor.start(t0);
  wobble.start(t0);
  motor.stop(t0 + tearAt);
  wobble.stop(t0 + tearAt);

  // Tear-off: a quick ripping crackle sweeping down, then the cutter's snap.
  const tear = t0 + tearAt;
  noise(tear, 0.2, { gain: 1.0, attack: 0.01, decay: 0.19 }, { freq: 3000, to: 1400, q: 0.9, buf: crinkleBuf });
  noise(tear, 0.16, { gain: 0.25, attack: 0.02, decay: 0.14 }, { freq: 2200, to: 1200, q: 0.8 });
  noise(tear + 0.19, 0.012, { gain: 0.7, decay: 0.012 }, { freq: 5000, q: 2 });
}

/** Gift wrapping on the desk: paper folded and crinkled around the coupon, then the ribbon pulled tight. */
export function playWrap(ms: number) {
  if (!ready()) return;
  const t = now();
  const d = ms / 1000;
  noise(t, d * 0.35, { gain: 2.2, attack: 0.03, decay: d * 0.32 }, { freq: 3800, q: 0.8, buf: crinkleBuf, pan: -0.2 });
  noise(t + d * 0.3, d * 0.35, { gain: 2.0, attack: 0.03, decay: d * 0.3 }, { freq: 3000, q: 0.8, buf: crinkleBuf, pan: 0.2 });
  // fold swishes
  noise(t + d * 0.05, 0.16, { gain: 0.6, attack: 0.05, decay: 0.11 }, { freq: 1400, to: 2600, q: 1.2 });
  noise(t + d * 0.4, 0.16, { gain: 0.6, attack: 0.05, decay: 0.11 }, { freq: 1600, to: 2800, q: 1.2 });
  // ribbon pulled through: a quick rising zip, then a satin snap
  noise(t + d * 0.72, 0.17, { gain: 1.0, attack: 0.02, decay: 0.15 }, { freq: 900, to: 4200, q: 4 });
  noise(t + d * 0.9, 0.01, { gain: 0.9, decay: 0.01 }, { freq: 3500, q: 2 });
}

/** The wrapped gift flies down to the panel and lands with a soft thud and a little sparkle. */
export function playGiftFly(ms: number) {
  if (!ready()) return;
  const t = now();
  const d = ms / 1000;
  noise(t, d * 0.85, { gain: 0.9, attack: d * 0.35, decay: d * 0.5 }, { freq: 1800, to: 600, q: 1.1, pan: 0.4, panTo: -0.1 });
  const land = t + d * 0.9;
  tone(land, 150, { gain: 0.55, decay: 0.12 }, { to: 75 });
  noise(land, 0.05, { gain: 0.4, decay: 0.05 }, { type: 'lowpass', freq: 900 });
  const sparkle = [2093, 2637.02, 3135.96, 2349.32, 3520, 2793.83];
  sparkle.forEach((f, i) => bell(land + 0.04 + i * 0.045, f, 0.11, 0.7, (Math.random() - 0.5) * 0.8));
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => bell(land + 0.06, f, 0.16, 2.0));
}

/** Copy: a tiny press with a crisp confirm tick. */
export function playCopy() {
  if (!ready()) return;
  playPress();
  bell(now() + 0.06, 1760, 0.18, 0.5);
}

/** Apply: a press and a short, assured two-note confirm. */
export function playApply() {
  if (!ready()) return;
  playPress();
  playConfirm();
}

/** Short, assured two-note confirm (coupon accepted). */
export function playConfirm() {
  if (!ready()) return;
  const t = now();
  bell(t + 0.05, 880, 0.26, 0.9);
  bell(t + 0.16, 1318.51, 0.24, 1.2);
}

/** A soft low "not quite": the code was not accepted. */
export function playError() {
  if (!ready()) return;
  const t = now();
  tone(t, 311.13, { gain: 0.32, attack: 0.008, decay: 0.22 }, { type: 'triangle' });
  tone(t + 0.16, 233.08, { gain: 0.32, attack: 0.008, decay: 0.35 }, { type: 'triangle' });
}
