const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { collectPageErrors, launchWebGpuBrowser, startProbeServer } = require('./lib/devServer.cjs');
const { openRoomSettingsOnLoad } = require('./lib/minihome.cjs');

const output = path.resolve('.artifacts/minihome', `town-${new Date().toISOString().replace(/[:.]/g, '-')}`);
fs.mkdirSync(output, { recursive: true });

(async () => {
  const server = await startProbeServer();
  const base = server.url;
  const browser = await launchWebGpuBrowser();
  const errors = []; const result = { output, checks: [], errors };
  async function bind(page) {
    collectPageErrors(page, { console: 'gpu', errors });
    await page.goto(base); await page.waitForFunction(() => !!window.miniroom, null, { timeout: 60000 });
  }
  async function snapshot(page, name) { await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true }); }
  async function clickWorld(page, point) {
    await page.locator('canvas').scrollIntoViewIfNeeded();
    const screen = await page.evaluate(point => { const p = window.miniroom.projectPoint(point); const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + p.x, y: r.top + p.y }; }, point);
    await page.mouse.click(screen.x, screen.y);
  }
  async function tapWorld(page, point) {
    await page.locator('canvas').scrollIntoViewIfNeeded();
    const screen = await page.evaluate(point => { const p = window.miniroom.projectPoint(point); const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + p.x, y: r.top + p.y }; }, point);
    await page.touchscreen.tap(screen.x, screen.y);
  }
  async function save(page) { await page.getByRole('button', { name: '미니홈피 저장', exact: true }).click(); return page.evaluate(() => JSON.parse(localStorage.getItem('gaesup.minihome.v1'))); }
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } }); await openRoomSettingsOnLoad(page); await bind(page);
    await snapshot(page, '01-town');
    await page.getByRole('button', { name: '드로우콜·성능', exact: true }).click();
    // Shadows refresh on every other frame, so the accounting is checked on one captured frame that has a shadow pass.
    const stats = await (await page.waitForFunction(() => { const stats = window.miniroom.diagnostics(); return stats.frame?.draws.some(row => row.pass === 'shadow') && stats; })).jsonValue(); result.initial = stats;
    assert.equal(stats.terrain.tiles, 576); assert.equal(stats.terrain.batches, Object.entries(stats.terrain.counts).filter(([kind, n]) => kind !== 'water' && n > 0).length);
    assert.ok(stats.frame.draws.some(row => row.pass === 'shadow')); assert.ok(stats.frame.draws.some(row => row.instances > 1));
    assert.equal(stats.frame.draws.reduce((sum, row) => sum + row.calls, 0) + stats.frame.otherCalls, stats.frame.stats.drawCalls);
    result.checks.push(`${stats.backend} / terrain instancing / actual per-pass draw accounting`);
    await page.getByRole('button', { name: '드로우콜·성능', exact: true }).click();
    await clickWorld(page, [4, 0, 1]);
    await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'moving');
    await page.locator('.miniroom-view').screenshot({ path: path.join(output, '02-move-path.png') });
    await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 15000 });
    const position = await page.evaluate(() => window.miniroom.diagnostics().avatarPosition); assert.ok(Math.hypot(position[0] - 4, position[2] - 1) < 0.05);
    await clickWorld(page, [-10.5, 0, -10.5]); await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'blocked');
    await page.locator('.miniroom-view').screenshot({ path: path.join(output, '03-blocked.png') });
    result.checks.push('click path / arrival / water rejection');
    await page.getByRole('button', { name: '공간 꾸미기' }).click();
    assert.ok(new URL(page.url()).searchParams.get('edit') === '1');
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('top');
    await page.getByRole('button', { name: '눈 타일', exact: true }).click();
    await page.getByLabel('타일 브러시 크기').selectOption('3');
    const before = await save(page); await clickWorld(page, [0.5, 0, 5.5]); const painted = await save(page);
    assert.equal(painted.terrain.tiles.filter((tile, index) => tile !== before.terrain.tiles[index]).length, 9);
    await page.getByRole('button', { name: '↶ 실행 취소', exact: true }).click(); assert.deepEqual((await save(page)).terrain, before.terrain);
    await page.getByRole('button', { name: '↷ 다시 실행', exact: true }).click(); assert.deepEqual((await save(page)).terrain, painted.terrain);
    result.checks.push('3x3 brush / one-command undo and redo');
    await page.getByLabel('타일 브러시 크기').selectOption('1');
    await page.getByRole('button', { name: '바다 타일', exact: true }).click(); await clickWorld(page, [0.5, 0, 5.5]);
    await page.getByRole('button', { name: '둘러보기' }).click(); await clickWorld(page, [0.5, 0, 5.5]);
    await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'blocked');
    await page.getByRole('button', { name: '공간 꾸미기' }).click();
    await page.getByRole('button', { name: '잔디 타일', exact: true }).click(); await clickWorld(page, [0.5, 0, 5.5]);
    await page.getByRole('button', { name: '나무 타일', exact: true }).click(); await clickWorld(page, [-0.5, 0, 5.5]);
    await page.getByRole('button', { name: '돌길 타일', exact: true }).click(); await clickWorld(page, [-1.5, 0, 5.5]);
    await page.getByRole('button', { name: '둘러보기' }).click(); await clickWorld(page, [0.5, 0, 5.5]);
    await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 15000 });
    await page.getByRole('button', { name: '공간 꾸미기' }).click();
    result.checks.push('painted water blocks movement / repainting ground restores navigation');
    await page.getByRole('button', { name: '네온 조형물 배치', exact: true }).click(); await clickWorld(page, [3.5, 0, 5.5]);
    const placed = await save(page); assert.equal(placed.room.objects.length, before.room.objects.length + 1);
    const item = placed.room.objects.at(-1); assert.deepEqual(item.transform.position, [3.5, 0, 5.5]);
    await page.getByLabel('선택한 가구', { exact: true }).selectOption(item.id);
    await page.getByLabel('가구 회전', { exact: true }).click();
    await page.getByLabel('선택 가구 Bloom').uncheck(); assert.equal((await save(page)).room.objects.find(entry => entry.id === item.id).components[0].data.bloom, false);
    await page.getByLabel('선택 가구 Bloom').check();
    await page.getByRole('button', { name: '복제', exact: true }).click(); assert.equal((await save(page)).room.objects.length, placed.room.objects.length + 1);
    await page.getByLabel('가구 삭제', { exact: true }).click(); assert.equal((await save(page)).room.objects.length, placed.room.objects.length);
    result.checks.push('click furniture placement / rotation / per-object bloom / duplicate / delete');
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('isometric');
    await page.waitForFunction(() => window.miniroom.diagnostics().camera.preset === 'isometric' && !window.miniroom.diagnostics().pendingFrame);
    await snapshot(page, '04-editor');
    await page.getByLabel('미니룸 조명', { exact: true }).selectOption('evening');
    // Moving wind and water refresh shadows on every other frame, so bloom is compared on still frames without that pass.
    async function stillFrameAfterUnchecking(label) {
      await page.waitForFunction(() => !window.miniroom.diagnostics().pendingFrame, null, { timeout: 15000 });
      const frames = await page.evaluate(() => window.miniroom.diagnostics().renderedFrames);
      await page.getByLabel(label, { exact: true }).uncheck();
      await page.waitForFunction(count => window.miniroom.diagnostics().renderedFrames > count && !window.miniroom.diagnostics().pendingFrame, frames);
    }
    await stillFrameAfterUnchecking('바람과 물결');
    await page.locator('canvas').scrollIntoViewIfNeeded();
    await page.locator('.miniroom-view').screenshot({ path: path.join(output, '05-bloom-on.png') });
    const bloomOn = await page.evaluate(() => window.miniroom.diagnostics().frame.stats.drawCalls);
    await stillFrameAfterUnchecking('Bloom 효과');
    await page.waitForFunction(() => !window.miniroom.diagnostics().bloom.enabled);
    await page.locator('canvas').scrollIntoViewIfNeeded();
    await page.locator('.miniroom-view').screenshot({ path: path.join(output, '06-bloom-off.png') });
    const bloomOff = await page.evaluate(() => window.miniroom.diagnostics().frame.stats.drawCalls);
    assert.ok(bloomOn > bloomOff, `${bloomOn} > ${bloomOff}`); result.bloom = { bloomOn, bloomOff };
    await page.getByLabel('Bloom 효과', { exact: true }).check(); await page.getByLabel('바람과 물결', { exact: true }).check();
    for (const preset of ['front', 'back', 'left', 'right', 'top', 'isometric', 'follow']) {
      await page.getByLabel('미니룸 카메라', { exact: true }).selectOption(preset);
      await page.waitForFunction(preset => window.miniroom.diagnostics().camera.preset === preset, preset);
    }
    await page.getByLabel('카메라 투영', { exact: true }).selectOption('perspective');
    await page.waitForFunction(() => window.miniroom.diagnostics().camera.projection === 'perspective');
    const cameraBefore = await page.evaluate(() => window.miniroom.diagnostics().camera.target);
    await page.getByRole('button', { name: '→ 오른쪽', exact: true }).click();
    const cameraAfter = await page.evaluate(() => window.miniroom.diagnostics().camera.target); assert.notDeepEqual(cameraAfter, cameraBefore);
    await page.getByLabel('화면 이동', { exact: true }).uncheck(); assert.equal(await page.getByRole('button', { name: '→ 오른쪽', exact: true }).isDisabled(), true); await page.getByLabel('화면 이동', { exact: true }).check();
    await page.getByLabel('카메라 투영', { exact: true }).selectOption('orthographic');
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('isometric');
    const saved = await save(page); await page.reload(); await page.waitForFunction(() => !!window.miniroom, null, { timeout: 60000 });
    assert.deepEqual((await save(page)).terrain, saved.terrain); assert.deepEqual((await save(page)).room, saved.room);
    result.checks.push('bloom render passes / seven presets / projection switch / saved reload');
    await page.getByRole('button', { name: '둘러보기' }).click();
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('follow'); await page.getByRole('button', { name: '수돗가', exact: true }).click();
    await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 15000 });
    const followed = await page.evaluate(() => window.miniroom.diagnostics()); assert.ok(Math.hypot(followed.camera.target[0] - followed.avatarPosition[0], followed.camera.target[2] - followed.avatarPosition[2]) < 0.01);
    await page.getByRole('button', { name: '광장', exact: true }).click(); await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 15000 });
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('isometric'); result.checks.push('camera pan / disabled control / live avatar follow');
    await page.waitForFunction(() => !window.miniroom.diagnostics().pendingFrame, null, { timeout: 10000 });
    const count = await page.evaluate(() => window.miniroom.diagnostics().renderedFrames); await page.waitForTimeout(650);
    assert.equal(await page.evaluate(() => window.miniroom.diagnostics().renderedFrames), count); result.checks.push('idle renderer settles');
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await bind(mobile);
    await mobile.getByRole('button', { name: '공간 꾸미기' }).click();
    const mobileObjects = await mobile.evaluate(() => window.miniroom.diagnostics().objectCount);
    const mobileSand = await mobile.evaluate(() => window.miniroom.diagnostics().terrain.counts.sand);
    await mobile.getByRole('button', { name: '모래 타일', exact: true }).tap(); await tapWorld(mobile, [0.5, 0, -5.5]);
    await mobile.waitForFunction(count => window.miniroom.diagnostics().terrain.counts.sand === count + 1, mobileSand);
    await mobile.getByRole('button', { name: '화분 배치', exact: true }).tap(); await tapWorld(mobile, [0.5, 0, -5.5]);
    await mobile.waitForFunction(count => window.miniroom.diagnostics().objectCount === count + 1, mobileObjects);
    await snapshot(mobile, '07-mobile-editor');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    result.checks.push('mobile touch paint / furniture placement / no horizontal overflow');
    const roomCode = `probe-${Date.now()}`; const invite = { name: /^초대 · \d+$/ };
    await page.getByRole('button', invite).click(); await page.getByLabel('방 코드', { exact: true }).fill(roomCode); await page.getByLabel('방문 닉네임').fill('Host');
    await page.getByRole('button', { name: '입장', exact: true }).click();
    const guest = await browser.newPage({ viewport: { width: 1280, height: 960 } }); await bind(guest);
    const guestLocal = await guest.evaluate(() => localStorage.getItem('gaesup.minihome.v1'));
    const guestObjects = await guest.evaluate(() => window.miniroom.diagnostics().objectCount);
    await guest.getByRole('button', invite).click(); await guest.getByLabel('방 코드', { exact: true }).fill(roomCode); await guest.getByLabel('방문 닉네임').fill('Guest');
    await guest.getByRole('button', { name: '입장', exact: true }).click();
    await guest.waitForFunction(() => window.miniroom.diagnostics().visitors === 1); await page.waitForFunction(() => window.miniroom.diagnostics().visitors === 1);
    assert.equal(await guest.getByRole('button', { name: '공간 꾸미기' }).isDisabled(), true);
    await page.getByLabel('근거리 메시지', { exact: true }).fill('Nearby hello'); await page.getByRole('button', { name: '보내기', exact: true }).click();
    await guest.getByRole('log').getByText('Nearby hello', { exact: false }).waitFor();
    await clickWorld(guest, [0, 0, 4]); await guest.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 15000 });
    await snapshot(guest, '08-real-visitor');
    await clickWorld(guest, [6, 0, 2]); await guest.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 15000 });
    await page.getByText('Guest · 멀리', { exact: true }).waitFor();
    await page.getByLabel('근거리 메시지', { exact: true }).fill('Outside radius'); await page.getByRole('button', { name: '보내기', exact: true }).click();
    await page.getByRole('log').getByText('Outside radius', { exact: false }).waitFor(); await guest.waitForTimeout(350);
    assert.equal(await guest.getByRole('log').getByText('Outside radius', { exact: false }).count(), 0);
    const snow = await guest.evaluate(() => window.miniroom.diagnostics().terrain.counts.snow);
    await page.getByRole('button', { name: '공간 꾸미기' }).click(); await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('top');
    await page.getByRole('button', { name: '눈 타일', exact: true }).click(); await page.getByLabel('타일 브러시 크기').selectOption('1'); await clickWorld(page, [-3.5, 0, 5.5]);
    await guest.waitForFunction(count => window.miniroom.diagnostics().terrain.counts.snow > count, snow);
    assert.equal(await guest.evaluate(() => localStorage.getItem('gaesup.minihome.v1')), guestLocal);
    await page.getByRole('button', { name: '나가기', exact: true }).click();
    await guest.getByText('1명 접속 · 방 주인', { exact: true }).waitFor();
    assert.equal(await guest.getByRole('button', { name: '미니홈피 저장', exact: true }).isDisabled(), true);
    await guest.waitForTimeout(1400); assert.equal(await guest.evaluate(() => localStorage.getItem('gaesup.minihome.v1')), guestLocal);
    await guest.getByRole('button', { name: '나가기', exact: true }).click(); await page.waitForFunction(() => window.miniroom.diagnostics().visitors === 0);
    await guest.waitForFunction(count => window.miniroom.diagnostics().objectCount === count, guestObjects);
    result.checks.push('two independent browser sessions / real remote avatar / proximity chat / host world sync / guest storage preserved after host transfer / leave cleanup');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ output, checks: result.checks, errors }, null, 2));
  } finally { fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2)); await browser.close(); server.stop(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
