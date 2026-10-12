// Browser side of the Premium Tour coupon flow:
//   Premium Tour box (hero) -> "Request coupon" -> founder section (coupon appears after a few seconds)
//   -> "Apply for Full Tour" -> back to the hero, code filled in, the full tour starts.
// The code itself is created and checked only on the server (app/api/tour/coupon, lib/couponStore.ts).

import { NAV_OFFSET, docTop, jumpTo, nextFrames } from '@/lib/jarvisScreen';
import { isOwnerUi } from '@/lib/ownerState';

export const COUPON_STORAGE_KEY = 'hayaati_tour_coupon';
/** Founder section shows the request panel (only for visitors who came from the Premium Tour box). */
export const COUPON_FLOW_EVENT = 'tour:coupon-flow';
/** Opens the Premium Tour box in the hero: { code?, autoStart?, error? }. */
export const OPEN_PREMIUM_EVENT = 'tour:open-premium';

/** Coupon printer on the founder photo's desk: { stage, count?, code? } (see DeskCouponMachine). */
export const COUPON_STAGE_EVENT = 'tour:coupon-stage';
export type CouponStage = 'idle' | 'sending' | 'waiting' | 'printing' | 'wrapping' | 'flying' | 'ready' | 'denied';
export interface CouponStageDetail {
  stage: CouponStage;
  count?: number;
  code?: string;
}

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
      body: JSON.stringify({ action: 'check', code, ownerMode: isOwnerUi() }),
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
      body: JSON.stringify({ action: 'request', ownerMode: isOwnerUi() }),
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

/**
 * "Request coupon": the founder section opens straight away (no scrolling), with the founder photo above and the
 * coupon panel below it in view. The request then travels to the little printer on the desk in the photo.
 */
export async function goToFounderForCoupon() {
  emit(COUPON_FLOW_EVENT, { active: true }); // the panel is drawn synchronously
  const about = document.getElementById('about');
  const panel = document.querySelector<HTMLElement>('[data-coupon-panel]');
  if (!about) return;
  const aboutTop = docTop(about) - NAV_OFFSET;
  if (!panel) return jumpTo(aboutTop);
  // The panel sits at the bottom of the screen, so as much of the photo (and its desk) as possible is above it.
  const target = docTop(panel) + panel.offsetHeight - window.innerHeight + 20;
  jumpTo(Math.max(aboutTop, target));
}

/** "Apply for Full Tour": back to the hero, the code is filled in and the full tour starts. */
export async function applyCouponFromFounder(code: string) {
  saveCoupon(code);
  jumpTo(0);
  await nextFrames();
  emit(OPEN_PREMIUM_EVENT, { code, autoStart: true });
  // The founder panel stays until the visitor has left the section, then folds away quietly.
  window.setTimeout(() => emit(COUPON_FLOW_EVENT, { active: false }), 1200);
}
