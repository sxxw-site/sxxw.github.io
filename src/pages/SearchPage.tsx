import { useEffect, useMemo, useRef, useState } from 'react';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { useI18n } from '../i18n/I18nProvider';
import { siteRoutes } from '../app/routes';
import { pageMeta } from '../app/meta';
import { FEEDBACK_APPS } from '../lib/feedback';
import { localizedSiteHref } from '../lib/site-navigation';
import '../styles/service-pages.css';

// The search page itself and app-embedded tools are not indexed.
const EXCLUDE = new Set(['/search/', '/feedback/', '/migrate/']);
type Item = { path: string; title: string; description: string; keywords: string };

function queryFromUrl() {
  return typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('q') ?? '';
}

export default function SearchPage() {
  const { t, language } = useI18n();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  const href = (path: string) => localizedSiteHref(language.normalizedCode, path);
  const [q, setQ] = useState(queryFromUrl);
  const input = useRef<HTMLInputElement>(null);
  const query = q.trim();

  // Initialize from the URL before the first sync so an incoming q is never erased.
  // Update only q; retain language, visual style, hashes and browser history state.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', next);
    }
  }, [query]);

  useEffect(() => {
    const onPopState = () => setQ(queryFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const index = useMemo<Item[]>(() => siteRoutes
    .filter((route) => !EXCLUDE.has(route.path))
    .map((route) => {
      const meta = language.normalizedCode === 'zh-hans' ? null : pageMeta(route.path, t);
      return { path: route.path, title: meta?.title ?? route.title, description: meta?.description ?? route.description, keywords: route.keywords ?? '' };
    }), [t, language.normalizedCode]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length ? index.filter((item) => {
      const text = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
      return terms.every((term) => text.includes(term));
    }) : [];
  }, [query, index]);

  const browseGroups = [
    { title: zh ? '应用与下载' : 'Apps and downloads', items: [
      { path: '/apps/', label: t('nav.apps') },
      ...['memoria', 'timetrails', 'traceapp'].map((id) => ({ path: `/apps/${id}/`, label: FEEDBACK_APPS[id].name })),
    ] },
    { title: zh ? '帮助与技术支持' : 'Help and support', items: [
      { path: '/support/', label: t('nav.support') },
      ...['memoria', 'timetrails', 'traceapp'].map((id) => ({ path: `/apps/${id}/support/`, label: `${FEEDBACK_APPS[id].name} · ${t('app.tab.support')}` })),
    ] },
    { title: zh ? '公司信息' : 'Company', items: [
      { path: '/', label: t('home.nav.home') },
      { path: '/about/', label: t('home.nav.about') },
      { path: '/contact/', label: t('home.nav.contact') },
    ] },
  ];

  function clearQuery() { setQ(''); input.current?.focus(); }

  return <>
    <SiteHeader active="search" subtitle="Search" />
    <main className="service-page service-search" id="page-content" tabIndex={-1}><div className="container service-container">
      <header className="service-intro service-search-intro">
        <p className="page-eyebrow">sxxw.site · {t('nav.search')}</p>
        <h1 className="page-title">{t('search.title')}</h1>
        <form className="service-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="service-search-label" htmlFor="site-search-query">{zh ? '搜索关键词' : 'Search keywords'}</label>
          <div className="service-search-controls"><input ref={input} id="site-search-query" className="service-search-input" type="search" name="q" value={q} onChange={(event) => setQ(event.target.value)} placeholder={t('search.placeholder')} aria-describedby="site-search-hint" />
            {q && <button className="service-search-clear" type="button" onClick={clearQuery}>{zh ? '清除' : 'Clear'}<span aria-hidden="true">×</span></button>}
          </div>
          <p className="service-search-hint" id="site-search-hint">{t('search.hint')}</p>
        </form>
      </header>
      {query ? <section className="service-search-results" aria-labelledby="search-results-title" aria-live="polite">
        <div className="service-results-heading"><h2 id="search-results-title">{zh ? '搜索结果' : 'Search results'}</h2><p>{t('search.count').replace('{n}', String(results.length))}</p></div>
        {results.length > 0 ? <ul className="service-result-list">{results.map((item) => <li key={item.path}><a href={href(item.path)}>
          <div><h3>{item.title}</h3><p>{item.description}</p><span className="service-result-path">{item.path}</span></div><span className="service-result-arrow" aria-hidden="true">↗</span>
        </a></li>)}</ul> : <div className="service-search-empty"><h3>{t('search.empty')}</h3><p>{zh ? '试试应用名称，或缩短关键词。也可以清除搜索，按分类浏览。' : 'Try an app name or fewer keywords. Clear the search to browse by category.'}</p><button className="service-action" type="button" onClick={clearQuery}>{zh ? '清除搜索，浏览分类' : 'Clear search and browse'}<span aria-hidden="true">→</span></button></div>}
      </section> : <section className="service-search-browse" aria-labelledby="search-browse-title">
        <div className="service-results-heading"><h2 id="search-browse-title">{zh ? '按分类浏览' : 'Browse by category'}</h2><p>{zh ? '从产品、支持或公司信息开始。' : 'Explore our apps, support and company information.'}</p></div>
        <div className="service-browse-groups">{browseGroups.map((group) => <div className="service-browse-group" key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item.path}><a href={href(item.path)}><span>{item.label}</span><span aria-hidden="true">→</span></a></li>)}</ul></div>)}</div>
      </section>}
    </div></main>
    <SiteFooter />
  </>;
}
