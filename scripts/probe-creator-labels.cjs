const { chromium, expect } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const compact = process.argv.includes('--compact');
    const page = await browser.newPage({ viewport: compact ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/creator');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: '게임 이벤트', exact: true }).click();
    await page.getByRole('dialog', { name: '게임 이벤트 패널 모달', exact: true }).waitFor({ state: 'visible' });
    console.log('EVENTS', await page.getByRole('dialog', { name: '게임 이벤트 패널 모달', exact: true }).ariaSnapshot());
    const eventPanel = page.getByRole('dialog', { name: '게임 이벤트 패널 모달', exact: true });
    await expect(eventPanel.getByRole('textbox', { name: '이름', exact: true })).toBeVisible();
    const firstControl = eventPanel.getByRole('button', { name: '패널을 사이드바로 보내기', exact: true });
    const lastControl = eventPanel.getByRole('article').filter({ hasText: '커스텀 이벤트 예시' }).getByRole('button', { name: '실행', exact: true });
    await firstControl.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(lastControl).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(firstControl).toBeFocused();
    const customCard = eventPanel.getByRole('article').filter({ hasText: '커스텀 이벤트 예시' });
    const editBounds = await customCard.getByRole('button', { name: '편집', exact: true }).boundingBox();
    const runBounds = await lastControl.boundingBox();
    expect(editBounds).not.toBeNull();
    expect(runBounds).not.toBeNull();
    expect(Math.abs(editBounds.y - runBounds.y)).toBeLessThan(1);
    await page.screenshot({ path: require('node:path').join(process.env.TEMP, compact ? 'gaesup-modal-mobile.png' : 'gaesup-modal-desktop.png') });
    for (const name of ['월드 시작 알림', '첫 대화와 환영 퀘스트', '초원 첫 방문 선물', '축제 시작과 퀘스트 진행']) {
      await expect(eventPanel.getByRole('article').filter({ hasText: name })).toHaveCount(1);
    }
    await eventPanel.getByRole('button', { name: '패널 닫기', exact: true }).click();
    await expect(eventPanel).toHaveCount(0);
    await expect(page.getByRole('button', { name: '게임 이벤트', exact: true })).toBeFocused();
    console.log('CLOSED', await page.getByRole('complementary', { name: '편집 도구' }).ariaSnapshot());
    await page.getByRole('button', { name: 'NPC', exact: true }).click();
    const npcPanel = page.getByRole('dialog', { name: 'NPC 패널 모달', exact: true });
    await expect(npcPanel.getByText('행동: 없음 · 이동: 없음', { exact: true })).toBeVisible();
    await expect(npcPanel.getByText('현재 애니메이션: 없음', { exact: true })).toBeVisible();
    console.log('NPC', await npcPanel.ariaSnapshot());
    await page.keyboard.press('Escape');
    await expect(npcPanel).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'NPC', exact: true })).toBeFocused();
    console.log('Modal keyboard checks passed', { compact, errors });
    if (errors.length) throw new Error(errors.join('\n'));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
