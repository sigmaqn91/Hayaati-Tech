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
 *
 * SVG drawings with built-in (SMIL) animations, e.g. the project cards' orbiting dots, are not affected by
 * CSS at all and used to run forever, repainting the page every frame wherever the visitor was. They are now
 * paused the same way (300px before/after the screen) and simply carry on when they come back.
 */

import { useEffect } from 'react';

// Small zones that hold the looping animations (see the matching rule in globals.css). Sections are watched only
// for their own background ::before / ::after, so turning one on or off no longer re-checks its whole content.
const ZONES = 'section, footer, .ms-card, .pc-card, .ab-card, .hp-card, .eb-aura, .ab-bg, .hp-grid-bg, .eb-tab-active > .beam';
const ON = 'anim-on';
const OFF = 'anim-off';
const SECTION = 'section:not(#hero)';
const SEC_ON = 'sec-on';

export function AnimationGovernor() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const watched = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Sections below the hero use their own class name (sec-on): the browser keeps one "what to re-check"
          // list per class name, and anim-on/anim-off is the zones' name, so a section flipping anim-on made it
          // re-check all ~3000 elements inside (a hitch every time a section came into view). sec-on only
          // affects the section's own background layers.
          if (e.target.matches(SECTION)) {
            e.target.classList.toggle(SEC_ON, e.isIntersecting);
            continue;
          }
          e.target.classList.toggle(ON, e.isIntersecting);
          e.target.classList.toggle(OFF, !e.isIntersecting);
        }
      },
      // Start a little before a card scrolls in, so it is already moving when it appears.
      { rootMargin: '300px 0px 300px 0px' }
    );

    const smilIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const svg = e.target as SVGSVGElement;
          if (e.isIntersecting) svg.unpauseAnimations();
          else svg.pauseAnimations();
        }
      },
      { rootMargin: '300px 0px 300px 0px' }
    );

    const scan = () => {
      document.querySelectorAll(ZONES).forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
      document.querySelectorAll<SVGSVGElement>('svg').forEach((svg) => {
        if (watched.has(svg) || svg.ownerSVGElement) return;
        if (!svg.querySelector('animate, animateMotion, animateTransform, set')) return;
        watched.add(svg);
        smilIo.observe(svg);
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
    // Photo pre-decode: a phone keeps only a limited number of big photos unpacked in memory, so photos the visitor
    // scrolled past are thrown out and had to be unpacked again (2-3 MB originals) at the very moment they came back
    // on screen, which is the delay when scrolling back up. Now each photo is unpacked about one screen before it
    // appears, in the background. Same file, same pixels: only the moment of unpacking moves earlier.
    const decoded = new WeakMap<HTMLImageElement, number>();
    const predecode = (img: HTMLImageElement) => {
      const now = performance.now();
      if (now - (decoded.get(img) || -1e9) < 4000) return;
      decoded.set(img, now);
      img.decode().catch(() => {});
    };
    const decodeIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          if (img.complete && img.naturalWidth) predecode(img);
          else img.addEventListener('load', () => predecode(img), { once: true });
        }
      },
      { rootMargin: '100% 0px 100% 0px' }
    );
    const decodeWatched = new WeakSet<Element>();
    const scanImages = () => {
      document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        if (watched.has(img)) return;
        watched.add(img);
        imgIo.observe(img);
      });
      document.querySelectorAll<HTMLImageElement>('main img').forEach((img) => {
        if (decodeWatched.has(img)) return;
        decodeWatched.add(img);
        decodeIo.observe(img);
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
      smilIo.disconnect();
      imgIo.disconnect();
      decodeIo.disconnect();
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return null;
}
