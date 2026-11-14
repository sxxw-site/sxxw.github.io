import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { isSiteStyle, readSiteStyle, setSiteStyle, STYLE_CHANGE_EVENT, STYLE_OPTIONS, type SiteStyleId } from '../lib/site-style';
import '../styles/style-switcher.css';

export default function StyleSwitcher({ inHeader = false }: { inHeader?: boolean }) {
  const { language } = useI18n();
  const chinese = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  const [active, setActive] = useState(readSiteStyle);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const selected = STYLE_OPTIONS.find((option) => option.id === active)!;
  const title = chinese ? '外观' : 'Appearance';

  useEffect(() => {
    const onChange = (event: Event) => {
      const value = (event as CustomEvent<SiteStyleId>).detail;
      if (isSiteStyle(value)) setActive(value);
    };
    window.addEventListener(STYLE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(STYLE_CHANGE_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return <div className={`style-switcher${inHeader ? ' in-header' : ''}`} ref={root}>
    <button className="style-switcher-trigger" type="button" ref={trigger} aria-label={`${title}：${chinese ? selected.name : selected.nameEn}`} title={title} aria-expanded={open} aria-controls={panelId} onClick={() => { if (!open) window.dispatchEvent(new Event('sxxw-appearance-open')); setOpen((value) => !value); }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.1a2 2 0 0 0 1.5-3.3 1.7 1.7 0 0 1 1.3-2.8H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7" cy="11" r=".8" fill="currentColor"/><circle cx="10" cy="7" r=".8" fill="currentColor"/><circle cx="15" cy="7.5" r=".8" fill="currentColor"/></svg>
    </button>
    {open && <section className="style-switcher-panel" id={panelId} aria-label={title}>
      <h2>{title}</h2>
      <div className="style-switcher-options" role="group" aria-label={chinese ? '选择页面主题' : 'Choose a site style'}>{STYLE_OPTIONS.map((option, index) => <button type="button" key={option.id} aria-pressed={active === option.id} onClick={() => setSiteStyle(option.id)}>
        <span className="style-switcher-swatch" aria-hidden="true">{option.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span>
        <span className="style-switcher-copy"><strong>{String.fromCharCode(65 + index)} · {chinese ? option.name : option.nameEn}</strong><span>{chinese ? option.summary : option.summaryEn}</span></span>
        <span className="style-switcher-check" aria-hidden="true">{active === option.id ? '✓' : ''}</span>
      </button>)}</div>
    </section>}
  </div>;
}
