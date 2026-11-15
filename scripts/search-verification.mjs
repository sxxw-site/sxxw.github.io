import { readFileSync } from 'node:fs';

// These are deliberately public ownership proofs, never account credentials.
export function searchVerificationHead(config = JSON.parse(readFileSync(new URL('../config/search-verification.json', import.meta.url), 'utf8'))) {
  return [['google', 'google-site-verification'], ['bing', 'msvalidate.01']].flatMap(([key, name]) => {
    const value = config[key]?.trim();
    if (!value) return [];
    if (!/^[A-Za-z0-9_-]{1,512}$/.test(value)) throw new Error(`Invalid ${key} search verification code. Paste only the content value.`);
    return [`<meta name="${name}" content="${value}">`];
  }).join('');
}
