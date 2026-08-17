import catalog from './languages.json';

export type Dictionary = Record<string, string>;

export type Language = {
  code: string;
  normalizedCode: string;
  htmlLang: string;
  label: string;
};

type CatalogEntry = {
  code: string;
  asc_code?: string;
  displayName?: string;
  name?: string;
};


export const DEFAULT_LANGUAGE = 'zh-hans';
const RTL_LANGUAGES = new Set(['ar', 'fa', 'he']);

export function normalizeLanguageCode(code: string | null | undefined): string {
  return (code ?? '').trim().replace(/_/g, '-').toLowerCase();
}

export const languages: Language[] = (catalog as CatalogEntry[]).map((entry) => ({
  code: entry.code,
  normalizedCode: normalizeLanguageCode(entry.code),
  htmlLang: entry.asc_code || entry.code,
  label: entry.displayName || entry.name || entry.code,
}));

export function isRtl(language: string): boolean {
  return RTL_LANGUAGES.has(normalizeLanguageCode(language).split('-')[0]);
}
