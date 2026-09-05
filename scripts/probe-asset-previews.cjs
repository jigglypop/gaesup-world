const { chromium, expect } = require('@playwright/test');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    const contextWarnings = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.text().includes('Too many active WebGL contexts')) contextWarnings.push(message.text());
    });
    await page.goto('http://127.0.0.1:5173/creator');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: '캐릭터', exact: true }).click();
    console.log(await page.getByRole('complementary', { name: '편집 도구' }).ariaSnapshot());
    const first = page.getByRole('button', { name: '토끼 전사 옷', exact: true });
    const last = page.getByRole('button', { name: '빨간 전사 옷', exact: true });
    await page.setViewportSize({ width: 390, height: 600 });
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await first.scrollIntoViewIfNeeded();
      await expect(first.locator('canvas')).toHaveCount(1);
      await expect(last.locator('canvas')).toHaveCount(0);
      await last.scrollIntoViewIfNeeded();
      await expect(last.locator('canvas')).toHaveCount(1);
      await expect(first.locator('canvas')).toHaveCount(0);
      console.log(JSON.stringify({ cycle, visibleCanvases: await page.locator('.character-asset-panel canvas').count() }));
    }
    await page.screenshot({ path: path.join(process.env.TEMP, 'gaesup-asset-preview-scroll.png') });
    await page.getByRole('button', { name: '안경 비어 있음', exact: true }).click();
    console.log(await page.locator('.character-asset-panel').ariaSnapshot());
    await page.getByRole('button', { name: '앨리 안경', exact: true }).click();
    await expect(page.getByRole('button', { name: '안경 앨리 안경', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '비우기', exact: true }).click();
    await expect(page.getByRole('button', { name: '안경 비어 있음', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(errors).toEqual([]);
    expect(contextWarnings).toEqual([]);
    console.log(JSON.stringify({ glassesEquipAndClear: true, errors, contextWarnings }));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
