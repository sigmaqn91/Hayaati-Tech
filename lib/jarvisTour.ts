// The website tours Jarvis gives. Tours start ONLY from the Quick Tour / Premium Tour buttons in the hero,
// never from a request in a normal conversation.
//   Quick Tour (free, about 3 minutes): the highlights.
//   Premium Full Tour (one-time coupon, about 14 minutes): every era with its milestone cards and all six
//   cards of all seven catalogue categories, each card opened large and closed again, then the rest of the site.
// The tour is one-sided: Jarvis never asks "shall we continue?". Each step is decided here (not by Jarvis's
// guesses), the page glides there calmly, and Jarvis is told exactly what is on screen and how long to speak,
// so the whole tour always fits inside the voice session.

import { timelineEras, techCatalogue } from '@/data/future';
import { NAV_OFFSET, activeTabs, docTop, glideTo, glideToElement, nextFrames, sectionName, sleep, visibleTexts } from '@/lib/jarvisScreen';

export type TourMode = 'quick' | 'full';

type StepKind = 'hero' | 'era' | 'card' | 'tech' | 'section';

interface TourStep {
  key: string;
  kind: StepKind;
  section: string;
  label: string;
  /** Element whose top is placed under the navbar when the step starts. */
  start?: string;
  era?: string;
  category?: string;
  cardId?: string;
  cardKind?: 'timeline' | 'tech';
  /** Card steps of one era / category share a group; a group can be summed up in one step when time is short. */
  group?: string;
  weight: number;
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
const CATEGORY_ORDER = ['ai', 'vehicles', 'devices', 'homeWork', 'health', 'energy', 'space'];
const ERAS = ['2030', '2035', '2050'];

const eraCards = (era: string) => timelineEras.find((e) => e.era === era)?.cards || [];
const categoryCards = (category: string) => techCatalogue.filter((c) => c.category === category);

function fullPlan(): TourStep[] {
  const steps: TourStep[] = [
    { key: 'hero', kind: 'hero', section: 'hero', label: 'Welcome screen: what Hayaati Web Technology is', weight: 1.4 },
  ];
  ERAS.forEach((era, i) => {
    steps.push({
      key: `era-${era}`,
      kind: 'era',
      section: 'timeline',
      start: i === 0 ? '#timeline' : '[data-tour="era-tabs"]',
      era,
      group: `era-${era}`,
      label: `Future Timeline, era ${era}: the big banner photo, its story and key breakthroughs`,
      weight: 1.4,
    });
    eraCards(era).forEach((card, j) =>
      steps.push({
        key: card.id,
        kind: 'card',
        section: 'timeline',
        era,
        cardId: card.id,
        cardKind: 'timeline',
        group: `era-${era}`,
        label: `Era ${era} milestone card ${j + 1} of ${eraCards(era).length}, opened large`,
        weight: 0.8,
      })
    );
  });
  CATEGORY_ORDER.forEach((category, i) => {
    const cards = categoryCards(category);
    steps.push({
      key: `tech-${category}`,
      kind: 'tech',
      section: 'tech',
      start: i === 0 ? '#tech' : '[data-tour="tech-tabs"]',
      category,
      group: `tech-${category}`,
      label: `Future Tech Catalogue, category ${i + 1} of ${CATEGORY_ORDER.length}: ${CATEGORY_NAMES[category]} (${cards.length} cards)`,
      weight: 0.6,
    });
    cards.forEach((card, j) =>
      steps.push({
        key: card.id,
        kind: 'card',
        section: 'tech',
        category,
        cardId: card.id,
        cardKind: 'tech',
        group: `tech-${category}`,
        label: `${CATEGORY_NAMES[category]} card ${j + 1} of ${cards.length}, opened large`,
        weight: 1,
      })
    );
  });
  steps.push(
    { key: 'places', kind: 'section', section: 'places', start: '#places', label: 'Cities & Places of the Future: eight postcards of future cities, on Earth, the Moon, Mars and in orbit', weight: 1.2 },
    { key: 'projects', kind: 'section', section: 'projects', start: '#projects', label: 'My Projects by founder Aliya Khan (Hayaati Mehendi Studio is live)', weight: 0.8 },
    { key: 'advertise', kind: 'section', section: 'advertise', start: '#advertise', label: 'Advertise with Hayaati (a form to list a project or business)', weight: 0.6 },
    { key: 'about', kind: 'section', section: 'about', start: '#about', label: 'About the founder, Aliya Khan (this is also where visitors request their free Premium Tour coupon)', weight: 1 },
    { key: 'contact', kind: 'section', section: 'contact', start: '#contact', label: 'Contact (the last stop of the tour)', weight: 0.9 }
  );
  return steps;
}

function quickPlan(): TourStep[] {
  const highlight = (category: string, i: number): TourStep => {
    const card = categoryCards(category)[0];
    return {
      key: card.id,
      kind: 'card',
      section: 'tech',
      category,
      cardId: card.id,
      cardKind: 'tech',
      label: `Highlight ${i} of 3 from the catalogue (${CATEGORY_NAMES[category]}), opened large`,
      weight: 1,
    };
  };
  return [
    { key: 'hero', kind: 'hero', section: 'hero', label: 'Welcome screen: what Hayaati Web Technology is', weight: 1.2 },
    ...ERAS.map<TourStep>((era, i) => ({
      key: `era-${era}`,
      kind: 'era',
      section: 'timeline',
      start: i === 0 ? '#timeline' : '[data-tour="era-tabs"]',
      era,
      label: `Future Timeline, era ${era}: the banner and its story (highlights only)`,
      weight: 1,
    })),
    { key: 'tech-all', kind: 'tech', section: 'tech', start: '#tech', category: 'all', label: 'Future Tech Catalogue: 42 technologies in 7 categories', weight: 0.9 },
    highlight('vehicles', 1),
    highlight('ai', 2),
    highlight('space', 3),
    { key: 'places', kind: 'section', section: 'places', start: '#places', label: 'Cities & Places of the Future: eight postcards', weight: 0.9 },
    { key: 'about', kind: 'section', section: 'about', start: '#about', label: 'About the founder, Aliya Khan (last stop of the Quick Tour)', weight: 1 },
  ];
}

// Seconds the page needs per step (glide, popup, Jarvis starting to talk), not counted as speaking time.
const OVERHEAD: Record<StepKind, number> = { hero: 3, era: 3.5, card: 2.6, tech: 3, section: 3.5 };
// Time kept free at the end for the goodbye.
const END_RESERVE: Record<TourMode, number> = { quick: 28, full: 40 };
// Below this many speaking seconds per weight, a whole card group is summed up instead of opening each card.
const MIN_SECONDS_PER_WEIGHT = 6;
const WORDS_PER_SECOND = 2.3;

const state = {
  mode: 'quick' as TourMode,
  steps: [] as TourStep[],
  index: -1,
  active: false,
  startedAt: 0,
  maxSeconds: 240,
  collapsed: new Set<string>(),
};

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

/** Called when the tour's voice session opens. */
export function beginTour(mode: TourMode, maxSeconds: number) {
  state.mode = mode;
  state.steps = mode === 'full' ? fullPlan() : quickPlan();
  state.index = -1;
  state.active = true;
  state.startedAt = Date.now();
  state.maxSeconds = maxSeconds;
  state.collapsed = new Set();
  progress();
}

export function endTour() {
  if (!state.active) return;
  state.active = false;
  closeCard();
  emit('jarvis:tour-progress', { active: false });
}

export const tourActive = () => state.active;

function progress() {
  const step = state.steps[state.index];
  emit('jarvis:tour-progress', {
    active: state.active,
    mode: state.mode,
    index: Math.max(0, state.index),
    total: state.steps.length,
    label: step?.label || '',
    startedAt: state.startedAt,
    maxSeconds: state.maxSeconds,
  });
}

const secondsLeft = () => state.startedAt + (state.maxSeconds - END_RESERVE[state.mode]) * 1000 - Date.now();

/** Steps still to come from `from` on (collapsed groups count only their first step). */
function remaining(from: number) {
  let weight = 0;
  let overhead = 0;
  for (let i = from; i < state.steps.length; i++) {
    const s = state.steps[i];
    if (s.kind === 'card' && s.group && state.collapsed.has(s.group)) continue;
    weight += s.group && state.collapsed.has(s.group) ? 2.4 : s.weight;
    overhead += OVERHEAD[s.kind];
  }
  return { weight, overhead };
}

function speakingSeconds(step: TourStep) {
  const { weight, overhead } = remaining(state.index);
  const perWeight = (secondsLeft() / 1000 - overhead) / Math.max(weight, 1);
  const w = step.group && state.collapsed.has(step.group) ? 2.4 : step.weight;
  return Math.round(Math.min(32, Math.max(5, perWeight * w)));
}

/** At the start of an era / category: if the cards would not fit any more, sum the group up instead. */
function maybeCollapse(step: TourStep) {
  if (state.mode !== 'full' || !step.group || step.kind === 'card') return;
  const { weight, overhead } = remaining(state.index);
  const perWeight = (secondsLeft() / 1000 - overhead) / Math.max(weight, 1);
  if (perWeight < MIN_SECONDS_PER_WEIGHT) state.collapsed.add(step.group);
}

// --- Card popup -----------------------------------------------------------------------------------------

const openDialog = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-labelledby="modal-card-title"]')).find(
    (d) => !d.hasAttribute('data-closing')
  ) || null;

function closeCard() {
  if (document.querySelector('[role="dialog"][aria-labelledby="modal-card-title"]')) emit('jarvis:close-popups');
}

async function waitFor<T>(read: () => T | null, ms: number): Promise<T | null> {
  const until = Date.now() + ms;
  for (;;) {
    const v = read();
    if (v || Date.now() > until) return v;
    await sleep(50);
  }
}

async function openCard(step: TourStep) {
  const el = document.querySelector<HTMLElement>(`[data-card-id="${step.cardId}"]`);
  if (el) {
    // The card itself comes calmly to the middle of the screen first, then opens large.
    const r = el.getBoundingClientRect();
    const target = docTop(el) - Math.max(NAV_OFFSET, (window.innerHeight - r.height) / 2);
    if (r.top < NAV_OFFSET || r.bottom > window.innerHeight) await glideTo(target);
  }
  emit('jarvis:open-card', { id: step.cardId, kind: step.cardKind });
  const dialog = await waitFor(openDialog, 1500);
  if (!dialog) return null;
  // Wait for the big photo (and its short fade-in) so it never pops in while Jarvis talks about it.
  const slot = dialog.querySelector('[data-image-slot]');
  if (slot && slot.getAttribute('data-image-slot') !== 'real') {
    await waitFor(() => (slot.getAttribute('data-image-slot') === 'real' ? true : null), 3500);
    await sleep(380);
  }
  preloadNextCard();
  return dialog;
}

/** While Jarvis talks about this card, the next card's photo is already downloaded (same file the popup uses). */
function preloadNextCard() {
  for (let i = state.index + 1; i < state.steps.length; i++) {
    const s = state.steps[i];
    if (s.kind !== 'card' || !s.cardId) continue;
    const src = [...techCatalogue, ...timelineEras.flatMap((e) => e.cards)].find((c) => c.id === s.cardId)?.image;
    if (src) {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    }
    return;
  }
}

function cardTexts(dialog: HTMLElement) {
  const title = dialog.querySelector('#modal-card-title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const texts: string[] = [];
  let total = 0;
  dialog.querySelectorAll('p').forEach((p) => {
    const t = p.textContent?.replace(/\s+/g, ' ').trim();
    if (!t || t.length < 20 || total > 900) return;
    texts.push(t.length > 420 ? `${t.slice(0, 417)}...` : t);
    total += t.length;
  });
  return { title, texts };
}

/** Titles of the cards in the visible grid (used when a group is summed up). */
function gridTitles(section: Element) {
  return Array.from(section.querySelectorAll<HTMLElement>('[data-card-id]'))
    .map((c) => c.querySelector('h3, h4')?.textContent?.replace(/\s+/g, ' ').trim())
    .filter((t): t is string => Boolean(t));
}

// --- Steps ----------------------------------------------------------------------------------------------

async function prepare(step: TourStep) {
  if (openDialog()) {
    closeCard();
    await sleep(320); // the popup's closing animation
  }
  if (step.era) emit('jarvis:show-era', { era: step.era });
  if (step.category) emit('jarvis:show-category', { category: step.category });
  await nextFrames();
}

function instruction(step: TourStep, seconds: number, extra = '') {
  const words = Math.round(seconds * WORDS_PER_SECOND);
  return (
    `${extra}Speak for about ${seconds} seconds (about ${words} words), calmly and warmly, only about what this result shows. ` +
    'Do not ask the visitor anything and do not wait for an answer. As soon as you finish speaking, call tour_next.'
  );
}

async function showStep(step: TourStep): Promise<Record<string, unknown>> {
  maybeCollapse(step);
  await prepare(step);
  const collapsed = Boolean(step.group && state.collapsed.has(step.group));
  const seconds = speakingSeconds(step);
  const base = {
    ok: true,
    tour: state.mode === 'full' ? 'Premium Full Tour' : 'Quick Tour',
    step: `${state.index + 1} of ${state.steps.length}`,
    showing: step.label,
    section_name: sectionName(step.section),
  };

  if (step.kind === 'card') {
    const dialog = await openCard(step);
    if (!dialog) return { ...base, ok: false, error: 'card did not open', what_to_do_now: 'Say nothing about it and call tour_next.' };
    const { title, texts } = cardTexts(dialog);
    return {
      ...base,
      card_title: title,
      card_text: texts,
      ...(step.era ? { era: step.era } : {}),
      ...(step.category ? { catalogue_category: CATEGORY_NAMES[step.category] } : {}),
      what_to_do_now: instruction(
        step,
        seconds,
        'This card is now open large on the screen. Name it exactly as card_title and explain what it is and how it works, in simple words. '
      ),
    };
  }

  const start = step.kind === 'hero' ? null : document.querySelector(step.start || `#${step.section}`) || document.getElementById(step.section);
  if (step.kind === 'hero') await glideTo(0);
  else if (start) await glideToElement(start);
  else return { ...base, ok: false, error: `${step.section} is not on this page`, what_to_do_now: 'Call tour_next.' };

  const section = document.getElementById(step.section);
  const tabs = activeTabs();
  const visible = section ? visibleTexts(section) : [];
  let extra = '';
  if (step.kind === 'era') {
    extra = collapsed
      ? 'Describe this era and its four milestone cards in one short sentence each (they will not be opened). '
      : state.mode === 'full'
        ? 'Describe the banner and the story of this era; its four milestone cards will open one by one next. '
        : 'Describe this era in a few lively sentences. ';
  } else if (step.kind === 'tech') {
    extra =
      step.category === 'all'
        ? 'Introduce the catalogue: 42 future technologies in seven categories. Three highlights will open next. '
        : collapsed
          ? 'Name this category, then mention each of its cards in one short sentence (they will not be opened). '
          : 'Name this category in one or two sentences; its cards will open one by one next. ';
  } else if (step.key === 'about') {
    extra = 'Speak about founder Aliya Khan with warmth and respect, describing what is on screen. ';
  }
  const isLast = state.index === state.steps.length - 1;
  return {
    ...base,
    ...(step.era ? { era_on_screen: tabs.era } : {}),
    ...(step.category && step.category !== 'all'
      ? { catalogue_category_on_screen: tabs.categoryLabel || CATEGORY_NAMES[step.category] }
      : {}),
    ...(collapsed && section ? { cards_in_this_part: gridTitles(section) } : {}),
    visible_on_screen: visible,
    what_to_do_now: isLast
      ? `${extra}Speak for about ${seconds} seconds about it, then call tour_next one last time.`
      : instruction(step, seconds, extra),
  };
}

function finish(reason: 'done' | 'time') {
  state.active = false;
  closeCard();
  emit('jarvis:tour-progress', { active: false, finished: true });
  const quick = state.mode === 'quick';
  return {
    ok: true,
    finished: true,
    reason: reason === 'time' ? 'the tour time is over' : 'all stops are done',
    what_to_do_now:
      'The tour is complete. Say a warm, short goodbye in two or three sentences: thank the visitor for taking the tour' +
      (quick
        ? ', and mention gently that the Premium Full Tour shows every era and all 42 catalogue cards in detail, free the first time with a coupon from the founder section.'
        : ' and invite them to explore the website on their own and to share their opinion with the rating button.') +
      ' Do not call any tool again.',
  };
}

/** The only tour tool Jarvis has during a tour. */
export async function tourNext(): Promise<Record<string, unknown>> {
  if (!state.active) return { ok: false, error: 'no tour is running', what_to_do_now: 'Do not call tour_next again.' };
  for (;;) {
    state.index += 1;
    if (state.index >= state.steps.length) return finish('done');
    if (secondsLeft() <= 0) return finish('time');
    const step = state.steps[state.index];
    // Cards of a summed-up group are skipped.
    if (step.kind === 'card' && step.group && state.collapsed.has(step.group)) continue;
    progress();
    try {
      return await showStep(step);
    } catch {
      return { ok: false, error: 'this stop could not be shown', what_to_do_now: 'Call tour_next.' };
    }
  }
}

/** Function declaration for the tour voice session (no other website actions during a tour). */
export const TOUR_FUNCTION_DECLARATIONS = [
  {
    name: 'tour_next',
    description:
      'Moves the website tour to its next stop and returns exactly what is on the visitor\'s screen now (a section, an era, a category or a card opened large) and how long to speak about it.',
  },
];
