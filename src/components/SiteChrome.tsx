import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { localizedSiteHref } from '../lib/site-navigation';
import LanguageSelect from './LanguageSelect';
import '../styles/site-chrome.css';

type Section = 'apps' | 'support' | 'search' | 'about' | 'contact';
type Link = { href: string; label: string };

export function SiteHeader({ brand, subtitle, active }: { brand?: string; subtitle?: string; active?: Section }) {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const menuId = useId();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  const links: Array<Link & { key: Section }> = [
    { key: 'apps', href: '/apps/', label: t('nav.apps') },
    { key: 'support', href: '/support/', label: t('nav.support') },
    { key: 'search', href: '/search/', label: t('nav.search') },
    { key: 'about', href: '/about/', label: t('home.nav.about') },
    { key: 'contact', href: '/contact/', label: t('home.nav.contact') },
  ];
  const href = (path: string) => localizedSiteHref(language.normalizedCode, path);

  useEffect(() => {
    const closeMenu = () => setOpen(false);
    window.addEventListener('sxxw-appearance-open', closeMenu);
    return () => window.removeEventListener('sxxw-appearance-open', closeMenu);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
      if (event.key === 'Tab') {
        const items = [toggle.current, ...Array.from(navigation.current?.querySelectorAll<HTMLElement>('a,select') ?? [])].filter((item): item is HTMLElement => !!item);
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const onResize = () => { if (window.matchMedia('(min-width: 1101px)').matches) setOpen(false); };
    const onOutside = (event: PointerEvent) => { if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return <header className="navbar site-header" ref={header}><div className="container nav-inner">
    <a className="skip-link" href="#page-content">{zh ? '跳到正文' : 'Skip to content'}</a>
    <a className="brand" href={href('/')} aria-label={t('home.common.company')}><img className="brand-logo" src="/apple-touch-icon.png" alt="" width={38} height={38} /><span className="brand-text"><span className="cn">{brand ?? t('home.common.company')}</span><span className="en">{subtitle ?? t('home.brand.en')}</span></span></a>
    <span className="site-appearance-slot" data-appearance-slot />
    <button className="site-menu-toggle" ref={toggle} type="button" aria-label={t('home.nav.toggle')} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)}><span /><span /></button>
    <nav className={`site-header-nav${open ? ' is-open' : ''}`} id={menuId} ref={navigation} aria-label={zh ? '网站导航' : 'Site navigation'}>
      {links.map((link) => <a className="site-nav-link" href={href(link.href)} aria-current={active === link.key ? 'page' : undefined} onClick={() => setOpen(false)} key={link.key}>{link.label}</a>)}
      <LanguageSelect />
    </nav>
  </div></header>;
}

export function SiteFooter({ appName, links }: { appName?: string; links?: Link[] }) {
  const { t, language } = useI18n();
  const footerLinks = links ?? [
    { href: '/apps/', label: t('nav.apps') }, { href: '/support/', label: t('nav.support') },
    { href: '/about/', label: t('home.nav.about') }, { href: '/contact/', label: t('home.nav.contact') },
  ];
  return <footer className="site-footer site-chrome-footer"><div className="container">
    <div className="site-footer-top"><a className="brand" href={localizedSiteHref(language.normalizedCode, '/')}><img className="brand-logo" src="/apple-touch-icon.png" alt="" width={38} height={38} loading="lazy" /><span className="brand-text"><span className="cn">{appName ?? t('home.common.company')}</span><span className="en">{t('home.brand.en')}</span></span></a><nav className="site-footer-nav" aria-label={language.normalizedCode.startsWith('zh') ? '页脚导航' : 'Footer navigation'}>{footerLinks.map((link) => <a href={localizedSiteHref(language.normalizedCode, link.href)} key={link.href}>{link.label}</a>)}</nav></div>
    <div className="site-footer-bottom"><p>{t('home.footer.legal')}</p><p>{t('home.common.city')}</p></div>
  </div></footer>;
}
