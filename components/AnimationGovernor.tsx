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

    // Image warm-up: a lazy photo starts downloading when it is about one and a half screens away (the browser's
    // own lazy loading waits until it is much closer), so photos are already there when the visitor scrolls to
    // them. Same files, same quality: only the moment the download starts is earlier.
    const imgIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          imgIo.unobserve(img);
          if (img.loading === 'lazy') img.loading = 'eager';
        }
      },
      { rootMargin: '150% 0px 150% 0px' }
    );
    const scanImages = () => {
      document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        if (watched.has(img)) return;
        watched.add(img);
        imgIo.observe(img);
      });
    };
    // Only after the page itself has finished loading, so photos never compete with the hero.
    let imagesOn = document.readyState === 'complete';
    const onLoad = () => {
      imagesOn = true;
      scanImages();
    };
    if (imagesOn) scanImages();
    else window.addEventListener('load', onLoad, { once: true });

    scan();
    let t = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        scan();
        if (imagesOn) scanImages();
      }, 150);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(t);
      mo.disconnect();
      io.disconnect();
      imgIo.disconnect();
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return null;
}
