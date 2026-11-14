import { useEffect, useState } from 'react';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { MIGRATE_FALLBACK, TIMETRAILS_APPSTORE_URL, resolveMigrateStrings, type MigrateStrings } from '../lib/migrate';
import { timeTrailsScreenshot } from '../lib/timetrails';
import { previewImage } from '../lib/app-preview';
import '../styles/utility-pages.css';

/**
 * 独立「数据迁移」引导页 /migrate/ —— 引导「出行轨迹」用户把数据迁移到新版「足迹-时光轨迹」。
 * 网站与 App 内 H5 共用，embed=1 时隐藏整站外壳（出行轨迹「更多」里打开）。
 * App 端示例：/migrate/?from=traceapp&lang=zh-Hans&embed=1
 * 纯说明页，不读取任何用户数据；迁移动作在「足迹」App 内完成。
 */
export default function MigratePage() {
  const [t, setT] = useState<MigrateStrings>(MIGRATE_FALLBACK);
  const [language, setLanguage] = useState('zh-hans');

  useEffect(() => {
    setT(resolveMigrateStrings());
    setLanguage((new URLSearchParams(window.location.search).get('lang') || 'zh-hans').trim().replace(/_/g, '-').toLowerCase());
  }, []);
  const isChinese = language.startsWith('zh') || language === 'yue';

  const steps: Array<[string, string]> = [
    [t.s1t, t.s1d],
    [t.s2t, t.s2d],
    [t.s3t, t.s3d],
  ];
  return <div className="utility-page utility-migrate">
    <SiteHeader active="support" />
    <main className="utility-shell" id="page-content" tabIndex={-1}>
      <header className="utility-migrate-hero">
        <div className="utility-intro">
          <p className="utility-eyebrow">出行轨迹 <span aria-hidden="true">→</span> TimeTrails</p>
          <h1 className="fb-title">{t.title}</h1>
          <p className="fb-intro">{t.intro}</p>
          <p className="utility-migrate-label">{isChinese ? '按以下 3 步迁移轨迹' : 'Move your trails in 3 steps'}</p>
        </div>
        <div className="utility-migrate-preview">
          <img {...previewImage(timeTrailsScreenshot(language === 'yue' ? 'zh-hant' : language, 'overview'), '(max-width: 520px) 144px, 180px')} alt={isChinese ? '足迹-时光轨迹的轨迹总览界面' : 'TimeTrails trail overview screen'} width={1320} height={2868} />
        </div>
      </header>

      <ol className="mig-steps" aria-label={isChinese ? '数据迁移步骤' : 'Data migration steps'}>
        {steps.map(([title, detail], i) => <li className="mig-step" key={title}>
          <span className="mig-num" aria-hidden="true">0{i + 1}</span>
          <div className="mig-body">
            <h2 className="mig-step-title">{title}</h2>
            <p className="mig-step-detail">{detail}</p>
            {i === 0 && <a className="btn-primary utility-migrate-download" href={TIMETRAILS_APPSTORE_URL} target="_blank" rel="noreferrer">{t.getApp}<span aria-hidden="true">↗</span></a>}
            {i === 2 && <p className="utility-folder-path"><code>{isChinese ? '文件 › 我的 iPhone › 出行轨迹 › db' : 'Files › On My iPhone › 出行轨迹 › db'}</code></p>}
          </div>
        </li>)}
      </ol>

      <aside className="mig-notes" aria-labelledby="migration-notes-title">
        <h2 className="utility-section-title" id="migration-notes-title">{t.notesTitle}</h2>
        <ul><li>{t.noteMerge}</li><li>{t.noteLocal}</li></ul>
      </aside>
    </main>
    <SiteFooter />
  </div>;
}
