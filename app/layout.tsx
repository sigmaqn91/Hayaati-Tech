import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { getSiteUrl } from '@/lib/siteUrl';
import { GEO_BOOT_SCRIPT } from '@/lib/geoLanguage';
import { DEVICE_BOOT_SCRIPT } from '@/lib/deviceProfile';

const appUrl = getSiteUrl();

const REFRESH_TOP_SCRIPT = `(function(){try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){if('scrollRestoration' in history)history.scrollRestoration='manual';if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);window.scrollTo(0,0);addEventListener('load',function(){window.scrollTo(0,0)})}}catch(e){}})();`;

// Same stylesheet (and id) HeroAdvert adds itself; added here from <head> so it is not render-blocking but starts early.
const AD_FONTS_SCRIPT = `(function(){try{if(document.getElementById('ad-serif-font'))return;var l=document.createElement('link');l.id='ad-serif-font';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;500&family=Sora:wght@300;400;500&family=JetBrains+Mono:wght@500;700&family=Cormorant+Garamond:wght@400;500&display=swap';document.head.appendChild(l)}catch(e){}})();`;

// Desktop layout everywhere: phones in every browser open the 980px desktop layout (the same look as Chrome's
// "Desktop site" mode) instead of a squeezed mobile layout. Computers ignore this tag; tablets and screens that are
// 980px or wider are switched back to their own width by DEVICE_BOOT_SCRIPT before the first paint.
// No zoom lock (pinch zoom stays available), and the visual viewport shrinks for the on-screen keyboard (JarvisOverlay).
export const viewport: Viewport = {
  width: 980,
  // No initial-scale: the browser fits the 980px page to the screen width (an explicit 1 would open it zoomed in).
  initialScale: undefined,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-visual',
};

export const metadata: Metadata = {
  title: 'Hayaati Web Technology — Future (2030–2050)',
  description:
    'A cinematic blueprint of human innovation, cognitive machines, orbital colonies, and sustainable habitats across 2030–2050. Built by Aliya Khan.',
  applicationName: 'Hayaati Web Technology',
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
  alternateName: ['Hayaati Web', 'Hayaati'],
  url: `${appUrl}/`,
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
    url: `${appUrl}/`,
    logo: `${appUrl}/icon.png`,
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
        {/* Device brain: picks the layout width and the device's performance tier before anything is drawn. */}
        <script dangerouslySetInnerHTML={{ __html: DEVICE_BOOT_SCRIPT }} />
        {/* Refresh = a fresh start: the page opens at the top (hero) instead of jumping back to the old scroll
            position or to the last menu section (#about ...) kept in the address bar. */}
        <script dangerouslySetInnerHTML={{ __html: REFRESH_TOP_SCRIPT }} />
        {/* Hero advert fonts start downloading right away (before, they waited for the whole page to load). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: AD_FONTS_SCRIPT }} />
        {/* Picks the visitor's language before the page paints (saved choice > country > browser). */}
        <script dangerouslySetInnerHTML={{ __html: GEO_BOOT_SCRIPT }} />
        {/* Jarvis voice: open the connection to Google's Live server early, so activation connects faster. */}
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
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
