import ThemeToggle from '../components/ThemeToggle';

const apps = [
  { name: 'Memoria · 拾忆', platform: 'App Store · HarmonyOS', description: '记录生日、纪念日与倒数。iOS 版支持可选 iCloud 私有同步；华为应用市场的拾忆为纯本地版本。', href: '/apps/memoria/', tag: '纪念日 · 提醒' },
  { name: '时光轨迹 TimeTrails', platform: 'App Store · iPhone 与 Apple Watch', description: '隐私优先的 GPS 轨迹记录：自动记录出行、运动与旅行路线，在地图上呈现足迹、点亮走过的城市。轨迹默认本地保存，可选 iCloud 私有备份。', href: '/apps/timetrails/', tag: 'GPS轨迹 · 路线' },
  { name: '出行轨迹 TraceApp', platform: 'App Store · iPhone', description: '记录路径、里程、速度与配速。无需账号，不内置广告或第三方统计。', href: '/apps/traceapp/', tag: '路线 · 统计' },
];

export default function AppsPage() {
  return <><ThemeToggle /><header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">上海树下小屋网络科技有限公司</span><span className="en">Products · Support · Privacy</span></span></a><nav className="nav-menu nav-menu-static"><a className="nav-link" href="/">首页</a><a className="nav-link cta-nav" href="/contact/">联系我们</a></nav></div></header><main className="product-page"><div className="container product-page-inner"><section className="product-hero apps-hero"><p className="route-eyebrow">sxxw.site · 应用支持中心</p><h1>每一款应用，都有清楚的说明与可控的数据边界。</h1><p>在这里找到产品介绍、新手引导、隐私政策、用户协议与技术支持。请按你实际使用的平台阅读相应内容。</p></section><section className="app-directory" aria-label="应用列表">{apps.map((app, index) => <article className="app-directory-card" key={app.name}><span className="app-index">0{index + 1}</span><p>{app.platform}</p><h2>{app.name}</h2><span>{app.description}</span><div><em>{app.tag}</em><a className="btn-ghost" href={app.href}>查看应用</a></div></article>)}</section></div></main><footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">上海树下小屋网络科技有限公司</div><div className="footer-slogan">产品介绍 · 新手引导 · 隐私与支持</div></div></div></footer></>;
}
