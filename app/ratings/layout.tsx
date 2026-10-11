import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ratings · Hayaati Web Technology',
  robots: { index: false, follow: false },
};

export default function RatingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
