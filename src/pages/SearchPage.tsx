import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n } from '../i18n/I18nProvider';
import { siteRoutes } from '../app/routes';
import { pageMeta } from '../app/meta';

// 不纳入搜索的页面(搜索页自身 / App 内嵌工具页)
const EXCLUDE = new Set(['/search/', '/feedback/', '/migrate/']);

type Item = { path: string; title: string; description: string; keywords: string };

export default function SearchPage() {
  const { t, language } = useI18n();
  const [q, setQ] = useState('');

  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get('q');
    if (u) setQ(u);
  }, []);

  // 把查询词同步到 URL(?q=)，便于分享与 SearchAction
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (q.trim()) url.searchParams.set('q', q.trim());
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }, [q]);

  const index = useMemo<Item[]>(() => {
    const zh = language.normalizedCode === 'zh-hans';
    return siteRoutes
      .filter((r) => !EXCLUDE.has(r.path))
      .map((r) => {
        const m = zh ? null : pageMeta(r.path, t);
        return { path: r.path, title: m?.title ?? r.title, description: m?.description ?? r.description, keywords: r.keywords ?? '' };
      });
  }, [t, language]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return index;
    const terms = query.split(/\s+/).filter(Boolean);
    return index.filter((it) => {
      const hay = `${it.title} ${it.description} ${it.keywords}`.toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
  }, [q, index]);

  return <div className="search-page">
    <ThemeToggle />
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="/" aria-label={t('home.common.company')}><img className="brand-logo" src="/logo.png" alt="" aria-hidden="true" width={36} height={36} /><span className="brand-text"><span className="cn">{t('home.common.company')}</span><span className="en">Search</span></span></a>
      <nav className="nav-menu nav-menu-static"><a className="nav-link" href="/">{t('home.nav.home')}</a><a className="nav-link" href="/apps/">{t('nav.apps')}</a><a className="nav-link" href="/support/">{t('nav.support')}</a><LanguageSelect /></nav>
    </div></header>

    <main className="product-page"><div className="container product-page-inner">
      <section className="product-hero"><h1>{t('search.title')}</h1>
        <div className="search-box">
          <input
            className="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            autoFocus
            aria-label={t('search.title')}
          />
        </div>
        <p className="search-hint">{t('search.hint')}</p>
      </section>

      <section className="search-results" aria-live="polite">
        <p className="search-count">{t('search.count').replace('{n}', String(results.length))}</p>
        {results.length === 0
          ? <p className="search-empty">{t('search.empty')}</p>
          : <ul className="search-list">{results.map((it) => <li key={it.path}>
              <a href={it.path}>
                <h2>{it.title}</h2>
                <p>{it.description}</p>
              </a>
            </li>)}</ul>}
      </section>
    </div></main>

    <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">{t('home.common.company')}</div></div></div></footer>
  </div>;
}
