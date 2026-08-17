import timetrails from '../content/apps/timetrails.zh.json';
import ThemeToggle from '../components/ThemeToggle';

type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';

export default function TimeTrailsPage({ path }: { path: string }) {
  const section: Section = path.includes('/getting-started/') ? 'getting-started' : path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
  const base = '/apps/timetrails';
  return <><ThemeToggle /><ProductHeader /><main className="product-page"><div className="container product-page-inner">
    <nav className="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span>／</span><a href="/apps/">应用中心</a><span>／</span><span>{timetrails.appName}</span></nav>
    <section className="product-hero"><p className="route-eyebrow">{timetrails.platformName} · {timetrails.storeName}</p><h1>{titleFor(section)}</h1><p>{section === 'overview' ? timetrails.description : descriptionFor(section)}</p><PageTabs active={section} /></section>
    <TimeTrailsBody section={section} base={base} />
  </div></main><ProductFooter /></>;
}

function TimeTrailsBody({ section, base }: { section: Section; base: string }) {
  if (section === 'overview') return <><section className="content-section"><h2>把时间和地点连成自己的故事</h2><div className="feature-grid">{timetrails.features.map((feature) => <div className="feature-card" key={feature}>{feature}</div>)}</div></section><section className="privacy-facts"><h2>记录归你，数据也归你</h2><p>无需账号、没有广告或第三方追踪。轨迹默认存于本机；iCloud 备份完全可选，仅进入你的 Apple CloudKit 私有数据库。</p><div className="action-row"><a className="btn-primary" href={`${base}/getting-started/`}>开始使用</a><a className="btn-ghost" href={`${base}/privacy/`}>阅读隐私政策</a></div></section><ScreenshotGallery /></>;
  if (section === 'getting-started') return <section className="content-section"><h2>从第一段轨迹开始</h2><ol className="guide-list">{timetrails.guide.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>;
  if (section === 'privacy' || section === 'terms') { const document = timetrails[section]; const contactEmail = 'contactEmail' in document ? document.contactEmail : timetrails.supportEmail; return <article className="legal-document"><p className="legal-meta">生效日期：{document.effectiveDate} · 适用平台：{timetrails.platformName} · 应用名称：{timetrails.appName}</p>{'intro' in document && <p className="legal-intro">{document.intro}</p>}{document.sections.map((item) => <section key={item.title}><h2>{item.title}</h2>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>联系我们</h2><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></section></article>; }
  return <section className="content-section"><h2>技术支持</h2><div className="faq-list"><details open><summary>时光轨迹会一直定位我吗？</summary><p>记录由你控制，可随时暂停。系统定位仅用于本机轨迹记录，数据默认只保存在设备上。</p></details><details><summary>定位没有被记录？</summary><p>请在“设置 → 隐私与安全性 → 定位服务”中为时光轨迹选择“始终”，并开启“精确位置”与后台 App 刷新。</p></details><details><summary>iCloud 备份如何恢复？</summary><p>使用同一 Apple ID、已开启 iCloud 且网络正常时，可在设置的“iCloud 数据备份”中恢复或手动同步。</p></details><details><summary>如何彻底清除数据？</summary><p>可在应用设置中清除本机数据；如已开启 iCloud 备份，请同时删除云端副本。</p></details></div><p className="support-contact">仍需帮助？请邮件联系 <a href={`mailto:${timetrails.supportEmail}`}>{timetrails.supportEmail}</a>。</p></section>;
}

function ScreenshotGallery() { return <section className="screenshot-section"><div><p className="route-eyebrow">商店截图</p><h2>从每一天的路线，看见时光轨迹</h2></div><div className="screenshot-strip">{['/apps/timetrails/shot-01.png', '/apps/timetrails/shot-02.png', '/apps/timetrails/shot-03.png'].map((image, index) => <img src={image} alt={`时光轨迹 TimeTrails 商店截图 ${index + 1}`} key={image} loading="lazy" />)}</div></section>; }

function PageTabs({ active }: { active: Section }) { const routes: Array<[Section, string]> = [['overview', '产品介绍'], ['getting-started', '新手引导'], ['privacy', '隐私政策'], ['terms', '用户协议'], ['support', '技术支持']]; return <nav className="platform-tabs page-tabs" aria-label="时光轨迹页面导航">{routes.map(([section, label]) => <a key={section} className={active === section ? 'active' : ''} href={section === 'overview' ? '/apps/timetrails/' : `/apps/timetrails/${section}/`}>{label}</a>)}</nav>; }
function ProductHeader() { return <header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">时光轨迹 TimeTrails</span><span className="en">轨迹记录 · 回顾 · 隐私优先</span></span></a><nav className="nav-menu nav-menu-static"><a href="/apps/" className="nav-link">应用中心</a><a href="/apps/timetrails/support/" className="nav-link cta-nav">技术支持</a></nav></div></header>; }
function ProductFooter() { return <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">时光轨迹 TimeTrails</div><div className="footer-slogan">产品介绍 · 新手引导 · 隐私与支持</div></div><div className="footer-right"><div className="footer-links"><a href="/apps/timetrails/privacy/">隐私政策</a><a href="/apps/timetrails/terms/">用户协议</a></div></div></div></footer>; }
function titleFor(section: Section) { return section === 'overview' ? timetrails.tagline : section === 'getting-started' ? '时光轨迹 TimeTrails 新手引导' : section === 'privacy' ? '时光轨迹 TimeTrails 隐私政策' : section === 'terms' ? '时光轨迹 TimeTrails 用户协议' : '时光轨迹 TimeTrails 技术支持'; }
function descriptionFor(section: Section) { return section === 'getting-started' ? '从授权定位到查看每日轨迹，快速开始。' : section === 'privacy' ? '了解位置、运动与 iCloud 备份如何在本应用中处理。' : section === 'terms' ? '请在使用本应用前阅读用户协议。' : '帮助你顺利记录和回顾每一段旅程。'; }
