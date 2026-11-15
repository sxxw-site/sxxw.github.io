import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const STATE_FILE = 'sitemap-content-state.json';
const MAX_GIT_OUTPUT = 128 * 1024 * 1024;

/** Hash content and discovery signals, excluding JS/CSS builds and theme markup. */
export function contentFingerprint(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const description = html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ?? '';
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i)?.[1] ?? '';
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
  const meaningfulMain = main
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi, (_, tag, attrs) => {
      const meaningful = [...attrs.matchAll(/\b(href|src|alt|title|datetime)="([^"]*)"/gi)]
        .map((a) => `${a[1].toLowerCase()}="${a[2]}"`).join(' ');
      return `<${tag.toLowerCase()}${meaningful ? ` ${meaningful}` : ''}>`;
    }).replace(/\s+/g, ' ').trim();
  const structuredData = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.stringify(JSON.parse(match[1])));
  return createHash('sha256').update(JSON.stringify({ title, description, canonical, main: meaningfulMain, structuredData })).digest('hex');
}

function gitRead(path) {
  try {
    return execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8', maxBuffer: MAX_GIT_OUTPUT, stdio: ['pipe', 'pipe', 'ignore'] });
  } catch { return null; }
}

/** Read the published commit because Vite clears docs/ before prerendering. */
function publishedState(outputDir, origin) {
  const saved = gitRead(`${outputDir}/${STATE_FILE}`);
  if (saved) {
    const state = JSON.parse(saved);
    if (state.version !== 1 || state.origin !== origin || !state.pages) throw new Error('Unsupported sitemap content history.');
    return { pages: state.pages, known: true };
  }
  // Bootstrap existing sites without inventing dates for unchanged old content.
  let paths;
  try {
    paths = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', outputDir], { encoding: 'utf8' })
      .split('\n').filter((path) => path.endsWith('/index.html'));
  } catch { return { pages: {}, known: false }; }
  if (!paths.length) return { pages: {}, known: false };
  const batch = execFileSync('git', ['cat-file', '--batch'], {
    input: paths.map((path) => `HEAD:${path}\n`).join(''), maxBuffer: MAX_GIT_OUTPUT,
  });
  const pages = {};
  let offset = 0;
  for (const path of paths) {
    const end = batch.indexOf(10, offset);
    const header = batch.subarray(offset, end).toString('utf8');
    const size = Number(header.split(' ')[2]);
    if (!Number.isSafeInteger(size) || size < 0) throw new Error(`Could not read published HTML: ${path}`);
    const html = batch.subarray(end + 1, end + 1 + size).toString('utf8');
    offset = end + 1 + size + 1;
    const rel = path.slice(outputDir.length).replace(/index\.html$/, '');
    pages[`${origin}${rel}`] = { hash: contentFingerprint(html) };
  }
  return { pages, known: true };
}

export function sitemapHistory(outputDir, origin, today = new Date().toISOString().slice(0, 10)) {
  const previous = publishedState(outputDir, origin);
  const pages = {};
  return {
    filename: STATE_FILE,
    record(url, html) {
      const hash = contentFingerprint(html);
      const old = previous.pages[url];
      const lastmod = old?.hash === hash ? old.lastmod : previous.known ? today : undefined;
      pages[url] = { hash, ...(lastmod ? { lastmod } : {}) };
      return lastmod;
    },
    serialize() { return JSON.stringify({ version: 1, origin, pages }, null, 2) + '\n'; },
  };
}
