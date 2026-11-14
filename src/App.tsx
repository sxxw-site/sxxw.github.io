import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { normalizePath, routeFor } from './app/routes';
import { pageMeta } from './app/meta';
import { useI18n } from './i18n/I18nProvider';
import MemoriaPage from './pages/MemoriaPage';
import TimeTrailsPage from './pages/TimeTrailsPage';
import TraceAppPage from './pages/TraceAppPage';
import AppsPage from './pages/AppsPage';
import SupportPage from './pages/SupportPage';
import FeedbackPage from './pages/FeedbackPage';
import MigratePage from './pages/MigratePage';
import SearchPage from './pages/SearchPage';
import CompanyPage from './pages/CompanyPage';
import { SiteFooter, SiteHeader } from './components/SiteChrome';
import LanguageSelect from './components/LanguageSelect';
import { timeTrailsScreenshot } from './lib/timetrails';
import { langHref } from './i18n/path';
import { previewImage } from './lib/app-preview';
import './styles/studio.css';

const HOME_APPS = [
  { id: 'memoria', name: '纪念日', platform: 'iOS · HarmonyOS', image: '/apps/memoria/ios/shot-01.png', width: 1080, height: 2346, href: '/apps/memoria/' },
  { id: 'timetrails', name: '足迹-时光轨迹', platform: 'iPhone · iPad · Apple Watch', image: '', width: 1320, height: 2868, href: '/apps/timetrails/' },
  { id: 'traceapp', name: '出行轨迹 TraceApp', platform: 'iPhone', image: '/apps/traceapp/shot-01.png', width: 392, height: 250, href: '/apps/traceapp/' },
];

function BrandMark() {
  return <img className="brand-logo" src="/apple-touch-icon.png" alt="" aria-hidden="true" width={36} height={36} />;
}

export default function App({ path }: { path?: string }) {
  const { language, t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const rawPath = path ?? (typeof window === 'undefined' ? '/' : window.location.pathname);
  const pathname = /^\/index\.html\/?$/.test(rawPath) ? '/' : normalizePath(rawPath);
  const route = routeFor(pathname);
  const href = (target: string) => langHref(language.normalizedCode, target);

  useEffect(() => {
    // 非中文:用本地化 pageMeta 覆盖(与按语言预渲染的 <title> 一致);中文:用 routes.ts 的精修文案
    const localized = language.normalizedCode === 'zh-hans' ? null : pageMeta(pathname, t);
    document.title = localized?.title ?? route?.title ?? t('home.meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', localized?.description ?? route?.description ?? t('home.meta.description'));
  }, [route, t, language, pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function closeOnDesktop() {
      if (window.matchMedia('(min-width: 901px)').matches) setIsMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuToggle.current?.focus();
      }
      if (event.key === 'Tab') {
        const items = [menuToggle.current, ...Array.from(navigation.current?.querySelectorAll<HTMLElement>('a, select') ?? [])].filter((item): item is HTMLElement => !!item);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const closeMenu = () => setIsMenuOpen(false);
    window.addEventListener('sxxw-appearance-open', closeMenu);
    return () => window.removeEventListener('sxxw-appearance-open', closeMenu);
  }, []);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = event.currentTarget.getAttribute('href');
    setIsMenuOpen(false);
    if (!target?.startsWith('#') || target === '#') return;
    const section = document.querySelector(target);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (section instanceof HTMLElement) section.focus({ preventScroll: true });
  }

  if (pathname !== '/') {
    if (pathname === '/apps/') return <AppsPage />;
    if (pathname === '/support/') return <SupportPage />;
    if (pathname === '/feedback/') return <FeedbackPage />;
    if (pathname === '/migrate/') return <MigratePage />;
    if (pathname === '/search/') return <SearchPage />;
    if (pathname === '/about/' || pathname === '/contact/') return <CompanyPage kind={pathname === '/about/' ? 'about' : 'contact'} />;
    if (pathname.startsWith('/apps/memoria/')) return <MemoriaPage path={pathname} />;
    if (pathname.startsWith('/apps/timetrails/')) return <TimeTrailsPage path={pathname} />;
    if (pathname.startsWith('/apps/traceapp/')) return <TraceAppPage path={pathname} />;
    return <RouteScaffold />;
  }

  return <div className="studio-home">
    <header className="navbar"><div className="container nav-inner">
      <a className="skip-link" href="#main">{language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue' ? '跳到正文' : 'Skip to content'}</a>
      <a className="brand" href="#hero" aria-label={t('home.meta.title')} onClick={handleAnchorClick}><BrandMark /><span className="brand-text"><span className="cn">{t('home.common.company')}</span><span className="en">{t('home.brand.en')}</span></span></a>
      <span className="site-appearance-slot" data-appearance-slot />
      <button ref={menuToggle} className={`nav-toggle${isMenuOpen ? ' open' : ''}`} aria-label={t('home.nav.toggle')} aria-expanded={isMenuOpen} aria-controls="home-navigation" onClick={() => setIsMenuOpen((open) => !open)}><span className="bar" /><span className="bar" /><span className="bar" /></button>
      <nav ref={navigation} id="home-navigation" className={`nav-menu${isMenuOpen ? ' open' : ''}`} aria-label={t('home.nav.toggle')}>
        <a href={href('/apps/')} className="nav-link">{t('nav.apps')}</a><a href="#about" className="nav-link" onClick={handleAnchorClick}>{t('home.nav.about')}</a><a href={href('/support/')} className="nav-link">{t('nav.support')}</a><a href={href('/search/')} className="nav-link">{t('nav.search')}</a><LanguageSelect />
      </nav>
    </div></header>

    <main id="main" tabIndex={-1}>
      <section id="hero" className="hero studio-hero" tabIndex={-1} aria-labelledby="hero-heading">
        <div className="container studio-hero-grid">
          <div className="studio-hero-copy">
            <p className="studio-label">{t('home.brand.en')}</p>
            <h1 id="hero-heading">{t('home.hero.title')}</h1>
            <p className="studio-hero-lead">{t('home.hero.desc')}</p>
            <div className="hero-cta-row"><a className="btn-primary" href={href('/apps/')}>{t('home.products.action')}<Arrow /></a><a className="studio-text-link" href="#contact" onClick={handleAnchorClick}>{t('home.hero.cta.contact')}</a></div>
            <p className="studio-availability">App Store <span aria-hidden="true">/</span> HarmonyOS</p>
          </div>
          <div className="studio-hero-media" aria-label={t('home.hero.previewLabel')}>
            <img {...previewImage('/apps/memoria/ios/shot-01.png', '(max-width: 520px) 110px, (max-width: 820px) 130px, (max-width: 1023px) 180px, 208px')} alt={t('home.hero.memoriaAlt')} width={1080} height={2346} />
            <img {...previewImage(timeTrailsScreenshot(language.normalizedCode, 'overview'), '(max-width: 520px) 110px, (max-width: 820px) 130px, (max-width: 1023px) 180px, 208px')} alt={t('home.hero.timetrailsAlt')} width={1320} height={2868} />
          </div>
        </div>
      </section>

      <section id="products" className="studio-section studio-products" aria-labelledby="products-heading">
        <div className="container">
          <div className="studio-section-head"><div><p className="studio-label">{t('nav.apps')}</p><h2 id="products-heading">{t('home.products.title')}</h2></div><p>{t('home.products.description')}</p></div>
          <div className="studio-product-grid">{HOME_APPS.map((app) => <article className={`studio-product studio-product-${app.id}`} key={app.id}>
            <a className="studio-product-image" href={href(app.href)} tabIndex={-1} aria-hidden="true"><img {...(app.id === 'traceapp' ? { src: app.image } : previewImage(app.image || timeTrailsScreenshot(language.normalizedCode, 'globe'), '(max-width: 1023px) 112px, 126px'))} alt="" width={app.width} height={app.height} loading="lazy" /></a>
            <div className="studio-product-body"><p className="studio-platform">{app.platform}</p><h3><a href={href(app.href)}>{app.name}<Arrow /></a></h3><p>{t(`apps.${app.id}.desc`)}</p></div>
          </article>)}</div>
        </div>
      </section>

      <section id="about" className="studio-section studio-about" tabIndex={-1} aria-labelledby="about-heading"><div className="container studio-about-grid">
        <div><p className="studio-label">{t('home.nav.about')}</p><h2 id="about-heading">{t('home.about.title')}</h2><p className="studio-about-lead">{t('home.about.desc.0')}</p><a className="studio-text-link" href={href('/support/')}>{t('home.about.links.support')}<Arrow /></a></div>
        <dl className="studio-principles">{[0, 1, 2].map((item) => <div key={item}><dt>{t(`home.about.hl.${item}.num`)}</dt><dd>{t(`home.about.hl.${item}.text`)}</dd></div>)}</dl>
      </div></section>
    </main>

    <footer id="contact" className="studio-contact closing" tabIndex={-1}><div className="container">
      <div className="studio-contact-head"><div><p className="studio-label">{t('home.nav.contact')}</p><h2>{t('home.contact.title')}</h2><p>{t('home.contact.hint')}</p></div><a className="studio-email" href={t('home.common.email_mailto')}>{t('home.common.email')}<Arrow /></a></div>
      <div className="studio-footer-bottom"><div className="studio-footer-brand"><BrandMark /><div><p>{t('home.common.company')}</p><span>{t('home.common.city')}</span></div></div><div className="footer-links"><a href={href('/apps/')}>{t('nav.apps')}</a><a href={href('/support/')}>{t('nav.support')}</a><a href={href('/search/')}>{t('nav.search')}</a></div></div>
      <p className="studio-legal">{t('home.footer.legal')}</p>
    </div></footer>

    <noscript>{t('home.noscript')}</noscript>
  </div>;
}

function Arrow() {
  return <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

function RouteScaffold() {
  const { t, language } = useI18n();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  return <><SiteHeader /><main className="route-page" id="page-content" tabIndex={-1}><div className="container route-page-inner"><p className="page-eyebrow">404</p><h1 className="page-title">{zh ? '找不到这个页面' : 'Page not found'}</h1><p className="page-lead">{zh ? '链接可能已更新。你可以返回应用中心，或搜索要找的内容。' : 'The link may have changed. Browse the apps or search for the page you need.'}</p><div className="action-row"><a className="btn-primary" href={langHref(language.normalizedCode, '/apps/')}>{t('nav.apps')}</a><a className="btn-ghost" href={langHref(language.normalizedCode, '/search/')}>{t('nav.search')}</a></div></div></main><SiteFooter /></>;
}
