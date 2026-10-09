import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  DEFAULT_LANGUAGE,
  isRtl,
  languages,
  normalizeLanguageCode,
  type Dictionary,
  type Language,
} from './config';
import defaultDictionary from '../locales/zh-hans.json';
import { langHref, splitLangPath } from './path';

const STORAGE_KEY = 'sxxw-site-language';
const localeModules = import.meta.glob(['../locales/*.json', '!../locales/zh-hans.json']) as Record<
  string,
  () => Promise<{ default: Dictionary }>
>;

type I18nContextValue = {
  language: Language;
  languages: Language[];
  t: (key: string) => string;
  setLanguage: (code: string) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function languageFor(code: string): Language {
  const normalizedCode = normalizeLanguageCode(code);
  return (
    languages.find((language) => language.normalizedCode === normalizedCode) ??
    languages.find((language) => language.normalizedCode === DEFAULT_LANGUAGE) ??
    languages[0]
  );
}

function browserLanguage(): string {
  const candidates = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const normalized = normalizeLanguageCode(candidate);
    if (languages.some((language) => language.normalizedCode === normalized)) return normalized;
    const base = normalized.split('-')[0];
    const matchingLanguage = languages.find((language) => language.normalizedCode === base);
    if (matchingLanguage) return matchingLanguage.normalizedCode;
  }
  return DEFAULT_LANGUAGE;
}

function initialLanguage(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl && languages.some((language) => language.normalizedCode === normalizeLanguageCode(fromUrl))) {
    return normalizeLanguageCode(fromUrl);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && languages.some((language) => language.normalizedCode === normalizeLanguageCode(saved))) {
    return normalizeLanguageCode(saved);
  }
  return browserLanguage();
}

export async function loadDictionary(code: string): Promise<Dictionary> {
  const normalized = normalizeLanguageCode(code);
  const base = normalized.split('-')[0];
  const load = async (locale: string): Promise<Dictionary> => {
    if (locale === DEFAULT_LANGUAGE) return defaultDictionary;
    return (await localeModules[`../locales/${locale}.json`]?.())?.default ?? {};
  };
  const [baseDictionary, regionalDictionary] = await Promise.all([
    base !== normalized ? load(base) : Promise.resolve({}),
    normalized !== DEFAULT_LANGUAGE ? load(normalized) : Promise.resolve({}),
  ]);
  return { ...defaultDictionary, ...baseDictionary, ...regionalDictionary };
}

export function I18nProvider({ children, initialLanguage: initialLanguageCode, dictionary: initialDictionary }: PropsWithChildren<{ initialLanguage?: string; dictionary?: Dictionary }>) {
  const [languageCode, setLanguageCode] = useState(initialLanguageCode ?? DEFAULT_LANGUAGE);
  const language = useMemo(() => languageFor(languageCode), [languageCode]);
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary ?? defaultDictionary);

  useEffect(() => {
    let cancelled = false;
    void loadDictionary(language.normalizedCode).then((nextDictionary) => {
      if (!cancelled) setDictionary(nextDictionary);
    });
    return () => { cancelled = true; };
  }, [language]);

  useEffect(() => {
    if (initialLanguageCode) return;
    setLanguageCode(initialLanguage());
  }, [initialLanguageCode]);

  const setLanguage = useCallback((code: string) => {
    const next = languageFor(code);
    try { window.localStorage.setItem(STORAGE_KEY, next.normalizedCode); } catch { /* ignore */ }
    // 路径前缀多语言：切换语言 = 跳到该语言对应的独立页面(保证 URL 与收录一致)
    const { path } = splitLangPath(window.location.pathname);
    window.location.assign(`${langHref(next.normalizedCode, path)}${window.location.hash}`);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language.htmlLang;
    document.documentElement.dir = isRtl(language.normalizedCode) ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      languages,
      t: (key) => dictionary[key] ?? key,
      setLanguage,
    }),
    [dictionary, language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
