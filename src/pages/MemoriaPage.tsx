import memoria from '../content/apps/memoria.zh.json';
import ThemeToggle from '../components/ThemeToggle';

type Platform = 'ios' | 'harmony';
type Section = 'overview' | 'getting-started' | 'privacy' | 'terms' | 'support';

export default function MemoriaPage({ path }: { path: string }) {
  const platform = path.includes('/harmony/') ? 'harmony' : 'ios';
  const section: Section = path.includes('/getting-started/') ? 'getting-started'
    : path.includes('/privacy/') ? 'privacy'
      : path.includes('/terms/') ? 'terms'
        : path.includes('/support/') ? 'support' : 'overview';

  if (path === '/apps/memoria/') return <PlatformChooser />;
  const product = memoria[platform];
  const base = `/apps/memoria/${platform}`;

  return <><ThemeToggle />
    <MemoriaHeader />
    <main className="product-page">
      <div className="container product-page-inner">
        <nav className="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span>／</span><a href="/apps/">应用中心</a><span>／</span><a href="/apps/memoria/">Memoria · 拾忆</a><span>／</span><span>{product.displayName}</span></nav>
        <section className="product-hero">
          <p className="route-eyebrow">{product.platformName} · {product.storeName}</p>
          <h1>{sectionTitle(section, product.displayName)}</h1>
          <p>{section === 'overview' ? product.description : sectionDescription(section, product.displayName)}</p>
          <PlatformTabs active={platform} section={section} />
        </section>
        <PageBody product={product} section={section} base={base} />
      </div>
    </main>
    <ProductFooter />
  </>;
}

function PlatformChooser() {
  return <><ThemeToggle />
    <MemoriaHeader />
    <main className="product-page"><div className="container product-page-inner">
      <nav className="breadcrumbs" aria-label="面包屑"><a href="/">首页</a><span>／</span><a href="/apps/">应用中心</a><span>／</span><span>Memoria · 拾忆</span></nav>
      <section className="product-hero"><p className="route-eyebrow">Memoria · 拾忆</p><h1>把重要的日子，留在适合你的设备里。</h1><p>请选择你正在使用的平台。两种版本都以本地数据和无第三方追踪为原则，但同步能力、应用名称和适用协议不同。</p></section>
      <div className="platform-cards">
        <PlatformCard title="Memoria · 拾忆" eyebrow="App Store · iPhone / iPad / Apple Watch" description="支持本地提醒、小组件、Apple Watch 与可选 iCloud 私有同步。" href="/apps/memoria/ios/" cta="查看 iOS 版本" />
        <PlatformCard title="拾忆" eyebrow="HarmonyOS · 华为应用市场" description="纯本地版本：不联网、不提供云同步，数据仅留在设备应用沙箱。" href="/apps/memoria/harmony/" cta="查看 HarmonyOS 版本" />
      </div>
    </div></main>
    <ProductFooter />
  </>;
}

function PageBody({ product, section, base }: { product: typeof memoria.ios; section: Section; base: string }) {
  if (section === 'overview') return <>
    <section className="content-section"><h2>适合记录的每一种重要</h2><div className="feature-grid">{product.features.map((feature) => <div className="feature-card" key={feature}>{feature}</div>)}</div></section>
    <section className="privacy-facts"><h2>隐私先于便利</h2><p>{product.description.includes('不联网') ? '不设账号、不联网、不提供云端备份；你的记录仅在当前设备中保存。' : '不设账号、不投放广告、不接入第三方追踪；同步如启用，仅进入你的 iCloud 私有数据库。'}</p><div className="action-row"><a className="btn-primary" href={`${base}/getting-started/`}>开始使用</a><a className="btn-ghost" href={`${base}/privacy/`}>阅读隐私政策</a></div></section>
    <ScreenshotGallery appName={product.displayName} images={product.storeUrl ? ['/apps/memoria/ios/shot-01.png', '/apps/memoria/ios/shot-02.png', '/apps/memoria/ios/shot-03.png'] : ['/apps/memoria/harmony/shot-01.jpg', '/apps/memoria/harmony/shot-02.jpg', '/apps/memoria/harmony/shot-03.jpg']} />
    {product.storeUrl ? <a className="store-link" href={product.storeUrl} target="_blank" rel="noreferrer">在 App Store 获取 {product.displayName}</a> : <p className="store-hint">请在华为应用市场搜索“拾忆”获取本应用。</p>}
  </>;
  if (section === 'getting-started') return <section className="content-section"><h2>从第一条记录开始</h2><ol className="guide-list">{product.guide.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>;
  if (section === 'privacy' || section === 'terms') {
    const document = product[section];
    const contactEmail = 'contactEmail' in document ? document.contactEmail : memoria.supportEmail;
    return <article className="legal-document"><p className="legal-meta">生效日期：{document.effectiveDate} · 适用平台：{product.platformName} · 应用名称：{product.displayName}</p>{'intro' in document && <p className="legal-intro">{document.intro}</p>}{document.sections.map((item) => <section key={item.title}><h2>{item.title}</h2>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>{section === 'privacy' ? '联系我们' : '十一、联系我们'}</h2><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></section></article>;
  }
  return <section className="content-section"><h2>技术支持</h2><div className="faq-list"><details open><summary>数据会同步到其他设备吗？</summary><p>{product.storeUrl ? '登录 iCloud 并开启同步后，数据会通过你的 iCloud 私有库在 iPhone、iPad 与 Apple Watch 间同步。' : '不会。本版本不联网且不提供云同步，数据只保存在当前设备。'}</p></details><details><summary>如何删除数据？</summary><p>{product.storeUrl ? '你可以在应用内删除记录；卸载应用会删除本地数据，iCloud 数据可在系统“设置 → iCloud”中管理。' : '你可以在应用内删除记录并清空回收站；卸载应用将删除全部本地数据。'}</p></details><details><summary>提醒没有出现怎么办？</summary><p>请确认记录已设置提醒，并在系统设置中允许本应用发送通知。关闭通知只会影响提醒，不影响记录本身。</p></details></div><p className="support-contact">仍需帮助？请邮件联系 <a href={`mailto:${memoria.supportEmail}`}>{memoria.supportEmail}</a>。</p></section>;
}

function PlatformTabs({ active, section }: { active: Platform; section: Section }) {
  const route = (platform: Platform) => section === 'overview' ? `/apps/memoria/${platform}/` : `/apps/memoria/${platform}/${section}/`;
  return <div className="platform-tabs" aria-label="选择 Memoria 平台"><a href={route('ios')} className={active === 'ios' ? 'active' : ''}>App Store · Memoria · 拾忆</a><a href={route('harmony')} className={active === 'harmony' ? 'active' : ''}>华为应用市场 · 拾忆</a></div>;
}

function PlatformCard({ title, eyebrow, description, href, cta }: { title: string; eyebrow: string; description: string; href: string; cta: string }) {
  return <article className="platform-card"><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span><a className="btn-ghost" href={href}>{cta}</a></article>;
}

function MemoriaHeader() {
  return <header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">Memoria · 拾忆</span><span className="en">纪念日 · 生日 · 倒数</span></span></a><nav className="nav-menu nav-menu-static"><a href="/apps/memoria/" className="nav-link">平台选择</a><a href="/apps/memoria/support/" className="nav-link cta-nav">技术支持</a></nav></div></header>;
}

function ProductFooter() {
  return <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">Memoria · 拾忆</div><div className="footer-slogan">产品介绍 · 新手引导 · 隐私与支持</div></div><div className="footer-right"><div className="footer-links"><a href="/apps/memoria/ios/privacy/">iOS 隐私政策</a><a href="/apps/memoria/harmony/privacy/">HarmonyOS 隐私政策</a></div></div></div></footer>;
}

function ScreenshotGallery({ appName, images }: { appName: string; images: string[] }) {
  return <section className="screenshot-section"><div><p className="route-eyebrow">商店截图</p><h2>看见 {appName} 的实际界面</h2></div><div className="screenshot-strip">{images.map((image, index) => <img src={image} alt={`${appName} 商店截图 ${index + 1}`} key={image} loading="lazy" />)}</div></section>;
}

function sectionTitle(section: Section, name: string) {
  return section === 'overview' ? name : section === 'getting-started' ? `${name} 新手引导` : section === 'privacy' ? `${name} 隐私政策` : section === 'terms' ? `${name} 用户协议` : `${name} 技术支持`;
}

function sectionDescription(section: Section, name: string) {
  return section === 'getting-started' ? `从首次创建到通知权限，快速开始使用 ${name}。` : section === 'privacy' ? `请按你正在使用的平台阅读适用的 ${name} 隐私政策。` : section === 'terms' ? `请在使用 ${name} 前阅读本用户协议。` : `帮助你顺利使用 ${name}。`;
}
