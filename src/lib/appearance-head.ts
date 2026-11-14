import { STYLE_OPTIONS } from './site-style';

// The dev shell and every prerendered page use this same, synchronous first-paint script.
function bootstrapAppearance(palettes: Record<string, { light: string; dark: string }>) {
  const params = new URLSearchParams(location.search);
  let savedStyle: string | null = null;
  let savedTheme: string | null = null;
  try { savedStyle = localStorage.getItem('sxxw-site-style'); } catch { /* Browser storage is optional. */ }
  try { savedTheme = localStorage.getItem('sxxw-theme'); } catch { /* Browser storage is optional. */ }
  const requestedStyle = params.get('style');
  const requestedTheme = params.get('theme');
  const style = requestedStyle && Object.prototype.hasOwnProperty.call(palettes, requestedStyle) ? requestedStyle
    : savedStyle && Object.prototype.hasOwnProperty.call(palettes, savedStyle) ? savedStyle : 'paper';
  const modes = ['system', 'light', 'dark'];
  const preference = requestedTheme && modes.includes(requestedTheme) ? requestedTheme
    : savedTheme && modes.includes(savedTheme) ? savedTheme : 'system';
  let systemDark = false;
  try { systemDark = matchMedia('(prefers-color-scheme: dark)').matches; } catch { /* Use light if the API is unavailable. */ }
  const theme = preference === 'system' ? systemDark ? 'dark' : 'light' : preference;
  const root = document.documentElement;
  root.dataset.siteStyle = style;
  root.dataset.themePreference = preference;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palettes[style][theme as 'light' | 'dark']);
  if (params.get('embed') === '1') root.classList.add('embed');
  root.classList.add('js');
}

const palettes = Object.fromEntries(STYLE_OPTIONS.map((option) => [option.id, { light: option.colors[0], dark: option.darkColors[0] }]));
export const appearanceHeadScript = `(${bootstrapAppearance.toString()})(${JSON.stringify(palettes)});`;
