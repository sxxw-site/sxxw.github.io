import assert from 'node:assert/strict';
import test from 'node:test';
import { openGraphLocale } from './open-graph.mjs';

test('authored Harbor body languages produce complete Open Graph locales', () => {
  for (const [language, expected] of [
    ['zh-Hans', 'zh_CN'], ['en', 'en_US'], ['ja', 'ja_JP'],
    ['ko', 'ko_KR'], ['fr', 'fr_FR'], ['ar', 'ar_EG'],
  ]) assert.equal(openGraphLocale(language), expected, language);
});

test('script and explicit territory distinguish Chinese content versions', () => {
  assert.equal(openGraphLocale('zh-Hant'), 'zh_TW');
  assert.equal(openGraphLocale('zh-HK'), 'zh_HK');
  assert.equal(openGraphLocale('zh-Hant-HK'), 'zh_HK');
});

test('existing regional locales retain their authored territory', () => {
  for (const [language, expected] of [
    ['en-GB', 'en_GB'], ['fr-CA', 'fr_CA'], ['ar-SA', 'ar_SA'],
    ['es-419', 'es_419'], ['en_AU', 'en_AU'],
  ]) assert.equal(openGraphLocale(language), expected, language);
});
