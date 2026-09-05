const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

if (!process.argv[2]) throw Error('Usage: node scripts/probe-r3f10-world.cjs <built-demo-directory>');

(async () => {
  const { preview } = await import('vite');
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-r3f10-world-'));
  const server = await preview({
    configFile: false,
    build: { outDir: path.resolve(process.argv[2]) },
    preview: { host: '127.0.0.1', port: 0, proxy: { '/gltf': 'http://127.0.0.1:5173' } },
    logLevel: 'warn',
  });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.addInitScript(() => {
      const warn = console.warn.bind(console);
      console.warn = (...args) => {
        if (args.some(value => typeof value === 'string' && value.includes('invalidation ignored'))) {
          warn(...args, new Error('Invalidation origin').stack);
        } else warn(...args);
      };
    });
    const errors = [];
    const consoleErrors = [];
    const lifecycleWarnings = [];
    const failedRequests = [];
    page.on('pageerror', error => errors.push(error.stack));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('console', message => {
      if (/teardown may be incomplete|invalidation ignored/i.test(message.text())) lifecycleWarnings.push(message.text());
    });
    page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    const captureScene = () => page.evaluate(() => {
      const state = globalThis.__worldProbeState?.get();
      if (!state) return null;
      const objects = [];
      state.scene.traverse(object => {
        if (!object.geometry) return;
        objects.push({
          name: object.name, type: object.type, visible: object.visible,
          vertices: object.geometry.attributes.position?.count,
          position: object.matrixWorld.elements.slice(12, 15),
          scale: object.scale.toArray(), count: object.count,
          material: Array.isArray(object.material) ? object.material.map(m => m.type) : object.material?.type,
          materialState: Array.isArray(object.material) ? null : { uuid: object.material?.uuid, visible: object.material?.visible, opacity: object.material?.opacity, version: object.material?.version },
          bounds: object.geometry.boundingSphere?.radius,
          drawRange: object.geometry.drawRange,
        });
      });
      return { rootId: state.internal.rootId, frame: state.internal.actualRenderer?.info.render.frame, camera: state.camera.matrixWorld.toArray(), renderer: state.internal.actualRenderer?.constructor.name, isLegacy: state.isLegacy, objects };
    });
    const waitForScene = previousRootId => page.waitForFunction(previous => {
      const state = globalThis.__worldProbeState?.get();
      if (!state) return true;
      return state.internal.rootId !== previous
        && state.internal.active
        && state.internal.actualRenderer?.info.render.frame >= 3
        && state.scene.getObjectByName('sand-surface');
    }, previousRootId, { timeout: 20000 });
    await page.goto(new URL('world', server.resolvedUrls.local[0]).href);
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(error => errors.push(error.message));
    await waitForScene(null);
    process.stdout.write(await page.locator('body').ariaSnapshot() + '\n');
    await page.screenshot({ path: path.join(outputRoot, 'world.png'), fullPage: false });
    const initialScene = await captureScene();
    await page.getByRole('button', { name: '월드 도구', exact: true }).click();
    process.stdout.write(await page.locator('body').ariaSnapshot() + '\n');
    await page.getByRole('link', { name: '에셋', exact: true }).click();
    await expect(page.getByRole('heading', { name: '에셋 둘러보기', exact: true })).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    process.stdout.write(await page.getByRole('navigation', { name: '주 메뉴', exact: true }).ariaSnapshot() + '\n');
    await page.getByRole('link', { name: '월드', exact: true }).click();
    await expect(page.getByRole('button', { name: '월드 도구', exact: true })).toBeVisible();
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(error => errors.push(error.message));
    await waitForScene(initialScene?.rootId ?? null);
    await page.screenshot({ path: path.join(outputRoot, 'world-return.png'), fullPage: false });
    fs.writeFileSync(path.join(outputRoot, 'scenes.json'), JSON.stringify({ initial: initialScene, returned: await captureScene() }, null, 2));
    const result = { outputRoot, errors, consoleErrors, lifecycleWarnings, failedRequests, canvases: await page.locator('canvas').count() };
    fs.writeFileSync(path.join(outputRoot, 'result.json'), JSON.stringify(result, null, 2));
    process.stdout.write(JSON.stringify(result) + '\n');
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(lifecycleWarnings, []);
    assert.deepEqual(failedRequests, []);
    assert.ok(result.canvases > 0);
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
