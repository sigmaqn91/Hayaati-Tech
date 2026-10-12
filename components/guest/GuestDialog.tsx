'use client';

/**
 * Guest access (3-line menu > Guest). A friend of Aliya Khan types the one-time guest code she sent;
 * the server checks and uses it, and the guest perks open (today: one free Premium Tour, no coupon needed).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Gift, Loader2, X, Crown, KeyRound } from 'lucide-react';
import { useOverlayHistory } from '@/hooks/use-overlay-history';
import { applyCouponFromFounder, saveCoupon, savedCoupon } from '@/lib/tourCoupon';

const ERRORS: Record<string, string> = {
  invalid: 'This guest code is not valid. Please check it and try again.',
  already_used: 'This guest code has already been used. Each code works only once.',
  revoked: 'This guest code has been switched off.',
  rate_limited: 'Too many tries. Please wait a few minutes.',
  store_error: 'Could not check the code right now. Please try again.',
};

export function GuestDialog({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [welcome, setWelcome] = useState<{ name: string; coupon: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useOverlayHistory(true, onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    // Already a guest in this browser: show the welcome with the saved Premium Tour code.
    fetch('/api/guest', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.guest) setWelcome({ name: d.name, coupon: savedCoupon() });
      })
      .catch(() => {});
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        inputRef.current?.blur();
        if (d.coupon) saveCoupon(d.coupon);
        setWelcome({ name: d.name, coupon: d.coupon || '' });
      } else setError(ERRORS[d.reason] || ERRORS.store_error);
    } catch {
      setError(ERRORS.store_error);
    } finally {
      setBusy(false);
    }
  };

  const startTour = () => {
    if (!welcome?.coupon) return;
    const c = welcome.coupon;
    onClose();
    window.setTimeout(() => applyCouponFromFounder(c), 250);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guest access"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#02040a]/75 backdrop-blur-[3px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rt-card !p-5 !bg-[#060a12]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <button type="button" onClick={onClose} className="absolute top-3 end-3 p-2 text-slate-400 hover:text-white" aria-label="Close">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
        <p className="rt-label flex items-center gap-2">
          <Gift className="w-4 h-4" aria-hidden="true" /> Guest access
        </p>

        {welcome ? (
          <div className="mt-3">
            <h3 className="text-xl font-semibold text-white">Welcome, {welcome.name}</h3>
            <p className="mt-1.5 text-sm text-slate-300">
              You are a guest of Aliya Khan. Your Premium Tour is unlocked, free, one time.
            </p>
            {welcome.coupon ? (
              <button type="button" onClick={startTour} className="rt-btn rt-btn--solid w-full mt-4">
                <Crown className="w-4 h-4" aria-hidden="true" /> Start Premium Tour
              </button>
            ) : (
              <p className="mt-3 text-xs text-slate-500">Your guest tour has been used. Enjoy the website!</p>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-slate-300">Enter the guest code you received from Aliya Khan.</p>
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="G-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="rt-input font-mono tracking-[0.2em] text-center"
              style={{ fontSize: '16px' }}
              aria-label="Guest code"
            />
            <button type="submit" disabled={!code.trim() || busy} className="rt-btn rt-btn--solid">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Unlock
            </button>
            {error && <p className="text-sm text-[#ff8a8a]">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
