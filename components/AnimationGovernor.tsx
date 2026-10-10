'use client';

/**
 * AnimationGovernor — performance only, nothing visible changes.
 *
 * The page has 700+ looping CSS animations (card glass, border beams, project art, badges ...).
 * Before, all of them ran every frame even far off-screen, which made scrolling heavy and could
 * make phones reload the tab. Now every section / card is watched: when it is off-screen its
 * looping animations stop (CSS rules in globals.css) and its moving layers are released; below the hero
 * they also start paused until first seen, so the first load does not start them all at once.
 * and they start again just before it scrolls back into view (300px early, so nobody sees the switch).
 * One-time entrance animations are excluded and play exactly as before.
 */

import { useEffect } from 'react';

const ZONES = 'section, footer, .ms-card, .pc-card, .ab-card, .hp-card';
const ON = 'anim-on';
const OFF = 'anim-off';

export function AnimationGovernor() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const watched = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.toggle(ON, e.isIntersecting);
          e.target.classList.toggle(OFF, !e.isIntersecting);
        }
      },
      // Start a little before a card scrolls in, so it is already moving when it appears.
      { rootMargin: '300px 0px 300px 0px' }
    );

    const scan = () => {
      document.querySelectorAll(ZONES).forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };

    scan();
    let t = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(scan, 150);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
