// Runs Jarvis's website actions in the browser (see lib/jarvisTools.ts for the list Jarvis knows).
// Sections, cards and the rating popup listen for small window events, so nothing here changes how
// the website looks; Jarvis just presses the same things a visitor would.

import { defaultBundle, languageList } from '@/locales';
import { timelineEras, techCatalogue } from '@/data/future';
import { placesData } from '@/data/places';
import { RATED_STORAGE_KEY } from '@/lib/ratingCatalog';
import type { ContentSchema, SupportedLanguage } from '@/locales/types';
import { JARVIS_SECTIONS, JARVIS_TECH_CATEGORIES, JARVIS_ERAS } from '@/lib/jarvisTools';

export type JarvisActionResult = { ok: boolean; done?: string; error?: string; [key: string]: unknown };

export interface JarvisActionContext {
  setLanguage: (lang: SupportedLanguage) => void;
  content: ContentSchema;
}

/** Fill request for the rating popup (handled by RatingCenter / RatingDialog). */
export interface RatingFill {
  stars?: number;
  good?: string[];
  needsWork?: string[];
  issues?: string[];
  feedback?: string;
  name?: string;
  email?: string;
}

type CardKind = 'timeline' | 'tech' | 'place';
interface CardRef {
  id: string;
  kind: CardKind;
  titles: string[];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function allCards(content: ContentSchema): CardRef[] {
  const en = defaultBundle.content;
  const titles = (a?: { title?: string }, b?: { title?: string }) =>
    [a?.title, b?.title].filter((t): t is string => Boolean(t));
  return [
    ...timelineEras.flatMap((e) =>
      e.cards.map((c) => ({ id: c.id, kind: 'timeline' as const, titles: titles(en.timelineCards?.[c.id], content.timelineCards?.[c.id]) }))
    ),
    ...techCatalogue.map((c) => ({ id: c.id, kind: 'tech' as const, titles: titles(en.techCards?.[c.id], content.techCards?.[c.id]) })),
    ...placesData.map((p) => ({ id: p.id, kind: 'place' as const, titles: titles(en.places?.[p.id], content.places?.[p.id]) })),
  ];
}

/** Best matching card for a spoken / typed title (word overlap, exact title wins). */
export function findCard(query: string, content: ContentSchema): CardRef | null {
  const q = norm(query);
  if (!q) return null;
  const qWords = q.split(' ').filter((w) => w.length > 1);
  let best: CardRef | null = null;
  let bestScore = 0;
  for (const card of allCards(content)) {
    if (card.id === query.trim()) return card;
    for (const title of card.titles) {
      const t = norm(title);
      if (t === q) return card;
      const tWords = t.split(' ');
      let hits = 0;
      for (const w of qWords) if (tWords.some((tw) => tw === w || (w.length > 3 && (tw.startsWith(w) || w.startsWith(tw))))) hits++;
      let score = qWords.length ? hits / Math.max(qWords.length, 1) + hits / tWords.length : 0;
      if (t.includes(q) || q.includes(t)) score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = card;
      }
    }
  }
  return bestScore >= 0.6 ? best : null;
}

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
};

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

const asList = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').slice(0, 40) : undefined;

export function runJarvisAction(name: string, args: Record<string, unknown> | undefined, ctx: JarvisActionContext): JarvisActionResult {
  const a = args || {};
  try {
    switch (name) {
      case 'go_to_section': {
        const section = String(a.section || '');
        if (!(JARVIS_SECTIONS as readonly string[]).includes(section)) return { ok: false, error: 'unknown section' };
        emit('jarvis:close-popups');
        return scrollToId(section) ? { ok: true, done: `scrolled to ${section}` } : { ok: false, error: 'section not on page' };
      }
      case 'scroll_page': {
        const dir = String(a.direction || 'down');
        const h = window.innerHeight * 0.8;
        if (dir === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
        else if (dir === 'bottom') window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        else window.scrollBy({ top: dir === 'up' ? -h : h, behavior: 'smooth' });
        return { ok: true, done: `scrolled ${dir}` };
      }
      case 'open_card': {
        const card = findCard(String(a.card || ''), ctx.content);
        if (!card) return { ok: false, error: 'no card with that title' };
        emit('jarvis:close-popups');
        emit('jarvis:open-card', { id: card.id, kind: card.kind });
        return { ok: true, done: `opened card "${card.titles[card.titles.length - 1] || card.id}"` };
      }
      case 'show_era': {
        const era = String(a.era || '');
        if (!(JARVIS_ERAS as readonly string[]).includes(era)) return { ok: false, error: 'unknown era' };
        emit('jarvis:close-popups');
        emit('jarvis:show-era', { era });
        scrollToId('timeline');
        return { ok: true, done: `showing era ${era}` };
      }
      case 'show_tech_category': {
        const category = String(a.category || '');
        if (!(JARVIS_TECH_CATEGORIES as readonly string[]).includes(category)) return { ok: false, error: 'unknown category' };
        emit('jarvis:close-popups');
        emit('jarvis:show-category', { category });
        scrollToId('tech');
        return { ok: true, done: `showing catalogue category ${category}` };
      }
      case 'change_language': {
        const code = String(a.language || '');
        const lang = languageList.find((l) => l.code === code);
        if (!lang) return { ok: false, error: 'unsupported language' };
        ctx.setLanguage(lang.code);
        return { ok: true, done: `website language changed to ${lang.name}` };
      }
      case 'open_rating': {
        emit('rating:open');
        return isAlreadyRated()
          ? { ok: true, done: 'rating popup opened', note: 'this browser already sent a rating, the popup only shows a thank-you' }
          : { ok: true, done: 'rating popup opened' };
      }
      case 'fill_rating': {
        if (isAlreadyRated()) {
          emit('rating:open');
          return { ok: false, error: 'this browser already sent a rating; it cannot be filled again' };
        }
        const stars = Math.round(Number(a.stars));
        const fill: RatingFill = {
          stars: stars >= 1 && stars <= 5 ? stars : undefined,
          good: asList(a.good),
          needsWork: asList(a.needs_work),
          issues: asList(a.issues),
          feedback: typeof a.feedback === 'string' ? a.feedback.slice(0, 1500) : undefined,
          name: typeof a.name === 'string' ? a.name.slice(0, 80) : undefined,
          email: typeof a.email === 'string' ? a.email.slice(0, 120) : undefined,
        };
        emit('rating:fill', fill);
        return { ok: true, done: 'rating popup filled; the visitor must check it and press Submit themselves' };
      }
      case 'close_popup': {
        emit('jarvis:close-popups');
        return { ok: true, done: 'popup closed' };
      }
      default:
        return { ok: false, error: 'unknown action' };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'action failed' };
  }
}

function isAlreadyRated() {
  try {
    return Boolean(localStorage.getItem(RATED_STORAGE_KEY));
  } catch {
    return false;
  }
}
