'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Star, X, ThumbsUp, ThumbsDown, ChevronDown, Check, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  buildRatingAreas,
  RATING_ISSUES,
  STAR_LABELS,
  RATED_STORAGE_KEY,
  type RatingVerdict,
} from '@/lib/ratingCatalog';

interface RatingDialogProps {
  open: boolean;
  /** true when the popup opened by itself (timer), false when the visitor pressed the Rate button */
  auto: boolean;
  onClose: (rated: boolean) => void;
}

type Status = 'idle' | 'sending' | 'done' | 'error';

function readRated(): boolean {
  try {
    return Boolean(localStorage.getItem(RATED_STORAGE_KEY));
  } catch {
    return false;
  }
}

function VerdictToggle({
  value,
  onChange,
  small = false,
  label,
}: {
  value?: RatingVerdict;
  onChange: (v: RatingVerdict | undefined) => void;
  small?: boolean;
  label: string;
}) {
  const size = small ? 'h-8 min-w-8 px-2 text-[10px]' : 'h-9 min-w-9 px-2.5 text-[11px]';
  return (
    <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label={label}>
      <button
        type="button"
        aria-pressed={value === 'good'}
        aria-label={`${label}: good`}
        onClick={() => onChange(value === 'good' ? undefined : 'good')}
        className={`rt-chip ${size} ${value === 'good' ? 'rt-chip--good' : ''}`}
      >
        <ThumbsUp className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {!small && <span className="hidden sm:inline">Good</span>}
      </button>
      <button
        type="button"
        aria-pressed={value === 'bad'}
        aria-label={`${label}: needs work`}
        onClick={() => onChange(value === 'bad' ? undefined : 'bad')}
        className={`rt-chip ${size} ${value === 'bad' ? 'rt-chip--bad' : ''}`}
      >
        <ThumbsDown className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {!small && <span className="hidden sm:inline">Needs work</span>}
      </button>
    </div>
  );
}

export function RatingDialog({ open, auto, onClose }: RatingDialogProps) {
  const { t, content, language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const areas = useMemo(() => buildRatingAreas(t, content), [t, content]);

  const [alreadyRated, setAlreadyRated] = useState(false);
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, RatingVerdict>>({});
  const [issues, setIssues] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [honey, setHoney] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setAlreadyRated(readRated());
    setStatus((s) => (s === 'done' ? 'done' : 'idle'));
    setErrorText('');
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('bg-paused');
    requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      document.body.style.overflow = original;
      document.documentElement.classList.remove('bg-paused');
    };
  }, [open]);

  const done = status === 'done';
  const close = () => onClose(done || alreadyRated);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, done, alreadyRated]);

  const setVerdict = (id: string, v: RatingVerdict | undefined) =>
    setVerdicts((prev) => {
      const next = { ...prev };
      if (v) next[id] = v;
      else delete next[id];
      return next;
    });

  const toggleIssue = (id: string) =>
    setIssues((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async () => {
    if (!stars || status === 'sending') return;
    setStatus('sending');
    setErrorText('');
    try {
      const res = await fetch('/api/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars,
          verdicts,
          issues,
          message,
          name,
          email,
          website: honey,
          lang: language,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        try {
          localStorage.setItem(RATED_STORAGE_KEY, new Date().toISOString());
        } catch {}
        setStatus('done');
        panelRef.current?.querySelector('.rt-scroll')?.scrollTo({ top: 0 });
        return;
      }
      setStatus('error');
      setErrorText(
        data.code === 'rate_limited'
          ? 'You have already sent a rating recently. Thank you!'
          : 'Could not send your rating right now. Please try again in a moment.'
      );
    } catch {
      setStatus('error');
      setErrorText('No connection. Please check your internet and try again.');
    }
  };

  const shownStar = hoverStar || stars;
  const marked = Object.keys(verdicts).length;

  const panelInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 18 };
  const panelAnimate = { opacity: 1, scale: 1, y: 0 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="rating-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rating-title"
          data-rating-dialog
          className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#02040a]/[0.86]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={panelRef}
            className="relative w-full sm:max-w-2xl flex flex-col max-h-[90dvh] sm:max-h-[86dvh]"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelInitial}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', willChange: 'transform, opacity' }}
          >
            <span className="hx-glow" aria-hidden="true" />
            <div className="hx-frame hx-frame--sheet flex flex-col min-h-0 flex-1">
              <div className="hx-body rt-body flex flex-col min-h-0 flex-1">
                {/* Moving high-tech layer behind dark glass (same family as the site's cards) */}
                <span className="rt-holo" aria-hidden="true">
                  <span className="rt-holo__grid" />
                  <span className="rt-holo__aurora" />
                  <span className="rt-holo__scan" />
                </span>

                {/* Header */}
                <div className="relative flex items-center justify-between gap-3 px-5 pt-4 pb-3 shrink-0 border-b border-[#38e8ff]/15">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#38e8ff]/40 bg-[#38e8ff]/10 shadow-[0_0_16px_rgba(56,232,255,0.25)]">
                      <Star className="w-5 h-5 text-[#38e8ff] fill-[#38e8ff]/30" />
                    </span>
                    <div className="min-w-0">
                      <h2 id="rating-title" className="text-sm font-mono tracking-wider text-slate-100 uppercase leading-tight">
                        Rate Hayaati Web
                      </h2>
                      <p className="mt-0.5 text-[11px] font-mono text-[#38e8ff]/80">
                        Your honest feedback shapes the next version
                      </p>
                    </div>
                  </div>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg border border-transparent hover:border-[#38e8ff]/40 hover:bg-[#38e8ff]/10 transition-colors cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="rt-scroll relative flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4" style={{ overscrollBehavior: 'contain' }}>
                  {done || alreadyRated ? (
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="py-10 flex flex-col items-center text-center"
                    >
                      <span className="rt-thanks-badge">
                        <Check className="w-8 h-8" strokeWidth={2.5} />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold text-white">Thank you for rating!</h3>
                      <p className="mt-2 max-w-sm text-sm text-slate-300 leading-relaxed">
                        Your feedback has been received. We read every rating and use it to improve the website.
                      </p>
                      {(done ? stars : 0) > 0 && (
                        <div className="mt-4 flex gap-1" aria-label={`${stars} of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-5 h-5 ${n <= stars ? 'text-[#38e8ff] fill-[#38e8ff]' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      {/* 1. Overall stars */}
                      <section className="rt-card">
                        <p className="rt-label">01 · Overall rating</p>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Overall rating" onMouseLeave={() => setHoverStar(0)}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={stars === n}
                                aria-label={`${n} star${n > 1 ? 's' : ''} · ${STAR_LABELS[n - 1]}`}
                                onMouseEnter={() => setHoverStar(n)}
                                onFocus={() => setHoverStar(n)}
                                onBlur={() => setHoverStar(0)}
                                onClick={() => setStars(n)}
                                className={`rt-star ${n <= shownStar ? 'is-on' : ''} ${n === stars ? 'is-picked' : ''}`}
                              >
                                <Star className="w-9 h-9 sm:w-10 sm:h-10" strokeWidth={1.4} />
                              </button>
                            ))}
                          </div>
                          <span className="font-mono text-sm tracking-widest uppercase text-[#38e8ff] min-h-[1.25rem]">
                            {shownStar ? STAR_LABELS[shownStar - 1] : 'Tap a star'}
                          </span>
                        </div>
                      </section>

                      {/* 2. Every section / catalogue / card */}
                      <section className="rt-card mt-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="rt-label">02 · What is good, what needs work?</p>
                          {marked > 0 && <span className="text-[10px] font-mono text-[#38e8ff]/80 shrink-0">{marked} marked</span>}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Optional. Open any section to rate its cards one by one.</p>
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {areas.map((area) => {
                            const isOpen = expanded === area.id;
                            const inner = area.items.filter((it) => verdicts[it.id]).length;
                            return (
                              <li key={area.id} className={`rt-area ${isOpen ? 'is-open' : ''}`}>
                                <div className="flex items-center gap-2 px-2.5 py-2">
                                  <button
                                    type="button"
                                    disabled={!area.items.length}
                                    onClick={() => setExpanded(isOpen ? null : area.id)}
                                    aria-expanded={area.items.length ? isOpen : undefined}
                                    className="flex-1 min-w-0 flex items-center gap-2 text-start cursor-pointer disabled:cursor-default"
                                  >
                                    {area.items.length > 0 ? (
                                      <ChevronDown className={`w-4 h-4 shrink-0 text-[#38e8ff]/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    ) : (
                                      <span className="w-4 h-4 shrink-0 flex items-center justify-center" aria-hidden="true">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#38e8ff]/50" />
                                      </span>
                                    )}
                                    <span className="min-w-0">
                                      <span className="block text-[13px] text-slate-100 leading-tight break-words">{area.label}</span>
                                      <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                                        {area.items.length ? `${area.items.length} items${inner ? ` · ${inner} marked` : ''}` : area.hint || ' '}
                                      </span>
                                    </span>
                                  </button>
                                  <VerdictToggle label={area.label} value={verdicts[area.id]} onChange={(v) => setVerdict(area.id, v)} />
                                </div>
                                <AnimatePresence initial={false}>
                                  {isOpen && area.items.length > 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                      className="overflow-hidden"
                                    >
                                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 px-2.5 pb-2.5">
                                        {area.items.map((it) => (
                                          <li key={it.id} className="rt-item flex items-center gap-2 ps-2.5 pe-1.5 py-1.5">
                                            <span className="flex-1 min-w-0">
                                              <span className="block text-[12px] text-slate-200 leading-tight break-words">{it.label}</span>
                                              {it.hint && <span className="block text-[10px] font-mono text-slate-500">{it.hint}</span>}
                                            </span>
                                            <VerdictToggle small label={it.label} value={verdicts[it.id]} onChange={(v) => setVerdict(it.id, v)} />
                                          </li>
                                        ))}
                                      </ul>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </li>
                            );
                          })}
                        </ul>
                      </section>

                      {/* 3. What is lacking */}
                      <section className="rt-card mt-3">
                        <p className="rt-label">03 · What is lacking?</p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {RATING_ISSUES.map((i) => {
                            const on = issues.includes(i.id);
                            return (
                              <button
                                key={i.id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => toggleIssue(i.id)}
                                className={`rt-tag ${on ? 'is-on' : ''}`}
                              >
                                {on && <Check className="w-3 h-3" strokeWidth={3} />}
                                {i.label}
                              </button>
                            );
                          })}
                        </div>
                        <label className="block mt-3">
                          <span className="sr-only">Tell us what is missing or what we should fix</span>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 1500))}
                            rows={4}
                            placeholder="Tell us what is missing, what you did not like, or what we should fix..."
                            style={{ fontSize: '16px' }}
                            className="rt-input w-full resize-y min-h-[96px]"
                          />
                          <span className="block text-end text-[10px] font-mono text-slate-600 mt-1">{message.length}/1500</span>
                        </label>
                      </section>

                      {/* 4. Optional contact */}
                      <section className="rt-card mt-3">
                        <p className="rt-label">04 · Your details (optional)</p>
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 80))}
                            placeholder="Name"
                            autoComplete="name"
                            style={{ fontSize: '16px' }}
                            className="rt-input"
                          />
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value.slice(0, 120))}
                            placeholder="Email (if you want a reply)"
                            type="email"
                            autoComplete="email"
                            style={{ fontSize: '16px' }}
                            className="rt-input"
                          />
                        </div>
                        {/* Honeypot (hidden from people, bots fill it) */}
                        <input
                          value={honey}
                          onChange={(e) => setHoney(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          className="absolute -left-[9999px] w-px h-px opacity-0"
                          name="website"
                        />
                      </section>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="relative px-4 sm:px-6 py-3 border-t border-[#38e8ff]/15 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between shrink-0">
                  {done || alreadyRated ? (
                    <>
                      <span className="text-[11px] font-mono text-slate-500">This popup will not appear again.</span>
                      <button type="button" onClick={close} className="rt-btn rt-btn--solid">
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`text-[11px] font-mono ${status === 'error' ? 'text-[#ff8a8a]' : 'text-slate-500'}`} role="status">
                        {status === 'error' ? errorText : stars ? 'Ready to send' : 'Choose stars to send your rating'}
                      </span>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={close} className="rt-btn">
                          {auto ? 'Maybe later' : 'Cancel'}
                        </button>
                        <button type="button" onClick={submit} disabled={!stars || status === 'sending'} className="rt-btn rt-btn--solid">
                          {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {status === 'sending' ? 'Sending' : 'Submit rating'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RatingDialog;
