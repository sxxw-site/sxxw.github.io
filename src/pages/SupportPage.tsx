import ThemeToggle from '../components/ThemeToggle';

/*
 * 客户服务中心 /support/
 * 填写方式（都免费）：
 *   - 有链接的渠道：把 href 填成真实地址（http/https 外链会自动新标签打开；站内用 / 开头）。
 *   - 二维码渠道（微信群 / QQ群）：把二维码 PNG 放到 public/support/ 下，
 *     再把 qr 填成对应路径，如 qr: '/support/wechat-group.png'。
 *   - href 与 qr 都留空的渠道会显示“筹备中”，不会出现坏链/坏图，可安全上线。
 */

type Channel = {
  name: string;
  desc: string;
  meta: string;
  cta: string;
  href?: string; // 外链或站内链接
  qr?: string;   // 二维码图片路径（放在 public/support/ 下）
};

type Group = {
  kicker: string;
  label: string;
  title: string;
  note: string;
  items: Channel[];
};

const SUPPORT_GROUPS: Group[] = [
  {
    kicker: '01',
    label: 'Feedback · 问题反馈',
    title: '问题反馈',
    note: '遇到问题或有建议，用下面任意方式告诉我们，都会认真处理。',
    items: [
      { name: 'App 内「意见反馈」', desc: '在各 App 内提交，会自动附带版本、设备与系统信息，帮助我们更快定位问题。', meta: '拾忆 · 时光轨迹 · 出行轨迹', cta: '查看应用', href: '/apps/' },
      { name: '发送邮件', desc: '正式工单、隐私与账号相关问题，邮件回复更完整。', meta: 'house@sxxw.site', cta: '发送邮件', href: 'mailto:house@sxxw.site' },
    ],
  },
  {
    kicker: '02',
    label: 'Reviews · 应用商店评价',
    title: '给应用评价（按应用区分）',
    note: '喜欢的话，在你使用的应用商店留个评价，我们会看到并回复。请对应你的应用点击。',
    items: [
      { name: 'Memoria · 拾忆（App Store）', desc: 'iPhone / iPad / Apple Watch', meta: 'App Store', cta: '写评价', href: 'https://apps.apple.com/app/id6760106574?action=write-review' },
      { name: '拾忆（华为应用市场）', desc: 'HarmonyOS · 华为设备', meta: '华为应用市场', cta: '前往评价', href: 'https://appgallery.huawei.com/app/C6917613545100329502' },
      { name: '时光轨迹 TimeTrails（App Store）', desc: 'iPhone / Apple Watch', meta: 'App Store', cta: '写评价', href: 'https://apps.apple.com/app/id6752662508?action=write-review' },
      { name: '出行轨迹 TraceApp（App Store）', desc: 'iPhone', meta: 'App Store', cta: '写评价', href: 'https://apps.apple.com/app/id1634761411?action=write-review' },
    ],
  },
  {
    kicker: '03',
    label: 'Groups · 官方交流群',
    title: '微信群 · QQ群 · Telegram 群',
    note: '加入官方群获取更新公告与用户互助：国内用微信 / QQ，海外用 Telegram。',
    items: [
      { name: '微信群', desc: '日常交流与求助。群满后会更新新群二维码。', meta: '树下小屋 · 用户交流', cta: '扫码加入', qr: '' },
      { name: 'QQ 群', desc: '国内用户交流，人数上限高。', meta: '树下小屋 · 用户交流', cta: '扫码加入', qr: '' },
      { name: 'Telegram 群', desc: '海外用户交流与答疑。', meta: 'TreeHouse Chat', cta: 'Join chat', href: '' },
    ],
  },
];

function ChannelAction({ item }: { item: Channel }) {
  if (item.href) {
    const external = /^https?:\/\//.test(item.href);
    return <a className="btn-ghost support-btn" href={item.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{item.cta} {external ? '↗' : '→'}</a>;
  }
  if (item.qr) {
    return <div className="support-qr-wrap"><img className="support-qr" src={item.qr} alt={`${item.name} 二维码`} loading="lazy" /><span>{item.cta}</span></div>;
  }
  return <span className="support-pending" aria-label="该渠道筹备中">筹备中</span>;
}

export default function SupportPage() {
  return <><ThemeToggle />
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">树下小屋 · 客户服务</span><span className="en">Support · Community</span></span></a>
      <nav className="nav-menu nav-menu-static"><a className="nav-link" href="/">首页</a><a className="nav-link" href="/apps/">应用中心</a><a className="nav-link cta-nav" href="/contact/">联系我们</a></nav>
    </div></header>
    <main className="product-page"><div className="container product-page-inner">
      <section className="product-hero">
        <p className="route-eyebrow">sxxw.site · 客户服务中心</p>
        <h1>选择最适合你的方式，联系树下小屋。</h1>
        <p>这里汇总了树下小屋旗下所有应用的官方服务渠道：问题反馈、应用商店评价与官方交流群。数据本地优先、无广告、无第三方追踪。</p>
      </section>

      {SUPPORT_GROUPS.map((group) => <section className="support-group" key={group.kicker}>
        <p className="kicker"><b>{group.kicker}</b> {group.label}</p>
        <h2 className="section-title">{group.title}</h2>
        <p className="support-group-note">{group.note}</p>
        <div className="support-cards">{group.items.map((item) => <article className="support-card" key={item.name}>
          <div className="support-card-top">
            <span className="support-meta">{item.meta}</span>
            <h3>{item.name}</h3>
            <p>{item.desc}</p>
          </div>
          <div className="support-action"><ChannelAction item={item} /></div>
        </article>)}</div>
      </section>)}

      <p className="support-foot-note">找不到合适的渠道？直接邮件 <a className="linkish" href="mailto:house@sxxw.site">house@sxxw.site</a>，我们会尽快回复。</p>
    </div></main>
    <footer className="site-footer"><div className="container footer-inner">
      <div className="footer-left"><div className="footer-brand">树下小屋 · 客户服务</div><div className="footer-slogan">问题反馈 · 应用商店评价 · 官方交流群</div></div>
      <div className="footer-right"><div className="footer-links"><a href="/">首页</a><a href="/apps/">应用中心</a><a href="/contact/">联系我们</a></div></div>
    </div></footer>
  </>;
}
