import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { LEGACY_IMPORT_FRAGMENT, legacyTimeTrailsGuideHtml, legacyTimeTrailsGuideRedirects, legacyTimeTrailsGuideScript, legacyTimeTrailsGuideTargets, writeLegacyTimeTrailsGuideRedirects } from './legacy-timetrails-guides.mjs';

const origin = 'https://sxxw.site';
const chineseGuide = '/apps/timetrails/getting-started/';
const englishGuide = '/en/apps/timetrails/getting-started/';
const catalog = JSON.parse(readFileSync(new URL('../src/i18n/languages.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(readFileSync(new URL('./legacy-timetrails-manifest.json', import.meta.url), 'utf8'));
const languages = catalog.map((language) => language.code);
const redirects = legacyTimeTrailsGuideRedirects(languages);
const byPath = new Map(redirects.map((entry) => [entry.sourcePath, entry]));

function browserDestination(redirect, sourcePath) {
  const source = new URL(sourcePath, origin);
  const destinations = [];
  const html = legacyTimeTrailsGuideHtml(redirect, origin);
  runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    URLSearchParams,
    window: { location: { search: source.search, hash: source.hash, replace: (value) => destinations.push(new URL(value, source).href) } },
  });
  assert.equal(destinations.length, 1, 'One history-replacing navigation');
  return new URL(destinations[0]);
}

test('guide inventory is the 91 historical HTML documents and the one observed root clean URL', () => {
  assert.equal(redirects.length, 92);
  assert.equal(byPath.size, 92);
  assert.equal(new Set(redirects.map((entry) => entry.outputPath)).size, 92);
  assert.deepEqual(redirects.filter((entry) => entry.sourcePath.endsWith('.html')).map((entry) => entry.sourcePath).sort(),
    manifest.locales.map((locale) => `/${locale ? `${locale}/` : ''}pages/timetrails/guide.html`).sort());
  assert.equal(byPath.get('/pages/timetrails/guide/').outputPath, 'pages/timetrails/guide/index.html');
  for (const unknown of ['/timetrails/guide.html', '/en/timetrails/guide.html', '/en/pages/timetrails/guide/', '/en/pages/timetrails/licenses.html', '/unknown/pages/timetrails/guide.html']) {
    assert.equal(byPath.has(unknown), false, unknown);
  }
});

test('guide aliases select an authored Chinese or English import explanation', () => {
  for (const locale of ['', 'zh-hans', 'zh-hant', 'zh-hk', 'yue']) {
    const path = `/${locale ? `${locale}/` : ''}pages/timetrails/guide.html`;
    assert.equal(byPath.get(path).targetPath, chineseGuide);
    assert.equal(byPath.get(path).targetLanguage, 'zh-hans');
  }
  for (const locale of ['en', 'en-au', 'en-ca', 'en-gb', 'en-in']) {
    assert.equal(byPath.get(`/${locale}/pages/timetrails/guide.html`).targetPath, `/${locale}${chineseGuide}`);
  }
  for (const locale of ['ja', 'de', 'am', 'sr-latn']) {
    assert.equal(byPath.get(`/${locale}/pages/timetrails/guide.html`).targetPath, englishGuide);
  }
  const withoutRegion = legacyTimeTrailsGuideRedirects(languages.filter((code) => code.toLowerCase() !== 'en-gb'));
  assert.equal(withoutRegion.find((entry) => entry.sourcePath === '/en-gb/pages/timetrails/guide.html').targetPath, englishGuide);
});

test('the exact Perplexity and App Store guide citation reaches the data-import section', () => {
  const clean = byPath.get('/pages/timetrails/guide/');
  for (const source of ['/pages/timetrails/guide', '/pages/timetrails/guide/', '/pages/timetrails/guide?from=AppAgg.com&utm_source=AppAgg.com']) {
    const destination = browserDestination(clean, source);
    assert.equal(destination.pathname, chineseGuide);
    assert.equal(destination.hash, '#data-import');
    assert.equal(destination.search, new URL(source, origin).search);
  }
  assert.equal(browserDestination(byPath.get('/en/pages/timetrails/guide.html'), '/en/pages/timetrails/guide.html').href,
    `${origin}${englishGuide}#data-import`);
});

test('appearance, embed, UTM, language and diagnostics parameters are preserved with the import anchor', () => {
  const source = '/pages/timetrails/guide?embed=1&style=forest&theme=dark&lang=zh-Hans&appVersion=1.2.3&utm_source=AppAgg.com';
  assert.equal(browserDestination(byPath.get('/pages/timetrails/guide/'), source).href,
    `${origin}${chineseGuide}${new URL(source, origin).search}#data-import`);
  for (const hash of ['#data-import-formats', '#data-import', '#existing-fragment']) {
    const withHash = source + hash;
    assert.equal(browserDestination(byPath.get('/pages/timetrails/guide/'), withHash).hash, hash);
  }
});

test('explicit unsupported root query languages use a fixed English prefix without changing the query', () => {
  const redirect = byPath.get('/pages/timetrails/guide/');
  for (const language of ['ja', 'zh-Hant', 'yue', 'en', 'en-GB', 'de', '//evil.example', '']) {
    const source = `/pages/timetrails/guide?lang=${encodeURIComponent(language)}&embed=1&style=minimal&theme=dark`;
    const destination = browserDestination(redirect, source);
    assert.equal(destination.pathname, englishGuide, language);
    assert.equal(destination.search, new URL(source, origin).search, language);
    assert.equal(destination.hash, LEGACY_IMPORT_FRAGMENT);
  }
  for (const source of ['/pages/timetrails/guide', '/pages/timetrails/guide?lang=zh-Hans', '/pages/timetrails/guide?lang=ZH_hans']) {
    assert.equal(browserDestination(redirect, source).pathname, chineseGuide, source);
  }
  const regional = byPath.get('/en-gb/pages/timetrails/guide.html');
  assert.equal(browserDestination(regional, '/en-gb/pages/timetrails/guide.html?lang=ja').pathname, `/en-gb${chineseGuide}`);
});

test('query and fragment contents cannot choose an external host, arbitrary path or executable script', () => {
  const redirect = byPath.get('/pages/timetrails/guide/');
  for (const suffix of [
    '?next=https%3A%2F%2Fevil.example&url=//evil.example',
    '?lang=ja&next=%2Fmigrate%2F#https://evil.example/',
    '?lang=%22%3Bthrow%20new%20Error(%27executed%27)%3B%2F%2F',
  ]) {
    const destination = browserDestination(redirect, '/pages/timetrails/guide' + suffix);
    assert.equal(destination.origin, origin);
    assert.ok([chineseGuide, englishGuide].includes(destination.pathname));
    assert.equal(destination.search, new URL('/pages/timetrails/guide' + suffix, origin).search);
  }
  for (const path of ['//evil.example/', 'https://evil.example/', '/migrate/', '/ja/apps/timetrails/getting-started/', `${englishGuide}?next=evil`]) {
    assert.throws(() => legacyTimeTrailsGuideScript(path), /fixed, local/);
  }
});

test('without JavaScript an immediate redirect and visible fallback open the guide section with a clean canonical', () => {
  for (const [source, target, lang] of [['/pages/timetrails/guide/', chineseGuide, 'zh-Hans'], ['/ja/pages/timetrails/guide.html', englishGuide, 'en']]) {
    const html = legacyTimeTrailsGuideHtml(byPath.get(source), origin);
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${target}">`));
    assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=${origin}${target}#data-import">`));
    assert.ok(html.includes(`<a href="${origin}${target}#data-import">`));
    assert.ok(!html.includes('hreflang') && !html.includes('application/ld+json') && !html.includes('react-assets'));
  }
});

function fixturePage(path, { canonical = path, robots = 'index,follow', anchor = true } = {}) {
  return `<!doctype html><html><head><link rel="canonical" href="${origin}${canonical}"><meta name="robots" content="${robots}"></head><body><h1>TimeTrails setup</h1>${anchor ? '<section id="data-import"><h2>Import DB and GPX files</h2></section>' : ''}</body></html>`;
}

function put(dir, path, html) {
  const file = join(dir, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

test('generation checks every canonical/indexable destination and its import section before writing aliases', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sxxw-legacy-guide-target-'));
  try {
    put(dir, chineseGuide, fixturePage(chineseGuide));
    assert.throws(() => writeLegacyTimeTrailsGuideRedirects(dir, origin, ['zh-hans', 'en']), /destination is missing/);
    for (const [options, message] of [[{ canonical: chineseGuide }, /self-canonical and indexable/], [{ robots: 'noindex,follow' }, /self-canonical and indexable/], [{ anchor: false }, /no data-import section/]]) {
      put(dir, englishGuide, fixturePage(englishGuide, options));
      assert.throws(() => writeLegacyTimeTrailsGuideRedirects(dir, origin, ['zh-hans', 'en']), message);
      assert.equal(existsSync(join(dir, 'pages/timetrails/guide.html')), false);
      assert.equal(existsSync(join(dir, 'pages/timetrails/guide/index.html')), false);
    }
    assert.deepEqual(legacyTimeTrailsGuideTargets(byPath.get('/pages/timetrails/guide/')), [chineseGuide, englishGuide]);
  } finally { rmSync(dir, { force: true, recursive: true }); }
});

test('generation writes exactly 92 known files and leaves the authored import instructions intact', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sxxw-legacy-guides-'));
  const targets = new Set(redirects.flatMap(legacyTimeTrailsGuideTargets));
  try {
    for (const path of targets) put(dir, path, fixturePage(path));
    assert.equal(writeLegacyTimeTrailsGuideRedirects(dir, origin, languages).length, 92);
    for (const redirect of redirects) {
      const html = readFileSync(join(dir, redirect.outputPath), 'utf8');
      assert.ok(html.includes(`content="0; url=${origin}${redirect.targetPath}#data-import"`));
      assert.equal(browserDestination(redirect, redirect.sourcePath).pathname, redirect.targetPath);
    }
    for (const path of targets) assert.equal(readFileSync(join(dir, path.slice(1), 'index.html'), 'utf8'), fixturePage(path));
    for (const path of ['timetrails/guide.html', 'en/timetrails/guide.html', 'en/pages/timetrails/guide/index.html', 'pages/timetrails/licenses.html', 'unknown/pages/timetrails/guide.html']) {
      assert.equal(existsSync(join(dir, path)), false, path);
    }
  } finally { rmSync(dir, { force: true, recursive: true }); }
});
