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
const routeUrls = [];

for (const route of sourceRoutes) {
  const body = ssr.renderRoute(route.path);
  const canonical = `https://sxxw.site${route.path}`;
  const structuredData = JSON.stringify(structuredDataFor(route, canonical));
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(route.description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(route.title)}"><meta property="og:description" content="${escapeHtml(route.description)}"><meta property="og:url" content="${canonical}"><script type="application/ld+json">${escapeScript(structuredData)}</script><title>${escapeHtml(route.title)}</title>${styles}</head><body><div id="root">${body}</div>${script}</body></html>`;
  const file = route.path === '/' ? join(outputDir, 'index.html') : join(outputDir, route.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  routeUrls.push(canonical);
}

writeFileSync(join(outputDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routeUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);

rmSync(join(outputDir, '.vite'), { force: true, recursive: true });
rmSync('.ssr', { force: true, recursive: true });

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function escapeScript(value) {
  return value.replaceAll('<', '\\u003c');
}

function structuredDataFor(route, canonical) {
  const organization = { '@context': 'https://schema.org', '@type': 'Organization', name: '上海树下小屋网络科技有限公司', url: 'https://sxxw.site/', email: 'house@sxxw.site' };
  const app = route.path.startsWith('/apps/memoria/') ? { name: 'Memoria · 拾忆', applicationCategory: 'LifestyleApplication', operatingSystem: route.path.includes('/harmony/') ? 'HarmonyOS' : 'iOS' } : route.path.startsWith('/apps/timetrails/') ? { name: '时光轨迹 TimeTrails', applicationCategory: 'TravelApplication', operatingSystem: 'iOS, watchOS' } : route.path.startsWith('/apps/traceapp/') ? { name: '出行轨迹 TraceApp', applicationCategory: 'TravelApplication', operatingSystem: 'iOS' } : null;
  if (!app) return [organization, { '@context': 'https://schema.org', '@type': 'WebPage', name: route.title, description: route.description, url: canonical }];
  return [organization, { '@context': 'https://schema.org', '@type': 'SoftwareApplication', ...app, url: canonical, description: route.description, publisher: { '@type': 'Organization', name: organization.name } }];
}
