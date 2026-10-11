// Website actions Jarvis may perform for a visitor (voice and typed chat).
// Shared by the browser (Gemini Live session) and the /api/chat route, so both know the same actions.
// Security: there is NO action that turns owner mode on. Owner mode turns on only with the
// verification code (checked on the server); Jarvis can only switch it off when the owner says goodbye.

import { languageList } from '@/locales';
import { RATING_ISSUES } from '@/lib/ratingCatalog';

export const JARVIS_SECTIONS = ['hero', 'timeline', 'tech', 'places', 'projects', 'advertise', 'about', 'contact'] as const;
export const JARVIS_TECH_CATEGORIES = ['all', 'ai', 'vehicles', 'devices', 'homeWork', 'health', 'energy', 'space'] as const;
export const JARVIS_ERAS = ['2030', '2035', '2050'] as const;

const RATING_AREA_IDS = [
  'hero', 'jarvis', 'timeline', 'tech-ai', 'tech-vehicles', 'tech-devices', 'tech-homeWork', 'tech-health',
  'tech-energy', 'tech-space', 'places', 'projects', 'advertise', 'about', 'contact', 'language', 'speed',
  'phone-view', 'navigation',
];

/** Gemini function declarations (plain JSON schema, works for Live and generateContent). */
export const JARVIS_FUNCTION_DECLARATIONS = [
  {
    name: 'go_to_section',
    description:
      'Scroll the website to a section when the visitor asks to see or go to it. hero = first screen, timeline = 2030/2035/2050 future timeline, tech = future tech catalogue, places = cities & places postcards, projects = My Projects, advertise = advertise form, about = about the founder, contact = contact.',
    parameters: {
      type: 'OBJECT',
      properties: { section: { type: 'STRING', enum: [...JARVIS_SECTIONS] } },
      required: ['section'],
    },
  },
  {
    name: 'scroll_page',
    description: 'Scroll the page when the visitor says scroll down, scroll up, go to top or go to the bottom.',
    parameters: {
      type: 'OBJECT',
      properties: { direction: { type: 'STRING', enum: ['down', 'up', 'top', 'bottom'] } },
      required: ['direction'],
    },
  },
  {
    name: 'open_card',
    description:
      'Open the detail popup of one card (timeline milestone card, future tech catalogue card or cities & places postcard). Give the card title as shown on the website; English title works best.',
    parameters: {
      type: 'OBJECT',
      properties: { card: { type: 'STRING', description: 'Card title, e.g. "Autonomous Urban Sky Taxi"' } },
      required: ['card'],
    },
  },
  {
    name: 'show_era',
    description: 'Show one era of the future timeline (2030, 2035 or 2050).',
    parameters: {
      type: 'OBJECT',
      properties: { era: { type: 'STRING', enum: [...JARVIS_ERAS] } },
      required: ['era'],
    },
  },
  {
    name: 'show_tech_category',
    description:
      'Show one category of the future tech catalogue: ai = Future AI, vehicles = Vehicles & Autonomous Transit, devices = Devices & Bionics, homeWork = Home & Workplace, health = Health & Biology, energy = Energy & Climate, space = Deep Space, all = every card.',
    parameters: {
      type: 'OBJECT',
      properties: { category: { type: 'STRING', enum: [...JARVIS_TECH_CATEGORIES] } },
      required: ['category'],
    },
  },
  {
    name: 'change_language',
    description:
      'Change the whole website language when the visitor clearly asks for it. Only use when explicitly requested.',
    parameters: {
      type: 'OBJECT',
      properties: {
        language: {
          type: 'STRING',
          enum: languageList.map((l) => l.code),
          description: languageList.map((l) => `${l.code} = ${l.name}`).join(', '),
        },
      },
      required: ['language'],
    },
  },
  {
    name: 'open_rating',
    description: 'Open the website rating popup (stars and feedback) when the visitor wants to rate or give feedback.',
  },
  {
    name: 'fill_rating',
    description:
      'Fill the rating popup for the visitor from what they told you: stars, which parts are good or need work, the "what is lacking" tags, and a short feedback text written from the problems they described (in their own language). The popup opens if needed. Never submits: the visitor checks it and presses Submit themselves. Only fill what the visitor actually said.',
    parameters: {
      type: 'OBJECT',
      properties: {
        stars: { type: 'INTEGER', description: '1 to 5' },
        good: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: `Parts the visitor liked. Area ids: ${RATING_AREA_IDS.join(', ')}; or a card title.`,
        },
        needs_work: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Parts the visitor did not like (same ids or card titles as "good").',
        },
        issues: {
          type: 'ARRAY',
          items: { type: 'STRING', enum: RATING_ISSUES.map((i) => i.id) },
          description: RATING_ISSUES.map((i) => `${i.id} = ${i.label}`).join(', '),
        },
        feedback: { type: 'STRING', description: 'Feedback text to type into the box, max 1500 characters.' },
        name: { type: 'STRING', description: 'Only if the visitor gave their name for the rating.' },
        email: { type: 'STRING', description: 'Only if the visitor gave their email for the rating.' },
      },
    },
  },
  {
    name: 'close_popup',
    description: 'Close the open popup (card details or rating popup) when the visitor asks to close it.',
  },
];

export const JARVIS_TOOLS_INSTRUCTION =
  'WEBSITE ACTIONS: You can operate this website for the visitor with your tools: go to a section, scroll, open a card, show a timeline era or catalogue category, change the website language, open the rating popup and fill it (stars, good / needs work, lacking tags, feedback text). When the visitor asks for one of these, call the tool right away, then say in one short sentence what you did. For ratings: ask what they liked and what is missing if they have not said it, fill only what they said, and tell them to check it and press Submit themselves; never claim the rating was sent. There is no tool to turn owner mode on: owner access only comes from the verification code box.';
