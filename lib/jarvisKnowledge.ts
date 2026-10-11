// Jarvis knowledge: what the website is, what is finished, what is still being built, and who the owner is.
// Two parts:
//   1. FIXED facts below (edit these lines whenever something changes).
//   2. A LIVE snapshot read from the open page at the moment Jarvis is activated (sections, hero text,
//      how many image frames show a real photo) - this updates itself automatically with the website.

import { projectsData } from '@/data/projects';

/** Owner details Jarvis may share with visitors. Only real facts: Jarvis must never invent anything. */
export const OWNER_FACTS: string[] = [
  'Name: Aliya Khan.',
  'Role: owner, founder and developer of Hayaati Web Technology. She designs and builds the website, its futuristic UI and the Jarvis assistant herself.',
  'Home: Kerala, India.',
  'Family: her father is a well-known, successful businessman.',
  // Fill in exactly as Aliya confirms (left empty on purpose so Jarvis never states a wrong degree/position):
  // 'Education: <her real degree / course>.',
  // 'Father: <his exact position, e.g. shareholder / Vice President of <company>>.',
  'Contact: Hayaati.Technology@gmail.com, website www.hayaatiweb.site.',
];

/** Current state of the website (update when work is finished). */
export const SITE_STATUS: string[] = [
  'The website is UNDER DEVELOPMENT. The banner at the top says "Under development - the full experience is being built, launching soon".',
  'It is already online (hosted on Vercel at www.hayaatiweb.site) on purpose, as an early public preview: visitors can already explore the design, try Jarvis, and Aliya keeps improving it live. The full official launch comes when all sections are complete.',
  'Finished and working now: the futuristic hero banner (3D orb, animated background, glass panel), Jarvis voice + chat assistant in 30 languages, the language selector (30 languages, opens in the visitor\'s country language), the 2030 / 2035 / 2050 timeline, the future tech catalogue, cities & places, advertise form, about and contact sections, and the animated advert under the hero.',
  'Still in progress: the "My Projects" list (no projects published yet), more animations, and final polishing.',
  'Real photos on the site right now: the hero background, all 3 era banners in the timeline, shown as the high-resolution originals (about 1895 by 830 pixels) in full original quality (2030: a green coastal city with tree-covered towers, wide walkways and driverless trams by the sea; 2035: a city built around cliffs and waterfalls with garden terraces, a raised glass train line and boats on a calm bay; 2050: a large ring-shaped space station with solar panels high above the Earth; the era banner has its own special, richer high-tech animation: a soft glowing halo around it, two lights running along its border, thin glowing corner frames and a slow scan line at the edges of the photo (the photo itself stays fully visible), and under the photo a dark glass text area with moving light, a fine grid, drifting particles, a slowly turning radar ring and a soft light passing over the title; the selected era button also has a running border light), the 4 cards of the 2030 era milestones (Autonomous Urban Sky Taxi, Personal AI Companion Node, Next-Gen Solid-State Grid Storage, Adaptive Smart Glass Architecture; the same pictures also show on those cards in the future tech catalogue), all 6 Health & Biology cards in the future tech catalogue (Autonomous Mobile Medical Pod: a white self-driving clinic van with an open side and a nurse inside; Targeted mRNA Cellular Rejuvenator: a close-up of a nanoparticle meeting a cell membrane; 3D Bio-Printed Organ Replacement: a bioprinter building a liver in a clean lab; Sub-Dermal Continuous Metabolic Sensor: a thin sensor patch on a forearm with a doctor reading the data on a tablet; Microbial Gut Microbiome Synthesizer: a white capsule dispenser on a marble bathroom counter; Non-Invasive Focused Ultrasound Oncology: a focused-ultrasound head over a patient in a treatment room; the medical pod picture also shows on its 2035 timeline card), all 6 Home & Workplace cards in the future tech catalogue (Adaptive Smart Glass Architecture: a glass penthouse corner at dusk with tinted and clear panes; Engineered Mycelium Urban Modules: rounded grown-material homes with gardens in a green city; Closed-Loop Residential Water Cycler: a wall of clear filter tanks and pipes in a modern home; Autonomous Indoor Aeroponic Farm Wall: a kitchen wall of growing greens; Sonic Acoustic Soundproofing Fields: layered acoustic wall panels in a bright lounge; Kinetic Energy Harvesting Floors: floor tiles lifted to show the energy-harvesting units under them; the smart glass picture also shows on the 2030 milestone card and the mycelium picture on its 2035 timeline card), all 6 Devices & Bionics cards in the future tech catalogue (Neural Motor Cortex Link: a thin clear patch behind a woman\'s ear with a brain scan on a screen; Smart Corneal Contact Display: a smart contact lens with tiny circuits held near an eye; Bio-Synthetic Robotic Exosuit: an engineer fitting a full-body white powered exosuit on a woman in a lab; Haptic Holographic Interface: a woman with haptic gloves shaping a floating 3D city model; High-Density Graphene Micro-Battery: a close-up of tweezers holding a small layered graphene battery cell on a steel lab table; Optoelectronic Bionic Retina: an eye doctor examining a patient at a clinic microscope, with retina scans and the tiny implant on screens; the neural link picture also shows on its 2035 timeline card), all 6 Vehicles & Autonomous Transit cards in the future tech catalogue (Autonomous Urban Sky Taxi: a white four-rotor air taxi on a rooftop landing pad above a city; Intercity Maglev Hyper-Pod: a silver maglev train inside a clear elevated tube over a river valley; Automated Subterranean Cargo Shuttle: white freight pods on guideways in a bright underground tunnel; Hydrogen Cryo-Hydrofoil Vessel: a silver passenger hydrofoil lifted on foils off a city coast; Autonomous Stratospheric Glider: a long-winged solar glider high above the clouds with Earth\'s curve; Autonomous Planetary Heavy-Lifter: three reusable rockets lifting off from an offshore ocean platform; the sky taxi picture also shows on the 2030 milestone card and the maglev picture on its 2035 timeline card), all 6 Future AI cards in the future tech catalogue (Personal AI Companion Node: a compact brushed-titanium AI box with a small glass display on a desk; Synthetic Consensus Engine: tall glass-walled optical computing towers in a dark data center; Autonomous Scientific Discovery Agent: a robotic arm pipetting colorful samples in a clean lab; Algorithmic Ecology Restorer: small conservation drones flying through a misty old forest; Neuromorphic Real-Time Translator: two professionals talking at a conference table wearing tiny ear pieces; Deep Planetary Climate Simulator: scientists around a large glowing Earth globe display with climate screens; the AI companion picture also shows on the 2030 milestone card), all 6 Energy & Climate cards in the future tech catalogue, shown as the high-resolution originals (about 1586 by 992 pixels) (Commercial Fusion Baseload Tokamak: a huge steel fusion reactor inside a bright industrial hall; Next-Gen Solid-State Grid Storage: rows of battery storage units at a lit grid yard with wind turbines behind at dusk; Oceanic Atmospheric Carbon Scrubber: a large offshore platform with tall white processing towers standing in the open sea; Perovskite Tandem Solar Canvas: a thin flexible solar sheet rolling off a machine in a clean factory; Deep Superhot Geothermal Tap: a geothermal plant at dusk with a deep glowing borehole and steam stacks; Atmospheric Fog Harvesting Tower: tall mesh fog-catching towers on a hillside above the clouds; the fusion and ocean scrubber pictures also show on the 2050 milestone cards, and the grid storage picture on the 2030 milestone card), all 6 Deep Space cards in the future tech catalogue, shown as the high-resolution originals (about 1586 by 992 pixels) (Lunar South-Pole Water Harvester: a silver mining rover on the grey lunar surface filling a clear tank with blue water, Earth in the black sky; Permanent Orbital Research Habitat: a large ring-shaped space station with green plant sections inside, solar panels, above the Earth; Solar Electric Ion Propulsion Tug: a long cargo spacecraft with three glowing blue ion engines passing an asteroid; In-Situ Lunar Regolith 3D Printer: a big gantry printer building a grey dome shelter layer by layer on the Moon; Nuclear Thermal Rocket Upper Stage: a heavy rocket stage with a blue glowing engine high above the Earth; Centimetric Laser Asteroid Deflector: a space platform firing an orange laser beam at an asteroid near the Earth; the water harvester and orbital habitat pictures also show on the 2050 milestone cards), all 8 Cities & Places postcards with new approved photos shown in full original quality (now the high-resolution originals, about 1585 by 992 pixels, on every screen, so they stay sharp even on 4K) (Kinetic Smart Street Corridor: a green boulevard with trams, walkways and a bridge in a modern Korean city; The Vertical Eco-Spire: a tree-covered glass tower with sky bridges and a raised train in Singapore; Polynesian Floating Ocean Habitat: round floating garden platforms on a turquoise lagoon near green mountains; The Desert Solar Arcology: a tall spire city ringed by solar fields and water pools in the desert; Artemis Base Camp: domes, modules, a rocket and a big rover in a grey crater on the Moon with Earth in the sky; Ares Deep Frontier Settlement: domes, glass greenhouses and rovers with astronauts on red Mars ground; Autonomous Clean Port Archipelago: a busy container port with cranes, wind turbines and hydrogen tanks; Aura Industrial Orbital Ring Station: a large ring station with solar panels above the Earth), and Aliya\'s own founder photo in the About section. Every picture frame on the site now has its real photo.',
  '2030 era milestone cards (in the timeline): 4 cards in a 2 by 2 grid with real photos (sky taxi, AI companion, solid-state grid storage, smart glass building). The text area of each card has a dark transparent glass look with a softly moving cyan high-tech animation inside it, and a light runs along each card border.',
  'Future tech catalogue: all 7 categories (Future AI, Health & Biology, Home & Workplace, Devices & Bionics, Vehicles & Autonomous Transit, Energy & Climate and Deep Space) are complete, all 6 cards each, so every catalogue card now has a real photo. Cards show 2 per row on every screen. The text area of every catalogue card has the same dark transparent glass look with a softly moving cyan animation inside it, and a light runs along each card border.',
  'Cities & Places section: 8 postcards with real pictures, an animated light running along each card border, a moving high-tech background under dark see-through glass in the text area of each card (same as the timeline and catalogue cards), and a slowly moving grid and soft light behind the section.',
  'About section (Aliya Khan, founder): her founder photo on the left (a calm night portrait at a café window in the rain) and her main details beside it, with a slim strip below for her email and website. There is no video in this section. The section has a dark glass look over a softly moving futuristic background, with light running along the card borders. Her photo is protected from easy saving.',
  'Website rating: a glowing cyan "RATE" star button sits in the top bar right next to the language button. It opens a rating popup in the same futuristic glass style: 1 to 5 stars, then every section, every catalogue category and every single card (timeline eras and milestones, all 42 catalogue cards, the 8 places postcards, projects, Jarvis, advert, language, speed, phone view) can be marked "Good" or "Needs work", quick tags for what is lacking (image quality, animations, speed, text, design, phone view, Jarvis, translations, menu, forms), a box to write what is missing, and optional name and email. Ratings are really saved for Aliya to read. The popup also appears by itself once every minute until the visitor rates; after rating it never appears again on that browser. If a visitor asks how to give feedback or rate the website, tell them about this button.',
  'Speed: the hero (3D orb, advert, animated background) now fades in smoothly as soon as the page opens, and photos further down start loading before the visitor reaches them. Image and animation quality are unchanged (original files).',
];

const clip = (s: string | null | undefined, n: number) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/** Reads the open page right now (cheap, runs once per activation). */
export function collectLiveSiteSnapshot(heroTexts?: { headline?: string; subtitle?: string; advert?: string }): string {
  if (typeof document === 'undefined') return '';
  const lines: string[] = [];
  try {
    if (heroTexts?.headline) lines.push(`Hero headline (current language): "${clip(heroTexts.headline, 140)}"`);
    if (heroTexts?.subtitle) lines.push(`Hero subtitle: "${clip(heroTexts.subtitle, 220)}"`);
    if (heroTexts?.advert) lines.push(`Advert under the hero: "${clip(heroTexts.advert, 140)}"`);

    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
      .map((sec) => {
        const h = sec.querySelector('h2, h3');
        const title = clip(h?.textContent, 70);
        return title ? `${sec.id} ("${title}")` : sec.id;
      })
      .filter(Boolean);
    if (sections.length) lines.push(`Sections on the page, top to bottom: ${sections.join(', ')}.`);

    const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-image-slot]'));
    if (slots.length) {
      const real = slots.filter((el) => el.dataset.imageSlot === 'real').length;
      lines.push(
        `Picture frames currently on the page: ${slots.length} (${real} showing a loaded real photo right now, the rest show "frame pending" placeholders or have not loaded yet).`
      );
    }
    const live = projectsData.filter((p) => p.status === 'live').length;
    const wip = projectsData.filter((p) => p.status === 'in-progress').length;
    lines.push(
      projectsData.length
        ? `Projects listed: ${projectsData.length} (${live} live, ${wip} in progress, ${projectsData.length - live - wip} future ideas).`
        : 'Projects section: no projects published yet (coming soon).'
    );
  } catch {
    // never block Jarvis because of the snapshot
  }
  return lines.join('\n');
}

/** Full knowledge block for the Jarvis system instruction. */
export function buildJarvisKnowledge(liveSnapshot: string): string {
  return [
    'WEBSITE & OWNER KNOWLEDGE (true facts - use them to answer; for anything not listed, say honestly you do not have that detail yet, never guess):',
    'Website: Hayaati Web Technology (www.hayaatiweb.site) - a cinematic, futuristic website showing human innovation, cognitive machines, orbital colonies and sustainable habitats from 2030 to 2050, plus Aliya Khan\'s web design / AI assistant services.',
    'STATUS:',
    ...SITE_STATUS.map((l) => `- ${l}`),
    'OWNER (speak about her with warmth and respect):',
    ...OWNER_FACTS.map((l) => `- ${l}`),
    liveSnapshot ? `LIVE PAGE SNAPSHOT (read from the website right now):\n${liveSnapshot}` : '',
    'If someone asks why the site is live while it says "under development", explain it is an intentional early preview that is being finished step by step, and the full launch is coming soon.',
  ]
    .filter(Boolean)
    .join('\n');
}
