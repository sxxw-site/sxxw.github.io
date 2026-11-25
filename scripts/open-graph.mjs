// Open Graph requires language_TERRITORY, unlike HTML's BCP 47 language tags.
// CLDR supplies omitted territories and respects existing region/script hints.
export function openGraphLocale(language) {
  const locale = new Intl.Locale(language.replaceAll('_', '-')).maximize();
  return `${locale.language}_${locale.region}`;
}
