/** Match the available native screenshots; other languages use the English set. */
export function timeTrailsScreenshot(language: string, page: 'overview' | 'globe', device: 'iphone' | 'duo' | 'ipad' = 'iphone'): string {
  const code = language.toLowerCase();
  const base = code.split('-')[0];
  const locale = code === 'zh-hant' || code === 'zh-hk' ? 'zh-hant'
    : base === 'zh' ? '' : ['ja', 'ko', 'ru', 'ar'].includes(base) ? base : 'en';
  const extension = !locale && device === 'iphone' ? 'png' : 'webp';
  const file = device === 'iphone' ? `shot-0${page === 'overview' ? 2 : 3}.${extension}` : `${device}-${page}.${extension}`;
  return `/apps/timetrails/${locale ? `${locale}/` : ''}${file}`;
}
