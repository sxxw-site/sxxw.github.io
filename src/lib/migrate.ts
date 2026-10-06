import migrateI18n from '../content/migrate.i18n.json';

// 「数据迁移」引导页文案（出行轨迹 → 足迹/TimeTrails）。App 通过 query 传入 lang，无则跟随中文站。
export interface MigrateStrings {
  title: string; intro: string;
  s1t: string; s1d: string; s2t: string; s2d: string; s3t: string; s3d: string;
  notesTitle: string; noteMerge: string; noteLocal: string; getApp: string;
}

export const MIGRATE_I18N: Record<string, MigrateStrings> = migrateI18n as Record<string, MigrateStrings>;
export const MIGRATE_FALLBACK: MigrateStrings = MIGRATE_I18N['zh-hans'];

// 足迹|TimeTrails 的 App Store 地址
export const TIMETRAILS_APPSTORE_URL = 'https://apps.apple.com/app/id6752662508';

// 旧式/别名代码 → 词条键
const LANG_ALIAS: Record<string, string> = { iw: 'he', in: 'id', no: 'nb', nn: 'nb' };

/** 由 App 传入的 lang（无则跟随中文站）解析迁移页词条。 */
export function resolveMigrateStrings(): MigrateStrings {
  if (typeof window === 'undefined') return MIGRATE_FALLBACK;
  const raw = (new URLSearchParams(window.location.search).get('lang') || '').trim().replace(/_/g, '-').toLowerCase();
  if (!raw) return MIGRATE_FALLBACK;
  if (raw.startsWith('zh') || raw === 'yue') {
    return MIGRATE_I18N[/hant|hk|tw|mo|yue/.test(raw) ? 'zh-hant' : 'zh-hans'];
  }
  const base = raw.split('-')[0];
  const key = LANG_ALIAS[base] || base;
  return MIGRATE_I18N[key] || MIGRATE_I18N['en'];
}
