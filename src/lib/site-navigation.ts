import { langHref, splitLangPath } from '../i18n/path';

// These utilities choose their language from the app/query and have no prefixed static routes.
const UNPREFIXED = new Set(['/feedback/', '/migrate/']);

export function localizedSiteHref(language: string, target: string): string {
  if (!target.startsWith('/') || target.startsWith('//')) return target;
  const url = new URL(target, 'https://sxxw.site');
  if (/\/[^/]+\.[^/]+\/?$/.test(url.pathname)) return target;
  const current = splitLangPath(url.pathname);
  const path = current.path.endsWith('/') ? current.path : `${current.path}/`;
  if (UNPREFIXED.has(path)) {
    url.pathname = path;
    if (!url.searchParams.has('lang')) url.searchParams.set('lang', current.hasPrefix ? current.lang : language);
  } else if (!current.hasPrefix) {
    url.pathname = langHref(language, path);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
