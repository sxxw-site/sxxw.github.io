import traceapp from '../content/apps/traceapp.zh.json';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import DocumentLayout from '../components/DocumentLayout';
import { useI18n } from '../i18n/I18nProvider';
import { localizedSiteHref } from '../lib/site-navigation';
import { previewImage } from '../lib/app-preview';
import '../styles/product-pages.css';

type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
type T = (key: string) => string;
const APP = traceapp.appName;
const STORE = traceapp.storeName;
const BASE = '/apps/traceapp/';
const tabWord = (t: T, s: Section) => t(`app.tab.${s === 'getting-started' ? 'start' : s}`);
const images = ['/apps/traceapp/shot-01.png', '/apps/traceapp/shot-02.png', '/apps/traceapp/shot-03.png'];

export default function TraceAppPage({ path }: { path: string }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const section: Section = path.includes('/getting-started/') ? 'getting-started' : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
  const title = section === 'overview' ? t('trace.tagline') : `${APP} ${tabWord(t, section)}`;
  const desc = section === 'overview' ? t('trace.desc') : t(`trace.ui.desc.${section === 'getting-started' ? 'start' : section}`);
  return <>
    <SiteHeader brand={APP} subtitle={t('trace.ui.headerSub')} active={section === 'support' ? 'support' : 'apps'} />
    <main id="page-content" tabIndex={-1} className="product-page product-editorial product-traceapp"><div className="container product-editorial-inner">
      <nav className="breadcrumbs" aria-label="breadcrumb"><a href={href('/')}>{t('home.nav.home')}</a><span aria-hidden="true">/</span><a href={href('/apps/')}>{t('nav.apps')}</a><span aria-hidden="true">/</span><span aria-current="page">{APP}</span></nav>
      <section className={`product-intro${section === 'overview' ? ' product-intro-visual' : ''}`} data-enter><div className="product-intro-copy"><p className="page-eyebrow">{section === 'overview' ? `${APP} · ${traceapp.platformName}` : `${traceapp.platformName} · ${STORE}`}</p><h1 className="page-title">{title}</h1><p className="page-lead">{desc}</p>{section === 'overview' && <div className="action-row"><a className="btn-primary" href={traceapp.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', STORE).replace('{app}', APP)}</a><a className="btn-ghost" href={href(`${BASE}getting-started/`)}>{t('app.cta.start')}</a></div>}</div>{section === 'overview' && <div className="product-hero-map" aria-label={t('app.shots')}><img {...previewImage(images[0], '(max-width: 560px) calc(100vw - 72px), 392px')} alt={`${APP} · ${t('trace.ui.galleryTitle')}`} width={392} height={250} decoding="async" /></div>}</section>
      <TraceTabs active={section} /><TraceBody section={section} />
    </div></main>
    <SiteFooter appName={APP} links={[{ href: BASE, label: APP }, { href: `${BASE}privacy/`, label: t('app.tab.privacy') }, { href: `${BASE}terms/`, label: t('app.tab.terms') }, { href: `${BASE}support/`, label: t('app.tab.support') }]} />
  </>;
}

function TraceBody({ section }: { section: Section }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  if (section === 'overview') return <>
    <section className="product-section product-feature-section"><div className="product-section-heading"><p className="page-eyebrow">TraceApp</p><h2>{t('trace.ui.ovTitle')}</h2></div><ul className="product-feature-list">{traceapp.features.map((_, i) => <li key={i}><span className="product-list-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{t(`trace.feat.${i}`)}</span></li>)}</ul></section>
    <section className="product-section product-privacy-note"><h2>{t('trace.ui.privTitle')}</h2><div><p>{t('trace.ui.privBody')}</p><div className="product-inline-links"><a href={href(`${BASE}privacy/`)}>{t('app.cta.readPrivacy')} <span aria-hidden="true">↗</span></a><a href={href(`${BASE}terms/`)}>{t('app.tab.terms')}</a></div></div></section>
    <section className="product-section product-gallery"><div className="product-section-heading"><p className="page-eyebrow">{t('app.shots')}</p><h2>{t('trace.ui.galleryTitle')}</h2></div><div className="product-map-grid">{images.slice(1).map((src, index) => <a href={src} target="_blank" rel="noreferrer" key={src}><img {...previewImage(src, '(max-width: 560px) calc(100vw - 72px), (max-width: 820px) 40vw, 392px')} className={index === 1 ? 'product-map-small' : undefined} alt={`${APP} ${index + 2}`} width={index === 1 ? 294 : 392} height={index === 1 ? 216 : 250} loading="lazy" /></a>)}</div></section><TraceSupport />
  </>;
  if (section === 'getting-started') return <><section className="product-section product-guide"><h2>{t('trace.ui.guideTitle')}</h2><ol className="product-guide-list">{traceapp.guide.map((_, i) => <li key={i}><span className="product-step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><h3>{t(`trace.guide.${i}.t`)}</h3><p>{t(`trace.guide.${i}.b`)}</p></div></li>)}</ol></section><TraceSupport /></>;
  if (section === 'privacy' || section === 'terms') {
    const document = traceapp[section];
    return <DocumentLayout title={tabWord(t, section)} eyebrow={APP} meta={`生效日期：${document.effectiveDate} · 适用平台：${traceapp.platformName} · 应用名称：${APP}`} intro={'intro' in document ? document.intro : undefined} sections={document.sections}><h3>联系我们</h3><p>如有疑问，请联系：<a href={`mailto:${document.contactEmail}`}>{document.contactEmail}</a></p></DocumentLayout>;
  }
  return <><section className="product-section product-faq"><div className="product-section-heading"><p className="page-eyebrow">TraceApp</p><h2>{t('app.faq')}</h2><a href={href(`${BASE}getting-started/`)}>{t('app.cta.start')} <span aria-hidden="true">↗</span></a></div><div className="product-faq-list">{[0, 1, 2].map(i => <details key={i} open={i === 0}><summary>{t(`trace.ui.faq.${i}.q`)}</summary><p>{t(`trace.ui.faq.${i}.a`)}</p></details>)}</div></section><TraceSupport showFaq={false} /></>;
}

function TraceTabs({ active }: { active: Section }) {
  const { t, language } = useI18n();
  return <nav className="product-navigation" aria-label={APP}>{(['overview', 'getting-started', 'privacy', 'terms', 'support'] as const).map(section => <a key={section} aria-current={active === section ? 'page' : undefined} href={localizedSiteHref(language.normalizedCode, `${BASE}${section === 'overview' ? '' : `${section}/`}`)}>{tabWord(t, section)}</a>)}</nav>;
}

function TraceSupport({ showFaq = true }: { showFaq?: boolean }) {
  const { t, language } = useI18n();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  return <section className="product-support-band"><div><h2>{t('app.tab.support')}</h2><p className="product-support-contact">{t('app.supportContact').split('{email}').map((part, index, parts) => <span key={index}>{part}{index < parts.length - 1 && <a href={`mailto:${traceapp.supportEmail}`}>{traceapp.supportEmail}</a>}</span>)}</p><p>{zh ? '隐私相关问题：' : 'Privacy enquiries: '}<a href={`mailto:${traceapp.privacyEmail}`}>{traceapp.privacyEmail}</a></p></div>{showFaq && <a className="btn-ghost" href={localizedSiteHref(language.normalizedCode, `${BASE}support/`)}>{t('app.faq')} <span aria-hidden="true">↗</span></a>}</section>;
}
