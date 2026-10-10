// Jarvis knowledge: what the website is, what is finished, what is still being built, and who the owner is.
// Two parts:
//   1. FIXED facts below (edit these lines whenever something changes).
//   2. A LIVE snapshot read from the open page at the moment Jarvis is activated (sections, hero text,
//      how many image frames show a real photo) - this updates itself automatically with the website.

import { projectsData } from '@/data/projects';

/** Owner details Jarvis may share with visitors. Only real facts: Jarvis must never invent anything. */
export const OWNER_FACTS: string[] = [
  'Name: Aliya Khan.',
  'Role: owner, founder and developer of Hayaati Web Technology. She designs and builds the website, its futuristic UI and the Jarvis assistant herself.',
  'Home: Kerala, India.',
  'Family: her father is a well-known, successful businessman.',
  // Fill in exactly as Aliya confirms (left empty on purpose so Jarvis never states a wrong degree/position):
  // 'Education: <her real degree / course>.',
  // 'Father: <his exact position, e.g. shareholder / Vice President of <company>>.',
  'Contact: Hayaati.Technology@gmail.com, website www.hayaatiweb.site.',
];

/** Current state of the website (update when work is finished). */
export const SITE_STATUS: string[] = [
  'The website is UNDER DEVELOPMENT. The banner at the top says "Under development - the full experience is being built, launching soon".',
  'It is already online (hosted on Vercel at www.hayaatiweb.site) on purpose, as an early public preview: visitors can already explore the design, try Jarvis, and Aliya keeps improving it live. The full official launch comes when all sections are complete.',
  'Finished and working now: the futuristic hero banner (3D orb, animated background, glass panel), Jarvis voice + chat assistant in 30 languages, the language selector (30 languages, opens in the visitor\'s country language), the 2030 / 2035 / 2050 timeline, the future tech catalogue, cities & places, advertise form, about and contact sections, and the animated advert under the hero.',
  'Still in progress: real photo-realistic pictures for the 2035 and 2050 timeline cards and most tech catalogue cards (those cards still show a "photorealistic frame pending" placeholder), the "My Projects" list (no projects published yet), more animations, and final polishing.',
  'Real photos on the site right now: the hero background, the 2030 era banner, the 4 cards of the 2030 era milestones (Autonomous Urban Sky Taxi, Personal AI Companion Node, Next-Gen Solid-State Grid Storage, Adaptive Smart Glass Architecture; the same pictures also show on those cards in the future tech catalogue), all 8 Cities & Places postcards, and Aliya\'s own founder photo in the About section. The other picture frames are placeholders until their photos are added.',
  '2030 era milestone cards (in the timeline): 4 cards in a 2 by 2 grid with real photos (sky taxi, AI companion, solid-state grid storage, smart glass building). The text area of each card has a dark transparent glass look with a softly moving cyan high-tech animation inside it, and a light runs along each card border.',
  'Cities & Places section: 8 postcards with real pictures, an animated light running along each card border, and a slowly moving grid and soft light behind the section.',
  'About section (Aliya Khan, founder): her founder photo on the left (a calm night portrait at a café window in the rain) and her main details beside it, with a slim strip below for her email and website. There is no video in this section. The section has a dark glass look over a softly moving futuristic background, with light running along the card borders. Her photo is protected from easy saving.',
];

const clip = (s: string | null | undefined, n: number) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/** Reads the open page right now (cheap, runs once per activation). */
export function collectLiveSiteSnapshot(heroTexts?: { headline?: string; subtitle?: string; advert?: string }): string {
  if (typeof document === 'undefined') return '';
  const lines: string[] = [];
  try {
    if (heroTexts?.headline) lines.push(`Hero headline (current language): "${clip(heroTexts.headline, 140)}"`);
    if (heroTexts?.subtitle) lines.push(`Hero subtitle: "${clip(heroTexts.subtitle, 220)}"`);
    if (heroTexts?.advert) lines.push(`Advert under the hero: "${clip(heroTexts.advert, 140)}"`);

    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
      .map((sec) => {
        const h = sec.querySelector('h2, h3');
        const title = clip(h?.textContent, 70);
        return title ? `${sec.id} ("${title}")` : sec.id;
      })
      .filter(Boolean);
    if (sections.length) lines.push(`Sections on the page, top to bottom: ${sections.join(', ')}.`);

    const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-image-slot]'));
    if (slots.length) {
      const real = slots.filter((el) => el.dataset.imageSlot === 'real').length;
      lines.push(
        `Picture frames currently on the page: ${slots.length} (${real} showing a loaded real photo right now, the rest show "frame pending" placeholders or have not loaded yet).`
      );
    }
    const live = projectsData.filter((p) => p.status === 'live').length;
    const wip = projectsData.filter((p) => p.status === 'in-progress').length;
    lines.push(
      projectsData.length
        ? `Projects listed: ${projectsData.length} (${live} live, ${wip} in progress, ${projectsData.length - live - wip} future ideas).`
        : 'Projects section: no projects published yet (coming soon).'
    );
  } catch {
    // never block Jarvis because of the snapshot
  }
  return lines.join('\n');
}

/** Full knowledge block for the Jarvis system instruction. */
export function buildJarvisKnowledge(liveSnapshot: string): string {
  return [
    'WEBSITE & OWNER KNOWLEDGE (true facts - use them to answer; for anything not listed, say honestly you do not have that detail yet, never guess):',
    'Website: Hayaati Web Technology (www.hayaatiweb.site) - a cinematic, futuristic website showing human innovation, cognitive machines, orbital colonies and sustainable habitats from 2030 to 2050, plus Aliya Khan\'s web design / AI assistant services.',
    'STATUS:',
    ...SITE_STATUS.map((l) => `- ${l}`),
    'OWNER (speak about her with warmth and respect):',
    ...OWNER_FACTS.map((l) => `- ${l}`),
    liveSnapshot ? `LIVE PAGE SNAPSHOT (read from the website right now):\n${liveSnapshot}` : '',
    'If someone asks why the site is live while it says "under development", explain it is an intentional early preview that is being finished step by step, and the full launch is coming soon.',
  ]
    .filter(Boolean)
    .join('\n');
}
