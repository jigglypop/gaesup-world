const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

(async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-world-tools-'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/world');
    await expect(page.getByRole('button', { name: '월드 도구', exact: true })).toBeVisible({ timeout: 30000 });
    process.stdout.write(await page.locator('body').ariaSnapshot() + '\n');
    await page.getByRole('button', { name: '월드 도구', exact: true }).click();
    await expect(page.locator('.minimap--bottom-left')).toBeHidden();
    process.stdout.write(await page.locator('body').ariaSnapshot() + '\n');
    const summaries = ['캐릭터 꾸미기', '탈것 타기', '장소로 이동'];
    const notifications = page.getByRole('log', { name: '알림' });
    const notificationBounds = await notifications.boundingBox();
    const toolsBounds = await page.getByText('빠른 도구', { exact: true }).locator('..').boundingBox();
    assert.ok(notificationBounds && toolsBounds);
    assert.ok(notificationBounds.y >= toolsBounds.y + toolsBounds.height, 'Notifications overlap quick tools');
    for (const name of summaries) {
      const summary = page.locator('summary').filter({ hasText: name });
      await expect(summary).toHaveCount(1);
      await expect(summary.locator('..')).not.toHaveAttribute('open');
    }
    await page.screenshot({ path: path.join(output, 'collapsed.png') });
    for (const [name, action] of [['캐릭터 꾸미기', '장비 비우기'], ['탈것 타기', '차량 탑승'], ['장소로 이동', '차량 위치']]) {
      const summary = page.locator('summary').filter({ hasText: name });
      await summary.press('Enter');
      process.stdout.write(await summary.locator('..').ariaSnapshot() + '\n');
      await expect(page.getByRole('button', { name: action, exact: true })).toBeVisible();
      if (name === '장소로 이동') {
        await expect(page.getByRole('button', { name: '차량 위치', exact: true })).toHaveCount(1);
        await expect(page.getByRole('button', { name: '비행기 위치', exact: true })).toHaveCount(1);
      }
      await summary.press('Enter');
      await expect(summary.locator('..')).not.toHaveAttribute('open');
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await page.getByRole('button', { name: '도구 닫기', exact: true }).click();
    await expect(page.locator('.minimap--bottom-left')).toBeVisible();
    assert.equal(overflow, false);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ errors, overflow, notificationBounds, toolsBounds, width: 390, keyboardGroups: summaries }, null, 2));
    process.stdout.write(JSON.stringify({ output, errors, overflow }) + '\n');
  } finally { await browser.close(); }
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
