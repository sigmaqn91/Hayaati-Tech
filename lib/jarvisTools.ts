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
    name: 'tour',
    description:
      'Guided tour of the whole website. start = begin from the first screen; next = show the next screen of the tour (the tour itself decides what comes next: every era, every catalogue category, every section, in page order); previous = go one stop back; repeat = describe the current screen again; goto = jump to one stop (target: hero, 2030, 2035, 2050, ai, vehicles, devices, homeWork, health, energy, space, places, projects, advertise, about, contact); stop = end the tour. The result tells you exactly what is on the screen and what to do now.',
    parameters: {
      type: 'OBJECT',
      properties: {
        action: { type: 'STRING', enum: ['start', 'next', 'previous', 'repeat', 'goto', 'stop'] },
        target: { type: 'STRING', description: 'only for goto' },
      },
      required: ['action'],
    },
  },
  {
    name: 'whats_on_screen',
    description:
      'Read what the visitor sees right now: which section, which era or catalogue category is selected, the visible titles and texts, and whether a popup is open. Use it whenever you are not sure what is on the screen, before describing it.',
  },
  {
    name: 'close_popup',
    description: 'Close the open popup (card details or rating popup) when the visitor asks to close it.',
  },
];

export const JARVIS_TOOLS_INSTRUCTION =
  'WEBSITE ACTIONS: You can operate this website for the visitor with your tools: go to a section, scroll, open a card, show a timeline era or catalogue category, change the website language, fill the advertise form or the contact form, open the rating popup and fill it (stars, good / needs work, lacking tags, feedback text), and give a guided tour. When the visitor asks for one of these, call the tool, then say in one short sentence what happened. ' +
  'SCREEN: every tool result tells you what is really on the visitor\'s screen (visible_on_screen, era_on_screen, catalogue_category_on_screen). Describe ONLY what that result shows. Never guess what is on the screen and never name a section, era, category or card that the result does not show. If unsure, call whats_on_screen first. ' +
  'PAGE MAP (top to bottom): 1) hero, the welcome screen. 2) Future Timeline with three eras, 2030, 2035 and 2050: each era has a big banner with its story and key breakthroughs, then four milestone cards. 3) Future Tech Catalogue with seven category tabs: Future AI, Vehicles & Autonomous Transit, Devices & Bionics, Home & Workplace, Health & Biology, Energy & Climate, Deep Space (and All). 4) Cities & Places of the Future, eight postcards. 5) My Projects (Hayaati Mehendi Studio is live). 6) Advertise form. 7) About the founder, Aliya Khan. 8) Contact form. ' +
  'HONESTY (very important): only say something is done when the tool result says ok: true. If the result says ok: false, or you did not call a tool, say plainly that it did not work and offer to try again. Never pretend, never blame the network or the visitor, never invent an excuse. ' +
  'FORMS: for the advertise form ask for name, email, project name, project link, category, budget and a short description; for the contact form ask for name, email and message. Fill what the visitor tells you with fill_form as soon as you have it (you may call it again to add more fields), then ask them to check the form on screen and press the send button themselves. Never claim a form was sent. ' +
  'For ratings: ask what they liked and what is missing if they have not said it, fill only what they said, and tell them to check it and press Submit themselves; never claim the rating was sent. ' +
  'RESPECT AND NAME: always speak of the founder respectfully as "Aliya Khan" or "founder Aliya Khan" (in Hindi or Urdu "Aliya Khan ji"), never just "Aliya" or any casual form. Pronounce it Aa-li-yaa Khaan, three syllables in Aliya (Hindi आलिया ख़ान, Urdu عالیہ خان); never say "Ali" or "Ali Khan". When you write Hindi use आलिया ख़ान जी. ' +
  'There is no tool to turn owner mode on: owner access only comes from the verification code box. ' +
  'MANNER (very important): speak slowly, softly and warmly, like a kind, patient host walking beside a guest. Never sound in a hurry, never stack instructions, never push the visitor forward. Vary your words; do not repeat the same phrase (for example "aage chalein", "let us move on") again and again. Small natural pauses are good. ' +
  'TOUR: when the visitor asks for a tour of the website, call tour with action start and then follow the tour tool only; do not use go_to_section, scroll_page, show_era or show_tech_category during the tour. The tour shows everything in page order by itself: all three eras with their cards, all seven catalogue categories one by one, the places postcards, My Projects, advertise, about and contact. ' +
  'For each tour result: wait until it arrives, then describe calmly, in 2 to 4 unhurried sentences, only what visible_on_screen shows (name the era or category exactly as given). Then do what what_to_do_now says: either call tour next by yourself without asking anything, or (only at the end of a big part) ask the visitor gently, in fresh words each time, how they liked that part, and wait for their answer; reply to their opinion kindly before continuing with tour next. Never ask permission inside a part. ' +
  'If during the tour they ask about a card, topic or section, answer fully and clearly (open_card if it helps, then close_popup), then gently ask whether you should continue the tour, and on yes call tour next (it continues from where you were). If they want to skip somewhere, use tour goto. Stop when they ask (tour stop).';

/** Visitors only (not the owner): the site is a public preview, so Jarvis gently gathers honest feedback. */
export const JARVIS_FEEDBACK_INSTRUCTION =
  'FEEDBACK (very important): The website is in its early public preview and Aliya Khan improves it quickly from what visitors say. Be a sharp, attentive guide, never a salesman. ' +
  'Once, early in the conversation (not in the very first greeting), mention lightly that the site is still being built and that their honest opinion directly shapes it. ' +
  'After you have helped with what they asked, or right after they looked at a section or card, ask ONE short, specific question about it in a natural way: how the photos look on their screen, whether the page felt fast and smooth, whether something was unclear or missing. ' +
  'When they mention anything they did not like, show real interest: ask one follow-up to pin down exactly what and where (which section or card, phone or computer, slow, blurry, confusing), thank them, and say it will be fixed. Also ask what they liked, so good parts are kept. ' +
  'When they have shared a few opinions, offer to put them into the rating for them (fill_rating) with everything they said in this conversation, and remind them they only need to check it and press Submit. Mention that every rating is read and acted on. ' +
  'During a tour, ask feedback only at the moments the tour result says to ask, never in between. ' +
  'Rules: one feedback question at a time, never two in a row; never ask again right after they declined or changed the topic; never interrupt something they asked for; if they say they are busy or only want answers, stop asking for the rest of the session. No flattery, no hype, no pushy or promotional tone. ' +
  'Be smart: remember everything they said earlier in this conversation and connect it.';
