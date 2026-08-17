import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outputDir = 'docs';
const manifest = JSON.parse(readFileSync(join(outputDir, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];
if (!entry) throw new Error('Vite manifest is missing index.html.');

const ssr = await import(pathToFileURL(join(process.cwd(), '.ssr', 'entry-server.js')).href);
const sourceRoutes = ssr.siteRoutes;
if (!sourceRoutes) throw new Error('The prerender route manifest could not be loaded.');

const styles = (entry.css ?? []).map((file) => `<link rel="stylesheet" href="/${file}">`).join('');
const script = `<script type="module" src="/${entry.file}"></script>`;

for (const route of sourceRoutes) {
  const body = ssr.renderRoute(route.path);
  const canonical = `https://sxxw.site${route.path}`;
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(route.description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(route.title)}"><meta property="og:description" content="${escapeHtml(route.description)}"><meta property="og:url" content="${canonical}"><title>${escapeHtml(route.title)}</title>${styles}</head><body><div id="root">${body}</div>${script}</body></html>`;
  const file = route.path === '/' ? join(outputDir, 'index.html') : join(outputDir, route.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

rmSync(join(outputDir, '.vite'), { force: true, recursive: true });
rmSync('.ssr', { force: true, recursive: true });

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
