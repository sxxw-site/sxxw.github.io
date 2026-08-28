import { useEffect, useState, type MouseEvent } from 'react';
import { routeFor } from './app/routes';
import { useI18n } from './i18n/I18nProvider';
import MemoriaPage from './pages/MemoriaPage';
import TimeTrailsPage from './pages/TimeTrailsPage';
import TraceAppPage from './pages/TraceAppPage';
import AppsPage from './pages/AppsPage';
import ThemeToggle from './components/ThemeToggle';

const HOME_APPS = [
  { name: 'Memoria · 拾忆', en: 'App Store · HarmonyOS', tagline: '记录生日、纪念日与重要日子的倒数与提醒；数据本地优先。', href: '/apps/memoria/' },
  { name: '时光轨迹 TimeTrails', en: 'App Store · iPhone / Apple Watch', tagline: '隐私优先的 GPS 轨迹记录，把走过的路留在自己的时间里。', href: '/apps/timetrails/' },
  { name: '出行轨迹 TraceApp', en: 'App Store · iPhone', tagline: '本地优先的出行轨迹记录，路径、里程与配速一目了然。', href: '/apps/traceapp/' },
];

function BrandMark() {
  return <span className="brand-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" role="img"><circle cx="11" cy="10" r="6" fill="url(#gradTree)" /><rect x="9.5" y="14" width="3" height="6" rx="1" fill="#e5e5e5" /><path d="M20 15 L26 19 L26 27 L14 27 L14 19 Z" fill="#18181b" stroke="#e5e5e5" strokeWidth="1.5" /><path d="M14 19 L20 15 L26 19" fill="#18181b" stroke="#e5e5e5" strokeWidth="1.5" /><rect x="18" y="21" width="4" height="6" fill="#0a0a0b" stroke="#e5e5e5" strokeWidth="1" rx="0.5" /><defs><radialGradient id="gradTree" cx="0" cy="0" r="1" gradientTransform="translate(9 8) rotate(45) scale(10)" gradientUnits="userSpaceOnUse"><stop stopColor="#e5e5e5" /><stop offset="1" stopColor="#52525b" /></radialGradient></defs></svg></span>;
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
    if (pathname === '/apps/') return <AppsPage />;
    if (pathname.startsWith('/apps/memoria/')) return <MemoriaPage path={pathname} />;
    if (pathname.startsWith('/apps/timetrails/')) return <TimeTrailsPage path={pathname} />;
    if (pathname.startsWith('/apps/traceapp/')) return <TraceAppPage path={pathname} />;
    return <RouteScaffold routeTitle={route?.title ?? '页面未找到'} routeDescription={route?.description ?? '你访问的页面不存在或正在准备中。'} />;
  }

  return <>
    <ThemeToggle />
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="#hero" aria-label={t('home.meta.title')} onClick={handleAnchorClick}><BrandMark /><span className="brand-text"><span className="cn">{t('home.common.company')}</span><span className="en">{t('home.brand.en')}</span></span></a>
      <button className={`nav-toggle${isMenuOpen ? ' open' : ''}`} aria-label={t('home.nav.toggle')} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}><span className="bar" /><span className="bar" /><span className="bar" /></button>
      <nav className={`nav-menu${isMenuOpen ? ' open' : ''}`}>
        <a href="#hero" className="nav-link" onClick={handleAnchorClick}>{t('home.nav.home')}</a><a href="/apps/" className="nav-link">应用中心</a><a href="#about" className="nav-link" onClick={handleAnchorClick}>{t('home.nav.about')}</a><a href="#contact" className="nav-link cta-nav" onClick={handleAnchorClick}>{t('home.nav.contact')}</a>
        <div className="lang-wrap" aria-label="Language switcher"><select className="lang-select" aria-label="Language" value={language.normalizedCode} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item.normalizedCode} value={item.normalizedCode}>{item.label}</option>)}</select><span className="lang-caret">▾</span></div>
      </nav>
    </div></header>

    <section id="hero" className="hero-section pixel-hero"><div className="hero-bg" aria-hidden="true"><span className="hero-grid" /></div><div className="container hero-stack reveal">
      <span className="hero-chip"><span className="live" aria-hidden="true" />{t('home.brand.en')}</span>
      <h1 className="hero-title"><HtmlText value={t('home.hero.title')} /></h1>
      <p className="hero-desc">{t('home.hero.desc')}</p>
      <div className="hero-cta-row"><a className="btn-primary" href="/apps/">浏览应用中心</a><a className="btn-ghost" href="#contact" onClick={handleAnchorClick}>{t('home.hero.cta.contact')}</a></div>
      <div className="stat-strip">{[0, 1, 2].map((item) => <div className="stat-cell" key={item}><b>{t(`home.hero.meta.${item}.num`)}</b><span>{t(`home.hero.meta.${item}.label`)}</span></div>)}</div>
    </div></section>

    <section id="products" className="section band"><div className="container reveal">
      <p className="kicker"><b>01</b> Products · 旗下应用</p>
      <h2 className="section-title">已上线的产品</h2>
      <div className="app-directory">{HOME_APPS.map((app, index) => <a className="app-directory-card" href={app.href} key={app.name}><span className="app-index">0{index + 1}</span><div className="app-main"><p>{app.en}</p><h2 className="app-name">{app.name}</h2><span>{app.tagline}</span></div><div className="app-actions"><span className="app-cta">查看应用 →</span></div></a>)}</div>
    </div></section>

    <section id="about" className="section band"><div className="container reveal">
      <p className="kicker"><b>02</b> About · 关于我们</p>
      <h2 className="section-title">{t('home.about.title')}</h2>
      <p className="section-desc lead">{t('home.about.desc.0')}</p>
      <div className="adv-grid">{[0, 1, 2].map((item) => <article className="adv-block" key={item}><span className="adv-no">0{item + 1}</span><h3>{t(`home.about.hl.${item}.num`)}</h3><p>{t(`home.about.hl.${item}.text`)}</p></article>)}</div>
      <div className="do-panel"><p className="about-mini-title">{t('home.about.card.title')}</p><ul className="about-list">{[0, 1, 2, 3].map((item) => <li key={item}>{t(`home.about.card.list.${item}`)}</li>)}</ul><p className="about-mini-note">{t('home.about.card.note')}</p></div>
    </div></section>

    <section id="contact" className="section band"><div className="container reveal">
      <p className="kicker"><b>03</b> Contact · 联系方式</p>
      <h2 className="section-title">{t('home.contact.title')}</h2>
      <div className="contact-card" style={{ maxWidth: 760 }}><div className="contact-row"><div className="contact-label">{t('home.contact.label.company')}</div><div className="contact-value">{t('home.common.company')}</div></div><div className="contact-row"><div className="contact-label">{t('home.contact.label.email')}</div><div className="contact-value"><a className="linkish" href={t('home.common.email_mailto')}>{t('home.common.email')}</a></div></div><div className="contact-row"><div className="contact-label">{t('home.contact.label.city')}</div><div className="contact-value">{t('home.common.city')}</div></div></div>
      <p className="contact-hint">{t('home.contact.hint')}</p>
    </div></section>

    <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{t('home.common.company')}</div><div className="footer-slogan">{t('home.footer.slogan')}</div></div><div className="footer-right"><div className="footer-links"><a href="#hero" onClick={handleAnchorClick}>{t('home.footer.links.home')}</a><a href="#about" onClick={handleAnchorClick}>{t('home.footer.links.about')}</a><a href="#contact" onClick={handleAnchorClick}>{t('home.footer.links.contact')}</a></div><div className="footer-legal"><span>{t('home.footer.legal')}</span></div></div></div></footer>
    <noscript>{t('home.noscript')}</noscript>
  </>;
}

function RouteScaffold({ routeTitle, routeDescription }: { routeTitle: string; routeDescription: string }) {
  return <>
    <ThemeToggle />
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><BrandMark /><span className="brand-text"><span className="cn">上海树下小屋网络科技有限公司</span><span className="en">TreeHouse Tech · Shanghai</span></span></a>
      <nav className="nav-menu nav-menu-static"><a href="/" className="nav-link">首页</a><a href="/apps/" className="nav-link cta-nav">应用中心</a></nav>
    </div></header>
    <main className="route-page"><div className="container route-page-inner"><p className="route-eyebrow">sxxw.site · 应用支持中心</p><h1 className="route-title">{routeTitle}</h1><p className="route-description">{routeDescription}</p><p className="route-note">该页面的完整内容将按已公开的产品事实、适用平台和正式法律文本逐项发布。</p><a className="btn-primary" href="/apps/">查看应用中心</a></div></main>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">上海树下小屋网络科技有限公司</div><div className="footer-slogan">产品介绍 · 新手引导 · 隐私与支持</div></div></div></footer>
  </>;
}
