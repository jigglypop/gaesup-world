const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

(async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-play-panels-'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
    const errors = [];
    const results = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/world');
    await expect(page.getByRole('button', { name: '월드 도구', exact: true })).toBeVisible({ timeout: 30000 });
    for (const [key, name] of [['m', 'mail'], ['k', 'catalog'], ['j', 'quests']]) {
      await page.keyboard.press(key);
      const panel = page.locator(`[data-world-overlay="${name}"]`);
      await expect(panel).toBeVisible();
      if (name === 'mail') {
        const snapshot = await panel.ariaSnapshot();
        assert.ok(snapshot.includes('환영합니다'));
        const message = panel.getByRole('button', { name: '환영합니다 운영팀 · 0일차 * 첨부물', exact: true });
        await expect(message).toHaveCount(1);
        await message.press('Enter');
        await expect(message).toHaveAttribute('aria-pressed', 'true');
        await expect(panel.getByText('보낸 사람: 운영팀', { exact: true })).toBeVisible();
      }
      for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1280, height: 720 }]) {
        await page.setViewportSize(viewport);
        const box = await panel.boundingBox();
        assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height);
        const layout = await panel.evaluate((element) => ({
          overflow: element.scrollWidth > element.clientWidth,
          overlay: Number(getComputedStyle(element.parentElement).zIndex),
          toast: Number(getComputedStyle(document.querySelector('[role="log"]')).zIndex),
        }));
        assert.equal(layout.overflow, false);
        assert.ok(layout.toast < layout.overlay);
        await expect(panel.getByRole('button', { name: `닫기 [${key.toUpperCase()}]`, exact: true })).toBeVisible();
        results.push({ name, viewport, box, ...layout });
        await page.screenshot({ path: path.join(output, `${name}-${viewport.width}.png`) });
      }
      await panel.getByRole('button', { name: `닫기 [${key.toUpperCase()}]`, exact: true }).click();
      await expect(panel).toHaveCount(0);
      await page.setViewportSize({ width: 320, height: 568 });
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ results, errors }, null, 2));
    process.stdout.write(JSON.stringify({ output, scenarios: results.length, errors }) + '\n');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
});
