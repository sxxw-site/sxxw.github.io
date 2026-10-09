export type SiteRoute = {
  path: string;
  title: string;
  description: string;
  keywords?: string;
};

export const siteRoutes: SiteRoute[] = [
  { path: '/', title: '上海树下小屋网络科技有限公司', description: '上海树下小屋网络科技有限公司：足迹·TimeTrails、纪念日·倒数、出行轨迹 TraceApp 的产品介绍、隐私政策与用户支持中心。', keywords: '上海树下小屋,树下小屋,足迹,TimeTrails,纪念日倒数,出行轨迹,TraceApp,GPS轨迹记录,倒数日' },
  { path: '/apps/', title: '应用中心·上海树下小屋网络科技有限公司', description: '树下小屋旗下应用：足迹·TimeTrails(隐私优先的 GPS 轨迹记录)、纪念日·倒数(生日纪念日倒数提醒)、出行轨迹 TraceApp(出行轨迹与里程配速)。', keywords: '树下小屋,应用中心,足迹,TimeTrails,纪念日倒数,出行轨迹,TraceApp' },

  { path: '/apps/memoria/', title: '纪念日·倒数·生日纪念日倒数日提醒·恋爱倒计时', description: '纪念日·倒数帮你记录生日、纪念日、恋爱与重要日子，倒数与到日提醒不错过；本地优先，支持主屏小组件。iOS 与 HarmonyOS 双平台。', keywords: '纪念日,倒数日,生日提醒,纪念日提醒,恋爱倒计时,倒计时App,重要日子,人生进度,小组件' },
  { path: '/apps/memoria/ios/', title: '纪念日·倒数 iOS 版·倒数日·生日纪念日提醒', description: '纪念日·倒数 App Store 版：记录生日、纪念日与重要日子，主屏小组件与到日提醒，数据本地优先、可选 iCloud 同步，支持 iPhone/iPad/Apple Watch。', keywords: '纪念日,倒数日,生日提醒,纪念日提醒,倒计时,iOS,小组件,Apple Watch' },
  { path: '/apps/memoria/harmony/', title: '纪念日·倒数 HarmonyOS 版·倒数日·生日纪念日提醒', description: '纪念日·倒数 华为应用市场版：记录生日、纪念日与重要日子，桌面卡片与到日提醒；纯本地、不联网、不同步。', keywords: '纪念日,倒数日,生日提醒,纪念日提醒,倒计时,HarmonyOS,鸿蒙,华为应用市场' },
  { path: '/apps/memoria/ios/getting-started/', title: '纪念日·倒数 iOS 新手引导', description: '纪念日·倒数 iOS 版的新手使用引导：创建纪念日、设置提醒与添加主屏小组件。' },
  { path: '/apps/memoria/harmony/getting-started/', title: '纪念日·倒数 HarmonyOS 新手引导', description: '纪念日·倒数 HarmonyOS 版的新手使用引导：创建纪念日、设置提醒与添加桌面卡片。' },
  { path: '/apps/memoria/ios/privacy/', title: '纪念日·倒数 iOS 隐私政策', description: '适用于 纪念日·倒数 App Store 版本的隐私政策。' },
  { path: '/apps/memoria/harmony/privacy/', title: '纪念日·倒数 HarmonyOS 隐私政策', description: '适用于纪念日·倒数 HarmonyOS / 华为应用市场版本的隐私政策。' },
  { path: '/apps/memoria/ios/terms/', title: '纪念日·倒数 iOS 用户协议', description: '适用于 纪念日·倒数 App Store 版本的用户协议。' },
  { path: '/apps/memoria/harmony/terms/', title: '纪念日·倒数 HarmonyOS 用户协议', description: '适用于纪念日·倒数 HarmonyOS / 华为应用市场版本的用户协议。' },
  { path: '/apps/memoria/support/', title: '纪念日·倒数技术支持', description: '纪念日·倒数的常见问题与技术支持：提醒、小组件、数据与同步。' },

  { path: '/apps/timetrails/', title: '足迹·TimeTrails·每日轨迹·记录一生轨迹·GPS 路线记录', description: '足迹·TimeTrails，隐私优先的 GPS 轨迹记录应用。自动记录出行、跑步、骑行、徒步、驾车与旅行路线，在地图上呈现足迹、点亮走过的城市；数据默认仅存本机。', keywords: 'GPS轨迹记录,轨迹记录App,路线记录,运动轨迹,足迹地图,点亮城市,每日轨迹,徒步骑行驾车记录,时光轨迹,TimeTrails' },
  { path: '/apps/timetrails/getting-started/', title: '足迹·TimeTrails 新手引导', description: '足迹·TimeTrails 的新手使用引导：授权定位、开始记录与查看每日轨迹。' },
  { path: '/apps/timetrails/privacy/', title: '足迹·TimeTrails 隐私政策', description: '适用于足迹·TimeTrails 的隐私政策。' },
  { path: '/apps/timetrails/terms/', title: '足迹·TimeTrails 用户协议', description: '适用于足迹·TimeTrails 的用户协议。' },
  { path: '/apps/timetrails/support/', title: '足迹·TimeTrails 技术支持', description: '足迹·TimeTrails 的常见问题与技术支持：定位权限、轨迹记录与 iCloud 备份。' },

  { path: '/apps/traceapp/', title: '出行轨迹 TraceApp·轨迹记录·运动路线·里程配速·GPS 足迹地图', description: '出行轨迹 TraceApp，本地优先的出行轨迹记录应用。自动记录步行、跑步、骑行、驾车与旅行的路线、里程与配速，在地图上留下足迹；数据默认仅保存在本机。', keywords: '出行轨迹,轨迹记录,运动路线,里程,配速,GPS记录,旅行足迹,出行记录,TraceApp' },
  { path: '/apps/traceapp/getting-started/', title: '出行轨迹 TraceApp 新手引导', description: '出行轨迹 TraceApp 的新手使用引导：开启定位、记录轨迹与查看里程配速。' },
  { path: '/apps/traceapp/privacy/', title: '出行轨迹 TraceApp 隐私政策', description: '适用于 出行轨迹 TraceApp 的隐私政策。' },
  { path: '/apps/traceapp/terms/', title: '出行轨迹 TraceApp 用户协议', description: '适用于 出行轨迹 TraceApp 的用户协议。' },
  { path: '/apps/traceapp/support/', title: '出行轨迹 TraceApp 技术支持', description: '出行轨迹 TraceApp 的常见问题与技术支持。' },

  { path: '/support/', title: '客户服务中心·树下小屋', description: '树下小屋旗下所有应用的官方服务渠道：意见反馈与邮件、各应用商店评价，以及微信·QQ·Telegram 官方交流群。' },
  { path: '/feedback/', title: '意见反馈·树下小屋', description: '树下小屋各应用共用的意见反馈页：邮件反馈自动附带版本与设备信息，并可前往对应应用商店评价。' },
  { path: '/migrate/', title: '数据迁移·出行轨迹 → 足迹', description: '把「出行轨迹」记录的轨迹迁移到新版「足迹·TimeTrails」的引导说明：几步完成，全程本地处理、不上传。' },
  { path: '/about/', title: '关于我们·上海树下小屋网络科技有限公司', description: '了解上海树下小屋网络科技有限公司：以隐私优先、本地优先打造足迹·TimeTrails、纪念日·倒数、出行轨迹 TraceApp。' },
  { path: '/contact/', title: '联系我们·上海树下小屋网络科技有限公司', description: '联系上海树下小屋网络科技有限公司：邮件与官方交流群。' },
];

export function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.endsWith('/') ? path : `${path}/`;
}

export function routeFor(path: string): SiteRoute | undefined {
  return siteRoutes.find((route) => route.path === normalizePath(path));
}
