import { siteRoutes } from '../app/routes';
import { pageMeta } from '../app/meta';
import { HARBOR_BASE, harborCopy, harborSection } from '../content/apps/harbor';

// The search page itself and app-embedded tools are not indexed.
const EXCLUDE = new Set(['/search/', '/feedback/', '/migrate/']);
export type SiteSearchItem = { path: string; title: string; description: string; keywords: string; contentLanguage?: string };

const IOS_PLATFORMS = 'iOS iPhone iPad Apple Watch';
const HARMONY_PLATFORMS = 'HarmonyOS Harmony 鸿蒙 鴻蒙';
const PRODUCTS = [
  { base: '/apps/memoria/', aliases: 'Memoria 纪念日 紀念日', platforms: `${IOS_PLATFORMS} ${HARMONY_PLATFORMS}` },
  { base: '/apps/timetrails/', aliases: 'TimeTrails 足迹-时光轨迹 足跡-時光軌跡 足迹 足跡 时光轨迹 時光軌跡', platforms: IOS_PLATFORMS },
  { base: '/apps/traceapp/', aliases: 'TraceApp 出行轨迹 出行軌跡', platforms: 'iOS iPhone' },
  { base: HARBOR_BASE, aliases: 'Harbor', platforms: 'iOS iPhone iPad macOS Mac' },
];

function productKeywords(path: string): string {
  const product = PRODUCTS.find((product) => path.startsWith(product.base));
  if (!product) return '';
  // Memoria's chooser and support cover both platforms; platform documents do not.
  const platforms = path.startsWith('/apps/memoria/ios/') ? IOS_PLATFORMS
    : path.startsWith('/apps/memoria/harmony/') ? HARMONY_PLATFORMS : product.platforms;
  return `${product.aliases} ${platforms}`;
}

export function buildSiteSearchIndex(t: (key: string) => string, language: string): SiteSearchItem[] {
  return siteRoutes.filter((route) => !EXCLUDE.has(route.path)).map((route) => {
    const meta = language === 'zh-hans' ? null : pageMeta(route.path, t, language);
    const harbor = route.path.startsWith(HARBOR_BASE) ? harborCopy(language, harborSection(route.path)) : null;
    const keywords = route.path === HARBOR_BASE ? harbor!.searchKeywords : route.keywords ?? '';
    return { path: route.path, title: meta?.title ?? route.title, description: meta?.description ?? route.description,
      keywords: `${keywords} ${productKeywords(route.path)}`.trim(), contentLanguage: harbor?.lang };
  });
}

export function searchSiteIndex(index: readonly SiteSearchItem[], query: string): SiteSearchItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.length ? index.filter((item) => {
    const text = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  }) : [];
}
