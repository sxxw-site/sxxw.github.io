import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://sxxw.site';
const ORG_NAME = '上海树下小屋网络科技有限公司';
const SUPPORT_EMAIL = 'house@sxxw.site';
const DEFAULT_LANG = 'zh-hans';
const RTL = new Set(['ar', 'fa', 'he']);
const APP_LANDING_PATHS = new Set(['/apps/timetrails/', '/apps/traceapp/', '/apps/memoria/ios/', '/apps/memoria/harmony/']);

const outputDir = 'docs';
const localesDir = 'src/locales';
const manifest = JSON.parse(readFileSync(join(outputDir, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];
if (!entry) throw new Error('Vite manifest is missing index.html.');

const ssr = await import(pathToFileURL(join(process.cwd(), '.ssr', 'entry-server.js')).href);
const sourceRoutes = ssr.siteRoutes;
if (!sourceRoutes) throw new Error('The prerender route manifest could not be loaded.');

// ---- 语言与字典 ----
const langCatalog = JSON.parse(readFileSync(join('src', 'i18n', 'languages.json'), 'utf8'));
const norm = (c) => (c ?? '').trim().replace(/_/g, '-').toLowerCase();
const LANGS = langCatalog.map((e) => ({
  code: norm(e.code),
  htmlLang: e.asc_code || e.code,
  rtl: RTL.has(norm(e.code).split('-')[0]),
}));
// 多语言页面不含这些语言前缀页仅生成默认中文(App 嵌入类/独立 i18n 页)
const NON_PREFIXED_ONLY = new Set(['/feedback/', '/migrate/']);

const baseDict = JSON.parse(readFileSync(join(localesDir, 'zh-hans.json'), 'utf8'));
const loadLocale = (code) => {
  try { return JSON.parse(readFileSync(join(localesDir, `${code}.json`), 'utf8')); } catch { return {}; }
};
const dictCache = new Map([[DEFAULT_LANG, baseDict]]);
function dictFor(code) {
  if (dictCache.has(code)) return dictCache.get(code);
  const b = code.split('-')[0];
  const merged = { ...baseDict, ...(b !== code ? loadLocale(b) : {}), ...loadLocale(code) };
  dictCache.set(code, merged);
  return merged;
}

const langHref = (lang, path) => (lang === DEFAULT_LANG ? path : `/${lang}${path}`);
const titleByPath = new Map(sourceRoutes.map((r) => [r.path, r.title]));
const styles = (entry.css ?? []).map((file) => `<link rel="stylesheet" href="/${file}">`).join('');
const script = `<script type="module" src="/${entry.file}"></script>`;
const sitemapEntries = [];

for (const route of sourceRoutes) {
  const prefixed = !NON_PREFIXED_ONLY.has(route.path);
  const langsForRoute = prefixed ? LANGS : LANGS.filter((l) => l.code === DEFAULT_LANG);
  // 该路由的 hreflang 互指(仅多语言路由)
  const alternates = prefixed
    ? LANGS.map((l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${SITE}${langHref(l.code, route.path)}">`).join('')
      + `<link rel="alternate" hreflang="x-default" href="${SITE}${route.path}">`
    : '';

  for (const L of langsForRoute) {
    const isDefault = L.code === DEFAULT_LANG;
    const dict = dictFor(L.code);
    const t = (k) => dict[k] ?? k;
    const meta = isDefault ? null : ssr.pageMeta(route.path, t);
    const title = escapeHtml(meta?.title ?? route.title);
    const description = escapeHtml(meta?.description ?? route.description);
    const kw = isDefault && route.keywords ? `<meta name="keywords" content="${escapeHtml(route.keywords)}">` : '';
    const canonical = `${SITE}${langHref(L.code, route.path)}`;
    const ogLocale = L.htmlLang.replace('-', '_');
    const isTimeTrails = route.path.startsWith('/apps/timetrails/');
    const shareImage = isTimeTrails ? `/apps/timetrails/${L.code.startsWith('zh') ? '' : 'en/'}cover.png` : '/logo.png';
    const structuredData = JSON.stringify(structuredDataFor(route, canonical, meta?.title ?? route.title, meta?.description ?? route.description, L.htmlLang, L.code, dict));
    const body = ssr.renderRoute(route.path, L.code, isDefault ? undefined : dict);

    const head = [
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta name="color-scheme" content="dark light">',
      `<script>(function(){try{var t=localStorage.getItem('sxxw-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}try{if(location.search.indexOf('embed=1')>-1){document.documentElement.classList.add('embed');}}catch(e){}document.documentElement.classList.add('js');})();</script>`,
      `<title>${title}</title>`,
      `<meta name="description" content="${description}">`,
      kw,
      '<meta name="robots" content="index,follow,max-image-preview:large">',
      `<link rel="canonical" href="${canonical}">`,
      alternates,
      '<link rel="icon" type="image/png" sizes="64x64" href="/favicon.png">',
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Silkscreen:wght@400;700&display=swap">',
      '<meta property="og:type" content="website">',
      `<meta property="og:site_name" content="${escapeHtml(ORG_NAME)}">`,
      `<meta property="og:locale" content="${ogLocale}">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:url" content="${canonical}">`,
      `<meta property="og:image" content="${SITE}${shareImage}">`,
      ...(isTimeTrails ? ['<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">'] : []),
      `<meta name="twitter:card" content="${isTimeTrails ? 'summary_large_image' : 'summary'}">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${description}">`,
      `<meta name="twitter:image" content="${SITE}${shareImage}">`,
      `<script type="application/ld+json">${escapeScript(structuredData)}</script>`,
      styles,
    ].join('');
    const htmlAttr = `lang="${L.htmlLang}"${L.rtl ? ' dir="rtl"' : ''}`;
    const html = `<!doctype html><html ${htmlAttr}><head>${head}</head><body><div id="root">${body}</div>${script}</body></html>`;
    const rel = langHref(L.code, route.path);
    const file = rel === '/' ? join(outputDir, 'index.html') : join(outputDir, rel, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    sitemapEntries.push(`${SITE}${rel}`);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
  .map((loc) => `  <url><loc>${loc}</loc></url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(join(outputDir, 'sitemap.xml'), sitemap);

rmSync(join(outputDir, '.vite'), { force: true, recursive: true });
rmSync('.ssr', { force: true, recursive: true });

// ---- 结构化数据 ----

function organizationNode() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: `${SITE}/`,
    email: SUPPORT_EMAIL,
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL, availableLanguage: ['zh-Hans', 'en'] },
  };
}

function appInfo(path) {
  if (path.startsWith('/apps/memoria/')) {
    const harmony = path.includes('/harmony/');
    return {
      name: '纪念日·倒数',
      alternateName: ['纪念日', '倒数日', 'Memoria'],
      applicationCategory: 'LifestyleApplication',
      operatingSystem: harmony ? 'HarmonyOS' : 'iOS, iPadOS, watchOS',
      downloadUrl: harmony ? 'https://appgallery.huawei.com/app/C6917613545100329502' : 'https://apps.apple.com/app/id6760106574',
    };
  }
  if (path.startsWith('/apps/timetrails/')) return { name: '足迹-时光轨迹', alternateName: ['足迹', 'TimeTrails'], applicationCategory: 'TravelApplication', operatingSystem: 'iOS, iPadOS, watchOS', downloadUrl: 'https://apps.apple.com/app/id6752662508' };
  if (path.startsWith('/apps/traceapp/')) return { name: '出行轨迹 TraceApp', alternateName: ['出行轨迹', 'TraceApp'], applicationCategory: 'TravelApplication', operatingSystem: 'iOS, watchOS', downloadUrl: 'https://apps.apple.com/app/id1634761411' };
  return null;
}

function breadcrumbNode(path) {
  if (path === '/') return null;
  const segments = path.split('/').filter(Boolean);
  const items = [{ name: '首页', url: `${SITE}/` }];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    const name = titleByPath.get(`${acc}/`);
    if (name) items.push({ name, url: `${SITE}${acc}/` });
  }
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function faqNode(path, dict) {
  const prefix = path === '/apps/timetrails/support/' ? 'tt.ui.faq'
    : path === '/apps/traceapp/support/' ? 'trace.ui.faq'
      : path === '/apps/memoria/support/' ? 'mem.ui.faq' : null;
  if (!prefix) return null;
  const items = [];
  for (let i = 0; i < (prefix === 'tt.ui.faq' ? 4 : 3); i++) {
    const q = dict[`${prefix}.${i}.q`];
    const a = dict[`${prefix}.${i}.a${prefix === 'mem.ui.faq' && i < 2 ? '.ios' : ''}`];
    if (q && a) items.push({ q, a });
  }
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

function featureListFor(path, dict) {
  const pfx = path.startsWith('/apps/timetrails/') ? 'tt.feat.'
    : path.startsWith('/apps/traceapp/') ? 'trace.feat.'
      : path.startsWith('/apps/memoria/') ? (path.includes('/harmony/') ? 'mem.hm.feat.' : 'mem.ios.feat.') : null;
  if (!pfx) return null;
  const out = [];
  for (let i = 0; i < 12; i++) { const v = dict[`${pfx}${i}`]; if (v) out.push(v); }
  return out.length ? out : null;
}

function screenshotsFor(path, language) {
  const S = (dir, names) => names.map((n) => `${SITE}${dir}${n}`);
  if (path === '/apps/timetrails/') {
    const code = language.toLowerCase();
    const base = code.split('-')[0];
    const locale = code === 'zh-hant' || code === 'zh-hk' ? 'zh-hant'
      : base === 'zh' ? '' : ['ja', 'ko', 'ru', 'ar'].includes(base) ? base : 'en';
    return S(`/apps/timetrails/${locale ? `${locale}/` : ''}`, ['shot-02.webp', 'shot-03.webp']);
  }
  if (path.startsWith('/apps/traceapp/')) return S('/apps/traceapp/', ['shot-01.png', 'shot-02.png', 'shot-03.png']);
  if (path.startsWith('/apps/memoria/')) {
    return path.includes('/harmony/')
      ? S('/apps/memoria/harmony/', ['shot-01.jpg', 'shot-02.jpg', 'shot-03.jpg', 'shot-04.jpg'])
      : S('/apps/memoria/ios/', ['shot-01.png', 'shot-02.png', 'shot-03.png', 'shot-04.png', 'shot-05.png']);
  }
  return null;
}

function structuredDataFor(route, canonical, title, description, inLang, language, dict = {}) {
  const nodes = [organizationNode()];
  if (route.path === '/') {
    nodes.push({
      '@context': 'https://schema.org', '@type': 'WebSite', name: ORG_NAME, url: `${SITE}/`, inLanguage: inLang,
      publisher: { '@type': 'Organization', name: ORG_NAME },
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/search/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
    });
  }
  const app = appInfo(route.path);
  if (app && APP_LANDING_PATHS.has(route.path)) {
    const featureList = featureListFor(route.path, dict);
    const screenshot = screenshotsFor(route.path, language);
    const isTimeTrails = route.path === '/apps/timetrails/';
    nodes.push({
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', ...app,
      '@id': isTimeTrails ? `${SITE}/apps/timetrails/#app` : `${canonical}#app`,
      url: canonical, description, inLanguage: inLang, sameAs: app.downloadUrl,
      image: isTimeTrails ? `${SITE}/apps/timetrails/${language.startsWith('zh') ? '' : 'en/'}cover.png` : `${SITE}/logo.png`,
      ...(screenshot ? { screenshot } : {}),
      ...(featureList ? { featureList } : {}),
      publisher: { '@type': 'Organization', name: ORG_NAME },
    });
  } else if (route.path !== '/') {
    nodes.push({ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: inLang });
  }
  const breadcrumb = breadcrumbNode(route.path);
  if (breadcrumb) nodes.push(breadcrumb);
  const faq = faqNode(route.path, dict);
  if (faq) nodes.push(faq);
  return nodes;
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function escapeScript(value) {
  return value.replaceAll('<', '\\u003c');
}
