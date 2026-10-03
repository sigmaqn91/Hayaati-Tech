'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Send, CheckCircle2, AlertCircle, Globe } from 'lucide-react';

export function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const res = await fetch('/app/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transmission rejected by delivery server.');
      }

      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
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
      id="contact"
      aria-label="Contact Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <Mail className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.contact.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.contact.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Information Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#0b0f17] border border-[#1e293b] space-y-4 hud-frame">
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              Communication Relay
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Transmit technical inquiries, strategic collaborations, advisory requests, or queries regarding future timeline blueprints directly to our architecture desk.
            </p>

            <div className="p-4 bg-[#070a0f] border border-[#1e293b] space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.contact.emailLabel}
              </span>
              <a
                href={`mailto:${t.contact.directEmail}`}
                className="text-sm font-mono text-[#38e8ff] hover:underline flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#38e8ff]" />
                <span>{t.contact.directEmail}</span>
              </a>
            </div>

            <div className="p-4 bg-[#070a0f] border border-[#1e293b] space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                Production Web Infrastructure
              </span>
              <a
                href="https://www.hayaatiweb.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-slate-300 hover:text-[#38e8ff] flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-[#38e8ff]" />
                <span>www.hayaatiweb.site</span>
              </a>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-500">
              RESPONSE HORIZON: Typically reviewed within 24 to 48 standard Earth operational hours.
            </div>
          </div>
        </div>

        {/* Right Transmission Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 bg-[#0b0f17] border border-[#1e293b] space-y-5 hud-frame"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.contact.form.name} *
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
                {t.contact.form.email} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@domain.com"
                className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.contact.form.message} *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Inquire regarding technical specifications, collaboration, or advisory..."
                className="w-full px-4 py-2.5 bg-[#05070a] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#38e8ff]"
              />
            </div>

            {/* Status alerts */}
            {status === 'sent' && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.contact.form.sentSuccess}</span>
              </div>
            )}

            {status === 'failed' && (
              <div className="p-4 bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage || t.contact.form.sendError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 min-h-[44px] bg-[#38e8ff] hover:bg-[#38e8ff]/90 text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(56,232,255,0.25)]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {status === 'sending' ? t.contact.form.sending : t.contact.form.submitBtn}
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
