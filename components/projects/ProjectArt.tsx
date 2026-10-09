'use client';

/**
 * Animated, code-drawn banners for the "My Projects" cards.
 * Pure SVG + CSS (no images), so they stay sharp on every screen.
 * Every banner uses a 400 x 250 canvas and is drawn with "slice" so it fills the card.
 */

import React from 'react';
import type { ProjectArtKey } from '@/data/projects';

const svgProps = {
  viewBox: '0 0 400 250',
  preserveAspectRatio: 'xMidYMid slice' as const,
  className: 'absolute inset-0 w-full h-full',
  'aria-hidden': true,
};

/* tiny deterministic random so server + client render the same thing */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/* ───────────────────────── MEHENDI ───────────────────────── */

function petalRing(n: number, r: number, len: number, w: number) {
  const d = `M0,${-r} Q${w},${-(r + len / 2)} 0,${-(r + len)} Q${-w},${-(r + len / 2)} 0,${-r}Z`;
  return Array.from({ length: n }, (_, i) => (
    <path key={i} d={d} transform={`rotate(${(360 / n) * i})`} pathLength={1} />
  ));
}

function MehendiArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <radialGradient id="mh-bg" cx="72%" cy="45%" r="80%">
          <stop offset="0%" stopColor="#1f4a35" />
          <stop offset="45%" stopColor="#0f2b1f" />
          <stop offset="100%" stopColor="#050f0a" />
        </radialGradient>
        <linearGradient id="mh-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6dfa0" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#8a6420" />
        </linearGradient>
        <radialGradient id="mh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f3cf7a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f3cf7a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mh-bokeh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="250" fill="url(#mh-bg)" />

      {/* soft bokeh lights */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          cx={180 + rand(i) * 220}
          cy={rand(i + 40) * 250}
          r={6 + rand(i + 80) * 16}
          fill="url(#mh-bokeh)"
          className="hp-bokeh"
          style={{ animationDelay: `${(rand(i + 7) * 6).toFixed(2)}s` }}
        />
      ))}

      {/* glowing mandala */}
      <g transform="translate(300 125)">
        <circle r="115" fill="url(#mh-glow)" className="hp-pulse" />
        <g
          className="hp-spin-slow"
          fill="none"
          stroke="url(#mh-gold)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        >
          <g className="hp-draw" style={{ animationDelay: '0.1s' }}>{petalRing(8, 8, 18, 7)}</g>
          <g className="hp-draw" style={{ animationDelay: '0.5s' }}>{petalRing(12, 26, 22, 8)}</g>
          <g className="hp-draw" style={{ animationDelay: '0.9s' }}>{petalRing(16, 48, 26, 9)}</g>
          <g className="hp-draw" style={{ animationDelay: '1.3s' }}>{petalRing(24, 74, 22, 6)}</g>
          <g className="hp-draw" style={{ animationDelay: '1.7s' }}>{petalRing(32, 96, 16, 4)}</g>
          <circle r="6" fill="url(#mh-gold)" stroke="none" />
          <circle r="24" pathLength={1} className="hp-draw" />
          <circle r="46" pathLength={1} strokeDasharray="0.01 0.02" />
          <circle r="72" pathLength={1} className="hp-draw" style={{ animationDelay: '1.1s' }} />
          <circle r="94" pathLength={1} strokeDasharray="0.004 0.01" />
          {/* dotted outer beads */}
          {Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * 116}
                cy={Math.sin(a) * 116}
                r={i % 2 ? 1 : 1.8}
                fill="#e7c46e"
                stroke="none"
              />
            );
          })}
        </g>
        <g className="hp-spin-rev" fill="none" stroke="#e7c46e" strokeOpacity="0.35" strokeWidth="0.6">
          {petalRing(20, 60, 12, 4)}
        </g>
      </g>

      {/* hanging vine at the top */}
      <g fill="none" stroke="url(#mh-gold)" strokeWidth="1" opacity="0.8">
        <path
          d="M0,18 C60,40 110,4 170,22 S270,40 330,14 S390,10 400,20"
          pathLength={1}
          className="hp-draw"
          style={{ animationDelay: '0.3s' }}
        />
        {Array.from({ length: 9 }, (_, i) => {
          const x = 20 + i * 45;
          const y = 18 + Math.sin(i * 1.4) * 10;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? 35 : -35})`} className="hp-sway" style={{ animationDelay: `${i * 0.3}s` }}>
              <ellipse rx="3.2" ry="7" cy="8" fill="#1f4a35" stroke="#d9b45c" />
            </g>
          );
        })}
      </g>

      {/* rising gold dust */}
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={`d${i}`}
          cx={rand(i + 100) * 400}
          cy={200 + rand(i + 200) * 60}
          r={0.6 + rand(i + 300) * 1.4}
          fill="#ffe2a0"
          className="hp-rise"
          style={{
            animationDelay: `${(rand(i + 400) * 7).toFixed(2)}s`,
            animationDuration: `${(6 + rand(i + 500) * 5).toFixed(2)}s`,
          }}
        />
      ))}
    </svg>
  );
}

/* ───────────────────────── WEB STUDIO ───────────────────────── */

function WebStudioArt() {
  const codeRows = [
    { x: 0, w: 60, c: '#c084fc' },
    { x: 10, w: 110, c: '#38e8ff' },
    { x: 20, w: 80, c: '#f472b6' },
    { x: 20, w: 130, c: '#94a3b8' },
    { x: 10, w: 70, c: '#38e8ff' },
    { x: 20, w: 95, c: '#a78bfa' },
    { x: 0, w: 40, c: '#c084fc' },
  ];
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="ws-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b0624" />
          <stop offset="55%" stopColor="#1b0f45" />
          <stop offset="100%" stopColor="#05030f" />
        </linearGradient>
        <radialGradient id="ws-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ws-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#140b33" />
          <stop offset="100%" stopColor="#0a0620" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#ws-bg)" />
      <ellipse cx="290" cy="150" rx="160" ry="90" fill="url(#ws-glow)" className="hp-pulse" />

      {/* moving perspective floor */}
      <g stroke="#7c3aed" strokeOpacity="0.45" strokeWidth="0.7">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={290} y1={195} x2={-60 + i * 55} y2={260} />
        ))}
        <g className="hp-floor">
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1="0" x2="400" y1={200 + i * 12} y2={200 + i * 12} />
          ))}
        </g>
      </g>

      {/* floating laptop / browser */}
      <g className="hp-float" transform="translate(200 46)">
        <rect width="180" height="118" rx="6" fill="url(#ws-screen)" stroke="#a78bfa" strokeOpacity="0.8" />
        <rect width="180" height="16" rx="6" fill="#1e1350" />
        <circle cx="10" cy="8" r="2.5" fill="#f472b6" />
        <circle cx="19" cy="8" r="2.5" fill="#fbbf24" />
        <circle cx="28" cy="8" r="2.5" fill="#34d399" />
        <rect x="42" y="4" width="120" height="8" rx="4" fill="#2a1d66" />
        <g transform="translate(12 28)">
          {codeRows.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={i * 11}
              height="5"
              rx="2.5"
              width={r.w}
              fill={r.c}
              className="hp-type"
              style={{ animationDelay: `${i * 0.45}s` }}
            />
          ))}
          <rect x="0" y={codeRows.length * 11} width="5" height="7" fill="#38e8ff" className="hp-blink" />
        </g>
        {/* base */}
        <path d="M-12,118 L192,118 L200,128 L-20,128 Z" fill="#2a1d66" stroke="#a78bfa" strokeOpacity="0.6" />
      </g>

      {/* floating UI chips */}
      <g className="hp-float-2">
        <rect x="160" y="140" width="56" height="34" rx="5" fill="#120a2e" stroke="#38e8ff" strokeOpacity="0.7" />
        <rect x="167" y="148" width="26" height="4" rx="2" fill="#38e8ff" />
        <rect x="167" y="157" width="40" height="3" rx="1.5" fill="#64748b" />
        <rect x="167" y="164" width="32" height="3" rx="1.5" fill="#64748b" />
      </g>
      <g className="hp-float-3">
        <circle cx="360" cy="40" r="14" fill="#120a2e" stroke="#f472b6" strokeOpacity="0.8" />
        <path d="M353,40 l5,5 l9,-10" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* stars */}
      {Array.from({ length: 30 }, (_, i) => (
        <circle
          key={i}
          cx={rand(i + 11) * 400}
          cy={rand(i + 22) * 190}
          r={rand(i + 33) * 1.1 + 0.2}
          fill="#e9d5ff"
          className="hp-twinkle"
          style={{ animationDelay: `${(rand(i + 44) * 4).toFixed(2)}s` }}
        />
      ))}
    </svg>
  );
}

/* ───────────────────────── TECHNOLOGY (globe + city) ───────────────────────── */

function TechnologyArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="tc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020b1a" />
          <stop offset="60%" stopColor="#06213d" />
          <stop offset="100%" stopColor="#0a3a5c" />
        </linearGradient>
        <radialGradient id="tc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38e8ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38e8ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tc-tower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38e8ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0a2540" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#tc-bg)" />

      {/* globe */}
      <g transform="translate(300 92)">
        <circle r="82" fill="url(#tc-glow)" className="hp-pulse" />
        <g fill="none" stroke="#38e8ff" strokeWidth="0.8" strokeOpacity="0.75">
          <circle r="56" strokeOpacity="0.9" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} rx="56" ry="56">
              <animate
                attributeName="rx"
                values="56;0;56"
                keyTimes="0;0.5;1"
                dur="9s"
                begin={`${-i * 1.5}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          ))}
          {[-36, -18, 0, 18, 36].map((y) => (
            <ellipse key={y} cy={y} rx={Math.sqrt(56 * 56 - y * y)} ry={Math.sqrt(56 * 56 - y * y) * 0.18} strokeOpacity="0.5" />
          ))}
          {/* orbit ring with a satellite */}
          <g transform="rotate(-20)">
            <ellipse rx="86" ry="22" stroke="#a5f3fc" strokeOpacity="0.55" strokeDasharray="3 4" />
            <circle r="3" fill="#e0fbff" stroke="none">
              <animateMotion dur="6s" repeatCount="indefinite" path="M86,0 A86,22 0 1,1 -86,0 A86,22 0 1,1 86,0" />
            </circle>
          </g>
        </g>
      </g>

      {/* city skyline with rising towers */}
      <g>
        {Array.from({ length: 22 }, (_, i) => {
          const w = 10 + rand(i + 5) * 14;
          const h = 40 + rand(i + 9) * 90;
          const x = i * 19 - 6;
          return (
            <g key={i} className="hp-tower" style={{ animationDelay: `${(i * 0.06).toFixed(2)}s` }}>
              <rect x={x} y={250 - h} width={w} height={h} fill="url(#tc-tower)" stroke="#38e8ff" strokeOpacity="0.35" strokeWidth="0.5" />
              {Array.from({ length: Math.floor(h / 12) }, (_, j) => (
                <rect
                  key={j}
                  x={x + 3}
                  y={250 - h + 6 + j * 12}
                  width={w - 6}
                  height="2"
                  fill="#a5f3fc"
                  opacity={rand(i * 31 + j) > 0.45 ? 0.75 : 0.12}
                  className={rand(i * 17 + j) > 0.85 ? 'hp-twinkle' : undefined}
                />
              ))}
            </g>
          );
        })}
      </g>

      {/* data beams going up */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={30 + i * 62}
          y="0"
          width="1.2"
          height="40"
          fill="#38e8ff"
          className="hp-beam"
          style={{ animationDelay: `${(i * 0.7).toFixed(2)}s` }}
        />
      ))}
    </svg>
  );
}

/* ───────────────────────── THE BRIDGE FOR ONE ───────────────────────── */

function BridgeArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="br-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1030" />
          <stop offset="45%" stopColor="#7a2e3a" />
          <stop offset="75%" stopColor="#e2793a" />
          <stop offset="100%" stopColor="#f6b25a" />
        </linearGradient>
        <radialGradient id="br-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff2c4" />
          <stop offset="40%" stopColor="#ffcb6b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="br-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b1d2a" />
          <stop offset="100%" stopColor="#0d0a14" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#br-sky)" />
      <circle cx="290" cy="150" r="70" fill="url(#br-sun)" className="hp-pulse" />

      {/* far skyline */}
      <g fill="#2a1424" opacity="0.85">
        {Array.from({ length: 26 }, (_, i) => {
          const w = 8 + rand(i + 61) * 12;
          const h = 30 + rand(i + 71) * 70;
          return <rect key={i} x={i * 16} y={170 - h} width={w} height={h} />;
        })}
      </g>

      {/* water */}
      <rect y="170" width="400" height="80" fill="url(#br-water)" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={240 + rand(i + 3) * 90}
          y={176 + i * 8}
          width={30 + rand(i + 4) * 40}
          height="1.2"
          fill="#ffcf7a"
          opacity="0.55"
          className="hp-shimmer"
          style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }}
        />
      ))}

      {/* suspension bridge */}
      <g stroke="#120a14" fill="none">
        <rect x="88" y="78" width="8" height="98" fill="#120a14" />
        <rect x="292" y="78" width="8" height="98" fill="#120a14" stroke="none" />
        <path d="M-20,150 Q40,150 92,80 Q194,170 296,80 Q350,150 420,150" strokeWidth="2" />
        {Array.from({ length: 19 }, (_, i) => {
          const x = 100 + i * 10.4;
          const t = (x - 92) / 204;
          const y = 80 + 4 * 45 * t * (1 - t);
          return <line key={i} x1={x} y1={y} x2={x} y2={160} strokeWidth="0.7" />;
        })}
        <rect x="-10" y="158" width="420" height="5" fill="#120a14" stroke="none" />
      </g>

      {/* light trails on the bridge */}
      <rect y="159.5" height="1.6" width="40" fill="#fff1c1" className="hp-trail" />
      <rect y="161" height="1.6" width="30" fill="#ff6b6b" className="hp-trail-rev" />

      {/* lone figure */}
      <g fill="#120a14" transform="translate(196 146)">
        <circle cx="0" cy="0" r="2.4" />
        <rect x="-1.8" y="2" width="3.6" height="9" rx="1.5" />
      </g>

      {/* birds */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d="M0,0 q4,-4 8,0 q4,-4 8,0"
          fill="none"
          stroke="#1a0f1a"
          strokeWidth="1.2"
          className="hp-bird"
          style={{ animationDelay: `${i * 2.2}s`, transform: `translate(0px, ${50 + i * 14}px)` }}
        />
      ))}
    </svg>
  );
}

/* ───────────────────────── QUANTUM LAB ───────────────────────── */

function QuantumArt() {
  const orbit = 'M70,0 A70,24 0 1,1 -70,0 A70,24 0 1,1 70,0';
  return (
    <svg {...svgProps}>
      <defs>
        <radialGradient id="qt-bg" cx="70%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#0f2a2f" />
          <stop offset="50%" stopColor="#071418" />
          <stop offset="100%" stopColor="#020607" />
        </radialGradient>
        <radialGradient id="qt-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#qt-bg)" />

      {/* circuit traces */}
      <g fill="none" stroke="#2dd4bf" strokeOpacity="0.25" strokeWidth="0.8">
        {Array.from({ length: 8 }, (_, i) => {
          const y = 20 + i * 30;
          const x = 150 + rand(i + 2) * 60;
          return (
            <g key={i}>
              <path d={`M0,${y} H${x} l12,12 H400`} />
              <circle cx={x} cy={y} r="2" fill="#2dd4bf" fillOpacity="0.5" />
              <circle r="1.8" fill="#99f6e4" stroke="none">
                <animateMotion dur={`${4 + rand(i + 9) * 3}s`} repeatCount="indefinite" path={`M0,${y} H${x} l12,12 H400`} />
              </circle>
            </g>
          );
        })}
      </g>

      {/* atom */}
      <g transform="translate(290 125)">
        <circle r="34" fill="url(#qt-core)" className="hp-pulse" />
        {[0, 60, 120].map((rot, i) => (
          <g key={rot} transform={`rotate(${rot})`}>
            <ellipse rx="70" ry="24" fill="none" stroke="#5eead4" strokeOpacity="0.8" strokeWidth="1" />
            <circle r="4" fill="#ccfbf1">
              <animateMotion dur={`${2.6 + i * 0.7}s`} repeatCount="indefinite" path={orbit} />
            </circle>
          </g>
        ))}
        <g className="hp-spin-slow" fill="none" stroke="#5eead4" strokeOpacity="0.3">
          <circle r="96" strokeDasharray="2 6" />
          <circle r="108" strokeDasharray="20 10 2 10" />
        </g>
      </g>

      {/* qubit particles */}
      {Array.from({ length: 26 }, (_, i) => (
        <circle
          key={i}
          cx={rand(i + 81) * 400}
          cy={rand(i + 91) * 250}
          r={rand(i + 101) * 1.4 + 0.4}
          fill="#99f6e4"
          className="hp-twinkle"
          style={{ animationDelay: `${(rand(i + 111) * 4).toFixed(2)}s` }}
        />
      ))}
    </svg>
  );
}

/* ───────────────────────── ORBIT ───────────────────────── */

function OrbitArt() {
  const arcs = [
    { d: 'M-20,210 Q200,-40 420,140', dur: 7 },
    { d: 'M-20,140 Q220,10 420,220', dur: 9 },
    { d: 'M40,250 Q180,40 420,60', dur: 8 },
  ];
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="or-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#02030a" />
          <stop offset="100%" stopColor="#0a1030" />
        </linearGradient>
        <radialGradient id="or-planet" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="40%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="or-atmo" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#60a5fa" stopOpacity="0" />
          <stop offset="93%" stopColor="#93c5fd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#or-bg)" />
      {Array.from({ length: 50 }, (_, i) => (
        <circle
          key={i}
          cx={rand(i + 201) * 400}
          cy={rand(i + 211) * 180}
          r={rand(i + 221) * 1.1 + 0.2}
          fill="#e0e7ff"
          className="hp-twinkle"
          style={{ animationDelay: `${(rand(i + 231) * 5).toFixed(2)}s` }}
        />
      ))}

      {/* planet horizon */}
      <circle cx="220" cy="420" r="300" fill="url(#or-atmo)" className="hp-pulse" />
      <circle cx="220" cy="420" r="280" fill="url(#or-planet)" />
      {/* city lights on planet */}
      {Array.from({ length: 40 }, (_, i) => {
        const a = Math.PI * (1.25 + rand(i + 301) * 0.5);
        const rr = 200 + rand(i + 311) * 75;
        return (
          <circle
            key={i}
            cx={220 + Math.cos(a) * rr}
            cy={420 + Math.sin(a) * rr}
            r="0.9"
            fill="#fde68a"
            className="hp-twinkle"
            style={{ animationDelay: `${(rand(i + 321) * 3).toFixed(2)}s` }}
          />
        );
      })}

      {/* satellite paths */}
      {arcs.map((a, i) => (
        <g key={i}>
          <path d={a.d} fill="none" stroke="#818cf8" strokeOpacity="0.35" strokeDasharray="2 5" />
          <g>
            <animateMotion dur={`${a.dur}s`} repeatCount="indefinite" path={a.d} rotate="auto" />
            <rect x="-6" y="-1.5" width="12" height="3" fill="#a5b4fc" />
            <rect x="-2" y="-3" width="4" height="6" fill="#e0e7ff" />
            <circle r="9" fill="none" stroke="#c7d2fe" strokeOpacity="0.6">
              <animate attributeName="r" values="3;14" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      ))}

      {/* uplink beam */}
      <line x1="220" y1="145" x2="300" y2="70" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="4 6" className="hp-dash" />
      <line x1="160" y1="150" x2="110" y2="80" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="4 6" className="hp-dash" />
    </svg>
  );
}

const ART: Record<ProjectArtKey, React.FC> = {
  mehendi: MehendiArt,
  'web-studio': WebStudioArt,
  technology: TechnologyArt,
  bridge: BridgeArt,
  quantum: QuantumArt,
  orbit: OrbitArt,
};

export function ProjectArt({ art }: { art?: ProjectArtKey }) {
  const Cmp = art ? ART[art] : TechnologyArt;
  return <Cmp />;
}

/** Keyframes used by the banners and the cards. Rendered once by ProjectsSection. */
export const projectArtCss = `
.hp-spin-slow{animation:hp-spin 60s linear infinite;transform-box:fill-box;transform-origin:center}
.hp-spin-rev{animation:hp-spin 40s linear infinite reverse;transform-box:fill-box;transform-origin:center}
@keyframes hp-spin{to{transform:rotate(360deg)}}
.hp-pulse{animation:hp-pulse 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes hp-pulse{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
.hp-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:hp-draw 3.2s ease-out forwards}
@keyframes hp-draw{to{stroke-dashoffset:0}}
.hp-bokeh{animation:hp-bokeh 6s ease-in-out infinite}
@keyframes hp-bokeh{0%,100%{opacity:.25}50%{opacity:.9}}
.hp-rise{animation:hp-rise 8s linear infinite;opacity:0}
@keyframes hp-rise{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-230px);opacity:0}}
.hp-sway{animation:hp-sway 4s ease-in-out infinite;transform-box:fill-box;transform-origin:top center}
@keyframes hp-sway{0%,100%{rotate:-6deg}50%{rotate:6deg}}
.hp-twinkle{animation:hp-twinkle 3s ease-in-out infinite}
@keyframes hp-twinkle{0%,100%{opacity:.2}50%{opacity:1}}
.hp-float{animation:hp-float 6s ease-in-out infinite}
.hp-float-2{animation:hp-float 5s ease-in-out infinite -1.5s}
.hp-float-3{animation:hp-float 7s ease-in-out infinite -3s}
@keyframes hp-float{0%,100%{translate:0 0}50%{translate:0 -7px}}
.hp-floor{animation:hp-floor 1.6s linear infinite}
@keyframes hp-floor{to{transform:translateY(12px)}}
.hp-type{transform-box:fill-box;transform-origin:left center;animation:hp-type 6s ease-out infinite;transform:scaleX(0)}
@keyframes hp-type{0%{transform:scaleX(0)}12%,85%{transform:scaleX(1)}100%{transform:scaleX(1);opacity:0}}
.hp-blink{animation:hp-blink 1s steps(2) infinite}
@keyframes hp-blink{50%{opacity:0}}
.hp-tower{transform-box:fill-box;transform-origin:bottom center;animation:hp-tower 1.4s cubic-bezier(.2,.8,.2,1) both}
@keyframes hp-tower{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.hp-beam{animation:hp-beam 3.5s linear infinite;opacity:0}
@keyframes hp-beam{0%{transform:translateY(250px);opacity:0}20%{opacity:.9}100%{transform:translateY(-60px);opacity:0}}
.hp-shimmer{animation:hp-shimmer 3s ease-in-out infinite}
@keyframes hp-shimmer{0%,100%{opacity:.15;translate:0 0}50%{opacity:.7;translate:6px 0}}
.hp-trail{animation:hp-trail 4s linear infinite}
.hp-trail-rev{animation:hp-trail 5s linear infinite reverse}
@keyframes hp-trail{from{transform:translateX(-60px)}to{transform:translateX(420px)}}
.hp-bird{animation:hp-bird 14s linear infinite}
@keyframes hp-bird{from{translate:-30px 0}to{translate:430px -20px}}
.hp-dash{animation:hp-dash 1s linear infinite}
@keyframes hp-dash{to{stroke-dashoffset:-20}}

/* ---------- card effects ---------- */
.hp-card{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out, box-shadow .3s}
.hp-card-in{animation:hp-card-in .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes hp-card-in{from{opacity:0;transform:perspective(900px) translateY(40px) rotateX(18deg) scale(.96);filter:blur(6px)}to{opacity:1;transform:perspective(900px) translateY(0) rotateX(0) scale(1);filter:blur(0)}}
.hp-border{position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 60%,var(--accent) 75%,#fff 80%,var(--accent) 85%,transparent 100%);animation:hp-spin 5s linear infinite}
.hp-spot{background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--accent) 22%,transparent),transparent 60%)}
.hp-scan{position:absolute;left:0;right:0;height:35%;background:linear-gradient(to bottom,transparent,color-mix(in srgb,var(--accent) 22%,transparent),transparent);animation:hp-scan 4.5s ease-in-out infinite;pointer-events:none;mix-blend-mode:screen}
@keyframes hp-scan{0%{top:-40%}100%{top:110%}}
.hp-shine{position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.18) 45%,transparent 60%);transform:translateX(-120%);transition:transform .9s ease;pointer-events:none}
.group:hover .hp-shine{transform:translateX(120%)}
.hp-gold-text{background:linear-gradient(100deg,#f7e2a6,#c99a3c 40%,#fff1c8 50%,#c99a3c 60%,#f7e2a6);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:hp-sheen 5s linear infinite}
@keyframes hp-sheen{to{background-position:-250% 0}}
.hp-ping{animation:hp-ping 1.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes hp-ping{75%,100%{transform:scale(2.4);opacity:0}}
.hp-grid-bg{background-image:linear-gradient(rgba(56,232,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(56,232,255,.06) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(ellipse at center,#000 30%,transparent 75%);animation:hp-grid 20s linear infinite}
@keyframes hp-grid{to{background-position:44px 44px}}

@media (prefers-reduced-motion: reduce){
  [class*="hp-"]{animation:none !important}
  .hp-draw{stroke-dashoffset:0}
  .hp-type{transform:scaleX(1)}
}
`;
