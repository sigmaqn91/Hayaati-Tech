'use client';

/**
 * Anonymous visitor analytics (no popup, nothing shown to the visitor by this component).
 *
 * - Nothing runs during page load: after the page is idle, the device is detected (about a millisecond, plus a
 *   few ms for Client Hints) and one small message is sent with sendBeacon. Sections seen and time on site are
 *   sent again only when the tab is hidden or closed.
 * - Exact location: sent only when the visitor already allowed location for this site in the browser (silent), or
 *   allows it in the browser's own box (asked once, never again after a "Block"). No custom popup is shown.
 * - Identity: a random id kept in this browser (no name, no device ID). How visit info is used is described in
 *   the Terms & Conditions page (/terms).
 */

import { useEffect } from 'react';
import { detectDevice } from '@/lib/visitorDetect';
import { isOwnerUi } from '@/lib/ownerState';

const VID_KEY = 'hayaati_vid';
const GEO_ASKED_KEY = 'hayaati_geo_asked';
const SECTIONS = ['hero', 'timeline', 'tech', 'places', 'projects', 'advertise', 'about', 'contact'];
/** true: the browser's own location box is shown once to visitors who were never asked. false: only silent (already allowed). */
const ASK_BROWSER_LOCATION = true;

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function send(payload: unknown) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/visit', new Blob([body], { type: 'text/plain' }))) return;
  } catch {}
  fetch('/api/visit', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

function whenIdle(fn: () => void) {
  const run = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(fn, { timeout: 4000 });
    else setTimeout(fn, 1200);
  };
  if (document.readyState === 'complete') setTimeout(run, 1500);
  else window.addEventListener('load', () => setTimeout(run, 1500), { once: true });
}

export function VisitorTracker() {
  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const seen = new Set<string>();
    let visibleMs = 0;
    let visibleSince = document.visibilityState === 'visible' ? performance.now() : 0;
    let lastSent = '';
    let visitId = '';
    let vid = '';

    const seconds = () => Math.round((visibleMs + (visibleSince ? performance.now() - visibleSince : 0)) / 1000);
    const sendUpdate = () => {
      if (!visitId) return;
      const sections = Array.from(seen);
      const s = seconds();
      const key = `${sections.join(',')}|${Math.floor(s / 10)}`;
      if (key === lastSent) return;
      lastSent = key;
      send({ kind: 'update', id: visitId, vid, sections, seconds: s });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (visibleSince) visibleMs += performance.now() - visibleSince;
        visibleSince = 0;
        sendUpdate();
      } else {
        visibleSince = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', sendUpdate);

    whenIdle(async () => {
      if (cancelled) return;
      const st = storage();
      let returning = false;
      try {
        vid = st?.getItem(VID_KEY) || '';
        returning = Boolean(vid);
        if (!vid) {
          vid = randomId();
          st?.setItem(VID_KEY, vid);
        }
      } catch {
        vid = vid || randomId();
      }
      visitId = randomId();

      let device;
      try {
        device = await detectDevice();
      } catch {
        return;
      }
      if (cancelled) return;
      let referrer = '';
      try {
        const r = document.referrer ? new URL(document.referrer) : null;
        if (r && r.host !== location.host) referrer = r.host;
      } catch {}

      send({
        kind: 'start',
        id: visitId,
        vid,
        returning,
        owner: isOwnerUi(),
        device,
        siteLanguage: document.documentElement.lang || '',
        page: location.pathname,
        referrer,
        sections: Array.from(seen),
        seconds: seconds(),
      });

      // Sections seen (cheap: one observer, 8 targets)
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const e of entries) if (e.isIntersecting) seen.add(e.target.id);
          },
          { threshold: 0.25 }
        );
        for (const id of SECTIONS) {
          const el = document.getElementById(id);
          if (el) observer.observe(el);
        }
      }

      // Exact location (browser permission only)
      const sendGeo = () => {
        try {
          navigator.geolocation.getCurrentPosition(
            (p) => send({ kind: 'geo', id: visitId, vid, lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }),
            () => {},
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
          );
        } catch {}
      };
      if ('geolocation' in navigator) {
        try {
          const perm = await navigator.permissions?.query({ name: 'geolocation' });
          if (perm?.state === 'granted') sendGeo();
          else if (perm?.state === 'prompt' && ASK_BROWSER_LOCATION && !st?.getItem(GEO_ASKED_KEY)) {
            st?.setItem(GEO_ASKED_KEY, '1');
            setTimeout(() => {
              if (!cancelled) sendGeo();
            }, 6000);
          }
        } catch {}
      }
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', sendUpdate);
    };
  }, []);

  return null;
}
