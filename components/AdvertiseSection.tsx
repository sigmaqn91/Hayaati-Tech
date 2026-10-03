'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Megaphone, Send, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AdvertiseSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectName: '',
    projectLink: '',
    category: 'Future AI & Robotics',
    budget: '',
    description: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'project_submission',
          ...formData,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: { success?: boolean; error?: string } = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(
          `Server returned an invalid response (${res.status}). Please verify server configuration.`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected transmission.');
      }

      setStatus('sent');
      setFormData({
        name: '',
        email: '',
        projectName: '',
        projectLink: '',
        category: 'Future AI & Robotics',
        budget: '',
        description: '',
      });
    } catch (err: unknown) {
      setStatus('failed');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Transmission failed. Please email Hayaati.Technology@gmail.com directly.'
      );
    }
  };

  return (
    <section
      id="advertise"
      aria-label="Advertise and List Project Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <Megaphone className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.advertise.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.advertise.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.advertise.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#0b0f17] border border-[#1e293b] space-y-4 hud-frame">
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Showcase Guidelines
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Hayaati Web Technology features frontier technologies, research initiatives, and ambitious hardware/software prototypes steering society towards 2030–2050.
            </p>

            <div className="p-4 bg-[#070a0f] border border-[#38e8ff]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#38e8ff] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#38e8ff]" />
                <span>Manual Verification</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {t.advertise.reviewNotice}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1e293b]">
              <div className="text-xs font-mono text-slate-400">
                <span className="text-[#38e8ff] font-semibold">{t.advertise.pricingNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Submission Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 bg-[#0b0f17] border border-[#1e293b] space-y-5 hud-frame"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  {t.advertise.form.name} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  {t.advertise.form.email} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  {t.advertise.form.projectName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Crystalline Solar Array"
                  className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  {t.advertise.form.projectLink}
                </label>
                <input
                  type="url"
                  value={formData.projectLink}
                  onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                  placeholder="https://yourproject.site"
                  className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  {t.advertise.form.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
                >
                  <option value="Future AI & Robotics">Future AI & Robotics</option>
                  <option value="Autonomous Vehicles & Transit">Autonomous Vehicles & Transit</option>
                  <option value="Bionics & Neural Devices">Bionics & Neural Devices</option>
                  <option value="Clean Energy & Fusion">Clean Energy & Fusion</option>
                  <option value="Biotech & Longevity">Biotech & Longevity</option>
                  <option value="Deep Space & Orbital">Deep Space & Orbital</option>
                  <option value="Smart Cities & Architecture">Smart Cities & Architecture</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  {t.advertise.form.budget}
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. Standard Tier / Research"
                  className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.advertise.form.description} *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail technical novelty, readiness level, and trajectory toward 2030-2050..."
                className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff]"
              />
            </div>

            {/* Submission Status Alerts */}
            {status === 'sent' && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.advertise.form.sentSuccess}</span>
              </div>
            )}

            {status === 'failed' && (
              <div className="p-4 bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage || t.advertise.form.sendError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 min-h-[44px] bg-[#38e8ff] hover:bg-[#38e8ff]/90 text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(56,232,255,0.25)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {status === 'sending' ? t.advertise.form.sending : t.advertise.form.submitBtn}
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
