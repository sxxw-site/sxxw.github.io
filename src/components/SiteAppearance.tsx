import { useEffect, useState, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import StyleSwitcher from './StyleSwitcher';
import { initializeSiteStyle, readSiteStyle, withSiteStyle, STYLE_CHANGE_EVENT, STYLE_STORAGE_KEY } from '../lib/site-style';

export default function SiteAppearance({ children }: PropsWithChildren) {
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1100px)');
    const update = () => setHeaderSlot(media.matches ? document.querySelector<HTMLElement>('[data-appearance-slot]') : null);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
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
      if (event.key === STYLE_STORAGE_KEY) onHistory();
    };
    window.addEventListener(STYLE_CHANGE_EVENT, updateLinks);
    window.addEventListener('popstate', onHistory);
    window.addEventListener('storage', onStorage);
    return () => {
      observer.disconnect();
      window.removeEventListener(STYLE_CHANGE_EVENT, updateLinks);
      window.removeEventListener('popstate', onHistory);
      window.removeEventListener('storage', onStorage);
      document.querySelectorAll<HTMLAnchorElement>('a[data-site-original-href]').forEach((anchor) => {
        if (anchor.getAttribute('href') === anchor.dataset.siteDecoratedHref) anchor.setAttribute('href', anchor.dataset.siteOriginalHref!);
        delete anchor.dataset.siteOriginalHref;
        delete anchor.dataset.siteDecoratedHref;
      });
    };
  }, []);
  return <>{children}{headerSlot ? createPortal(<StyleSwitcher inHeader />, headerSlot) : <StyleSwitcher />}</>;
}
