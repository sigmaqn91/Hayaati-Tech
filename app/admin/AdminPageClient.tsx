'use client';

import { useCallback } from 'react';
import { AdminControl } from '@/components/admin/AdminControl';

export function AdminPageClient() {
  const close = useCallback(() => {
    window.location.href = '/';
  }, []);
  return <AdminControl onClose={close} />;
}
