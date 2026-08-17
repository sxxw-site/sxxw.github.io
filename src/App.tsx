import { useEffect, useState, type MouseEvent } from 'react';
import { routeFor } from './app/routes';
import { useI18n } from './i18n/I18nProvider';
import MemoriaPage from './pages/MemoriaPage';
import TimeTrailsPage from './pages/TimeTrailsPage';
import TraceAppPage from './pages/TraceAppPage';

function BrandMark() {
  return <span className="brand-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" role="img"><circle cx="11" cy="10" r="6" fill="url(#gradTree)" /><rect x="9.5" y="14" width="3" height="6" rx="1" fill="#94ffcf" /><path d="M20 15 L26 19 L26 27 L14 27 L14 19 Z" fill="#1e293b" stroke="#94ffcf" strokeWidth="1.5" /><path d="M14 19 L20 15 L26 19" fill="#1e293b" stroke="#94ffcf" strokeWidth="1.5" /><rect x="18" y="21" width="4" height="6" fill="#0f172a" stroke="#94ffcf" strokeWidth="1" rx="0.5" /><defs><radialGradient id="gradTree" cx="0" cy="0" r="1" gradientTransform="translate(9 8) rotate(45) scale(10)" gradientUnits="userSpaceOnUse"><stop stopColor="#34d399" /><stop offset="1" stopColor="#065f46" /></radialGradient></defs></svg></span>;
}

function HtmlText({ value }: { value: string }) {
  return <span dangerouslySetInnerHTML={{ __html: value }} />;
}

export default function App({ path }: { path?: string }) {
  const { language, languages, setLanguage, t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = path ?? (typeof window === 'undefined' ? '/' : window.location.pathname);
  const route = routeFor(pathname);

  useEffect(() => {
    document.title = route?.title ?? t('home.meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', route?.description ?? t('home.meta.description'));
  }, [route, t]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window) || elements.length === 0) {
      elements.forEach((element) => element.classList.add('show'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = event.currentTarget.getAttribute('href');
    setIsMenuOpen(false);
    if (!target?.startsWith('#') || target === '#') return;
    const section = document.querySelector(target);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth' });
  }

  if (pathname !== '/') {
    if (pathname.startsWith('/apps/memoria/')) return <MemoriaPage path={pathname} />;
    if (pathname.startsWith('/apps/timetrails/')) return <TimeTrailsPage path={pathname} />;
    if (pathname.startsWith('/apps/traceapp/')) return <TraceAppPage path={pathname} />;
    return <RouteScaffold routeTitle={route?.title ?? '页面未找到'} routeDescription={route?.description ?? '你访问的页面不存在或正在准备中。'} />;
  }

  return <>
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="#hero" aria-label={t('home.meta.title')} onClick={handleAnchorClick}><BrandMark /><span className="brand-text"><span className="cn">{t('home.common.company')}</span><span className="en">{t('home.brand.en')}</span></span></a>
      <button className={`nav-toggle${isMenuOpen ? ' open' : ''}`} aria-label={t('home.nav.toggle')} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}><span className="bar" /><span className="bar" /><span className="bar" /></button>
      <nav className={`nav-menu${isMenuOpen ? ' open' : ''}`}>
        <a href="#hero" className="nav-link" onClick={handleAnchorClick}>{t('home.nav.home')}</a><a href="#about" className="nav-link" onClick={handleAnchorClick}>{t('home.nav.about')}</a><a href="#contact" className="nav-link cta-nav" onClick={handleAnchorClick}>{t('home.nav.contact')}</a>
        <div className="lang-wrap" aria-label="Language switcher"><select className="lang-select" aria-label="Language" value={language.normalizedCode} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item.normalizedCode} value={item.normalizedCode}>{item.label}</option>)}</select><span className="lang-caret">▾</span></div>
      </nav>
    </div></header>

    <section id="hero" className="hero-section"><div className="hero-bg" /><div className="container hero-inner">
      <div className="hero-copy reveal"><h1 className="hero-title"><HtmlText value={t('home.hero.title')} /></h1><p className="hero-desc">{t('home.hero.desc')}</p><div className="hero-cta-row"><a className="btn-primary" href="#contact" onClick={handleAnchorClick}>{t('home.hero.cta.contact')}</a><a className="btn-ghost" href="#about" onClick={handleAnchorClick}>{t('home.hero.cta.about')}</a></div><div className="hero-meta">{[0, 1, 2].map((item) => <div className="meta-item" key={item}><span className="meta-num">{t(`home.hero.meta.${item}.num`)}</span><span className="meta-label">{t(`home.hero.meta.${item}.label`)}</span></div>)}</div></div>
      <div className="hero-card reveal"><div className="mini-card"><p className="mini-head">{t('home.hero.mini.head')}</p><p className="mini-main">{t('home.hero.mini.main')}</p><ul className="mini-stats">{[0, 1, 2, 3].map((item) => <li key={item}><span>{t(`home.hero.mini.stats.${item}.k`)}</span><b>{t(`home.hero.mini.stats.${item}.v`)}</b></li>)}</ul><p className="mini-foot">{t('home.hero.mini.foot')}</p></div><div className="glass-note"><HtmlText value={t('home.hero.glass')} /></div></div>
    </div></section>

    <section id="about" className="section about-section"><div className="container about-inner"><div className="about-copy reveal"><h2 className="section-title">{t('home.about.title')}</h2><p className="section-desc">{t('home.about.desc.0')}</p><p className="section-desc">{t('home.about.desc.1')}</p><div className="about-highlights">{[0, 1, 2].map((item) => <div className="hl-box" key={item}><div className="hl-num">{t(`home.about.hl.${item}.num`)}</div><div className="hl-text">{t(`home.about.hl.${item}.text`)}</div></div>)}</div></div><div className="about-card reveal"><div className="about-glass"><p className="about-mini-title">{t('home.about.card.title')}</p><ul className="about-list">{[0, 1, 2, 3].map((item) => <li key={item}>{t(`home.about.card.list.${item}`)}</li>)}</ul><p className="about-mini-note">{t('home.about.card.note')}</p></div></div></div></section>

    <section id="contact" className="section contact-section"><div className="container contact-inner"><div className="contact-left reveal" style={{ maxWidth: 720 }}><h2 className="section-title">{t('home.contact.title')}</h2><div className="contact-card"><div className="contact-row"><div className="contact-label">{t('home.contact.label.company')}</div><div className="contact-value">{t('home.common.company')}</div></div><div className="contact-row"><div className="contact-label">{t('home.contact.label.email')}</div><div className="contact-value"><a className="linkish" href={t('home.common.email_mailto')}>{t('home.common.email')}</a></div></div><div className="contact-row"><div className="contact-label">{t('home.contact.label.city')}</div><div className="contact-value">{t('home.common.city')}</div></div></div><p className="contact-hint">{t('home.contact.hint')}</p></div></div></section>

    <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{t('home.common.company')}</div><div className="footer-slogan">{t('home.footer.slogan')}</div></div><div className="footer-right"><div className="footer-links"><a href="#hero" onClick={handleAnchorClick}>{t('home.footer.links.home')}</a><a href="#about" onClick={handleAnchorClick}>{t('home.footer.links.about')}</a><a href="#contact" onClick={handleAnchorClick}>{t('home.footer.links.contact')}</a></div><div className="footer-legal"><span>{t('home.footer.legal')}</span></div></div></div></footer>
    <noscript>{t('home.noscript')}</noscript>
  </>;
}

function RouteScaffold({ routeTitle, routeDescription }: { routeTitle: string; routeDescription: string }) {
  return <>
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><BrandMark /><span className="brand-text"><span className="cn">上海树下小屋网络科技有限公司</span><span className="en">TreeHouse Tech · Shanghai</span></span></a>
      <nav className="nav-menu nav-menu-static"><a href="/" className="nav-link">首页</a><a href="/apps/" className="nav-link cta-nav">应用中心</a></nav>
    </div></header>
    <main className="route-page"><div className="container route-page-inner"><p className="route-eyebrow">sxxw.site · 应用支持中心</p><h1 className="route-title">{routeTitle}</h1><p className="route-description">{routeDescription}</p><p className="route-note">该页面的完整内容将按已公开的产品事实、适用平台和正式法律文本逐项发布。</p><a className="btn-primary" href="/apps/">查看应用中心</a></div></main>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">上海树下小屋网络科技有限公司</div><div className="footer-slogan">产品介绍 · 新手引导 · 隐私与支持</div></div></div></footer>
  </>;
}
