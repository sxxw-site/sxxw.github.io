const DEFAULT_LANGUAGE = 'zh-hans';

/** Legal documents are currently authored in Chinese in every UI language. */
export function indexingPolicy(path, language) {
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
