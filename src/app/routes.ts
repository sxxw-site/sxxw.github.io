export type SiteRoute = {
  path: string;
  title: string;
  description: string;
};

export const siteRoutes: SiteRoute[] = [
  { path: '/', title: '上海树下小屋网络科技有限公司', description: '上海树下小屋网络科技有限公司的产品与用户支持中心。' },
  { path: '/apps/', title: '应用中心｜上海树下小屋网络科技有限公司', description: '探索 Memoria · 拾忆、TimeTrails · 时光轨迹与 TraceApp。' },
  { path: '/apps/memoria/', title: 'Memoria · 拾忆｜纪念日与倒数', description: 'Memoria · 拾忆帮助你记录生日、纪念日与重要日子。' },
  { path: '/apps/memoria/ios/', title: 'Memoria · 拾忆 iOS 版', description: 'Memoria · 拾忆 App Store 版本介绍与支持。' },
  { path: '/apps/memoria/harmony/', title: '拾忆 HarmonyOS 版', description: '拾忆 HarmonyOS 版本介绍与支持。' },
  { path: '/apps/memoria/ios/getting-started/', title: 'Memoria · 拾忆 iOS 新手引导', description: 'Memoria · 拾忆 iOS 版的新手使用引导。' },
  { path: '/apps/memoria/harmony/getting-started/', title: '拾忆 HarmonyOS 新手引导', description: '拾忆 HarmonyOS 版的新手使用引导。' },
  { path: '/apps/memoria/ios/privacy/', title: 'Memoria · 拾忆 iOS 隐私政策', description: '适用于 Memoria · 拾忆 App Store 版本的隐私政策。' },
  { path: '/apps/memoria/harmony/privacy/', title: '拾忆 HarmonyOS 隐私政策', description: '适用于拾忆 HarmonyOS / 华为应用市场版本的隐私政策。' },
  { path: '/apps/memoria/ios/terms/', title: 'Memoria · 拾忆 iOS 用户协议', description: '适用于 Memoria · 拾忆 App Store 版本的用户协议。' },
  { path: '/apps/memoria/harmony/terms/', title: '拾忆 HarmonyOS 用户协议', description: '适用于拾忆 HarmonyOS / 华为应用市场版本的用户协议。' },
  { path: '/apps/memoria/support/', title: 'Memoria · 拾忆技术支持', description: 'Memoria · 拾忆的常见问题与技术支持。' },
  { path: '/apps/timetrails/', title: '时光轨迹 TimeTrails · GPS 轨迹路线记录', description: '时光轨迹 TimeTrails，隐私优先的 GPS 轨迹记录应用。自动记录出行、跑步、骑行、徒步、驾车与旅行路线，在地图上呈现足迹、点亮走过的城市；数据默认仅存本机。' },
  { path: '/apps/timetrails/getting-started/', title: 'TimeTrails 新手引导', description: 'TimeTrails · 时光轨迹的新手使用引导。' },
  { path: '/apps/timetrails/privacy/', title: 'TimeTrails 隐私政策', description: '适用于 TimeTrails · 时光轨迹的隐私政策。' },
  { path: '/apps/timetrails/terms/', title: 'TimeTrails 用户协议', description: '适用于 TimeTrails · 时光轨迹的用户协议。' },
  { path: '/apps/timetrails/support/', title: 'TimeTrails 技术支持', description: 'TimeTrails · 时光轨迹的常见问题与技术支持。' },
  { path: '/apps/traceapp/', title: 'TraceApp', description: 'TraceApp 的产品介绍与用户支持。' },
  { path: '/apps/traceapp/getting-started/', title: 'TraceApp 新手引导', description: 'TraceApp 的新手使用引导。' },
  { path: '/apps/traceapp/privacy/', title: 'TraceApp 隐私政策', description: '适用于 TraceApp 的隐私政策。' },
  { path: '/apps/traceapp/terms/', title: 'TraceApp 用户协议', description: '适用于 TraceApp 的用户协议。' },
  { path: '/apps/traceapp/support/', title: 'TraceApp 技术支持', description: 'TraceApp 的常见问题与技术支持。' },
  { path: '/about/', title: '关于我们｜上海树下小屋网络科技有限公司', description: '了解上海树下小屋网络科技有限公司。' },
  { path: '/contact/', title: '联系我们｜上海树下小屋网络科技有限公司', description: '联系上海树下小屋网络科技有限公司。' },
];

export function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.endsWith('/') ? path : `${path}/`;
}

export function routeFor(path: string): SiteRoute | undefined {
  return siteRoutes.find((route) => route.path === normalizePath(path));
}
