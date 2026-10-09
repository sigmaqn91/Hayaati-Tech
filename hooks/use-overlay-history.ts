'use client';

/**
 * useOverlayHistory — one tiny hook that makes the phone/browser BACK button
 * close the currently open overlay (menu, popup, modal, drawer) instead of
 * leaving the website.
 *
 * How it works
 *  - When `isOpen` becomes true we push ONE history entry (same URL, so hash
 *    links / refresh keep working) carrying a marker in history.state.
 *  - Browser Back pops that entry -> `popstate` -> we call `onClose()` of the
 *    overlay(s) that sat above the entry we landed on (stacked overlays close
 *    one per Back press, topmost first).
 *  - When the overlay is closed from the UI (X, backdrop, Escape, choosing an
 *    option ...) the hook's cleanup removes our entry with history.back(), but
 *    only if our entry is still on top, so history never fills with junk.
 *  - Programmatic back() calls are counted and their popstate is ignored.
 *  - Entries keep Next.js' own history.state keys (we spread the old state).
 *
 * Usage:  useOverlayHistory(isOpen, () => setIsOpen(false));
 * The close handler may change every render; it is read through a ref.
 */

import { useEffect, useRef } from 'react';

const KEY = '__ovl';

type Entry = { id: string; close: () => void };

const stack: Entry[] = [];
let silentBacks = 0; // our own history.back() calls whose popstate must be ignored
const idleQueue: Array<() => void> = [];
let listening = false;
let counter = 0;

function markerOf(state: unknown): string | undefined {
  if (state && typeof state === 'object' && KEY in (state as Record<string, unknown>)) {
    const v = (state as Record<string, unknown>)[KEY];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

function flushIdle() {
  while (silentBacks === 0 && idleQueue.length > 0) {
    const fn = idleQueue.shift();
    if (fn) fn();
  }
}

/** Run `fn` once every history.back() we started has finished (or right away if none pending). */
export function runWhenHistoryIdle(fn: () => void) {
  if (silentBacks === 0 && idleQueue.length === 0) fn();
  else idleQueue.push(fn);
}

function closeAbove(index: number) {
  while (stack.length > index + 1) {
    const entry = stack.pop();
    if (entry) entry.close();
  }
}

function onPopState() {
  if (silentBacks > 0) {
    silentBacks -= 1;
    flushIdle();
    return;
  }
  const current = markerOf(window.history.state);
  if (current === undefined) {
    // We are back on a normal entry: every open overlay is closed.
    closeAbove(-1);
    return;
  }
  const index = stack.findIndex((e) => e.id === current);
  if (index >= 0) {
    closeAbove(index);
  } else {
    // Landed on a stale overlay entry (browser Forward, or left over after a refresh):
    // never reopen anything, just step back over it.
    window.history.back();
  }
}

function ensureListener() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('popstate', onPopState);
}

function pushEntry(entry: Entry) {
  ensureListener();
  stack.push(entry);
  const prev = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
  window.history.pushState({ ...prev, [KEY]: entry.id }, '', window.location.href);
}

function removeEntry(entry: Entry) {
  const index = stack.indexOf(entry);
  if (index < 0) return; // already popped by the browser Back button
  const wasTop = index === stack.length - 1;
  stack.splice(index, 1);
  if (wasTop && markerOf(window.history.state) === entry.id) {
    silentBacks += 1;
    window.history.back();
  }
}

export function useOverlayHistory(isOpen: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    const entry: Entry = {
      id: `ov${++counter}-${Date.now().toString(36)}`,
      close: () => closeRef.current(),
    };
    let cancelled = false;
    runWhenHistoryIdle(() => {
      if (!cancelled) pushEntry(entry);
    });
    return () => {
      cancelled = true;
      removeEntry(entry);
    };
  }, [isOpen]);
}
