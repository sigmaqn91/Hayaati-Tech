// Regression checks for the Premium Tour (run: npm run test:premium-tour).
// Runs the real tour logic (lib/jarvisTour.ts) and the real tour prompt (buildTourInstruction) with a fake clock and
// a minimal fake page, so every stop Gemini Live would receive can be checked. No voice, no network.
import assert from 'node:assert/strict';

const g = globalThis as any;
let now = 1_000_000;
Date.now = () => now;
const page = { documentElement: { lang: 'en' }, querySelector: () => null, getElementById: () => null, querySelectorAll: () => [] };

import { defaultBundle, loadLanguageBundle } from '@/locales';
import { techCatalogue } from '@/data/future';
import { HINDI_PREMIUM_TOUR_STYLE, TOUR_TONE_RULE, JARVIS_LANGS } from '@/lib/jarvisLocale';
import { buildTourInstruction, buildTourOpening } from '@/components/jarvis/useJarvisVoice';
import { beginTour, tourNext, endTour, hindiPremiumTour, type TourMode } from '@/lib/jarvisTour';

const DEVANAGARI = /[ऀ-ॿ]/;
let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (e) {
    failures += 1;
    console.log(`FAIL  ${name}\n      ${(e as Error).message.split('\n').join('\n      ')}`);
  }
}

interface Stop {
  step: string;
  key: string;
  seconds: number;
  response: Record<string, any>;
}

/** Runs a whole tour. Each stop lasts (asked seconds x factor) + gap seconds; the intro takes `intro` seconds. */
async function runTour(mode: TourMode, lang: string, factor = 1, gap = 2, intro = 25) {
  g.window = { dispatchEvent() {}, innerHeight: 900, scrollY: 0, scrollTo() {}, setTimeout: () => 0, clearTimeout() {}, history: {} };
  g.CustomEvent = class {};
  g.Image = class {
    decode() {
      return Promise.resolve();
    }
  };
  g.document = page;
  page.documentElement.lang = lang;
  await loadLanguageBundle(lang as any);
  now = 1_000_000;
  beginTour(mode, mode === 'full' ? 840 : 240, lang);
  await new Promise((r) => setTimeout(r, 50));
  now += intro * 1000;
  const stops: Stop[] = [];
  let finished: Record<string, any> | null = null;
  let hindiFlags = 0;
  for (let i = 0; i < 100; i++) {
    if (hindiPremiumTour()) hindiFlags += 1;
    const s = tourNext();
    const r = s.response as Record<string, any>;
    if (s.finished) {
      finished = r;
      break;
    }
    const m = String(r.what_to_do_now).match(/about (\d+) seconds/);
    const seconds = m ? Number(m[1]) : 0;
    s.show();
    stops.push({ step: String(r.step), key: String(r.showing), seconds, response: r });
    now += (seconds * factor + gap) * 1000;
  }
  endTour();
  return { stops, finished, hindiFlags, endedAt: Math.round((now - 1_000_000) / 1000) };
}

const stepNo = (s: Stop) => Number(s.step.split(' of ')[0]);
const isFounder = (s: Stop) => s.key.startsWith('About the founder');
const isContact = (s: Stop) => s.key.startsWith('Contact');

(async () => {
  // 1-2. Canonical English titles of all 42 catalogue cards.
  check('42 catalogue cards, each with a real English title', () => {
    assert.equal(techCatalogue.length, 42);
    for (const c of techCatalogue) {
      const t = defaultBundle.content.techCards[c.id]?.title || '';
      assert.ok(t.length > 3, `${c.id}: empty title`);
      assert.ok(!t.includes('//') && !DEVANAGARI.test(t), `${c.id}: not a real English title: ${t}`);
    }
  });

  // 3-4. The prompt Gemini Live gets.
  const hiFull = buildTourInstruction('hi', 'full', '');
  check('Hindi Premium Tour prompt has the Hinglish policy', () => {
    assert.ok(hiFull.includes(HINDI_PREMIUM_TOUR_STYLE));
    assert.ok(hiFull.includes('speak natural Hinglish'));
  });
  check('Hindi Premium Tour prompt has none of the conflicting lines', () => {
    assert.ok(!hiFull.includes(JARVIS_LANGS.hi.style), 'general Hindi style still present');
    assert.ok(!hiFull.includes(TOUR_TONE_RULE), 'shared tour tone still present');
    assert.ok(!hiFull.includes('speak only Hindi'), '"speak only Hindi" still present');
    assert.ok(!hiFull.includes('Short natural sentences'), '"Short natural sentences" still present');
  });
  check('Quick Tour and other languages keep their prompt', () => {
    for (const [code, mode] of [['hi', 'quick'], ['en', 'full'], ['fr', 'full'], ['ur', 'full']] as const) {
      const p = buildTourInstruction(code, mode, '');
      assert.ok(!p.includes(HINDI_PREMIUM_TOUR_STYLE), `${code}/${mode} got the Hindi policy`);
      assert.ok(p.includes(TOUR_TONE_RULE), `${code}/${mode} lost the tour tone`);
      assert.ok(p.includes(`speak only ${JARVIS_LANGS[code].name}`), `${code}/${mode} lost its language line`);
    }
  });

  // Hindi Premium Tour at the planned pace.
  const hi = await runTour('full', 'hi', 1, 2);
  const cards = hi.stops.filter((s) => s.response.title_english !== undefined);
  check('Hindi Premium Tour: all 51 stops once, in order, then a normal finish', () => {
    assert.deepEqual(hi.stops.map(stepNo), Array.from({ length: 51 }, (_, i) => i + 1));
    assert.equal(hi.finished?.reason, 'all stops are done');
  });
  check('Hindi Premium Tour: every card gets its official English title', () => {
    assert.equal(cards.length, 42);
    const want = techCatalogue.map((c) => defaultBundle.content.techCards[c.id].title).sort();
    assert.deepEqual(cards.map((s) => s.response.title_english).sort(), want);
    for (const s of cards) assert.ok(!('card_title' in s.response), `${s.step}: Hindi card_title still sent`);
  });
  check('Hindi Premium Tour: no formal Hindi text reaches Jarvis in any stop', () => {
    for (const s of hi.stops) {
      const { what_to_do_now, section_name, ...facts } = s.response;
      assert.ok(!DEVANAGARI.test(JSON.stringify(facts)), `${s.step} (${s.key}) carries Hindi text`);
    }
  });
  check('Hindi Premium Tour: cards are not stretched (at most 20 s each)', () => {
    for (const s of cards) assert.ok(s.seconds <= 20, `${s.step}: ${s.seconds} s`);
  });
  check('Hindi Premium Tour: era of each card and milestones already shown are passed on', () => {
    assert.ok(cards.every((s) => /^20\d\d$/.test(s.response.era_of_this_technology)));
    const taxi = cards.find((s) => s.response.title_english === 'Autonomous Urban Sky Taxi');
    assert.equal(taxi?.response.already_shown_as_milestone_of_era, '2030');
  });

  // Speaking experience: transitions, era feelings, opening, ending (what Jarvis is told; not how it sounds).
  check('Hindi Premium Tour: every stop knows what really comes next (for a teaser)', () => {
    hi.stops.forEach((s, i) => {
      const next = hi.stops[i + 1];
      const want = !next
        ? 'the end of the tour'
        : next.response.era_on_screen
          ? `the ${next.response.era_on_screen} era`
          : next.response.title_english || next.response.section_name;
      assert.ok(String(s.response.coming_next).includes(want), `${s.step}: coming_next "${s.response.coming_next}" but next is "${want}"`);
    });
  });
  check('Hindi Premium Tour: each era has its own feeling', () => {
    const moods = hi.stops.filter((s) => s.response.era_on_screen).map((s) => s.response.mood_of_this_era);
    assert.equal(moods.length, 3);
    assert.equal(new Set(moods).size, 3);
  });
  check('Hindi Premium Tour: no fixed card shape or stock transition in what Jarvis is told', () => {
    const banned = [/how it could make our life better/i, /what it is and how it works/i, /aage badhte/i, /move on/i, /ab hum dekhte/i, /Lead with/];
    for (const s of hi.stops) for (const b of banned) assert.ok(!b.test(String(s.response.what_to_do_now)), `${s.step}: ${b}`);
    const p = hiFull;
    for (const rule of ['DELIVERY', 'TRANSITIONS AND ENDINGS OF A STOP', 'WAYS OF TELLING', 'NEVER REPEAT']) assert.ok(p.includes(rule), `policy lacks ${rule}`);
  });
  check('Hindi Premium Tour: opening hook and journey-style ending', () => {
    const open = buildTourOpening('hi', 'full');
    assert.ok(open.includes('make them curious') && open.includes('ONLY their name'));
    assert.ok(String(hi.finished?.what_to_do_now).includes('looks back on the journey'));
  });
  check('Hand-over timing change is limited to the Hindi Premium Tour', () => {
    assert.ok(hi.hindiFlags > 40, 'not active during the Hindi Premium Tour');
  });

  // 7-9. Founder before contact, also when the tour runs late.
  check('Premium Tour plan: places, projects, advertise, founder, contact at the end', () => {
    assert.deepEqual(
      hi.stops.slice(-5).map((s) => s.key.split(/[ :(]/)[0]),
      ['Cities', 'My', 'Advertise', 'About', 'Contact']
    );
  });
  for (const [lang, factor, gap] of [
    ['hi', 1.5, 2.5],
    ['hi', 1.8, 3],
    ['en', 1.5, 2.5],
    ['en', 2.2, 3],
  ] as const) {
    const late = await runTour('full', lang, factor, gap);
    check(`Premium Tour (${lang}) running late x${factor}: founder shown before contact, tour finishes normally`, () => {
      const f = late.stops.findIndex(isFounder);
      const c = late.stops.findIndex(isContact);
      assert.ok(f >= 0, `founder skipped: ${late.stops.slice(-4).map((s) => s.key.slice(0, 20)).join(' | ')}`);
      assert.ok(c > f, 'contact not after founder');
      assert.equal(c, late.stops.length - 1, 'contact is not the last stop');
      assert.equal(late.finished?.reason, 'all stops are done');
      const nums = late.stops.map(stepNo);
      assert.ok(nums.every((n, i) => i === 0 || n > nums[i - 1]), 'a stop was repeated');
    });
  }

  // 5-6. Quick Tour and non-Hindi Premium Tour stops.
  const quick = await runTour('quick', 'hi', 1, 0.7, 15);
  check('Quick Tour (Hindi): unchanged stops and wording', () => {
    assert.equal(quick.stops.length, 10);
    assert.ok(quick.stops.at(-1)!.key.startsWith('About the founder'));
    for (const s of quick.stops) {
      assert.ok(!('title_english' in s.response) && !('on_screen_in_english' in s.response));
      assert.ok(String(s.response.what_to_do_now).includes('Speak for about'));
    }
    const card = quick.stops.find((s) => s.response.card_title);
    assert.ok(card && DEVANAGARI.test(card.response.card_title), 'Quick Tour card title should stay the site title');
  });
  check('Quick Tour and non-Hindi Premium Tour keep their opening message', () => {
    assert.equal(
      buildTourOpening('hi', 'quick'),
      '[SYSTEM] The visitor pressed the Quick Tour button. In one or two short sentences in everyday Hindi (start with "नमस्ते!" (Namaste)), welcome them to a quick three-minute tour of the highlights, then ask ONLY their name, nothing else. After their answer, or if they stay silent, call tour_next.'
    );
    assert.equal(
      buildTourOpening('fr', 'full'),
      '[SYSTEM] The visitor pressed the Premium Full Tour button. Greet them now in everyday French (start with "Bonjour !"), welcome them warmly to the full tour of Hayaati Web Technology, then ask ONLY their name, nothing else (no other question about interests, preferences or who they are). After their answer, or if they stay silent, call tour_next.'
    );
  });
  assert.equal(quick.hindiFlags, 0);
  const fr = await runTour('full', 'fr', 1, 2);
  check('Non-Hindi Premium Tour keeps the old hand-over timing', () => assert.equal(fr.hindiFlags, 0));
  check('Premium Tour (French): no Hindi-only changes', () => {
    assert.equal(fr.stops.length, 51);
    for (const s of fr.stops) {
      assert.ok(!('title_english' in s.response) && !('on_screen_in_english' in s.response));
      assert.ok(String(s.response.what_to_do_now).includes('Speak for about'));
    }
  });

  console.log(`\nHindi Premium Tour at planned pace ends after ${hi.endedAt} s (limit 840 s).`);
  console.log(failures ? `${failures} check(s) failed` : 'All checks passed');
  process.exit(failures ? 1 : 0);
})();
