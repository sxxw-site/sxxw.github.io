import { useEffect, useState } from 'react';
import timetrails from '../content/apps/timetrails.zh.json';
import feedbackI18n from '../content/feedback.i18n.json';
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
  if (section === 'overview') return <><section className="content-section"><h2>把时间和地点连成自己的故事</h2><div className="feature-grid">{timetrails.features.map((feature) => <div className="feature-card" key={feature}>{feature}</div>)}</div></section><section className="privacy-facts"><h2>记录归你，数据也归你</h2><p>无需账号、没有广告或第三方追踪。轨迹默认存于本机；iCloud 备份完全可选，仅进入你的 Apple CloudKit 私有数据库。</p><div className="action-row"><a className="btn-primary" href={`${base}/getting-started/`}>开始使用</a><a className="btn-ghost" href={`${base}/privacy/`}>阅读隐私政策</a></div></section><FeedbackSection /><ScreenshotGallery />{timetrails.storeUrl && <a className="store-link" href={timetrails.storeUrl} target="_blank" rel="noreferrer">在 {timetrails.storeName} 获取 {timetrails.appName}</a>}</>;
  if (section === 'getting-started') return <section className="content-section"><h2>从第一段轨迹开始</h2><ol className="guide-list">{timetrails.guide.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>;
  if (section === 'privacy' || section === 'terms') { const document = timetrails[section]; const contactEmail = 'contactEmail' in document ? document.contactEmail : timetrails.supportEmail; return <article className="legal-document"><p className="legal-meta">生效日期：{document.effectiveDate} · 适用平台：{timetrails.platformName} · 应用名称：{timetrails.appName}</p>{'intro' in document && <p className="legal-intro">{document.intro}</p>}{document.sections.map((item) => <section key={item.title}><h2>{item.title}</h2>{item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><h2>联系我们</h2><p>如有疑问，请联系：<a href={`mailto:${contactEmail}`}>{contactEmail}</a></p></section></article>; }
  return <><FeedbackSection /><section className="content-section"><h2>常见问题</h2><div className="faq-list"><details open><summary>时光轨迹会一直定位我吗？</summary><p>记录由你控制，可随时暂停。系统定位仅用于本机轨迹记录，数据默认只保存在设备上。</p></details><details><summary>定位没有被记录？</summary><p>请在“设置 → 隐私与安全性 → 定位服务”中为时光轨迹选择“始终”，并开启“精确位置”与后台 App 刷新。</p></details><details><summary>iCloud 备份如何恢复？</summary><p>使用同一 Apple ID、已开启 iCloud 且网络正常时，可在设置的“iCloud 数据备份”中恢复或手动同步。</p></details><details><summary>如何彻底清除数据？</summary><p>可在应用设置中清除本机数据；如已开启 iCloud 备份，请同时删除云端副本。</p></details></div></section></>;
}

// 反馈区多语言：App 通过 query 传入 lang（如 en / zh-Hans-SG / ja / pt-BR）。中文站默认简体，
// 从 App 打开的境外用户按其语言显示，覆盖全站 40+ 语言；页面其余部分仍为中文。
interface FbStrings {
  title: string; intro: string; emailLabel: string; deviceLabel: string; button: string;
  subject: string; problem: string; steps: string; diagHeader: string;
  dApp: string; dDevice: string; dOS: string; dLang: string; na: string; colon: string;
}
const FEEDBACK_I18N: Record<string, FbStrings> = feedbackI18n;
const FALLBACK: FbStrings = FEEDBACK_I18N['zh-hans'];
// 旧式/别名代码 → 词条键
const LANG_ALIAS: Record<string, string> = { iw: 'he', in: 'id', no: 'nb', nn: 'nb' };

/** 由 App 传入的 lang（无则跟随中文站）解析反馈区词条。 */
function resolveFeedbackStrings(): FbStrings {
  if (typeof window === 'undefined') return FALLBACK;
  const raw = (new URLSearchParams(window.location.search).get('lang') || '').trim().replace(/_/g, '-').toLowerCase();
  if (!raw) return FALLBACK;
  // 中文与粤语归并到简/繁两套
  if (raw.startsWith('zh') || raw === 'yue') {
    return FEEDBACK_I18N[/hant|hk|tw|mo|yue/.test(raw) ? 'zh-hant' : 'zh-hans'];
  }
  const base = raw.split('-')[0];
  const key = LANG_ALIAS[base] || base;
  return FEEDBACK_I18N[key] || FEEDBACK_I18N['en'];
}

/** 从 URL query（App 打开时带上）+ 浏览器 UA 收集诊断信息。SSR 时返回空。 */
function collectFeedbackDiagnostics(t: FbStrings): { text: string; fromApp: boolean } {
  if (typeof window === 'undefined') return { text: '', fromApp: false };
  const q = new URLSearchParams(window.location.search);
  const ua = navigator.userAgent || '';
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(ua);
  const m = ua.match(/OS (\d+(?:[_.]\d+){1,2})/);
  const osFromUA = m ? (isApple ? 'iOS ' : '') + m[1].replace(/_/g, '.') : '';
  const appv = q.get('appv') || '';
  const build = q.get('build') || '';
  const os = q.get('os') || osFromUA;
  const device = q.get('device') || '';
  const lang = q.get('lang') || navigator.language || '';
  const lines = [
    t.dApp + t.colon + (appv ? appv + (build ? ` (${build})` : '') : t.na),
    t.dDevice + t.colon + (device || t.na),
    t.dOS + t.colon + (os || t.na),
    t.dLang + t.colon + (lang || t.na),
  ];
  return { text: lines.join('\n'), fromApp: !!appv };
}

function buildFeedbackMailto(email: string, t: FbStrings, diag: string): string {
  const body =
    `${t.problem}\n\n\n${t.steps}\n\n\n` +
    (diag ? `${t.diagHeader}\n${diag}\n` : '');
  return `mailto:${email}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(body)}`;
}

function FeedbackSection() {
  const email = timetrails.supportEmail;
  const [t, setT] = useState<FbStrings>(FALLBACK);
  const [diag, setDiag] = useState('');
  const [fromApp, setFromApp] = useState(false);
  const [mailto, setMailto] = useState(() => buildFeedbackMailto(email, FALLBACK, ''));
  useEffect(() => {
    const strings = resolveFeedbackStrings();
    const { text, fromApp } = collectFeedbackDiagnostics(strings);
    setT(strings);
    setDiag(text);
    setFromApp(fromApp);
    setMailto(buildFeedbackMailto(email, strings, text));
  }, [email]);
  return <section className="content-section feedback-section" id="feedback"><h2>{t.title}</h2><p>{t.intro}</p><div className="contact-card" style={{ maxWidth: 760 }}><div className="contact-row"><div className="contact-label">{t.emailLabel}</div><div className="contact-value"><a className="linkish" href={`mailto:${email}`}>{email}</a></div></div>{fromApp && diag && <div className="contact-row"><div className="contact-label">{t.deviceLabel}</div><div className="contact-value" style={{ whiteSpace: 'pre-line', opacity: 0.85 }}>{diag}</div></div>}</div><div className="action-row"><a className="btn-primary" href={mailto}>{t.button}</a></div></section>;
}

function ScreenshotGallery() { return <section className="screenshot-section"><div><p className="route-eyebrow">商店截图</p><h2>从每一天的路线，看见时光轨迹</h2></div><div className="screenshot-strip">{['/apps/timetrails/shot-01.png', '/apps/timetrails/shot-02.png', '/apps/timetrails/shot-03.png'].map((image, index) => <img src={image} alt={`时光轨迹 TimeTrails 商店截图 ${index + 1}`} key={image} loading="lazy" />)}</div></section>; }

function PageTabs({ active }: { active: Section }) { const routes: Array<[Section, string]> = [['overview', '产品介绍'], ['getting-started', '新手引导'], ['privacy', '隐私政策'], ['terms', '用户协议'], ['support', '技术支持']]; return <nav className="platform-tabs page-tabs" aria-label="时光轨迹页面导航">{routes.map(([section, label]) => <a key={section} className={active === section ? 'active' : ''} href={section === 'overview' ? '/apps/timetrails/' : `/apps/timetrails/${section}/`}>{label}</a>)}</nav>; }
function ProductHeader() { return <header className="navbar"><div className="container nav-inner"><a className="brand" href="/" aria-label="上海树下小屋网络科技有限公司"><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">时光轨迹 TimeTrails</span><span className="en">GPS 轨迹记录 · 路线回顾 · 隐私优先</span></span></a><nav className="nav-menu nav-menu-static"><a href="/apps/" className="nav-link">应用中心</a><a href="/apps/timetrails/support/" className="nav-link cta-nav">技术支持</a></nav></div></header>; }
function ProductFooter() { return <footer className="site-footer"><div className="container footer-inner"><div className="footer-left"><div className="footer-brand">时光轨迹 TimeTrails</div><div className="footer-slogan">产品介绍 · 新手引导 · 隐私与支持</div></div><div className="footer-right"><div className="footer-links"><a href="/apps/timetrails/privacy/">隐私政策</a><a href="/apps/timetrails/terms/">用户协议</a></div></div></div></footer>; }
function titleFor(section: Section) { return section === 'overview' ? timetrails.tagline : section === 'getting-started' ? '时光轨迹 TimeTrails 新手引导' : section === 'privacy' ? '时光轨迹 TimeTrails 隐私政策' : section === 'terms' ? '时光轨迹 TimeTrails 用户协议' : '时光轨迹 TimeTrails 技术支持'; }
function descriptionFor(section: Section) { return section === 'getting-started' ? '从授权定位到查看每日轨迹，快速开始。' : section === 'privacy' ? '了解位置、运动与 iCloud 备份如何在本应用中处理。' : section === 'terms' ? '请在使用本应用前阅读用户协议。' : '帮助你顺利记录和回顾每一段旅程。'; }
