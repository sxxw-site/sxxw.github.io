import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider, loadDictionary } from './i18n/I18nProvider';
import { DEFAULT_LANGUAGE } from './i18n/config';
import { langHref, splitLangPath } from './i18n/path';
import './styles/site.css';
import './styles/language-select.css';

const { lang, path, hasPrefix } = splitLangPath(window.location.pathname);

// 带语言前缀的页面：先把该语言字典加载好再渲染，避免静态页(正确语言)被客户端默认中文覆盖闪烁。
// 根路径(中文/自动识别)沿用原行为。
async function boot() {
  const dictionary = hasPrefix ? await loadDictionary(lang).catch(() => undefined) : undefined;
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <I18nProvider initialLanguage={hasPrefix ? lang : undefined} dictionary={dictionary}>
        <App path={path} />
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
  const cur = current.hasPrefix ? current.lang : DEFAULT_LANGUAGE;
  if (cur === DEFAULT_LANGUAGE) return; // 中文根页面：链接保持根路径
  if (splitLangPath(href).hasPrefix) return; // 已带前缀
  event.preventDefault();
  window.location.assign(langHref(cur, href));
});
