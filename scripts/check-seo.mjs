import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { legacyTimeTrailsRedirects, legacyTimeTrailsScript } from './legacy-timetrails.mjs';

const root = 'docs';
const origin = 'https://sxxw.site';
const read = (file) => readFileSync(join(root, file), 'utf8');
const languageCatalog = JSON.parse(readFileSync(new URL('../src/i18n/languages.json', import.meta.url), 'utf8'));
const legacyRedirects = legacyTimeTrailsRedirects(languageCatalog.map((language) => language.code));
const legacyFiles = new Map(legacyRedirects.map((entry) => [join(root, entry.sourcePath.slice(1), 'index.html'), entry]));
function htmlFiles(dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const file = join(dir, item.name);
    return item.isDirectory() ? htmlFiles(file) : item.name === 'index.html' ? [file] : [];
  });
}
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
// Prerender escapes these characters in attributes; count the displayed text.
const decodeHtml = (value) => value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
  if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0' }[entity.toLowerCase()];
});
// Only exact aliases in the historical manifest take the migration branch.
// An unknown redirect document must still pass every normal content assertion.
const pages = new Map(htmlFiles().filter((file) => !legacyFiles.has(file)).map((file) => {
  const html = readFileSync(file, 'utf8');
  const url = origin + file.slice(root.length).replace(/index\.html$/, '');
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const canonical = attr(links.find((tag) => attr(tag, 'rel') === 'canonical') ?? '', 'href');
  const robots = attr(html.match(/<meta\b[^>]*name="robots"[^>]*>/)?.[0] ?? '', 'content');
  const description = decodeHtml(attr(html.match(/<meta\b[^>]*name="description"[^>]*>/)?.[0] ?? '', 'content') ?? '');
  const alternates = links.filter((tag) => attr(tag, 'rel') === 'alternate' && attr(tag, 'hreflang'))
    .map((tag) => ({ language: attr(tag, 'hreflang'), url: attr(tag, 'href') }));
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One main heading: ${url}`);
  assert.ok(html.includes('class="style-switcher-trigger"'), `SSR appearance control: ${url}`);
  assert.ok(canonical?.startsWith(origin + '/'), `Own canonical: ${url}`);
  assert.ok(robots?.includes('follow'), `Explicit crawl policy: ${url}`);
  return [url, { html, canonical, description, index: !robots.includes('noindex'), alternates }];
}));

const sitemap = read('sitemap.xml');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const listed = new Set(locations);
assert.equal(listed.size, locations.length, 'Unique sitemap URLs');
for (const [file, redirect] of legacyFiles) {
  assert.ok(existsSync(file), `Historical landing has a migration file: ${redirect.sourcePath}`);
  const html = readFileSync(file, 'utf8');
  const url = origin + redirect.sourcePath;
  const targetUrl = origin + redirect.targetPath;
  const target = pages.get(targetUrl);
  assert.ok(target?.index && target.canonical === targetUrl, `Migration points to a real indexable product page: ${url}`);
  const linkTags = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);
  const canonicalTags = linkTags.filter((tag) => attr(tag, 'rel') === 'canonical');
  assert.equal(canonicalTags.length, 1, `One migration canonical: ${url}`);
  assert.equal(attr(canonicalTags[0], 'href'), targetUrl, `Migration canonical matches destination: ${url}`);
  assert.ok(!linkTags.some((tag) => attr(tag, 'hreflang')), `Migration is not a language variant: ${url}`);
  const refreshTags = [...html.matchAll(/<meta\b[^>]*>/g)].map((match) => match[0]).filter((tag) => attr(tag, 'http-equiv')?.toLowerCase() === 'refresh');
  assert.equal(refreshTags.length, 1, `One HTML migration redirect: ${url}`);
  assert.equal(attr(refreshTags[0], 'content'), `0; url=${targetUrl}`, `Immediate script-free redirect matches destination: ${url}`);
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, `One fixed migration script: ${url}`);
  assert.equal(scripts[0][1], legacyTimeTrailsScript(redirect.targetPath), `Migration preserves query/hash with a fixed local destination: ${url}`);
  assert.ok(!/\bsrc\s*=/.test(scripts[0][0]), `Migration needs no external script: ${url}`);
  const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(anchors.length, 1, `One usable migration fallback link: ${url}`);
  assert.equal(attr(anchors[0], 'href'), targetUrl, `Migration fallback matches destination: ${url}`);
  assert.equal(attr(html.match(/<meta\b[^>]*name="robots"[^>]*>/)?.[0] ?? '', 'content'), 'index,follow', `Migration remains crawlable for consolidation: ${url}`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `One migration heading: ${url}`);
  assert.ok(!listed.has(url), `Migration aliases stay out of sitemap: ${url}`);
}
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
  // Bing Live URL flagged descriptions outside its 25–160 character range.
  for (const path of ['/', '/apps/timetrails/', '/apps/timetrails/getting-started/', '/apps/timetrails/support/']) {
    const target = pages.get(`${origin}/${locale}${path}`);
    const length = [...target.description].length;
    assert.ok(length >= 25 && length <= 160, `${locale}${path}: meta description has ${length} characters; expected 25–160`);
  }
  const page = pages.get(`${origin}/${locale}/apps/timetrails/`);
  for (const phrase of ['TimeTrails', 'daily routes', 'lifetime travel map']) assert.ok(page.html.toLowerCase().includes(phrase.toLowerCase()), `${locale}: ${phrase}`);
  assert.ok(page.html.includes('id="route-history"'), `${locale}: useful recording questions`);
  assert.ok(/<a\b[^>]*href="\/apps\/timetrails\/"[^>]*href[Ll]ang="zh-Hans"/.test(page.html), `${locale}: real Chinese product link`);
}
assert.ok(pages.get(`${origin}/apps/timetrails/`).html.includes('href="/en/apps/timetrails/"'), 'Chinese product links to English product');
assert.ok(pages.get(`${origin}/`).html.includes('href="/en/"'), 'Chinese home links to English home');
const harborHeadings = {
  'zh-hans': '家中 NAS 的视频播放器', en: 'A video player for your home NAS',
  ja: '自宅の NAS 用動画プレーヤー', ko: '집 안의 NAS를 위한 동영상 플레이어',
  fr: 'Un lecteur vidéo pour votre NAS domestique', ar: 'مشغّل فيديو لجهاز NAS المنزلي',
};
const harborLanguageTags = ['zh-Hans', 'en', 'ja', 'ko', 'fr', 'ar', 'x-default'];
for (const [locale, heading] of Object.entries(harborHeadings)) {
  const prefix = locale === 'zh-hans' ? '' : `/${locale}`;
  const url = `${origin}${prefix}/apps/harbor/`;
  const page = pages.get(url);
  assert.ok(page.index && page.canonical === url, `Harbor authored product is self-canonical: ${locale}`);
  assert.ok([...page.description].length >= 25 && [...page.description].length <= 160, `Harbor discovery description fits search snippets: ${locale}`);
  assert.deepEqual(page.alternates.map((entry) => entry.language).sort(), [...harborLanguageTags].sort(), `Harbor has exactly six reciprocal product languages: ${locale}`);
  const main = page.html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? '';
  assert.ok(main.includes(`<h1 class="page-title">${heading}</h1>`), `Harbor real localized heading: ${locale}`);
  assert.equal(attr(main.match(/<main\b[^>]*>/)?.[0] ?? '', 'lang'), locale === 'zh-hans' ? 'zh-Hans' : locale, `Harbor content language: ${locale}`);
  if (['ja', 'ko', 'fr', 'ar'].includes(locale)) {
    assert.equal((main.match(new RegExp(`src="/apps/harbor/${locale}/`, 'g')) ?? []).length, 3, `Harbor uses three genuine localized screenshots: ${locale}`);
    for (const file of ['demo-library.png', 'queue.png', 'downloads.png']) assert.ok(existsSync(join(root, `apps/harbor/${locale}/${file}`)), `Harbor screenshot exists: ${locale}/${file}`);
    assert.ok(main.includes('href="/en/apps/harbor/privacy/"'), `Harbor links to the actual English legal document: ${locale}`);
  }
  if (locale === 'ar') assert.equal(attr(main.match(/<main\b[^>]*>/)?.[0] ?? '', 'dir'), 'rtl', 'Harbor Arabic content reads right to left');
  for (const section of ['privacy', 'terms', 'support', 'open-source']) {
    const document = pages.get(`${origin}${prefix}/apps/harbor/${section}/`);
    const realPrefix = locale === 'zh-hans' ? '' : '/en';
    assert.equal(document.canonical, `${origin}${realPrefix}/apps/harbor/${section}/`, `Harbor document canonical: ${locale}/${section}`);
    assert.equal(document.index, ['zh-hans', 'en'].includes(locale), `Harbor does not index untranslated documents: ${locale}/${section}`);
    const schema = JSON.parse(document.html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.find((node) => node['@type'] === 'WebPage').inLanguage, locale === 'zh-hans' ? 'zh-Hans' : 'en', `Harbor legal/support schema uses its actual body language: ${locale}/${section}`);
  }
}
assert.ok(read('robots.txt').includes('Sitemap: ' + origin + '/sitemap.xml'), 'Crawler sitemap entry');
for (const match of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  assert.match(match[1], /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(match[1] <= new Date().toISOString().slice(0, 10), 'No future lastmod');
}
assert.ok(existsSync(join(root, 'sitemap-content-state.json')), 'Persistent content history');
console.log(`SEO checks passed: ${pages.size} content HTML pages, ${legacyFiles.size} historical migration aliases, ${listed.size} canonical sitemap URLs, reciprocal hreflang, 5 TimeTrails English and 6 Harbor discovery versions.`);
