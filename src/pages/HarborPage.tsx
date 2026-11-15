import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import DocumentLayout from '../components/DocumentLayout';
import { useI18n } from '../i18n/I18nProvider';
import { localizedSiteHref } from '../lib/site-navigation';
import {
  APPLE_TESTFLIGHT_TERMS, HARBOR_BASE, HARBOR_BETA, HARBOR_COMPANY,
  HARBOR_CONTACT, HARBOR_DATE, harborCopy, harborSection, type HarborSection,
} from '../content/apps/harbor';
import captures from '../content/apps/harbor.screenshots.json';
import '../styles/product-pages.css';
import '../styles/harbor-pages.css';

type Capture = { src: string; srcEn?: string; width: number; height: number; alt: string; altEn?: string };
const screenshots = captures as Record<'hero' | 'queue' | 'downloads', Capture | null>;
const sections: HarborSection[] = ['overview', 'support', 'privacy', 'terms'];

export default function HarborPage({ path }: { path: string }) {
  const { t, language } = useI18n();
  const copy = harborCopy(language.normalizedCode);
  const section = harborSection(path);
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const pathFor = (target: HarborSection) => `${HARBOR_BASE}${target === 'overview' ? '' : `${target}/`}`;
  const legal = section === 'privacy' || section === 'terms' ? copy[section] : null;
  const email = `mailto:${HARBOR_CONTACT}?subject=${encodeURIComponent('Harbor support')}`;
  const captureProps = ({ altEn, srcEn, ...capture }: Capture) => ({ ...capture, src: copy.lang === 'en' ? srcEn ?? capture.src : capture.src, alt: copy.lang === 'en' ? altEn ?? capture.alt : capture.alt });

  return <>
    <SiteHeader brand="Harbor" subtitle="WebDAV · iPhone · iPad · Mac" active="apps" />
    <main id="page-content" tabIndex={-1} className="product-page product-editorial product-harbor" lang={copy.lang} dir="ltr">
      <div className="container product-editorial-inner">
        <nav className="breadcrumbs" aria-label={copy.lang === 'en' ? 'Breadcrumbs' : '页面位置'}>
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
              <div className="action-row"><a className="btn-primary" href={HARBOR_BETA} target="_blank" rel="noreferrer">{copy.beta}<span aria-hidden="true">↗</span></a><a className="btn-ghost" href={href(`${HARBOR_BASE}support/#setup`)}>{copy.tabs.support}</a></div>
              <p className="harbor-beta-note">{copy.betaNote}</p>
            </>}
          </div>
          {section === 'overview' && <div className={screenshots.hero ? 'harbor-hero-screen' : 'harbor-app-identity'}>
            {screenshots.hero ? <img {...captureProps(screenshots.hero)} decoding="async" loading="eager" /> : <img src="/apps/harbor/icon.png" alt="Harbor" width={1024} height={1024} decoding="async" />}
          </div>}
        </section>

        <nav className="product-navigation" aria-label="Harbor">
          {sections.map((target) => <a key={target} href={href(pathFor(target))} aria-current={section === target ? 'page' : undefined}>{copy.tabs[target]}</a>)}
        </nav>

        {section === 'overview' && <>
          <section className="product-section product-feature-section">
            <div className="product-section-heading"><h2>{copy.featuresTitle}</h2></div>
            <ul className="product-feature-list">{copy.features.map((text) => <li key={text}><span className="harbor-feature-mark" aria-hidden="true">→</span><span>{text}</span></li>)}</ul>
          </section>
          {(screenshots.queue || screenshots.downloads) && <section className="product-section product-gallery">
            <div className="product-section-heading"><h2>{copy.lang === 'en' ? 'Your queue and local videos' : '待播放与本地视频'}</h2></div>
            <div className="harbor-screen-pair">{[screenshots.queue, screenshots.downloads].filter((capture): capture is Capture => !!capture).map((capture) => <a key={capture.src} href={captureProps(capture).src} target="_blank" rel="noreferrer"><img {...captureProps(capture)} loading="lazy" decoding="async" /></a>)}</div>
          </section>}
          <section className="product-section product-privacy-note"><h2>{copy.privacyTitle}</h2><div><p>{copy.privacyNote}</p><a className="harbor-inline-link" href={href(`${HARBOR_BASE}privacy/`)}>{copy.readPrivacy}<span aria-hidden="true">↗</span></a></div></section>
        </>}

        {section === 'support' && <>
          <section className="product-section product-guide" id="setup"><h2>{copy.setupTitle}</h2><ol className="product-guide-list">{copy.setup.map((step, index) => <li key={step.title}><span className="product-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>
          <section className="product-section product-faq"><div className="product-section-heading"><h2>{copy.faqTitle}</h2></div><div className="product-faq-list">{copy.faq.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
        </>}

        {legal && <DocumentLayout title={copy.tabs[section]} eyebrow="Harbor" contentLanguage={copy.lang}
          meta={`${copy.effective}: ${HARBOR_DATE} · ${HARBOR_COMPANY}`} intro={legal.intro} sections={legal.sections}>
          <h3>{copy.contactTitle}</h3><p><a href={email}>{HARBOR_CONTACT}</a></p>
          <p><a href={APPLE_TESTFLIGHT_TERMS} target="_blank" rel="noreferrer">{copy.appleTerms}<span aria-hidden="true"> ↗</span></a></p>
        </DocumentLayout>}

        {!legal && <section className="product-support-band"><div><h2>{copy.contactTitle}</h2><p>{copy.contactNote}</p><p><a href={email}>{HARBOR_CONTACT}</a></p></div>{section === 'overview' && <a className="btn-ghost" href={href(`${HARBOR_BASE}support/`)}>{copy.tabs.support}<span aria-hidden="true">↗</span></a>}</section>}
      </div>
    </main>
    <SiteFooter appName="Harbor" links={sections.map((target) => ({ href: pathFor(target), label: target === 'overview' ? 'Harbor' : copy.tabs[target] }))} />
  </>;
}
