import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Frozen public landing inventory from 359c9ce34^, not today's language catalog.
// Do not infer a catch-all: old guides and license documents have other meanings.
const manifest = JSON.parse(readFileSync(new URL('./legacy-timetrails-manifest.json', import.meta.url), 'utf8'));
const DEFAULT_LANGUAGE = 'zh-hans';
const PRODUCT_PATH = '/apps/timetrails/';
const normalize = (code) => code.trim().replaceAll('_', '-').toLowerCase();

export function legacyTimeTrailsRedirects(currentLanguages) {
  const supported = new Set(currentLanguages.map(normalize));
  if (!supported.has(DEFAULT_LANGUAGE) || !supported.has('en')) throw new Error('Legacy TimeTrails migration requires the Chinese and English product pages.');
  return manifest.locales.flatMap((locale) => {
    const requested = locale || DEFAULT_LANGUAGE;
    const base = requested.split('-')[0];
    const targetLanguage = supported.has(requested) ? requested : supported.has(base) ? base : 'en';
    const resolution = supported.has(requested) ? 'exact' : supported.has(base) ? 'base' : 'english-fallback';
    return manifest.pathFamilies.map((family) => ({
      sourcePath: `/${locale ? `${locale}/` : ''}${family}`,
      sourceLocale: locale,
      targetLanguage,
      targetPath: targetLanguage === DEFAULT_LANGUAGE ? PRODUCT_PATH : `/${targetLanguage}${PRODUCT_PATH}`,
      resolution,
    }));
  });
}

function checkedTargetPath(targetPath) {
  if (!/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)?apps\/timetrails\/$/.test(targetPath)) throw new Error('A legacy landing must target a fixed, local TimeTrails product path.');
  return targetPath;
}

export function legacyTimeTrailsScript(targetPath) {
  // Only the manifest selects the path. Query values such as next/url never do.
  return `window.location.replace(${JSON.stringify(checkedTargetPath(targetPath))}+window.location.search+window.location.hash);`;
}

export function legacyTimeTrailsHtml(redirect, origin) {
  const targetPath = checkedTargetPath(redirect.targetPath);
  const canonical = `${new URL(origin).origin}${targetPath}`;
  const chinese = redirect.targetLanguage.startsWith('zh') || redirect.targetLanguage === 'yue';
  const title = chinese ? '时光轨迹官网地址已更新' : 'TimeTrails has moved';
  const text = chinese ? '请前往新版时光轨迹官网。' : 'Continue to the current TimeTrails official website.';
  const label = chinese ? '打开时光轨迹官网' : 'Open the TimeTrails website';
  return `<!doctype html><html lang="${chinese ? 'zh-Hans' : 'en'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><meta http-equiv="refresh" content="0; url=${canonical}"><script>${legacyTimeTrailsScript(targetPath)}</script></head><body><main><h1>${title}</h1><p>${text} <a href="${canonical}">${label}</a></p></main></body></html>`;
}

export function writeLegacyTimeTrailsRedirects(outputDir, origin, currentLanguages) {
  const redirects = legacyTimeTrailsRedirects(currentLanguages);
  // Validate all destinations first. A partial or untranslated deployment must
  // never silently turn a historical link into a redirect to a missing page.
  for (const targetPath of new Set(redirects.map((entry) => entry.targetPath))) {
    const file = join(outputDir, targetPath.slice(1), 'index.html');
    if (!existsSync(file)) throw new Error(`Legacy TimeTrails destination is missing: ${targetPath}`);
    const html = readFileSync(file, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${new URL(origin).origin}${targetPath}">`)
      || !/<meta\b[^>]*name="robots"[^>]*content="index,follow(?:,|"|$)/.test(html)) {
      throw new Error(`Legacy TimeTrails destination must be self-canonical and indexable: ${targetPath}`);
    }
  }
  for (const redirect of redirects) {
    const file = join(outputDir, redirect.sourcePath.slice(1), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, legacyTimeTrailsHtml(redirect, origin));
  }
  return redirects;
}
