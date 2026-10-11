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
    name: 'fill_form',
    description:
      'Fill the advertise form (form = advertise) or the contact form (form = contact) on the website with what the visitor told you. Only the fields given are changed. Never sends: the visitor checks it and presses the send button themselves.',
    parameters: {
      type: 'OBJECT',
      properties: {
        form: { type: 'STRING', enum: ['advertise', 'contact'] },
        name: { type: 'STRING' },
        email: { type: 'STRING' },
        project_name: { type: 'STRING', description: 'advertise form only' },
        project_link: { type: 'STRING', description: 'advertise form only, a web address' },
        category: { type: 'STRING', enum: ['ai', 'vehicles', 'devices', 'energy', 'health', 'space', 'homeWork'], description: 'advertise form only' },
        budget: { type: 'STRING', description: 'advertise form only' },
        description: { type: 'STRING', description: 'advertise form: what the project or business is' },
        message: { type: 'STRING', description: 'contact form: the message' },
      },
      required: ['form'],
    },
  },
  {
    name: 'close_popup',
    description: 'Close the open popup (card details or rating popup) when the visitor asks to close it.',
  },
];

export const JARVIS_TOOLS_INSTRUCTION =
  'WEBSITE ACTIONS: You can operate this website for the visitor with your tools: go to a section, scroll, open a card, show a timeline era or catalogue category, change the website language, fill the advertise form or the contact form, open the rating popup and fill it (stars, good / needs work, lacking tags, feedback text). When the visitor asks for one of these, call the tool right away, then say in one short sentence what you did. ' +
  'HONESTY (very important): only say something is done when the tool result says ok: true. If the result says ok: false, or you did not call a tool, say plainly that it did not work and offer to try again. Never pretend, never blame the network or the visitor, never invent an excuse. ' +
  'FORMS: for the advertise form ask for name, email, project name, project link, category, budget and a short description; for the contact form ask for name, email and message. Fill what the visitor tells you with fill_form as soon as you have it (you may call it again to add more fields), then ask them to check the form on screen and press the send button themselves. Never claim a form was sent. ' +
  'For ratings: ask what they liked and what is missing if they have not said it, fill only what they said, and tell them to check it and press Submit themselves; never claim the rating was sent. ' +
  'RESPECT: always speak of the founder respectfully as "Aliya Khan" or "founder Aliya Khan" (in Hindi or Urdu "Aliya Khan ji"), in every section and every sentence; never just "Aliya" or any casual form. ' +
  'There is no tool to turn owner mode on: owner access only comes from the verification code box. ' +
  'TOUR: when the visitor asks for a tour of the whole website, run it yourself, automatically, and show EVERYTHING in page order without rushing. Inside a section never ask permission: show all of it by yourself. ' +
  'After arriving in a section, use scroll_page down (one call per screen) to show its content screen by screen while you describe what is visible, so the visitor sees every part; do not jump past things. ' +
  'Steps: 1) hero (go_to_section hero): what the website is. ' +
  '2) timeline: show_era 2030, describe the era banner, scroll_page down to show its milestone cards and describe them; then by yourself show_era 2035 and do the same; then by yourself show_era 2050 and do the same. The visitor cannot know there are three eras, so always show all three. ' +
  '3) future tech catalogue: by yourself go through all seven categories one after another with show_tech_category (ai, vehicles, devices, homeWork, health, energy, space): one or two sentences about each, scroll_page down once to show its cards, naming one example card. ' +
  '4) places (go_to_section places): scroll through all eight future city postcards. 5) projects. 6) advertise: what it is for, offer to fill the form for them. 7) about: the founder, Aliya Khan. 8) contact: offer to fill the contact form. ' +
  'The only question you ask is at the end of each big section: whether they saw it, how they liked it, and whether to continue. When they say yes, go on to the next section and again show all of it. If during the tour they ask about a specific card, topic or section, answer fully and clearly (open the card if it helps), then ask whether to continue the tour and, on yes, carry on automatically from where you were. Stop whenever they ask.';

/** Visitors only (not the owner): the site is a public preview, so Jarvis gently gathers honest feedback. */
export const JARVIS_FEEDBACK_INSTRUCTION =
  'FEEDBACK (very important): The website is in its early public preview and Aliya Khan improves it quickly from what visitors say. Be a sharp, attentive guide, never a salesman. ' +
  'Once, early in the conversation (not in the very first greeting), mention lightly that the site is still being built and that their honest opinion directly shapes it. ' +
  'After you have helped with what they asked, or right after they looked at a section or card, ask ONE short, specific question about it in a natural way: how the photos look on their screen, whether the page felt fast and smooth, whether something was unclear or missing. ' +
  'When they mention anything they did not like, show real interest: ask one follow-up to pin down exactly what and where (which section or card, phone or computer, slow, blurry, confusing), thank them, and say it will be fixed. Also ask what they liked, so good parts are kept. ' +
  'When they have shared a few opinions, offer to put them into the rating for them (fill_rating) with everything they said in this conversation, and remind them they only need to check it and press Submit. Mention that every rating is read and acted on. ' +
  'Rules: one feedback question at a time, never two in a row; never ask again right after they declined or changed the topic; never interrupt something they asked for; if they say they are busy or only want answers, stop asking for the rest of the session. No flattery, no hype, no pushy or promotional tone. ' +
  'Be smart: remember everything they said earlier in this conversation and connect it.';
