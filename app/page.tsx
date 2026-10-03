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
import { AssistantPanel } from '@/components/AssistantPanel';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col selection:bg-[#38e8ff]/20 selection:text-[#38e8ff]">
      {/* Fixed Solid Navigation with Language Selector & Assistant Trigger */}
      <Navbar onOpenAssistant={() => setAssistantModalOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

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

      {/* Built-in Gemini Cognitive Assistant with Real-Time Live Voice & Chat */}
      <AssistantPanel
        isOpen={assistantModalOpen}
        onClose={() => setAssistantModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
