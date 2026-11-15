import { useEffect, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import '../styles/document-layout.css';

type DocumentSection = { title: string; body: string[] };

export default function DocumentLayout({ title, eyebrow, meta, intro, sections, children, contentLanguage = 'zh-Hans' }: { title: string; eyebrow?: string; meta?: ReactNode; intro?: ReactNode; sections: DocumentSection[]; children?: ReactNode; contentLanguage?: string }) {
  const { language } = useI18n();
  const zh = language.normalizedCode.startsWith('zh') || language.normalizedCode === 'yue';
  const [tocOpen, setTocOpen] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 900px)');
    const update = () => setTocOpen(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <article className="document-layout">
    <header className="document-header">{eyebrow && <p className="page-eyebrow">{eyebrow}</p>}<div className="document-title-row"><h2>{title}</h2><button className="document-print" type="button" onClick={() => window.print()}>{zh ? '打印文档' : 'Print document'}</button></div>{meta && <div className="document-meta" lang={contentLanguage} dir="ltr">{meta}</div>}{intro && <div className="document-intro" lang={contentLanguage} dir="ltr">{typeof intro === 'string' ? <p>{intro}</p> : intro}</div>}</header>
    <div className="document-grid"><aside className="document-sidebar"><details className="document-toc" open={tocOpen} onToggle={(event) => setTocOpen(event.currentTarget.open)}><summary>{zh ? '文档目录' : 'Contents'}</summary><nav aria-label={zh ? '文档章节' : 'Document sections'}>{sections.map((section, index) => <a href={`#document-section-${index + 1}`} key={index}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.title}</a>)}</nav></details></aside>
      <div className="document-body" lang={contentLanguage} dir="ltr">{sections.map((section, index) => <section id={`document-section-${index + 1}`} tabIndex={-1} key={index}><h3>{section.title}</h3>{section.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</section>)}{children && <div className="document-afterword">{children}</div>}</div>
    </div>
  </article>;
}
