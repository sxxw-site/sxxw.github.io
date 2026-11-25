import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { useI18n } from '../i18n/I18nProvider';
import { langHref } from '../i18n/path';
import { timeTrailsScreenshot } from '../lib/timetrails';
import { previewImage } from '../lib/app-preview';
import { harborCopy } from '../content/apps/harbor';
import '../styles/apps-directory.css';
import '../styles/harbor-pages.css';

const apps = [
  { id: 'memoria', name: '纪念日', platform: 'App Store · HarmonyOS', descKey: 'apps.memoria.desc', href: '/apps/memoria/', tagKey: 'apps.memoria.tag', documents: [{ platform: 'App Store', base: '/apps/memoria/ios' }, { platform: 'HarmonyOS', base: '/apps/memoria/harmony' }] },
  { id: 'timetrails', name: '足迹-时光轨迹', platform: 'iPhone · iPad · Apple Watch', descKey: 'apps.timetrails.desc', href: '/apps/timetrails/', tagKey: 'apps.timetrails.tag', documents: [{ platform: 'App Store', base: '/apps/timetrails' }] },
  { id: 'traceapp', name: '出行轨迹 TraceApp', platform: 'App Store · iPhone', descKey: 'apps.traceapp.desc', href: '/apps/traceapp/', tagKey: 'apps.traceapp.tag', documents: [{ platform: 'App Store', base: '/apps/traceapp' }] },
  { id: 'harbor', name: 'Harbor', platform: 'App Store · TestFlight · Mac DMG', descKey: '', href: '/apps/harbor/', tagKey: '', documents: [{ platform: 'App Store · TestFlight · Mac DMG', base: '/apps/harbor' }] },
];

export default function AppsPage() {
  const { t, language } = useI18n();
  const harbor = harborCopy(language.normalizedCode);
  const href = (path: string) => langHref(language.normalizedCode, path);

  return <><SiteHeader active="apps" />
    <main className="apps-directory-page" id="page-content" tabIndex={-1}><div className="container">
      <header className="directory-intro"><p className="directory-eyebrow">{t('nav.apps')}</p><h1>{t('apps.hero.title')}</h1><p className="directory-description">{t('apps.hero.desc')}</p></header>
      <div className="directory-products">{apps.map((app) => <article className={`directory-product directory-product-${app.id}`} key={app.id} aria-labelledby={`directory-${app.id}`}>
        <div className="directory-product-copy">
          <p className="directory-category" lang={app.id === 'harbor' ? harbor.lang : undefined}>{app.id === 'harbor' ? harbor.category : t(app.tagKey)}</p>
          <h2 id={`directory-${app.id}`}>{app.name}</h2>
          <p className="directory-platform">{app.platform}</p>
          <p className="directory-product-description" lang={app.id === 'harbor' ? harbor.lang : undefined}>{app.id === 'harbor' ? harbor.directoryDescription : t(app.descKey)}</p>
          <a className="btn-primary directory-product-link" href={href(app.href)}>{t('apps.card.cta')}<span aria-hidden="true">↗</span></a>
          <div className="directory-documents">{app.documents.map((document) => <nav className="directory-document-group" aria-label={`${app.name} · ${document.platform} · ${t('app.tab.support')}`} key={document.base}>
            {app.documents.length > 1 && <span className="directory-document-platform">{document.platform}</span>}
            <div><a href={href(`${document.base}/${app.id === 'harbor' ? 'support/#setup' : 'getting-started/'}`)}>{t('app.tab.start')}</a><a href={href(`${document.base}/privacy/`)}>{t('app.tab.privacy')}</a><a href={href(`${document.base}/terms/`)}>{t('app.tab.terms')}</a></div>
          </nav>)}</div>
        </div>
        <a className={`directory-preview directory-preview-${app.id}`} href={href(app.href)} aria-label={`${app.name} · ${t('apps.card.cta')}`}>
          {app.id === 'memoria' && <img className="directory-phone" {...previewImage('/apps/memoria/ios/shot-01.png', '(max-width: 620px) 40vw, 192px')} alt={`${app.name} · ${t('app.shots')}`} width={1080} height={2346} loading="lazy" decoding="async" />}
          {app.id === 'timetrails' && <img className="directory-landscape" src={timeTrailsScreenshot(language.normalizedCode, 'overview', 'duo')} alt={`${app.name} · ${t('tt.ui.insightsTitle')}`} width={2853} height={2007} loading="lazy" decoding="async" />}
          {app.id === 'traceapp' && <div className="directory-map-pair"><img src="/apps/traceapp/shot-01.png" alt={`${app.name} · ${t('trace.feat.0')}`} width={392} height={250} loading="lazy" decoding="async" /><img src="/apps/traceapp/shot-03.png" alt={`${app.name} · ${t('trace.feat.2')}`} width={294} height={216} loading="lazy" decoding="async" /></div>}
          {app.id === 'harbor' && <img src="/apps/harbor/icon.png" alt="Harbor" width={1024} height={1024} loading="lazy" decoding="async" />}
        </a>
      </article>)}</div>
    </div></main>
    <SiteFooter />
  </>;
}
