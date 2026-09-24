const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');
const { PNG } = require('pngjs');

const { startProbeServer } = require('./lib/devServer.cjs');

async function main() {
  const server = await startProbeServer();
  const { url } = server;
  const output = path.resolve(process.env.GAESUP_PROBE_OUTPUT ?? path.join(__dirname, '../.tmp/minihome'));
  const deviceScaleFactor = Number(process.env.GAESUP_PROBE_DPR ?? '1');
  assert.ok(Number.isFinite(deviceScaleFactor) && deviceScaleFactor >= 1 && deviceScaleFactor <= 3);
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-unsafe-webgpu', '--enable-gpu'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1040 }, deviceScaleFactor });
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
    const baseFurniture = await page.evaluate(() => window.miniroom.diagnostics().objectCount);
    async function addPlant() {
      await page.getByRole('button', { name: '화분 배치', exact: true }).click();
      await page.locator('canvas').scrollIntoViewIfNeeded();
      const bounds = await page.locator('canvas').boundingBox();
      const point = await page.evaluate(() => window.miniroom.projectPoint([0.5, 0, 4.5]));
      await page.mouse.click(bounds.x + point.x, bounds.y + point.y);
      await page.getByRole('button', { name: '선택', exact: true }).click();
    }
    await page.waitForTimeout(1800);
    const idleBefore = Number(await page.locator('canvas').getAttribute('data-rendered-frames'));
    const callbacksBefore = await page.evaluate(() => window.miniroom.diagnostics().loopCallbacks);
    await page.waitForTimeout(700);
    const idleAfter = Number(await page.locator('canvas').getAttribute('data-rendered-frames'));
    assert.ok(idleAfter - idleBefore <= 2, `Idle room rendered ${idleAfter - idleBefore} unnecessary frames.`);
    const idleCallbacks = await page.evaluate(() => window.miniroom.diagnostics().loopCallbacks) - callbacksBefore;
    assert.equal(idleCallbacks, 0, 'Idle room scheduled frame callbacks');
    await page.screenshot({ path: path.join(output, 'home-desktop.png'), fullPage: true });
    const bitmap = PNG.sync.read(await page.locator('canvas').screenshot());
    const colors = new Set();
    for (let i = 0; i < bitmap.data.length; i += 32)
      colors.add(`${bitmap.data[i]},${bitmap.data[i + 1]},${bitmap.data[i + 2]}`);
    assert.ok(colors.size > 150, `Expected a rendered 3D room, found ${colors.size} colors.`);
    const walkBounds = await page.locator('canvas').boundingBox();
    const walkPoint = await page.evaluate(() => window.miniroom.projectPoint([-2.5, 0, 4.75]));
    await page.mouse.click(walkBounds.x + walkPoint.x, walkBounds.y + walkPoint.y);
    await page.waitForFunction(() => { const p = window.miniroom.diagnostics().avatarPosition; return Math.hypot(p[0] + 2.5, p[2] - 4.75) < 0.05; }, null, { timeout: 10000 });
    await page.getByRole('button', { name: '화면 확대', exact: true }).click();
    await page.waitForFunction(() => !!document.fullscreenElement);
    await page.getByRole('button', { name: '화면 축소', exact: true }).click();
    await page.waitForFunction(() => !document.fullscreenElement);
    for (const quality of ['economy', 'high', 'balanced']) {
      await page.getByLabel('미니룸 화질', { exact: true }).selectOption(quality);
      await page.waitForFunction(value => window.miniroom.diagnostics().quality === value, quality);
    }
    await page.getByLabel('미니룸 조명', { exact: true }).selectOption('evening');
    await page.waitForFunction(() => window.miniroom.diagnostics().lighting === 'evening');
    await page.screenshot({ path: path.join(output, 'room-evening.png'), fullPage: true });
    await page.getByLabel('미니룸 조명', { exact: true }).selectOption('day');
    for (const camera of ['front', 'top', 'isometric']) {
      const before = await page.evaluate(() => window.miniroom.diagnostics().renderedFrames);
      await page.getByLabel('미니룸 카메라', { exact: true }).selectOption(camera);
      await page.waitForFunction(value => window.miniroom.diagnostics().renderedFrames > value, before);
    }
    const photoDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '사진 저장', exact: true }).click();
    const photoPath = path.join(output, 'mini-room.png'); await (await photoDownload).saveAs(photoPath);
    const photo = PNG.sync.read(fs.readFileSync(photoPath)); assert.ok(photo.width > 100 && photo.height > 100);
    const photoColors = new Set(); for (let i = 0; i < photo.data.length; i += 32) photoColors.add(photo.data.subarray(i, i + 3).toString('hex'));
    assert.ok(photoColors.size > 150, 'Photo export is blank');
    const beforeApi = await page.evaluate(() => localStorage.getItem('gaesup.minihome.v1'));
    await page.getByRole('button', { name: '드로우콜·성능', exact: true }).click();
    await page.getByRole('button', { name: 'API 기능 검사 실행', exact: true }).click();
    await page.getByText(/기능 11\/11 통과/).waitFor({ timeout: 60000 });
    const apiChecks = await page.locator('.room-api-checks li').count();
    assert.equal(await page.locator('.room-api-checks li[data-status=failed]').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('gaesup.minihome.v1')), beforeApi);
    await page.screenshot({ path: path.join(output, 'room-api-checks.png'), fullPage: true });
    await page.getByRole('button', { name: '드로우콜·성능', exact: true }).click();
    await page.getByRole('button', { name: '프로필 수정' }).click();
    await page.getByLabel('프로필 이름').fill('도토리');
    await page.getByLabel('홈피 제목').fill('도토리의 작은 방');
    await page.getByRole('button', { name: '수정 완료', exact: true }).click();
    await page.getByRole('button', { name: '미니룸 꾸미기' }).click();
    await addPlant();
    const addedId = await page.getByLabel('선택한 가구').inputValue();
    await page.getByRole('button', { name: '가구 왼쪽 이동' }).click();
    await page.getByRole('button', { name: '가구 회전' }).click();
    await page.getByRole('button', { name: '세이지 테마' }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    const beforeDrag = await state();
    const plant = beforeDrag.room.objects.find((object) => object.id === addedId);
    await page.locator('canvas').scrollIntoViewIfNeeded();
    const bounds = await page.locator('canvas').boundingBox();
    const point = await page.evaluate(position => window.miniroom.projectPoint(position), [plant.transform.position[0], 0.7, plant.transform.position[2]]);
    const x = bounds.x + point.x;
    const y = bounds.y + point.y;
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
    assert.equal(saved.room.objects.length, baseFurniture + 1);
    assert.equal(saved.theme, 'sage');
    assert.equal(saved.profile.name, '도토리');
    assert.equal(
      saved.room.objects.find((object) => object.id === addedId).transform.rotation[1],
      Math.PI / 2,
    );
    await page.screenshot({ path: path.join(output, 'room-editing.png'), fullPage: true });
    const movedPlant = saved.room.objects.find(object => object.id === addedId);
    const cancelBounds = await page.locator('canvas').boundingBox();
    const cancelPoint = await page.evaluate(position => window.miniroom.projectPoint(position), [movedPlant.transform.position[0], 0.7, movedPlant.transform.position[2]]);
    await page.mouse.move(cancelBounds.x + cancelPoint.x, cancelBounds.y + cancelPoint.y); await page.mouse.down();
    await page.mouse.move(cancelBounds.x + cancelPoint.x + 40, cancelBounds.y + cancelPoint.y + 10, { steps: 5 });
    await page.keyboard.press('Escape'); await page.mouse.up();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.deepEqual(await state(), saved, 'Escape committed the drag preview');
    await page.getByRole('button', { name: '편집 완료 · 둘러보기', exact: true }).click();
    await page.reload();
    await ready();
    await page.getByRole('heading', { name: /도토리의 작은 방/ }).waitFor();
    assert.deepEqual(await state(), saved);
    // Mixed document history, export/import and public snapshot sharing.
    await page.getByRole('button', { name: '미니룸 꾸미기' }).click();
    await addPlant();
    await page.getByRole('button', { name: '실행 취소', exact: true }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.equal((await state()).room.objects.length, baseFurniture + 1);
    await page.getByRole('button', { name: '다시 실행', exact: true }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.equal((await state()).room.objects.length, baseFurniture + 2);
    await page.getByRole('button', { name: '실행 취소', exact: true }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    const backupDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '파일 백업', exact: true }).click();
    const backupPath = path.join(output, 'mini-home.json');
    await (await backupDownload).saveAs(backupPath);
    assert.deepEqual(JSON.parse(fs.readFileSync(backupPath, 'utf8')), await state());
    await page.getByLabel('미니홈피 백업 파일').setInputFiles(backupPath);
    const glbDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '3D 방 내보내기 (.glb)', exact: true }).click();
    const glbPath = path.join(output, 'mini-room.glb');
    await (await glbDownload).saveAs(glbPath);
    const glb = fs.readFileSync(glbPath);
    assert.equal(glb.readUInt32LE(0), 0x46546c67);
    const validation = await require('gltf-validator').validateBytes(new Uint8Array(glb));
    assert.equal(validation.issues.numErrors, 0, JSON.stringify(validation.issues));
    await page.getByRole('button', { name: '방 공유', exact: true }).click();
    const shareUrl = await page.getByLabel('방 공유 링크').inputValue();
    const visitor = await browser.newPage();
    await visitor.goto(shareUrl);
    await visitor.locator('[data-renderer="WebGPU"]').waitFor({ timeout: 60000 });
    await visitor.getByRole('heading', { name: /도토리의 작은 방/ }).waitFor();
    assert.equal(await visitor.evaluate(() => localStorage.getItem('gaesup.minihome.v1')), null);
    await visitor.getByRole('button', { name: '내 방으로 가져오기', exact: true }).click();
    await visitor.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.equal(await visitor.evaluate(() => JSON.parse(localStorage.getItem('gaesup.minihome.v1')).room.objects.length), baseFurniture + 1);
    await visitor.close();
    await page.getByRole('button', { name: '꾸미기 완료' }).click();
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
    await page.getByRole('button', { name: '방 공유', exact: true }).click();
    const populatedShare = await page.getByLabel('방 공유 링크').inputValue();
    const sharedData = JSON.parse(Buffer.from(populatedShare.split('#room=')[1], 'base64').toString('utf8'));
    assert.deepEqual(sharedData.diary, []);
    assert.deepEqual(sharedData.guestbook, []);
    const recipientData = await state();
    recipientData.profile.name = '기록을 지켜요';
    const recipient = await browser.newPage();
    await recipient.addInitScript((home) => {
      if (localStorage.getItem('gaesup.minihome.v1') === null)
        localStorage.setItem('gaesup.minihome.v1', JSON.stringify(home));
    }, recipientData);
    const recipientState = () => recipient.evaluate(() => JSON.parse(localStorage.getItem('gaesup.minihome.v1')));
    await recipient.goto(populatedShare);
    await recipient.locator('[data-renderer="WebGPU"]').waitFor({ timeout: 60000 });
    assert.deepEqual(await recipientState(), recipientData);
    await recipient.getByRole('button', { name: '내 방으로 가져오기', exact: true }).click();
    await recipient.getByRole('button', { name: '실행 취소', exact: true }).click();
    await recipient.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.deepEqual(await recipientState(), recipientData);
    await recipient.getByRole('button', { name: '다시 실행', exact: true }).click();
    await recipient.getByRole('button', { name: '미니홈피 저장' }).click();
    await recipient.reload();
    await recipient.locator('[data-renderer="WebGPU"]').waitFor({ timeout: 60000 });
    const adopted = await recipientState();
    assert.equal(adopted.profile.name, sharedData.profile.name);
    assert.deepEqual(adopted.diary, recipientData.diary);
    assert.deepEqual(adopted.guestbook, recipientData.guestbook);
    await recipient.close();
    const unityDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Unity 장면 JSON', exact: true }).click();
    const unityPath = path.join(output, 'unity-scene.json');
    await (await unityDownload).saveAs(unityPath);
    assert.equal(JSON.parse(fs.readFileSync(unityPath, 'utf8')).format, 'gaesup-unity-scene');
    await page.getByRole('button', { name: '미니룸 꾸미기' }).click();
    await page.getByLabel('선택한 가구').selectOption(addedId);
    await page.getByRole('button', { name: '가구 삭제' }).click();
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    assert.equal((await state()).room.objects.length, baseFurniture);
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
    await page.getByRole('status').filter({ hasText: '이전 백업을 복구' }).waitFor();
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
    await fallback.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await fallback.getByRole('button', { name: '다시 열기', exact: true }).waitFor();
    await fallback.getByRole('button', { name: '다시 열기', exact: true }).click();
    await fallback.locator('[data-renderer="WebGL2"]').waitFor({ timeout: 60000 });
    await fallback.waitForFunction(() => window.miniroom?.diagnostics().renderedFrames > 0 && !document.querySelector('.room-loading'));
    assert.deepEqual(fallbackErrors, []);
    const result = {
      deviceScaleFactor,
      contextRecovery: true,
      apiChecks,
      idleCallbacksIn700ms: idleCallbacks,
      cameraPresets: true,
      navigationMovement: true,
      fullScreen: true,
      cancelDrag: true,
      qualityProfiles: true,
      dayEvening: true,
      photoExportColors: photoColors.size,
      native: true,
      idleDrawsIn700ms: idleAfter - idleBefore,
      colors: colors.size,
      savedFurniture: saved.room.objects.length,
      profileAndRoomReload: true,
      diaryAndGuestbookReload: true,
      deletion: true,
      corruptSavePreserved: true,
      quotaErrorReported: true,
      mobileOverflow: false,
      fallback: 'WebGL2',
      undoRedo: true,
      backupImportExport: true,
      privateNotesExcludedFromShare: true,
      sharedRoomAdoption: true,
      recipientNotesAndHistoryPreserved: true,
      glbValidationErrors: validation.issues.numErrors,
      errors,
      fallbackErrors,
    };
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
    server.stop();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
