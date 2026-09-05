const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

(async () => {
  const { build, preview } = await import('vite');
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-lazy-assets-'));
  await build({ build: { outDir: outputRoot, emptyOutDir: true, manifest: true }, logLevel: 'warn' });
  const manifest = JSON.parse(fs.readFileSync(path.join(outputRoot, '.vite/manifest.json'), 'utf8'));
  const assetChunk = manifest['examples/pages/AssetsPage.tsx'].file;
  const server = await preview({ configFile: false, build: { outDir: outputRoot }, preview: { host: '127.0.0.1', port: 0 }, logLevel: 'warn' });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(new URL(request.url()).pathname));
    await page.goto(server.resolvedUrls.local[0]);
    await expect(page.getByRole('heading', { name: '나만의 공간을 만들고, 함께 즐겨요.', exact: true })).toBeVisible();
    process.stdout.write(await page.locator('body').ariaSnapshot() + '\n');
    assert.equal(requests.includes('/' + assetChunk), false, 'Home must not request the asset page chunk');
    const assetsLink = page.getByRole('link', { name: '에셋', exact: true });
    await expect(assetsLink).toHaveCount(1);
    await assetsLink.click();
    await expect(page.getByRole('heading', { name: '에셋 둘러보기', exact: true })).toBeVisible();
    assert.equal(requests.includes('/' + assetChunk), true, 'Asset navigation must load the deferred chunk');
    process.stdout.write(await page.getByRole('main').ariaSnapshot() + '\n');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, 'Mobile asset page must not overflow horizontally');
    await page.screenshot({ path: path.join(outputRoot, 'assets-mobile.png'), fullPage: false });
    await page.goBack();
    await expect(page.getByRole('heading', { name: '나만의 공간을 만들고, 함께 즐겨요.', exact: true })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole('heading', { name: '에셋 둘러보기', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: '에셋 둘러보기', exact: true })).toBeVisible();
    assert.deepEqual(errors, []);
    process.stdout.write(JSON.stringify({ assetChunk, homeDeferred: true, navigation: true, history: true, reload: true, overflow, errors, outputRoot }) + '\n');
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
