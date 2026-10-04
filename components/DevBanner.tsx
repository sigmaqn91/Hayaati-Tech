'use client';

import React, { useEffect, useState } from 'react';
import { DecryptText } from './DecryptText';
import { DEV_BANNER_TEXT } from '../lib/devBannerText';

const SEGMENTS = Array.from({ length: 14 }, (_, i) => i);

const CHAMFER = 'polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)';
const CHAMFER_IN = 'polygon(12.5px 0,calc(100% - 12.5px) 0,100% 12.5px,100% calc(100% - 12.5px),calc(100% - 12.5px) 100%,12.5px 100%,0 calc(100% - 12.5px),0 12.5px)';

const CSS = `
.dev-banner{position:absolute;top:72px;left:0;right:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;pointer-events:none}
.dev-banner__line{position:relative;flex:1;min-width:0;height:1px;margin-top:14px}
.dev-banner__line--l{background:linear-gradient(90deg,transparent,rgba(255,176,32,.75))}
.dev-banner__line--r{background:linear-gradient(270deg,transparent,rgba(255,176,32,.75))}
.dev-banner__line::before{content:'';position:absolute;top:-2px;width:5px;height:5px;border-radius:50%;background:#ffb020;box-shadow:0 0 8px #ffb020}
.dev-banner__line--l::before{right:0}
.dev-banner__line--r::before{left:0}
.dev-banner__line::after{content:'';position:absolute;top:-1px;height:3px;width:64px;border-radius:2px;background:linear-gradient(90deg,transparent,#ffe0a3,transparent)}
.dev-banner__line--l::after{animation:devOutL 3s linear infinite}
.dev-banner__line--r::after{animation:devOutR 3s linear infinite}
.dev-banner__wrap{position:relative;flex:none;width:min(88vw,520px)}
.dev-banner__wrap::before{content:'';position:absolute;inset:-10px -18px;background:radial-gradient(ellipse at center,rgba(255,176,32,.24),transparent 70%);animation:devGlowPulse 2.8s ease-in-out infinite}
.dev-banner__box{position:relative;z-index:1;padding:1.5px;overflow:hidden;clip-path:${CHAMFER}}
.dev-banner__box::before{content:'';position:absolute;inset:-70%;background:conic-gradient(from 0deg,transparent 0 60%,#ffb020 78%,#ffe0a3 87%,#38e8ff 94%,transparent 100%);animation:devSpin 4.5s linear infinite}
.dev-banner__inner{position:relative;overflow:hidden;clip-path:${CHAMFER_IN};background:linear-gradient(rgba(56,232,255,.05) 1px,transparent 1px) 0 0/22px 22px,linear-gradient(90deg,rgba(56,232,255,.05) 1px,transparent 1px) 0 0/22px 22px,rgba(8,14,22,.86);padding:16px 22px 14px;text-align:center;animation:devGrid 6s linear infinite}
.dev-banner__inner::after{content:'';position:absolute;top:0;bottom:0;left:-45%;width:38%;background:linear-gradient(90deg,transparent,rgba(255,176,32,.16),transparent);animation:devScan 3.4s ease-in-out infinite}
.dev-banner__row{display:flex;align-items:center;justify-content:center;gap:12px;position:relative;z-index:1}
.dev-banner__dot{position:relative;width:10px;height:10px;border-radius:50%;background:#ffb020;box-shadow:0 0 12px #ffb020;animation:devPulse 1.4s ease-in-out infinite;flex:none}
.dev-banner__dot::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(255,176,32,.6);animation:devRing 1.8s ease-out infinite}
.dev-banner__title{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(13px,3.5vw,17px);letter-spacing:.18em;color:#ffb020;font-weight:700;animation:devGlitch 6s steps(1) infinite}
.dev-banner__sub{position:relative;z-index:1;margin-top:8px;font-size:clamp(12.5px,3.2vw,14px);line-height:1.5;color:#dbe5ee}
.dev-banner__segs{position:relative;z-index:1;display:flex;justify-content:center;gap:4px;margin:12px auto 0;max-width:100%}
.dev-banner__segs span{width:clamp(9px,2.8vw,16px);height:5px;border-radius:2px;background:rgba(255,176,32,.16);animation:devChase 1.8s ease-in-out infinite}
.dev-banner__bar{position:relative;z-index:1;margin:10px auto 0;width:min(240px,70%);height:2px;overflow:hidden;border-radius:2px;background:rgba(56,232,255,.14)}
.dev-banner__bar span{display:block;height:100%;width:40%;background:linear-gradient(90deg,transparent,#38e8ff,transparent);animation:devSweep 1.8s linear infinite}
@keyframes devSpin{to{transform:rotate(360deg)}}
@keyframes devScan{0%{transform:translateX(0)}60%,100%{transform:translateX(420%)}}
@keyframes devGrid{to{background-position:22px 22px,22px 22px,0 0}}
@keyframes devRing{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.8);opacity:0}}
@keyframes devPulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
@keyframes devSweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
@keyframes devChase{0%,100%{background:rgba(255,176,32,.16);transform:scaleY(1)}35%{background:#ffb020;transform:scaleY(1.9)}}
@keyframes devGlowPulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes devOutL{from{left:100%}to{left:-64px}}
@keyframes devOutR{from{left:-64px}to{left:100%}}
@keyframes devGlitch{0%,92%,100%{text-shadow:none}93%{text-shadow:2px 0 rgba(56,232,255,.8),-2px 0 rgba(255,60,120,.6)}95%{text-shadow:-2px 0 rgba(56,232,255,.8),2px 0 rgba(255,60,120,.6)}97%{text-shadow:none}}
@media (max-width:480px){.dev-banner{top:68px}.dev-banner__inner{padding:14px 16px 12px}}
@media (prefers-reduced-motion:reduce){.dev-banner__wrap::before,.dev-banner__line::after,.dev-banner__box::before,.dev-banner__inner,.dev-banner__inner::after,.dev-banner__dot,.dev-banner__dot::after,.dev-banner__title,.dev-banner__segs span,.dev-banner__bar span{animation:none}.dev-banner__segs span{background:rgba(255,176,32,.5)}}
`;

export default function DevBanner() {
  const [lang, setLang] = useState('en');
  const [tick, setTick] = useState(0);

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

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 9000);
    return () => clearInterval(id);
  }, []);

  const t = DEV_BANNER_TEXT[lang] || DEV_BANNER_TEXT.en;

  return (
    <div className="dev-banner" role="status" aria-live="polite">
      <style>{CSS}</style>
      <span className="dev-banner__line dev-banner__line--l" aria-hidden="true" />
      <div className="dev-banner__wrap">
        <div className="dev-banner__box">
          <div className="dev-banner__inner">
            <div className="dev-banner__row">
              <span className="dev-banner__dot" aria-hidden="true" />
              <span className="dev-banner__title">
                <DecryptText key={`${lang}-${tick}`} text={t.title} />
              </span>
            </div>
            <div className="dev-banner__sub">{t.sub}</div>
            <div className="dev-banner__segs" aria-hidden="true">
              {SEGMENTS.map((i) => (
                <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
            <div className="dev-banner__bar" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      </div>
      <span className="dev-banner__line dev-banner__line--r" aria-hidden="true" />
    </div>
  );
}
