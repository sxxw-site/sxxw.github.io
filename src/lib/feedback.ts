import feedbackI18n from '../content/feedback.i18n.json';

// 共用「意见反馈」文案（全站 40+ 语言）。App 通过 query 传入 lang，无则跟随中文站。
export interface FbStrings {
  title: string; intro: string; emailLabel: string; deviceLabel: string; button: string;
  subject: string; problem: string; steps: string; diagHeader: string;
  dApp: string; dDevice: string; dOS: string; dLang: string; na: string; colon: string; rate: string;
}

export const FEEDBACK_I18N: Record<string, FbStrings> = feedbackI18n as Record<string, FbStrings>;
export const FEEDBACK_FALLBACK: FbStrings = FEEDBACK_I18N['zh-hans'];

// 旧式/别名代码 → 词条键
const LANG_ALIAS: Record<string, string> = { iw: 'he', in: 'id', no: 'nb', nn: 'nb' };

/** 由 App 传入的 lang（无则跟随中文站）解析反馈词条。 */
export function resolveFeedbackStrings(): FbStrings {
  if (typeof window === 'undefined') return FEEDBACK_FALLBACK;
  const raw = (new URLSearchParams(window.location.search).get('lang') || '').trim().replace(/_/g, '-').toLowerCase();
  if (!raw) return FEEDBACK_FALLBACK;
  if (raw.startsWith('zh') || raw === 'yue') {
    return FEEDBACK_I18N[/hant|hk|tw|mo|yue/.test(raw) ? 'zh-hant' : 'zh-hans'];
  }
  const base = raw.split('-')[0];
  const key = LANG_ALIAS[base] || base;
  return FEEDBACK_I18N[key] || FEEDBACK_I18N['en'];
}

/** 从 URL query（App 打开时带上）+ 浏览器 UA 收集诊断信息。SSR 时返回空。 */
export function collectFeedbackDiagnostics(t: FbStrings): { text: string; fromApp: boolean } {
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

export function buildFeedbackMailto(email: string, subject: string, t: FbStrings, diag: string, message?: string): string {
  const typed = (message ?? '').trim();
  const body = (typed
    ? `${typed}\n\n`
    : `${t.problem}\n\n\n${t.steps}\n\n\n`) +
    (diag ? `${t.diagHeader}\n${diag}\n` : '');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---- App 注册表：邮箱 + 各商店「评价」深链（按应用区分） ----

export type StoreKey = 'appstore' | 'huawei';
export interface StoreEntry { name: string; url: string }
export interface FeedbackApp {
  name: string;
  email: string;
  stores: Partial<Record<StoreKey, StoreEntry>>;
  defaultStore: StoreKey;
}

export const FEEDBACK_APPS: Record<string, FeedbackApp> = {
  memoria: {
    name: 'Memoria · 拾忆',
    email: 'neverfall@foxmail.com',
    stores: {
      appstore: { name: 'App Store', url: 'https://apps.apple.com/app/id6760106574?action=write-review' },
      huawei: { name: '华为应用市场', url: 'https://appgallery.huawei.com/app/C6917613545100329502' },
    },
    defaultStore: 'appstore',
  },
  timetrails: {
    name: '时光轨迹 TimeTrails',
    email: 'neverfall@foxmail.com',
    stores: { appstore: { name: 'App Store', url: 'https://apps.apple.com/app/id6752662508?action=write-review' } },
    defaultStore: 'appstore',
  },
  traceapp: {
    name: '出行轨迹 TraceApp',
    email: 'flywithbug@163.com',
    stores: { appstore: { name: 'App Store', url: 'https://apps.apple.com/app/id1634761411?action=write-review' } },
    defaultStore: 'appstore',
  },
};

// 未识别到 app 时的通用兜底（不显示商店评价按钮）
export const FEEDBACK_GENERIC: FeedbackApp = {
  name: '树下小屋',
  email: 'house@sxxw.site',
  stores: {},
  defaultStore: 'appstore',
};

/** 解析当前应用与要跳转的商店（app 未知则用通用兜底）。SSR 返回通用兜底。 */
export function resolveFeedbackApp(): { app: FeedbackApp; store?: StoreEntry } {
  if (typeof window === 'undefined') return { app: FEEDBACK_GENERIC, store: undefined };
  const q = new URLSearchParams(window.location.search);
  const appKey = (q.get('app') || '').trim().toLowerCase();
  const app = FEEDBACK_APPS[appKey] || FEEDBACK_GENERIC;
  const platform = (q.get('platform') || '').toLowerCase();
  const storeParam = (q.get('store') || '').toLowerCase();
  let key: StoreKey = app.defaultStore;
  if (storeParam === 'huawei' || storeParam === 'appgallery' || platform === 'harmony' || platform === 'harmonyos') key = 'huawei';
  else if (storeParam === 'appstore' || storeParam === 'ios') key = 'appstore';
  return { app, store: app.stores[key] || app.stores[app.defaultStore] };
}
