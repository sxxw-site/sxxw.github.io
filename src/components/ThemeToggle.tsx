import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function preferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('sxxw-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const t = document.documentElement.dataset.theme;
    if (t === 'light' || t === 'dark') return t;
  }
  return 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => setTheme(preferredTheme()), []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('sxxw-theme', theme);
  }, [theme]);

  return <button className="theme-toggle" type="button" aria-label={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'} onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}><span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span><span>{theme === 'dark' ? '浅色' : '深色'}</span></button>;
}
