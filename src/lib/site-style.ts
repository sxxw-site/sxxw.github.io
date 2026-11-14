export const STYLE_STORAGE_KEY = 'sxxw-site-style';
export const STYLE_CHANGE_EVENT = 'sxxw-style-change';

export const STYLE_OPTIONS = [
  { id: 'paper', name: '暖纸小屋', nameEn: 'Warm paper', summary: '纸白、暖橙与柔和边角', summaryEn: 'Warm paper and soft corners', colors: ['#f7f5ef', '#9b481f', '#29251f'] },
  { id: 'minimal', name: '留白极简', nameEn: 'Minimal white', summary: '白底墨黑与居中布局', summaryEn: 'White, ink and a centered layout', colors: ['#ffffff', '#171917', '#f7f7f5'] },
  { id: 'forest', name: '林间编辑', nameEn: 'Forest editorial', summary: '浅绿宋体与目录排版', summaryEn: 'Forest green and editorial type', colors: ['#f4f5ed', '#244d3f', '#dfe5d7'] },
] as const;

export type SiteStyleId = typeof STYLE_OPTIONS[number]['id'];

export function isSiteStyle(value: unknown): value is SiteStyleId {
  return STYLE_OPTIONS.some((option) => option.id === value);
}

export function resolveSiteStyle(search: string, saved: string | null): SiteStyleId {
  const requested = new URLSearchParams(search).get('style');
  return isSiteStyle(requested) ? requested : isSiteStyle(saved) ? saved : 'paper';
}

export function readSiteStyle(): SiteStyleId {
  if (typeof window === 'undefined') return 'paper';
  let saved: string | null = null;
  try { saved = window.localStorage.getItem(STYLE_STORAGE_KEY); } catch { /* The page still supports a session-only choice. */ }
  return resolveSiteStyle(window.location.search, saved);
}

function applyStyle(style: SiteStyleId) {
  document.documentElement.dataset.siteStyle = style;
  document.documentElement.dataset.theme = 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', STYLE_OPTIONS.find((option) => option.id === style)!.colors[0]);
  try {
    window.localStorage.setItem(STYLE_STORAGE_KEY, style);
    return window.localStorage.getItem(STYLE_STORAGE_KEY) === style;
  } catch { return false; /* URL state also keeps the choice on refresh. */ }
}

function updateStyleUrl(style: SiteStyleId, stored: boolean) {
  const url = new URL(window.location.href);
  if (url.searchParams.get('preview') === 'styles') url.searchParams.delete('preview');
  if (stored) url.searchParams.delete('style');
  else url.searchParams.set('style', style);
  window.history.replaceState(window.history.state, '', url);
}

export function initializeSiteStyle() {
  const style = readSiteStyle();
  const stored = applyStyle(style);
  updateStyleUrl(style, stored);
  return style;
}

export function setSiteStyle(style: SiteStyleId) {
  if (!isSiteStyle(style)) return;
  const stored = applyStyle(style);
  updateStyleUrl(style, stored);
  window.dispatchEvent(new CustomEvent<SiteStyleId>(STYLE_CHANGE_EVENT, { detail: style }));
}

/** Keep the selected design when browser storage is unavailable, preserving hashes and other queries. */
export function withSiteStyle(target: string, style: SiteStyleId = readSiteStyle(), base?: string): string {
  if (target.startsWith('#')) return target;
  const origin = base ?? (typeof window === 'undefined' ? 'https://sxxw.site/' : window.location.href);
  const url = new URL(target, origin);
  if (url.origin !== new URL(origin).origin || !url.pathname.endsWith('/')) return target;
  if (!isSiteStyle(url.searchParams.get('style'))) {
    let stored = false;
    try { stored = typeof window !== 'undefined' && window.localStorage.getItem(STYLE_STORAGE_KEY) === style; } catch { /* Carry the choice in the URL instead. */ }
    if (stored) url.searchParams.delete('style');
    else url.searchParams.set('style', style);
  }
  if (url.searchParams.get('preview') === 'styles') url.searchParams.delete('preview');
  return `${url.pathname}${url.search}${url.hash}`;
}
