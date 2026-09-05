const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

(async () => {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-asset-catalog-'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/assets');
    await expect(page.getByRole('heading', { name: '에셋 둘러보기', exact: true })).toBeVisible();
    process.stdout.write(await page.getByRole('main').ariaSnapshot() + '\n');
    const loadedModel = page.waitForResponse(response => response.url().endsWith('/gltf/ally_cloth_rabbit.glb'));
    await page.getByRole('button', { name: '토끼 전사 옷 캐릭터', exact: true }).click();
    assert.equal((await loadedModel).ok(), true);
    const detail = page.getByRole('region', { name: '선택한 에셋', exact: true });
    await expect(detail).toBeVisible();
    await expect(detail.locator('canvas')).toBeVisible();
    process.stdout.write(await detail.ariaSnapshot() + '\n');
    await page.getByRole('group', { name: '에셋 종류', exact: true }).getByRole('button', { name: '재질', exact: true }).click();
    process.stdout.write(await page.getByRole('main').ariaSnapshot() + '\n');
    await expect(page.getByRole('button', { name: '토끼 전사 옷 캐릭터', exact: true })).toHaveCount(0);
    await expect(detail).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outputRoot, 'filtered-selection-mobile.png'), fullPage: false });
    await detail.getByRole('button', { name: '선택 해제', exact: true }).click();
    await expect(detail).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.evaluate(async () => {
      const { useAssetStore } = await import('/src/assets.ts');
      useAssetStore.setState({ ids: [], records: {} });
    });
    await expect(page.getByRole('status')).toHaveText('이 종류의 에셋이 없습니다. 다른 종류나 전체 목록을 선택하세요.');
    process.stdout.write(await page.getByRole('main').ariaSnapshot() + '\n');
    await page.getByRole('group', { name: '에셋 종류', exact: true }).getByRole('button', { name: '전체', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('아직 등록된 에셋이 없습니다.');
    await page.evaluate(async () => {
      const { useAssetStore } = await import('/src/assets.ts');
      useAssetStore.setState({ catalogStatus: { ...useAssetStore.getState().catalogStatus, state: 'loading' } });
    });
    await expect(page.getByRole('status')).toHaveText('에셋을 불러오고 있습니다.');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    process.stdout.write(JSON.stringify({ modelResponse: true, filteredSelectionCleared: true, canvasRemoved: true, injectedEmptyStates: true, errors, outputRoot }) + '\n');
  } finally {
    await browser.close();
  }
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
