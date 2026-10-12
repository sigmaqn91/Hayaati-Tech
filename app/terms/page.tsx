import type { Metadata } from 'next';
import { RATE_CONFIG } from '@/lib/rateLimit';
import { TermsContent, type TermsValues } from '@/components/terms/TermsContent';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Hayaati Web Technology',
  description: 'Terms for using the Hayaati Web Technology website, the Jarvis assistant and its guided tours.',
  alternates: { canonical: '/terms' },
};

const minutes = (s: number) => Math.round(s / 60);

/** Terms & Conditions (3-line menu), in the site language. Limits are read from the same settings the server enforces. */
export default function TermsPage() {
  const values: TermsValues = {
    email: 'Hayaati.Technology@gmail.com',
    voicePerHour: String(RATE_CONFIG.voiceSessionsPerHour),
    voiceMin: String(minutes(RATE_CONFIG.voiceSessionMaxSeconds)),
    chat: String(RATE_CONFIG.chatLimitPerVisitor),
    chars: String(RATE_CONFIG.maxMessageChars),
    quickMin: String(Math.max(1, minutes(RATE_CONFIG.quickTourMaxSeconds) - 1)),
    quickPerHour: String(RATE_CONFIG.quickToursPerHour),
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-100 px-4 sm:px-6 py-10">
      <TermsContent values={values} />
    </main>
  );
}
