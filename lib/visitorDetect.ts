/**
 * Visitor device / browser detection (runs in the browser in about a millisecond; also safe on the server).
 *
 * What it reads: the browser's User-Agent text, User-Agent Client Hints (Chrome / Edge / Samsung / Opera on
 * Android and computers give the real phone model and OS version this way), and the screen. No permission is
 * asked and no hidden fingerprint is made: browsers never give a website the IMEI, serial number or a real
 * device ID, so a visitor is counted with an anonymous random id only.
 *
 * "Outdated" is judged from today's date and the release rhythm of each browser (Chrome / Edge / Opera and
 * every Chromium browser: a new version every 4 weeks; Firefox: every 4 weeks; Safari / iOS: once a year in
 * September), so the check stays right in the future without anyone updating a version list.
 */

export type DeviceType = 'watch' | 'phone' | 'tablet' | 'computer' | 'tv' | 'console' | 'bot' | 'unknown';

export interface DeviceInfo {
  type: DeviceType;
  /** Phone in "Desktop site" mode (sends a computer User-Agent, but the screen and touch say phone/tablet) */
  desktopMode: boolean;
  brand: string;
  model: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  /** Chromium / Gecko / WebKit version the browser is built on (what really decides speed and features) */
  engine: string;
  engineVersion: string;
  /** In-app browser (Instagram, Facebook, WebView...) */
  inApp: string;
  screen: string;
  viewport: string;
  dpr: number;
  touch: boolean;
  language: string;
  timezone: string;
  memoryGb?: number;
  cpuCores?: number;
  network?: string;
  ua: string;
}

export interface Freshness {
  browserOld: boolean;
  osOld: boolean;
  /** Lite / proxy browsers (Opera Mini, UC, KaiOS) that cannot run the full site well */
  browserLimited: boolean;
  /** Short human text, e.g. "Vivo Browser 13 (Chromium 87)" */
  browserLabel: string;
  osLabel: string;
}

const DAY = 86_400_000;

const major = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

/** Estimated newest stable Chromium / Firefox major version for a date (4-week release train). */
export function estimatedLatest(now = Date.now()) {
  const chromium = 140 + Math.floor((now - Date.UTC(2025, 8, 2)) / (28 * DAY));
  const firefox = 143 + Math.floor((now - Date.UTC(2025, 8, 16)) / (28 * DAY));
  const d = new Date(now);
  // Apple ships the new iOS / Safari each September.
  const appleYear = d.getUTCMonth() >= 8 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return { chromium, firefox, appleYear };
}

/** Year an Apple OS / Safari major version came out (numbering jumped from 18 to 26 in 2025). */
const appleReleaseYear = (v: number) => (v >= 26 ? 1999 + v : 2006 + v);

// ---------- Brand from model code ----------

const BRAND_RULES: [RegExp, string][] = [
  [/^(SM-|GT-|SCH-|SGH-|SHV-|SAMSUNG|Galaxy)/i, 'Samsung'],
  [/^Pixel/i, 'Google'],
  [/^RMX\d/i, 'realme'],
  [/^(CPH\d|OPPO|PB|PC|PD|PE|PF|PG|PH)[A-Z0-9]*\d/i, 'OPPO / OnePlus'],
  [/^(vivo|V\d{4}[A-Z]?$|I\d{4}$|iQOO)/i, 'vivo'],
  [/^(Redmi|POCO|Mi |MI |M\d{4}[A-Z]\d|2[0-5]\d{4,}[A-Z]{1,4}\w*|XiaoMi)/i, 'Xiaomi'],
  [/^(OnePlus|KB\d{4}|LE\d{4}|IN\d{4}|HD\d{4}|GM\d{4}|NE\d{4}|PJ[A-Z]\d{3}|AC\d{4}|BE\d{4}|DN\d{4}|EB\d{4}|CPH2[45]\d{2})/i, 'OnePlus'],
  [/^(moto|XT\d{4})/i, 'Motorola'],
  [/^(Nokia|TA-\d{4})/i, 'Nokia'],
  [/^(Infinix|X\d{3,4}[A-Z]?$)/i, 'Infinix'],
  [/^(TECNO|KG\d|KF\d|CK\d|CL\d|BG\d|LH\d|KI\d|KJ\d)/i, 'TECNO'],
  [/^itel/i, 'itel'],
  [/^(HONOR|ALI-|ANY-|RMO-|CRT-|LGE-|BRP-|VNE-|ROD-|FNE-)/i, 'Honor'],
  [/^(HUAWEI|ELE-|VOG-|ANA-|LYA-|JNY-|NOH-|MAR-|STK-|CDY-|JEF-|NAM-|BAL-|ALN-|DCO-)/i, 'Huawei'],
  [/^(LM-|LG)/i, 'LG'],
  [/^(ASUS|ZS\d|ZE\d|AI\d{4})/i, 'Asus'],
  [/^(Lenovo|TB-|TB\d{3})/i, 'Lenovo'],
  [/^(Nothing|A0(59|63|65|142))/i, 'Nothing'],
  [/^(SO-|XQ-|Xperia)/i, 'Sony'],
  [/^LAVA/i, 'Lava'],
  [/^Micromax/i, 'Micromax'],
  [/^(Redmi Pad|Xiaomi Pad|Mi Pad)/i, 'Xiaomi'],
  [/^(KFT|KFA|KFM|KFO|KFS|KFG|KFR|KFD|KFQ|KFR)/i, 'Amazon'],
];

function brandFromModel(model: string): string {
  const m = model.trim();
  if (!m) return '';
  for (const [re, brand] of BRAND_RULES) if (re.test(m)) return brand;
  return '';
}

// ---------- Main detection ----------

interface UaChData {
  brands?: { brand: string; version: string }[];
  fullVersionList?: { brand: string; version: string }[];
  mobile?: boolean;
  model?: string;
  platform?: string;
  platformVersion?: string;
  formFactors?: string[];
}

function pick(ua: string, re: RegExp): string {
  const m = ua.match(re);
  return m ? (m[m.length - 1] || '').replace(/_/g, '.') : '';
}

/** Detects the device from the User-Agent text (+ optional screen and Client Hints). Pure: no browser APIs. */
export function detectFromUa(
  ua: string,
  extra: {
    ch?: UaChData | null;
    screenW?: number;
    screenH?: number;
    touchPoints?: number;
    coarse?: boolean;
    brave?: boolean;
  } = {}
): Pick<
  DeviceInfo,
  'type' | 'desktopMode' | 'brand' | 'model' | 'os' | 'osVersion' | 'browser' | 'browserVersion' | 'engine' | 'engineVersion' | 'inApp'
> {
  const ch = extra.ch || null;
  let type: DeviceType = 'unknown';
  let desktopMode = false;
  let brand = '';
  let model = '';
  let os = '';
  let osVersion = '';
  let browser = '';
  let browserVersion = '';
  let engine = '';
  let engineVersion = '';
  let inApp = '';

  // --- Bots ---
  if (/bot|crawler|spider|crawling|slurp|lighthouse|headlesschrome|pagespeed|facebookexternalhit|preview/i.test(ua)) {
    type = 'bot';
  }

  // --- OS ---
  if (/Windows Phone/i.test(ua)) {
    os = 'Windows Phone';
    osVersion = pick(ua, /Windows Phone (?:OS )?([\d.]+)/i);
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
    const nt = pick(ua, /Windows NT ([\d.]+)/i);
    osVersion = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' }[nt] || nt;
    if (ch?.platformVersion && nt === '10.0') osVersion = major(ch.platformVersion) >= 13 ? '11' : '10';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = /iPad/i.test(ua) ? 'iPadOS' : 'iOS';
    osVersion = pick(ua, /OS ([\d_]+) like Mac OS X/i);
    // Since 2025 Safari keeps the OS number frozen at 18.x; the Safari version shows the real one (26, 27 ...).
    const safariV = major(pick(ua, /Version\/([\d.]+)/));
    if (safariV >= 26) osVersion = pick(ua, /Version\/([\d.]+)/);
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    osVersion = pick(ua, /Android ([\d.]+)/i);
    // Chrome sends a frozen "Android 10; K"; only Client Hints know the real version.
    if (/Android 10; K\b/.test(ua)) osVersion = '';
  } else if (/HarmonyOS/i.test(ua)) {
    os = 'HarmonyOS';
    osVersion = pick(ua, /HarmonyOS[ /]([\d.]+)/i);
  } else if (/KAIOS/i.test(ua)) {
    os = 'KaiOS';
    osVersion = pick(ua, /KAIOS\/([\d.]+)/i);
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    osVersion = pick(ua, /Mac OS X ([\d_.]+)/i);
    if (osVersion === '10.15.7') osVersion = ''; // frozen value, real one only via Client Hints
  } else if (/Tizen/i.test(ua)) {
    os = 'Tizen';
  } else if (/Web0S|webOS/i.test(ua)) {
    os = 'webOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  if (ch?.platform) {
    const p = ch.platform;
    if (p === 'Android' && os !== 'Android') {
      os = 'Android';
      desktopMode = true;
    }
    if (ch.platformVersion && (p === 'Android' || p === 'macOS' || p === 'Chrome OS' || p === 'Linux')) {
      const pv = ch.platformVersion.replace(/(\.0)+$/, '');
      if (p === 'Android' || (p === 'macOS' && !osVersion)) osVersion = pv;
    }
  }

  // --- Model + brand ---
  if (ch?.model) model = ch.model;
  if (!model && os === 'Android') {
    const m = ua.match(/Android [\d.]+;(?: [a-z]{2}[-_][a-z]{2};)? ([^;)]+?)(?: Build\/|\)|;)/i);
    if (m && m[1] && !/^(K|wv|Mobile|Tablet|U|rv:.*)$/i.test(m[1].trim())) model = m[1].trim();
  }
  if (/iPhone/i.test(ua)) {
    brand = 'Apple';
    model = 'iPhone';
  } else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && (extra.touchPoints || 0) > 1)) {
    brand = 'Apple';
    model = 'iPad';
    if (/Macintosh/i.test(ua)) {
      os = 'iPadOS';
      osVersion = pick(ua, /Version\/([\d.]+)/);
    }
  } else if (/Macintosh/i.test(ua)) {
    brand = 'Apple';
    model = 'Mac';
  } else if (/Watch/i.test(ua) && /AppleWebKit/i.test(ua) && /Watch OS|watchOS/i.test(ua)) {
    brand = 'Apple';
    model = 'Apple Watch';
  }
  if (!brand) brand = brandFromModel(model);
  if (!brand && /SamsungBrowser/i.test(ua)) brand = 'Samsung';
  if (!brand && /VivoBrowser/i.test(ua)) brand = 'vivo';
  if (!brand && /MiuiBrowser|XiaoMi/i.test(ua)) brand = 'Xiaomi';
  if (!brand && /HeyTapBrowser|OppoBrowser/i.test(ua)) brand = 'OPPO / OnePlus';
  if (!brand && /HUAWEI|HuaweiBrowser/i.test(ua)) brand = 'Huawei';
  if (!brand && /CrOS/i.test(ua)) brand = 'Chromebook';

  // --- Browser ---
  const chromium = pick(ua, /(?:Chrome|CriOS|Chromium)\/([\d.]+)/);
  if (/Opera Mini|OPiOS/i.test(ua)) {
    browser = 'Opera Mini';
    browserVersion = pick(ua, /(?:Opera Mini|OPiOS)\/([\d.]+)/i);
  } else if (/OPR\/|OPX\/|Opera/i.test(ua)) {
    browser = /OPX\//.test(ua) ? 'Opera GX' : 'Opera';
    browserVersion = pick(ua, /(?:OPR|OPX|Version)\/([\d.]+)/);
  } else if (/EdgA?\/|EdgiOS\//.test(ua)) {
    browser = 'Edge';
    browserVersion = pick(ua, /Edg(?:A|iOS)?\/([\d.]+)/);
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
    browserVersion = pick(ua, /SamsungBrowser\/([\d.]+)/i);
  } else if (/VivoBrowser/i.test(ua)) {
    browser = 'Vivo Browser';
    browserVersion = pick(ua, /VivoBrowser\/([\d.]+)/i);
  } else if (/MiuiBrowser/i.test(ua)) {
    browser = 'Mi Browser';
    browserVersion = pick(ua, /MiuiBrowser\/([\d.]+)/i);
  } else if (/HeyTapBrowser/i.test(ua)) {
    browser = 'HeyTap Browser';
    browserVersion = pick(ua, /HeyTapBrowser\/([\d.]+)/i);
  } else if (/UCBrowser|UCWEB/i.test(ua)) {
    browser = 'UC Browser';
    browserVersion = pick(ua, /UCBrowser\/([\d.]+)/i);
  } else if (/YaBrowser/i.test(ua)) {
    browser = 'Yandex';
    browserVersion = pick(ua, /YaBrowser\/([\d.]+)/i);
  } else if (/HuaweiBrowser/i.test(ua)) {
    browser = 'Huawei Browser';
    browserVersion = pick(ua, /HuaweiBrowser\/([\d.]+)/i);
  } else if (/DuckDuckGo|Ddg\//i.test(ua)) {
    browser = 'DuckDuckGo';
    browserVersion = pick(ua, /(?:DuckDuckGo|Ddg)\/([\d.]+)/i);
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browser = 'Firefox';
    browserVersion = pick(ua, /(?:Firefox|FxiOS)\/([\d.]+)/i);
  } else if (/CriOS/i.test(ua)) {
    browser = 'Chrome';
    browserVersion = pick(ua, /CriOS\/([\d.]+)/);
  } else if (chromium) {
    browser = 'Chrome';
    browserVersion = chromium;
  } else if (/Safari/i.test(ua) && /Version\//.test(ua)) {
    browser = 'Safari';
    browserVersion = pick(ua, /Version\/([\d.]+)/);
  }

  // Client Hints name Brave / Edge / Opera / Samsung exactly (and give full versions)
  const list = ch?.fullVersionList || ch?.brands || [];
  const chBrand = (name: RegExp) => list.find((b) => name.test(b.brand));
  if (extra.brave || chBrand(/^Brave/)) {
    browser = 'Brave';
    browserVersion = chBrand(/^Brave/)?.version || chromium;
  } else if (browser === 'Chrome' && chBrand(/^Google Chrome$/)) {
    browserVersion = chBrand(/^Google Chrome$/)!.version;
  }

  // In-app browsers (they show the site inside another app)
  if (/Instagram/i.test(ua)) inApp = 'Instagram';
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) inApp = 'Facebook';
  else if (/Snapchat/i.test(ua)) inApp = 'Snapchat';
  else if (/Line\//i.test(ua)) inApp = 'LINE';
  else if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) inApp = 'TikTok';
  else if (/LinkedInApp/i.test(ua)) inApp = 'LinkedIn';
  else if (/Twitter/i.test(ua)) inApp = 'X (Twitter)';
  else if (/GSA\//i.test(ua)) inApp = 'Google app';
  else if (/; wv\)/i.test(ua) && browser === 'Chrome') inApp = 'App WebView';

  // --- Engine ---
  if (os === 'iOS' || os === 'iPadOS') {
    engine = 'WebKit';
    engineVersion = osVersion;
  } else if (/Firefox/i.test(ua) && /Gecko\//i.test(ua)) {
    engine = 'Gecko';
    engineVersion = pick(ua, /Firefox\/([\d.]+)/i);
  } else if (chromium) {
    engine = 'Chromium';
    engineVersion = chromium;
    const chEngine = chBrand(/^Chromium$/);
    if (chEngine) engineVersion = chEngine.version;
  } else if (/AppleWebKit/i.test(ua)) {
    engine = 'WebKit';
    engineVersion = pick(ua, /Version\/([\d.]+)/);
  } else if (/Presto/i.test(ua)) {
    engine = 'Presto';
  }

  // --- Device type ---
  if (type !== 'bot') {
    const ff = (ch?.formFactors || []).map((f) => f.toLowerCase());
    const w = extra.screenW || 0;
    const h = extra.screenH || 0;
    const minSide = Math.min(w, h);
    const maxSide = Math.max(w, h);
    if (/watch|wearos|wear os|SM-R\d{3}|Tizen.*Wearable|SAMSUNG-SM-R/i.test(ua) || ff.includes('watch')) type = 'watch';
    else if (/smart-?tv|googletv|appletv|hbbtv|crkey|web0s|netcast|\bAFT[A-Z]|bravia|Tizen.*TV|SMART-TV/i.test(ua)) type = 'tv';
    else if (/PlayStation|Xbox|Nintendo/i.test(ua)) type = 'console';
    else if (/iPad/i.test(ua) || model === 'iPad' || ff.includes('tablet')) type = 'tablet';
    else if (/iPhone|iPod/i.test(ua)) type = 'phone';
    else if (/Android/i.test(ua) || os === 'Android') {
      if (ch?.mobile === false && !desktopMode) type = 'tablet';
      else if (/Mobile/i.test(ua) || ch?.mobile) type = 'phone';
      else type = minSide >= 600 ? 'tablet' : 'phone';
    } else if (/Mobi|Opera Mini|KAIOS|Windows Phone/i.test(ua)) type = 'phone';
    else if (/Tablet|Kindle|Silk/i.test(ua)) type = 'tablet';
    else type = 'computer';

    // Watch by screen: a browser on a watch screen (about 200-250 px) even with an unusual UA
    if (type !== 'watch' && w > 0 && maxSide <= 480 && minSide <= 300 && (extra.touchPoints || 0) > 0) type = 'watch';

    // Phone / tablet in "Desktop site" mode: computer UA but touch screen and a phone-sized screen
    if (type === 'computer' && (extra.touchPoints || 0) > 0 && extra.coarse && w > 0 && model !== 'Mac') {
      if (maxSide <= 1100 || os === 'Linux') {
        desktopMode = true;
        type = minSide >= 600 ? 'tablet' : 'phone';
        if (os === 'Linux' || !os) os = 'Android';
      }
    }
    if (desktopMode && type === 'computer') type = minSide >= 600 ? 'tablet' : 'phone';
  }

  return { type, desktopMode, brand, model, os, osVersion, browser, browserVersion, engine, engineVersion, inApp };
}

/** Is the browser / OS clearly old? Only judged when the version is really known (never guessed). */
export function checkFreshness(
  d: Pick<DeviceInfo, 'os' | 'osVersion' | 'browser' | 'browserVersion' | 'engine' | 'engineVersion'> & { type: string },
  now = Date.now()
): Freshness {
  const est = estimatedLatest(now);
  let browserOld = false;
  let osOld = false;
  let browserLimited = false;

  if (d.type === 'bot') return { browserOld, osOld, browserLimited, browserLabel: '', osLabel: '' };

  const ev = major(d.engineVersion);
  if (d.engine === 'Chromium' && ev > 0) {
    // Chrome / Edge / Brave follow Chromium closely; phone-maker browsers (Samsung, Mi ...) always run a few
    // versions behind even when fully updated, so they get more room before being called old.
    const room = /^(Chrome|Edge|Brave)$/.test(d.browser) ? 12 : /^Opera/.test(d.browser) ? 16 : 24;
    browserOld = ev < est.chromium - room;
  }
  if (d.engine === 'Gecko' && ev > 0) browserOld = ev < est.firefox - 12;
  if (d.engine === 'WebKit' && ev > 0 && d.os !== 'iOS' && d.os !== 'iPadOS') {
    browserOld = appleReleaseYear(ev) < est.appleYear - 2;
  }
  if (d.browser === 'Opera Mini' || d.browser === 'UC Browser' || d.os === 'KaiOS' || d.engine === 'Presto') browserLimited = true;

  const ov = major(d.osVersion);
  if ((d.os === 'iOS' || d.os === 'iPadOS') && ov > 0) {
    // On iPhone / iPad, Safari updates only with iOS: an old iOS means an old browser too.
    osOld = appleReleaseYear(ov) < est.appleYear - 2;
    browserOld = osOld;
  }
  if (d.os === 'Android' && ov > 0) osOld = ov + 2009 < est.appleYear - 5; // Android 10 = 2019 ...
  if (d.os === 'Windows' && /^(7|8|8\.1|Vista|XP)$/.test(d.osVersion)) osOld = true;
  if (d.os === 'macOS' && ov > 0) osOld = ov < 26 ? ov + 2009 < est.appleYear - 4 : 1999 + ov < est.appleYear - 4;
  if (d.os === 'Windows Phone') osOld = true;

  const engineNote = d.engine && d.engineVersion && d.browser !== 'Chrome' && d.browser !== 'Firefox' && d.engine !== 'WebKit'
    ? ` (${d.engine} ${major(d.engineVersion)})`
    : '';
  const browserLabel = d.browser ? `${d.browser}${d.browserVersion ? ' ' + d.browserVersion.split('.').slice(0, 2).join('.') : ''}${engineNote}` : '';
  const osLabel = d.os ? `${d.os}${d.osVersion ? ' ' + d.osVersion : ''}` : '';
  return { browserOld, osOld, browserLimited, browserLabel, osLabel };
}

/** Full detection in the browser. Sync part is instant; Client Hints (model, real OS version) arrive in a few ms. */
export async function detectDevice(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & {
    userAgentData?: { getHighEntropyValues?: (h: string[]) => Promise<UaChData>; brands?: UaChData['brands']; mobile?: boolean; platform?: string };
    brave?: unknown;
    deviceMemory?: number;
    connection?: { effectiveType?: string };
  };
  const ua = nav.userAgent || '';
  let ch: UaChData | null = null;
  try {
    if (nav.userAgentData?.getHighEntropyValues) {
      ch = await Promise.race([
        nav.userAgentData.getHighEntropyValues(['model', 'platformVersion', 'fullVersionList', 'formFactors']),
        new Promise<null>((r) => setTimeout(() => r(null), 400)),
      ]);
      if (ch && !ch.platform) ch.platform = nav.userAgentData.platform;
    }
  } catch {
    ch = null;
  }
  const sw = window.screen?.width || 0;
  const sh = window.screen?.height || 0;
  let coarse = false;
  try {
    coarse = window.matchMedia('(pointer: coarse)').matches;
  } catch {}
  const base = detectFromUa(ua, {
    ch,
    screenW: sw,
    screenH: sh,
    touchPoints: nav.maxTouchPoints || 0,
    coarse,
    brave: Boolean(nav.brave),
  });
  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {}
  return {
    ...base,
    screen: `${sw}x${sh}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
    touch: (nav.maxTouchPoints || 0) > 0,
    language: nav.language || '',
    timezone,
    memoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined,
    cpuCores: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : undefined,
    network: nav.connection?.effectiveType || undefined,
    ua: ua.slice(0, 400),
  };
}
