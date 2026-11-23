import memoria from '../content/apps/memoria.zh.json';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import DocumentLayout from '../components/DocumentLayout';
import { useI18n } from '../i18n/I18nProvider';
import { localizedSiteHref } from '../lib/site-navigation';
import { previewImage } from '../lib/app-preview';
import '../styles/product-pages.css';

type Platform = 'ios' | 'harmony';
type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
type T = (key: string) => string;
const BRAND = memoria.appName;
const cprefix = (p: Platform) => p === 'ios' ? 'mem.ios' : 'mem.hm';
const tabWord = (t: T, s: Section) => t(`app.tab.${s === 'getting-started' ? 'start' : s}`);
const screenshots = (platform: Platform) => Array.from({ length: platform === 'ios' ? 5 : 4 }, (_, i) => `/apps/memoria/${platform}/shot-0${i + 1}.${platform === 'ios' ? 'png' : 'jpg'}`);

export default function MemoriaPage({ path }: { path: string }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const platform: Platform = path.includes('/harmony/') ? 'harmony' : 'ios';
  const section: Section = path.includes('/getting-started/') ? 'getting-started' : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
  const chooser = path === '/apps/memoria/';
  const product = memoria[platform];
  const backup = harmonyBackupCopy(language.normalizedCode);
  const name = product.displayName;
  const title = chooser ? t('mem.ui.pc.title') : section === 'overview' ? name : `${name} ${tabWord(t, section)}`;
  const desc = chooser ? t('mem.ui.pc.desc') : section === 'overview' ? platform === 'harmony' ? backup.storage : t(`${cprefix(platform)}.desc`) : t(`mem.ui.desc.${section === 'getting-started' ? 'start' : section}`).replace('{app}', name);
  const images = screenshots(platform);
  return <>
    <SiteHeader brand={BRAND} subtitle={t('mem.ui.headerSub')} active={section === 'support' ? 'support' : 'apps'} />
    <main id="page-content" tabIndex={-1} className={`product-page product-editorial product-memoria${chooser ? ' product-chooser' : ''}`}><div className="container product-editorial-inner">
      <nav className="breadcrumbs" aria-label="breadcrumb"><a href={href('/')}>{t('home.nav.home')}</a><span aria-hidden="true">/</span><a href={href('/apps/')}>{t('nav.apps')}</a><span aria-hidden="true">/</span>{chooser ? <span aria-current="page">{BRAND}</span> : <a href={href('/apps/memoria/')}>{BRAND}</a>}{!chooser && <><span aria-hidden="true">/</span><span aria-current="page">{section === 'support' ? tabWord(t, section) : product.platformName}</span></>}</nav>
      <section className={`product-intro${!chooser && section === 'overview' ? ' product-intro-visual' : ''}`} data-enter>
        <div className="product-intro-copy"><p className="page-eyebrow">{chooser ? BRAND : section === 'support' ? 'iOS · HarmonyOS' : `${product.platformName} · ${product.storeName}`}</p><h1 className="page-title">{title}</h1><p className="page-lead" lang={platform === 'harmony' && !chooser && section === 'overview' ? backup.lang : undefined} dir={platform === 'harmony' && !chooser && section === 'overview' ? 'ltr' : undefined}>{desc}</p>
          {!chooser && section === 'overview' && <div className="action-row">{product.storeUrl ? <a className="btn-primary" href={product.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', product.storeName).replace('{app}', name)}</a> : <p className="store-hint">{t('mem.ui.storeHint').replace('{store}', product.storeName).replace('{app}', name)}</p>}<a className="btn-ghost" href={href(`/apps/memoria/${platform}/getting-started/`)}>{t('app.cta.start')}</a></div>}
        </div>
        {!chooser && section === 'overview' && <div className="product-hero-screens" aria-label={t('app.shots')}>{images.slice(0, 2).map((src, index) => <img {...previewImage(src, '(max-width: 560px) 38vw, (max-width: 820px) 180px, 184px')} alt={`${name} · ${product.platformName} · ${index + 1}`} width={1080} height={platform === 'ios' ? 2346 : 2330} decoding="async" key={src} />)}</div>}
      </section>
      {chooser ? <PlatformChooser /> : <><ProductNavigation active={section} platform={platform} /><PageBody section={section} platform={platform} /></>}
    </div></main>
    <SiteFooter appName={BRAND} links={[{ href: '/apps/memoria/', label: BRAND }, { href: '/apps/memoria/ios/privacy/', label: `iOS ${t('app.tab.privacy')}` }, { href: '/apps/memoria/harmony/privacy/', label: `HarmonyOS ${t('app.tab.privacy')}` }, { href: '/apps/memoria/support/', label: t('app.tab.support') }]} />
  </>;
}

function PlatformChooser() {
  const { t, language } = useI18n();
  const backup = harmonyBackupCopy(language.normalizedCode);
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  return <div className="product-platform-list">{(['ios', 'harmony'] as const).map(platform => {
    const product = memoria[platform];
    return <article className="product-platform-row" key={platform}><div className="product-platform-copy"><p className="page-eyebrow">{product.platformName} · {product.storeName}</p><h2>{product.displayName}</h2><p lang={platform === 'harmony' ? backup.lang : undefined} dir={platform === 'harmony' ? 'ltr' : undefined}>{platform === 'harmony' ? backup.storage : t('mem.ui.pc.ios.desc')}</p><div className="action-row"><a className="btn-primary" href={href(`/apps/memoria/${platform}/`)}>{t(`mem.ui.pc.${platform === 'ios' ? 'ios' : 'hm'}.cta`)}</a><a className="btn-ghost" href={product.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', product.storeName).replace('{app}', product.displayName)}</a></div><nav className="product-inline-links" aria-label={`${product.platformName} ${t('nav.support')}`}><a href={href(`/apps/memoria/${platform}/getting-started/`)}>{t('app.tab.start')}</a><a href={href(`/apps/memoria/${platform}/privacy/`)}>{t('app.tab.privacy')}</a><a href={href(`/apps/memoria/${platform}/terms/`)}>{t('app.tab.terms')}</a></nav></div><div className="product-platform-screen"><img {...previewImage(screenshots(platform)[0], '(max-width: 560px) 160px, 172px')} alt={`${product.displayName} · ${product.platformName}`} width={1080} height={platform === 'ios' ? 2346 : 2330} loading="lazy" /></div></article>;
  })}<SupportLink /></div>;
}

function ProductNavigation({ active, platform }: { active: Section; platform: Platform }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const route = (section: Section) => section === 'support' ? '/apps/memoria/support/' : `/apps/memoria/${platform}/${section === 'overview' ? '' : `${section}/`}`;
  return <div className="product-navigation-wrap"><nav className="product-navigation" aria-label={BRAND}>{(['overview', 'getting-started', 'privacy', 'terms', 'support'] as const).map(section => <a href={href(route(section))} aria-current={active === section ? 'page' : undefined} key={section}>{tabWord(t, section)}</a>)}</nav>{active !== 'support' && <nav className="product-platform-switch" aria-label="iOS / HarmonyOS">{(['ios', 'harmony'] as const).map(item => <a href={href(`/apps/memoria/${item}/${active === 'overview' ? '' : `${active}/`}`)} aria-current={platform === item ? 'true' : undefined} key={item}>{item === 'ios' ? 'iOS' : 'HarmonyOS'}</a>)}</nav>}</div>;
}

// New backup guidance is reviewed in these three languages. Other shells show
// the English text with an explicit language tag instead of stale translations.
function harmonyBackupCopy(language: string) {
  const code = language.toLowerCase();
  const lang = code === 'yue' || code.includes('hant') || code === 'zh-hk' ? 'zh-Hant'
    : code.startsWith('zh') ? 'zh-Hans' : 'en';
  return { ...memoria.harmony.backupGuidance[lang], lang };
}

function PageBody({ section, platform }: { section: Section; platform: Platform }) {
  const { t, language } = useI18n();
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const product = memoria[platform];
  const cp = cprefix(platform);
  const backup = harmonyBackupCopy(language.normalizedCode);
  if (section === 'overview') return <>
    <section className="product-section product-feature-section"><div className="product-section-heading"><p className="page-eyebrow">{product.displayName}</p><h2>{t('mem.ui.ovTitle')}</h2></div><ul className="product-feature-list">{product.features.map((_, i) => <li key={i}><span className="product-list-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{t(`${cp}.feat.${i}`)}</span></li>)}</ul></section>
    <section className="product-section product-privacy-note"><h2>{t('mem.ui.privTitle')}</h2><div><p lang={platform === 'harmony' ? backup.lang : undefined} dir={platform === 'harmony' ? 'ltr' : undefined}>{platform === 'harmony' ? backup.storage : t('mem.ui.priv.ios')}</p><div className="product-inline-links"><a href={href(`/apps/memoria/${platform}/privacy/`)}>{t('app.cta.readPrivacy')} <span aria-hidden="true">↗</span></a><a href={href(`/apps/memoria/${platform}/terms/`)}>{t('app.tab.terms')}</a></div></div></section>
    <section className="product-section product-gallery"><div className="product-section-heading"><p className="page-eyebrow">{t('app.shots')}</p><h2>{t('mem.ui.galleryTitle').replace('{app}', product.displayName)}</h2></div><div className="product-screen-grid">{screenshots(platform).slice(2).map((src, index) => <a href={src} target="_blank" rel="noreferrer" key={src}><img {...previewImage(src, '(max-width: 560px) 240px, (max-width: 820px) 28vw, 240px')} alt={`${product.displayName} · ${product.platformName} · ${index + 3}`} width={1080} height={platform === 'ios' ? 2346 : 2330} loading="lazy" /></a>)}</div></section><SupportLink />
  </>;
  if (section === 'getting-started') return <><section className="product-section product-guide"><h2>{t('mem.ui.guideTitle')}</h2><ol className="product-guide-list">{product.guide.map((_, i) => <li key={i}><span className="product-step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><h3>{t(`${cp}.guide.${i}.t`)}</h3><p lang={platform === 'harmony' && i === 3 ? backup.lang : undefined} dir={platform === 'harmony' && i === 3 ? 'ltr' : undefined}>{platform === 'harmony' && i === 3 ? backup.body : t(`${cp}.guide.${i}.b`)}</p></div></li>)}</ol></section><SupportLink /></>;
  if (section === 'privacy' || section === 'terms') {
    const document = product[section];
    const contactEmail = 'contactEmail' in document ? document.contactEmail : memoria.supportEmail;
    return <DocumentLayout title={tabWord(t, section)} eyebrow={`${product.displayName} · ${product.platformName}`} meta={`生效日期：${document.effectiveDate} · 适用平台：${product.platformName} · 应用名称：${product.displayName}`} intro={'intro' in document ? document.intro : undefined} sections={document.sections}>{platform === 'ios' && <><h3>{section === 'privacy' ? '联系我们' : '十一、联系我们'}</h3><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></>}</DocumentLayout>;
  }
  return <><div className="product-faq-platforms">{(['ios', 'harmony'] as const).map(item => <section className="product-section product-faq" id={`support-${item}`} key={item}><div className="product-section-heading"><p className="page-eyebrow">{memoria[item].storeName}</p><h2>{item === 'ios' ? 'iOS' : 'HarmonyOS'} · {t('app.faq')}</h2><p lang={item === 'harmony' ? backup.lang : undefined} dir={item === 'harmony' ? 'ltr' : undefined}>{item === 'harmony' ? backup.storage : t('mem.ui.pc.ios.desc')}</p><a href={href(`/apps/memoria/${item}/getting-started/`)}>{t('app.cta.start')} <span aria-hidden="true">↗</span></a></div><div className="product-faq-list">{[0, 1, 2].map(i => <details key={i} open={i === 0}><summary>{t(`mem.ui.faq.${i}.q`)}</summary><p lang={item === 'harmony' && i < 2 ? backup.lang : undefined} dir={item === 'harmony' && i < 2 ? 'ltr' : undefined}>{item === 'harmony' && i < 2 ? i === 0 ? backup.storage : backup.deletion : i < 2 ? t(`mem.ui.faq.${i}.a.${item === 'ios' ? 'ios' : 'hm'}`) : t(`mem.ui.faq.${i}.a`)}</p></details>)}</div></section>)}</div><SupportLink showFaq={false} /></>;
}

function SupportLink({ showFaq = true }: { showFaq?: boolean }) {
  const { t, language } = useI18n();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  return <section className="product-support-band"><div><h2>{t('app.tab.support')}</h2><p>{zh ? '说明你的设备平台、应用版本和遇到的问题。' : 'Include your platform, app version, and what happened.'}</p><p className="product-support-contact">{t('app.supportContact').split('{email}').map((part, index, parts) => <span key={index}>{part}{index < parts.length - 1 && <a href={`mailto:${memoria.supportEmail}`}>{memoria.supportEmail}</a>}</span>)}</p></div>{showFaq && <a className="btn-ghost" href={localizedSiteHref(language.normalizedCode, '/apps/memoria/support/')}>{t('app.faq')} <span aria-hidden="true">↗</span></a>}</section>;
}
