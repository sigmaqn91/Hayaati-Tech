// The website tours Jarvis gives. Tours start ONLY from the Quick Tour / Premium Tour buttons in the hero,
// never from a request in a normal conversation.
//   Quick Tour (free, about 3 minutes): the highlights.
//   Premium Full Tour (one-time coupon, about 14 minutes): the three eras, all six cards of all seven catalogue
//   categories (each card opened large), then the rest of the site.
// The tour is one-sided: Jarvis never asks "shall we continue?".
//
// No waiting between stops: when Jarvis calls tour_next, the next stop is PREPARED at once (its facts come from
// the site content and the page layout, the screen does not change yet) and the answer goes straight back, so
// Jarvis already has his next words ready while he is still finishing the current sentence. The screen itself
// changes exactly when his current words end (the voice hook calls show() at that moment): the page jumps
// directly to the section or the card opens, without any visible scrolling, because Jarvis drives the site.

import { timelineEras, techCatalogue } from '@/data/future';
import { defaultBundle, loadLanguageBundle } from '@/locales';
import type { ContentSchema, SupportedLanguage } from '@/locales/types';
import { jumpTo, scrollTargetFor, sectionName, visibleTexts } from '@/lib/jarvisScreen';

export type TourMode = 'quick' | 'full';

type StepKind = 'hero' | 'era' | 'card' | 'tech' | 'section';

interface TourStep {
  key: string;
  kind: StepKind;
  section: string;
  label: string;
  /** Element whose top is placed under the navbar when the step is shown. */
  start?: string;
  era?: string;
  category?: string;
  cardId?: string;
  /** First card of a catalogue category in the full tour: Jarvis introduces the category with it. */
  intro?: boolean;
  /** Cards of one category share a group; a group can be summed up in one step when time is short. */
  group?: string;
  weight: number;
}

/** What the voice hook gets for one tour_next call. */
export interface PreparedStop {
  response: Record<string, unknown>;
  /** Changes the screen to this stop. Called when Jarvis's current words end. */
  show: () => void;
  finished?: boolean;
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
    { key: 'hero', kind: 'hero', section: 'hero', label: 'Welcome screen: what Hayaati Web Technology is', weight: 1.3 },
  ];
  ERAS.forEach((era, i) =>
    steps.push({
      key: `era-${era}`,
      kind: 'era',
      section: 'timeline',
      // Every era starts at the era buttons, so its banner sits right at the top of the screen.
      start: '[data-tour="era-tabs"]',
      era,
      label: `Future Timeline, era ${era}: the banner, its story, breakthroughs and milestones`,
      weight: 1.9,
    })
  );
  CATEGORY_ORDER.forEach((category, i) => {
    const cards = categoryCards(category);
    cards.forEach((card, j) =>
      steps.push({
        key: card.id,
        kind: 'card',
        section: 'tech',
        start: '[data-tour="tech-tabs"]',
        category,
        cardId: card.id,
        intro: j === 0,
        group: `tech-${category}`,
        label:
          j === 0
            ? `Future Tech Catalogue, category ${i + 1} of ${CATEGORY_ORDER.length}: ${CATEGORY_NAMES[category]}. Card 1 of ${cards.length}, opened large`
            : `${CATEGORY_NAMES[category]} card ${j + 1} of ${cards.length}, opened large`,
        weight: j === 0 ? 1.25 : 1,
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

// Seconds per step that are not speaking time (the screen change and Jarvis taking a breath). Small now:
// the next stop is prepared while Jarvis is still talking.
const OVERHEAD = 0.7;
// Time kept free at the end for the goodbye.
const END_RESERVE: Record<TourMode, number> = { quick: 28, full: 40 };
// Below this many speaking seconds per weight, a whole category is summed up instead of opening each card.
const MIN_SECONDS_PER_WEIGHT = 6;
const WORDS_PER_SECOND = 2.3;
const COLLAPSED_WEIGHT = 2.4;

const state = {
  mode: 'quick' as TourMode,
  steps: [] as TourStep[],
  index: -1,
  active: false,
  startedAt: 0,
  maxSeconds: 240,
  collapsed: new Set<string>(),
  content: defaultBundle.content as ContentSchema,
};

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

/** Card and era texts in the website's current language (English until that language has loaded). */
function refreshSiteLanguage() {
  try {
    const lang = (document.documentElement.lang || 'en') as SupportedLanguage;
    loadLanguageBundle(lang)
      .then((b) => {
        if (b?.content?.techCards) state.content = b.content;
      })
      .catch(() => {});
  } catch {}
}

/** Called when the tour's voice session opens. */
export function beginTour(mode: TourMode, maxSeconds: number) {
  state.mode = mode;
  state.steps = mode === 'full' ? fullPlan() : quickPlan();
  state.index = -1;
  state.active = true;
  state.startedAt = Date.now();
  state.maxSeconds = maxSeconds;
  state.collapsed = new Set();
  state.content = defaultBundle.content;
  ended = false;
  shownIndex = -1;
  refreshSiteLanguage();
  progress();
}

/**
 * The tour continues on a new voice connection (Google renews long connections, or the network dropped one).
 * The stop that was last prepared is presented again by the next tour_next, so Jarvis picks up the thread.
 */
export function rewindForResume() {
  if (!state.active) return;
  state.index = Math.max(-1, state.index - 1);
  refreshSiteLanguage();
}

export function endTour() {
  if (ended) return;
  ended = true;
  state.active = false;
  closeCard();
  emit('jarvis:tour-progress', { active: false });
}

export const tourActive = () => state.active;

// The stop on screen (it can be a little behind the stop Jarvis has already been handed).
let shownIndex = -1;
let ended = true;

function progress(index = state.index) {
  if (ended) return;
  shownIndex = index;
  const step = state.steps[index];
  emit('jarvis:tour-progress', {
    active: true,
    mode: state.mode,
    index: Math.max(0, index),
    total: state.steps.length,
    label: step?.label || '',
    startedAt: state.startedAt,
    maxSeconds: state.maxSeconds,
  });
}

const secondsLeft = () => state.startedAt + (state.maxSeconds - END_RESERVE[state.mode]) * 1000 - Date.now();

const isCollapsed = (s: TourStep) => Boolean(s.group && state.collapsed.has(s.group));

/** Weight still to come from `from` on (a summed-up category counts once). */
function remaining(from: number) {
  let weight = 0;
  let steps = 0;
  for (let i = from; i < state.steps.length; i++) {
    const s = state.steps[i];
    if (isCollapsed(s) && !s.intro) continue;
    weight += isCollapsed(s) ? COLLAPSED_WEIGHT : s.weight;
    steps += 1;
  }
  return { weight, overhead: steps * OVERHEAD };
}

const perWeightNow = () => {
  const { weight, overhead } = remaining(state.index);
  return (secondsLeft() / 1000 - overhead) / Math.max(weight, 1);
};

function speakingSeconds(step: TourStep) {
  const w = isCollapsed(step) ? COLLAPSED_WEIGHT : step.weight;
  return Math.round(Math.min(32, Math.max(5, perWeightNow() * w)));
}

/** At the start of a category: if its cards would not fit any more, the category is summed up instead. */
function maybeCollapse(step: TourStep) {
  if (state.mode !== 'full' || !step.group || !step.intro) return;
  if (perWeightNow() < MIN_SECONDS_PER_WEIGHT) state.collapsed.add(step.group);
}

// --- Screen changes (run when Jarvis's current words end) ------------------------------------------------

const cardDialog = () => document.querySelector('[role="dialog"][aria-labelledby="modal-card-title"]:not([data-closing])');

function closeCard() {
  if (document.querySelector('[role="dialog"][aria-labelledby="modal-card-title"]')) emit('jarvis:close-popups');
}

function jumpToStart(selector: string | undefined, section: string) {
  if (section === 'hero') return jumpTo(0);
  const el = document.querySelector(selector || `#${section}`) || document.getElementById(section);
  if (el) jumpTo(scrollTargetFor(el));
}

/** The card opens large at once (or the open popup switches straight to it); the page behind is already there. */
function showCard(step: TourStep) {
  const behind = document.getElementById('tech');
  const r = behind?.getBoundingClientRect();
  const pageAtTech = r ? r.top < window.innerHeight && r.bottom > 0 : false;
  if (!pageAtTech || !cardDialog()) {
    if (step.intro || !pageAtTech) emit('jarvis:show-category', { category: step.category });
    if (!pageAtTech) jumpToStart(step.start || '[data-tour="tech-tabs"]', 'tech');
  }
  emit('jarvis:open-card', { id: step.cardId, kind: 'tech' });
}

function showSection(step: TourStep) {
  closeCard();
  if (step.era) emit('jarvis:show-era', { era: step.era });
  if (step.category) emit('jarvis:show-category', { category: step.category });
  jumpToStart(step.start, step.section);
}

// --- Photos: downloaded and decoded before their card opens, so a card never opens with a blank frame --------

const decoded = new Map<string, Promise<void>>();
function preloadImage(src: string | undefined) {
  if (!src || decoded.has(src)) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  decoded.set(
    src,
    img.decode().catch(() => {
      decoded.delete(src);
    })
  );
}
const cardImage = (id?: string) => techCatalogue.find((c) => c.id === id)?.image;

/** This stop's photo and the next two cards' photos start loading now (Jarvis is still speaking). */
function preloadAround(from: number) {
  let found = 0;
  for (let i = from; i < state.steps.length && found < 3; i++) {
    const s = state.steps[i];
    if (s.kind !== 'card' || isCollapsed(s)) continue;
    preloadImage(cardImage(s.cardId));
    found += 1;
  }
}

// --- What Jarvis is told ---------------------------------------------------------------------------------

function instruction(seconds: number, extra = '') {
  const words = Math.round(seconds * WORDS_PER_SECOND);
  return (
    `${extra}Speak for about ${seconds} seconds (about ${words} words), in friendly, natural everyday speech, only about what this result shows. ` +
    'Do not ask the visitor anything and do not wait for an answer. As soon as you finish speaking, call tour_next.'
  );
}

/** Texts that will be on screen once the page has jumped to the element (read from the layout, no scrolling). */
function textsAt(selector: string | undefined, section: string) {
  const root = document.getElementById(section);
  if (!root) return [];
  if (section === 'hero') return visibleTexts(root, 1800, 0);
  const el = document.querySelector(selector || `#${section}`) || root;
  return visibleTexts(root, 1800, scrollTargetFor(el));
}

function eraFacts(era: string) {
  const c = state.content.eras?.[`era-${era}`] || defaultBundle.content.eras[`era-${era}`];
  const milestones = eraCards(era)
    .map((card) => (state.content.timelineCards?.[card.id] || defaultBundle.content.timelineCards[card.id])?.title)
    .filter(Boolean);
  return {
    era_title: c?.title,
    banner_photo: c?.bannerAlt,
    story: c?.story,
    key_breakthroughs: c?.breakthroughs,
    milestone_cards: milestones,
  };
}

function cardFacts(id: string) {
  const c = state.content.techCards?.[id] || defaultBundle.content.techCards[id];
  return { card_title: c?.title || '', card_text: [c?.description, c?.howItWorks].filter(Boolean) };
}

function prepareStep(step: TourStep): PreparedStop {
  maybeCollapse(step);
  const collapsed = isCollapsed(step);
  const seconds = speakingSeconds(step);
  const full = state.mode === 'full';
  const base = {
    ok: true,
    tour: full ? 'Premium Full Tour' : 'Quick Tour',
    step: `${state.index + 1} of ${state.steps.length}`,
    showing: collapsed ? `Future Tech Catalogue: ${CATEGORY_NAMES[step.category!]} (summed up)` : step.label,
    section_name: sectionName(step.section),
  };
  preloadAround(state.index);

  if (step.kind === 'card' && collapsed) {
    // Not enough time left for every card of this category: its grid is shown and summed up.
    const titles = categoryCards(step.category!).map((c) => cardFacts(c.id).card_title);
    return {
      response: {
        ...base,
        catalogue_category: CATEGORY_NAMES[step.category!],
        cards_in_this_category: titles,
        what_to_do_now: instruction(seconds, 'Name this category, then mention each of its cards in one short sentence (they will not be opened). '),
      },
      show: () => showSection({ ...step, kind: 'tech' }),
    };
  }

  if (step.kind === 'card') {
    const card = 'This card is now open large on the screen. Name it exactly as card_title and explain in simple everyday words what it is and how it works, and how it could make our life better when it arrives. ';
    // Same words as the Quick Tour (which visitors love); the full tour only adds a one-line category intro.
    const extra =
      full && step.intro
        ? `A new catalogue category begins here: ${CATEGORY_NAMES[step.category!]}. First say in one natural sentence what this category is about, then turn to its first card. ${card}`
        : card;
    return {
      response: {
        ...base,
        ...cardFacts(step.cardId!),
        catalogue_category: CATEGORY_NAMES[step.category!],
        what_to_do_now: instruction(seconds, extra),
      },
      show: () => showCard(step),
    };
  }

  let extra = '';
  let facts: Record<string, unknown> = {};
  if (step.kind === 'era') {
    facts = eraFacts(step.era!);
    extra = `The era on screen now is ${step.era}. Say the year ${step.era} exactly and describe only this era in a few lively sentences; do not name any other era year. `;
  } else if (step.kind === 'tech') {
    extra = 'Introduce the catalogue: 42 future technologies in seven categories. Three highlights will open next. ';
  } else if (step.key === 'about') {
    extra = 'Speak about founder Aliya Khan with warmth and respect, describing what is on screen. ';
  }
  const isLast = state.index === state.steps.length - 1;
  return {
    response: {
      ...base,
      ...(step.era ? { era_on_screen: step.era } : {}),
      ...facts,
      ...(step.kind === 'era' ? {} : { visible_on_screen: textsAt(step.start, step.section) }),
      what_to_do_now: isLast
        ? `${extra}Speak for about ${seconds} seconds about it, then call tour_next one last time.`
        : instruction(seconds, extra),
    },
    show: () => showSection(step),
  };
}

function finish(reason: 'done' | 'time'): PreparedStop {
  state.active = false;
  const quick = state.mode === 'quick';
  return {
    finished: true,
    show: () => {
      closeCard();
      if (!ended) emit('jarvis:tour-progress', { active: false, finished: true });
    },
    response: {
      ok: true,
      finished: true,
      reason: reason === 'time' ? 'the tour time is over' : 'all stops are done',
      what_to_do_now:
        'The tour is complete. Say a warm, short goodbye in two or three sentences: thank the visitor for taking the tour' +
        (quick
          ? ', and mention gently that the Premium Full Tour shows every era and all 42 catalogue cards in detail, free the first time with a coupon from the founder section.'
          : ' and invite them to explore the website on their own and to share their opinion with the rating button.') +
        ' Do not call any tool again.',
    },
  };
}

/** The only tour tool Jarvis has during a tour. Synchronous: the answer goes back to Jarvis at once. */
export function tourNext(): PreparedStop {
  if (!state.active) {
    return { show: () => {}, response: { ok: false, error: 'no tour is running', what_to_do_now: 'Do not call tour_next again.' } };
  }
  for (;;) {
    state.index += 1;
    if (state.index >= state.steps.length) return finish('done');
    if (secondsLeft() <= 0) {
      // Time is nearly up: the tour still ends at its final stop (the founder in the Quick Tour, contact in the
      // full tour) instead of stopping where it is. Only when even that no longer fits does it say goodbye.
      if (secondsLeft() < -(END_RESERVE[state.mode] - 18) * 1000) return finish('time');
      state.index = Math.max(state.index, state.steps.length - 1);
    }
    const step = state.steps[state.index];
    // The other cards of a summed-up category are skipped.
    if (step.kind === 'card' && isCollapsed(step) && !step.intro) continue;
    try {
      const prepared = prepareStep(step);
      const index = state.index;
      const show = prepared.show;
      // The dock below shows the stop when it is really on screen.
      prepared.show = () => {
        show();
        if (index > shownIndex) progress(index);
      };
      return prepared;
    } catch {
      return { show: () => {}, response: { ok: false, error: 'this stop could not be prepared', what_to_do_now: 'Call tour_next.' } };
    }
  }
}

/** Function declaration for the tour voice session (no other website actions during a tour). */
export const TOUR_FUNCTION_DECLARATIONS = [
  {
    name: 'tour_next',
    description:
      'Moves the website tour to its next stop and returns exactly what will be on the visitor\'s screen (a section, an era, a category or a card opened large) and how long to speak about it. The screen changes the moment your current words end.',
  },
];
