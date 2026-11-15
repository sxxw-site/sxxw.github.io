const DEFAULT_LANGUAGE = 'zh-hans';

/** Legal documents are currently authored in Chinese in every UI language. */
export function indexingPolicy(path, language) {
  // Harbor has two authored versions, including its legal documents. Other
  // language routes retain the site's translated navigation but reuse this copy.
  if (path.startsWith('/apps/harbor/')) {
    const chinese = language.startsWith('zh') || language === 'yue';
    const canonicalLanguage = chinese ? DEFAULT_LANGUAGE : 'en';
    const authoredVersion = language === canonicalLanguage;
    return {
      index: authoredVersion,
      canonicalLanguage,
      alternates: authoredVersion,
      alternateLanguages: [DEFAULT_LANGUAGE, 'en'],
      sitemap: authoredVersion,
      contentLanguage: chinese ? 'zh-Hans' : 'en',
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
