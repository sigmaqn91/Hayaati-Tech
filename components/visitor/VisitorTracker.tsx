'use client';

/**
 * Anonymous visitor analytics + two small notices.
 *
 * - Nothing runs during page load: after the page is idle, the device is detected (about a millisecond, plus a
 *   few ms for Client Hints) and one small message is sent with sendBeacon. Sections seen and time on site are
 *   sent again only when the tab is hidden or closed.
 * - Identity: a random id kept in this browser (no name, no IP, no device ID).
 * - Privacy line (once, with OK) and, only for a clearly old browser / phone software, a gentle update
 *   suggestion (hidden for 7 days after it is closed).
 */

import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, X } from 'lucide-react';
import { checkFreshness, detectDevice, type Freshness } from '@/lib/visitorDetect';
import { isOwnerUi } from '@/lib/ownerState';
import { useLanguage } from '@/context/LanguageContext';

const VID_KEY = 'hayaati_vid';
const PRIVACY_KEY = 'hayaati_privacy_ok';
const UPDATE_KEY = 'hayaati_update_hidden_at';
const UPDATE_SNOOZE_MS = 7 * 86_400_000;
const SECTIONS = ['hero', 'timeline', 'tech', 'places', 'projects', 'advertise', 'about', 'contact'];

type Texts = { privacy: string; ok: string; browserOld: string; osOld: string; limited: string };
const TEXTS: Record<string, Texts> = {
  en: {
    privacy: 'We collect anonymous device and browser info to improve this site.',
    ok: 'OK',
    browserOld: 'Your browser ({x}) is out of date. Please update it for the smoothest experience.',
    osOld: "Your phone's software ({x}) is out of date. An update will make this site run smoother.",
    limited: '{x} is a lite browser. For the full experience, open this site in Chrome or Safari.',
  },
  hi: {
    privacy: 'साइट को बेहतर बनाने के लिए हम डिवाइस और ब्राउज़र की गुमनाम जानकारी लेते हैं।',
    ok: 'ठीक है',
    browserOld: 'आपका ब्राउज़र ({x}) पुराना है। बेहतर अनुभव के लिए इसे अपडेट करें।',
    osOld: 'आपके फ़ोन का सॉफ़्टवेयर ({x}) पुराना है। अपडेट करने से साइट और स्मूथ चलेगी।',
    limited: '{x} एक लाइट ब्राउज़र है। पूरा अनुभव पाने के लिए साइट Chrome या Safari में खोलें।',
  },
  ur: {
    privacy: 'سائٹ بہتر بنانے کے لیے ہم ڈیوائس اور براؤزر کی گمنام معلومات لیتے ہیں۔',
    ok: 'ٹھیک ہے',
    browserOld: 'آپ کا براؤزر ({x}) پرانا ہے۔ بہتر تجربے کے لیے اسے اپڈیٹ کریں۔',
    osOld: 'آپ کے فون کا سافٹ ویئر ({x}) پرانا ہے۔ اپڈیٹ کرنے سے سائٹ اور ہموار چلے گی۔',
    limited: '{x} ایک لائٹ براؤزر ہے۔ مکمل تجربے کے لیے سائٹ Chrome یا Safari میں کھولیں۔',
  },
  ar: {
    privacy: 'نجمع معلومات مجهولة عن الجهاز والمتصفح لتحسين هذا الموقع.',
    ok: 'حسناً',
    browserOld: 'متصفحك ({x}) قديم. حدّثه لتجربة أكثر سلاسة.',
    osOld: 'برنامج هاتفك ({x}) قديم. التحديث يجعل الموقع يعمل بسلاسة أكبر.',
    limited: '{x} متصفح خفيف. للتجربة الكاملة افتح الموقع في Chrome أو Safari.',
  },
  es: {
    privacy: 'Recopilamos información anónima del dispositivo y del navegador para mejorar este sitio.',
    ok: 'OK',
    browserOld: 'Tu navegador ({x}) está desactualizado. Actualízalo para una experiencia más fluida.',
    osOld: 'El software de tu teléfono ({x}) está desactualizado. Actualizarlo hará que el sitio funcione mejor.',
    limited: '{x} es un navegador ligero. Para la experiencia completa, abre el sitio en Chrome o Safari.',
  },
  fr: {
    privacy: "Nous collectons des informations anonymes sur l'appareil et le navigateur pour améliorer ce site.",
    ok: 'OK',
    browserOld: 'Votre navigateur ({x}) est obsolète. Mettez-le à jour pour une expérience plus fluide.',
    osOld: 'Le logiciel de votre téléphone ({x}) est obsolète. Une mise à jour rendra le site plus fluide.',
    limited: "{x} est un navigateur léger. Pour l'expérience complète, ouvrez le site dans Chrome ou Safari.",
  },
};

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
  const { language } = useLanguage();
  const [privacy, setPrivacy] = useState(false);
  const [update, setUpdate] = useState<{ kind: 'browserOld' | 'osOld' | 'limited'; label: string } | null>(null);

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
      const fresh: Freshness = checkFreshness(device);

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

      // Notices
      try {
        if (!st?.getItem(PRIVACY_KEY)) setPrivacy(true);
      } catch {
        setPrivacy(true);
      }
      if (fresh.browserOld || fresh.osOld || fresh.browserLimited) {
        let snoozed = false;
        try {
          snoozed = Date.now() - Number(st?.getItem(UPDATE_KEY) || 0) < UPDATE_SNOOZE_MS;
        } catch {}
        if (!snoozed) {
          if (fresh.browserLimited) setUpdate({ kind: 'limited', label: device.browser || fresh.browserLabel });
          else if (fresh.browserOld) setUpdate({ kind: 'browserOld', label: fresh.browserLabel.replace(/ \(.*\)$/, '') });
          else setUpdate({ kind: 'osOld', label: fresh.osLabel });
        }
      }
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', sendUpdate);
    };
  }, []);

  if (!privacy && !update) return null;
  const tx = TEXTS[language] || TEXTS.en;
  const rtl = language === 'ur' || language === 'ar' || language === 'fa';

  const closePrivacy = () => {
    setPrivacy(false);
    try {
      storage()?.setItem(PRIVACY_KEY, '1');
    } catch {}
  };
  const closeUpdate = () => {
    setUpdate(null);
    try {
      storage()?.setItem(UPDATE_KEY, String(Date.now()));
    } catch {}
  };

  return (
    <div
      className="fixed z-[35] bottom-24 start-3 end-3 sm:end-auto sm:start-5 sm:w-[25rem] flex flex-col gap-2 pointer-events-none"
      dir={rtl ? 'rtl' : 'ltr'}
      data-visitor-notices
    >
      {update && (
        <div className="vn-card vn-card--update" role="status">
          <RefreshCw className="w-4 h-4 shrink-0 text-[#ffcf66]" aria-hidden="true" />
          <p className="flex-1 min-w-0">{tx[update.kind].replace('{x}', update.label)}</p>
          <button type="button" onClick={closeUpdate} className="vn-btn vn-btn--ghost" aria-label="Close">
            <X className="w-4 h-4 mx-auto" aria-hidden="true" />
          </button>
        </div>
      )}
      {privacy && (
        <div className="vn-card" role="status">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#38e8ff]" aria-hidden="true" />
          <p className="flex-1 min-w-0">{tx.privacy}</p>
          <button type="button" onClick={closePrivacy} className="vn-btn">
            {tx.ok}
          </button>
        </div>
      )}
    </div>
  );
}
