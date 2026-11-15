import { readFileSync } from 'node:fs';

const DEFAULT_LANGUAGE = 'zh-hans';
export const HARBOR_DISCOVERY_LANGUAGES = JSON.parse(readFileSync(new URL('../src/content/apps/harbor.discovery-languages.json', import.meta.url), 'utf8'));

/** Legal documents are currently authored in Chinese in every UI language. */
export function indexingPolicy(path, language) {
  // Harbor has six authored product overviews. Its full support and legal
  // documents remain Chinese/English; untranslated bodies are never indexed.
  if (path.startsWith('/apps/harbor/')) {
    const chinese = language.startsWith('zh') || language === 'yue';
    const authoredLanguages = path === '/apps/harbor/' ? HARBOR_DISCOVERY_LANGUAGES : [DEFAULT_LANGUAGE, 'en'];
    const canonicalLanguage = chinese ? DEFAULT_LANGUAGE : authoredLanguages.includes(language) ? language : 'en';
    const authoredVersion = language === canonicalLanguage;
    return {
      index: authoredVersion,
      canonicalLanguage,
      alternates: authoredVersion,
      alternateLanguages: authoredLanguages,
      sitemap: authoredVersion,
      contentLanguage: canonicalLanguage === DEFAULT_LANGUAGE ? 'zh-Hans' : canonicalLanguage,
    };
  }
  const untranslatedLegalDocument = /\/(?:privacy|terms)\/$/.test(path);
  const index = path !== '/search/';
  return {
    index,
    canonicalLanguage: untranslatedLegalDocument ? DEFAULT_LANGUAGE : language,
    alternates: index && !untranslatedLegalDocument,
    sitemap: index && (!untranslatedLegalDocument || language === DEFAULT_LANGUAGE),
    contentLanguage: untranslatedLegalDocument ? 'zh-Hans' : null,
  };
}
