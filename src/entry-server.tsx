import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
export { siteRoutes } from './app/routes';

export function renderRoute(path: string): string {
  return renderToStaticMarkup(
    <I18nProvider initialLanguage="zh-hans">
      <App path={path} />
    </I18nProvider>,
  );
}
