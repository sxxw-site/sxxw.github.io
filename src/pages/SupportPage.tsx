import { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n } from '../i18n/I18nProvider';
import { FEEDBACK_CONTACTS_DEFAULT } from '../lib/feedback';

async function copyText(text: string): Promise<boolean> {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

/*
 * 客户服务中心 /support/  （UI 文案走 i18n，可跟随站点语言切换）
 * 填链接：有链接的渠道填 href（外链自动新标签）；二维码渠道把 PNG 放 public/support/ 并填 qr；
 * 都留空则显示「筹备中」，可安全上线。
 */

type Channel = { name: string; desc: string; meta: string; cta: string; href?: string; qr?: string; copy?: string };
type Group = { kicker: string; label: string; title: string; note: string; items: Channel[] };

function ChannelAction({ item, pending, copied, onCopy }: { item: Channel; pending: string; copied: string; onCopy: (text: string) => void }) {
  if (item.href) {
    const external = /^https?:\/\//.test(item.href);
    return <a className="btn-ghost support-btn" href={item.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{item.cta} {external ? '↗' : '→'}</a>;
  }
  if (item.copy) {
    return <button type="button" className="btn-ghost support-btn support-copy" onClick={() => onCopy(item.copy!)}>{item.copy} <em>{copied === item.copy ? '✓' : '⧉'}</em></button>;
  }
  if (item.qr) {
    return <div className="support-qr-wrap"><img className="support-qr" src={item.qr} alt={item.name} loading="lazy" /><span>{item.cta}</span></div>;
  }
  return <span className="support-pending" aria-label={pending}>{pending}</span>;
}

export default function SupportPage() {
  const { t } = useI18n();
  const pending = t('support.pending');
  const [copied, setCopied] = useState('');
  const cc = FEEDBACK_CONTACTS_DEFAULT;
  const qqGroup = cc.qq?.[0];

  function onCopy(text: string) {
    copyText(text).then((ok) => {
      if (ok) { setCopied(text); window.setTimeout(() => setCopied((c) => (c === text ? '' : c)), 1600); }
    });
  }

  const groups: Group[] = [
    {
      kicker: '01', label: 'Feedback', title: t('support.g1.title'), note: t('support.g1.note'),
      items: [
        { name: t('support.g1.feedback.name'), desc: t('support.g1.feedback.desc'), meta: 'Memoria · TimeTrails · TraceApp', cta: t('support.g1.feedback.cta'), href: '/apps/' },
        { name: t('support.g1.email.name'), desc: t('support.g1.email.desc'), meta: 'house@sxxw.site', cta: t('support.g1.email.cta'), href: 'mailto:house@sxxw.site' },
      ],
    },
    {
      kicker: '02', label: 'Reviews', title: t('support.g2.title'), note: t('support.g2.note'),
      items: [
        { name: 'Memoria · 拾忆 · App Store', desc: 'iPhone / iPad / Apple Watch', meta: 'App Store', cta: t('support.g2.cta.write'), href: 'https://apps.apple.com/app/id6760106574?action=write-review' },
        { name: '拾忆 · Huawei AppGallery', desc: t('support.g2.memoria.huawei.platform'), meta: 'Huawei AppGallery', cta: t('support.g2.cta.goto'), href: 'https://appgallery.huawei.com/app/C6917613545100329502' },
        { name: '时光轨迹 TimeTrails · App Store', desc: 'iPhone / Apple Watch', meta: 'App Store', cta: t('support.g2.cta.write'), href: 'https://apps.apple.com/app/id6752662508?action=write-review' },
        { name: '出行轨迹 TraceApp · App Store', desc: 'iPhone', meta: 'App Store', cta: t('support.g2.cta.write'), href: 'https://apps.apple.com/app/id1634761411?action=write-review' },
      ],
    },
    {
      kicker: '03', label: 'Groups', title: t('support.g3.title'), note: t('support.g3.note'),
      items: [
        { name: t('support.g3.wechat.name'), desc: t('support.g3.wechat.desc'), meta: 'TreeHouse', cta: t('support.g3.join'), copy: cc.wechat?.id },
        { name: t('support.g3.qq.name'), desc: t('support.g3.qq.desc'), meta: qqGroup?.label ?? 'TreeHouse', cta: t('support.g3.join'), href: qqGroup?.joinUrl },
        { name: t('support.g3.tg.name'), desc: t('support.g3.tg.desc'), meta: 'TreeHouse Chat', cta: t('support.g3.join'), href: cc.telegram?.url },
      ],
    },
  ];

  return <><ThemeToggle />
    <header className="navbar"><div className="container nav-inner">
      <a className="brand" href="/" aria-label={t('home.common.company')}><span className="brand-icon" aria-hidden="true">✦</span><span className="brand-text"><span className="cn">树下小屋 · {t('support.brand')}</span><span className="en">Support · Community</span></span></a>
      <nav className="nav-menu nav-menu-static"><a className="nav-link" href="/">{t('home.nav.home')}</a><a className="nav-link" href="/apps/">{t('nav.apps')}</a><a className="nav-link cta-nav" href="/contact/">{t('home.nav.contact')}</a><LanguageSelect /></nav>
    </div></header>
    <main className="product-page"><div className="container product-page-inner">
      <section className="product-hero">
        <p className="route-eyebrow">{t('support.hero.eyebrow')}</p>
        <h1>{t('support.hero.title')}</h1>
        <p>{t('support.hero.desc')}</p>
      </section>

      {groups.map((group) => <section className="support-group" key={group.kicker}>
        <p className="kicker"><b>{group.kicker}</b> {group.label}</p>
        <h2 className="section-title">{group.title}</h2>
        <p className="support-group-note">{group.note}</p>
        <div className="support-cards">{group.items.map((item) => <article className="support-card" key={item.name}>
          <div className="support-card-top">
            <span className="support-meta">{item.meta}</span>
            <h3>{item.name}</h3>
            <p>{item.desc}</p>
          </div>
          <div className="support-action"><ChannelAction item={item} pending={pending} copied={copied} onCopy={onCopy} /></div>
        </article>)}</div>
      </section>)}

      <p className="support-foot-note" dangerouslySetInnerHTML={{ __html: t('support.foot').replace('house@sxxw.site', '<a class="linkish" href="mailto:house@sxxw.site">house@sxxw.site</a>') }} />
    </div></main>
    <footer className="site-footer"><div className="container footer-inner">
      <div className="footer-left"><div className="footer-brand">树下小屋 · {t('support.brand')}</div><div className="footer-slogan">{t('support.footer.slogan')}</div></div>
      <div className="footer-right"><div className="footer-links"><a href="/">{t('home.nav.home')}</a><a href="/apps/">{t('nav.apps')}</a><a href="/contact/">{t('home.nav.contact')}</a></div></div>
    </div></footer>
  </>;
}
