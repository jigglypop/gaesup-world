import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const url = process.argv[2];
if (!url) throw new Error('Usage: node scripts/release/browser.mjs <site-url>');
mkdirSync('.artifacts/release', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.locator('[data-renderer="WebGL2"]').waitFor({ timeout: 60000 });
  await page.getByLabel('미니룸 아바타', { exact: true }).selectOption('coral');
  await page.waitForFunction(() => window.miniroom?.diagnostics().avatar.style === 'coral', undefined, { timeout: 60000 });
  await page.getByLabel('미니룸 조명', { exact: true }).selectOption('evening');
  await page.getByRole('button', { name: '미니홈피 저장' }).click();
  await page.reload();
  await page.waitForFunction(() => window.miniroom?.diagnostics().avatar.style === 'coral', undefined, { timeout: 60000 });
  assert.equal(await page.getByLabel('미니룸 조명', { exact: true }).inputValue(), 'evening');
  assert.deepEqual(errors, []);
  await page.screenshot({ path: '.artifacts/release/browser.png', fullPage: true });
  writeFileSync('.artifacts/release/browser.json', JSON.stringify({ url, backend: 'WebGL2', gpuClass: 'software', avatar: 'coral', saveReload: true, errors }, null, 2));
} finally { await browser.close(); }
