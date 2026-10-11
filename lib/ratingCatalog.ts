/**
 * Website rating: the full "biodata" of the site that a visitor can mark as good / needs work.
 * Every section, every card and every catalogue category is listed here, built from the same data
 * files the website itself uses, so new cards automatically appear in the rating popup too.
 * The server uses RATING_ITEM_IDS to accept only real ids.
 */

import { timelineEras, techCatalogue, type TechCardData } from '@/data/future';
import { placesData } from '@/data/places';
import { projectsData } from '@/data/projects';
import type { TranslationSchema, ContentSchema } from '@/locales/types';

export type RatingVerdict = 'good' | 'bad';

export interface RatingItem {
  id: string;
  label: string;
  hint?: string;
}

export interface RatingArea {
  id: string;
  label: string;
  hint?: string;
  items: RatingItem[];
}

export const TECH_CATEGORIES: TechCardData['category'][] = ['ai', 'vehicles', 'devices', 'homeWork', 'health', 'energy', 'space'];

/** "What is lacking?" quick tags (shown as chips). */
export const RATING_ISSUES: { id: string; label: string }[] = [
  { id: 'images', label: 'Image quality' },
  { id: 'animation', label: 'Animations' },
  { id: 'speed', label: 'Speed / loading' },
  { id: 'content', label: 'Text & content' },
  { id: 'design', label: 'Design & colours' },
  { id: 'phone', label: 'Phone view' },
  { id: 'jarvis', label: 'Jarvis answers' },
  { id: 'voice', label: 'Jarvis voice' },
  { id: 'translation', label: 'Translations' },
  { id: 'navigation', label: 'Menu & navigation' },
  { id: 'forms', label: 'Forms' },
  { id: 'other', label: 'Something else' },
];

export const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Visitor-facing list (titles in the visitor's current site language). */
export function buildRatingAreas(t: TranslationSchema, content: ContentSchema): RatingArea[] {
  const cat = t.tech?.categories as Record<string, string> | undefined;
  const areas: RatingArea[] = [
    {
      id: 'hero',
      label: 'Hero (first screen)',
      hint: 'Opening screen, orb, advert',
      items: [
        { id: 'hero-panel', label: 'Hero panel & headline' },
        { id: 'jarvis-orb', label: 'Jarvis orb' },
        { id: 'hero-advert', label: 'Advertisement' },
        { id: 'hero-background', label: 'Background animation' },
      ],
    },
    {
      id: 'jarvis',
      label: 'Jarvis assistant',
      hint: 'Voice and chat',
      items: [
        { id: 'jarvis-voice', label: 'Voice conversation' },
        { id: 'jarvis-chat', label: 'Chat answers' },
        { id: 'jarvis-languages', label: 'Languages' },
      ],
    },
    {
      id: 'timeline',
      label: t.nav?.timeline || 'Future Timeline',
      hint: 'Era banners and milestone cards',
      items: timelineEras.flatMap((era) => [
        { id: era.id, label: `${era.era} · ${content.eras?.[era.id]?.title || 'Era banner'}`, hint: 'Era banner' },
        ...era.cards.map((c) => ({
          id: c.id,
          label: content.timelineCards?.[c.id]?.title || c.id,
          hint: `${era.era} milestone`,
        })),
      ]),
    },
    ...TECH_CATEGORIES.map((k) => ({
      id: `tech-${k}`,
      label: `${t.nav?.tech || 'Future Tech'} · ${cat?.[k] || cap(k)}`,
      hint: 'Catalogue category',
      items: techCatalogue
        .filter((c) => c.category === k)
        .map((c) => ({ id: c.id, label: content.techCards?.[c.id]?.title || c.id, hint: String(c.year) })),
    })),
    {
      id: 'places',
      label: t.nav?.places || 'Cities & Places',
      hint: 'Postcards',
      items: placesData.map((p) => ({ id: p.id, label: content.places?.[p.id]?.title || p.id, hint: String(p.year) })),
    },
    {
      id: 'projects',
      label: t.nav?.projects || 'My Projects',
      items: projectsData.map((p) => ({ id: p.id, label: p.title || p.id })),
    },
    { id: 'advertise', label: t.nav?.advertise || 'Advertise / List', items: [] },
    { id: 'about', label: t.nav?.about || 'About', items: [] },
    { id: 'contact', label: t.nav?.contact || 'Contact', items: [] },
    { id: 'language', label: t.nav?.language || 'Language', hint: 'Language button and translations', items: [] },
    { id: 'speed', label: 'Speed & smoothness', items: [] },
    { id: 'phone-view', label: 'Phone view', items: [] },
    { id: 'navigation', label: 'Menu & navigation', items: [] },
  ];
  return areas;
}

/** Every id a visitor can mark (areas + their cards). Used by the server to validate submissions. */
export const RATING_ITEM_IDS: Set<string> = new Set([
  'hero', 'hero-panel', 'jarvis-orb', 'hero-advert', 'hero-background',
  'jarvis', 'jarvis-voice', 'jarvis-chat', 'jarvis-languages',
  'timeline',
  ...timelineEras.flatMap((e) => [e.id, ...e.cards.map((c) => c.id)]),
  ...TECH_CATEGORIES.map((k) => `tech-${k}`),
  ...techCatalogue.map((c) => c.id),
  'places', ...placesData.map((p) => p.id),
  'projects', ...projectsData.map((p) => p.id),
  'advertise', 'about', 'contact', 'language', 'speed', 'phone-view', 'navigation',
]);

export const RATING_ISSUE_IDS: Set<string> = new Set(RATING_ISSUES.map((i) => i.id));

export const RATED_STORAGE_KEY = 'hayaati_rating_done';
