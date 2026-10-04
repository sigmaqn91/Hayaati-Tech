'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Megaphone, X, Send, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdvertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvertiseModal({ isOpen, onClose }: AdvertiseModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectTitle: '',
    category: 'ai',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc close & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      let data: { success?: boolean; error?: string; code?: string } = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(
          `Server returned an invalid response (${res.status}). Please verify server configuration.`
        );
      }

      if (!res.ok || !data.success) {
        if (data.code === 'rate_limited') {
          throw new Error(data.error || 'Rate limit reached. Please wait a few minutes before submitting again.');
        }
        throw new Error(data.error || t.advertise.form.sendError);
      }

      setStatus('sent');
      setFormData({
        name: '',
        email: '',
        projectTitle: '',
        category: 'ai',
        description: '',
      });
    } catch (err: unknown) {
      setStatus('failed');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t.advertise.form.sendError
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={t.advertise.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl bg-[#0b0f17] border border-[#1e293b] p-6 sm:p-8 hud-frame max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#38e8ff]" />
            <h2 className="text-xl font-bold font-mono uppercase text-white tracking-wider">
              {t.advertise.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#070a0f] border border-[#38e8ff]/30 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#38e8ff] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#38e8ff]" />
            <span>{t.common.operational}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.advertise.reviewNotice}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.advertise.form.name} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.advertise.form.name}
                style={{ fontSize: '16px' }}
                className="w-full px-3.5 py-2.5 bg-[#05070a] border border-[#1e293b] text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.advertise.form.email} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.advertise.form.email}
                style={{ fontSize: '16px' }}
                className="w-full px-3.5 py-2.5 bg-[#05070a] border border-[#1e293b] text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.advertise.form.projectName} *
              </label>
              <input
                type="text"
                required
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                placeholder={t.advertise.form.projectName}
                style={{ fontSize: '16px' }}
                className="w-full px-3.5 py-2.5 bg-[#05070a] border border-[#1e293b] text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 uppercase">
                {t.advertise.form.category}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ fontSize: '16px' }}
                className="w-full px-3.5 py-2.5 bg-[#05070a] border border-[#1e293b] text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#38e8ff] min-h-[44px]"
              >
                <option value="ai">{t.tech.categories.ai}</option>
                <option value="vehicles">{t.tech.categories.vehicles}</option>
                <option value="devices">{t.tech.categories.devices}</option>
                <option value="energy">{t.tech.categories.energy}</option>
                <option value="health">{t.tech.categories.health}</option>
                <option value="space">{t.tech.categories.space}</option>
                <option value="homeWork">{t.tech.categories.homeWork}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-400 uppercase">
              {t.advertise.form.description} *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.advertise.form.description}
              style={{ fontSize: '16px' }}
              className="w-full px-3.5 py-2.5 bg-[#05070a] border border-[#1e293b] text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#38e8ff]"
            />
          </div>

          {/* Submission Feedback Alerts */}
          {status === 'sent' && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.advertise.form.sentSuccess}</span>
            </div>
          )}

          {status === 'failed' && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage || t.advertise.form.sendError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t.common.close}
            </button>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-6 py-2.5 bg-[#38e8ff] hover:bg-[#38e8ff]/90 text-[#05070a] font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(56,232,255,0.25)] min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{status === 'sending' ? t.advertise.form.sending : t.advertise.form.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
