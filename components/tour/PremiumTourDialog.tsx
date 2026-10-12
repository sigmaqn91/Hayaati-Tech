'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Crown, Loader2, Ticket, X } from 'lucide-react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import { Beam } from '@/components/Beam';
import {
  OPEN_PREMIUM_EVENT,
  checkCoupon,
  goToFounderForCoupon,
  saveCoupon,
  savedCoupon,
  startFullTour,
  type CouponState,
} from '@/lib/tourCoupon';

const MESSAGES: Partial<Record<CouponState | 'empty' | 'busy', string>> = {
  empty: 'Please enter your coupon code.',
  invalid: 'This code is not valid. Please check it and try again.',
  already_used: 'This coupon has already been used. Each coupon works only once.',
  not_yours: 'This coupon belongs to another visitor. Please request your own.',
  rate_limited: 'Too many tries. Please wait a few minutes.',
  error: 'Could not check the coupon right now. Please try again.',
  busy: 'Jarvis is busy right now. Your coupon is safe; please try again in a moment.',
};

interface PremiumTourDialogProps {
  open: boolean;
  onClose: () => void;
}

/** "First time free" box of the Premium Tour: enter a coupon, or request one in the founder section. */
export function PremiumTourDialog({ open, onClose }: PremiumTourDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useOverlayHistory(open, onClose);

  // Smooth in / out.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const id = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStarting(false);
    setCode((c) => c || savedCoupon());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const begin = async (value: string) => {
    const clean = value.trim().toUpperCase();
    if (!clean) {
      setError(MESSAGES.empty!);
      inputRef.current?.focus();
      return;
    }
    setChecking(true);
    setError(null);
    const status = await checkCoupon(clean);
    setChecking(false);
    if (status !== 'valid') {
      setError(MESSAGES[status] || MESSAGES.error!);
      if (status === 'already_used') saveCoupon(null);
      return;
    }
    setStarting(true);
    saveCoupon(clean);
    window.setTimeout(() => {
      startFullTour(clean);
      onClose();
    }, 650);
  };
  const beginRef = useRef(begin);
  beginRef.current = begin;

  // Coming back from the founder section with a fresh code: filled in, then the tour starts by itself.
  // A tour that the server refused (coupon used meanwhile, server busy) reopens this box with the reason.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ code?: string; autoStart?: boolean }>).detail;
      if (d?.code) setCode(d.code);
      if (d?.code && d.autoStart) window.setTimeout(() => beginRef.current(d.code!), 700);
    };
    const onStatus = (e: Event) => {
      const d = (e as CustomEvent<{ state?: string; mode?: string; code?: string; reason?: string }>).detail;
      if (d?.state !== 'error' || d.mode !== 'full') return;
      window.dispatchEvent(new CustomEvent(OPEN_PREMIUM_EVENT, { detail: {} }));
      const reason = d.code === 'coupon_rejected' ? (d.reason as CouponState) : 'busy';
      if (reason === 'already_used') saveCoupon(null);
      window.setTimeout(() => setError(MESSAGES[reason] || MESSAGES.error!), 60);
    };
    window.addEventListener(OPEN_PREMIUM_EVENT, onOpen);
    window.addEventListener('jarvis:tour-status', onStatus);
    return () => {
      window.removeEventListener(OPEN_PREMIUM_EVENT, onOpen);
      window.removeEventListener('jarvis:tour-status', onStatus);
    };
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  const busy = checking || starting;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-tour-title"
      data-jarvis-ui
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-300 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-[#020409]/75 backdrop-blur-[3px]" aria-hidden="true" onClick={onClose} />
      <div
        className={`pt-card relative w-full max-w-[460px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          shown ? 'translate-y-0 scale-100' : 'translate-y-3 scale-[0.98]'
        }`}
      >
        <Beam />
        <div className="pt-card__glass relative overflow-hidden rounded-2xl">
          <span className="pt-card__aurora" aria-hidden="true" />
          <div className="relative p-6 sm:p-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#c4b5fd]/35 bg-[#c4b5fd]/[0.07] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#ddd6fe]">
              <Crown className="w-3.5 h-3.5" />
              <span>First time free</span>
            </div>
            <h2 id="premium-tour-title" className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Premium Tour with Jarvis
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              The full guided tour, about 14 minutes. Jarvis walks you through every era and all 42 future technologies, opening each card for you.
            </p>

            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!busy) begin(code);
              }}
            >
              <label htmlFor="premium-coupon" className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
                Coupon code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="premium-coupon"
                  ref={inputRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="HY-XXXX-XXXX"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={16}
                  className="min-w-0 flex-1 h-12 rounded-lg border border-white/12 bg-black/35 px-4 font-mono text-[15px] tracking-[0.14em] text-white placeholder:text-slate-600 outline-none focus:border-[#38e8ff]/70 focus:shadow-[0_0_0_3px_rgba(56,232,255,0.12)]"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="shrink-0 h-12 px-4 rounded-lg bg-[#38e8ff] text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 transition-colors cursor-pointer disabled:opacity-70 flex items-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{starting ? 'Starting' : 'Start tour'}</span>
                </button>
              </div>
              <p className={`mt-2 min-h-[1.25rem] text-[12.5px] ${error ? 'text-rose-300' : 'text-emerald-300'}`} aria-live="polite">
                {error || (starting ? 'Coupon accepted. Your Full Tour is starting…' : '')}
              </p>
            </form>

            <div className="mt-2 flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              <span>No coupon yet</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onClose();
                window.setTimeout(() => goToFounderForCoupon(), 40);
              }}
              className="mt-4 w-full min-h-[48px] rounded-lg border border-[#c4b5fd]/40 bg-[#c4b5fd]/[0.06] text-[#ede9fe] font-mono text-xs font-bold uppercase tracking-wider hover:border-[#c4b5fd]/80 hover:bg-[#c4b5fd]/[0.12] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Ticket className="w-4 h-4" />
              <span>Request coupon</span>
            </button>
            <p className="mt-2 text-center text-[12px] text-slate-400">
              Your personal one-time code is ready in a few seconds, in the founder section.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
