'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DecryptText } from './DecryptText';
import { DEV_BANNER_TEXT } from '../lib/devBannerText';

const SEGMENTS = Array.from({ length: 14 }, (_, i) => i);

const CHAMFER = 'polygon(10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px),0 10px)';
const CHAMFER_IN = 'polygon(8.5px 0,calc(100% - 8.5px) 0,100% 8.5px,100% calc(100% - 8.5px),calc(100% - 8.5px) 100%,8.5px 100%,0 calc(100% - 8.5px),0 8.5px)';

// Every moving part below moves with transform/opacity only (the graphics chip), so the banner never makes the
// processor repaint the hero: the grid slides on its own layer, the segment colour fades on a lit copy on top
// (the exact same in-between colours) and the light dots travel with translate instead of `left`.
const CSS = `
.dev-banner{position:absolute;top:72px;left:0;right:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;pointer-events:none}
.dev-banner__line{position:relative;flex:1;min-width:0;height:1px;margin-top:10px;container-type:inline-size}
.dev-banner__line--l{background:linear-gradient(90deg,transparent,rgba(255,176,32,.75))}
.dev-banner__line--r{background:linear-gradient(270deg,transparent,rgba(255,176,32,.75))}
.dev-banner__line::before{content:'';position:absolute;top:-2px;width:5px;height:5px;border-radius:50%;background:#ffb020;box-shadow:0 0 8px #ffb020}
.dev-banner__line--l::before{right:0}
.dev-banner__line--r::before{left:0}
.dev-banner__line::after{content:'';position:absolute;top:-1px;left:0;height:3px;width:64px;border-radius:2px;background:linear-gradient(90deg,transparent,#ffe0a3,transparent)}
.dev-banner__line--l::after{animation:devOutL 3s linear infinite}
.dev-banner__line--r::after{animation:devOutR 3s linear infinite}
.dev-banner__wrap{position:relative;flex:none;width:min(92vw,440px)}
.dev-banner__wrap::before{content:'';position:absolute;inset:-10px -18px;background:radial-gradient(ellipse at center,rgba(255,176,32,.24),transparent 70%);animation:devGlowPulse 2.8s ease-in-out infinite}
.dev-banner__box{position:relative;z-index:1;padding:1.5px;overflow:hidden;clip-path:${CHAMFER}}
.dev-banner__box::before{content:'';position:absolute;inset:-70%;background:conic-gradient(from 0deg,transparent 0 60%,#ffb020 78%,#ffe0a3 87%,#38e8ff 94%,transparent 100%);animation:devSpin 4.5s linear infinite}
.dev-banner__inner{position:relative;overflow:hidden;clip-path:${CHAMFER_IN};background:rgba(8,14,22,.86);padding:8px 16px 8px;text-align:center}
.dev-banner__inner::before{content:'';position:absolute;top:-22px;left:-22px;right:0;bottom:0;background:linear-gradient(rgba(56,232,255,.05) 1px,transparent 1px) 0 0/22px 22px,linear-gradient(90deg,rgba(56,232,255,.05) 1px,transparent 1px) 0 0/22px 22px;animation:devGrid 6s linear infinite}
.dev-banner__inner::after{content:'';position:absolute;top:0;bottom:0;left:-45%;width:38%;background:linear-gradient(90deg,transparent,rgba(255,176,32,.16),transparent);animation:devScan 3.4s ease-in-out infinite}
.dev-banner__row{display:flex;align-items:center;justify-content:center;gap:10px;position:relative;z-index:1}
.dev-banner__dot{position:relative;width:8px;height:8px;border-radius:50%;background:#ffb020;box-shadow:0 0 12px #ffb020;animation:devPulse 1.4s ease-in-out infinite;flex:none}
.dev-banner__dot::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(255,176,32,.6);animation:devRing 1.8s ease-out infinite}
.dev-banner__title{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(11px,3vw,13px);letter-spacing:.16em;color:#ffb020;font-weight:700;animation:devGlitch 6s steps(1) infinite}
.dev-banner__sub{position:relative;z-index:1;margin-top:2px;font-size:clamp(10.5px,2.8vw,12px);line-height:1.35;color:#dbe5ee;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dev-banner__segs{position:relative;z-index:1;display:flex;justify-content:center;gap:3px;margin:6px auto 0;max-width:100%}
.dev-banner__segs span{position:relative;width:clamp(8px,2.4vw,13px);height:3px;border-radius:2px;background:rgba(255,176,32,.16);animation:devChase 1.8s ease-in-out infinite}
.dev-banner__segs span::before{content:'';position:absolute;inset:0;border-radius:inherit;background:#ffb020;opacity:0;animation:devChaseLit 1.8s ease-in-out infinite;animation-delay:inherit}
.dev-banner__bar{position:relative;z-index:1;margin:5px auto 0;width:min(200px,60%);height:2px;overflow:hidden;border-radius:2px;background:rgba(56,232,255,.14)}
.dev-banner__bar span{display:block;height:100%;width:40%;background:linear-gradient(90deg,transparent,#38e8ff,transparent);animation:devSweep 1.8s linear infinite}
@keyframes devSpin{to{transform:rotate(360deg)}}
@keyframes devScan{0%{transform:translateX(0)}60%,100%{transform:translateX(420%)}}
@keyframes devGrid{to{transform:translate(22px,22px)}}
@keyframes devRing{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.8);opacity:0}}
@keyframes devPulse{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
@keyframes devSweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
@keyframes devChase{0%,100%{transform:scaleY(1)}35%{transform:scaleY(1.6)}}
@keyframes devChaseLit{0%,100%{opacity:0}35%{opacity:1}}
@keyframes devGlowPulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes devOutL{from{transform:translateX(100cqw)}to{transform:translateX(-64px)}}
@keyframes devOutR{from{transform:translateX(-64px)}to{transform:translateX(100cqw)}}
@keyframes devGlitch{0%,92%,100%{text-shadow:none}93%{text-shadow:2px 0 rgba(56,232,255,.8),-2px 0 rgba(255,60,120,.6)}95%{text-shadow:-2px 0 rgba(56,232,255,.8),2px 0 rgba(255,60,120,.6)}97%{text-shadow:none}}
@media (max-width:480px){.dev-banner{top:68px}.dev-banner__inner{padding:7px 12px 7px}}
@media (prefers-reduced-motion:reduce){.dev-banner__wrap::before,.dev-banner__line::after,.dev-banner__box::before,.dev-banner__inner::before,.dev-banner__inner::after,.dev-banner__dot,.dev-banner__dot::after,.dev-banner__title,.dev-banner__segs span,.dev-banner__segs span::before,.dev-banner__bar span{animation:none}.dev-banner__segs span{background:rgba(255,176,32,.5)}}
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

  // The title re-decrypts every 9 s, but only while the banner is on screen: far down the page that animation
  // (React re-render + text change ~30 times) woke the whole page up every 9 s for nobody to see.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let onScreen = true;
    const el = rootRef.current;
    const io =
      el && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            onScreen = entries[0].isIntersecting;
          })
        : null;
    if (io && el) io.observe(el);
    const id = setInterval(() => {
      if (onScreen && !document.hidden) setTick((n) => n + 1);
    }, 9000);
    return () => {
      clearInterval(id);
      io?.disconnect();
    };
  }, []);

  const t = DEV_BANNER_TEXT[lang] || DEV_BANNER_TEXT.en;

  return (
    <div ref={rootRef} className="dev-banner" role="status" aria-live="polite">
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
