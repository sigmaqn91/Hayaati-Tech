'use client';

import React, { useEffect, useState } from 'react';
import { DecryptText } from './DecryptText';
import { DEV_BANNER_TEXT } from '../lib/devBannerText';

const CSS = `
.dev-banner{position:absolute;top:76px;left:0;right:0;z-index:20;display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 16px;pointer-events:none;text-align:center}
.dev-banner__box{max-width:92%;background:#0a1119;border:1px solid rgba(255,176,32,.45);border-radius:8px;padding:10px 16px;box-shadow:0 0 18px rgba(255,176,32,.12)}
.dev-banner__row{display:flex;align-items:center;justify-content:center;gap:10px}
.dev-banner__dot{width:8px;height:8px;border-radius:50%;background:#ffb020;box-shadow:0 0 10px #ffb020;animation:devPulse 1.4s ease-in-out infinite}
.dev-banner__title{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.16em;color:#ffb020;font-weight:600}
.dev-banner__sub{margin-top:4px;font-size:12.5px;color:#cfd9e2}
.dev-banner__bar{margin:8px auto 0;width:160px;max-width:100%;height:2px;background:rgba(255,176,32,.18);overflow:hidden;border-radius:2px}
.dev-banner__bar span{display:block;height:100%;width:40%;background:linear-gradient(90deg,transparent,#ffb020,transparent);animation:devSweep 1.8s linear infinite}
@keyframes devPulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}
@keyframes devSweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
@media (prefers-reduced-motion:reduce){.dev-banner__dot,.dev-banner__bar span{animation:none}}
`;

export default function DevBanner() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const read = () => {
      const l = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
      setLang(DEV_BANNER_TEXT[l] ? l : 'en');
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => obs.disconnect();
  }, []);

  const t = DEV_BANNER_TEXT[lang] || DEV_BANNER_TEXT.en;

  return (
    <div className="dev-banner" role="status" aria-live="polite">
      <style>{CSS}</style>
      <div className="dev-banner__box">
        <div className="dev-banner__row">
          <span className="dev-banner__dot" aria-hidden="true" />
          <span className="dev-banner__title">
            <DecryptText text={t.title} />
          </span>
        </div>
        <div className="dev-banner__sub">{t.sub}</div>
        <div className="dev-banner__bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
