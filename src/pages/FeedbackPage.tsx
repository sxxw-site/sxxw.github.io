import { useEffect, useRef, useState } from 'react';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import {
  FEEDBACK_FALLBACK, FEEDBACK_GENERIC,
  buildFeedbackBody, buildFeedbackMailto, collectFeedbackDiagnostics, contactsFor, resolveFeedbackApp, resolveFeedbackStrings,
  type Contacts, type FbStrings, type FeedbackApp, type StoreEntry,
} from '../lib/feedback';
import '../styles/utility-pages.css';

// 邮件主题：应用名 · 本地化「意见反馈」标题
function subjectFor(app: FeedbackApp, t: FbStrings): string { return `${app.name} · ${t.title}`; }
// 输入框占位符：复用 problem 文案，去掉方括号（[问题或建议] → 问题或建议）
function placeholderFor(t: FbStrings): string { return t.problem.replace(/^[[【]+/, '').replace(/[\]】]+$/, ''); }

// 剪贴板复制：优先 async clipboard，回退 execCommand，适配 App 内 webview。
async function copyText(text: string): Promise<boolean> {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

/**
 * 「意见反馈」页 /feedback/ —— 网站与 App 内 H5 共用，embed=1 时隐藏整站外壳。
 * 参考 TraceApp 原生反馈：邮件 + 官方社群（QQ 群直达 / 微信复制号并打开）+ 应用商店评价。
 * App 端打开示例：
 *   /feedback/?app=timetrails&lang=en&appv=1.2.0&build=45&os=iOS%2018&device=iPhone15,2
 *   /feedback/?app=memoria&platform=harmony&lang=zh-Hans   （鸿蒙版 → 华为应用市场评价）
 * 参数：app=memoria|timetrails|traceapp；platform=harmony 或 store=huawei 切到华为商店；
 *       lang 决定文案语言；appv/build/os/device 自动拼进邮件诊断信息。
 */
export default function FeedbackPage() {
  const [t, setT] = useState<FbStrings>(FEEDBACK_FALLBACK);
  const [app, setApp] = useState<FeedbackApp>(FEEDBACK_GENERIC);
  const [store, setStore] = useState<StoreEntry | undefined>(undefined);
  const [contacts, setContacts] = useState<Contacts>({});
  const [diag, setDiag] = useState('');
  const [fromApp, setFromApp] = useState(false);
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [isChinese, setIsChinese] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const strings = resolveFeedbackStrings();
    const resolved = resolveFeedbackApp();
    const collected = collectFeedbackDiagnostics(strings);
    const lang = (new URLSearchParams(window.location.search).get('lang') || '').trim().toLowerCase();
    setIsChinese(!lang || lang.startsWith('zh') || lang === 'yue');
    setT(strings); setApp(resolved.app); setStore(resolved.store); setContacts(contactsFor(resolved.app));
    setDiag(collected.text); setFromApp(collected.fromApp);
    // 能力探测：系统分享是否支持「带文件」（iOS 15+/Android Chrome）。不支持则不展示附件入口，避免附件被静默丢弃。
    try {
      const probe = new File([''], 'probe.png', { type: 'image/png' });
      setCanShareFiles(typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }));
    } catch { /* 不支持则保持 false */ }
  }, []);

  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    event.target.value = ''; // 允许再次选择同一文件
  }
  function removeFile(idx: number) { setFiles((prev) => prev.filter((_, i) => i !== idx)); }

  function showCopyResult(key: string, ok: boolean, detail: string) {
    setCopyStatus(ok ? `${t.copied}${t.colon}${detail}` : (isChinese ? '复制失败，请手动选择并复制。' : 'Could not copy. Select and copy the text manually.'));
    if (ok) { setCopied(key); window.setTimeout(() => setCopied((c) => (c === key ? '' : c)), 2500); }
  }

  function copyAnd(key: string, text: string, openUrl?: string) {
    copyText(text).then((ok) => {
      showCopyResult(key, ok, text);
      if (openUrl) window.setTimeout(() => { window.location.href = openUrl; }, 380);
    });
  }

  const ratingLine = rating ? `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)\n\n` : '';
  const mailto = buildFeedbackMailto(app.email, subjectFor(app, t), t, fromApp ? diag : '', ratingLine + msg);

  // 有附件时走系统分享；不支持或分享出错时回退纯邮件，用户主动取消时直接返回。
  // 注意：Web Share 无「收件人」字段，分享到邮件会新建空收件人邮件——故把反馈邮箱写进正文首行，便于用户复制/知道发往何处。
  async function shareWithFiles() {
    const recipient = `${t.emailLabel}${t.colon}${app.email}\n\n`;
    const body = recipient + buildFeedbackBody(t, fromApp ? diag : '', ratingLine + msg);
    // Web Share 无收件人字段：发送时顺手把反馈邮箱复制到剪贴板，用户可直接粘贴到「收件人」。
    // 不 await，保持在用户手势内同步发起 share（clipboard 写入已同步触发）。
    void copyText(app.email).then((ok) => {
      showCopyResult('email', ok, app.email);
    });
    try {
      if (files.length && navigator.canShare?.({ files }) && navigator.share) {
        await navigator.share({ files, title: subjectFor(app, t), text: body });
        return;
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return; // 用户主动取消，不回退
    }
    window.location.href = mailto;
  }
  const useShare = canShareFiles && files.length > 0;
  const hasContacts = !!((contacts.qq && contacts.qq.length) || contacts.wechat || contacts.telegram);
  const copyMark = (key: string) => (copied === key ? `✓ ${t.copied}` : (isChinese ? '复制' : 'Copy'));
  const optional = isChinese ? '可选' : 'Optional';
  const openMail = isChinese ? '打开邮件应用' : 'Open email app';
  const openShare = isChinese ? '打开系统分享' : 'Open system share';

  return <div className="utility-page utility-feedback">
    <SiteHeader active="support" />
    <main className="utility-shell" id="page-content" tabIndex={-1}>
      <header className="utility-intro">
        <p className="utility-eyebrow">{app.name}</p>
        <h1 className="fb-title">{t.title}</h1>
        <p className="fb-intro">{t.intro}</p>
      </header>

      <div className="utility-feedback-grid">
        <section className="utility-compose" aria-labelledby="feedback-message-label">
          <label className="utility-field-label" id="feedback-message-label" htmlFor="feedback-message">{placeholderFor(t)}</label>
          <p className="utility-help" id="feedback-message-help">{isChinese ? '可以补充出现问题前的操作、实际结果，以及你期待的结果。' : 'Include what you did, what happened, and what you expected.'}</p>
          <textarea
            id="feedback-message"
            className="fb-textarea"
            value={msg}
            onChange={(event) => setMsg(event.target.value)}
            placeholder={placeholderFor(t)}
            aria-describedby="feedback-message-help"
            rows={8}
          />

          <fieldset className="utility-rating">
            <legend>{isChinese ? '使用体验评分' : 'Your app experience'} <span className="utility-optional">{optional}</span></legend>
            <div className="utility-rating-row">
              <div className="fb-stars">
                {[1, 2, 3, 4, 5].map((n) => <label className={`utility-star${n <= rating ? ' on' : ''}`} key={n}>
                  <input type="radio" name="feedback-rating" value={n} checked={rating === n} aria-label={`${n}/5`} onChange={() => setRating(n)} />
                  <span aria-hidden="true">★</span>
                </label>)}
              </div>
              {rating > 0 && <button type="button" className="utility-text-button" onClick={() => setRating(0)}>{isChinese ? '清除评分' : 'Clear rating'}</button>}
            </div>
          </fieldset>

          {canShareFiles && <section className="fb-attach utility-attachment" aria-labelledby="feedback-attachment-title">
            <h2 className="utility-section-title" id="feedback-attachment-title">{isChinese ? '截屏与录屏' : 'Screenshots and recordings'} <span className="utility-optional">{optional}</span></h2>
            <p className="utility-help">{isChinese ? '添加附件后，通过系统分享选择邮件或其他应用。' : 'Add files, then choose Mail or another app in the system share sheet.'}</p>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={onPickFiles} hidden />
            <button type="button" className="fb-attach-btn" onClick={() => fileRef.current?.click()}><span aria-hidden="true">＋</span>{t.attach}</button>
            {files.length > 0 && <ul className="fb-files">
              {files.map((f, i) => <li className="fb-file" key={`${f.name}-${i}`}>
                <span className="fb-file-name">{f.name}</span>
                <button type="button" className="fb-file-x" onClick={() => removeFile(i)} aria-label={`${isChinese ? '移除附件' : 'Remove attachment'}: ${f.name}`}>×</button>
              </li>)}
            </ul>}
          </section>}

          <div className="utility-send">
            <p className="utility-help" id="feedback-send-help">{useShare
              ? (isChinese ? '分享正文首行包含反馈邮箱；请在所选应用中确认收件人与发送。' : 'The email address is included in the first line. Confirm the recipient and send in the app you choose.')
              : (isChinese ? '将打开邮件应用并填入反馈内容，请在邮件应用中确认发送。' : 'Your email app will open with this feedback filled in. Review and send it there.')}</p>
            {useShare
              ? <button type="button" className="btn-primary fb-send" onClick={shareWithFiles} aria-describedby="feedback-send-help">{openShare}<span aria-hidden="true">↗</span></button>
              : <a className="btn-primary fb-send" href={mailto} aria-label={`${t.button} · ${openMail}`} aria-describedby="feedback-send-help">{openMail}<span aria-hidden="true">↗</span></a>}
            {useShare && <a className="fb-email-only" href={mailto}>{t.emailOnly}</a>}
          </div>
        </section>

        <aside className="utility-feedback-aside">
          <section className="utility-info-block" aria-labelledby="feedback-email-title">
            <h2 className="utility-section-title" id="feedback-email-title">{t.emailLabel}</h2>
            <a className="utility-email-link" href={`mailto:${app.email}`}>{app.email}</a>
            <button type="button" className="fb-copy" onClick={() => copyAnd('email', app.email)} aria-label={`${isChinese ? '复制邮箱' : 'Copy email'}: ${app.email}`}>{copyMark('email')}</button>
          </section>
          {fromApp && diag && <section className="utility-info-block" aria-labelledby="feedback-diagnostics-title">
            <h2 className="utility-section-title" id="feedback-diagnostics-title">{t.deviceLabel}</h2>
            <p className="utility-help">{isChinese ? '以下诊断信息会随反馈附上。' : 'These diagnostics will be included with your feedback.'}</p>
            <pre className="fb-diag">{diag}</pre>
          </section>}
          {store && <section className="utility-info-block utility-store-rating" aria-labelledby="feedback-store-title">
            <h2 className="utility-section-title" id="feedback-store-title">{t.rate} <span className="utility-optional">{optional}</span></h2>
            <a className="btn-ghost fb-rate" href={store.url} target="_blank" rel="noreferrer">{store.name}<span aria-hidden="true">↗</span></a>
          </section>}
        </aside>
      </div>

      <p className="utility-copy-status" role="status" aria-live="polite" aria-atomic="true">{copyStatus}</p>

      {hasContacts ? <section className="fb-community" aria-labelledby="feedback-community-title">
        <h2 className="utility-section-title" id="feedback-community-title">{t.community}</h2>
        <div className="fb-chips">
          {contacts.qq?.map((g, i) => <div className="fb-chip-pair" key={g.label}>
            {g.full
              ? <span className="fb-chip fb-chip-off">QQ 群 · {g.label}（已满）</span>
              : g.joinUrl
                ? <a className="fb-chip" href={g.joinUrl} {...(/^https?:/.test(g.joinUrl) ? { target: '_blank', rel: 'noreferrer' } : {})}>QQ 群 · {g.label} ↗</a>
                : <span className="fb-chip">QQ 群 · {g.label}</span>}
            <button type="button" className="fb-copy-chip" onClick={() => copyAnd(`qq${i}`, g.link || g.label)} aria-label={`${isChinese ? '复制 QQ 群' : 'Copy QQ group'}: ${g.label}`}>{copyMark(`qq${i}`)}</button>
          </div>)}
          {contacts.wechat && <button type="button" className="fb-chip" onClick={() => copyAnd('wechat', contacts.wechat!.id, contacts.wechat!.url)}>微信 · {contacts.wechat.id} <em>{copyMark('wechat')}</em></button>}
          {contacts.telegram && <div className="fb-chip-pair">
            <a className="fb-chip" href={contacts.telegram.url} target="_blank" rel="noreferrer">Telegram ↗</a>
            <button type="button" className="fb-copy-chip" onClick={() => copyAnd('tg', contacts.telegram!.url)} aria-label={isChinese ? '复制 Telegram 链接' : 'Copy Telegram link'}>{copyMark('tg')}</button>
          </div>}
        </div>
      </section> : <a className="fb-support-link" href="/support/">{t.community} →</a>}
    </main>
    <SiteFooter />
  </div>;
}
