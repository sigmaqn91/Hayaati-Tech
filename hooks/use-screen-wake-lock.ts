'use client';

import { useEffect } from 'react';

type WakeLockSentinelLike = { release: () => Promise<void> };

// Keeps the screen on while `active` is true (Screen Wake Lock API). Silently skipped where unsupported.
export function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined') return;
    const wakeLock = (navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
    }).wakeLock;
    if (!wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || sentinel || document.visibilityState !== 'visible') return;
      try {
        const lock = await wakeLock.request('screen');
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        (lock as unknown as EventTarget).addEventListener?.('release', () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // Denied or unavailable: ignore.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const lock = sentinel;
      sentinel = null;
      lock?.release().catch(() => {});
    };
  }, [active]);
}
