import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider, loadDictionary } from './i18n/I18nProvider';
import { DEFAULT_LANGUAGE, normalizeLanguageCode } from './i18n/config';
import { splitLangPath } from './i18n/path';
import SiteAppearance from './components/SiteAppearance';
import { initializeSiteStyle } from './lib/site-style';
import { localizedSiteHref } from './lib/site-navigation';
import './styles/site.css';
import './styles/language-select.css';
import './styles/themes/paper.css';
import './styles/themes/minimal.css';
import './styles/themes/forest.css';

initializeSiteStyle();

const { lang, path, hasPrefix } = splitLangPath(window.location.pathname);
const utilityPage = path === '/feedback/' || path === '/migrate/';
const explicitLanguage = new URLSearchParams(window.location.search).get('lang');
// Public URLs keep their authored language, regardless of saved/browser preferences.
// Preserve explicit language parameters used by existing app WebViews and utility pages.
const pageLanguage = hasPrefix ? lang : explicitLanguage || (utilityPage ? undefined : DEFAULT_LANGUAGE);

// Load the URL's dictionary before rendering so the static page keeps its language.
async function boot() {
  const dictionary = pageLanguage ? await loadDictionary(pageLanguage).catch(() => undefined) : undefined;
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider initialLanguage={pageLanguage} dictionary={dictionary}>
        <SiteAppearance><App path={path} /></SiteAppearance>
      </I18nProvider>
    </StrictMode>,
  );
}
void boot();

// 在带语言前缀的页面上，把站内根绝对链接的点击改为带前缀跳转，保持语言与 URL 一致。
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as HTMLElement)?.closest?.('a');
  if (!anchor) return;
  if (anchor.hasAttribute('hreflang')) return; // Language links already name their intended URL.
  if (anchor.target && anchor.target !== '_self') return;
  const href = anchor.getAttribute('href') || '';
  if (!href.startsWith('/') || href.startsWith('//')) return; // 仅处理站内根绝对路径
  const current = splitLangPath(window.location.pathname);
  const cur = current.hasPrefix ? current.lang : normalizeLanguageCode(document.documentElement.lang) || DEFAULT_LANGUAGE;
  const target = localizedSiteHref(cur, href);
  if (target === href) return;
  event.preventDefault();
  window.location.assign(target);
});
