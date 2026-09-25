const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');

const { expectWorldCanvasPaint } = require('./browser-smoke.cjs');
const { ROOT: root, startProbeServer } = require('./lib/devServer.cjs');

async function inspectRenderer(page) {
  return page.evaluate(async () => {
    const { _roots } = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    return [..._roots.values()].map(({ store }) => {
      const { gl, scene } = store.getState();
      const cascades = [];
      scene.traverse((object) => {
        const node = object.shadow?.shadowNode;
        if (node?.camera) cascades.push(node._shadowNodes.length);
      });
      return { native: gl.backend?.isWebGPUBackend === true, cascades };
    });
  });
}

async function main() {
  const server = await startProbeServer();
  const baseUrl = server.url;
  let browser;
  try {
    browser = await chromium.launch({
      channel: process.env.GAESUP_BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'chrome' : 'chromium'),
      headless: true,
      args: ['--enable-unsafe-webgpu', '--enable-gpu'],
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = new Set();
    page.on('pageerror', (error) => errors.add(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || /GPUValidationError|pipeline creation failed|Invalid RenderPipeline/i.test(message.text())) {
        errors.add(`${page.url()}: ${message.text()}`);
      }
    });
    const output = path.join(root, '.tmp', 'webgpu-proof');
    fs.mkdirSync(output, { recursive: true });
    await page.goto(`${baseUrl}/world`, { waitUntil: 'domcontentloaded' });
    await expectWorldCanvasPaint(page);
    await page.waitForTimeout(1500);
    const world = await inspectRenderer(page);
    assert.ok(world.some((item) => item.native && item.cascades.includes(3)), 'Native WebGPU and initialized 3-cascade shadows are required; a fallback is not accepted.');
    await page.screenshot({ path: path.join(output, 'world.png') });

    await page.goto(`${baseUrl}/showcase`, { waitUntil: 'domcontentloaded' });
    const enableEffects = page.getByRole('button', { name: '후처리 켜기', exact: true });
    await enableEffects.waitFor({ timeout: 30000 });
    await expectWorldCanvasPaint(page);
    await enableEffects.click();
    await page.waitForTimeout(3000);
    await expectWorldCanvasPaint(page);
    assert.ok((await inspectRenderer(page)).some((item) => item.native));
    await page.screenshot({ path: path.join(output, 'postprocessing.png') });
    await page.getByRole('button', { name: '후처리 끄기', exact: true }).click();

    await page.goto(`${baseUrl}/performance?mode=worker`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-performance-mode="worker"][data-worker-state="running"]').waitFor({ timeout: 30000 });
    await page.waitForTimeout(1500);
    assert.ok((await inspectRenderer(page)).some((item) => item.native));
    const worker = await page.locator('[data-performance-mode="worker"]').innerText();
    await page.screenshot({ path: path.join(output, 'worker.png') });
    await page.getByRole('button', { name: '메인 CPU · 1만 개', exact: true }).click();
    await page.locator('[data-performance-mode="main"]').waitFor();
    await page.goto(`${baseUrl}/minimal`);
    await page.waitForTimeout(1000);
    assert.deepEqual([...errors], [], 'WebGPU render, worker transition, or cleanup errors');
    const result = { world, worker, errors: [...errors] };
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser?.close();
    server.stop();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
