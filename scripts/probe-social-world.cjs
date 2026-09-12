const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

const baseUrl = process.env.GAESUP_PROBE_URL ?? 'http://127.0.0.1:5188';
const output = path.resolve(__dirname, '../.tmp/social-world-proof');

async function sceneSnapshot(page) {
  return page.evaluate(async () => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const result = { skinned: [], trees: 0, objects: [], position: null, facing: null, cameraForward: null };
    for (const { store } of _roots.values()) {
      const { scene, camera } = store.getState();
      result.cameraForward = camera.getWorldDirection(camera.position.clone()).toArray();
      scene.traverse((node) => {
        if (node.isSkinnedMesh && node.visible) {
          result.skinned.push(node.name);
          if (!result.position) {
            node.updateWorldMatrix(true, false);
            result.position = Array.from(node.matrixWorld.elements).slice(12, 15);
            result.facing = [node.matrixWorld.elements[8], 0, node.matrixWorld.elements[10]];
          }
        }
        if (node.name === 'world-tree-batch') result.trees += node.count;
        if (node.isMesh && /Staff|Sword|Axe/i.test(node.name)) result.objects.push(node.name);
      });
    }
    return result;
  });
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const legacyAssets = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => { if (/ally.*\.glb/i.test(request.url())) legacyAssets.push(request.url()); });
  try {
    await page.goto(`${baseUrl}/world`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: '저장', exact: true })).toBeEnabled({ timeout: 45000 });
    await expect.poll(async () => (await sceneSnapshot(page)).trees, { timeout: 30000 }).toBeGreaterThanOrEqual(12);
    await page.waitForTimeout(2000);
    const initial = await sceneSnapshot(page);
    assert.ok(initial.skinned.some((name) => name.startsWith('Rogue_')));
    await page.screenshot({ path: path.join(output, 'world.png') });
    await page.getByRole('button', { name: '내 캐릭터 C' }).click();
    await page.getByRole('button', { name: '작은 마법사', exact: true }).click();
    await expect.poll(async () => (await sceneSnapshot(page)).skinned.some((name) => name.startsWith('Mage_')), { timeout: 30000 }).toBe(true);
    await page.getByRole('button', { name: '지팡이', exact: true }).click();
    await expect.poll(async () => (await sceneSnapshot(page)).objects.length, { timeout: 15000 }).toBeGreaterThan(0);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(output, 'character-equipment.png') });
    await page.getByRole('button', { name: '캐릭터 패널 닫기' }).click();
    const directions = [];
    for (const key of ['w', 's', 'a', 'd']) {
      const before = await sceneSnapshot(page);
      const [fx, , fz] = before.cameraForward;
      const expected = key === 'w' ? [fx, fz] : key === 's' ? [-fx, -fz] : key === 'd' ? [-fz, fx] : [fz, -fx];
      await page.keyboard.down(key);
      await page.waitForTimeout(450);
      const moving = await sceneSnapshot(page);
      await page.keyboard.up(key);
      const dx = moving.position[0] - before.position[0];
      const dz = moving.position[2] - before.position[2];
      const directionDot = (dx * expected[0] + dz * expected[1]) / (Math.hypot(dx, dz) * Math.hypot(...expected));
      const facingDot = (dx * moving.facing[0] + dz * moving.facing[2]) / (Math.hypot(dx, dz) * Math.hypot(moving.facing[0], moving.facing[2]));
      assert.ok(directionDot > .8, `${key}: movement is opposite screen direction (${directionDot})`);
      assert.ok(facingDot > .8, `${key}: avatar faces away from travel (${facingDot})`);
      directions.push({ key, dx, dz, directionDot, facingDot });
      await page.waitForTimeout(600);
    }
    const beforeMove = await sceneSnapshot(page);
    await page.keyboard.down('w');
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(output, 'walking.png') });
    await page.keyboard.up('w');
    const afterMove = await sceneSnapshot(page);
    const movement = Math.hypot(afterMove.position[0] - beforeMove.position[0], afterMove.position[2] - beforeMove.position[2]);
    assert.ok(movement > .5, `WASD movement missing: ${movement}`);
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await expect(page.getByText('캐릭터와 공간을 저장했습니다.', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: '저장', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: '내 캐릭터 C' }).click();
    await expect(page.getByRole('button', { name: '작은 마법사', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '지팡이', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const body = await page.locator('body').innerText();
    assert.ok(!/월드 도구|퀘스트|제작대|사과|벨 잔액/.test(body), 'Economy UI must not mount in WORLD');
    await page.goto(`${baseUrl}/creator`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4500);
    await page.screenshot({ path: path.join(output, 'creator.png') });
    const editor = await page.locator('body').innerText();
    assert.ok(/타일|Tile/.test(editor), 'Tile editor must remain accessible');
    assert.deepEqual(legacyAssets, [], 'WORLD/creator must not request ally GLBs');
    assert.deepEqual(errors, [], 'Browser errors');
    const result = { initial, beforeMove, afterMove, directions, movement, legacyAssets, errors, editor };
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'failure.png') });
    console.error({ errors, legacyAssets, text: await page.locator('body').innerText() });
    throw error;
  } finally {
    await browser.close();
  }
}
module.exports = { sceneSnapshot };
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
