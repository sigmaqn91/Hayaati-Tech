import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { getSiteUrl } from '@/lib/siteUrl';
import { GEO_BOOT_SCRIPT } from '@/lib/geoLanguage';

const appUrl = getSiteUrl();

// Normal responsive viewport: no forced zoom lock (pinch zoom stays available), inputs are 16px so no auto-zoom,
// and the visual viewport shrinks for the on-screen keyboard (handled in JarvisOverlay).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-visual',
};

export const metadata: Metadata = {
  title: 'Hayaati Web Technology — Future (2030–2050)',
  description:
    'A cinematic blueprint of human innovation, cognitive machines, orbital colonies, and sustainable habitats across 2030–2050. Built by Aliya Khan.',
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hayaati Web Technology — Future (2030–2050)',
    description:
      'A cinematic blueprint of human innovation, cognitive machines, orbital colonies, and sustainable habitats across 2030–2050. Built by Aliya Khan.',
    url: appUrl,
    siteName: 'Hayaati Web Technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hayaati Web Technology — Future (2030–2050)',
    description:
      'A cinematic blueprint of human innovation, cognitive machines, orbital colonies, and sustainable habitats across 2030–2050. Built by Aliya Khan.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Hayaati Web Technology',
  url: 'https://www.hayaatiweb.site',
  description:
    'A cinematic blueprint of human innovation, cognitive machines, orbital colonies, and sustainable habitats across 2030–2050.',
  creator: {
    '@type': 'Person',
    name: 'Aliya Khan',
    jobTitle: 'Founder & Lead Architect',
    email: 'Hayaati.Technology@gmail.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Hayaati Web Technology',
    url: 'https://www.hayaatiweb.site',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'Hayaati.Technology@gmail.com',
      contactType: 'customer service',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Picks the visitor's language before the page paints (saved choice > country > browser). */}
        <script dangerouslySetInnerHTML={{ __html: GEO_BOOT_SCRIPT }} />
      </head>
      <body className="bg-[#05070a] text-slate-100 min-h-screen relative antialiased selection:bg-[#38e8ff]/20 selection:text-[#38e8ff]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
