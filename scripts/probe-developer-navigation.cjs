const { chromium, expect } = require('@playwright/test');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

(async () => {
  const { build, preview } = await import('vite');
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-navigation-'));
  await build({ build: { outDir: outputRoot, emptyOutDir: true }, logLevel: 'warn' });
  const server = await preview({ configFile: false, build: { outDir: outputRoot }, preview: { host: '127.0.0.1', port: 0 }, logLevel: 'warn' });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const signedIn = process.argv.includes('--signed-in');
    if (signedIn) await page.addInitScript(() => {
      localStorage.setItem('gaesup-admin-auth', JSON.stringify({
        state: { isLoggedIn: true, user: { username: '긴사용자이름'.repeat(30) } }, version: 0,
      }));
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = new URL('examples', server.resolvedUrls.local[0]).href;
    await page.goto(url, { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: '주 메뉴' });
    console.log(await nav.ariaSnapshot());
    for (const [name, width, height] of [['mobile', 320, 568], ['landscape', 844, 390], ['desktop', 1440, 900]]) {
      await page.setViewportSize({ width, height });
      const toggle = nav.getByText('개발자', { exact: true });
      await expect(toggle).toHaveCount(1);
      await toggle.click();
      console.log(await nav.ariaSnapshot());
      const groups = nav.getByRole('region');
      await expect(groups).toHaveCount(3);
      await expect(nav.locator('a[href="/edit"], a[href="/network"]')).toHaveCount(0);
      const catalog = nav.getByRole('link', { name: '예제 카탈로그', exact: true });
      await expect(catalog).toBeVisible();
      await page.screenshot({ path: path.join(outputRoot, `menu-${name}.png`) });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      const productSize = await nav.locator('.app-nav-group').evaluate(element => ({
        width: element.clientWidth, content: element.scrollWidth,
      }));
      expect(productSize.width).toBeGreaterThanOrEqual(productSize.content);
      if (signedIn) await expect(nav.getByRole('button', { name: '로그아웃', exact: true })).toBeInViewport();
      const lastLink = nav.getByRole('link', { name: '넥스트 코어', exact: true });
      await lastLink.focus();
      await expect(lastLink).toBeInViewport();
      const bounds = await lastLink.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      await page.keyboard.press('Escape');
      await expect(catalog).not.toBeVisible();
      await expect(toggle).toBeFocused();
      await toggle.click();
      await catalog.click();
      await expect(catalog).not.toBeVisible();
      await expect(page).toHaveURL(url);
      await expect(page.getByRole('main').locator('a[href="/edit"], a[href="/network"]')).toHaveCount(2);
      await toggle.click();
      await page.mouse.click(0, 0);
      await expect(catalog).not.toBeVisible();
    }
    expect(errors).toEqual([]);
    console.log(JSON.stringify({ outputRoot, signedIn, viewports: 3, errors, checks: 'menu groups, alias catalog access, focus, Escape, outside click, same-route closing, overflow, product menu width' }));
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
})().catch(error => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; });
