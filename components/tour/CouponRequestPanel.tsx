'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Check, Copy, Crown, Compass, Send, Gift } from 'lucide-react';
import { playApply, playCopy, playGiftFly, playGreen, playPress, playPrint, playRed, playSend, playTick, playWrap, playYellow } from '@/lib/couponSounds';
import { Beam } from '@/components/Beam';
import {
  COUPON_FLOW_EVENT,
  COUPON_STAGE_EVENT,
  applyCouponFromFounder,
  requestCouponCode,
  saveCoupon,
  startQuickTour,
  type CouponStage,
} from '@/lib/tourCoupon';
import { jumpTo, nextFrames } from '@/lib/jarvisScreen';

// The approval wait is not always the same, so it feels like a real request being looked at.
const WAITS = [5, 10, 15];
const SEND_MS = 1150;
const PRINT_MS = 1700;
const WRAP_MS = 900;
const FLY_MS = 1050;

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

type Flight = { kind: 'send' | 'gift'; from: DOMRect; to: DOMRect; id: number } | null;

/**
 * Coupon area in the founder section, under the founder photo (never on it). It exists only for a visitor who
 * pressed "Request coupon" in the Premium Tour box; everyone else sees the founder section exactly as before.
 * The request flies like a sent message to the little printer on the desk in the photo (DeskCouponMachine):
 * yellow light and a countdown while it waits, green light when approved, the coupon prints out, is gift-wrapped
 * and lands here, ready to copy and apply.
 */
export function CouponRequestPanel() {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState<CouponStage>('sending');
  const [denied, setDenied] = useState<'used' | 'error'>('error');
  const [count, setCount] = useState(0);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [flight, setFlight] = useState<Flight>(null);
  const runRef = useRef(0);
  const sealRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const broadcast = (s: CouponStage, extra: { count?: number; code?: string } = {}) => {
      setStage(s);
      window.dispatchEvent(new CustomEvent(COUPON_STAGE_EVENT, { detail: { stage: s, ...extra } }));
    };
    const rect = (sel: string) => document.querySelector(sel)?.getBoundingClientRect() || null;

    const run = async (id: number) => {
      const alive = () => id === runRef.current;
      const still = reduceMotion();
      const request = requestCouponCode();
      broadcast('sending', { code: '' });
      await nextFrames();
      // 1. The request flies from this panel to the printer on the desk.
      const from = sealRef.current?.getBoundingClientRect();
      const to = rect('[data-coupon-machine-slot]');
      if (from && to && !still) setFlight({ kind: 'send', from, to, id: Date.now() });
      playSend(SEND_MS);
      await sleep(SEND_MS);
      if (!alive()) return;
      setFlight(null);

      // 2. Yellow light: waiting for approval, with a countdown.
      const wait = WAITS[Math.floor(Math.random() * WAITS.length)];
      for (let left = wait; left > 0; left--) {
        if (!alive()) return;
        setCount(left);
        broadcast('waiting', { count: left });
        if (left === wait) playYellow();
        else playTick(left);
        await sleep(1000);
      }
      const res = await request;
      if (!alive()) return;
      if (!res.ok) {
        setDenied(res.reason === 'already_used' ? 'used' : 'error');
        broadcast('denied');
        playRed();
        window.setTimeout(() => alive() && broadcast('idle'), 4000);
        return;
      }
      setCode(res.code);
      saveCoupon(res.code);

      // 3. Green light: the coupon prints out of the machine like a receipt.
      broadcast('printing', { code: res.code });
      playGreen();
      // The light turns green first; a breath later the printer starts.
      if (!still) window.setTimeout(() => alive() && playPrint(PRINT_MS - 280), 280);
      await sleep(still ? 300 : PRINT_MS);
      if (!alive()) return;

      // 4. It is gift-wrapped on the desk, then flies down here.
      broadcast('wrapping', { code: res.code });
      const slot = rect('[data-coupon-machine-slot]');
      const target = rect('[data-coupon-target]');
      if (slot && target && !still) {
        // Wrapped just above the printer's slot, where the printed coupon stands.
        const ticket = new DOMRect(slot.left, slot.top - slot.width * 0.95, slot.width, slot.width * 0.9);
        setFlight({ kind: 'gift', from: ticket, to: target, id: Date.now() });
        playWrap(WRAP_MS);
        await sleep(WRAP_MS);
        broadcast('flying', { code: res.code });
        playGiftFly(FLY_MS);
        await sleep(FLY_MS);
      }
      if (!alive()) return;
      setFlight(null);
      broadcast('ready', { code: res.code });
      // The printer leaves the photo again a moment later; the photo is exactly as before.
      window.setTimeout(() => alive() && window.dispatchEvent(new CustomEvent(COUPON_STAGE_EVENT, { detail: { stage: 'idle' } })), 2600);
    };

    const onFlow = (e: Event) => {
      const on = Boolean((e as CustomEvent<{ active?: boolean }>).detail?.active);
      if (on) {
        const id = ++runRef.current;
        // Drawn right away, so the page can jump straight to it in the same moment (no waiting for a frame).
        flushSync(() => {
          setLeaving(false);
          setActive(true);
          setStage('sending');
          setCode('');
          setCount(0);
          setCopied(false);
        });
        run(id);
      } else {
        runRef.current++;
        setFlight(null);
        window.dispatchEvent(new CustomEvent(COUPON_STAGE_EVENT, { detail: { stage: 'idle' } }));
        setLeaving(true);
        window.setTimeout(() => setActive(false), 450);
      }
    };
    window.addEventListener(COUPON_FLOW_EVENT, onFlow);
    return () => window.removeEventListener(COUPON_FLOW_EVENT, onFlow);
  }, []);

  if (!active) return null;

  const copy = async () => {
    playCopy();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const ready = stage === 'ready' || (stage === 'idle' && !!code);
  const isDenied = stage === 'denied' || (stage === 'idle' && !code);
  const light = stage === 'waiting' ? 'yellow' : isDenied ? 'red' : stage === 'sending' ? 'cyan' : 'green';

  return (
    <div data-coupon-panel className={`cp-wrap ${leaving ? 'is-leaving' : ''}`}>
      <div className="ab-card ab-glass ab-water-card cp-card relative p-6 sm:p-8 border border-[#1e293b] hud-frame" aria-live="polite">
        <Beam />
        <div className="ab-water" aria-hidden="true">
          <span className="ab-water-a" />
          <span className="ab-water-b" />
          <span className="ab-water-shine" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 cp-body">
          {/* Seal: where the request leaves from and where the wrapped coupon lands */}
          <div ref={sealRef} data-coupon-target className={`cp-seal ${ready ? 'is-ready' : ''} is-${light}`} aria-hidden="true">
            <span className="cp-seal__ring cp-seal__ring--a" />
            <span className="cp-seal__ring cp-seal__ring--b" />
            <span className="cp-seal__core">
              {ready ? <Crown className="w-6 h-6" /> : stage === 'sending' ? <Send className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
            </span>
            {ready && <span key={code} className="cp-seal__burst" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#c4b5fd]/30 text-[#ddd6fe] font-mono text-[11px] uppercase tracking-widest">
              <span>Premium Tour · first time free</span>
            </div>

            {!ready && !isDenied && (
              <>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className={`cp-signal cp-signal--${light}`} aria-hidden="true" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {stage === 'sending'
                      ? 'Sending your request'
                      : stage === 'waiting'
                        ? 'Waiting for approval'
                        : 'Approved · printing your coupon'}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {stage === 'sending'
                    ? 'Your request is on its way to the founder’s desk.'
                    : stage === 'waiting'
                      ? 'Your personal one-time code is being prepared on the desk above.'
                      : 'It is being wrapped for you and will arrive here in a moment.'}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <span className={`cp-count ${stage === 'waiting' ? '' : 'is-off'}`} aria-label={stage === 'waiting' ? `${count} seconds` : undefined}>
                    <span key={count}>{stage === 'waiting' ? `00:${String(count).padStart(2, '0')}` : stage === 'sending' ? '··:··' : '00:00'}</span>
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    {stage === 'waiting' ? 'Yellow light · please wait' : stage === 'sending' ? 'Sending' : 'Green light'}
                  </span>
                </div>
              </>
            )}

            {ready && (
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
                  onClick={() => {
                    playApply();
                    applyCouponFromFounder(code);
                  }}
                  className="cp-apply mt-4 w-full sm:w-auto min-h-[48px] px-6 rounded-md bg-[#38e8ff] text-[#05070a] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 shadow-[0_0_22px_rgba(56,232,255,0.35)] transition-all cursor-pointer"
                >
                  Apply for Full Tour
                </button>
              </>
            )}

            {isDenied && (
              <>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="cp-signal cp-signal--red" aria-hidden="true" />
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {denied === 'used' ? 'Your free Premium Tour has already been used' : 'The coupon could not be created right now'}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {denied === 'used'
                    ? 'Each visitor gets one free Full Tour. The Quick Tour is always free.'
                    : 'Please try again in a moment.'}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    playPress();
                    jumpTo(0);
                    await nextFrames();
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
      {flight && <CouponFlight key={flight.id} flight={flight} />}
    </div>
  );
}

/** The flying request (a paper plane) and the gift-wrapped coupon, drawn above the page. GPU transforms only. */
function CouponFlight({ flight }: { flight: NonNullable<Flight> }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { from, to, kind } = flight;
    const size = kind === 'send' ? 44 : 64;
    const sx = from.left + from.width / 2 - size / 2;
    const sy = from.top + from.height / 2 - size / 2;
    const ex = to.left + to.width / 2 - size / 2;
    const ey = to.top + to.height / 2 - size / 2;
    const lift = Math.min(260, Math.abs(ey - sy) * 0.45 + 80);
    const anims: Animation[] = [];
    if (kind === 'send') {
      // Up in a gentle arc, banking like a paper plane, shrinking as it reaches the desk.
      const mx = sx + (ex - sx) * 0.55 + 60;
      const my = Math.min(sy, ey) - lift * 0.35;
      anims.push(
        el.animate(
          [
            { transform: `translate3d(${sx}px, ${sy}px, 0) rotate(-10deg) scale(0.9)`, opacity: 0 },
            { transform: `translate3d(${sx + 20}px, ${sy - 30}px, 0) rotate(-24deg) scale(1)`, opacity: 1, offset: 0.12 },
            { transform: `translate3d(${mx}px, ${my}px, 0) rotate(-42deg) scale(0.92)`, opacity: 1, offset: 0.55 },
            { transform: `translate3d(${ex}px, ${ey}px, 0) rotate(-62deg) scale(0.45)`, opacity: 0.2 },
          ],
          { duration: SEND_MS, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }
        )
      );
    } else {
      // Wrapped on the desk (where the printed coupon is), then a calm arc down into the panel.
      const wrapEnd = WRAP_MS / (WRAP_MS + FLY_MS);
      anims.push(
        el.animate(
          [
            { transform: `translate3d(${sx}px, ${sy}px, 0) scale(0.55)`, opacity: 0, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
            { transform: `translate3d(${sx}px, ${sy}px, 0) scale(1)`, opacity: 1, offset: 0.2 },
            // stays on the desk while the ribbon and bow are tied (until the wrap time is over)
            { transform: `translate3d(${sx}px, ${sy}px, 0) scale(1)`, opacity: 1, offset: wrapEnd, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
            { transform: `translate3d(${sx + (ex - sx) * 0.45}px, ${Math.min(sy, ey) - 40}px, 0) scale(1.05) rotate(-6deg)`, opacity: 1, offset: wrapEnd + (1 - wrapEnd) * 0.4, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
            { transform: `translate3d(${ex}px, ${ey}px, 0) scale(0.8) rotate(0deg)`, opacity: 1, offset: 0.95 },
            { transform: `translate3d(${ex}px, ${ey}px, 0) scale(0.6)`, opacity: 0 },
          ],
          { duration: WRAP_MS + FLY_MS, easing: 'linear', fill: 'forwards' }
        )
      );
    }
    return () => anims.forEach((a) => a.cancel());
  }, [flight]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={ref} className={`cf-fly cf-fly--${flight.kind}`} aria-hidden="true">
      {flight.kind === 'send' ? (
        <>
          <span className="cf-trail" />
          <Send className="cf-plane" />
        </>
      ) : (
        <span className="cf-gift">
          <span className="cf-gift__box" />
          <span className="cf-gift__ribbon-v" />
          <span className="cf-gift__ribbon-h" />
          <span className="cf-gift__bow cf-gift__bow--l" />
          <span className="cf-gift__bow cf-gift__bow--r" />
          <span className="cf-gift__shine" />
        </span>
      )}
    </div>,
    document.body
  );
}
