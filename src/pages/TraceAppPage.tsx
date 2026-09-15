import traceapp from '../content/apps/traceapp.zh.json';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n } from '../i18n/I18nProvider';

type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
type T = (key: string) => string;
const APP = traceapp.appName;
const STORE = traceapp.storeName;
const descKey = (s: Section) => `trace.ui.desc.${s === 'getting-started' ? 'start' : s}`;
const tabWord = (t: T, s: Section) => t(`app.tab.${s === 'getting-started' ? 'start' : s}`);

export default function TraceAppPage({ path }: { path: string }) {
  const { t } = useI18n();
  const section: Section = path.includes('/getting-started/') ? 'getting-started' : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
  const title = section === 'overview' ? t('trace.tagline') : `${APP} ${tabWord(t, section)}`;
  const desc = section === 'overview' ? t('trace.desc') : t(descKey(section));
  return <><ThemeToggle /><TraceHeader /><main className="product-page"><div className="container product-page-inner">
    <nav className="breadcrumbs" aria-label="breadcrumb"><a href="/">{t('home.nav.home')}</a><span>／</span><a href="/apps/">{t('nav.apps')}</a><span>／</span><span>{APP}</span></nav>
    <section className="product-hero"><p className="route-eyebrow">{traceapp.platformName} · {STORE}</p><h1>{title}</h1><p>{desc}</p><TraceTabs active={section} /></section>
    <TraceBody section={section} />
  </div></main><TraceFooter /></>;
}

function TraceBody({ section }: { section: Section }) {
  const { t } = useI18n();
  if (section === 'overview') return <>
    <section className="content-section"><h2>{t('trace.ui.ovTitle')}</h2><div className="feature-grid">{traceapp.features.map((_, i) => <div className="feature-card" key={i}>{t(`trace.feat.${i}`)}</div>)}</div></section>
    <section className="privacy-facts"><h2>{t('trace.ui.privTitle')}</h2><p>{t('trace.ui.privBody')}</p><div className="action-row"><a className="btn-primary" href="/apps/traceapp/getting-started/">{t('app.cta.start')}</a><a className="btn-ghost" href="/apps/traceapp/privacy/">{t('app.cta.readPrivacy')}</a></div></section>
    <ScreenshotGallery />
    {traceapp.storeUrl && <a className="store-link" href={traceapp.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', STORE).replace('{app}', APP)}</a>}
  </>;
  if (section === 'getting-started') return <section className="content-section"><h2>{t('trace.ui.guideTitle')}</h2><ol className="guide-list">{traceapp.guide.map((_, i) => <li key={i}><span>{i + 1}</span><div><h3>{t(`trace.guide.${i}.t`)}</h3><p>{t(`trace.guide.${i}.b`)}</p></div></li>)}</ol></section>;
  if (section === 'privacy' || section === 'terms') { const document = traceapp[section]; return <article className="legal-document"><p className="legal-meta">生效日期：{document.effectiveDate} · 适用平台：{traceapp.platformName} · 应用名称：{traceapp.appName}</p>{'intro' in document && <p className="legal-intro">{document.intro}</p>}{document.sections.map((item) => <section key={item.title}><h2>{item.title}</h2>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>联系我们</h2><p>如有疑问，请联系：<a href={`mailto:${document.contactEmail}`}>{document.contactEmail}</a></p></section></article>; }
  return <section className="content-section"><h2>{t('app.faq')}</h2><div className="faq-list">{[0, 1, 2].map((i) => <details key={i} {...(i === 0 ? { open: true } : {})}><summary>{t(`trace.ui.faq.${i}.q`)}</summary><p>{t(`trace.ui.faq.${i}.a`)}</p></details>)}</div><p className="support-contact" dangerouslySetInnerHTML={{ __html: t('app.supportContact').replace('{email}', `<a href="mailto:${traceapp.supportEmail}">${traceapp.supportEmail}</a>`) }} /></section>;
}

function ScreenshotGallery() { const { t } = useI18n(); return <section className="screenshot-section trace-screenshot-section"><div><p className="route-eyebrow">{t('app.shots')}</p><h2>{t('trace.ui.galleryTitle')}</h2></div><div className="screenshot-strip trace-screenshot-strip">{['/apps/traceapp/shot-01.png', '/apps/traceapp/shot-02.png', '/apps/traceapp/shot-03.png'].map((image, index) => <img src={image} alt={`${APP} ${index + 1}`} key={image} loading="lazy" />)}</div></section>; }
function TraceTabs({ active }: { active: Section }) { const { t } = useI18n(); const routes: Section[] = ['overview', 'getting-started', 'privacy', 'terms', 'support']; return <nav className="platform-tabs page-tabs" aria-label={APP}>{routes.map((s) => <a key={s} className={active === s ? 'active' : ''} href={s === 'overview' ? '/apps/traceapp/' : `/apps/traceapp/${s}/`}>{tabWord(t, s)}</a>)}</nav>; }
function TraceHeader() { const { t } = useI18n(); return <header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label={APP}><img className="brand-logo" src="/logo.png" alt="" aria-hidden="true" width={36} height={36} /><span className="brand-text"><span className="cn">{APP}</span><span className="en">{t('trace.ui.headerSub')}</span></span></a><nav className="nav-menu nav-menu-static"><a href="/apps/" className="nav-link">{t('nav.apps')}</a><a href="/apps/traceapp/support/" className="nav-link cta-nav">{t('app.tab.support')}</a><LanguageSelect /></nav></div></header>; }
function TraceFooter() { const { t } = useI18n(); return <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{APP}</div><div className="footer-slogan">{t('app.footerSlogan')}</div></div><div className="footer-right"><div className="footer-links"><a href="/apps/traceapp/privacy/">{t('app.tab.privacy')}</a><a href="/apps/traceapp/terms/">{t('app.tab.terms')}</a></div></div></div></footer>; }
