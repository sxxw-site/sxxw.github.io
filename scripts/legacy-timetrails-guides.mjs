import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// 359c9ce34^ contains exactly these 91 locale-prefixed guide.html documents.
// Reuse its frozen locale inventory, not today's catalog or the two landing families.
const manifest = JSON.parse(readFileSync(new URL('./legacy-timetrails-manifest.json', import.meta.url), 'utf8'));
const CHINESE_GUIDE = '/apps/timetrails/getting-started/';
const ENGLISH_GUIDE = '/en/apps/timetrails/getting-started/';
export const LEGACY_IMPORT_FRAGMENT = '#data-import';
const normalize = (code) => code.trim().replaceAll('_', '-').toLowerCase();

export function legacyTimeTrailsGuideRedirects(currentLanguages) {
  const supported = new Set(currentLanguages.map(normalize));
  if (!supported.has('zh-hans') || !supported.has('en')) throw new Error('Legacy import guides require the Chinese and English getting-started pages.');
  const forLocale = (locale) => {
    const chinese = !locale || locale.startsWith('zh') || locale === 'yue';
    const targetLanguage = chinese ? 'zh-hans' : locale.startsWith('en') && supported.has(locale) ? locale : 'en';
    return {
      sourceLocale: locale,
      targetLanguage,
      targetPath: targetLanguage === 'zh-hans' ? CHINESE_GUIDE : `/${targetLanguage}${CHINESE_GUIDE}`,
    };
  };
  const guides = manifest.locales.map((locale) => {
    const sourcePath = `/${locale ? `${locale}/` : ''}pages/timetrails/guide.html`;
    return { sourcePath, outputPath: sourcePath.slice(1), ...forLocale(locale) };
  });
  // This clean URL was observed in an App Store reply and a Perplexity citation.
  // One directory index also serves its trailing-slash form on GitHub Pages.
  // Do not invent /timetrails/guide or 90 unobserved localized clean URLs.
  guides.push({ sourcePath: '/pages/timetrails/guide/', outputPath: 'pages/timetrails/guide/index.html', ...forLocale('') });
  return guides;
}

function checkedTargetPath(targetPath) {
  if (targetPath !== CHINESE_GUIDE && !/^\/en(?:-[a-z0-9]+)*\/apps\/timetrails\/getting-started\/$/.test(targetPath)) {
    throw new Error('A legacy import guide must target a fixed, local Chinese or English getting-started path.');
  }
  return targetPath;
}

export function legacyTimeTrailsGuideTargets(redirect) {
  const targetPath = checkedTargetPath(redirect.targetPath);
  // A query language on an unprefixed page otherwise wins over its Chinese URL.
  // Only a fixed /en/ fallback is allowed; it keeps the authored import section
  // available while preserving the caller's entire original query string.
  return targetPath === CHINESE_GUIDE ? [targetPath, ENGLISH_GUIDE] : [targetPath];
}

export function legacyTimeTrailsGuideScript(targetPath) {
  const path = checkedTargetPath(targetPath);
  if (path !== CHINESE_GUIDE) return `window.location.replace(${JSON.stringify(path)}+window.location.search+(window.location.hash||${JSON.stringify(LEGACY_IMPORT_FRAGMENT)}));`;
  return `(()=>{const raw=new URLSearchParams(window.location.search).get("lang");const language=raw===null?null:raw.trim().replaceAll("_","-").toLowerCase();const path=language!==null&&language!=="zh-hans"?${JSON.stringify(ENGLISH_GUIDE)}:${JSON.stringify(CHINESE_GUIDE)};window.location.replace(path+window.location.search+(window.location.hash||${JSON.stringify(LEGACY_IMPORT_FRAGMENT)}));})();`;
}

export function legacyTimeTrailsGuideHtml(redirect, origin) {
  const targetPath = checkedTargetPath(redirect.targetPath);
  const canonical = `${new URL(origin).origin}${targetPath}`;
  const destination = canonical + LEGACY_IMPORT_FRAGMENT;
  const chinese = redirect.targetLanguage === 'zh-hans';
  const title = chinese ? '时光轨迹数据导入指南地址已更新' : 'The TimeTrails data import guide has moved';
  const text = chinese ? '查看新版数据导入说明，包括局域网传输与文件导入。' : 'Read the current guide to local network transfers and importing files.';
  const label = chinese ? '打开数据导入指南' : 'Open the data import guide';
  return `<!doctype html><html lang="${chinese ? 'zh-Hans' : 'en'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><meta http-equiv="refresh" content="0; url=${destination}"><script>${legacyTimeTrailsGuideScript(targetPath)}</script></head><body><main><h1>${title}</h1><p>${text} <a href="${destination}">${label}</a></p></main></body></html>`;
}

export function writeLegacyTimeTrailsGuideRedirects(outputDir, origin, currentLanguages) {
  const redirects = legacyTimeTrailsGuideRedirects(currentLanguages);
  const targets = new Set(redirects.flatMap(legacyTimeTrailsGuideTargets));
  // Check all default and query-language fallback destinations before writing.
  for (const path of targets) {
    const file = join(outputDir, path.slice(1), 'index.html');
    if (!existsSync(file)) throw new Error(`Legacy import guide destination is missing: ${path}`);
    const html = readFileSync(file, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${new URL(origin).origin}${path}">`)
      || !/<meta\b[^>]*name="robots"[^>]*content="index,follow(?:,|"|$)/.test(html)) {
      throw new Error(`Legacy import guide destination must be self-canonical and indexable: ${path}`);
    }
    if (!html.includes('id="data-import"')) throw new Error(`Legacy import guide destination has no data-import section: ${path}`);
  }
  for (const redirect of redirects) {
    const file = join(outputDir, redirect.outputPath);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, legacyTimeTrailsGuideHtml(redirect, origin));
  }
  return redirects;
}
