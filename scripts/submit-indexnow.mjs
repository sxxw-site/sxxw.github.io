import { readFileSync } from 'node:fs';

const origin = 'https://sxxw.site';
const keyLocation = `${origin}/indexnow.txt`;
// IndexNow proves site ownership through this deliberately public verification file.
const key = readFileSync(new URL('../public/indexnow.txt', import.meta.url), 'utf8').trim();
if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('Invalid IndexNow verification file.');
const args = process.argv.slice(2);
const supplied = args.filter((arg) => arg !== '--dry-run');
const priorityPages = ['/', '/apps/', '/apps/timetrails/', ...['en', 'en-au', 'en-ca', 'en-gb', 'en-in'].flatMap((language) => [`/${language}/`, `/${language}/apps/timetrails/`])];
const urlList = [...new Set((supplied.length ? supplied : priorityPages).map((path) => {
  const url = new URL(path, origin);
  if (url.origin !== origin || url.username || url.password || url.search || url.hash) throw new Error('Submit canonical URLs from sxxw.site only.');
  return url.href;
}))];
if (urlList.length > 10000) throw new Error('IndexNow accepts at most 10,000 URLs per request.');
if (args.includes('--dry-run')) {
  console.log(JSON.stringify({ host: 'sxxw.site', keyLocation, urlList }, null, 2));
} else {
  const proof = await fetch(keyLocation, { signal: AbortSignal.timeout(30000), redirect: 'error' });
  if (!proof.ok || (await proof.text()).trim() !== key) throw new Error('Publish the matching verification file before submitting.');
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'sxxw.site', key, keyLocation, urlList }), signal: AbortSignal.timeout(30000),
  });
  if (response.status !== 200 && response.status !== 202) throw new Error(`IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  console.log(`IndexNow HTTP ${response.status}: received ${urlList.length} URLs${response.status === 202 ? '; ownership validation pending' : ''}. Receipt does not guarantee indexing or ranking.`);
}
