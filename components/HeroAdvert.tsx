'use client';

import React, { useEffect, useRef } from 'react';
import { motion, animate, useInView, useReducedMotion, type Variants } from 'motion/react';
import { Code, Bot, Sparkles, Briefcase, ShieldCheck, Rocket, Globe, ArrowRight, Layers, Megaphone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { defaultBundle } from '@/locales';

/** Counts up to a real number when scrolled into view (reduced motion: shows the number at once). */
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = String(to);
      return;
    }
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, to, reduce]);
  return <span ref={ref}>0</span>;
}

export function HeroAdvert() {
  const { t, languages } = useLanguage();
  const reduce = useReducedMotion();
  // Missing keys in other languages fall back to English
  const a = { ...defaultBundle.ui.heroAdvert, ...(t.heroAdvert ?? {}) } as Record<string, string>;

  const services = [
    { Icon: Code, title: a.service1Title, desc: a.service1Desc, tone: '#38e8ff' },
    { Icon: Bot, title: a.service2Title, desc: a.service2Desc, tone: '#818cf8' },
    { Icon: Sparkles, title: a.service3Title, desc: a.service3Desc, tone: '#c084fc' },
    { Icon: Briefcase, title: a.service4Title, desc: a.service4Desc, tone: '#38e8ff' },
  ];

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } },
  };

  return (
    <motion.section
      aria-label={a.badge}
      className="relative mt-5 pointer-events-auto"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
    >
      <span className="hx-glow" aria-hidden="true" />
      <div className="hx-frame">
        <div className="hx-body hx-sweep p-4 sm:p-5">
          {/* Badge + website */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
            <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#c084fc]/40 bg-[#c084fc]/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#d8b4fe]">
              <Megaphone className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">{a.badge}</span>
            </span>
            <span dir="ltr" className="font-mono text-[10px] text-[#38e8ff]/80">hayaatiweb.site</span>
          </motion.div>

          {/* Headline + tagline */}
          <motion.h2
            variants={item}
            className="mt-3 text-xl sm:text-2xl font-extrabold leading-[1.25] tracking-tight text-white break-words"
          >
            <span className="bg-gradient-to-r from-[#38e8ff] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
              {a.headline}
            </span>
          </motion.h2>
          <motion.p variants={item} className="mt-1.5 text-sm leading-relaxed text-slate-300 break-words">
            {a.tagline}
          </motion.p>

          {/* Services */}
          <div className="mt-4 grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
            {services.map(({ Icon, title, desc, tone }) => (
              <motion.div
                key={title}
                variants={item}
                whileHover={reduce ? undefined : { y: -3 }}
                className="group relative flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm transition-colors hover:border-[#38e8ff]/45"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                  style={{ borderColor: `${tone}66`, background: `${tone}1f`, boxShadow: `0 0 14px ${tone}33` }}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: tone }} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold leading-tight text-slate-100 break-words">{title}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-400 break-words">{desc}</span>
                </span>
              </motion.div>
            ))}
          </div>

          {/* Real facts only: 30 languages, 4 core services */}
          <motion.div variants={item} className="mt-3.5 grid grid-cols-2 gap-2.5">
            {[
              { Icon: Globe, value: languages.length, label: a.statLanguages },
              { Icon: Layers, value: services.length, label: a.statServices },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-lg border border-[#38e8ff]/20 bg-[#38e8ff]/[0.05] px-3 py-2">
                <Icon className="h-4 w-4 shrink-0 text-[#38e8ff]" aria-hidden="true" />
                <span className="font-mono text-xl font-bold leading-none text-white tabular-nums">
                  <Counter to={value} />
                </span>
                <span className="min-w-0 text-[11px] leading-tight text-slate-400 break-words">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust / credential strip */}
          <motion.div variants={item} className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words">{a.founderLabel}: Aliya Khan</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#818cf8]/40 bg-[#818cf8]/10 px-3 py-1 text-[11px] font-semibold text-[#c7d2fe]">
              <Rocket className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words">{a.builtFor}</span>
            </span>
          </motion.div>

          {/* Calls to action */}
          <motion.div variants={item} className="mt-4 grid grid-cols-2 gap-2.5">
            <a
              href="#contact"
              className="col-span-2 flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#38e8ff] via-[#6aa8ff] to-[#c084fc] px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-wider text-[#05070a] shadow-[0_0_24px_rgba(56,232,255,0.35)] transition-transform active:scale-[0.98] hover:brightness-110"
            >
              <span className="break-words">{a.ctaStart}</span>
              <ArrowRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
            </a>
            <a
              href="#projects"
              className="flex min-h-[48px] items-center justify-center rounded-md border border-[#38e8ff]/40 bg-[#05101c]/70 px-2.5 py-2.5 text-center font-mono text-[11px] font-bold uppercase leading-tight tracking-wider text-slate-100 transition-colors hover:border-[#38e8ff] hover:bg-[#38e8ff]/10"
            >
              <span className="break-words">{a.ctaProjects}</span>
            </a>
            <a
              href="#advertise"
              className="flex min-h-[48px] items-center justify-center rounded-md border border-[#c084fc]/45 bg-[#12081f]/60 px-2.5 py-2.5 text-center font-mono text-[11px] font-bold uppercase leading-tight tracking-wider text-[#e9d5ff] transition-colors hover:border-[#c084fc] hover:bg-[#c084fc]/10"
            >
              <span className="break-words">{a.ctaAdvertise}</span>
            </a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
