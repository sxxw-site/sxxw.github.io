import { useEffect, useState } from 'react';
import timetrails from '../content/apps/timetrails.zh.json';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import DocumentLayout from '../components/DocumentLayout';
import { useI18n } from '../i18n/I18nProvider';
import { localizedSiteHref } from '../lib/site-navigation';
import { previewImage } from '../lib/app-preview';
import { buildFeedbackMailto, collectFeedbackDiagnostics, resolveFeedbackStrings, type FbStrings } from '../lib/feedback';
import { timeTrailsScreenshot } from '../lib/timetrails';
import TimeTrailsImportGuide from './TimeTrailsImportGuide';
import '../styles/product-pages.css';

type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
type T = (key: string) => string;
const APP = timetrails.appName;
const STORE = timetrails.storeName;
const BASE = '/apps/timetrails/';
const tabWord = (t: T, s: Section) => t(`app.tab.${s === 'getting-started' ? 'start' : s}`);
const appNameFor = (t: T) => {
  const name = t('tt.name');
  return name === 'tt.name' ? APP : name;
};

export default function TimeTrailsPage({ path }: { path: string }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const appName = appNameFor(t);
  const section: Section = path.includes('/getting-started/') ? 'getting-started' : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
  const title = section === 'overview' ? t('tt.tagline') : `${appName} ${tabWord(t, section)}`;
  const desc = section === 'overview' ? t('tt.desc') : t(`tt.ui.desc.${section === 'getting-started' ? 'start' : section}`);
  return <>
    <SiteHeader brand={appName} subtitle={t('tt.ui.headerSub')} active={section === 'support' ? 'support' : 'apps'} />
    <main id="page-content" tabIndex={-1} className="product-page product-editorial product-timetrails"><div className="container product-editorial-inner">
      <nav className="breadcrumbs" aria-label="breadcrumb"><a href={href('/')}>{t('home.nav.home')}</a><span aria-hidden="true">/</span><a href={href('/apps/')}>{t('nav.apps')}</a><span aria-hidden="true">/</span><span aria-current="page">{appName}</span></nav>
      <section className={`product-intro${section === 'overview' ? ' product-intro-visual' : ''}`} data-enter><div className="product-intro-copy"><p className="page-eyebrow">{timetrails.platformName} · {STORE}</p><h1 className="page-title">{title}</h1><p className="page-lead">{desc}</p>{section === 'overview' && <div className="action-row"><a className="btn-primary" href={timetrails.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', STORE).replace('{app}', appName)}</a><a className="btn-ghost" href={href(`${BASE}getting-started/`)}>{t('app.cta.start')}</a></div>}</div>{section === 'overview' && <div className="product-hero-screens" aria-label={t('app.shots')}>{(['overview', 'globe'] as const).map((page) => <a href={timeTrailsScreenshot(language.normalizedCode, page)} target="_blank" rel="noreferrer" key={page}><img {...previewImage(timeTrailsScreenshot(language.normalizedCode, page), '(max-width: 560px) 38vw, (max-width: 820px) 180px, 184px')} alt={`${appName} · ${t(page === 'overview' ? 'tt.ui.insightsTitle' : 'tt.ui.planetTitle')}`} width={1320} height={2868} decoding="async" /></a>)}</div>}</section>
      <PageTabs active={section} /><TimeTrailsBody section={section} />
    </div></main>
    <SiteFooter appName={appName} links={[{ href: BASE, label: appName }, { href: `${BASE}privacy/`, label: t('app.tab.privacy') }, { href: `${BASE}terms/`, label: t('app.tab.terms') }, { href: `${BASE}support/`, label: t('app.tab.support') }]} />
  </>;
}

function TimeTrailsBody({ section }: { section: Section }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  if (section === 'overview') return <>
    <section className="product-section product-feature-section"><div className="product-section-heading"><p className="page-eyebrow">TimeTrails</p><h2>{t('tt.ui.ovTitle')}</h2></div><ul className="product-feature-list">{timetrails.features.map((_, i) => <li key={i}><span className="product-list-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{t(`tt.feat.${i}`)}</span></li>)}</ul></section>
    <RecordingQuestions />
    <section className="product-section product-privacy-note"><h2>{t('tt.ui.privTitle')}</h2><div><p>{t('tt.ui.privBody')}</p><div className="product-inline-links"><a href={href(`${BASE}privacy/`)}>{t('app.cta.readPrivacy')} <span aria-hidden="true">↗</span></a><a href={href(`${BASE}terms/`)}>{t('app.tab.terms')}</a></div></div></section>
    <ScreenshotGallery /><FeedbackSection />
  </>;
  if (section === 'getting-started') return <><section className="product-section product-guide"><h2>{t('tt.ui.guideTitle')}</h2><ol className="product-guide-list">{timetrails.guide.map((_, i) => <li key={i}><span className="product-step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><h3>{t(`tt.guide.${i}.t`)}</h3><p>{t(`tt.guide.${i}.b`)}</p></div></li>)}</ol></section><TimeTrailsImportGuide language={language.normalizedCode} /><SupportLink /></>;
  if (section === 'privacy' || section === 'terms') {
    const document = timetrails[section];
    const contactEmail = 'contactEmail' in document ? document.contactEmail : timetrails.supportEmail;
    return <DocumentLayout title={tabWord(t, section)} eyebrow={APP} meta={`生效日期：${document.effectiveDate} · 适用平台：${timetrails.platformName} · 应用名称：${APP}`} intro={'intro' in document ? document.intro : undefined} sections={document.sections}><h3>联系我们</h3><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></DocumentLayout>;
  }
  return <><section className="product-section product-faq"><div className="product-section-heading"><p className="page-eyebrow">TimeTrails</p><h2>{t('app.faq')}</h2><a href={href(`${BASE}getting-started/`)}>{t('app.cta.start')} <span aria-hidden="true">↗</span></a></div><div className="product-faq-list">{[0, 1, 2, 3].map(i => <details key={i} open={i === 0}><summary>{t(`tt.ui.faq.${i}.q`)}</summary><p>{t(`tt.ui.faq.${i}.a`)}</p></details>)}</div></section><FeedbackSection /></>;
}

function RecordingQuestions() {
  const { t, language } = useI18n();
  const code = language.normalizedCode;
  // These practical notes are authored in Chinese and English; don't add a
  // Chinese fallback section to the other translated product pages.
  if (code !== 'zh-hans' && code.split('-')[0] !== 'en') return null;
  const otherLanguage = code === 'zh-hans' ? 'en' : 'zh-hans';
  const otherLanguageLabel = code === 'zh-hans' ? 'English' : '简体中文';
  const links = [
    { path: 'getting-started/', label: t('app.cta.start') },
    { path: 'privacy/', label: t('app.cta.readPrivacy') },
    { path: 'support/', label: t('app.tab.support') },
  ];
  return <section className="product-section product-faq" id="route-history"><div className="product-section-heading"><p className="page-eyebrow">TimeTrails</p><h2>{t('tt.ui.recordingTitle')}</h2><a href={localizedSiteHref(otherLanguage, BASE)} lang={otherLanguage === 'en' ? 'en' : 'zh-Hans'} hrefLang={otherLanguage === 'en' ? 'en' : 'zh-Hans'}>{otherLanguageLabel} <span aria-hidden="true">↗</span></a></div><div className="product-faq-list">{links.map((link, i) => <details key={link.path} open={i === 0}><summary>{t(`tt.ui.recording.${i}.q`)}</summary><p>{t(`tt.ui.recording.${i}.a`)} <a href={localizedSiteHref(code, `${BASE}${link.path}`)}>{link.label} <span aria-hidden="true">↗</span></a></p></details>)}</div></section>;
}

// 反馈区多语言与诊断逻辑仍与 /feedback/ 共用同一来源。
function FeedbackSection() {
  const email = timetrails.supportEmail;
  const { t: pageT, language } = useI18n();
  const initialStrings = resolveFeedbackStrings(language.normalizedCode);
  const [t, setT] = useState<FbStrings>(initialStrings);
  const [diag, setDiag] = useState('');
  const [fromApp, setFromApp] = useState(false);
  const [mailto, setMailto] = useState(() => buildFeedbackMailto(email, initialStrings.subject, initialStrings, ''));
  useEffect(() => {
    const strings = resolveFeedbackStrings(language.normalizedCode);
    const { text, fromApp } = collectFeedbackDiagnostics(strings);
    setT(strings);
    setDiag(text);
    setFromApp(fromApp);
    setMailto(buildFeedbackMailto(email, strings.subject, strings, text));
  }, [email, language.normalizedCode]);
  return <section className="product-section product-feedback" id="feedback"><div className="product-section-heading"><p className="page-eyebrow">TimeTrails</p><h2>{t.title}</h2><p>{t.intro}</p><a href={localizedSiteHref(language.normalizedCode, `${BASE}support/`)}>{pageT('app.faq')} <span aria-hidden="true">↗</span></a></div><div className="product-feedback-body"><dl className="product-contact-list"><div><dt>{t.emailLabel}</dt><dd><a href={`mailto:${email}`}>{email}</a></dd></div>{fromApp && diag && <div><dt>{t.deviceLabel}</dt><dd className="product-diagnostics">{diag}</dd></div>}</dl><div className="action-row"><a className="btn-primary" href={mailto}>{t.button}</a></div></div></section>;
}

function ScreenshotGallery() {
  const { t, language } = useI18n();
  const lang = language.normalizedCode;
  const appName = appNameFor(t);
  const images = ['/apps/timetrails/shot-01.png', '/apps/timetrails/shot-04.png', '/apps/timetrails/shot-05.png', '/apps/timetrails/shot-06.png'];
  return <section className="product-section product-gallery"><div className="product-section-heading"><p className="page-eyebrow">{t('app.shots')}</p><h2>{t('tt.ui.galleryTitle')}</h2></div><div className="product-screen-grid product-screen-grid-four">{images.map((src, index) => <a href={src} target="_blank" rel="noreferrer" key={src}><img {...previewImage(src, '(max-width: 560px) 240px, (max-width: 820px) 40vw, 240px')} alt={`${appName} ${index === 0 ? 1 : index + 3}`} width={1080} height={2346} loading="lazy" /></a>)}</div>
    {(['duo', 'ipad'] as const).map(device => <details className="product-device-gallery" key={device} open={device === 'duo'}><summary>{device === 'duo' ? 'iPhone Duo' : 'iPad'}</summary><div className={`product-device-screens product-device-screens-${device}`}>{(['overview', 'globe'] as const).map(page => <a href={timeTrailsScreenshot(lang, page, device)} target="_blank" rel="noreferrer" key={page}><img {...previewImage(timeTrailsScreenshot(lang, page, device), '(max-width: 560px) calc(100vw - 40px), 520px', [480, 960])} alt={`${device === 'duo' ? 'iPhone Duo' : 'iPad'} · ${t(page === 'overview' ? 'tt.ui.insightsTitle' : 'tt.ui.planetTitle')}`} loading="lazy" width={device === 'duo' ? 2853 : 2064} height={device === 'duo' ? 2007 : 2752} /></a>)}</div></details>)}
  </section>;
}

function PageTabs({ active }: { active: Section }) {
  const { t, language } = useI18n();
  return <nav className="product-navigation" aria-label={appNameFor(t)}>{(['overview', 'getting-started', 'privacy', 'terms', 'support'] as const).map(section => <a key={section} aria-current={active === section ? 'page' : undefined} href={localizedSiteHref(language.normalizedCode, `${BASE}${section === 'overview' ? '' : `${section}/`}`)}>{tabWord(t, section)}</a>)}</nav>;
}

function SupportLink() {
  const { t, language } = useI18n();
  return <section className="product-support-band"><div><h2>{t('app.tab.support')}</h2><p className="product-support-contact">{t('app.supportContact').split('{email}').map((part, index, parts) => <span key={index}>{part}{index < parts.length - 1 && <a href={`mailto:${timetrails.supportEmail}`}>{timetrails.supportEmail}</a>}</span>)}</p></div><a className="btn-ghost" href={localizedSiteHref(language.normalizedCode, `${BASE}support/`)}>{t('app.faq')} <span aria-hidden="true">↗</span></a></section>;
}
