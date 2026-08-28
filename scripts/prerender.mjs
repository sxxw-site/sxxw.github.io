import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://sxxw.site';
const ORG_NAME = '上海树下小屋网络科技有限公司';
const SUPPORT_EMAIL = 'house@sxxw.site';
const buildDate = new Date().toISOString().slice(0, 10);

// 支持页常见问题(用于 FAQPage 结构化数据 / GEO)
const FAQ = {
  '/apps/memoria/support/': [
    { q: '数据会同步到其他设备吗？', a: '登录 iCloud 并开启同步后，数据会通过你的 iCloud 私有库在 iPhone、iPad 与 Apple Watch 间同步。华为应用市场的拾忆为纯本地版本，不联网、不同步。' },
    { q: '如何删除数据？', a: '你可以在应用内删除记录；卸载应用会删除本地数据，iCloud 数据可在系统“设置 → iCloud”中管理。' },
    { q: '提醒没有出现怎么办？', a: '请确认记录已设置提醒，并在系统设置中允许本应用发送通知。关闭通知只影响提醒，不影响记录本身。' },
  ],
  '/apps/timetrails/support/': [
    { q: '时光轨迹会一直定位我吗？', a: '记录由你控制，可随时暂停。系统定位仅用于本机轨迹记录，数据默认只保存在设备上。' },
    { q: '定位没有被记录？', a: '请在“设置 → 隐私与安全性 → 定位服务”中为时光轨迹选择“始终”，并开启“精确位置”与后台 App 刷新。' },
    { q: 'iCloud 备份如何恢复？', a: '使用同一 Apple ID、已开启 iCloud 且网络正常时，可在设置的“iCloud 数据备份”中恢复或手动同步。' },
    { q: '如何彻底清除数据？', a: '可在应用设置中清除本机数据；如已开启 iCloud 备份，请同时删除云端副本。' },
  ],
  '/apps/traceapp/support/': [
    { q: '如何调整定位权限？', a: '在“设置 → 隐私与安全性 → 定位服务 → 出行轨迹”中，选择“使用 App 期间”或“始终”，也可随时关闭。' },
    { q: '如何删除数据？', a: '可在应用内删除单条或全部记录；卸载会删除本机数据。若启用 iCloud，同步副本需在 iCloud 中另行管理。' },
    { q: '反馈问题时应提供什么？', a: '建议附上复现步骤、期望与实际结果、设备型号和系统版本；可附截图，便于定位。' },
  ],
};

const outputDir = 'docs';
const manifest = JSON.parse(readFileSync(join(outputDir, '.vite', 'manifest.json'), 'utf8'));
const entry = manifest['index.html'];
if (!entry) throw new Error('Vite manifest is missing index.html.');

const ssr = await import(pathToFileURL(join(process.cwd(), '.ssr', 'entry-server.js')).href);
const sourceRoutes = ssr.siteRoutes;
if (!sourceRoutes) throw new Error('The prerender route manifest could not be loaded.');

const titleByPath = new Map(sourceRoutes.map((r) => [r.path, r.title]));
const styles = (entry.css ?? []).map((file) => `<link rel="stylesheet" href="/${file}">`).join('');
const script = `<script type="module" src="/${entry.file}"></script>`;
const routeUrls = [];

for (const route of sourceRoutes) {
  const body = ssr.renderRoute(route.path);
  const canonical = `${SITE}${route.path}`;
  const structuredData = JSON.stringify(structuredDataFor(route, canonical));
  const t = escapeHtml(route.title);
  const d = escapeHtml(route.description);
  const head = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="dark light">',
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<link rel="canonical" href="${canonical}">`,
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">',
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${escapeHtml(ORG_NAME)}">`,
    '<meta property="og:locale" content="zh_CN">',
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:url" content="${canonical}">`,
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<script type="application/ld+json">${escapeScript(structuredData)}</script>`,
    styles,
  ].join('');
  const html = `<!doctype html><html lang="zh-CN"><head>${head}</head><body><div id="root">${body}</div>${script}</body></html>`;
  const file = route.path === '/' ? join(outputDir, 'index.html') : join(outputDir, route.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  routeUrls.push(route.path);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routeUrls
  .map((path) => {
    const priority = path === '/' ? '1.0' : path.split('/').filter(Boolean).length <= 1 ? '0.8' : '0.6';
    const changefreq = path.includes('/privacy') || path.includes('/terms') ? 'yearly' : 'monthly';
    return `  <url><loc>${SITE}${path}</loc><lastmod>${buildDate}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  })
  .join('\n')}\n</urlset>\n`;
writeFileSync(join(outputDir, 'sitemap.xml'), sitemap);

rmSync(join(outputDir, '.vite'), { force: true, recursive: true });
rmSync('.ssr', { force: true, recursive: true });

// ---- 结构化数据 ----

function organizationNode() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: `${SITE}/`,
    email: SUPPORT_EMAIL,
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL, availableLanguage: ['zh-Hans', 'en'] },
  };
}

function appInfo(path) {
  if (path.startsWith('/apps/memoria/')) {
    const harmony = path.includes('/harmony/');
    return {
      name: 'Memoria · 拾忆',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: harmony ? 'HarmonyOS' : 'iOS, iPadOS, watchOS',
      downloadUrl: harmony ? 'https://appgallery.huawei.com/app/C6917613545100329502' : 'https://apps.apple.com/app/id6760106574',
    };
  }
  if (path.startsWith('/apps/timetrails/')) return { name: '时光轨迹 TimeTrails', applicationCategory: 'TravelApplication', operatingSystem: 'iOS, watchOS', downloadUrl: 'https://apps.apple.com/app/id6752662508' };
  if (path.startsWith('/apps/traceapp/')) return { name: '出行轨迹 TraceApp', applicationCategory: 'TravelApplication', operatingSystem: 'iOS, watchOS', downloadUrl: 'https://apps.apple.com/app/id1634761411' };
  return null;
}

function breadcrumbNode(path) {
  if (path === '/') return null;
  const segments = path.split('/').filter(Boolean);
  const items = [{ name: '首页', url: `${SITE}/` }];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    const name = titleByPath.get(`${acc}/`);
    if (name) items.push({ name, url: `${SITE}${acc}/` });
  }
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function faqNode(path) {
  const items = FAQ[path];
  if (!items) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

function structuredDataFor(route, canonical) {
  const nodes = [organizationNode()];
  if (route.path === '/') {
    nodes.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: ORG_NAME, url: `${SITE}/`, inLanguage: 'zh-Hans', publisher: { '@type': 'Organization', name: ORG_NAME } });
  }
  const app = appInfo(route.path);
  if (app) {
    nodes.push({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', ...app, url: canonical, description: route.description, inLanguage: 'zh-Hans', offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' }, publisher: { '@type': 'Organization', name: ORG_NAME } });
  } else if (route.path !== '/') {
    nodes.push({ '@context': 'https://schema.org', '@type': 'WebPage', name: route.title, description: route.description, url: canonical, inLanguage: 'zh-Hans' });
  }
  const breadcrumb = breadcrumbNode(route.path);
  if (breadcrumb) nodes.push(breadcrumb);
  const faq = faqNode(route.path);
  if (faq) nodes.push(faq);
  return nodes;
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function escapeScript(value) {
  return value.replaceAll('<', '\\u003c');
}
