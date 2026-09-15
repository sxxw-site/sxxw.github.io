import memoria from '../content/apps/memoria.zh.json';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n } from '../i18n/I18nProvider';

type Platform = 'ios' | 'harmony';
type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
type T = (key: string) => string;
const BRAND = memoria.appName; // Memoria · 拾忆
const cprefix = (p: Platform) => (p === 'ios' ? 'mem.ios' : 'mem.hm');
const descKey = (s: Section) => `mem.ui.desc.${s === 'getting-started' ? 'start' : s}`;
const tabWord = (t: T, s: Section) => t(`app.tab.${s === 'getting-started' ? 'start' : s}`);

export default function MemoriaPage({ path }: { path: string }) {
  const { t } = useI18n();
  const platform: Platform = path.includes('/harmony/') ? 'harmony' : 'ios';
  const section: Section = path.includes('/getting-started/') ? 'getting-started'
    : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms'
      : path.includes('/support/') ? 'support' : 'overview';

  if (path === '/apps/memoria/') return <PlatformChooser />;
  const product = memoria[platform];
  const base = `/apps/memoria/${platform}`;
  const name = product.displayName;
  const title = section === 'overview' ? name : `${name} ${tabWord(t, section)}`;
  const desc = section === 'overview' ? t(`${cprefix(platform)}.desc`) : t(descKey(section)).replace('{app}', name);

  return <><ThemeToggle /><MemoriaHeader />
    <main className="product-page"><div className="container product-page-inner">
      <nav className="breadcrumbs" aria-label="breadcrumb"><a href="/">{t('home.nav.home')}</a><span>／</span><a href="/apps/">{t('nav.apps')}</a><span>／</span><a href="/apps/memoria/">{BRAND}</a><span>／</span><span>{name}</span></nav>
      <section className="product-hero"><p className="route-eyebrow">{product.platformName} · {product.storeName}</p><h1>{title}</h1><p>{desc}</p><PlatformTabs active={platform} section={section} /></section>
      <PageBody product={product} section={section} base={base} platform={platform} />
    </div></main>
    <ProductFooter />
  </>;
}

function PlatformChooser() {
  const { t } = useI18n();
  return <><ThemeToggle /><MemoriaHeader />
    <main className="product-page"><div className="container product-page-inner">
      <nav className="breadcrumbs" aria-label="breadcrumb"><a href="/">{t('home.nav.home')}</a><span>／</span><a href="/apps/">{t('nav.apps')}</a><span>／</span><span>{BRAND}</span></nav>
      <section className="product-hero"><p className="route-eyebrow">{BRAND}</p><h1>{t('mem.ui.pc.title')}</h1><p>{t('mem.ui.pc.desc')}</p></section>
      <div className="platform-cards">
        <PlatformCard title={BRAND} eyebrow="App Store · iPhone / iPad / Apple Watch" description={t('mem.ui.pc.ios.desc')} href="/apps/memoria/ios/" cta={t('mem.ui.pc.ios.cta')} />
        <PlatformCard title="拾忆" eyebrow="HarmonyOS · 华为应用市场" description={t('mem.ui.pc.hm.desc')} href="/apps/memoria/harmony/" cta={t('mem.ui.pc.hm.cta')} />
      </div>
    </div></main>
    <ProductFooter />
  </>;
}

function PageBody({ product, section, base, platform }: { product: typeof memoria.ios; section: Section; base: string; platform: Platform }) {
  const { t } = useI18n();
  const isIOS = platform === 'ios';
  const cp = cprefix(platform);
  const name = product.displayName;
  if (section === 'overview') return <>
    <section className="content-section"><h2>{t('mem.ui.ovTitle')}</h2><div className="feature-grid">{product.features.map((_, i) => <div className="feature-card" key={i}>{t(`${cp}.feat.${i}`)}</div>)}</div></section>
    <section className="privacy-facts"><h2>{t('mem.ui.privTitle')}</h2><p>{t(isIOS ? 'mem.ui.priv.ios' : 'mem.ui.priv.hm')}</p><div className="action-row"><a className="btn-primary" href={`${base}/getting-started/`}>{t('app.cta.start')}</a><a className="btn-ghost" href={`${base}/privacy/`}>{t('app.cta.readPrivacy')}</a></div></section>
    <ScreenshotGallery appName={name} images={isIOS ? ['/apps/memoria/ios/shot-01.png', '/apps/memoria/ios/shot-02.png', '/apps/memoria/ios/shot-03.png', '/apps/memoria/ios/shot-04.png', '/apps/memoria/ios/shot-05.png'] : ['/apps/memoria/harmony/shot-01.jpg', '/apps/memoria/harmony/shot-02.jpg', '/apps/memoria/harmony/shot-03.jpg', '/apps/memoria/harmony/shot-04.jpg']} />
    {product.storeUrl ? <a className="store-link" href={product.storeUrl} target="_blank" rel="noreferrer">{t('app.getInStore').replace('{store}', product.storeName).replace('{app}', name)}</a> : <p className="store-hint">{t('mem.ui.storeHint').replace('{store}', product.storeName).replace('{app}', name)}</p>}
  </>;
  if (section === 'getting-started') return <section className="content-section"><h2>{t('mem.ui.guideTitle')}</h2><ol className="guide-list">{product.guide.map((_, i) => <li key={i}><span>{i + 1}</span><div><h3>{t(`${cp}.guide.${i}.t`)}</h3><p>{t(`${cp}.guide.${i}.b`)}</p></div></li>)}</ol></section>;
  if (section === 'privacy' || section === 'terms') {
    const document = product[section];
    const contactEmail = 'contactEmail' in document ? document.contactEmail : memoria.supportEmail;
    return <article className="legal-document"><p className="legal-meta">生效日期：{document.effectiveDate} · 适用平台：{product.platformName} · 应用名称：{name}</p>{'intro' in document && <p className="legal-intro">{document.intro}</p>}{document.sections.map((item) => <section key={item.title}><h2>{item.title}</h2>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>{section === 'privacy' ? '联系我们' : '十一、联系我们'}</h2><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></section></article>;
  }
  const faqA = (i: number) => (i < 2 ? t(`mem.ui.faq.${i}.a.${isIOS ? 'ios' : 'hm'}`) : t(`mem.ui.faq.${i}.a`));
  return <section className="content-section"><h2>{t('app.faq')}</h2><div className="faq-list">{[0, 1, 2].map((i) => <details key={i} {...(i === 0 ? { open: true } : {})}><summary>{t(`mem.ui.faq.${i}.q`)}</summary><p>{faqA(i)}</p></details>)}</div><p className="support-contact" dangerouslySetInnerHTML={{ __html: t('app.supportContact').replace('{email}', `<a href="mailto:${memoria.supportEmail}">${memoria.supportEmail}</a>`) }} /></section>;
}

function PlatformTabs({ active, section }: { active: Platform; section: Section }) {
  const route = (platform: Platform) => section === 'overview' ? `/apps/memoria/${platform}/` : `/apps/memoria/${platform}/${section}/`;
  return <div className="platform-tabs" aria-label={BRAND}><a href={route('ios')} className={active === 'ios' ? 'active' : ''}>App Store · Memoria · 拾忆</a><a href={route('harmony')} className={active === 'harmony' ? 'active' : ''}>华为应用市场 · 拾忆</a></div>;
}

function PlatformCard({ title, eyebrow, description, href, cta }: { title: string; eyebrow: string; description: string; href: string; cta: string }) {
  return <article className="platform-card"><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span><a className="btn-ghost" href={href}>{cta}</a></article>;
}

function MemoriaHeader() { const { t } = useI18n(); return <header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label={BRAND}><img className="brand-logo" src="/logo.png" alt="" aria-hidden="true" width={36} height={36} /><span className="brand-text"><span className="cn">{BRAND}</span><span className="en">{t('mem.ui.headerSub')}</span></span></a><nav className="nav-menu nav-menu-static"><a href="/apps/" className="nav-link">{t('nav.apps')}</a><a href="/apps/memoria/ios/support/" className="nav-link cta-nav">{t('app.tab.support')}</a><LanguageSelect /></nav></div></header>; }

function ProductFooter() { const { t } = useI18n(); return <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{BRAND}</div><div className="footer-slogan">{t('app.footerSlogan')}</div></div><div className="footer-right"><div className="footer-links"><a href="/apps/memoria/ios/privacy/">iOS {t('app.tab.privacy')}</a><a href="/apps/memoria/harmony/privacy/">HarmonyOS {t('app.tab.privacy')}</a></div></div></div></footer>; }

function ScreenshotGallery({ appName, images }: { appName: string; images: string[] }) { const { t } = useI18n(); return <section className="screenshot-section"><div><p className="route-eyebrow">{t('app.shots')}</p><h2>{t('mem.ui.galleryTitle').replace('{app}', appName)}</h2></div><div className="screenshot-strip">{images.map((image, index) => <img src={image} alt={`${appName} ${index + 1}`} key={image} loading="lazy" />)}</div></section>; }
