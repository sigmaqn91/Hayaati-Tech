// The website tour Jarvis gives. The order is fixed here, not left to Jarvis's guesses: every step
// switches the right era or catalogue tab, glides calmly to it, waits until the page has arrived, checks
// that the right thing is on screen and only then tells Jarvis what the visitor is looking at.

import {
  NAV_OFFSET,
  activeTabs,
  docTop,
  glideTo,
  glideToElement,
  nextFrames,
  sectionName,
  visibleTexts,
} from '@/lib/jarvisScreen';
import { JARVIS_TECH_CATEGORIES } from '@/lib/jarvisTools';

interface TourStep {
  key: string;
  section: string;
  label: string;
  /** Element whose top is placed under the navbar when the step starts. */
  start: string;
  era?: string;
  category?: string;
  /** End of a big part of the website: Jarvis pauses and asks the visitor how they liked it. */
  askAfter?: boolean;
}

const CATEGORY_NAMES: Record<string, string> = {
  ai: 'Future AI',
  vehicles: 'Vehicles & Autonomous Transit',
  devices: 'Devices & Bionics',
  homeWork: 'Home & Workplace',
  health: 'Health & Biology',
  energy: 'Energy & Climate',
  space: 'Deep Space',
};

const TECH_ORDER = JARVIS_TECH_CATEGORIES.filter((c) => c !== 'all');

export const TOUR_STEPS: TourStep[] = [
  { key: 'hero', section: 'hero', label: 'Welcome screen: what Hayaati is', start: '#hero' },
  { key: 'era-2030', section: 'timeline', label: 'Future Timeline, era 2030 (banner, story, then its milestone cards)', start: '#timeline', era: '2030' },
  { key: 'era-2035', section: 'timeline', label: 'Future Timeline, era 2035 (banner, story, then its milestone cards)', start: '[data-tour="era-tabs"]', era: '2035' },
  { key: 'era-2050', section: 'timeline', label: 'Future Timeline, era 2050 (banner, story, then its milestone cards)', start: '[data-tour="era-tabs"]', era: '2050', askAfter: true },
  ...TECH_ORDER.map((category, i) => ({
    key: `tech-${category}`,
    section: 'tech',
    label: `Future Tech Catalogue, category ${i + 1} of ${TECH_ORDER.length}: ${CATEGORY_NAMES[category]}`,
    start: i === 0 ? '#tech' : '[data-tour="tech-tabs"]',
    category,
    askAfter: i === TECH_ORDER.length - 1,
  })),
  { key: 'places', section: 'places', label: 'Cities & Places of the Future: eight postcards', start: '#places', askAfter: true },
  { key: 'projects', section: 'projects', label: 'My Projects by Aliya Khan (Hayaati Mehendi Studio is live)', start: '#projects' },
  { key: 'advertise', section: 'advertise', label: 'Advertise with Hayaati (Jarvis can fill this form for the visitor)', start: '#advertise' },
  { key: 'about', section: 'about', label: 'About the founder, Aliya Khan', start: '#about', askAfter: true },
  { key: 'contact', section: 'contact', label: 'Contact (Jarvis can fill this form for the visitor); last stop of the tour', start: '#contact', askAfter: true },
];

// Cards and other blocks a page break should line up with, so a card is never cut in half.
const BLOCKS = '.eb-stage, .ms-card, .hp-card-in, form, [data-tour-item]';

const state = { index: -1, page: 0, active: false };

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

function regionOf(step: TourStep) {
  const section = document.getElementById(step.section);
  const start = document.querySelector(step.start) || section;
  return { section, start };
}

/** Is there more of this step below the screen? */
function moreBelow(section: Element) {
  // A thin leftover strip is not worth a screen of its own; the glide to the next stop passes it anyway.
  // But a card that is not fully on screen yet always gets its own screen.
  const vh = window.innerHeight;
  if (section.getBoundingClientRect().bottom > vh + (vh - NAV_OFFSET) * 0.3) return true;
  return Array.from(section.querySelectorAll(BLOCKS)).some((b) => {
    const r = b.getBoundingClientRect();
    return r.height >= 120 && r.bottom > vh + 40;
  });
}

/** Next screen inside the step: the first card that is cut off at the bottom moves up under the navbar. */
async function pageDown(section: Element) {
  const vh = window.innerHeight;
  const blocks = Array.from(section.querySelectorAll(BLOCKS));
  let y: number | null = null;
  for (const b of blocks) {
    const r = b.getBoundingClientRect();
    if (r.height < 40) continue;
    // Only blocks that are still low on the screen, so every new screen really shows something new.
    if (r.top > NAV_OFFSET + (vh - NAV_OFFSET) * 0.3 && r.bottom > vh - 8) {
      y = window.scrollY + r.top - NAV_OFFSET;
      break;
    }
  }
  if (y === null || y - window.scrollY > vh * 0.95) y = window.scrollY + (vh - NAV_OFFSET) * 0.8;
  const sectionEnd = docTop(section) + section.getBoundingClientRect().height - vh + 24;
  y = Math.min(y, Math.max(sectionEnd, window.scrollY + 80));
  await glideTo(y);
  await nextFrames();
}

/** Switch the era / category this step needs and wait until the page shows it. */
async function prepare(step: TourStep) {
  emit('jarvis:close-popups');
  if (step.era) emit('jarvis:show-era', { era: step.era });
  if (step.category) emit('jarvis:show-category', { category: step.category });
  await nextFrames();
}

function verified(step: TourStep) {
  const tabs = activeTabs();
  if (step.era && tabs.era !== step.era) return `era ${tabs.era} is shown instead of ${step.era}`;
  if (step.category && tabs.category !== step.category) return `category ${tabs.category} is shown instead of ${step.category}`;
  const section = document.getElementById(step.section);
  const r = section?.getBoundingClientRect();
  if (!r || r.bottom < NAV_OFFSET + 80 || r.top > window.innerHeight * 0.6) return `${step.section} is not on screen`;
  return null;
}

async function showStep(index: number) {
  const step = TOUR_STEPS[index];
  state.index = index;
  state.page = 0;
  state.active = true;
  await prepare(step);
  const { start } = regionOf(step);
  if (!start) return { ok: false, error: `${step.section} is not on this page` };
  if (step.key === 'hero') await glideTo(0);
  else await glideToElement(start);
  let problem = verified(step);
  if (problem) {
    // One quiet retry (e.g. a photo above finished loading and moved things a little).
    await prepare(step);
    await glideToElement(regionOf(step).start || start);
    problem = verified(step);
  }
  if (problem) return { ok: false, error: problem };
  return report(step);
}

function report(step: TourStep) {
  const section = document.getElementById(step.section)!;
  const more = moreBelow(section);
  const last = state.index === TOUR_STEPS.length - 1;
  const tabs = activeTabs();
  const ask = !more && Boolean(step.askAfter);
  return {
    ok: true,
    tour_step: `${state.index + 1} of ${TOUR_STEPS.length}`,
    screen: state.page + 1,
    showing: step.label,
    section_name: sectionName(step.section),
    ...(step.era ? { era_on_screen: tabs.era } : {}),
    ...(step.category ? { catalogue_category_on_screen: tabs.categoryLabel || CATEGORY_NAMES[step.category] } : {}),
    visible_on_screen: visibleTexts(section),
    more_of_this_part_below: more,
    what_to_do_now: ask
      ? last && !more
        ? 'Describe calmly only what is in visible_on_screen. This was the last stop: thank the visitor warmly for taking the tour, then ask in your own gentle words what they felt about the website overall.'
        : 'Describe calmly only what is in visible_on_screen. A big part of the website ends here: ask the visitor, warmly and in your own fresh words, how they liked it, then wait for their answer. Continue (tour next) only after they reply.'
      : 'Describe calmly only what is in visible_on_screen, in 2 to 4 unhurried sentences. Do not ask for permission. When you have finished speaking, call tour with action next.',
  };
}

export async function runTour(action: string, target?: string) {
  switch (action) {
    case 'start':
      return showStep(0);
    case 'stop':
      state.active = false;
      return { ok: true, done: 'tour stopped; the page stays where it is' };
    case 'repeat':
      return state.index >= 0 ? report(TOUR_STEPS[state.index]) : showStep(0);
    case 'previous':
      return showStep(Math.max(0, state.index - 1));
    case 'goto': {
      const t = String(target || '').toLowerCase();
      const i = TOUR_STEPS.findIndex(
        (s) => s.key === t || s.era === t || s.category?.toLowerCase() === t || `tech-${t}` === s.key || (s.section === t && !s.era && !s.category)
      );
      const j = i >= 0 ? i : TOUR_STEPS.findIndex((s) => s.section === t);
      if (j < 0) return { ok: false, error: 'no tour stop with that name' };
      return showStep(j);
    }
    case 'next':
    default: {
      if (!state.active || state.index < 0) return showStep(0);
      const step = TOUR_STEPS[state.index];
      const section = document.getElementById(step.section);
      const r = section?.getBoundingClientRect();
      const stillHere = r && r.bottom > NAV_OFFSET + 80 && r.top < window.innerHeight;
      if (section && stillHere && moreBelow(section)) {
        await pageDown(section);
        state.page += 1;
        return report(step);
      }
      if (state.index >= TOUR_STEPS.length - 1) {
        state.active = false;
        return { ok: true, finished: true, done: 'the tour is complete; this was the last part of the website' };
      }
      return showStep(state.index + 1);
    }
  }
}

export function tourPosition() {
  return state.active && state.index >= 0 ? `${state.index + 1} of ${TOUR_STEPS.length}: ${TOUR_STEPS[state.index].label}` : null;
}
