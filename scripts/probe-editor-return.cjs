const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');
const { sceneSnapshot } = require('./probe-social-world.cjs');

async function state(page) {
  const scene = await sceneSnapshot(page);
  const config = await page.evaluate(async () => {
    const { useGaesupStore } = await import('/src/core/stores/gaesupStore.ts');
    const { useBuildingStore } = await import('/src/core/building/stores/buildingStore.ts');
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const cameras = [..._roots.values()].map(({ store }) => {
      const { camera } = store.getState();
      return { position: camera.position.toArray(), quaternion: camera.quaternion.toArray(), fov: camera.fov, zoom: camera.zoom };
    });
    return { mode: useGaesupStore.getState().mode, options: useGaesupStore.getState().cameraOption, edit: useBuildingStore.getState().editMode, cameras };
  });
  return { scene, ...config };
}

async function main() {
  const output = path.resolve(__dirname, '../.tmp/editor-return-proof');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(process.env.GAESUP_PROBE_URL ?? 'http://127.0.0.1:5188/world');
    await expect(page.getByRole('button', { name: '저장', exact: true })).toBeEnabled({ timeout: 45000 });
    await expect.poll(async () => (await sceneSnapshot(page)).skinned.length, { timeout: 30000 }).toBeGreaterThan(0);
    await page.waitForTimeout(1500);
    const before = await state(page);
    await page.screenshot({ path: path.join(output, 'before.png') });
    await page.getByRole('link', { name: /^(크리에이터|편집기)$/ }).click();
    await page.waitForTimeout(4000);
    const inputTarget = await page.evaluate(() => document.elementFromPoint(780, 460)?.outerHTML.slice(0, 300));
    const cdp = await page.context().newCDPSession(page);
    const canvasObject = await cdp.send('Runtime.evaluate', { expression: 'document.querySelector("canvas")', objectGroup: 'probe' });
    const eventListeners = await cdp.send('DOMDebugger.getEventListeners', { objectId: canvasObject.result.objectId });
    console.log('Canvas listeners', eventListeners.listeners.map(({ type, handler }) => ({ type, handler: handler?.description })));
    const wheelHandler = eventListeners.listeners.find(listener => listener.type === 'wheel').handler.objectId;
    console.log('Canvas count', await page.locator('canvas').count());
    await page.evaluate(async () => {
      window.__probeEvents = [];
      for (const name of ['wheel', 'mousedown', 'mouseup']) document.addEventListener(name, event => window.__probeEvents.push([name, event.target.tagName, event.deltaY, event.button]), true);
      const { useGaesupStore } = await import('/src/core/stores/gaesupStore.ts');
      useGaesupStore.subscribe((next, previous) => { if (next.cameraOption !== previous.cameraOption) window.__probeEvents.push(['config', next.cameraOption.zoom, new Error().stack]); });
    });
    await page.mouse.move(780, 460);
    await page.mouse.wheel(0, -450);
    await page.waitForTimeout(600);
    console.log('After physical wheel', (await state(page)).options.zoom);
    await cdp.send('Runtime.callFunctionOn', { objectId: wheelHandler, functionDeclaration: 'function() { this(new WheelEvent("wheel", { deltaY: -100 })); }' });
    console.log('After direct callback', (await state(page)).options.zoom);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(1000, 620, { steps: 12 });
    await page.mouse.up({ button: 'right' });
    await page.waitForTimeout(1200);
    const editor = await state(page);
    console.log('Input events', await page.evaluate(() => window.__probeEvents));
    await page.screenshot({ path: path.join(output, 'editor.png') });
    await page.getByRole('link', { name: '월드', exact: true }).click();
    await expect(page.getByRole('button', { name: '저장', exact: true })).toBeEnabled({ timeout: 30000 });
    await page.waitForTimeout(4000);
    const after = await state(page);
    await page.screenshot({ path: path.join(output, 'after.png') });
    const result = { before, editor, after, inputTarget, errors };
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    assert.equal(after.mode.control, 'thirdPerson');
    assert.equal(after.mode.controller, 'keyboard');
    assert.equal(after.edit, 'none');
    assert.ok(after.scene.skinned.length > 0);
    assert.ok(after.cameras[0].position[1] < 15, 'Editor camera leaked into world');
    assert.equal(after.options.zoom, 1);
    assert.notEqual(editor.options.zoom, 1, 'Editor wheel must change zoom');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
