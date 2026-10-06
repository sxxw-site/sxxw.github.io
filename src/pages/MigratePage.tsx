import { useEffect, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { MIGRATE_FALLBACK, TIMETRAILS_APPSTORE_URL, resolveMigrateStrings, type MigrateStrings } from '../lib/migrate';

/**
 * 独立「数据迁移」引导页 /migrate/ —— 引导「出行轨迹」用户把数据迁移到新版「足迹|TimeTrails」。
 * 无整站外壳，聚焦单卡片，适合 App 内 H5 打开（出行轨迹「更多」里打开）。
 * App 端示例：/migrate/?from=traceapp&lang=zh-Hans&embed=1
 * 纯说明页，不读取任何用户数据；迁移动作在「足迹」App 内完成。
 */
export default function MigratePage() {
  const [t, setT] = useState<MigrateStrings>(MIGRATE_FALLBACK);

  useEffect(() => { setT(resolveMigrateStrings()); }, []);

  const steps: Array<[string, string]> = [
    [t.s1t, t.s1d],
    [t.s2t, t.s2d],
    [t.s3t, t.s3d],
  ];
  const notes: Array<[string, string]> = [
    ['⇄', t.noteMerge],
    ['◆', t.noteLocal],
  ];

  return <div className="fb-page">
    <ThemeToggle />
    <main className="fb-shell">
      <span className="fb-brand"><span className="fb-star" aria-hidden="true">✦</span>出行轨迹 → TimeTrails</span>
      <h1 className="fb-title">{t.title}</h1>
      <p className="fb-intro">{t.intro}</p>

      <ol className="mig-steps">
        {steps.map(([title, detail], i) => <li className="mig-step" key={i}>
          <span className="mig-num" aria-hidden="true">{i + 1}</span>
          <div className="mig-body">
            <p className="mig-step-title">{title}</p>
            <p className="mig-step-detail">{detail}</p>
          </div>
        </li>)}
      </ol>

      <div className="fb-card mig-notes">
        <p className="fb-community-title">{t.notesTitle}</p>
        {notes.map(([mark, text], i) => <div className="mig-note" key={i}>
          <span className="mig-note-mark" aria-hidden="true">{mark}</span>
          <span className="mig-note-text">{text}</span>
        </div>)}
      </div>

      <div className="fb-actions">
        <a className="btn-primary fb-send" href={TIMETRAILS_APPSTORE_URL} target="_blank" rel="noreferrer">{t.getApp} ↗</a>
      </div>

      <a className="fb-foot" href="/">sxxw.site</a>
    </main>
  </div>;
}
