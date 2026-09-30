import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const url = process.argv[2];
if (!url) throw new Error('Usage: node scripts/release/browser.mjs <site-url>');
mkdirSync('.artifacts/release', { recursive: true });
// Software WebGL2 without WebGPU: the fallback every visitor can reach.
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => [...document.querySelectorAll('canvas')].some(canvas => canvas.width >= 200 && canvas.height >= 200), undefined, { timeout: 60000 });
  await page.waitForTimeout(3000);
  assert.deepEqual(errors, []);
  await page.screenshot({ path: '.artifacts/release/browser.png' });
  writeFileSync('.artifacts/release/browser.json', JSON.stringify({ url, backend: 'WebGL2', gpuClass: 'software', errors }, null, 2));
} finally { await browser.close(); }
