// Jarvis localisation: for every website language, the greeting real people use when they meet,
// and how ordinary people actually speak it (not textbook / "shuddh" / machine-translated language).

import { detectCountry } from '@/lib/geoLanguage';

interface LangProfile {
  /** English name of the language (for the model). */
  name: string;
  /** Greeting used at the start, in the language's own script with a romanised hint. */
  greeting: string;
  /** How real people speak it day to day. */
  style: string;
  /** Optional country-specific greeting overrides (ISO country code -> greeting). */
  greetingByCountry?: Record<string, string>;
  /** Optional country-specific style notes. */
  styleByCountry?: Record<string, string>;
}

const EVERYDAY =
  'Use simple, warm, everyday words exactly as native speakers really talk to a friendly helper. Short sentences, natural contractions and fillers where normal. Never stiff, bookish, overly formal or machine-translated.';

export const JARVIS_LANGS: Record<string, LangProfile> = {
  en: {
    name: 'English',
    greeting: '"Hi!" or "Hello!"',
    style: `${EVERYDAY} Casual, friendly English.`,
    styleByCountry: { GB: 'Use British English.', AU: 'Use Australian English.', IN: 'Use simple Indian English.' },
  },
  hi: {
    name: 'Hindi',
    greeting: '"नमस्ते!" (Namaste)',
    style:
      'Speak everyday spoken Hindi (Hindustani) exactly the way ordinary people in India talk at home and on the street, like a friendly person from Delhi or Mumbai. Keep the common English words Indians normally use in Hindi as English (website, technology, project, help, online, future, app, phone, problem, time, idea, design, etc.). NEVER use shuddh / literary / Sanskritised Hindi: do not say words like "sahayata", "prastut", "nirmit", "sanchalit", "pratiksha", "kripya", "uplabdh", "avashyakta", "bhavishya mein" when everyday words exist ("madad", "dikhata hoon", "banaya", "chalta hai", "wait", "please", "milta hai", "zaroorat", "aage chal ke"). Sentences short and friendly. Do not speak full English sentences.',
  },
  ur: {
    name: 'Urdu',
    greeting: '"السلام علیکم" (As-salaam-o-alaikum, said fully and clearly: as-sa-LAA-mu a-LAI-kum)',
    style:
      'Speak everyday spoken Urdu exactly as ordinary people in Pakistan and India talk: simple and warm. Keep common English tech words in English (website, technology, project, app, online). Avoid heavy Persianised / literary Urdu. Do not speak full English sentences.',
  },
  ar: {
    name: 'Arabic',
    greeting: '"السلام عليكم" (As-salāmu ʿalaykum, said fully: as-sa-LAA-mu a-LAI-kum), and reply "وعليكم السلام" (Wa ʿalaykum as-salām) if they greet you first',
    style:
      'Speak simple, friendly, modern spoken Arabic that everyday people use (the easy "white" Arabic understood everywhere), not heavy classical Fusha. Common tech words like "website" or "app" may stay in English.',
    styleByCountry: {
      SA: 'Lean towards everyday Saudi / Gulf (Khaleeji) wording while staying easy to understand.',
      AE: 'Lean towards everyday Gulf (Khaleeji) wording while staying easy to understand.',
      QA: 'Lean towards everyday Gulf (Khaleeji) wording while staying easy to understand.',
      KW: 'Lean towards everyday Gulf (Khaleeji) wording while staying easy to understand.',
      BH: 'Lean towards everyday Gulf (Khaleeji) wording while staying easy to understand.',
      OM: 'Lean towards everyday Gulf (Khaleeji) wording while staying easy to understand.',
      EG: 'Lean towards everyday Egyptian wording while staying easy to understand.',
      JO: 'Lean towards everyday Levantine wording while staying easy to understand.',
      LB: 'Lean towards everyday Levantine wording while staying easy to understand.',
      SY: 'Lean towards everyday Levantine wording while staying easy to understand.',
      PS: 'Lean towards everyday Levantine wording while staying easy to understand.',
      MA: 'Keep it in easy pan-Arab wording (Moroccans also understand it well).',
    },
  },
  bn: {
    name: 'Bengali',
    greeting: '"নমস্কার!" (Nomoshkar)',
    greetingByCountry: { BD: '"আসসালামু আলাইকুম" (As-salāmu ʿalaykum, said fully and clearly)' },
    style: `Speak everyday spoken Bangla (cholito bhasha) as people really talk, never sadhu bhasha or bookish words. Common English tech words stay English. ${EVERYDAY}`,
  },
  pa: {
    name: 'Punjabi',
    greeting: '"ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ!" (Sat Sri Akal ji)',
    greetingByCountry: { PK: '"السلام علیکم" (As-salāmu ʿalaykum, said fully and clearly)' },
    style: `Speak everyday, warm spoken Punjabi the way people in Punjab really talk. Common English tech words stay English. ${EVERYDAY}`,
  },
  mr: {
    name: 'Marathi',
    greeting: '"नमस्कार!" (Namaskar)',
    style: `Speak everyday spoken Marathi as people in Mumbai and Pune really talk, not bookish/pramaan Marathi. Common English tech words stay English. ${EVERYDAY}`,
  },
  gu: {
    name: 'Gujarati',
    greeting: '"નમસ્તે! કેમ છો?" (Namaste, kem cho?)',
    style: `Speak everyday spoken Gujarati as people really talk at home. Common English tech words stay English. ${EVERYDAY}`,
  },
  ta: {
    name: 'Tamil',
    greeting: '"வணக்கம்!" (Vanakkam)',
    style: `Speak everyday spoken Tamil (pechu vazhakku) as people really talk, not formal written / senthamizh style. Common English tech words stay English. ${EVERYDAY}`,
  },
  te: {
    name: 'Telugu',
    greeting: '"నమస్కారం!" (Namaskaram)',
    style: `Speak everyday spoken Telugu as people really talk, not grandhika/bookish Telugu. Common English tech words stay English. ${EVERYDAY}`,
  },
  kn: {
    name: 'Kannada',
    greeting: '"ನಮಸ್ಕಾರ!" (Namaskara)',
    style: `Speak everyday spoken Kannada as people in Bengaluru really talk, not bookish. Common English tech words stay English. ${EVERYDAY}`,
  },
  ml: {
    name: 'Malayalam',
    greeting: '"നമസ്കാരം!" (Namaskaram)',
    style: `Speak everyday spoken Malayalam as people in Kerala really talk, not bookish. Common English tech words stay English. ${EVERYDAY}`,
  },
  ne: {
    name: 'Nepali',
    greeting: '"नमस्ते!" (Namaste)',
    style: `Speak everyday spoken Nepali as people in Kathmandu really talk, not bookish. Common English tech words stay English. ${EVERYDAY}`,
  },
  vi: {
    name: 'Vietnamese',
    greeting: '"Xin chào!" (with the natural polite "ạ" when fitting)',
    style: `${EVERYDAY} Friendly, polite everyday Vietnamese.`,
  },
  fr: {
    name: 'French',
    greeting: '"Bonjour !"',
    style: `${EVERYDAY} Natural spoken French (polite "vous", but light and friendly).`,
    styleByCountry: { CA: 'Use Canadian French wording where natural.' },
  },
  de: {
    name: 'German',
    greeting: '"Hallo!"',
    style: `${EVERYDAY} Natural, friendly spoken German (casual "du" like modern tech brands).`,
    styleByCountry: { AT: 'A light Austrian touch is welcome ("Servus" is fine as greeting).', CH: 'Use standard German that Swiss people find natural ("Grüezi" is fine as greeting).' },
  },
  es: {
    name: 'Spanish',
    greeting: '"¡Hola!"',
    style: `${EVERYDAY} Natural spoken Spanish with "tú".`,
    styleByCountry: {
      ES: 'Use Spain Spanish.',
      MX: 'Use Mexican Spanish wording.',
      AR: 'Use Argentine Spanish (vos) wording.',
      CO: 'Use Colombian Spanish wording.',
    },
  },
  pt: {
    name: 'Portuguese',
    greeting: '"Olá!" / "Oi!"',
    style: `${EVERYDAY} Natural spoken Brazilian Portuguese with "você".`,
    styleByCountry: { PT: 'Use European Portuguese (Portugal) wording instead.', AO: 'Use European-style Portuguese wording.', MZ: 'Use European-style Portuguese wording.' },
  },
  it: {
    name: 'Italian',
    greeting: '"Ciao!"',
    style: `${EVERYDAY} Natural spoken Italian.`,
  },
  zh: {
    name: 'Chinese (Mandarin)',
    greeting: '"你好！" (Nǐ hǎo)',
    style: `${EVERYDAY} Natural spoken Mandarin as used in daily life.`,
    styleByCountry: { TW: 'Use Taiwan Mandarin wording.', HK: 'Keep Mandarin but with Hong Kong-friendly wording.' },
  },
  ja: {
    name: 'Japanese',
    greeting: '"こんにちは！" (Konnichiwa)',
    style: `${EVERYDAY} Friendly polite desu/masu Japanese, not stiff keigo.`,
  },
  ko: {
    name: 'Korean',
    greeting: '"안녕하세요!" (Annyeonghaseyo)',
    style: `${EVERYDAY} Friendly polite 해요체 Korean.`,
  },
  ru: {
    name: 'Russian',
    greeting: '"Здравствуйте!" (or a friendly "Привет!" for a casual visitor)',
    style: `${EVERYDAY} Natural spoken Russian, polite "вы" but warm.`,
  },
  tr: {
    name: 'Turkish',
    greeting: '"Merhaba!" (or "Hoş geldiniz!" - welcome)',
    style: `${EVERYDAY} Natural, friendly spoken Turkish.`,
  },
  id: {
    name: 'Indonesian',
    greeting: '"Halo!" / "Selamat datang!"',
    style: `${EVERYDAY} Natural everyday Indonesian (bahasa sehari-hari), not stiff formal baku.`,
  },
  nl: {
    name: 'Dutch',
    greeting: '"Hoi!" / "Hallo!"',
    style: `${EVERYDAY} Natural spoken Dutch with "je".`,
    styleByCountry: { BE: 'Use Flemish-friendly wording.' },
  },
  pl: {
    name: 'Polish',
    greeting: '"Cześć!" / "Dzień dobry!"',
    style: `${EVERYDAY} Natural, friendly spoken Polish.`,
  },
  fa: {
    name: 'Persian',
    greeting: '"سلام!" (Salaam) or the warmer "سلام، خوش آمدید!" (Salaam, khosh amadid)',
    style: `${EVERYDAY} Natural everyday spoken Persian (mohavere), not formal written ketabi style.`,
    styleByCountry: { AF: 'Use Dari wording that Afghans find natural.' },
  },
  th: {
    name: 'Thai',
    greeting: '"สวัสดี" (Sawasdee) with the natural polite ending',
    style: `${EVERYDAY} Natural, polite everyday Thai.`,
  },
  sw: {
    name: 'Swahili',
    greeting: '"Hujambo!" / "Habari yako?" (or the casual "Jambo!")',
    style: `${EVERYDAY} Natural everyday Swahili as spoken in Kenya and Tanzania.`,
  },
};

export function getJarvisLang(code: string, country: string | null = detectCountry()) {
  const p = JARVIS_LANGS[code] || JARVIS_LANGS.en;
  const greeting = (country && p.greetingByCountry?.[country]) || p.greeting;
  const countryStyle = country && p.styleByCountry?.[country] ? ` ${p.styleByCountry[country]}` : '';
  return { name: p.name, greeting, style: p.style + countryStyle, country };
}

/** Say every greeting completely and correctly (Salam was coming out as "Assala walekum"). */
export const GREETING_PRONUNCIATION_RULE =
  'GREETING PRONUNCIATION (very important): Say the greeting completely, clearly and correctly, every syllable, at a calm pace, exactly as native speakers say it with respect - never shortened, slurred or mispronounced. The Islamic greeting must be said fully as "As-salāmu ʿalaykum" (as-sa-LAA-mu a-LAI-kum) - never "Assala walekum", "Slaam walekum" or "Salamalekum"; its reply is "Wa ʿalaykum as-salām". "Sat Sri Akal" must be said fully (sat-sree-a-KAAL). "Namaste" / "Namaskar" / "Vanakkam" must be said clearly with the correct stress. Each of the 30 languages uses its own natural greeting given above.';

/** Name-based greeting rule (respect for every faith/culture), shared by every language. */
export const NAME_GREETING_RULE =
  'NAMES & RESPECT: When the visitor tells you their name, warmly use it and greet them back the way people of that name\'s culture usually greet each other, if the name clearly shows it: typical Muslim names (e.g. Aamir, Asad, Ayesha, Imran, Fatima) -> "As-salāmu ʿalaykum, <name>" (said fully and correctly); typical Hindu names (e.g. Rajkumar, Sonu Kumar, Priya, Rahul) -> "Namaste <name> ji"; typical Sikh/Punjabi names (e.g. Gurpreet, Harjeet Singh, Simran Kaur) -> "Sat Sri Akal <name> ji"; typical Christian names -> a warm "Hello <name>". Say this greeting in the CURRENT website language. If you are not sure, simply use the normal greeting of the current language. Never say or guess the visitor\'s religion or caste out loud, never comment on it, and treat every faith with equal respect. If a visitor greets you with "As-salāmu ʿalaykum" (in any form), answer "Wa ʿalaykum as-salām"; if with "Namaste", answer "Namaste"; if with "Sat Sri Akal", answer "Sat Sri Akal".';

/** Short spoken acknowledgement while a typed question is being answered (fallback text path). */
export const QUICK_ACK: Record<string, string> = {
  en: 'Got it, one moment.',
  hi: 'Samajh gaya, ek second.',
  ur: 'Samajh gaya, ek second.',
  ar: 'تمام، لحظة من فضلك.',
  bn: 'বুঝেছি, এক সেকেন্ড।',
  pa: 'ਸਮਝ ਗਿਆ, ਇੱਕ ਸਕਿੰਟ।',
  mr: 'समजलं, एक सेकंद.',
  gu: 'સમજાઈ ગયું, એક સેકન્ડ.',
  ta: 'புரிஞ்சுது, ஒரு நொடி.',
  te: 'అర్థమైంది, ఒక్క సెకను.',
  kn: 'ಅರ್ಥ ಆಯ್ತು, ಒಂದು ಸೆಕೆಂಡ್.',
  ml: 'മനസ്സിലായി, ഒരു സെക്കൻഡ്.',
  ne: 'बुझेँ, एक सेकेन्ड।',
  vi: 'Hiểu rồi, chờ chút nhé.',
  fr: 'Compris, une seconde.',
  de: 'Alles klar, einen Moment.',
  es: 'Entendido, un momento.',
  pt: 'Entendi, só um momento.',
  it: 'Capito, un attimo.',
  zh: '好的，稍等一下。',
  ja: 'わかりました、少々お待ちください。',
  ko: '알겠어요, 잠시만요.',
  ru: 'Понял, секунду.',
  tr: 'Anladım, bir saniye.',
  id: 'Oke, sebentar ya.',
  nl: 'Begrepen, een momentje.',
  pl: 'Jasne, chwileczkę.',
  fa: 'باشه، یک لحظه.',
  th: 'เข้าใจแล้ว รอสักครู่นะ',
  sw: 'Sawa, subiri kidogo.',
};
