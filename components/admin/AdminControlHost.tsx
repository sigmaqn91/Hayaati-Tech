'use client';

/** Waits for "admin:open" (menu / Jarvis owner button); the panel code downloads only then. */

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { AdminTab } from './AdminControl';

const AdminControl = dynamic(() => import('./AdminControl').then((m) => m.AdminControl), { ssr: false, loading: () => null });

export function AdminControlHost() {
  const [open, setOpen] = useState<{ tab?: AdminTab } | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const tab = (e as CustomEvent<AdminTab | undefined>).detail;
      setOpen({ tab: tab || undefined });
    };
    window.addEventListener('admin:open', onOpen);
    return () => window.removeEventListener('admin:open', onOpen);
  }, []);

  const close = useCallback(() => setOpen(null), []);
  if (!open) return null;
  return <AdminControl initialTab={open.tab} onClose={close} />;
}
