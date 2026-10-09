import { DEFAULT_LANGUAGE, languages, normalizeLanguageCode } from './config';

// 所有语言前缀（规范化小写），不含默认中文（中文走根路径）
const PREFIX_CODES = new Set(
  languages.map((l) => l.normalizedCode).filter((c) => c !== DEFAULT_LANGUAGE),
);

export type SplitPath = { lang: string; path: string; hasPrefix: boolean };

/** 从 pathname 拆出「语言前缀」与「逻辑路由路径」。例：/en/apps/timetrails/ → {lang:'en', path:'/apps/timetrails/'} */
export function splitLangPath(pathname: string): SplitPath {
  const segs = pathname.replace(/^\/+/, '').split('/');
  const first = normalizeLanguageCode(segs[0] || '');
  if (first && PREFIX_CODES.has(first)) {
    let rest = '/' + segs.slice(1).join('/');
    if (rest !== '/' && !rest.endsWith('/')) rest += '/';
    return { lang: first, path: rest, hasPrefix: true };
  }
  return { lang: DEFAULT_LANGUAGE, path: pathname, hasPrefix: false };
}

/** 给逻辑路径加上语言前缀（中文不加）。例：langHref('en','/apps/') → '/en/apps/' */
export function langHref(lang: string, path: string): string {
  const p = path.startsWith('/') ? path : '/' + path;
  return normalizeLanguageCode(lang) === DEFAULT_LANGUAGE ? p : `/${normalizeLanguageCode(lang)}${p}`;
}
