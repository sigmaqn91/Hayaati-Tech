/**
 * Returns the canonical site URL, prioritizing NEXT_PUBLIC_APP_URL,
 * falling back to APP_URL, and defaulting to https://www.hayaatiweb.site.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://www.hayaatiweb.site';
  return url.replace(/\/+$/, '');
}
