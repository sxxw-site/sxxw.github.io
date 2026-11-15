import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'docs';
const origin = 'https://sxxw.site';
const read = (file) => readFileSync(join(root, file), 'utf8');
function htmlFiles(dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const file = join(dir, item.name);
    return item.isDirectory() ? htmlFiles(file) : item.name === 'index.html' ? [file] : [];
  });
}
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
const pages = new Map(htmlFiles().map((file) => {
  const html = readFileSync(file, 'utf8');
  const url = origin + file.slice(root.length).replace(/index\.html$/, '');
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const canonical = attr(links.find((tag) => attr(tag, 'rel') === 'canonical') ?? '', 'href');
  const robots = attr(html.match(/<meta\b[^>]*name="robots"[^>]*>/)?.[0] ?? '', 'content');
  const alternates = links.filter((tag) => attr(tag, 'rel') === 'alternate' && attr(tag, 'hreflang'))
    .map((tag) => ({ language: attr(tag, 'hreflang'), url: attr(tag, 'href') }));
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One main heading: ${url}`);
  assert.ok(html.includes('class="style-switcher-trigger"'), `SSR appearance control: ${url}`);
  assert.ok(canonical?.startsWith(origin + '/'), `Own canonical: ${url}`);
  assert.ok(robots?.includes('follow'), `Explicit crawl policy: ${url}`);
  return [url, { html, canonical, index: !robots.includes('noindex'), alternates }];
}));

const sitemap = read('sitemap.xml');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const listed = new Set(locations);
assert.equal(listed.size, locations.length, 'Unique sitemap URLs');
for (const url of locations) {
  const page = pages.get(url);
  assert.ok(page, `Sitemap target exists: ${url}`);
  assert.ok(page.index, `Sitemap target is indexable: ${url}`);
  assert.equal(page.canonical, url, `Only canonical pages in sitemap: ${url}`);
}
for (const [url, page] of pages) {
  assert.equal(listed.has(url), page.index && page.canonical === url, `Discovery matches canonical policy: ${url}`);
  assert.equal(new Set(page.alternates.map((a) => a.language)).size, page.alternates.length, `Unique alternate languages: ${url}`);
  for (const alternate of page.alternates) {
    const target = pages.get(alternate.url);
    assert.ok(target?.index && target.canonical === alternate.url, `Canonical alternate target: ${url} -> ${alternate.url}`);
    assert.ok(target.alternates.some((a) => a.url === url), `Reciprocal language links: ${url} -> ${alternate.url}`);
  }
  if (page.index && page.canonical === url && page.alternates.length) {
    assert.ok(page.alternates.some((a) => a.language === 'en' && a.url.includes('/en/')), `Generic English alternate: ${url}`);
  }
}
for (const locale of ['en', 'en-au', 'en-ca', 'en-gb', 'en-in']) {
  const page = pages.get(`${origin}/${locale}/apps/timetrails/`);
  for (const phrase of ['TimeTrails', 'daily routes', 'lifetime travel map']) assert.ok(page.html.toLowerCase().includes(phrase.toLowerCase()), `${locale}: ${phrase}`);
  assert.ok(page.html.includes('id="route-history"'), `${locale}: useful recording questions`);
  assert.ok(/<a\b[^>]*href="\/apps\/timetrails\/"[^>]*href[Ll]ang="zh-Hans"/.test(page.html), `${locale}: real Chinese product link`);
}
assert.ok(pages.get(`${origin}/apps/timetrails/`).html.includes('href="/en/apps/timetrails/"'), 'Chinese product links to English product');
assert.ok(pages.get(`${origin}/`).html.includes('href="/en/"'), 'Chinese home links to English home');
assert.ok(read('robots.txt').includes('Sitemap: ' + origin + '/sitemap.xml'), 'Crawler sitemap entry');
for (const match of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  assert.match(match[1], /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(match[1] <= new Date().toISOString().slice(0, 10), 'No future lastmod');
}
assert.ok(existsSync(join(root, 'sitemap-content-state.json')), 'Persistent content history');
console.log(`SEO checks passed: ${pages.size} HTML pages, ${listed.size} canonical sitemap URLs, reciprocal hreflang, 5 English product versions.`);
