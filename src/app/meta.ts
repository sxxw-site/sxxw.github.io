import timetrails from '../content/apps/timetrails.zh.json';
import traceapp from '../content/apps/traceapp.zh.json';
import memoria from '../content/apps/memoria.zh.json';

export type PageMeta = { title: string; description: string };
type T = (key: string) => string;

type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';
const sectionOf = (p: string): Section =>
  p.includes('/getting-started/') ? 'getting-started'
    : p.includes('/privacy/') ? 'privacy'
      : p.includes('/terms/') ? 'terms'
        : p.includes('/support/') ? 'support' : 'overview';
const seg = (s: Section) => (s === 'getting-started' ? 'start' : s);
const tab = (t: T, s: Section) => t(`app.tab.${seg(s)}`);

/**
 * 按语言字典计算页面 <title>/<description>（与各页面组件逻辑一致）。
 * 用于按语言预渲染时输出本地化元信息；覆盖主营销页，其余返回 null（回退到 routes.ts 的中文）。
 */
export function pageMeta(pathname: string, t: T): PageMeta | null {
  const p = pathname;

  if (p === '/') return { title: t('home.meta.title'), description: t('home.meta.description') };
  if (p === '/apps/') return { title: t('apps.hero.title'), description: t('apps.hero.desc') };
  if (p === '/support/') return { title: t('support.hero.title'), description: t('support.hero.desc') };

  if (p.startsWith('/apps/timetrails/')) {
    const s = sectionOf(p); const APP = timetrails.appName;
    return s === 'overview'
      ? { title: `${APP}·${t('tt.tagline')}`, description: t('tt.desc') }
      : { title: `${APP} ${tab(t, s)}`, description: t(`tt.ui.desc.${seg(s)}`) };
  }
  if (p.startsWith('/apps/traceapp/')) {
    const s = sectionOf(p); const APP = traceapp.appName;
    return s === 'overview'
      ? { title: `${APP}·${t('trace.tagline')}`, description: t('trace.desc') }
      : { title: `${APP} ${tab(t, s)}`, description: t(`trace.ui.desc.${seg(s)}`) };
  }
  if (p.startsWith('/apps/memoria/')) {
    if (p === '/apps/memoria/') return { title: t('mem.ui.pc.title'), description: t('mem.ui.pc.desc') };
    const platform: 'ios' | 'harmony' = p.includes('/harmony/') ? 'harmony' : 'ios';
    const product = memoria[platform];
    const name = product.displayName;
    const cp = platform === 'ios' ? 'mem.ios' : 'mem.hm';
    const s = sectionOf(p);
    return s === 'overview'
      ? { title: `${name}·${platform === 'ios' ? 'iOS' : 'HarmonyOS'}`, description: t(`${cp}.desc`) }
      : { title: `${name} ${tab(t, s)}`, description: t(`mem.ui.desc.${seg(s)}`).replace('{app}', name) };
  }

  return null;
}
