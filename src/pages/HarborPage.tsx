import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import DocumentLayout from '../components/DocumentLayout';
import HarborOpenSourceContent from './HarborOpenSourceContent';
import { harborOpenSourceCopy } from '../content/apps/harbor.open-source';
import { useI18n } from '../i18n/I18nProvider';
import { localizedSiteHref } from '../lib/site-navigation';
import {
  APPLE_TESTFLIGHT_TERMS, HARBOR_BASE, HARBOR_BETA, HARBOR_COMPANY,
  HARBOR_CONTACT, HARBOR_DATE, HARBOR_TERMS_DATE, harborCopy, harborSection, type HarborSection,
} from '../content/apps/harbor';
import captures from '../content/apps/harbor.screenshots.json';
import '../styles/product-pages.css';
import '../styles/harbor-pages.css';

type CaptureKey = 'hero' | 'queue' | 'downloads';
type Capture = { src: string; srcEn?: string; srcByLanguage?: Record<string, string>; width: number; height: number; alt: string; altEn?: string };
const screenshots = captures as Record<CaptureKey, Capture | null>;
const sections: HarborSection[] = ['overview', 'support', 'privacy', 'terms', 'open-source'];

export default function HarborPage({ path }: { path: string }) {
  const { t, language } = useI18n();
  const section = harborSection(path);
  const copy = harborCopy(language.normalizedCode, section);
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const pathFor = (target: HarborSection) => `${HARBOR_BASE}${target === 'overview' ? '' : `${target}/`}`;
  const sectionHref = (target: HarborSection, hash = '') => localizedSiteHref(
    target === 'overview' ? language.normalizedCode : copy.lang === 'zh-Hans' ? 'zh-hans' : 'en', `${pathFor(target)}${hash}`,
  );
  const legal = section === 'privacy' || section === 'terms' ? copy[section] : null;
  const email = `mailto:${HARBOR_CONTACT}?subject=${encodeURIComponent(section === 'open-source' ? 'Harbor LGPL materials request' : 'Harbor support')}`;
  const captureProps = (key: CaptureKey, capture: Capture) => ({ width: capture.width, height: capture.height,
    src: copy.lang === 'zh-Hans' ? capture.src : capture.srcByLanguage?.[copy.lang] ?? capture.srcEn ?? capture.src,
    alt: copy.screenshotAlt[key],
  });

  return <>
    <SiteHeader brand="Harbor" subtitle="WebDAV · iPhone · iPad · Mac" active="apps" />
    <main id="page-content" tabIndex={-1} className="product-page product-editorial product-harbor" lang={copy.lang} dir={copy.lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container product-editorial-inner">
        <nav className="breadcrumbs" aria-label={copy.breadcrumbLabel}>
          <a href={href('/')}>{t('home.nav.home')}</a><span aria-hidden="true">/</span>
          <a href={href('/apps/')}>{t('nav.apps')}</a><span aria-hidden="true">/</span>
          {section === 'overview' ? <span aria-current="page">Harbor</span> : <><a href={href(HARBOR_BASE)}>Harbor</a><span aria-hidden="true">/</span><span aria-current="page">{copy.tabs[section]}</span></>}
        </nav>

        <section className={`product-intro${section === 'overview' ? ' product-intro-visual harbor-intro' : ''}`} data-enter>
          <div className="product-intro-copy">
            <p className="page-eyebrow">Harbor · {section === 'overview' ? 'WebDAV / HTTP' : copy.tabs[section]}</p>
            <h1 className="page-title">{section === 'overview' ? copy.title : `Harbor ${copy.tabs[section]}`}</h1>
            <p className="page-lead">{section === 'overview' ? copy.lead : copy.meta[section].description}</p>
            {section === 'overview' && <>
              <div className="action-row"><a className="btn-primary" href={HARBOR_BETA} target="_blank" rel="noreferrer">{copy.beta}<span aria-hidden="true">↗</span></a><a className="btn-ghost" href={sectionHref('support', '#setup')}>{copy.tabs.support}</a></div>
              <p className="harbor-beta-note">{copy.betaNote}</p>
            </>}
          </div>
          {section === 'overview' && <div className={screenshots.hero ? 'harbor-hero-screen' : 'harbor-app-identity'}>
            {screenshots.hero ? <img {...captureProps('hero', screenshots.hero)} decoding="async" loading="eager" /> : <img src="/apps/harbor/icon.png" alt="Harbor" width={1024} height={1024} decoding="async" />}
          </div>}
        </section>

        <nav className="product-navigation" aria-label="Harbor">
          {sections.map((target) => <a key={target} href={sectionHref(target)} aria-current={section === target ? 'page' : undefined}>{copy.tabs[target]}</a>)}
        </nav>
        {section === 'overview' && copy.englishDocumentsNote && <p className="harbor-document-language-note">{copy.englishDocumentsNote}</p>}

        {section === 'overview' && <>
          <section className="product-section product-feature-section">
            <div className="product-section-heading"><h2>{copy.featuresTitle}</h2></div>
            <ul className="product-feature-list">{copy.features.map((text) => <li key={text}><span className="harbor-feature-mark" aria-hidden="true">{copy.lang === 'ar' ? '←' : '→'}</span><span>{text}</span></li>)}</ul>
          </section>
          {(screenshots.queue || screenshots.downloads) && <section className="product-section product-gallery">
            <div className="product-section-heading"><h2>{copy.galleryTitle}</h2></div>
            <div className="harbor-screen-pair">{(['queue', 'downloads'] as const).map((key) => { const capture = screenshots[key]; return capture && <a key={key} href={captureProps(key, capture).src} target="_blank" rel="noreferrer"><img {...captureProps(key, capture)} loading="lazy" decoding="async" /></a>; })}</div>
          </section>}
          <section className="product-section product-privacy-note"><h2>{copy.privacyTitle}</h2><div><p>{copy.privacyNote}</p><a className="harbor-inline-link" href={sectionHref('privacy')}>{copy.readPrivacy}<span aria-hidden="true">↗</span></a></div></section>
        </>}

        {section === 'support' && <>
          <section className="product-section product-guide" id="setup"><h2>{copy.setupTitle}</h2><ol className="product-guide-list">{copy.setup.map((step, index) => <li key={step.title}><span className="product-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>
          <section className="product-section product-faq"><div className="product-section-heading"><h2>{copy.faqTitle}</h2></div><div className="product-faq-list">{copy.faq.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
        </>}

        {section === 'open-source' && <HarborOpenSourceContent language={copy.lang} />}

        {legal && <DocumentLayout title={copy.tabs[section]} eyebrow="Harbor" contentLanguage={copy.lang}
          meta={`${copy.effective}: ${section === 'terms' ? HARBOR_TERMS_DATE : HARBOR_DATE} · ${HARBOR_COMPANY}`} intro={legal.intro} sections={legal.sections}>
          <h3>{copy.contactTitle}</h3><p><a href={email}>{HARBOR_CONTACT}</a></p>
          <p><a href={APPLE_TESTFLIGHT_TERMS} target="_blank" rel="noreferrer">{copy.appleTerms}<span aria-hidden="true"> ↗</span></a></p>
        </DocumentLayout>}

        {!legal && <section className="product-support-band"><div><h2>{copy.contactTitle}</h2><p>{section === 'open-source' ? harborOpenSourceCopy(copy.lang).requestNote : copy.contactNote}</p><p><a href={email} dir="ltr">{HARBOR_CONTACT}</a></p></div>{section === 'overview' && <a className="btn-ghost" href={sectionHref('support')}>{copy.tabs.support}<span aria-hidden="true">↗</span></a>}</section>}
      </div>
    </main>
    <SiteFooter appName="Harbor" links={sections.map((target) => ({ href: sectionHref(target), label: target === 'overview' ? 'Harbor' : copy.tabs[target] }))} />
  </>;
}
