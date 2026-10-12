'use client';

/** Waits for "guest:open" (3-line menu > Guest); the dialog code downloads only then. */

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GuestDialog = dynamic(() => import('./GuestDialog').then((m) => m.GuestDialog), { ssr: false, loading: () => null });

export function GuestHost() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('guest:open', onOpen);
    return () => window.removeEventListener('guest:open', onOpen);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  return open ? <GuestDialog onClose={close} /> : null;
}
