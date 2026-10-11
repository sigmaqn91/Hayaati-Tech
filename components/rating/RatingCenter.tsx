'use client';

/**
 * Rating popup controller.
 * - Opens by itself after every 1 minute on the page (counted only while the tab is open in front)
 *   until the visitor has rated. After a rating it never opens by itself again (saved in this browser).
 * - Never interrupts: it waits while the visitor is typing, while the menu / language / card popups are open
 *   or while the Jarvis chat is running, and opens right after.
 * - The Rate button in the header (RatingButton) opens it at any time.
 * The popup code itself is downloaded only when needed, so it adds nothing to the first page load.
 */

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { RATED_STORAGE_KEY } from '@/lib/ratingCatalog';
import type { RatingFill } from '@/lib/jarvisActions';

const loadDialog = () => import('./RatingDialog');
const RatingDialog = dynamic(() => loadDialog().then((m) => m.RatingDialog), { ssr: false, loading: () => null });

const INTERVAL_SECONDS = 60;

function isRated() {
  try {
    return Boolean(localStorage.getItem(RATED_STORAGE_KEY));
  } catch {
    return false;
  }
}

function pageIsBusy(): boolean {
  const ae = document.activeElement as HTMLElement | null;
  if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) return true;
  if (document.querySelector('[role="dialog"][aria-modal="true"]:not([data-rating-dialog])')) return true;
  if (document.querySelector('[data-jarvis-transcript]')) return true;
  if (document.body.style.overflow === 'hidden') return true;
  return false;
}

export function RatingCenter() {
  const [open, setOpen] = useState(false);
  const [auto, setAuto] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Jarvis filling the popup for the visitor (stars, good / needs work, tags, feedback text)
  const [fill, setFill] = useState<{ data: RatingFill; nonce: number } | null>(null);
  const openRef = useRef(false);
  const elapsedRef = useRef(0);
  openRef.current = open;

  // Manual open from the header button
  useEffect(() => {
    const onOpen = () => {
      setMounted(true);
      setAuto(false);
      setOpen(true);
    };
    const onFill = (e: Event) => {
      const data = (e as CustomEvent<RatingFill>).detail;
      if (!data) return;
      setMounted(true);
      setAuto(false);
      setOpen(true);
      setFill({ data, nonce: Date.now() });
    };
    const onClose = () => {
      if (!openRef.current) return;
      setOpen(false);
      elapsedRef.current = 0;
    };
    window.addEventListener('rating:open', onOpen);
    window.addEventListener('rating:fill', onFill);
    window.addEventListener('jarvis:close-popups', onClose);
    return () => {
      window.removeEventListener('rating:open', onOpen);
      window.removeEventListener('rating:fill', onFill);
      window.removeEventListener('jarvis:close-popups', onClose);
    };
  }, []);

  // Every-minute timer until rated
  useEffect(() => {
    if (isRated()) return;
    // Fetch the popup code quietly in the background well before the first minute is up.
    const prefetch = window.setTimeout(() => loadDialog().catch(() => {}), 20000);
    const id = window.setInterval(() => {
      if (openRef.current || document.hidden) return;
      if (isRated()) {
        window.clearInterval(id);
        return;
      }
      elapsedRef.current += 1;
      if (elapsedRef.current < INTERVAL_SECONDS || pageIsBusy()) return;
      setMounted(true);
      setAuto(true);
      setOpen(true);
    }, 1000);
    return () => {
      window.clearTimeout(prefetch);
      window.clearInterval(id);
    };
  }, []);

  const onClose = () => {
    setOpen(false);
    elapsedRef.current = 0; // next reminder one minute after closing
  };

  if (!mounted) return null;
  return <RatingDialog open={open} auto={auto} onClose={onClose} fill={fill} />;
}

export default RatingCenter;
