'use client';

/** Admin Control > Guests: make a one-time guest code for a friend, send it, see which codes were used. */

import React, { useState } from 'react';
import { Gift, Copy, Check, Send, Ban, Loader2 } from 'lucide-react';

export interface GuestRow {
  code: string;
  name: string;
  perks: string[];
  createdAt: string;
  usedAt?: string;
  usedOn?: string;
  revokedAt?: string;
}

const PERK_LABEL: Record<string, string> = { premium_tour: 'Premium Tour' };

function shareText(g: GuestRow) {
  const site = typeof window !== 'undefined' ? window.location.origin : 'https://www.hayaatiweb.site';
  return `Hi ${g.name}! You are my guest on Hayaati Web Technology. Open ${site}, tap the 3-line menu > Guest, and enter this code: ${g.code} (works once).`;
}

export function GuestsPanel({ guests, onChanged }: { guests: GuestRow[]; onChanged: () => void }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fresh, setFresh] = useState<GuestRow | null>(null);
  const [copied, setCopied] = useState('');

  const post = async (body: unknown) => {
    const res = await fetch('/api/admin/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { ok, data } = await post({ action: 'create', name: name.trim() });
      if (ok && data.guest) {
        setFresh(data.guest);
        setName('');
        onChanged();
      } else setError(data.code === 'unauthorized' ? 'Owner session ended. Close and open Admin Control again.' : 'Could not make a code right now.');
    } catch {
      setError('No connection. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (code: string) => {
    if (!window.confirm(`Switch off guest code ${code}?`)) return;
    await post({ action: 'revoke', code }).catch(() => null);
    if (fresh?.code === code) setFresh(null);
    onChanged();
  };

  const copy = async (g: GuestRow) => {
    try {
      await navigator.clipboard.writeText(shareText(g));
      setCopied(g.code);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {}
  };

  const unused = guests.filter((g) => !g.usedAt && !g.revokedAt).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <form onSubmit={create} className="rt-card flex flex-col gap-3">
          <p className="rt-label flex items-center gap-2">
            <Gift className="w-3.5 h-3.5" aria-hidden="true" /> New guest code
          </p>
          <p className="text-sm text-slate-400">
            Each code works one time. Your guest opens the 3-line menu, taps <span className="text-slate-200">Guest</span> and enters it. Today a guest gets the Premium Tour free, without a coupon.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Guest name (optional), e.g. Besti"
            maxLength={40}
            className="rt-input"
            style={{ fontSize: '16px' }}
            aria-label="Guest name"
          />
          <button type="submit" disabled={busy} className="rt-btn rt-btn--solid">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />} Create guest code
          </button>
          {error && <p className="text-sm text-[#ff8a8a]">{error}</p>}
        </form>

        <div className="rt-card flex flex-col">
          <p className="rt-label">Ready to send</p>
          {fresh ? (
            <>
              <p className="mt-3 text-sm text-slate-400">Code for {fresh.name}</p>
              <p className="mt-1 font-mono text-3xl tracking-[0.18em] text-white select-all">{fresh.code}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => copy(fresh)} className="rt-btn">
                  {copied === fresh.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === fresh.code ? 'Copied' : 'Copy message'}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText(fresh))}`} target="_blank" rel="noopener noreferrer" className="rt-btn">
                  <Send className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Create a code and it appears here with a ready message to send.</p>
          )}
        </div>
      </div>

      <div className="rt-card mt-3">
        <p className="rt-label">
          All guest codes ({guests.length}) · {unused} not used yet
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {guests.length === 0 && <li className="text-sm text-slate-500">No guest codes yet.</li>}
          {guests.map((g) => {
            const state = g.revokedAt ? 'Switched off' : g.usedAt ? 'Used' : 'Not used yet';
            return (
              <li key={g.code} className="rt-area p-3 text-[13px] flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-mono tracking-wider text-white">{g.code}</span>
                <span className="text-slate-200">{g.name}</span>
                <span className={`adm-badge ${g.revokedAt ? 'adm-badge--soft' : g.usedAt ? 'adm-badge--gold' : ''}`}>{state}</span>
                {g.perks.map((p) => (
                  <span key={p} className="adm-badge adm-badge--soft">{PERK_LABEL[p] || p}</span>
                ))}
                <span className="font-mono text-[11px] text-slate-500">
                  made {new Date(g.createdAt).toLocaleDateString()}
                  {g.usedAt ? ` · used ${new Date(g.usedAt).toLocaleString()}${g.usedOn ? ` on ${g.usedOn}` : ''}` : ''}
                </span>
                <span className="ms-auto flex gap-1.5">
                  {!g.usedAt && !g.revokedAt && (
                    <button type="button" onClick={() => copy(g)} className="rt-btn !min-h-[34px] !px-2.5" aria-label={`Copy message for ${g.code}`}>
                      {copied === g.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {!g.revokedAt && (
                    <button type="button" onClick={() => revoke(g.code)} className="rt-btn !min-h-[34px] !px-2.5" aria-label={`Switch off ${g.code}`}>
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
