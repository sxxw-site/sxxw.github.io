export const STYLE_STORAGE_KEY = 'sxxw-site-style';
export const THEME_STORAGE_KEY = 'sxxw-theme';
export const STYLE_CHANGE_EVENT = 'sxxw-style-change';

export const STYLE_OPTIONS = [
  { id: 'paper', name: '暖纸小屋', nameEn: 'Warm paper', summary: '暖橙配色与柔和边角', summaryEn: 'Warm accents and soft corners', colors: ['#f7f5ef', '#9b481f', '#29251f'], darkColors: ['#1c1b18', '#efac7e', '#f1ede4'] },
  { id: 'minimal', name: '留白极简', nameEn: 'Minimal', summary: '黑白层次与居中布局', summaryEn: 'Neutral tones and a centered layout', colors: ['#ffffff', '#171917', '#f7f7f5'], darkColors: ['#141414', '#e7e7e7', '#303030'] },
  { id: 'forest', name: '林间编辑', nameEn: 'Forest editorial', summary: '森林配色与目录排版', summaryEn: 'Forest tones and editorial type', colors: ['#f4f5ed', '#244d3f', '#dfe5d7'], darkColors: ['#14221b', '#afd19b', '#eaf0e6'] },
] as const;

export type SiteStyleId = typeof STYLE_OPTIONS[number]['id'];
export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorTheme = 'light' | 'dark';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function resolveThemePreference(search: string, saved: string | null): ThemePreference {
  const requested = new URLSearchParams(search).get('theme');
  return isThemePreference(requested) ? requested : isThemePreference(saved) ? saved : 'system';
}

export function resolveColorTheme(preference: ThemePreference, systemDark: boolean): ColorTheme {
  return preference === 'system' ? systemDark ? 'dark' : 'light' : preference;
}

function savedValue(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function readSiteTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const active = document.documentElement.dataset.themePreference;
  return isThemePreference(active) ? active : resolveThemePreference(window.location.search, savedValue(THEME_STORAGE_KEY));
}

export function readColorTheme(): ColorTheme {
  return resolveColorTheme(readSiteTheme(), typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches);
}

export function isSiteStyle(value: unknown): value is SiteStyleId {
  return STYLE_OPTIONS.some((option) => option.id === value);
}

export function resolveSiteStyle(search: string, saved: string | null): SiteStyleId {
  const requested = new URLSearchParams(search).get('style');
  return isSiteStyle(requested) ? requested : isSiteStyle(saved) ? saved : 'paper';
}

export function readSiteStyle(): SiteStyleId {
  if (typeof window === 'undefined') return 'paper';
  const active = document.documentElement.dataset.siteStyle;
  return isSiteStyle(active) ? active : resolveSiteStyle(window.location.search, savedValue(STYLE_STORAGE_KEY));
}

function storeValue(key: string, value: string): boolean {
  try { window.localStorage.setItem(key, value); return window.localStorage.getItem(key) === value; } catch { return false; }
}

function applyStyle(style: SiteStyleId, preference: ThemePreference = readSiteTheme()) {
  const theme = resolveColorTheme(preference, !!window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.siteStyle = style;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = theme;
  const option = STYLE_OPTIONS.find((item) => item.id === style)!;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', (theme === 'dark' ? option.darkColors : option.colors)[0]);
  return { style: storeValue(STYLE_STORAGE_KEY, style), theme: storeValue(THEME_STORAGE_KEY, preference) };
}

function updateStyleUrl(style: SiteStyleId, stored: { style: boolean; theme: boolean }, preference: ThemePreference) {
  const url = new URL(window.location.href);
  if (url.searchParams.get('preview') === 'styles') url.searchParams.delete('preview');
  if (stored.style) url.searchParams.delete('style');
  else url.searchParams.set('style', style);
  if (stored.theme) url.searchParams.delete('theme');
  else url.searchParams.set('theme', preference);
  // A restricted WebView must still boot when history writes are unavailable.
  try { window.history.replaceState(window.history.state, '', url); } catch { /* Keep the active DOM state. */ }
}

export function initializeSiteStyle() {
  const style = resolveSiteStyle(window.location.search, savedValue(STYLE_STORAGE_KEY));
  const preference = resolveThemePreference(window.location.search, savedValue(THEME_STORAGE_KEY));
  const stored = applyStyle(style, preference);
  updateStyleUrl(style, stored, preference);
  return style;
}

export function setSiteStyle(style: SiteStyleId) {
  if (!isSiteStyle(style)) return;
  const preference = readSiteTheme();
  const stored = applyStyle(style, preference);
  updateStyleUrl(style, stored, preference);
  window.dispatchEvent(new CustomEvent<SiteStyleId>(STYLE_CHANGE_EVENT, { detail: style }));
}

export function setSiteTheme(preference: ThemePreference) {
  if (!isThemePreference(preference)) return;
  const style = readSiteStyle();
  const stored = applyStyle(style, preference);
  updateStyleUrl(style, stored, preference);
  window.dispatchEvent(new CustomEvent<SiteStyleId>(STYLE_CHANGE_EVENT, { detail: style }));
}

export function refreshSystemTheme() {
  if (readSiteTheme() === 'system') setSiteTheme('system');
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
  const preference = readSiteTheme();
  if (!isThemePreference(url.searchParams.get('theme'))) {
    if (typeof window !== 'undefined' && savedValue(THEME_STORAGE_KEY) === preference) url.searchParams.delete('theme');
    else url.searchParams.set('theme', preference);
  }
  if (url.searchParams.get('preview') === 'styles') url.searchParams.delete('preview');
  return `${url.pathname}${url.search}${url.hash}`;
}
