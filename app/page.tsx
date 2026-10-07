'use client';

import React, { useState } from 'react';
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
import { useLanguage } from '@/context/LanguageContext';

const JarvisOverlay = dynamic(
  () =>
    import('@/components/jarvis/JarvisOverlay')
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
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col selection:bg-[#38e8ff]/20 selection:text-[#38e8ff]">
      {/* Fixed Navigation with Language Selector */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Prominent JARVIS Center Orb Button */}
        <Hero onOpenAssistant={() => setAssistantModalOpen(true)} />

        {/* 2. Future Timeline (2030 -> 2035 -> 2050) */}
        <TimelineSection />

        {/* 3. Future Tech Catalogue (7 Categories, 42 Specifications) */}
        <TechCatalogueSection />

        {/* 4. Cities & Places (8 Postcards & Infrastructure Dossiers) */}
        <PlacesSection />

        {/* 5. My Projects (Live / In Progress / Future Ideas with Honest Coming Soon) */}
        <ProjectsSection />

        {/* 6. Advertise / List Your Project (Real Submission Form) */}
        <AdvertiseSection />

        {/* 7. About Aliya Khan (Honest Bio & Direct Communication Matrix) */}
        <AboutSection />

        {/* 8. Contact Section (Direct Channel & Real Transmission Form) */}
        <ContactSection />
      </main>

      {/* Floating Glowing Orb Button */}
      <FloatingVoiceTrigger onOpen={() => setAssistantModalOpen(true)} />

      {/* Quantum Holographic 3D Arc-Reactor Neural Core Overlay */}
      {assistantModalOpen && (
        <JarvisOverlay
          isOpen={assistantModalOpen}
          onClose={() => setAssistantModalOpen(false)}
          language={language}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
