const { chromium, expect } = require('@playwright/test');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/showcase');
    await page.waitForLoadState('networkidle');
    await page.getByRole('navigation', { name: '편집 패널 선택' }).getByRole('button', { name: '모션', exact: true }).click();
    await page.getByRole('button', { name: '상태 진단', exact: true }).click();
    await expect(page.getByText('총 이동 거리', { exact: true })).toBeVisible();
    await expect(page.getByText('정보 없음', { exact: true })).toBeVisible();
    process.stdout.write(await page.getByRole('complementary', { name: '편집 도구' }).ariaSnapshot());
    await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-motion-mobile.png') });
    await page.getByRole('navigation', { name: '편집 패널 선택' }).getByRole('button', { name: '애니메이션', exact: true }).click();
    await expect(page.getByRole('combobox', { name: '애니메이션 선택' })).toBeVisible();
    await expect(page.getByRole('button', { name: '애니메이션 재생', exact: true })).toBeVisible();
    const nextBounds = await page.getByRole('button', { name: '다음 애니메이션' }).boundingBox();
    expect(nextBounds.x + nextBounds.width).toBeLessThanOrEqual(390);
    await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-animation-mobile.png') });
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('button', { name: '재생 설정', exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-animation-desktop.png') });
    expect(errors).toEqual([]);
    process.stdout.write(JSON.stringify({ errors }));
  } finally {
    await browser.close();
  }
})().catch((error) => { process.stderr.write(String(error)); process.exitCode = 1; });
