import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { contentFingerprint, sitemapHistory } from './seo-history.mjs';
import { indexingPolicy } from './seo-policy.mjs';

const origin = 'https://sxxw.site';
const html = (content = 'Daily routes', assets = 'first') => `<!doctype html><html lang="en"><head><title>TimeTrails</title><meta name="description" content="GPS route tracker"><link rel="canonical" href="${origin}/"><link rel="stylesheet" href="/${assets}.css"><script type="application/ld+json">{"@type":"WebPage","name":"TimeTrails"}</script></head><body><header>Menu</header><main class="${assets}"><h1>${content}</h1><a href="/apps/timetrails/">Product</a><img src="/map.png" alt="Route history"></main><footer>2026</footer><script src="/${assets}.js"></script></body></html>`;

test('fingerprints track content, product links, image descriptions and structured facts, rather than rebuilt assets', () => {
  const initial = html();
  assert.equal(contentFingerprint(initial), contentFingerprint(html('Daily routes', 'second')));
  assert.equal(contentFingerprint(initial), contentFingerprint(initial.replace('<footer>2026', '<footer>2027')));
  for (const changed of [
    html('Lifetime travel map'),
    initial.replace('content="GPS route tracker"', 'content="Daily GPS route tracker"'),
    initial.replace('href="/apps/timetrails/"', 'href="/apps/timetrails/getting-started/"'),
    initial.replace('alt="Route history"', 'alt="Your daily route history"'),
    initial.replace('"name":"TimeTrails"', '"name":"TimeTrails GPS Route Tracker"'),
  ]) assert.notEqual(contentFingerprint(initial), contentFingerprint(changed));
});

test('published history keeps truthful dates across later builds and starts without inventing old dates', () => {
  const oldCwd = process.cwd();
  const dir = mkdtempSync(join(tmpdir(), 'sxxw-seo-history-'));
  const commit = () => {
    execFileSync('git', ['add', 'docs'], { stdio: 'ignore' });
    execFileSync('git', ['-c', 'user.name=SEO test', '-c', 'user.email=seo-test@example.invalid', 'commit', '--quiet', '-m', 'fixture'], { stdio: 'ignore' });
  };
  try {
    process.chdir(dir);
    execFileSync('git', ['init', '--quiet'], { stdio: 'ignore' });
    mkdirSync('docs');
    writeFileSync('docs/index.html', html());
    commit();
    const first = sitemapHistory('docs', origin, '2026-11-15');
    assert.equal(first.record(`${origin}/`, html()), undefined);
    const changed = sitemapHistory('docs', origin, '2026-11-15');
    assert.equal(changed.record(`${origin}/`, html('Lifetime travel map')), '2026-11-15');
    assert.equal(changed.record(`${origin}/en/`, html('New English page')), '2026-11-15');
    writeFileSync('docs/index.html', html('Lifetime travel map'));
    writeFileSync(`docs/${changed.filename}`, changed.serialize());
    commit();
    const later = sitemapHistory('docs', origin, '2026-12-01');
    assert.equal(later.record(`${origin}/`, html('Lifetime travel map', 'new-assets')), '2026-11-15');
    const laterChange = sitemapHistory('docs', origin, '2026-12-01');
    assert.equal(laterChange.record(`${origin}/`, html('Updated daily route history')), '2026-12-01');
  } finally {
    process.chdir(oldCwd);
    rmSync(dir, { force: true, recursive: true });
  }
});

test('search results are crawlable but excluded from indexing; untranslated legal pages have one canonical', () => {
  assert.equal(indexingPolicy('/search/', 'en').index, false);
  assert.equal(indexingPolicy('/search/', 'en').sitemap, false);
  assert.equal(indexingPolicy('/search/', 'en').alternates, false);
  for (const path of ['/apps/timetrails/privacy/', '/apps/traceapp/terms/', '/apps/memoria/ios/privacy/', '/apps/memoria/harmony/terms/']) {
    assert.equal(indexingPolicy(path, 'en').canonicalLanguage, 'zh-hans');
    assert.equal(indexingPolicy(path, 'en').sitemap, false);
    assert.equal(indexingPolicy(path, 'en').alternates, false);
    assert.equal(indexingPolicy(path, 'zh-hans').sitemap, true);
  }
  for (const path of ['/', '/about/', '/contact/', '/apps/timetrails/']) {
    assert.equal(indexingPolicy(path, 'en').canonicalLanguage, 'en');
    assert.equal(indexingPolicy(path, 'en').sitemap, true);
    assert.equal(indexingPolicy(path, 'en').alternates, true);
  }
});
