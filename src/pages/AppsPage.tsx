import ThemeToggle from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n } from '../i18n/I18nProvider';

const apps = [
  { name: 'Memoria · 拾忆', platform: 'App Store · HarmonyOS', descKey: 'apps.memoria.desc', href: '/apps/memoria/', tagKey: 'apps.memoria.tag' },
  { name: '时光轨迹 TimeTrails', platform: 'App Store · iPhone / Apple Watch', descKey: 'apps.timetrails.desc', href: '/apps/timetrails/', tagKey: 'apps.timetrails.tag' },
  { name: '出行轨迹 TraceApp', platform: 'App Store · iPhone', descKey: 'apps.traceapp.desc', href: '/apps/traceapp/', tagKey: 'apps.traceapp.tag' },
];

export default function AppsPage() {
  const { t } = useI18n();
  return <><ThemeToggle />
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="/" aria-label={t('home.common.company')}><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">{t('home.common.company')}</span><span className="en">Products · Support · Privacy</span></span></a>
      <nav className="nav-menu nav-menu-static"><a className="nav-link" href="/">{t('home.nav.home')}</a><a className="nav-link" href="/support/">{t('nav.support')}</a><a className="nav-link cta-nav" href="/contact/">{t('home.nav.contact')}</a><LanguageSelect /></nav>
    </div></header>
    <main className="product-page"><div className="container product-page-inner">
      <section className="product-hero apps-hero"><p className="route-eyebrow">{t('apps.hero.eyebrow')}</p><h1>{t('apps.hero.title')}</h1><p>{t('apps.hero.desc')}</p></section>
      <section className="app-directory" aria-label={t('nav.apps')}>{apps.map((app, index) => <article className="app-directory-card" key={app.name}><span className="app-index">0{index + 1}</span><div className="app-main"><p>{app.platform}</p><h2>{app.name}</h2><span>{t(app.descKey)}</span></div><div className="app-actions"><em>{t(app.tagKey)}</em><a className="btn-ghost" href={app.href}>{t('apps.card.cta')}</a></div></article>)}</section>
    </div></main>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{t('home.common.company')}</div><div className="footer-slogan">{t('apps.footer.slogan')}</div></div></div></footer>
  </>;
}
