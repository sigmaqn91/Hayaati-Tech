import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, Crown, Gift } from 'lucide-react';
import { RATE_CONFIG } from '@/lib/rateLimit';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Hayaati Web Technology',
  description: 'Terms for using the Hayaati Web Technology website, the Jarvis assistant and its guided tours.',
  alternates: { canonical: '/terms' },
};

const EFFECTIVE = '12 October 2026';
const CONTACT = 'Hayaati.Technology@gmail.com';

const minutes = (s: number) => Math.round(s / 60);

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 scroll-mt-24" id={`s${n}`}>
      <h2 className="flex items-baseline gap-3 font-mono text-[13px] tracking-[0.18em] uppercase text-[#38e8ff]">
        <span className="text-[#38e8ff]/50 tabular-nums">{String(n).padStart(2, '0')}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

/** Terms & Conditions (3-line menu). Limits are read from the same settings the server enforces. */
export default function TermsPage() {
  const voiceMin = minutes(RATE_CONFIG.voiceSessionMaxSeconds);
  const quickMin = Math.max(1, minutes(RATE_CONFIG.quickTourMaxSeconds) - 1);
  const plans = [
    {
      icon: Sparkles,
      name: 'Free',
      tone: 'border-[#38e8ff]/25',
      items: [
        'The whole website: every era, all 42 future technologies, places, projects and the founder story',
        `Jarvis voice: ${RATE_CONFIG.voiceSessionsPerHour} conversation per hour, up to ${voiceMin} minutes each`,
        `Jarvis chat: up to ${RATE_CONFIG.chatLimitPerVisitor} messages every 10 minutes, ${RATE_CONFIG.maxMessageChars} characters per message`,
        `Quick Tour: about ${quickMin} minutes with Jarvis, up to ${RATE_CONFIG.quickToursPerHour} per hour`,
        'Website rating, contact and advertising forms',
      ],
    },
    {
      icon: Crown,
      name: 'Premium Tour',
      tone: 'border-[#a78bfa]/40',
      items: [
        `The full guided tour with Jarvis, about ${voiceMin} minutes`,
        'Every era and every technology card opened and explained for you',
        'Hands-free: Jarvis drives the page from start to finish',
        'Unlocked with a one-time coupon (first time free) or a guest code',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-100 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-slate-400 hover:text-[#38e8ff] transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to website
        </Link>

        <header className="mt-8 pb-6 border-b border-[#38e8ff]/15">
          <p className="rt-label flex items-center gap-2">
            <FileText className="w-4 h-4" aria-hidden="true" /> Hayaati Web Technology
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">Terms &amp; Conditions</h1>
          <p className="mt-2 font-mono text-xs text-slate-500">Effective {EFFECTIVE}</p>
        </header>

        <Section n={1} title="About these terms">
          <p>
            These terms apply to everyone who visits or uses the Hayaati Web Technology website (the &quot;website&quot;), including the Jarvis
            assistant, the guided tours, coupons, guest codes and the forms on the website. By using the website you agree to these terms. If you
            do not agree, please do not use the website.
          </p>
        </Section>

        <Section n={2} title="The website">
          <p>
            The website is a creative preview of future technology from 2030 to 2050. Eras, technologies, places, vehicles, devices and images
            shown here are concepts and illustrations. They are not products for sale, and nothing on the website is a promise that any of them
            will exist.
          </p>
          <p>The website is still being built. Sections, features and limits may change, be added or be removed at any time.</p>
        </Section>

        <Section n={3} title="Jarvis, the AI assistant">
          <p>
            Jarvis is an artificial intelligence assistant. It answers by voice or chat and can move around the website for you. Its answers are
            generated automatically and may sometimes be incomplete or wrong. Jarvis does not give professional, medical, legal or financial advice;
            please do not rely on it for decisions of that kind.
          </p>
          <p>
            Voice conversations use your microphone only after your browser asks and you allow it. To answer you, what you say or type is processed
            by our AI service provider. Please do not share passwords, payment details or other sensitive personal information with Jarvis.
          </p>
          <p>Some owner-only features of Jarvis are protected and can never be opened by voice.</p>
        </Section>

        <Section n={4} title="Free and Premium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
            {plans.map((p) => (
              <div key={p.name} className={`rt-card !p-4 border ${p.tone}`}>
                <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.16em] uppercase text-white">
                  <p.icon className="w-4 h-4 text-[#38e8ff]" aria-hidden="true" /> {p.name}
                </p>
                <ul className="mt-3 space-y-2 text-[14px] text-slate-300">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#38e8ff]" aria-hidden="true" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p>
            Usage limits apply to each visitor and are counted per browser and connection. A voice conversation ends automatically when its time
            is up. When a limit is reached, Jarvis lets you know and you can continue later.
          </p>
          <p>
            Jarvis also shares one daily capacity across all visitors. On a very busy day voice conversations and tours may pause until the next
            day, even if you have not reached your own limit.
          </p>
        </Section>

        <Section n={5} title="Premium coupons">
          <ul className="list-disc ps-5 space-y-2">
            <li>Each visitor can request one free coupon per year (&quot;first time free&quot;).</li>
            <li>A coupon unlocks one Premium Tour. It is used up the moment the tour starts and cannot be used again.</li>
            <li>A coupon belongs to the browser that requested it and cannot be transferred, shared, sold or exchanged for money.</li>
            <li>An unused coupon expires 60 days after it was issued.</li>
            <li>If a tour cannot connect at all right after it starts, the coupon is given back automatically.</li>
            <li>A tour that has started and is stopped early by the visitor, or ends because its time is up, uses the coupon.</li>
          </ul>
        </Section>

        <Section n={6} title="Guest access">
          <p className="flex gap-2">
            <Gift className="w-4 h-4 mt-1 shrink-0 text-[#a5b4fc]" aria-hidden="true" />
            <span>
              Guest codes are personal invitations from Hayaati Web Technology. A guest code works once, on one browser. Today it unlocks one
              Premium Tour without a coupon; other guest benefits may be added later. Guest codes may be switched off at any time and have no
              cash value.
            </span>
          </p>
        </Section>

        <Section n={7} title="Acceptable use">
          <p>When using the website, please do not:</p>
          <ul className="list-disc ps-5 space-y-2">
            <li>try to get around usage limits, coupons, guest codes or owner verification;</li>
            <li>use bots or automated tools to send messages, ratings, forms or voice sessions;</li>
            <li>try to break, overload or gain unauthorised access to the website or its services;</li>
            <li>use Jarvis or the forms to send abusive, unlawful, harmful or misleading content;</li>
            <li>copy or reuse the website&apos;s design, images, text or code without permission.</li>
          </ul>
          <p>Access may be limited or blocked for anyone who breaks these rules.</p>
        </Section>

        <Section n={8} title="Forms and ratings">
          <p>
            When you send a rating, the contact form or the advertising form, the information you enter (for example your message, and your name
            and email if you give them) is used to read your feedback and to reply to you. Ratings and feedback may be used to improve the website.
          </p>
        </Section>

        <Section n={9} title="Content and ownership">
          <p>
            The website, its design, images, animations, text, the Jarvis experience and the Hayaati name belong to Hayaati Web Technology and are
            protected by copyright and other laws. You may view the website for personal, non-commercial use. Any other use needs written permission.
          </p>
        </Section>

        <Section n={10} title="Availability and responsibility">
          <p>
            The website and Jarvis are provided &quot;as is&quot; and &quot;as available&quot;. They may sometimes be slow, unavailable or behave
            differently on some devices and browsers. For the best experience, keep your browser and phone updated.
          </p>
          <p>
            To the extent allowed by law, Hayaati Web Technology is not responsible for any loss arising from use of the website, Jarvis or
            information shown on it.
          </p>
        </Section>

        <Section n={11} title="Changes to these terms">
          <p>
            These terms may be updated as the website grows. The date at the top shows the latest version. Using the website after a change means
            you accept the updated terms.
          </p>
        </Section>

        <Section n={12} title="Contact">
          <p>
            Questions about these terms:{' '}
            <a href={`mailto:${CONTACT}`} className="text-[#38e8ff] hover:underline">
              {CONTACT}
            </a>
          </p>
        </Section>

        <footer className="mt-14 pt-5 border-t border-[#38e8ff]/10 text-[11px] leading-relaxed text-slate-500">
          <p>
            Site data. To keep the website fast and working well on every device, anonymous technical information about visits is recorded, such
            as device type, browser, screen size, language, approximate country and the sections viewed. It does not include your name, IP address
            or device identifiers. Your browser also keeps a few small settings for this website (such as your language and an anonymous visitor
            id). To ask about this, write to {CONTACT}.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} Hayaati Web Technology</p>
        </footer>
      </div>
    </main>
  );
}
