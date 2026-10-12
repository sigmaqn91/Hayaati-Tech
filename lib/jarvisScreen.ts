// What is on the visitor's screen, and calm scrolling that Jarvis can wait for.
// Jarvis only describes what this file reads from the page after a scroll has finished, so his words
// always match the screen. Nothing here changes how the website looks.

export const NAV_OFFSET = 72; // fixed navbar (64px) + a little air

const SECTION_NAMES: Record<string, string> = {
  hero: 'Welcome screen (hero)',
  timeline: 'Future Timeline (eras 2030, 2035, 2050)',
  tech: 'Future Tech Catalogue',
  places: 'Cities & Places of the Future (postcards)',
  projects: 'My Projects',
  advertise: 'Advertise with Hayaati',
  about: 'About the founder, Aliya Khan',
  contact: 'Contact',
};

export const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
export const nextFrames = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(r, 60))));

export const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

let scrollToken = 0;

/**
 * Go to a page position for Jarvis. Jarvis drives the site, so there is no visible scrolling: the page is simply
 * there (less work for the phone, and the screen changes exactly when Jarvis talks about it). Resolves after the
 * next frame has been drawn.
 */
export function glideTo(y: number): Promise<void> {
  jumpTo(y);
  // (rAF pauses in a background tab; the timer makes sure nothing waits forever)
  return new Promise<void>((r) => {
    requestAnimationFrame(() => r());
    window.setTimeout(r, 120);
  });
}

/** Where the page ends up when an element's top is placed just under the navbar. */
export const scrollTargetFor = (el: Element) => Math.round(Math.min(Math.max(0, docTop(el) - NAV_OFFSET), maxScroll()));

/** Jump straight to a page position (no visible scrolling: Jarvis drives the site during a tour). */
export function jumpTo(y: number) {
  ++scrollToken; // stops any glide that is still running
  window.scrollTo({ top: Math.round(Math.min(Math.max(0, y), maxScroll())), behavior: 'instant' as ScrollBehavior });
}

/** Bring an element's top just under the navbar (or as close as the page allows). */
export async function glideToElement(el: Element) {
  await glideTo(docTop(el) - NAV_OFFSET);
  await nextFrames();
}

const isShown = (el: Element) => {
  const h = el as HTMLElement;
  if (h.closest('[aria-hidden="true"]')) return false;
  if (!h.offsetParent && getComputedStyle(h).position !== 'fixed') return false;
  return true;
};

/** Text of an element; animated text (DecryptText) counts with its finished words. */
function textOf(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
  if (node instanceof Element) {
    const final = node.getAttribute('data-final');
    if (final !== null) return final;
    return Array.from(node.childNodes).map(textOf).join(' ');
  }
  return '';
}

/**
 * Texts inside `root` that are visible on the screen right now (headings marked with #). With `atScrollY`, the
 * texts that WILL be visible once the page is at that position (read before the jump, from the layout).
 */
export function visibleTexts(root: Element, limit = 1800, atScrollY?: number): string[] {
  const vh = window.innerHeight;
  const shift = atScrollY === undefined ? 0 : atScrollY - window.scrollY;
  const out: string[] = [];
  const seen = new Set<string>();
  let total = 0;
  root.querySelectorAll('h1, h2, h3, h4, h5, p, li, label, [data-tour-text]').forEach((el) => {
    if (total > limit) return;
    if (el.parentElement?.closest('li, p, h1, h2, h3, h4, h5')) return;
    const b = el.getBoundingClientRect();
    const r = { top: b.top - shift, bottom: b.bottom - shift, height: b.height };
    if (r.height < 4 || r.bottom < NAV_OFFSET + 20 || r.top > vh - 20) return;
    if (!isShown(el)) return;
    let text = textOf(el).replace(/\s+/g, ' ').trim();
    if (text.length < 2 || seen.has(text)) return;
    seen.add(text);
    if (text.length > 220) text = text.slice(0, 217) + '...';
    const line = /^H\d$/.test(el.tagName) ? `# ${text}` : text;
    out.push(line);
    total += line.length;
  });
  // Photos on screen (their descriptions), so Jarvis can talk about a big picture too.
  let photos = 0;
  root.querySelectorAll('img[alt]').forEach((img) => {
    if (photos >= 4) return;
    const b = img.getBoundingClientRect();
    const r = { top: b.top - shift, bottom: b.bottom - shift, height: b.height };
    const alt = img.getAttribute('alt')?.trim();
    if (!alt || r.height < 120 || r.bottom < NAV_OFFSET + 60 || r.top > vh - 60 || !isShown(img)) return;
    const line = `Photo: ${alt.length > 160 ? alt.slice(0, 157) + '...' : alt}`;
    if (seen.has(line)) return;
    seen.add(line);
    out.push(line);
    photos++;
  });
  return out;
}

/** The section that fills most of the screen. */
export function currentSectionId(): string | null {
  const vh = window.innerHeight;
  let best: string | null = null;
  let bestArea = 0;
  for (const id of Object.keys(SECTION_NAMES)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const seen = Math.min(vh, r.bottom) - Math.max(NAV_OFFSET, r.top);
    if (seen > bestArea) {
      bestArea = seen;
      best = id;
    }
  }
  return best;
}

export const sectionName = (id: string | null) => (id ? SECTION_NAMES[id] || id : 'unknown');

/** Active era / catalogue tab as the visitor sees them (read from the page, never guessed). */
export function activeTabs() {
  const era = document.getElementById('timeline')?.getAttribute('data-active-era') || null;
  const tech = document.getElementById('tech');
  const category = tech?.getAttribute('data-active-category') || null;
  const categoryLabel = tech?.querySelector('[data-tour="tech-tabs"] [aria-pressed="true"]')?.textContent?.trim() || null;
  return { era, category, categoryLabel };
}

export function openPopup(): string | null {
  const dialog = Array.from(document.querySelectorAll('[role="dialog"]')).find((d) => isShown(d) && !d.closest('[data-jarvis-ui]'));
  if (!dialog) return null;
  const title = dialog.querySelector('h1, h2, h3')?.textContent?.trim();
  return title || 'a popup is open';
}

/** Full description of the screen for Jarvis. */
export function describeScreen() {
  const id = currentSectionId();
  const el = id ? document.getElementById(id) : null;
  const tabs = activeTabs();
  const r = el?.getBoundingClientRect();
  return {
    section: id,
    section_name: sectionName(id),
    ...(id === 'timeline' ? { era_shown: tabs.era } : {}),
    ...(id === 'tech' ? { catalogue_category_shown: tabs.categoryLabel || tabs.category } : {}),
    more_of_this_section_below: r ? r.bottom > window.innerHeight + 40 : false,
    popup_open: openPopup(),
    visible_on_screen: el ? visibleTexts(el) : [],
  };
}
