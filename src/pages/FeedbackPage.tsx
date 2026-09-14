import { useEffect, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import {
  FEEDBACK_FALLBACK, FEEDBACK_GENERIC,
  buildFeedbackMailto, collectFeedbackDiagnostics, resolveFeedbackApp, resolveFeedbackStrings,
  type FbStrings, type FeedbackApp, type StoreEntry,
} from '../lib/feedback';

// 邮件主题：应用名 · 本地化「意见反馈」标题
function subjectFor(app: FeedbackApp, t: FbStrings): string { return `${app.name} · ${t.title}`; }
// 输入框占位符：复用 problem 文案，去掉方括号（[问题或建议] → 问题或建议）
function placeholderFor(t: FbStrings): string { return t.problem.replace(/^[[【]+/, '').replace(/[\]】]+$/, ''); }

/**
 * 独立「意见反馈」页 /feedback/ —— 无整站导航/页脚，聚焦单卡片，适合 App 内 H5 打开。
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
  const [diag, setDiag] = useState('');
  const [fromApp, setFromApp] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const strings = resolveFeedbackStrings();
    const resolved = resolveFeedbackApp();
    const collected = collectFeedbackDiagnostics(strings);
    setT(strings); setApp(resolved.app); setStore(resolved.store);
    setDiag(collected.text); setFromApp(collected.fromApp);
  }, []);

  const mailto = buildFeedbackMailto(app.email, subjectFor(app, t), t, diag, msg);

  return <div className="fb-page">
    <ThemeToggle />
    <main className="fb-shell">
      <span className="fb-brand"><span className="fb-star" aria-hidden="true">✦</span>{app.name}</span>
      <h1 className="fb-title">{t.title}</h1>
      <p className="fb-intro">{t.intro}</p>

      <div className="fb-card">
        <textarea
          className="fb-textarea"
          value={msg}
          onChange={(event) => setMsg(event.target.value)}
          placeholder={placeholderFor(t)}
          aria-label={t.title}
          rows={6}
        />
        <div className="fb-email"><span>{t.emailLabel}</span><a className="linkish" href={`mailto:${app.email}`}>{app.email}</a></div>
        {fromApp && diag && <pre className="fb-diag" aria-label={t.deviceLabel}>{diag}</pre>}
      </div>

      <div className="fb-actions">
        <a className="btn-primary fb-send" href={mailto}>{t.button}</a>
        {store && <a className="btn-ghost fb-rate" href={store.url} target="_blank" rel="noreferrer">{t.rate} · {store.name} ↗</a>}
      </div>

      <a className="fb-foot" href="/">sxxw.site</a>
    </main>
  </div>;
}
