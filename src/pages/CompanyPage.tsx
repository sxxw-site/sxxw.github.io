import { useI18n } from '../i18n/I18nProvider';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { localizedSiteHref } from '../lib/site-navigation';
import memoria from '../content/apps/memoria.zh.json';
import timetrails from '../content/apps/timetrails.zh.json';
import traceapp from '../content/apps/traceapp.zh.json';
import { HARBOR_BASE, HARBOR_CONTACT, harborCopy } from '../content/apps/harbor';
import '../styles/company-pages.css';

const products = [
  { id: 'memoria', name: memoria.appName, email: memoria.supportEmail, href: '/apps/memoria/' },
  { id: 'timetrails', name: timetrails.appName, email: timetrails.supportEmail, href: '/apps/timetrails/' },
  { id: 'traceapp', name: traceapp.appName, email: traceapp.supportEmail, href: '/apps/traceapp/' },
  { id: 'harbor', name: 'Harbor', email: HARBOR_CONTACT, href: HARBOR_BASE },
];

export default function CompanyPage({ kind }: { kind: 'about' | 'contact' }) {
  const { t, language } = useI18n();
  const harbor = harborCopy(language.normalizedCode);
  const href = (target: string) => localizedSiteHref(language.normalizedCode, target);
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  return <><SiteHeader active={kind} /><main className={`company-page company-${kind}`} id="page-content" tabIndex={-1}><div className="container">
    {kind === 'about' ? <>
      <section className="company-hero"><div><p className="page-eyebrow">{t('home.nav.about')}</p><h1 className="page-title">{t('home.about.title')}</h1><p className="page-lead">{t('home.about.desc.0')}</p><a className="company-inline-link" href={href('/apps/')}>{t('home.products.action')} <span aria-hidden="true">→</span></a></div><div className="company-mark"><img src="/logo.png" alt={t('home.common.company')} width={512} height={512} /></div></section>
      <section className="company-products" aria-labelledby="company-products"><div className="company-section-head"><h2 id="company-products">{t('home.products.title')}</h2><p>{t('home.products.description')}</p></div><div className="company-product-list">{products.map((product) => <article key={product.id}><div><h3><a href={href(product.href)}>{product.name}</a></h3><p lang={product.id === 'harbor' ? harbor.lang : undefined}>{product.id === 'harbor' ? harbor.directoryDescription : t(`apps.${product.id}.desc`)}</p></div><a className="company-inline-link" href={href(`${product.href}support/`)}>{t('app.tab.support')} <span aria-hidden="true">→</span></a></article>)}</div></section>
      <section className="company-close"><h2>{t('home.contact.title')}</h2><a className="btn-primary" href={href('/contact/')}>{t('home.nav.contact')} <span aria-hidden="true">→</span></a></section>
    </> : <>
      <header className="company-contact-intro"><p className="page-eyebrow">{t('home.nav.contact')}</p><h1 className="page-title">{t('home.contact.title')}</h1><p className="page-lead">{t('home.contact.hint')}</p></header>
      <section className="company-contact-grid"><div className="company-contact-main"><h2>{zh ? '公司信息' : 'Company information'}</h2><dl><div><dt>{t('home.contact.label.company')}</dt><dd>{t('home.common.company')}</dd></div><div><dt>{t('home.contact.label.city')}</dt><dd>{t('home.common.city')}</dd></div><div><dt>{t('home.contact.label.email')}</dt><dd><a href={t('home.common.email_mailto')}>{t('home.common.email')}</a></dd></div></dl><a className="btn-primary" href={href('/support/')}>{t('nav.support')} <span aria-hidden="true">→</span></a></div>
        <div className="company-app-contacts"><h2>{zh ? '各应用技术支持' : 'App support'}</h2>{products.map((product) => <article key={product.id}><h3>{product.name}</h3><a className="company-email-link" href={`mailto:${product.email}`}>{product.email}</a><a className="company-inline-link" href={href(`${product.href}support/`)}>{t('app.tab.support')} <span aria-hidden="true">→</span></a></article>)}</div></section>
    </>}
  </div></main><SiteFooter /></>;
}
