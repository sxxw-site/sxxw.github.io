import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ root, configFile: false, appType: 'custom', esbuild: { jsx: 'automatic' }, optimizeDeps: { noDiscovery: true, entries: [] }, server: { middlewareMode: true, hmr: false, ws: false, watch: null }, logLevel: 'error' });
after(() => server.close());
const { buildSiteSearchIndex, searchSiteIndex } = await server.ssrLoadModule('/src/lib/site-search.ts');
const { siteRoutes } = await server.ssrLoadModule('/src/app/routes.ts');
const { pageMeta } = await server.ssrLoadModule('/src/app/meta.ts');
const { harborCopy, harborSection } = await server.ssrLoadModule('/src/content/apps/harbor.ts');
const { default: SearchPage } = await server.ssrLoadModule('/src/pages/SearchPage.tsx');
const { I18nProvider } = await server.ssrLoadModule('/src/i18n/I18nProvider.tsx');
const base = JSON.parse(await readFile(new URL('../src/locales/zh-hans.json', import.meta.url), 'utf8'));

async function context(language) {
  const dict = { ...base, ...JSON.parse(await readFile(new URL(`../src/locales/${language}.json`, import.meta.url), 'utf8')) };
  const t = (key) => dict[key] ?? key;
  return { t, dict, index: buildSiteSearchIndex(t, language) };
}
const paths = (items) => items.map((item) => item.path).sort();
const productPaths = (id) => paths(siteRoutes.filter((route) => route.path.startsWith(`/apps/${id}/`)));

test('stable English product names find every real product subpage in each site language', async () => {
  for (const language of ['en', 'ja', 'zh-hans']) {
    const { index } = await context(language);
    for (const [id, brand] of [['memoria', 'Memoria'], ['timetrails', 'TimeTrails'], ['traceapp', 'TraceApp'], ['harbor', 'Harbor']]) {
      const matches = searchSiteIndex(index, brand).filter((item) => item.path.startsWith(`/apps/${id}/`));
      assert.deepEqual(paths(matches), productPaths(id), `${language}: ${brand} must include overview, help and legal pages`);
    }
  }
});

test('Memoria iOS search includes iOS documents and shared support, without HarmonyOS-only pages', async () => {
  for (const language of ['en', 'ja', 'zh-hans']) {
    const { index } = await context(language);
    const expected = productPaths('memoria').filter((path) => !path.includes('/harmony/'));
    assert.deepEqual(paths(searchSiteIndex(index, 'Memoria iOS')), expected, language);
  }
  const { index } = await context('en');
  assert.deepEqual(paths(searchSiteIndex(index, 'Memoria iOS privacy')), ['/apps/memoria/ios/privacy/']);
  assert.deepEqual(paths(searchSiteIndex(index, 'Memoria iOS support')), ['/apps/memoria/support/']);
});

test('Memoria HarmonyOS search includes its own platform documents and shared support only', async () => {
  for (const language of ['en', 'ja', 'zh-hans']) {
    const { index } = await context(language);
    const expected = productPaths('memoria').filter((path) => !path.includes('/ios/'));
    assert.deepEqual(paths(searchSiteIndex(index, 'Memoria HarmonyOS')), expected, language);
  }
});

test('Chinese product aliases remain searchable from English product and support pages', async () => {
  const { index } = await context('en');
  for (const [id, aliases] of [['memoria', ['纪念日', '紀念日']], ['timetrails', ['足迹', '时光轨迹', '足跡', '時光軌跡']], ['traceapp', ['出行轨迹', '出行軌跡']]]) {
    for (const alias of aliases) {
      assert.deepEqual(paths(searchSiteIndex(index, alias).filter((item) => item.path.startsWith(`/apps/${id}/`))), productPaths(id), alias);
    }
  }
});

test('multiword Harbor search keeps AND semantics and ignores case and repeated whitespace', async () => {
  const { index } = await context('en');
  const matches = paths(searchSiteIndex(index, 'Harbor WebDAV'));
  assert.ok(matches.includes('/apps/harbor/'));
  assert.ok(matches.includes('/apps/harbor/support/'));
  assert.deepEqual(paths(searchSiteIndex(index, ' \t hArBoR \n  wEbDaV  ')), matches);
  assert.deepEqual(searchSiteIndex(index, 'Harbor WebDAV nonexistent-search-term'), []);
});

test('localized result titles, descriptions and Harbor body languages are preserved', async () => {
  for (const language of ['en', 'ja', 'zh-hans']) {
    const { index, t } = await context(language);
    for (const item of index) {
      const route = siteRoutes.find((route) => route.path === item.path);
      const meta = language === 'zh-hans' ? null : pageMeta(item.path, t, language);
      assert.equal(item.title, meta?.title ?? route.title);
      assert.equal(item.description, meta?.description ?? route.description);
      if (item.path.startsWith('/apps/harbor/')) {
        assert.equal(item.contentLanguage, harborCopy(language, harborSection(item.path)).lang, item.path);
      }
    }
  }
});

test('blank queries show no results and utility pages remain outside the index', async () => {
  const { index } = await context('en');
  assert.deepEqual(searchSiteIndex(index, ''), []);
  assert.deepEqual(searchSiteIndex(index, ' \t\n '), []);
  for (const path of ['/search/', '/feedback/', '/migrate/']) {
    assert.equal(index.some((item) => item.path === path), false, path);
  }
});

test('the real SearchPage renders matching Memoria privacy links and excludes utility results', async () => {
  const { dict } = await context('en');
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  function render(query) {
    const location = new URL(`https://sxxw.site/en/search/?q=${encodeURIComponent(query)}`);
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location } });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { documentElement: { dataset: { siteStyle: 'paper', themePreference: 'light' } } } });
    return renderToStaticMarkup(createElement(I18nProvider, { initialLanguage: 'en', dictionary: dict }, createElement(SearchPage)));
  }
  try {
    const html = render('Memoria');
    assert.ok(html.includes('href="/en/apps/memoria/ios/privacy/"'), 'Memoria results must link to the actual iOS privacy page');
    assert.ok(html.includes('href="/en/apps/memoria/support/"'), 'Memoria results must include shared support');
    const privacy = render('Memoria iOS privacy');
    assert.ok(privacy.includes('href="/en/apps/memoria/ios/privacy/"'));
    assert.equal(privacy.includes('href="/en/apps/memoria/harmony/privacy/"'), false);
    for (const query of ['Memoria', 'feedback', 'migration', 'search']) {
      const resultPaths = [...render(query).matchAll(/class="service-result-path"[^>]*>([^<]+)<\/span>/g)].map((match) => match[1]);
      for (const utility of ['/search/', '/feedback/', '/migrate/']) assert.equal(resultPaths.includes(utility), false, query);
    }
  } finally {
    for (const [key, descriptor] of [['window', previousWindow], ['document', previousDocument]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
