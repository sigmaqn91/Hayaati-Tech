'use client';

import React, { useEffect, useState } from 'react';
import { COUPON_STAGE_EVENT, type CouponStage, type CouponStageDetail } from '@/lib/tourCoupon';

/**
 * A small coupon printer with a traffic light, standing on the desk in the founder photo while a visitor's
 * Premium Tour coupon is being prepared. It is drawn ON TOP of the photo (the photo file is never changed) and
 * exists only during that moment; afterwards the photo is exactly as before.
 *   yellow = request received, waiting (countdown on its little screen)
 *   green  = approved, the coupon prints out of the top like a receipt
 *   red    = no coupon (already used / error)
 */
export function DeskCouponMachine() {
  const [stage, setStage] = useState<CouponStage>('idle');
  const [count, setCount] = useState(0);
  const [code, setCode] = useState('');
  // Arriving straight in the founder section, the photo is still fading in: the printer appears as it settles.
  const [late, setLate] = useState(false);

  useEffect(() => {
    const onStage = (e: Event) => {
      const d = (e as CustomEvent<CouponStageDetail>).detail;
      if (!d) return;
      if (d.stage === 'sending') setLate(!document.querySelector('.founder-portrait.is-on'));
      setStage(d.stage);
      if (typeof d.count === 'number') setCount(d.count);
      if (d.code !== undefined) setCode(d.code);
    };
    window.addEventListener(COUPON_STAGE_EVENT, onStage);
    return () => window.removeEventListener(COUPON_STAGE_EVENT, onStage);
  }, []);

  if (stage === 'idle') return null;

  const lamp = stage === 'waiting' ? 'yellow' : stage === 'denied' ? 'red' : stage === 'sending' ? 'none' : 'green';
  const screen =
    stage === 'sending'
      ? '· · ·'
      : stage === 'waiting'
        ? `00:${String(Math.max(0, count)).padStart(2, '0')}`
        : stage === 'denied'
          ? 'SORRY'
          : 'OK';

  return (
    <div className={`cm-wrap is-${stage} ${late ? 'is-late' : ''}`} aria-hidden="true">
      <span className="cm-shadow" />
      <svg className="cm-svg" viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cm-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3446" />
            <stop offset="0.55" stopColor="#141a26" />
            <stop offset="1" stopColor="#0a0e16" />
          </linearGradient>
          <linearGradient id="cm-top" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a465c" />
            <stop offset="0.5" stopColor="#56657f" />
            <stop offset="1" stopColor="#323d51" />
          </linearGradient>
          <linearGradient id="cm-paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfaf6" />
            <stop offset="1" stopColor="#e9e6dd" />
          </linearGradient>
          <clipPath id="cm-slot-clip">
            <rect x="0" y="-60" width="140" height="106" />
          </clipPath>
        </defs>

        {/* Traffic light on a slim stand (left) */}
        <g className="cm-light">
          <rect x="17" y="58" width="4" height="54" rx="1.5" fill="#1b2230" />
          <rect x="6" y="20" width="26" height="62" rx="7" fill="#0b0f17" stroke="#3a465c" strokeWidth="1.2" />
          <g className={`cm-lamp cm-lamp--red ${lamp === 'red' ? 'is-on' : ''}`}>
            <circle className="cm-halo" cx="19" cy="33" r="13" fill="currentColor" />
            <circle cx="19" cy="33" r="6.2" />
          </g>
          <g className={`cm-lamp cm-lamp--yellow ${lamp === 'yellow' ? 'is-on' : ''}`}>
            <circle className="cm-halo" cx="19" cy="51" r="13" fill="currentColor" />
            <circle cx="19" cy="51" r="6.2" />
          </g>
          <g className={`cm-lamp cm-lamp--green ${lamp === 'green' ? 'is-on' : ''}`}>
            <circle className="cm-halo" cx="19" cy="69" r="13" fill="currentColor" />
            <circle cx="19" cy="69" r="6.2" />
          </g>
        </g>

        {/* The coupon, printing out of the top slot like a receipt */}
        <g clipPath="url(#cm-slot-clip)">
          <g className="cm-ticket" data-coupon-ticket>
            <rect x="58" y="-8" width="56" height="56" rx="1.5" fill="url(#cm-paper)" />
            <path d="M58 -8 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3" fill="#fbfaf6" />
            <text x="86" y="4" textAnchor="middle" className="cm-ticket__brand">HAYAATI</text>
            <text x="86" y="12" textAnchor="middle" className="cm-ticket__sub">PREMIUM TOUR</text>
            <line x1="62" y1="17" x2="110" y2="17" stroke="#c9c4b6" strokeWidth="0.6" strokeDasharray="2 1.5" />
            <text x="86" y="27" textAnchor="middle" className="cm-ticket__code">{code || 'HY-····-····'}</text>
            <text x="86" y="36" textAnchor="middle" className="cm-ticket__sub">ONE TIME · FREE</text>
          </g>
        </g>

        {/* Printer body */}
        <g className="cm-printer">
          <path d="M48 52 Q48 46 54 46 L118 46 Q124 46 124 52 L128 106 Q128 112 122 112 L50 112 Q44 112 44 106 Z" fill="url(#cm-body)" stroke="#45536b" strokeWidth="1" />
          <path d="M52 46 L120 46 Q124 46 124 50 L48 50 Q48 46 52 46 Z" fill="url(#cm-top)" />
          {/* paper slot */}
          <rect x="56" y="44.5" width="60" height="3" rx="1.5" fill="#05070b" data-coupon-machine-slot />
          {/* little screen */}
          <rect x="60" y="62" width="52" height="20" rx="3" fill="#03060b" stroke="#1f2a3b" strokeWidth="0.8" />
          <text x="86" y="76" textAnchor="middle" className={`cm-screen cm-screen--${lamp}`}>
            {screen}
          </text>
          {/* status dot + vents */}
          <circle cx="66" cy="96" r="2.2" className={`cm-dot cm-dot--${lamp}`} />
          <rect x="76" y="94.5" width="36" height="1.4" rx="0.7" fill="#232c3c" />
          <rect x="76" y="98" width="36" height="1.4" rx="0.7" fill="#232c3c" />
          {/* edge light */}
          <path className="cm-edge" d="M50 112 L122 112" stroke="#38e8ff" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
