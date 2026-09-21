import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import {
  FEEDBACK_FALLBACK, FEEDBACK_GENERIC,
  buildFeedbackBody, buildFeedbackMailto, collectFeedbackDiagnostics, contactsFor, resolveFeedbackApp, resolveFeedbackStrings,
  type Contacts, type FbStrings, type FeedbackApp, type StoreEntry,
} from '../lib/feedback';

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
 * 独立「意见反馈」页 /feedback/ —— 无整站外壳，聚焦单卡片，适合 App 内 H5 打开。
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
  const [files, setFiles] = useState<File[]>([]);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const strings = resolveFeedbackStrings();
    const resolved = resolveFeedbackApp();
    const collected = collectFeedbackDiagnostics(strings);
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

  function copyAnd(key: string, text: string, openUrl?: string) {
    copyText(text).then((ok) => {
      if (ok) { setCopied(key); window.setTimeout(() => setCopied((c) => (c === key ? '' : c)), 1600); }
      if (openUrl) window.setTimeout(() => { window.location.href = openUrl; }, 380);
    });
  }

  const ratingLine = rating ? `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)\n\n` : '';
  const mailto = buildFeedbackMailto(app.email, subjectFor(app, t), t, fromApp ? diag : '', ratingLine + msg);

  // 有附件时走系统分享（可把截屏/录屏 + 预填正文一起交给邮件/微信等）；不支持或用户取消则回退纯邮件。
  // 注意：Web Share 无「收件人」字段，分享到邮件会新建空收件人邮件——故把反馈邮箱写进正文首行，便于用户复制/知道发往何处。
  async function shareWithFiles() {
    const recipient = `${t.emailLabel}${t.colon}${app.email}\n\n`;
    const body = recipient + buildFeedbackBody(t, fromApp ? diag : '', ratingLine + msg);
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
  const copyMark = (key: string) => (copied === key ? `✓ ${t.copied}` : '⧉');

  return <div className="fb-page">
    <ThemeToggle />
    <main className="fb-shell">
      <span className="fb-brand"><span className="fb-star" aria-hidden="true">✦</span>{app.name}</span>
      <h1 className="fb-title">{t.title}</h1>
      <p className="fb-intro">{t.intro}</p>

      <div className="fb-card">
        <div className="fb-stars" role="radiogroup" aria-label={t.rate}>
          {[1, 2, 3, 4, 5].map((n) => <button
            key={n} type="button" className={`fb-star${n <= rating ? ' on' : ''}`}
            role="radio" aria-checked={n === rating} aria-label={`${n}/5`}
            onClick={() => setRating((r) => (r === n ? 0 : n))}
          >★</button>)}
        </div>
        <textarea
          className="fb-textarea"
          value={msg}
          onChange={(event) => setMsg(event.target.value)}
          placeholder={placeholderFor(t)}
          aria-label={t.title}
          rows={6}
        />
        {canShareFiles && <div className="fb-attach">
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={onPickFiles} hidden />
          <button type="button" className="fb-attach-btn" onClick={() => fileRef.current?.click()}>
            <span aria-hidden="true">📎</span> {t.attach}
          </button>
          {files.length > 0 && <ul className="fb-files">
            {files.map((f, i) => <li className="fb-file" key={`${f.name}-${i}`}>
              <span className="fb-file-name">{f.name}</span>
              <button type="button" className="fb-file-x" onClick={() => removeFile(i)} aria-label={`× ${f.name}`}>×</button>
            </li>)}
          </ul>}
        </div>}
        <div className="fb-email">
          <span className="fb-email-key">{t.emailLabel}</span>
          <span className="fb-email-val">
            <a className="linkish" href={`mailto:${app.email}`}>{app.email}</a>
            <button type="button" className="fb-copy" onClick={() => copyAnd('email', app.email)} aria-label={app.email}>{copied === 'email' ? `✓ ${t.copied}` : '⧉'}</button>
          </span>
        </div>
        {fromApp && diag && <pre className="fb-diag" aria-label={t.deviceLabel}>{diag}</pre>}
      </div>

      <div className="fb-actions">
        {useShare
          ? <button type="button" className="btn-primary fb-send" onClick={shareWithFiles}>{t.button}</button>
          : <a className="btn-primary fb-send" href={mailto}>{t.button}</a>}
        {store && <a className="btn-ghost fb-rate" href={store.url} target="_blank" rel="noreferrer">{t.rate} · {store.name} ↗</a>}
      </div>
      {useShare && <a className="fb-email-only" href={mailto}>{t.emailOnly}</a>}

      {hasContacts ? <div className="fb-community">
        <p className="fb-community-title">{t.community}</p>
        <div className="fb-chips">
          {contacts.qq?.map((g, i) => <div className="fb-chip-pair" key={g.label}>
            {g.full
              ? <span className="fb-chip fb-chip-off">QQ 群 · {g.label}（已满）</span>
              : <a className="fb-chip" href={g.joinUrl || '#'} {...(/^https?:/.test(g.joinUrl || '') ? { target: '_blank', rel: 'noreferrer' } : {})}>QQ 群 · {g.label} ↗</a>}
            <button type="button" className="fb-copy-chip" onClick={() => copyAnd(`qq${i}`, g.link || g.label)} aria-label={g.link || g.label}>{copyMark(`qq${i}`)}</button>
          </div>)}
          {contacts.wechat && <button type="button" className="fb-chip" onClick={() => copyAnd('wechat', contacts.wechat!.id, contacts.wechat!.url)}>微信 · {contacts.wechat.id} <em>{copyMark('wechat')}</em></button>}
          {contacts.telegram && <div className="fb-chip-pair">
            <a className="fb-chip" href={contacts.telegram.url} target="_blank" rel="noreferrer">Telegram ↗</a>
            <button type="button" className="fb-copy-chip" onClick={() => copyAnd('tg', contacts.telegram!.url)} aria-label={contacts.telegram.url}>{copyMark('tg')}</button>
          </div>}
        </div>
      </div> : <a className="fb-support-link" href="/support/">{t.community} →</a>}

      <a className="fb-foot" href="/">sxxw.site</a>
    </main>
  </div>;
}
