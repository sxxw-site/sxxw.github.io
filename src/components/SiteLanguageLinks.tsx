import '../styles/site-language-links.css';

/** Plain links keep both official language entrances available without JavaScript. */
export default function SiteLanguageLinks() {
  return <nav className="site-language-links" aria-label="Website language">
    <a href="/" hrefLang="zh-Hans" lang="zh-Hans">简体中文</a>
    <a href="/en/" hrefLang="en" lang="en">English</a>
  </nav>;
}
