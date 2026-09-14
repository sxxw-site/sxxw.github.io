import { useI18n } from '../i18n/I18nProvider';

export default function LanguageSelect() {
  const { language, languages, setLanguage } = useI18n();
  return <div className="lang-wrap" aria-label="Language switcher">
    <select className="lang-select" aria-label="Language" value={language.normalizedCode} onChange={(event) => setLanguage(event.target.value)}>
      {languages.map((item) => <option key={item.normalizedCode} value={item.normalizedCode}>{item.label}</option>)}
    </select>
    <span className="lang-caret">▾</span>
  </div>;
}
