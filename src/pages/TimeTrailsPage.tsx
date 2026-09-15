import { useEffect, useState } from 'react';
import timetrails from '../content/apps/timetrails.zh.json';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n } from '../i18n/I18nProvider';
import { FEEDBACK_FALLBACK, buildFeedbackMailto, collectFeedbackDiagnostics, resolveFeedbackStrings, type FbStrings } from '../lib/feedback';

type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
type T = (key: string) => string;
const APP = timetrails.appName;
const STORE = timetrails.storeName;
const descKey = (s: Section) => `tt.ui.desc.${s === 'getting-started' ? 'start' : s}`;
const tabWord = (t: T, s: Section) => t(`app.tab.${s === 'getting-started' ? 'start' : s}`);

export default function TimeTrailsPage({ path }: { path: string }) {
  const { t } = useI18n();
  const section: Section = path.includes('/getting-started/') ? 'getting-started' : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
  const base = '/apps/timetrails';
  const title = section === 'overview' ? t('tt.tagline') : `${APP} ${tabWord(t, section)}`;
  const desc = section === 'overview' ? t('tt.desc') : t(descKey(section));
  return <><ThemeToggle /><ProductHeader /><main className="product-page"><div className="container product-page-inner">
    <nav className="breadcrumbs" aria-label="breadcrumb"><a href="/">{t('home.nav.home')}</a><span>／</span><a href="/apps/">{t('nav.apps')}</a><span>／</span><span>{APP}</span></nav>
    <section className="product-hero"><p className="route-eyebrow">{timetrails.platformName} · {STORE}</p><h1>{title}</h1><p>{desc}</p><PageTabs active={section} /></section>
    <TimeTrailsBody section={section} base={base} />
  </div></main><ProductFooter /></>;
}

function TimeTrailsBody({ section, base }: { section: Section; base: string }) {
  const { t } = useI18n();
  if (section === 'overview') return <>
    <section className="content-section"><h2>{t('tt.ui.ovTitle')}</h2><div className="feature-grid">{timetrails.features.map((_, i) => <div className="feature-card" key={i}>{t(`tt.feat.${i}`)}</div>)}</div></section>
    <section className="privacy-facts"><h2>{t('tt.ui.privTitle')}</h2><p>{t('tt.ui.privBody')}</p><div className="action-row"><a className="btn-primary" href={`${base}/getting-started/`}>{t('app.cta.start')}</a><a className="btn-ghost" href={`${base}/privacy/`}>{t('app.cta.readPrivacy')}</a></div></section>
    <FeedbackSection /><ScreenshotGallery />
    {timetrails.storeUrl && <a className="store-link" href={timetrails.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', STORE).replace('{app}', APP)}</a>}
  </>;
  if (section === 'getting-started') return <section className="content-section"><h2>{t('tt.ui.guideTitle')}</h2><ol className="guide-list">{timetrails.guide.map((_, i) => <li key={i}><span>{i + 1}</span><div><h3>{t(`tt.guide.${i}.t`)}</h3><p>{t(`tt.guide.${i}.b`)}</p></div></li>)}</ol></section>;
  if (section === 'privacy' || section === 'terms') { const document = timetrails[section]; const contactEmail = 'contactEmail' in document ? document.contactEmail : timetrails.supportEmail; return <article className="legal-document"><p className="legal-meta">生效日期：{document.effectiveDate} · 适用平台：{timetrails.platformName} · 应用名称：{timetrails.appName}</p>{'intro' in document && <p className="legal-intro">{document.intro}</p>}{document.sections.map((item) => <section key={item.title}><h2>{item.title}</h2>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>联系我们</h2><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></section></article>; }
  return <><FeedbackSection /><section className="content-section"><h2>{t('app.faq')}</h2><div className="faq-list">{[0, 1, 2, 3].map((i) => <details key={i} {...(i === 0 ? { open: true } : {})}><summary>{t(`tt.ui.faq.${i}.q`)}</summary><p>{t(`tt.ui.faq.${i}.a`)}</p></details>)}</div></section></>;
}

// 反馈区多语言逻辑抽离到 ../lib/feedback，与共用反馈页 /feedback/ 单一来源。
function FeedbackSection() {
  const email = timetrails.supportEmail;
  const [t, setT] = useState<FbStrings>(FEEDBACK_FALLBACK);
  const [diag, setDiag] = useState('');
  const [fromApp, setFromApp] = useState(false);
  const [mailto, setMailto] = useState(() => buildFeedbackMailto(email, FEEDBACK_FALLBACK.subject, FEEDBACK_FALLBACK, ''));
  useEffect(() => {
    const strings = resolveFeedbackStrings();
    const { text, fromApp } = collectFeedbackDiagnostics(strings);
    setT(strings);
    setDiag(text);
    setFromApp(fromApp);
    setMailto(buildFeedbackMailto(email, strings.subject, strings, text));
  }, [email]);
  return <section className="content-section feedback-section" id="feedback"><h2>{t.title}</h2><p>{t.intro}</p><div className="contact-card" style={{ maxWidth: 760 }}><div className="contact-row"><div className="contact-label">{t.emailLabel}</div><div className="contact-value"><a className="linkish" href={`mailto:${email}`}>{email}</a></div></div>{fromApp && diag && <div className="contact-row"><div className="contact-label">{t.deviceLabel}</div><div className="contact-value" style={{ whiteSpace: 'pre-line', opacity: 0.85 }}>{diag}</div></div>}</div><div className="action-row"><a className="btn-primary" href={mailto}>{t.button}</a></div></section>;
}

function ScreenshotGallery() { const { t } = useI18n(); return <section className="screenshot-section"><div><p className="route-eyebrow">{t('app.shots')}</p><h2>{t('tt.ui.galleryTitle')}</h2></div><div className="screenshot-strip">{['/apps/timetrails/shot-01.png', '/apps/timetrails/shot-02.png', '/apps/timetrails/shot-03.png', '/apps/timetrails/shot-04.png', '/apps/timetrails/shot-05.png', '/apps/timetrails/shot-06.png'].map((image, index) => <img src={image} alt={`${APP} ${index + 1}`} key={image} loading="lazy" />)}</div></section>; }

function PageTabs({ active }: { active: Section }) { const { t } = useI18n(); const routes: Section[] = ['overview', 'getting-started', 'privacy', 'terms', 'support']; return <nav className="platform-tabs page-tabs" aria-label={APP}>{routes.map((s) => <a key={s} className={active === s ? 'active' : ''} href={s === 'overview' ? '/apps/timetrails/' : `/apps/timetrails/${s}/`}>{tabWord(t, s)}</a>)}</nav>; }
function ProductHeader() { const { t } = useI18n(); return <header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label={APP}><img className="brand-logo" src="/logo.png" alt="" aria-hidden="true" width={36} height={36} /><span className="brand-text"><span className="cn">{APP}</span><span className="en">{t('tt.ui.headerSub')}</span></span></a><nav className="nav-menu nav-menu-static"><a href="/apps/" className="nav-link">{t('nav.apps')}</a><a href="/apps/timetrails/support/" className="nav-link cta-nav">{t('app.tab.support')}</a><LanguageSelect /></nav></div></header>; }
function ProductFooter() { const { t } = useI18n(); return <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{APP}</div><div className="footer-slogan">{t('app.footerSlogan')}</div></div><div className="footer-right"><div className="footer-links"><a href="/apps/timetrails/privacy/">{t('app.tab.privacy')}</a><a href="/apps/timetrails/terms/">{t('app.tab.terms')}</a></div></div></div></footer>; }
