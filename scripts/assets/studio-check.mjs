import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

import { chromium, expect } from '@playwright/test';

await mkdir('.asset-work/studio-review', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:5188/assets');
  await page.getByRole('heading', { name: '상상에서, 플레이까지.' }).waitFor();
  const stages = page.getByRole('navigation', { name: '에셋 제작 단계' }).getByRole('button');
  assert.equal(await stages.count(), 5);
  await page.getByRole('button', { name: '연결 확인 · 작업 새로고침' }).click();
  await expect(page.getByText('실행 파일 감지됨', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: '이미지 생성 요청', exact: true })).toBeDisabled();
  await page.getByLabel('캐릭터 이름', { exact: true }).fill('');
  await expect(page.getByRole('button', { name: '토끼 캐릭터 브리프 저장 ↓' })).toBeDisabled();
  await page.getByLabel('캐릭터 이름', { exact: true }).fill('검증용 토끼');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '토끼 캐릭터 브리프 저장 ↓' }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'bunny-character-brief.json');
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  assert.equal(JSON.parse(Buffer.concat(chunks).toString('utf8')).name, '검증용 토끼');
  await page.screenshot({ path: '.asset-work/studio-review/desktop.png', fullPage: true });
  for (const name of ['3D · 모델 제작', '리깅 · 움직임', '최적화 · 품질 검수', '납품 · 공개']) {
    await stages.filter({ hasText: name }).click();
    await expect(stages.filter({ hasText: name })).toHaveAttribute('aria-current', 'step');
  }
  await page.goto('http://127.0.0.1:5188/assets?stage=quality');
  await page.getByRole('link', { name: 'GLB 검수 화면 열기 ↗' }).click();
  await page.getByRole('heading', { name: '제품 에셋 검수', exact: true }).waitFor();
  await page.goto('http://127.0.0.1:5188/assets?stage=concept');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { name: '상상에서, 플레이까지.' }).waitFor();
  await page.screenshot({ path: '.asset-work/studio-review/narrow.png', fullPage: true });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
  );
  assert.deepEqual(errors, []);
  process.stdout.write(
    'PASS: 5 stages, brief download, deep link, review navigation, 390px layout, no page errors\n',
  );
} finally {
  await browser.close();
}
