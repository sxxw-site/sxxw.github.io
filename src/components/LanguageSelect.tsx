import { useI18n } from '../i18n/I18nProvider';

export default function LanguageSelect() {
  const { language, languages, setLanguage } = useI18n();
  const label = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue' ? '语言' : 'Language';
  return <label className="lang-wrap">
    <span className="lang-label">{label}</span>
    <select className="lang-select" value={language.normalizedCode} onChange={(event) => setLanguage(event.target.value)}>
      {languages.map((item) => <option key={item.normalizedCode} value={item.normalizedCode}>{item.label}</option>)}
    </select>
    <span className="lang-caret">▾</span>
  </label>;
}
