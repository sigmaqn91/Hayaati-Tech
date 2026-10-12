// Sounds for the Premium Tour coupon flow: button press, the request flying to the desk printer, the traffic
// light (yellow / green / red), the clock ticking through the countdown, the receipt printing and tearing off,
// gift wrapping and the gift landing in the panel.
// Every sound is a real recording (CC0 / public domain, see public/sounds/coupon/CREDITS.md), trimmed and mixed
// warm (no harsh highs). The small files (about 240 KB together) are downloaded and decoded quietly once the page
// is idle, so each sound plays the instant its moment happens.

const NAMES = [
  'press',
  'click',
  'whoosh',
  'swoosh-long',
  'relay',
  'snap',
  'tick',
  'ding',
  'bell',
  'bell-soft',
  'bell-small',
  'printer',
  'tear',
  'crinkle',
  'rustle',
  'ribbon',
] as const;
type Name = (typeof NAMES)[number];

const BASE = '/sounds/coupon/';

let loading: Promise<void> | null = null;
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
const buffers = new Map<Name, AudioBuffer>();

/**
 * Downloads and decodes the sound files ahead of time (no sound is started and no tap is needed: decoding runs
 * in an offline audio context). Safe to call many times.
 */
export function prefetchCouponSounds() {
  if (typeof window === 'undefined' || loading) return;
  const OAC: typeof OfflineAudioContext | undefined =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  let decoder: BaseAudioContext | null = null;
  try {
    decoder = OAC ? new OAC(1, 1, 44100) : null;
  } catch {
    decoder = null;
  }
  loading = Promise.all(
    NAMES.map((n) =>
      fetch(`${BASE}${n}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then((b) => (decoder || ready())!.decodeAudioData(b))
        .then((buf) => {
          buffers.set(n, buf);
        })
        .catch(() => {})
    )
  ).then(() => {});
}

function ready(): AudioContext | null {
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
    // Full and clear, never distorting on a phone speaker: a gentle limiter in front of the output.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -4;
    limiter.knee.value = 4;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.15;
    out = ctx.createGain();
    out.gain.value = 1;
    out.connect(limiter);
    limiter.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  prefetchCouponSounds();
  return ctx;
}

/** Call from inside a click handler, so the following sounds are allowed to play. */
export function unlockCouponSounds() {
  ready();
}

/** Plays one recording `delay` seconds from now. A sound asked for before its file is ready plays as soon as it
 * is, but only if that is still within a moment (never late and out of place). */
function play(name: Name, { delay = 0, gain = 1, rate = 1 }: { delay?: number; gain?: number; rate?: number } = {}) {
  const c = ready();
  if (!c) return;
  const askedAt = c.currentTime;
  const start = () => {
    const buf = buffers.get(name);
    if (!buf || !out) return;
    const late = c.currentTime - askedAt;
    if (late > 0.15) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(out);
    src.start(c.currentTime + Math.max(0, delay - late) + 0.005);
  };
  if (buffers.has(name)) start();
  else loading?.then(start);
}

// ---------- the moments ----------

/** A soft, solid button press. */
export function playPress() {
  play('press', { gain: 0.9 });
}

/** The founder section opens: a soft, airy swoosh. */
export function playReveal() {
  play('swoosh-long', { delay: 0.04, gain: 0.32 });
}

/** The request flies to the printer like a paper plane, then drops into its slot. */
export function playSend(ms: number) {
  play('whoosh', { gain: 0.75, rate: 0.85 });
  play('snap', { delay: (ms / 1000) * 0.92, gain: 0.5 });
}

/** Yellow light: the machine's switch clicks and a soft "please wait" ding. */
export function playYellow() {
  play('relay', { gain: 0.75 });
  play('ding', { delay: 0.05, gain: 0.7 });
}

/** One second of the countdown: the tick of a real clock's second hand. */
export function playTick(left: number) {
  play('tick', { gain: left <= 3 ? 1 : 0.85 });
}

/** Green light: switch click and a warm bell rising to a second note, approved. */
export function playGreen() {
  play('relay', { gain: 0.75 });
  play('bell', { delay: 0.05, gain: 0.7 });
  play('bell', { delay: 0.22, gain: 0.5, rate: 1.26 });
}

/** Red light: switch click and a low, soft falling bell, no coupon. */
export function playRed() {
  play('relay', { gain: 0.75 });
  play('bell-small', { delay: 0.05, gain: 0.7, rate: 0.7 });
  play('bell-small', { delay: 0.32, gain: 0.6, rate: 0.6 });
}

/** The receipt printer prints the coupon in two quick, light passes, then it is torn off. */
export function playPrint(ms: number) {
  const d = ms / 1000;
  play('printer', { gain: 0.85 });
  play('printer', { delay: Math.min(0.62, d * 0.42), gain: 0.85 });
  play('tear', { delay: Math.max(0.9, d - 0.3), gain: 0.5 });
}

/** Gift wrapping on the desk: paper folded and crinkled, then the ribbon pulled. */
export function playWrap(ms: number) {
  const d = ms / 1000;
  play('crinkle', { gain: 0.75 });
  play('rustle', { delay: d * 0.25, gain: 0.45 });
  play('crinkle', { delay: d * 0.45, gain: 0.6, rate: 0.9 });
  play('ribbon', { delay: d * 0.72, gain: 0.6 });
}

/** The wrapped gift flies down to the panel and lands with a soft bell. */
export function playGiftFly(ms: number) {
  const d = ms / 1000;
  play('whoosh', { gain: 0.6, rate: 0.75 });
  play('snap', { delay: d * 0.9, gain: 0.35 });
  play('bell-soft', { delay: d * 0.92, gain: 0.7 });
}

/** Copy: a light click with a tiny confirming bell. */
export function playCopy() {
  play('click', { gain: 0.85 });
  play('bell-small', { delay: 0.05, gain: 0.3, rate: 1.4 });
}

/** Short, assured confirm (coupon accepted). */
export function playConfirm() {
  play('bell-soft', { gain: 0.6 });
  play('bell', { delay: 0.14, gain: 0.4, rate: 1.26 });
}

/** Apply: a press and the confirm. */
export function playApply() {
  playPress();
  play('bell-soft', { delay: 0.05, gain: 0.6 });
}

/** A soft low tone: the code was not accepted. */
export function playError() {
  play('bell-small', { gain: 0.55, rate: 0.62 });
}
