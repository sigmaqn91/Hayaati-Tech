/**
 * How many real screen pixels each CSS pixel covers right now, for sharp drawing on 4K / Retina screens.
 * Phones in Chrome "Desktop site" mode show a 980px-wide page zoomed out to fit the screen, so they have
 * fewer real pixels per CSS pixel than devicePixelRatio says (and more again after a pinch zoom).
 */
export function crispPixelRatio(cap = 2): number {
  const dpr = window.devicePixelRatio || 1;
  const screenW = window.screen?.width || 0;
  const pageW = window.innerWidth || 0;
  const vv = window.visualViewport;
  let real = dpr * (vv?.scale || 1);
  if (screenW > 0 && pageW > screenW) real = (dpr * screenW) / (vv?.width || pageW);
  return Math.max(1, Math.min(cap, real));
}
