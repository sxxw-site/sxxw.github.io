import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { assertHreflangAlternates, hreflangAlternates, splitHreflangPath } from './hreflang.mjs';
import { indexingPolicy } from './seo-policy.mjs';

const catalog = JSON.parse(readFileSync(new URL('../src/i18n/languages.json', import.meta.url), 'utf8'));
const origin = 'https://sxxw.site';
const path = '/apps/timetrails/';
const alternates = (language, route = path, languages = catalog) => hreflangAlternates(route, language, languages, origin);

test('Latin American Spanish uses generic es while Spain and Mexico retain their distinct targets', () => {
  const links = alternates('es-419');
  for (const [code, prefix] of [['es', 'es-419'], ['es-ES', 'es'], ['es-MX', 'es-mx']]) {
    assert.equal(links.find((link) => link.language === code)?.url, `${origin}/${prefix}${path}`);
  }
  assert.ok(!links.some((link) => link.language === 'es-419'));
  assert.deepEqual(splitHreflangPath('/es-419/apps/timetrails/', catalog), { language: 'es-419', path });
});

test('Cantonese retains its own canonical discovery but is omitted from both sides of the hreflang cluster', () => {
  assert.deepEqual(alternates('yue'), []);
  assert.ok(!alternates('en').some((link) => link.url.includes('/yue/')));
  assert.deepEqual(splitHreflangPath('/yue/apps/timetrails/', catalog), { language: 'yue', path });
  const policy = indexingPolicy(path, 'yue');
  assert.equal(policy.index, true);
  assert.equal(policy.canonicalLanguage, 'yue');
  assert.equal(policy.sitemap, true);
});

test('all supported locale clusters are self-referencing and reciprocal with exact mapped targets', () => {
  const pages = new Map(catalog.map((entry) => {
    const code = entry.code.toLowerCase();
    return [`${origin}${code === 'zh-hans' ? '' : `/${code}`}${path}`, alternates(code)];
  }));
  for (const [url, links] of pages) {
    assertHreflangAlternates(links, links, url);
    for (const link of links) assert.ok(pages.get(link.url)?.some((back) => back.url === url), `${url} -> ${link.url}`);
  }
});

test('Chinese scripts, Hong Kong and generic/regional English preserve their accurate codes', () => {
  const links = alternates('en');
  for (const [code, prefix] of [['zh-Hans', ''], ['zh-Hant', '/zh-hant'], ['zh-HK', '/zh-hk'], ['en', '/en'], ['en-GB', '/en-gb']]) {
    assert.equal(links.find((link) => link.language === code)?.url, `${origin}${prefix}${path}`);
  }
});

test('Harbor authored language sets and untranslated legal/search/utility exclusions keep their policies', () => {
  assert.deepEqual(alternates('ar', '/apps/harbor/').map((link) => link.language), ['ar', 'en', 'fr', 'ja', 'ko', 'zh-Hans', 'x-default']);
  assert.deepEqual(alternates('en', '/apps/harbor/support/').map((link) => link.language), ['en', 'zh-Hans', 'x-default']);
  for (const [language, route] of [['fr', '/apps/harbor/support/'], ['en', '/apps/timetrails/privacy/'], ['zh-hans', '/apps/timetrails/privacy/'], ['en', '/search/'], ['en', '/feedback/'], ['en', '/migrate/']]) {
    assert.deepEqual(alternates(language, route), [], `${language}${route}`);
  }
});

test('unreviewed or duplicate catalog mappings cannot silently enter generated alternates', () => {
  assert.throws(() => alternates('en', path, [...catalog, { code: 'xx', asc_code: 'xx' }]), /Unsupported hreflang/);
  assert.throws(() => alternates('en', path, [...catalog, { code: 'en', asc_code: 'en' }]), /Duplicate UI language/);
  assert.throws(() => alternates('en', path, catalog.map((entry) => entry.code === 'fr' ? { ...entry, asc_code: 'en' } : entry)), /Duplicate hreflang/);
});

test('output validation rejects unsupported codes, duplicates, missing self references and wrong destinations', () => {
  const expected = [{ language: 'en', url: `${origin}/en${path}` }, { language: 'es', url: `${origin}/es-419${path}` }];
  const url = expected[0].url;
  for (const code of ['es-419', 'yue', 'en-UK', 'xx']) assert.throws(() => assertHreflangAlternates([{ language: code, url }], [], url), /Unsupported hreflang/);
  assert.throws(() => assertHreflangAlternates([expected[0], { ...expected[0], language: 'EN' }], expected, url), /Duplicate hreflang/);
  assert.throws(() => assertHreflangAlternates(expected.slice(0, 1), expected, url), /count/);
  assert.throws(() => assertHreflangAlternates([expected[0], { language: 'es', url: `${origin}/es${path}` }], expected, url), /Wrong hreflang target/);
  assert.throws(() => assertHreflangAlternates(expected, expected, `${origin}/fr${path}`), /Missing self-referencing/);
});
