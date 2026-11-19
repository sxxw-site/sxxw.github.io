import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { legacyTimeTrailsHtml, legacyTimeTrailsRedirects, legacyTimeTrailsScript, writeLegacyTimeTrailsRedirects } from './legacy-timetrails.mjs';

const origin = 'https://sxxw.site';
const catalog = JSON.parse(readFileSync(new URL('../src/i18n/languages.json', import.meta.url), 'utf8'));
const languages = catalog.map((language) => language.code);
const redirects = legacyTimeTrailsRedirects(languages);
const byPath = new Map(redirects.map((entry) => [entry.sourcePath, entry]));
const scriptFrom = (html) => html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

function browserDestination(redirect, fromUrl) {
  const source = new URL(fromUrl, origin);
  const destinations = [];
  runInNewContext(scriptFrom(legacyTimeTrailsHtml(redirect, origin)), {
    window: { location: { search: source.search, hash: source.hash, replace: (value) => destinations.push(new URL(value, source).href) } },
  });
  assert.equal(destinations.length, 1, 'Use a single history-replacing navigation');
  return new URL(destinations[0]);
}

test('the frozen migration inventory covers the two historical landing families, not arbitrary old URLs', () => {
  assert.equal(redirects.length, 182);
  assert.equal(byPath.size, 182);
  for (const path of ['/pages/timetrails/', '/timetrails/', '/en/pages/timetrails/', '/en/timetrails/', '/zh-hans/pages/timetrails/']) {
    assert.ok(byPath.has(path), `Known historical landing: ${path}`);
  }
  for (const path of ['/en/pages/timetrails/guide.html', '/en/pages/timetrails/licenses.html', '/en/pages/timetrails/privacy.html', '/en/pages/timetrails/feedback.html', '/unknown/pages/timetrails/', '/some-missing-page/']) {
    assert.equal(byPath.has(path), false, `Never turn unrelated missing content into a landing redirect: ${path}`);
  }
});

test('root, default-language and existing regional landings keep the correct real language target', () => {
  for (const [source, target] of [
    ['/pages/timetrails/', '/apps/timetrails/'],
    ['/timetrails/', '/apps/timetrails/'],
    ['/zh-hans/pages/timetrails/', '/apps/timetrails/'],
    ['/en/pages/timetrails/', '/en/apps/timetrails/'],
    ['/en-gb/timetrails/', '/en-gb/apps/timetrails/'],
    ['/zh-hant/pages/timetrails/', '/zh-hant/apps/timetrails/'],
    ['/zh-hk/timetrails/', '/zh-hk/apps/timetrails/'],
  ]) assert.equal(byPath.get(source).targetPath, target, source);
});

test('removed locales use an existing base when possible, otherwise the actual English product page', () => {
  assert.equal(byPath.get('/am/pages/timetrails/').targetPath, '/en/apps/timetrails/');
  assert.equal(byPath.get('/sr-latn/timetrails/').targetPath, '/en/apps/timetrails/');
  assert.equal(redirects.filter((entry) => entry.resolution === 'english-fallback').length, 60);
  const withoutRegion = legacyTimeTrailsRedirects(languages.filter((code) => code.toLowerCase() !== 'en-gb'));
  const regional = withoutRegion.find((entry) => entry.sourcePath === '/en-gb/pages/timetrails/');
  assert.equal(regional.targetLanguage, 'en');
  assert.equal(regional.targetPath, '/en/apps/timetrails/');
  assert.equal(regional.resolution, 'base');
});

test('the exact Search Console URL and its AppAgg referral reach the English product', () => {
  const redirect = byPath.get('/en/pages/timetrails/');
  for (const source of [
    '/en/pages/timetrails/',
    '/en/pages/timetrails/?from=AppAgg.com&utm_campaign=AppAgg.com&utm_medium=referral&utm_source=AppAgg.com',
    '/en/pages/timetrails/index.html?from=AppAgg.com',
  ]) {
    const destination = browserDestination(redirect, source);
    assert.equal(destination.origin, origin);
    assert.equal(destination.pathname, '/en/apps/timetrails/');
    assert.equal(destination.search, new URL(source, origin).search);
  }
});

test('migration keeps embed, appearance, language, diagnostics and fragment parameters', () => {
  const source = '/en/pages/timetrails/?embed=1&style=forest&theme=dark&lang=en&appVersion=1.2.3#route-history';
  const destination = browserDestination(byPath.get('/en/pages/timetrails/'), source);
  assert.equal(destination.href, `${origin}/en/apps/timetrails/${new URL(source, origin).search}#route-history`);
});

test('next/url parameters and hostile fragments cannot select an external destination or execute script', () => {
  const queries = [
    '?next=https%3A%2F%2Fevil.example%2F&url=//evil.example',
    '?url=javascript%3Aalert(1)&redirect=%2F%2Fevil.example#https://evil.example/',
    '?next=%22%3Bthrow%20new%20Error(%27executed%27)%3B%2F%2F',
  ];
  for (const query of queries) {
    const destination = browserDestination(byPath.get('/en/pages/timetrails/'), `/en/pages/timetrails/${query}`);
    assert.equal(destination.origin, origin);
    assert.equal(destination.pathname, '/en/apps/timetrails/');
    assert.equal(destination.search, new URL(query, origin).search);
  }
  for (const target of ['//evil.example/apps/timetrails/', 'https://evil.example/', '/en/apps/timetrails/?next=evil', '/some-other-page/']) {
    assert.throws(() => legacyTimeTrailsScript(target), /fixed, local/);
  }
});

test('clients without JavaScript get an immediate HTML redirect and a matching usable fallback link', () => {
  const html = legacyTimeTrailsHtml(byPath.get('/ja/pages/timetrails/'), origin);
  assert.match(html, /<html lang="en">/); // The migration notice itself is English.
  assert.ok(html.includes('<meta http-equiv="refresh" content="0; url=https://sxxw.site/ja/apps/timetrails/">'));
  assert.ok(html.includes('<link rel="canonical" href="https://sxxw.site/ja/apps/timetrails/">'));
  assert.ok(html.includes('<a href="https://sxxw.site/ja/apps/timetrails/">'));
  assert.ok(html.includes('<meta name="robots" content="index,follow">'));
  assert.ok(!html.includes('hreflang'));
  assert.ok(!html.includes('application/ld+json'));
  assert.ok(!html.includes('react-assets'));
});

function fixturePage(origin, path, robots = 'index,follow') {
  return `<!doctype html><html><head><link rel="canonical" href="${origin}${path}"><meta name="robots" content="${robots}"></head><body><h1>TimeTrails</h1></body></html>`;
}

function put(dir, path, html) {
  const file = join(dir, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

test('generation requires existing canonical, indexable targets before writing any migration files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sxxw-legacy-missing-target-'));
  try {
    put(dir, '/apps/timetrails/', fixturePage(origin, '/apps/timetrails/'));
    assert.throws(() => writeLegacyTimeTrailsRedirects(dir, origin, ['zh-hans', 'en']), /destination is missing/);
    assert.equal(existsSync(join(dir, 'pages/timetrails/index.html')), false);
    put(dir, '/en/apps/timetrails/', fixturePage(origin, '/apps/timetrails/'));
    assert.throws(() => writeLegacyTimeTrailsRedirects(dir, origin, ['zh-hans', 'en']), /self-canonical and indexable/);
    put(dir, '/en/apps/timetrails/', fixturePage(origin, '/en/apps/timetrails/', 'noindex,follow'));
    assert.throws(() => writeLegacyTimeTrailsRedirects(dir, origin, ['zh-hans', 'en']), /self-canonical and indexable/);
    assert.equal(existsSync(join(dir, 'pages/timetrails/index.html')), false);
  } finally { rmSync(dir, { force: true, recursive: true }); }
});

test('generation restores all known landing files without changing target pages or inventing document aliases', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sxxw-legacy-landings-'));
  const targets = new Set(redirects.map((entry) => entry.targetPath));
  try {
    for (const path of targets) put(dir, path, fixturePage(origin, path));
    assert.equal(writeLegacyTimeTrailsRedirects(dir, origin, languages).length, 182);
    for (const redirect of redirects) {
      const html = readFileSync(join(dir, redirect.sourcePath.slice(1), 'index.html'), 'utf8');
      assert.equal(browserDestination(redirect, redirect.sourcePath).pathname, redirect.targetPath);
      assert.ok(html.includes(`content="0; url=${origin}${redirect.targetPath}"`));
    }
    for (const path of targets) assert.equal(readFileSync(join(dir, path.slice(1), 'index.html'), 'utf8'), fixturePage(origin, path));
    assert.equal(existsSync(join(dir, 'en/pages/timetrails/guide.html')), false);
    assert.equal(existsSync(join(dir, 'en/pages/timetrails/licenses.html')), false);
    assert.equal(existsSync(join(dir, 'unknown/pages/timetrails/index.html')), false);
  } finally { rmSync(dir, { force: true, recursive: true }); }
});
