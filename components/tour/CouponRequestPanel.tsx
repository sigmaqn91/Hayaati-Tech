'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Crown, Compass, Sparkles } from 'lucide-react';
import { Beam } from '@/components/Beam';
import { COUPON_FLOW_EVENT, applyCouponFromFounder, requestCouponCode, saveCoupon, startQuickTour } from '@/lib/tourCoupon';
import { glideTo } from '@/lib/jarvisScreen';

type PanelState = 'preparing' | 'ready' | 'used' | 'error';

const WAIT_MS = 5000;

/**
 * Coupon area in the founder section, under the founder photo (never on it). It exists only for a visitor who
 * pressed "Request coupon" in the Premium Tour box; everyone else sees the founder section exactly as before.
 */
export function CouponRequestPanel() {
  const [active, setActive] = useState(false);
  const [state, setState] = useState<PanelState>('preparing');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const runRef = useRef(0);

  useEffect(() => {
    const onFlow = (e: Event) => {
      const on = Boolean((e as CustomEvent<{ active?: boolean }>).detail?.active);
      if (on) {
        const run = ++runRef.current;
        setLeaving(false);
        setActive(true);
        setState('preparing');
        setCode('');
        setCopied(false);
        const started = Date.now();
        requestCouponCode().then(async (res) => {
          // A calm few seconds while the page passes over the founder photo.
          const wait = WAIT_MS - (Date.now() - started);
          if (wait > 0) await new Promise((r) => window.setTimeout(r, wait));
          if (run !== runRef.current) return;
          if (res.ok) {
            setCode(res.code);
            saveCoupon(res.code);
            setState('ready');
          } else {
            setState(res.reason === 'already_used' ? 'used' : 'error');
          }
        });
      } else {
        setLeaving(true);
        window.setTimeout(() => setActive(false), 450);
      }
    };
    window.addEventListener(COUPON_FLOW_EVENT, onFlow);
    return () => window.removeEventListener(COUPON_FLOW_EVENT, onFlow);
  }, []);

  // The ready panel is taller than the "preparing" one: keep it fully on screen (photo stays just above it).
  useEffect(() => {
    if (state === 'preparing' || !active) return;
    const id = window.setTimeout(() => {
      const el = document.querySelector('[data-coupon-panel]');
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight - 12) glideTo(window.scrollY + r.bottom - window.innerHeight + 28);
    }, 80);
    return () => window.clearTimeout(id);
  }, [state, active]);

  if (!active) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div data-coupon-panel className={`cp-wrap ${leaving ? 'is-leaving' : ''}`}>
      <div className="ab-card ab-glass ab-water-card cp-card relative p-6 sm:p-8 border border-[#1e293b] hud-frame" aria-live="polite">
        <Beam />
        <div className="ab-water" aria-hidden="true">
          <span className="ab-water-a" />
          <span className="ab-water-b" />
          <span className="ab-water-shine" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Seal: slow rings while preparing, a soft glow once the code is ready */}
          <div className={`cp-seal ${state === 'ready' ? 'is-ready' : ''}`} aria-hidden="true">
            <span className="cp-seal__ring cp-seal__ring--a" />
            <span className="cp-seal__ring cp-seal__ring--b" />
            <span className="cp-seal__core">
              {state === 'ready' ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#c4b5fd]/30 text-[#ddd6fe] font-mono text-[11px] uppercase tracking-widest">
              <span>Premium Tour · first time free</span>
            </div>

            {state === 'preparing' && (
              <>
                <h3 className="mt-3 text-xl sm:text-2xl font-semibold text-white tracking-tight">Preparing your personal coupon</h3>
                <p className="mt-1 text-sm text-slate-400">One moment. A unique code is being created just for you.</p>
                <div className="cp-progress mt-4" aria-hidden="true">
                  <span style={{ animationDuration: `${WAIT_MS}ms` }} />
                </div>
              </>
            )}

            {state === 'ready' && (
              <>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">Your coupon</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="cp-code" aria-label={`Coupon code ${code}`}>
                    {code.split('').map((ch, i) => (
                      <span key={`${ch}-${i}`} style={{ animationDelay: `${i * 45}ms` }}>
                        {ch}
                      </span>
                    ))}
                  </span>
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-md border border-white/12 text-[11px] font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:border-[#38e8ff]/50 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="mt-2 text-[12.5px] text-slate-400">Works once, for one Full Tour.</p>
                <button
                  type="button"
                  onClick={() => applyCouponFromFounder(code)}
                  className="cp-apply mt-4 w-full sm:w-auto min-h-[48px] px-6 rounded-md bg-[#38e8ff] text-[#05070a] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 shadow-[0_0_22px_rgba(56,232,255,0.35)] transition-all cursor-pointer"
                >
                  Apply for Full Tour
                </button>
              </>
            )}

            {(state === 'used' || state === 'error') && (
              <>
                <h3 className="mt-3 text-xl font-semibold text-white tracking-tight">
                  {state === 'used' ? 'Your free Premium Tour has already been used' : 'The coupon could not be created right now'}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {state === 'used'
                    ? 'Each visitor gets one free Full Tour. The Quick Tour is always free.'
                    : 'Please try again in a moment.'}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await glideTo(0);
                    startQuickTour();
                    window.dispatchEvent(new CustomEvent(COUPON_FLOW_EVENT, { detail: { active: false } }));
                  }}
                  className="mt-4 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-md border border-[#38e8ff]/40 text-[#38e8ff] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#38e8ff]/10 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Take the Quick Tour</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
