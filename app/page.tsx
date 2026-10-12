'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { TimelineSection } from '@/components/TimelineSection';
import { TechCatalogueSection } from '@/components/TechCatalogueSection';
import { PlacesSection } from '@/components/PlacesSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { AdvertiseSection } from '@/components/AdvertiseSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import dynamic from 'next/dynamic';
import { FloatingVoiceTrigger } from '@/components/FloatingVoiceTrigger';
import { Footer } from '@/components/Footer';
import { AnimationGovernor } from '@/components/AnimationGovernor';
import { DeviceBrain } from '@/components/DeviceBrain';
import { RatingCenter } from '@/components/rating/RatingCenter';
import { useLanguage } from '@/context/LanguageContext';
import { AdminControlHost } from '@/components/admin/AdminControlHost';
import { GuestHost } from '@/components/guest/GuestHost';

// Anonymous visitor analytics + privacy / update notices: downloaded separately, runs after the page is idle.
const VisitorTracker = dynamic(() => import('@/components/visitor/VisitorTracker').then((m) => m.VisitorTracker), {
  ssr: false,
  loading: () => null,
});

// Start downloading Jarvis (orb + chat) as soon as the page script runs, instead of waiting until the
// whole page has finished rendering: the orb shows up several seconds sooner on phones.
const loadJarvis = () => import('@/components/jarvis/JarvisOverlay');
if (typeof window !== 'undefined') loadJarvis().catch(() => {});

const JarvisOverlay = dynamic(
  () =>
    loadJarvis()
      .then((mod) => mod.JarvisOverlay)
      .catch(() => {
        // Retry chunk import in case of transient dev reload or chunk hash mismatch
        return import('@/components/jarvis/JarvisOverlay').then((mod) => mod.JarvisOverlay);
      }),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function HomePage() {
  const { language } = useLanguage();

  const toggleJarvis = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jarvis:toggle'));
    }
  };

  // Every section below the hero is its own <Suspense> block: the page HTML is exactly the same, but the browser
  // brings the hero (orb, advert, cosmos) to life first and wakes the rest of the page up in small steps after it,
  // instead of freezing on the whole long page at once.
  return (
    <div
      className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col selection:bg-[#38e8ff]/20 selection:text-[#38e8ff]"
    >
      {/* Pauses looping animations of off-screen sections/cards (performance only) */}
      <AnimationGovernor />

      {/* Learns how strong this device/browser is and lightens the heaviest effects only where needed */}
      <DeviceBrain />

      {/* Fixed Navigation with Language Selector */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Activate Jarvis control */}
        <Hero
          onOpenAssistant={toggleJarvis}
          assistantOverlay={
            <JarvisOverlay
              isOpen
              embedded
              onClose={() => undefined}
              language={language}
            />
          }
        />

        {/* 2. Future Timeline (2030 -> 2035 -> 2050) */}
        <Suspense fallback={null}>
          <TimelineSection />
        </Suspense>

        {/* 3. Future Tech Catalogue (7 Categories, 42 Specifications) */}
        <Suspense fallback={null}>
          <TechCatalogueSection />
        </Suspense>

        {/* 4. Cities & Places (8 Postcards & Infrastructure Dossiers) */}
        <Suspense fallback={null}>
          <PlacesSection />
        </Suspense>

        {/* 5. My Projects (Live / In Progress / Future Ideas with Honest Coming Soon) */}
        <Suspense fallback={null}>
          <ProjectsSection />
        </Suspense>

        {/* 6. Advertise / List Your Project (Real Submission Form) */}
        <Suspense fallback={null}>
          <AdvertiseSection />
        </Suspense>

        {/* 7. About Aliya Khan (Honest Bio & Direct Communication Matrix) */}
        <Suspense fallback={null}>
          <AboutSection />
        </Suspense>

        {/* 8. Contact Section (Direct Channel & Real Transmission Form) */}
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>

      {/* Floating Glowing Orb Button: toggles the same embedded Jarvis instance. */}
      <FloatingVoiceTrigger onOpen={toggleJarvis} />

      {/* Website rating popup (every minute until the visitor rates; header Rate button opens it any time) */}
      <RatingCenter />

      {/* Owner only: Admin Control panel (ratings, visitors ...), opened from the menu after owner verification */}
      <AdminControlHost />

      {/* Guest access (menu > Guest): one-time code from Aliya Khan */}
      <GuestHost />

      <VisitorTracker />

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
