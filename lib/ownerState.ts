/**
 * Owner mode on the client: lets the header menu show "Admin Control" once Aliya Khan is verified with the
 * owner code (Jarvis). Only a display flag for this tab: every admin API still checks the signed owner session
 * cookie (or the code) on the server, so setting this flag by hand shows nothing private.
 */

const KEY = 'hayaati_owner_ui';
export const OWNER_EVENT = 'hayaati:owner';

export function isOwnerUi(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setOwnerUi(on: boolean) {
  try {
    if (on) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent(OWNER_EVENT, { detail: on }));
}

/** Opens the Admin Control panel (header menu item, Jarvis owner panel). */
export function openAdminControl(tab?: 'ratings' | 'visitors') {
  window.dispatchEvent(new CustomEvent('admin:open', { detail: tab }));
}
