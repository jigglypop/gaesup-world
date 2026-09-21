const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');

const output = path.resolve('.artifacts/minihome', `nature-${new Date().toISOString().replace(/[:.]/g, '-')}`);
fs.mkdirSync(output, { recursive: true });
const base = process.env.GAESUP_PROBE_URL ?? 'http://127.0.0.1:5174/';
const errors = []; const evidence = { output, errors, checks: [] };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu'] });
  try {
    for (const backend of ['auto', 'webgl']) {
      const context = await browser.newContext({ viewport: { width: 1600, height: 1050 } });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(`${backend}: ${error.message}`));
      page.on('console', message => { if (/GPUValidationError|Invalid RenderPipeline|THREE.WebGLProgram: Shader Error|WebGL: INVALID/.test(message.text())) errors.push(`${backend}: ${message.text()}`); });
      await page.goto(`${base}?renderer=${backend}`);
      await page.waitForFunction(() => window.miniroom?.diagnostics().environment?.grassInstances > 30000, null, { timeout: 90000 });
      await page.waitForTimeout(2000);
      const read = () => page.evaluate(() => window.miniroom.diagnostics());
      const save = async () => { await page.getByRole('button', { name: '미니홈피 저장', exact: true }).click(); return page.evaluate(() => JSON.parse(localStorage.getItem('gaesup.minihome.v1'))); };
      const clickWorld = async p => {
        const screen = await page.evaluate(p => { const point = window.miniroom.projectPoint(p); const rect = document.querySelector('canvas').getBoundingClientRect(); return { x: point.x + rect.x, y: point.y + rect.y }; }, p);
        await page.mouse.click(screen.x, screen.y);
      };
      const initial = await read(); evidence[backend] = { initial }; console.log(`${backend}: ready ${initial.backend}`);
      assert.equal(initial.backend, backend === 'webgl' ? 'WebGL2' : 'WebGPU');
      await page.screenshot({ path: path.join(output, `${backend}-garden.png`) });
      const before = initial.camera.position;
      await page.getByLabel('카메라 왼쪽 회전', { exact: true }).click();
      await page.waitForTimeout(300); assert.notDeepEqual((await read()).camera.position, before);
      const rotated = (await read()).camera.position;
      await page.mouse.move(1000, 500); await page.mouse.down({ button: 'right' }); await page.mouse.move(1180, 520, { steps: 12 }); await page.mouse.up({ button: 'right' });
      await page.waitForTimeout(300); assert.notDeepEqual((await read()).camera.position, rotated);
      await page.getByLabel('미니룸 시점 초기화', { exact: true }).click();
      await page.getByRole('button', { name: '라운지', exact: true }).click();
      await page.waitForFunction(() => window.miniroom.diagnostics().movement.state === 'arrived', null, { timeout: 20000 });
      assert.equal((await read()).avatarPosition[1], 0.5);
      evidence.checks.push(`${backend}: dense grass, camera buttons/right drag, stair ascent`);
      await page.getByRole('button', { name: /공간 꾸미기/ }).click();
      await page.getByLabel('바닥 높이', { exact: true }).selectOption('1');
      await page.getByLabel('높이 칠하기', { exact: true }).click();
      await clickWorld([2.5, 0, 6.5]);
      const painted = await save(); const index = (6 + 12) * 24 + 2 + 12;
      assert.equal(painted.terrain.heights[index], 1);
      await page.getByRole('button', { name: '↶ 실행 취소', exact: true }).click(); assert.equal((await save()).terrain.heights[index], 0);
      await page.getByRole('button', { name: '↷ 다시 실행', exact: true }).click(); assert.equal((await save()).terrain.heights[index], 1);
      await page.getByLabel('바닥 높이', { exact: true }).selectOption('0.5');
      await page.getByLabel('계단 방향', { exact: true }).selectOption('south');
      // Keep the target clear of the raised tile, which occludes the cell behind it.
      await page.getByLabel('계단 놓기', { exact: true }).click(); await clickWorld([4.5, 0, 5.5]);
      assert.equal((await save()).terrain.stairs[(5 + 12) * 24 + 4 + 12], 'south');
      await page.getByLabel('땅 확장', { exact: true }).click(); assert.equal((await save()).terrain.size, 32);
      await page.reload(); await page.waitForFunction(() => window.miniroom?.diagnostics().terrain.size === 32, null, { timeout: 90000 });
      assert.equal((await save()).terrain.stairs[(5 + 16) * 32 + 4 + 16], 'south');
      evidence.checks.push(`${backend}: height/stair paint, undo/redo, expansion, persisted height and stairs`);
      await page.getByRole('button', { name: /둘러보기/ }).click();
      await page.locator('.room-settings > summary').click(); await page.getByLabel('날씨', { exact: true }).selectOption('blizzard');
      await page.locator('.room-settings > summary').click(); await page.waitForTimeout(3000);
      assert.equal((await read()).environment.weather, 'blizzard');
      await page.screenshot({ path: path.join(output, `${backend}-blizzard.png`) });
      await page.locator('.room-settings > summary').click(); await page.getByLabel('바람과 물결', { exact: true }).uncheck(); await page.locator('.room-settings > summary').click();
      await page.waitForTimeout(2000); const idle = await read(); await page.waitForTimeout(500); const still = await read();
      assert.equal(still.renderedFrames, idle.renderedFrames); assert.equal(still.environment.elapsed, idle.environment.elapsed);
      await page.getByLabel('카메라 오른쪽 회전', { exact: true }).click(); await page.waitForTimeout(500); assert.ok((await read()).renderedFrames > still.renderedFrames);
      evidence.checks.push(`${backend}: GPU/WebGL blizzard, paused animation stops RAF, rotation wakes paused view`);
      await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.evaluate(() => document.querySelector('canvas').clientWidth <= innerWidth), true);
      assert.equal(await page.getByLabel('카메라 오른쪽 회전', { exact: true }).isVisible(), true);
      await page.screenshot({ path: path.join(output, `${backend}-mobile.png`) });
      evidence[backend].final = await read(); await context.close();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify(evidence, null, 2));
  } catch (error) { evidence.failure = String(error.stack ?? error); console.error(error); process.exitCode = 1; }
  finally { fs.writeFileSync(path.join(output, 'evidence.json'), JSON.stringify(evidence, null, 2)); await browser.close(); }
})();
