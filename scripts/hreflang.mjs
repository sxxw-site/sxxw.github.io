import { indexingPolicy } from './seo-policy.mjs';

const DEFAULT_LANGUAGE = 'zh-hans';
const UNPREFIXED_ROUTES = new Set(['/feedback/', '/migrate/']);
// Reviewed Google-supported values used by this site's authored languages.
// New UI locales must choose an accurate supported mapping before joining SEO.
const SUPPORTED_HREFLANG = new Set(`
  af ar ar-SA be bg bn cs da de-DE el en en-AU en-CA en-GB en-IN
  es es-ES es-MX et fa fi fr fr-FR fr-CA gu he hi hr hu id it ja
  kk kn ko lt lv ml mr ms no nl-NL nl-BE pa pl pt-BR pt-PT ro ru
  sk sl sv ta te th tr uk vi zh-HK zh-Hans zh-Hant
`.trim().split(/\s+/).map((code) => code.toLowerCase()));
const normalize = (code) => code.trim().replaceAll('_', '-').toLowerCase();
const href = (origin, language, path) => `${origin}${language === DEFAULT_LANGUAGE ? '' : `/${language}`}${path}`;

function catalogLanguages(catalog) {
  const seen = new Set();
  return catalog.map((entry) => {
    const code = normalize(entry.code);
    if (seen.has(code)) throw new Error(`Duplicate UI language: ${code}`);
    seen.add(code);
    const htmlLang = entry.htmlLang ?? (code === 'en' ? 'en' : code === 'zh-hk' ? 'zh-HK' : entry.asc_code || entry.code);
    return { code, htmlLang };
  });
}

function searchLanguage(entry, path) {
  // UI/HTML keep their precise BCP 47 codes. Google only supports ISO 639-1
  // languages and ISO 3166-1 Alpha-2 regions in these SEO annotations.
  if (entry.code === 'yue') return null;
  if (entry.code === 'es-419') return 'es';
  return path === '/apps/harbor/'
    ? entry.code === DEFAULT_LANGUAGE ? 'zh-Hans' : entry.code
    : entry.htmlLang;
}

export function splitHreflangPath(pathname, catalog) {
  const first = pathname.split('/')[1];
  const language = catalogLanguages(catalog).find((entry) => entry.code !== DEFAULT_LANGUAGE && entry.code === first);
  return language
    ? { language: language.code, path: pathname.slice(first.length + 1) || '/' }
    : { language: DEFAULT_LANGUAGE, path: pathname };
}

export function hreflangAlternates(path, language, catalog, origin) {
  if (UNPREFIXED_ROUTES.has(path)) return [];
  const languages = catalogLanguages(catalog);
  const current = languages.find((entry) => entry.code === normalize(language));
  if (!current) throw new Error(`Unknown UI language: ${language}`);
  const policy = indexingPolicy(path, current.code);
  const routePolicy = indexingPolicy(path, DEFAULT_LANGUAGE);
  if (!policy.alternates || !routePolicy.alternates || searchLanguage(current, path) === null) return [];
  const authored = routePolicy.alternateLanguages;
  const alternates = languages.filter((entry) => (!authored || authored.includes(entry.code)) && searchLanguage(entry, path) !== null).map((entry) => ({
    language: searchLanguage(entry, path),
    url: href(origin, entry.code, path),
  })).concat({ language: 'x-default', url: href(origin, DEFAULT_LANGUAGE, path) });
  validateAlternateValues(alternates);
  return alternates;
}

function validateAlternateValues(alternates) {
  const seen = new Set();
  for (const alternate of alternates) {
    const code = alternate.language.toLowerCase();
    if (code !== 'x-default' && !SUPPORTED_HREFLANG.has(code)) throw new Error(`Unsupported hreflang: ${alternate.language}`);
    if (seen.has(code)) throw new Error(`Duplicate hreflang: ${alternate.language}`);
    seen.add(code);
  }
}

export function assertHreflangAlternates(actual, expected, pageUrl) {
  validateAlternateValues(actual);
  if (actual.length !== expected.length) throw new Error(`Unexpected hreflang count: ${pageUrl}`);
  const targets = new Map(actual.map((entry) => [entry.language.toLowerCase(), entry.url]));
  for (const alternate of expected) {
    if (targets.get(alternate.language.toLowerCase()) !== alternate.url) {
      throw new Error(`Wrong hreflang target: ${pageUrl} -> ${alternate.language}; expected ${alternate.url}`);
    }
  }
  if (expected.length && !actual.some((entry) => entry.language !== 'x-default' && entry.url === pageUrl)) {
    throw new Error(`Missing self-referencing hreflang: ${pageUrl}`);
  }
}
