import { localizedSiteHref } from '../lib/site-navigation';

const ENGLISH_LANGUAGES = new Set(['en', 'en-au', 'en-ca', 'en-gb', 'en-in']);

const copy = {
  zh: {
    title: '局域网传输与文件导入',
    intro: '在电脑上传文件后，还需要回到手机确认导入。以下步骤适用于 iPhone 上的时光轨迹。',
    formatsLink: '查看文件要求和其他导入方式',
    steps: [
      { title: '手机和电脑连接同一网络', body: '让手机和电脑连接同一 Wi-Fi 或局域网。传输和导入期间，保持时光轨迹在手机前台运行。' },
      { title: '在手机启动传输服务', body: '在“更多”中点“数据同步”，进入“局域网传输”页面后点“启动服务”。默认端口为 9527；请使用 App 页面实际显示的完整地址。' },
      { title: '在电脑上传文件', body: '在电脑浏览器打开手机显示的地址，上传兼容的 .db 或 .gpx 文件。上传完成后，文件会出现在手机的导入列表中，此时尚未写入轨迹数据库。' },
      { title: '在手机识别并确认导入', body: '回到手机，点列表中的文件，再按识别结果继续。若识别为时光轨迹当前数据库，先保留现有数据的备份，阅读比较结果，再选择“全量覆盖”或“增量覆盖（补充缺少的数据）”。' },
    ],
    formatsTitle: '文件要求与“文件”App 导入',
    migrationLink: '查看旧版“出行轨迹”的同机迁移步骤',
    notes: [
      { label: 'DB', title: '数据库需要兼容', body: '.db 文件需要采用时光轨迹自身格式，或兼容的旧版 WCDB 格式。文件后缀相同，不代表任意 SQLite 数据库都能导入。' },
      { label: 'GPX', title: '轨迹点需要时间信息', body: 'GPX 导入读取 trkpt 和 wpt 中的带时间数据点。没有时间信息的点会被跳过，因此导入后的点数可能少于原文件。' },
      { label: 'iOS', title: '也可以从“文件”App 打开', body: '在“文件”App 选择兼容文件，通过共享或打开方式交给时光轨迹。App 会把文件复制到本机导入列表；进入列表后，仍需点文件识别并确认导入。' },
    ],
  },
  en: {
    title: 'Transfer and import files',
    intro: 'Uploading a file from your computer is the first step. Confirm its import on your iPhone to add the data to TimeTrails.',
    formatsLink: 'Check file requirements and other import options',
    steps: [
      { title: 'Connect both devices to the same network', body: 'Connect your iPhone and computer to the same Wi-Fi or local network. Keep TimeTrails open in the foreground on your iPhone during transfer and import.' },
      { title: 'Start the transfer service on your iPhone', body: 'Open More → Data Sync. On the Local Area Network Transfer screen, tap Start Service. The default port is 9527; use the complete address shown in the app.' },
      { title: 'Upload the file from your computer', body: 'Open that address in your computer’s browser and upload a compatible .db or .gpx file. The file appears in the import list on your iPhone. Uploading alone does not add it to your route database.' },
      { title: 'Review and confirm the import on your iPhone', body: 'Tap the file in the list and follow the recognized import option. If recognized as a current TimeTrails database, keep a backup of your current data and review the comparison before choosing Full Overwrite or Incremental (Add Missing Data).' },
    ],
    formatsTitle: 'File requirements and the Files app',
    migrationLink: 'Read the separate migration steps for the older TraceApp',
    notes: [
      { label: 'DB', title: 'Use a compatible database', body: 'A .db file must use the TimeTrails format or a compatible older WCDB format. A matching filename extension does not make every SQLite database importable.' },
      { label: 'GPX', title: 'Route points need timestamps', body: 'GPX import reads timestamped trkpt and wpt points. Points without time information are skipped, so the imported point count can be smaller than the count in the original file.' },
      { label: 'iOS', title: 'Open a file from the Files app', body: 'In Files, share or open a compatible file with TimeTrails. The app copies it into its local import list. Tap the file there to recognize and confirm the import.' },
    ],
  },
};

export default function TimeTrailsImportGuide({ language }: { language: string }) {
  // These instructions are authored in Simplified Chinese and English only.
  if (language !== 'zh-hans' && !ENGLISH_LANGUAGES.has(language)) return null;
  const chinese = language === 'zh-hans';
  const content = chinese ? copy.zh : copy.en;
  const contentLanguage = chinese ? 'zh-Hans' : 'en';

  return <>
    <section className="product-section product-guide" id="data-import" lang={contentLanguage} aria-labelledby="data-import-title">
      <div className="product-section-heading">
        <p className="page-eyebrow">TimeTrails</p>
        <h2 id="data-import-title">{content.title}</h2>
        <p>{content.intro}</p>
        <a href="#data-import-formats">{content.formatsLink} <span aria-hidden="true">↓</span></a>
      </div>
      <ol className="product-guide-list">
        {content.steps.map((step, index) => <li key={step.title}>
          <span className="product-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div><h3>{step.title}</h3><p>{step.body}</p></div>
        </li>)}
      </ol>
    </section>
    <section className="product-section product-guide" id="data-import-formats" lang={contentLanguage} aria-labelledby="data-import-formats-title">
      <div className="product-section-heading">
        <p className="page-eyebrow">DB · GPX · iOS</p>
        <h2 id="data-import-formats-title">{content.formatsTitle}</h2>
        <a href={localizedSiteHref(language, '/migrate/')}>{content.migrationLink} <span aria-hidden="true">↗</span></a>
      </div>
      <ul className="product-guide-list">
        {content.notes.map((note) => <li key={note.label}>
          <span className="product-step" aria-hidden="true">{note.label}</span>
          <div><h3>{note.title}</h3><p>{note.body}</p></div>
        </li>)}
      </ul>
    </section>
  </>;
}
