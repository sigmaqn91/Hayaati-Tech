import type { Metadata } from 'next';
import { AdminPageClient } from './AdminPageClient';

export const metadata: Metadata = {
  title: 'Admin Control · Hayaati Web Technology',
  robots: { index: false, follow: false },
};

/** Same Admin Control panel as in the 3-line menu, as its own page (owner code asked if not signed in). */
export default function AdminPage() {
  return <AdminPageClient />;
}
