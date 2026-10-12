/**
 * Device "brain": works out, in well under a millisecond, what kind of device and browser is showing the site,
 * so the heavy parts (3D orb, hero canvases, photo layers, glass blur) can adapt and never hang or crash it.
 *
 * Only capability signals the browser already exposes are read (screen size, touch, memory class, CPU cores,
 * engine, data-saver, network speed, GPU class). Nothing is stored about the visitor and nothing leaves the page.
 *
 * Tiers:
 *  - high: computers and strong devices — everything exactly as designed.
 *  - mid:  phones and tablets that cope well — same look; only invisible savings (fewer GPU layers kept alive).
 *  - low:  weak phones, old/limited browsers, data-saver, or a device that already struggled — same layout and
 *          photos, but the costliest effects are lightened (glass blur off, fewer canvas pixels/particles).
 *
 * The first guess runs as an inline <head> script (DEVICE_BOOT_SCRIPT) before anything is drawn; DeviceBrain
 * then refines it after load (GPU check, real smoothness while scrolling, crash memory) and can lower the tier live.
 */

export type DeviceTier = 'high' | 'mid' | 'low';

export interface DeviceProfile {
  tier: DeviceTier;
  /** Rendering engine: blink (Chrome, Edge, Samsung, Vivo, Opera, Brave ...), gecko (Firefox), webkit (Safari, all iOS browsers). */
  engine: 'blink' | 'gecko' | 'webkit';
  browser: string;
  /** Touch-first device (phone, tablet, watch) — even when it shows the 980px desktop layout. */
  touch: boolean;
  /** Small touch screen (phone or watch), i.e. the device the 980px desktop layout is scaled down onto. */
  phone: boolean;
  mem: number;
  cores: number;
  /** Network is slow (2G/3G, < 1.5 Mbps) or data-saver is on: photos start loading closer to the screen so visible ones finish first. */
  slowNet: boolean;
  /** Why the tier was chosen (shown with ?device=debug). */
  why: string[];
}

export const TIER_CAP_KEY = 'hy-tier-cap';

// Kept as plain ES5 so it also runs on very old phone browsers. Firefox on Android gets the light tier: its live
// background blur is far heavier than in Chrome (the lag and blinking reported there).
export const DEVICE_BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,n=navigator,w=window,s=screen,ua=n.userAgent||'',why=[];
var mm=function(q){try{return w.matchMedia(q).matches}catch(e){return false}};
var touch=mm('(pointer:coarse)')||(n.maxTouchPoints||0)>0&&!mm('(pointer:fine)');
var sw=s.width||0,sh=s.height||0,shortS=Math.min(sw,sh)||sw,longS=Math.max(sw,sh)||sw;
var ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&(n.maxTouchPoints||0)>1);
var engine=/Firefox\\/|FxiOS/.test(ua)&&!ios?'gecko':(ios||/AppleWebKit/.test(ua)&&!/Chrome|Chromium|CriOS|Android/.test(ua))?'webkit':'blink';
var b=n.brave?'brave':/Opera Mini|OPiOS/.test(ua)?'opera-mini':/OPR\\/|OPX\\/|Opera/.test(ua)?'opera':/VivoBrowser|vivo/i.test(ua)?'vivo':/SamsungBrowser/.test(ua)?'samsung':/UCBrowser|UCWEB/.test(ua)?'uc':/MiuiBrowser|XiaoMi/.test(ua)?'miui':/HeyTap|OppoBrowser/.test(ua)?'oppo':/HuaweiBrowser/.test(ua)?'huawei':/EdgA?\\/|EdgiOS/.test(ua)?'edge':/YaBrowser/.test(ua)?'yandex':/Firefox|FxiOS/.test(ua)?'firefox':/; wv\\)/.test(ua)?'webview':/CriOS|Chrome\\//.test(ua)?'chrome':engine==='webkit'?'safari':'other';
var cv=+((ua.match(/Chrome\\/(\\d+)/)||[])[1]||0);
var mem=n.deviceMemory||0,cores=n.hardwareConcurrency||0,c=n.connection||{};
var save=!!c.saveData,slow=save||/(^|-)2g|3g/.test(c.effectiveType||'')||(c.downlink>0&&c.downlink<1.5);
var phone=touch&&shortS>0&&shortS<600,watch=touch&&shortS>0&&shortS<300;
/* 1. Layout: every phone/small tablet opens the 980px desktop layout (the "Desktop site" look), in any browser. */
var cw=mm('(orientation:landscape)')?longS:shortS;
if(touch||ios){var vp=document.querySelector('meta[name=viewport]');if(!vp){vp=document.createElement('meta');vp.name='viewport';document.head.appendChild(vp)}
var want=cw>=980?'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-visual':'width=980, viewport-fit=cover, interactive-widget=resizes-visual';
if(vp.getAttribute('content')!==want)vp.setAttribute('content',want)}
/* 2. Tier */
var t='high';
if(touch||ios){t='mid';why.push('touch')}
if(mem&&mem<=4){t='mid';why.push('mem'+mem)}
if(cores&&cores<=4){t='mid';why.push('cores'+cores)}
if(save){t='low';why.push('data-saver')}
if(mem&&mem<=2||touch&&mem&&mem<=3){t='low';why.push('low-mem')}
if(cores&&cores<=2){t='low';why.push('2-cores')}
if(watch){t='low';why.push('watch')}
if(b==='opera-mini'){t='low';why.push('opera-mini')}
if(engine==='blink'&&cv&&cv<100){t='low';why.push('old-chrome'+cv)}
if(engine==='gecko'&&touch&&!ios){t='low';why.push('firefox-phone')}
try{var cap=JSON.parse(localStorage.getItem('${TIER_CAP_KEY}')||'null');if(cap&&cap.until>Date.now()&&cap.tier==='low'){t='low';why.push('remembered:'+cap.why)}}catch(e){}
var q=(location.search.match(/[?&]device=(high|mid|low|debug)/)||[])[1];if(q&&q!=='debug'){t=q;why.push('forced')}
d.setAttribute('data-tier',t);d.setAttribute('data-engine',engine);d.setAttribute('data-browser',b);
if(touch)d.setAttribute('data-touch','');if(slow)d.setAttribute('data-net','slow');
w.__hyDevice={tier:t,engine:engine,browser:b,touch:!!(touch||ios),phone:!!(phone||ios&&shortS<600),mem:mem,cores:cores,slowNet:slow,why:why};
if(q==='debug')console.info('[Hayaati device]',w.__hyDevice);
}catch(e){}})();`;

const FALLBACK: DeviceProfile = {
  tier: 'high',
  engine: 'blink',
  browser: 'other',
  touch: false,
  phone: false,
  mem: 0,
  cores: 0,
  slowNet: false,
  why: [],
};

type HyWindow = Window & { __hyDevice?: DeviceProfile };

/** Current profile (set by the boot script, refined by DeviceBrain). Safe to call on the server (returns "high"). */
export function getDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') return FALLBACK;
  return (window as HyWindow).__hyDevice || FALLBACK;
}

export const TIER_EVENT = 'hy:device';

/** Lower the tier while the page is open (never raises it). `remember` keeps it for the next visits too. */
export function lowerTier(to: DeviceTier, why: string, rememberDays = 0): void {
  if (typeof window === 'undefined') return;
  const p = getDeviceProfile();
  const order: DeviceTier[] = ['high', 'mid', 'low'];
  if (rememberDays > 0) {
    try {
      localStorage.setItem(TIER_CAP_KEY, JSON.stringify({ tier: to, why, until: Date.now() + rememberDays * 864e5 }));
    } catch {}
  }
  if (/[?&]device=(high|mid|low)/.test(location.search)) return;
  if (order.indexOf(to) <= order.indexOf(p.tier)) return;
  const next: DeviceProfile = { ...p, tier: to, why: [...p.why, why] };
  (window as HyWindow).__hyDevice = next;
  document.documentElement.setAttribute('data-tier', to);
  window.dispatchEvent(new CustomEvent(TIER_EVENT, { detail: next }));
}

export function setSlowNet(slow: boolean): void {
  if (typeof window === 'undefined') return;
  const p = getDeviceProfile();
  if (p.slowNet === slow) return;
  (window as HyWindow).__hyDevice = { ...p, slowNet: slow };
  if (slow) document.documentElement.setAttribute('data-net', 'slow');
  else document.documentElement.removeAttribute('data-net');
  window.dispatchEvent(new CustomEvent(TIER_EVENT, { detail: getDeviceProfile() }));
}
