import { useEffect, useRef, useState } from 'react';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { useI18n } from '../i18n/I18nProvider';
import { FEEDBACK_APPS, FEEDBACK_CONTACTS_DEFAULT } from '../lib/feedback';
import { localizedSiteHref } from '../lib/site-navigation';
import '../styles/service-pages.css';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* Try the fallback when clipboard access is unavailable. */ }
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const field = document.createElement('textarea');
  try {
    field.value = text;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.focus();
    field.select();
    return document.execCommand('copy');
  } catch { return false; }
  finally { field.remove(); previousFocus?.focus(); }
}

type Channel = {
  name: string; desc: string; meta: string; cta: string;
  href?: string; qr?: string; copy?: string; copyLabel?: string; full?: boolean;
};

function ChannelAction({ item, pending, copied, copyLabel, copiedLabel, fullLabel, href, onCopy }: {
  item: Channel; pending: string; copied: string; copyLabel: string; copiedLabel: string; fullLabel: string;
  href: (path: string) => string; onCopy: (text: string) => void;
}) {
  const external = !!item.href && /^https?:\/\//.test(item.href);
  return <div className="service-channel-actions">
    {item.full && <span className="service-channel-state">{fullLabel}</span>}
    {item.href && !item.full && <a className="service-action" href={href(item.href)} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{item.cta}<span aria-hidden="true">{external ? '↗' : '→'}</span></a>}
    {item.copy && <button className="service-action service-copy-action" type="button" onClick={() => onCopy(item.copy!)} aria-label={`${copied === item.copy ? copiedLabel : item.copyLabel ?? copyLabel} · ${item.meta}`}>
      {copied === item.copy ? copiedLabel : item.copyLabel ?? copyLabel}<span aria-hidden="true">{copied === item.copy ? '✓' : '⧉'}</span>
    </button>}
    {item.qr && <div className="service-channel-qr"><img src={item.qr} alt={`${item.name} · ${item.cta}`} width={132} height={132} loading="lazy" /><span>{item.cta}</span></div>}
    {!item.href && !item.copy && !item.qr && <span className="service-channel-state">{pending}</span>}
  </div>;
}

export default function SupportPage() {
  const { t, language } = useI18n();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  const href = (path: string) => localizedSiteHref(language.normalizedCode, path);
  const [copied, setCopied] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimer = useRef<number>();
  const copyLabel = zh ? '复制' : 'Copy';
  const copiedLabel = zh ? '已复制' : 'Copied';
  const technicalLabel = zh ? '各产品技术支持' : 'Product support';
  const cc = FEEDBACK_CONTACTS_DEFAULT;

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  async function onCopy(text: string) {
    const ok = await copyText(text);
    window.clearTimeout(copyTimer.current);
    setCopied(ok ? text : '');
    setCopyStatus(ok ? `${copiedLabel}：${text}` : zh ? '复制未完成，请手动复制上方联系信息。' : 'Could not copy. Please copy the contact details above manually.');
    copyTimer.current = window.setTimeout(() => { setCopied(''); setCopyStatus(''); }, 2400);
  }

  const feedback: Channel[] = [
    { name: t('support.g1.title'), desc: t('support.g1.feedback.desc'), meta: '纪念日 · TimeTrails · TraceApp', cta: zh ? '打开反馈页' : 'Open feedback', href: '/feedback/' },
    { name: t('support.g1.email.name'), desc: t('support.g1.email.desc'), meta: 'house@sxxw.site', cta: t('support.g1.email.cta'), href: 'mailto:house@sxxw.site' },
  ];
  const community: Channel[] = [
    { name: t('support.g3.wechat.name'), desc: t('support.g3.wechat.desc'), meta: cc.wechat?.id ?? 'TreeHouse', cta: t('support.g3.join'), copy: cc.wechat?.id, copyLabel: zh ? '复制微信号' : 'Copy WeChat ID' },
    ...(cc.qq ?? []).map((group) => ({ name: t('support.g3.qq.name'), desc: t('support.g3.qq.desc'), meta: group.label, cta: t('support.g3.join'), href: group.joinUrl, copy: group.link ?? group.label, copyLabel: zh ? '复制加群链接' : 'Copy group link', full: group.full })),
    { name: t('support.g3.tg.name'), desc: t('support.g3.tg.desc'), meta: 'TreeHouse Chat', cta: t('support.g3.join'), href: cc.telegram?.url },
  ];
  const products = [
    { id: 'memoria', support: '/apps/memoria/support/', desc: t('mem.ui.desc.support').replace('{app}', FEEDBACK_APPS.memoria.name), guides: [{ label: 'iOS', href: '/apps/memoria/ios/getting-started/' }, { label: 'HarmonyOS', href: '/apps/memoria/harmony/getting-started/' }] },
    { id: 'timetrails', support: '/apps/timetrails/support/', desc: t('tt.ui.desc.support'), guides: [{ label: '', href: '/apps/timetrails/getting-started/' }] },
    { id: 'traceapp', support: '/apps/traceapp/support/', desc: t('trace.ui.desc.support'), guides: [{ label: '', href: '/apps/traceapp/getting-started/' }] },
  ];
  const reviews: Channel[] = [
    { name: '纪念日 · App Store', desc: 'iPhone · iPad · Apple Watch', meta: 'App Store', cta: t('support.g2.cta.write'), href: FEEDBACK_APPS.memoria.stores.appstore?.url },
    { name: '纪念日 · Huawei AppGallery', desc: t('support.g2.memoria.huawei.platform'), meta: 'Huawei AppGallery', cta: t('support.g2.cta.goto'), href: FEEDBACK_APPS.memoria.stores.huawei?.url },
    { name: '足迹-时光轨迹 · App Store', desc: 'iPhone · iPad · Apple Watch', meta: 'App Store', cta: t('support.g2.cta.write'), href: FEEDBACK_APPS.timetrails.stores.appstore?.url },
    { name: '出行轨迹 TraceApp · App Store', desc: 'iPhone', meta: 'App Store', cta: t('support.g2.cta.write'), href: FEEDBACK_APPS.traceapp.stores.appstore?.url },
  ];
  const action = (item: Channel) => <ChannelAction item={item} pending={t('support.pending')} copied={copied} copyLabel={copyLabel} copiedLabel={copiedLabel} fullLabel={zh ? '群已满' : 'Group full'} href={href} onCopy={onCopy} />;
  const foot = t('support.foot').split('house@sxxw.site');

  return <>
    <SiteHeader active="support" subtitle="Support · Community" />
    <main className="service-page service-support" id="page-content" tabIndex={-1}><div className="container service-container">
      <header className="service-intro">
        <p className="page-eyebrow">{t('support.hero.eyebrow')}</p>
        <h1 className="page-title">{t('support.hero.title')}</h1>
        <p className="page-lead">{t('support.hero.desc')}</p>
        <nav className="service-section-nav" aria-label={zh ? '服务目录' : 'Support directory'}>
          <a href="#feedback">{t('support.g1.title')}<span aria-hidden="true">↓</span></a>
          <a href="#product-support">{technicalLabel}<span aria-hidden="true">↓</span></a>
          <a href="#community">{zh ? '官方社群' : 'Community'}<span aria-hidden="true">↓</span></a>
        </nav>
      </header>
      <section className="service-section" id="feedback" aria-labelledby="feedback-title">
        <header className="service-section-heading"><p className="service-section-number" aria-hidden="true">01</p><h2 id="feedback-title">{t('support.g1.title')}</h2><p>{t('support.g1.note')}</p></header>
        <div className="service-section-content service-channel-list">{feedback.map((item) => <article className="service-channel" key={item.name}>
          <div className="service-channel-copy"><p className="service-channel-meta">{item.meta}</p><h3>{item.name}</h3><p>{item.desc}</p></div>{action(item)}
        </article>)}</div>
      </section>
      <section className="service-section" id="product-support" aria-labelledby="product-support-title">
        <header className="service-section-heading"><p className="service-section-number" aria-hidden="true">02</p><h2 id="product-support-title">{technicalLabel}</h2><p>{zh ? '按应用查看常见问题和使用指南。' : 'Find answers and getting-started guides for your app.'}</p></header>
        <div className="service-section-content">
          <div className="service-product-list">{products.map((product) => <article className="service-product" key={product.id}>
            <div><h3>{FEEDBACK_APPS[product.id].name}</h3><p>{product.desc}</p></div>
            <nav className="service-product-links" aria-label={`${FEEDBACK_APPS[product.id].name} · ${technicalLabel}`}>
              <a className="service-action" href={href(product.support)}>{t('app.tab.support')}<span aria-hidden="true">→</span></a>
              {product.guides.map((guide) => <a className="service-action" href={href(guide.href)} key={guide.href}>{guide.label && `${guide.label} · `}{t('app.tab.start')}<span aria-hidden="true">→</span></a>)}
              <a className="service-action" href={href(`/feedback/?app=${product.id}`)}>{zh ? '提交反馈' : 'Send feedback'}<span aria-hidden="true">→</span></a>
            </nav>
          </article>)}</div>
          <div className="service-reviews"><h3>{t('support.g2.title')}</h3><p>{t('support.g2.note')}</p>
            <ul className="service-review-list">{reviews.map((item) => <li key={item.name}><div><h4>{item.name}</h4><p>{item.desc}</p></div>{action(item)}</li>)}</ul>
          </div>
        </div>
      </section>
      <section className="service-section" id="community" aria-labelledby="community-title">
        <header className="service-section-heading"><p className="service-section-number" aria-hidden="true">03</p><h2 id="community-title">{t('support.g3.title')}</h2><p>{t('support.g3.note')}</p></header>
        <div className="service-section-content service-channel-list">{community.map((item) => <article className="service-channel" key={`${item.name}-${item.meta}`}>
          <div className="service-channel-copy"><p className="service-channel-meta">{item.meta}</p><h3>{item.name}</h3><p>{item.desc}</p></div>{action(item)}
        </article>)}</div>
      </section>
      <div className="service-afterword"><p>{foot.map((part, index) => <span key={index}>{index > 0 && <a href="mailto:house@sxxw.site">house@sxxw.site</a>}{part}</span>)}</p><p className="service-copy-status" role="status" aria-live="polite">{copyStatus}</p></div>
    </div></main>
    <SiteFooter />
  </>;
}
