import { useEffect, type PropsWithChildren } from 'react';
import { initializeSiteStyle, readSiteStyle, refreshSystemTheme, withSiteStyle, STYLE_CHANGE_EVENT, STYLE_STORAGE_KEY, THEME_STORAGE_KEY } from '../lib/site-style';

export default function SiteAppearance({ children }: PropsWithChildren) {
  useEffect(() => {
    initializeSiteStyle();
    function updateLinks() {
      const style = readSiteStyle();
      document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
        const current = anchor.getAttribute('href') ?? '';
        const last = anchor.dataset.siteDecoratedHref;
        const original = last === undefined || current !== last ? current : anchor.dataset.siteOriginalHref ?? current;
        anchor.dataset.siteOriginalHref = original;
        const next = withSiteStyle(original, style);
        anchor.dataset.siteDecoratedHref = next;
        if (current !== next) anchor.setAttribute('href', next);
      });
    }
    updateLinks();
    const observer = new MutationObserver(updateLinks);
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    const onHistory = () => {
      initializeSiteStyle();
      window.dispatchEvent(new CustomEvent(STYLE_CHANGE_EVENT, { detail: readSiteStyle() }));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STYLE_STORAGE_KEY || event.key === THEME_STORAGE_KEY) onHistory();
    };
    const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
    systemTheme?.addEventListener('change', refreshSystemTheme);
    window.addEventListener(STYLE_CHANGE_EVENT, updateLinks);
    window.addEventListener('popstate', onHistory);
    window.addEventListener('storage', onStorage);
    return () => {
      observer.disconnect();
      window.removeEventListener(STYLE_CHANGE_EVENT, updateLinks);
      window.removeEventListener('popstate', onHistory);
      window.removeEventListener('storage', onStorage);
      systemTheme?.removeEventListener('change', refreshSystemTheme);
      document.querySelectorAll<HTMLAnchorElement>('a[data-site-original-href]').forEach((anchor) => {
        if (anchor.getAttribute('href') === anchor.dataset.siteDecoratedHref) anchor.setAttribute('href', anchor.dataset.siteOriginalHref!);
        delete anchor.dataset.siteOriginalHref;
        delete anchor.dataset.siteDecoratedHref;
      });
    };
  }, []);
  return <>{children}</>;
}
