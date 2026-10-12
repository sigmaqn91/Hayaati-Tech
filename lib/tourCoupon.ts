// Browser side of the Premium Tour coupon flow:
//   Premium Tour box (hero) -> "Request coupon" -> founder section (coupon appears after a few seconds)
//   -> "Apply for Full Tour" -> back to the hero, code filled in, the full tour starts.
// The code itself is created and checked only on the server (app/api/tour/coupon, lib/couponStore.ts).

import { NAV_OFFSET, docTop, glideTo, nextFrames, sleep } from '@/lib/jarvisScreen';

export const COUPON_STORAGE_KEY = 'hayaati_tour_coupon';
/** Founder section shows the request panel (only for visitors who came from the Premium Tour box). */
export const COUPON_FLOW_EVENT = 'tour:coupon-flow';
/** Opens the Premium Tour box in the hero: { code?, autoStart?, error? }. */
export const OPEN_PREMIUM_EVENT = 'tour:open-premium';

export type CouponState = 'valid' | 'invalid' | 'already_used' | 'not_yours' | 'rate_limited' | 'error';

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

export function savedCoupon(): string {
  try {
    return localStorage.getItem(COUPON_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCoupon(code: string | null) {
  try {
    if (code) localStorage.setItem(COUPON_STORAGE_KEY, code);
    else localStorage.removeItem(COUPON_STORAGE_KEY);
  } catch {}
}

export async function checkCoupon(code: string): Promise<CouponState> {
  try {
    const res = await fetch('/api/tour/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', code }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) return 'rate_limited';
    return (data?.status as CouponState) || (res.ok ? 'valid' : 'error');
  } catch {
    return 'error';
  }
}

export async function requestCouponCode(): Promise<{ ok: true; code: string } | { ok: false; reason: string }> {
  try {
    const res = await fetch('/api/tour/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request' }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.code) return { ok: true, code: String(data.code) };
    return { ok: false, reason: String(data?.reason || (res.status === 429 ? 'rate_limited' : 'error')) };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export function startFullTour(code: string) {
  emit('jarvis:start-tour', { mode: 'full', coupon: code });
}

export function startQuickTour() {
  emit('jarvis:start-tour', { mode: 'quick' });
}

/** Slow, even glide (used to pass over the founder photo while the coupon is being prepared). */
function slowGlide(to: number, duration: number): Promise<void> {
  const from = window.scrollY;
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const target = Math.min(Math.max(0, to), max);
  const dist = target - from;
  if (Math.abs(dist) < 2) return Promise.resolve();
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  return new Promise((resolve) => {
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    window.setTimeout(finish, duration + 500);
    const step = (now: number) => {
      if (done) return;
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo({ top: from + dist * ease(t), behavior: 'instant' as ScrollBehavior });
      if (t < 1) requestAnimationFrame(step);
      else finish();
    };
    requestAnimationFrame(step);
  });
}

/**
 * "Request coupon": the founder section opens its coupon panel, the page jumps straight to the founder
 * section and then glides slowly over the founder photo down to the panel, where the code appears.
 */
export async function goToFounderForCoupon() {
  emit(COUPON_FLOW_EVENT, { active: true });
  await nextFrames();
  const about = document.getElementById('about');
  if (!about) return;
  // Straight to the founder section (no long scroll through the whole page).
  window.scrollTo({ top: docTop(about) - NAV_OFFSET + 1, behavior: 'instant' as ScrollBehavior });
  await nextFrames();
  const panel = document.querySelector<HTMLElement>('[data-coupon-panel]');
  if (!panel) return;
  const vh = window.innerHeight;
  const r = panel.getBoundingClientRect();
  // End with the panel at the bottom of the screen, so as much of the photo as possible stays in view above it.
  const target = window.scrollY + r.bottom - vh + 28;
  await sleep(250);
  await slowGlide(target, 4000);
}

/** "Apply for Full Tour": back to the hero, the code is filled in and the full tour starts. */
export async function applyCouponFromFounder(code: string) {
  saveCoupon(code);
  await glideTo(0);
  emit(OPEN_PREMIUM_EVENT, { code, autoStart: true });
  // The founder panel stays until the visitor has left the section, then folds away quietly.
  window.setTimeout(() => emit(COUPON_FLOW_EVENT, { active: false }), 1200);
}
