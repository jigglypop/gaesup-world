import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';

const [base, commit] = process.argv.slice(2);
if (!base) throw new Error('Usage: node scripts/probe-minihome-release.mjs <url> [commit]');
const root = base.endsWith('/') ? base : `${base}/`;
const output = '.artifacts/minihome-release';
mkdirSync(output, { recursive: true });
let version;
for (let attempt = 0; attempt < 12; attempt++) {
  const response = await fetch(`${root}version.json?check=${Date.now()}`, { cache: 'no-store' });
  if (response.ok) version = await response.json();
  if (!commit || version?.commit === commit) break;
  await new Promise(resolve => setTimeout(resolve, 5000));
}
assert.ok(version?.version);
if (commit) { assert.equal(version.commit, commit); assert.equal(version.dirty, false); }
for (const route of ['', 'engine/', 'performance/']) {
  const response = await fetch(new URL(route, root));
  assert.equal(response.status, 200, route);
  assert.match(await response.text(), /<div id="root"/);
}
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(`${root}?renderer=webgl`);
  await page.waitForFunction(() => window.miniroom?.diagnostics().environment?.grassInstances > 30000, null, { timeout: 90000 });
  const initial = await page.evaluate(() => window.miniroom.diagnostics());
  assert.equal(initial.backend, 'WebGL2');
  await page.getByRole('button', { name: /공간 꾸미기/ }).click();
  await page.getByLabel('땅 확장', { exact: true }).click();
  await page.getByRole('button', { name: '미니홈피 저장', exact: true }).click();
  await page.reload();
  await page.waitForFunction(() => window.miniroom?.diagnostics().terrain.size === 32, null, { timeout: 90000 });
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.evaluate(() => document.querySelector('canvas').clientWidth <= innerWidth), true);
  await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
  assert.deepEqual(errors, []);
  const evidence = { url: root, version, backend: initial.backend, gpuClass: 'software', grassInstances: initial.environment.grassInstances, expandSaveReload: true, mobileOverflow: false, errors };
  writeFileSync(`${output}/evidence.json`, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
} finally { await browser.close(); }
