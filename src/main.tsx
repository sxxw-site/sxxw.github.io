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

// 带语言前缀的页面：先把该语言字典加载好再渲染，避免静态页(正确语言)被客户端默认中文覆盖闪烁。
// 根路径(中文/自动识别)沿用原行为。
async function boot() {
  const dictionary = hasPrefix ? await loadDictionary(lang).catch(() => undefined) : undefined;
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider initialLanguage={hasPrefix ? lang : undefined} dictionary={dictionary}>
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
