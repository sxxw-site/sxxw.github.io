import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import type { Dictionary } from './i18n/config';
export { siteRoutes } from './app/routes';
export { pageMeta } from './app/meta';

export function renderRoute(path: string, lang = 'zh-hans', dictionary?: Dictionary): string {
  return renderToStaticMarkup(
    <I18nProvider initialLanguage={lang} dictionary={dictionary}>
      <App path={path} />
    </I18nProvider>,
  );
}
