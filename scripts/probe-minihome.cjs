const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');
const { PNG } = require('pngjs');
const { OrthographicCamera, Vector3 } = require('three');

async function main() {
  const url = process.env.GAESUP_PROBE_URL ?? 'http://127.0.0.1:5174';
  const output = path.resolve(__dirname, '../.tmp/minihome');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-unsafe-webgpu', '--enable-gpu'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1040 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' ||
        /GPUValidationError|Invalid RenderPipeline/.test(message.text())
      )
        errors.push(message.text());
    });
    const ready = () => page.locator('[data-renderer="WebGPU"]').waitFor({ timeout: 60000 });
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('gaesup.minihome.v1')));
    await page.goto(url);
    await ready();
    await page.screenshot({ path: path.join(output, 'home-desktop.png'), fullPage: true });
    const bitmap = PNG.sync.read(await page.locator('canvas').screenshot());
    const colors = new Set();
    for (let i = 0; i < bitmap.data.length; i += 32)
      colors.add(`${bitmap.data[i]},${bitmap.data[i + 1]},${bitmap.data[i + 2]}`);
    assert.ok(colors.size > 150, `Expected a rendered 3D room, found ${colors.size} colors.`);
    await page.getByRole('button', { name: '프로필 수정' }).click();
    await page.getByLabel('프로필 이름').fill('도토리');
    await page.getByLabel('홈피 제목').fill('도토리의 작은 방');
    await page.getByRole('button', { name: '수정 완료', exact: true }).click();
    await page.getByRole('button', { name: '미니룸 꾸미기' }).click();
    await page.getByRole('button', { name: '화분 추가', exact: true }).click();
    const addedId = await page.getByLabel('선택한 가구').inputValue();
    await page.getByRole('button', { name: '가구 왼쪽 이동' }).click();
    await page.getByRole('button', { name: '가구 회전' }).click();
    await page.getByRole('button', { name: '세이지 테마' }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    const beforeDrag = await state();
    const plant = beforeDrag.room.objects.find((object) => object.id === addedId);
    await page.locator('canvas').scrollIntoViewIfNeeded();
    const bounds = await page.locator('canvas').boundingBox();
    const aspect = bounds.width / bounds.height;
    const camera = new OrthographicCamera(-6.6 * aspect, 6.6 * aspect, 6.6, -6.6, 0.1, 100);
    camera.position.set(12, 11, 15);
    camera.lookAt(0, 1, 0);
    camera.updateMatrixWorld();
    const point = new Vector3(
      plant.transform.position[0],
      0.7,
      plant.transform.position[2],
    ).project(camera);
    const x = bounds.x + ((point.x + 1) * bounds.width) / 2;
    const y = bounds.y + ((1 - point.y) * bounds.height) / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    assert.equal(await page.getByLabel('선택한 가구').inputValue(), addedId);
    await page.mouse.move(x + 38, y - 15, { steps: 8 });
    await page.mouse.up();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    const saved = await state();
    assert.notDeepEqual(
      saved.room.objects.find((object) => object.id === addedId).transform.position,
      plant.transform.position,
    );
    assert.equal(saved.room.objects.length, 7);
    assert.equal(saved.theme, 'sage');
    assert.equal(saved.profile.name, '도토리');
    assert.equal(
      saved.room.objects.find((object) => object.id === addedId).transform.rotation[1],
      Math.PI / 2,
    );
    await page.screenshot({ path: path.join(output, 'room-editing.png'), fullPage: true });
    await page.reload();
    await ready();
    await page.getByRole('heading', { name: /도토리의 작은 방/ }).waitFor();
    assert.deepEqual(await state(), saved);
    await page
      .getByRole('navigation', { name: '미니홈피 메뉴' })
      .getByRole('button', { name: '방명록' })
      .click();
    await page.getByLabel('방명록 닉네임').fill('친구');
    await page.getByLabel('방명록 내용').fill('햇살이 예쁜 방이네. 또 놀러 올게!');
    await page.getByRole('button', { name: '인사 남기기' }).click();
    await page.getByText('햇살이 예쁜 방이네. 또 놀러 올게!', { exact: true }).waitFor();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    await page
      .getByRole('navigation', { name: '미니홈피 메뉴' })
      .getByRole('button', { name: '다이어리' })
      .click();
    await page.getByLabel('다이어리 내용').fill('오늘은 내 방에 화분 하나를 더 놓았다.');
    await page.getByRole('button', { name: '기록 남기기' }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    await page.reload();
    await ready();
    assert.equal((await state()).diary.length, 1);
    assert.equal((await state()).guestbook.length, 1);
    await page.getByRole('button', { name: '미니룸 꾸미기' }).click();
    await page.getByLabel('선택한 가구').selectOption(addedId);
    await page.getByRole('button', { name: '가구 삭제' }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.equal((await state()).room.objects.length, 6);
    await page.getByRole('button', { name: '꾸미기 완료' }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'home-mobile.png'), fullPage: true });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    // Malformed saves are preserved until the user explicitly saves a replacement.
    await page.evaluate(() => localStorage.setItem('gaesup.minihome.v1', '{broken'));
    await page.reload();
    await ready();
    await page.getByRole('status').filter({ hasText: '원본은 보존' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('gaesup.minihome.v1')), '{broken');
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('quota', 'QuotaExceededError');
      };
    });
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    await page.getByRole('status').filter({ hasText: '저장하지 못했어요' }).waitFor();
    assert.deepEqual(errors, []);
    const fallback = await browser.newPage();
    await fallback.addInitScript(() =>
      Object.defineProperty(navigator, 'gpu', { value: undefined }),
    );
    const fallbackErrors = [];
    fallback.on('pageerror', (error) => fallbackErrors.push(error.message));
    await fallback.goto(url);
    await fallback.locator('[data-renderer="WebGL2"]').waitFor({ timeout: 60000 });
    assert.deepEqual(fallbackErrors, []);
    const result = {
      native: true,
      colors: colors.size,
      savedFurniture: saved.room.objects.length,
      profileAndRoomReload: true,
      diaryAndGuestbookReload: true,
      deletion: true,
      corruptSavePreserved: true,
      quotaErrorReported: true,
      mobileOverflow: false,
      fallback: 'WebGL2',
      errors,
      fallbackErrors,
    };
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
