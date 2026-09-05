const { chromium, expect } = require('@playwright/test');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/blueprints', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const search = page.getByRole('textbox', { name: '블루프린트 검색' });
    await expect(search).toBeVisible();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await expect(page.getByText('시나리오 불러오는 중...', { exact: true })).toBeHidden({ timeout: 30000 });
    const warrior = page.getByRole('button', { name: '기본 전사 근접 방어형 기본', exact: true });
    const mage = page.getByRole('button', { name: '화염 마법사 마법 원거리 화염', exact: true });
    await page.getByRole('button', { name: '숨기기', exact: true }).click();
    for (const query of ['근접', 'MELEE']) {
      await search.fill(query);
      await expect(warrior).toBeVisible();
      await expect(mage).toHaveCount(0);
    }
    await search.fill('');
    await warrior.focus();
    await page.keyboard.press('Tab');
    await expect(mage).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(mage).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('textbox', { name: '이름', exact: true })).toHaveValue('화염 마법사');
    await warrior.press('Space');
    await expect(warrior).toHaveAttribute('aria-pressed', 'true');
    const name = page.getByRole('textbox', { name: '이름', exact: true });
    await name.fill('임시 전사');
    await expect(search).toBeDisabled();
    await expect(mage).toBeDisabled();
    await page.getByRole('button', { name: '변경 취소', exact: true }).click();
    await expect(name).toHaveValue('기본 전사');
    await expect(search).toBeEnabled();
    const attacks = page.locator('details').filter({ has: page.getByText('가벼운 공격 · 3개 항목', { exact: true }) });
    await attacks.locator('summary').click();
    const secondAttack = attacks.getByRole('textbox', { name: '항목 2', exact: true });
    await expect(secondAttack).toHaveValue('attack_2.glb');
    await secondAttack.fill('temporary_attack.glb');
    await expect(mage).toBeDisabled();
    await page.getByRole('button', { name: '변경 취소', exact: true }).click();
    await expect(secondAttack).toHaveValue('attack_2.glb');
    await page.getByRole('button', { name: '보기', exact: true }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    for (const [width, height] of [[390, 844], [320, 568], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await expect.poll(async () => {
        const nav = await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox();
        const box = await search.boundingBox();
        return box.y >= nav.y + nav.height;
      }).toBe(true);
      const navBox = await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox();
      const searchBox = await search.boundingBox();
      expect(searchBox.x).toBeGreaterThanOrEqual(0);
      expect(searchBox.x + searchBox.width).toBeLessThanOrEqual(width);
      const statsBox = await page.getByText('이동 속도: 5', { exact: true }).boundingBox();
      const controlsBox = await page.getByText('카메라: 3인칭', { exact: true }).boundingBox();
      expect(controlsBox.y).toBeGreaterThanOrEqual(statsBox.y + statsBox.height);
      await page.screenshot({ path: path.join(os.tmpdir(), `gaesup-blueprints-${width}.png`) });
      console.log(JSON.stringify({ width, navBox, searchBox }));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByText('카메라: 3인칭', { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-blueprints-preview-390.png') });
    await page.getByRole('button', { name: '차량 1', exact: true }).click();
    const kart = page.getByRole('button', { name: '기본 카트 지상 고속 소형', exact: true });
    await kart.click();
    const status = page.getByRole('status').filter({ hasText: '이 유형의 3D 미리보기는 아직 지원하지 않습니다.' });
    await expect(status).toBeVisible();
    await expect(status.locator('p')).toHaveCSS('word-break', 'keep-all');
    await expect(page.locator('canvas')).toHaveCount(0);
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await status.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(os.tmpdir(), `gaesup-blueprints-kart-${width}.png`) });
    }
    await page.getByRole('button', { name: '캐릭터 2', exact: true }).click();
    await warrior.click();
    await expect(page.locator('canvas')).toBeVisible();
    expect(errors).toEqual([]);
    console.log(JSON.stringify({ koreanAndLegacySearch: true, keyboardSelection: true, draftProtection: true, arrayEditCancellation: true, unsupportedPreviewTransition: true, errors }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
