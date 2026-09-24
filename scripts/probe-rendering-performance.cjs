const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');
const { PNG } = require('pngjs');

const { ROOT: root, startDevServer } = require('./lib/devServer.cjs');

const output = path.join(root, '.tmp/rendering-performance');
function painted(buffer) {
  const png = PNG.sync.read(buffer);
  let visible = 0;
  for (let i = 0; i < png.data.length; i += 4) if (Math.max(png.data[i], png.data[i + 1], png.data[i + 2]) > 65) visible++;
  return visible;
}
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const { url: base, logs: serverLog, stop } = await startDevServer();
  let browser;
  const errors = [];
  const result = { scenarios: [] };
  try {
    browser = await chromium.launch({ channel: process.env.GAESUP_BROWSER_CHANNEL ?? 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu'] });
    result.browser = browser.version();
    const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('console', message => { if (message.type() === 'error' || /GPUValidationError|Invalid RenderPipeline/.test(message.text())) errors.push(message.text()); });
    await page.goto(`${base}/scripts/fixtures/rendering-performance.html`);
    console.log('Loaded rendering fixture');
    // Vite can reload once after discovering the lazy WebGPU dependencies.
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => window.readRenderProbe?.().particles.length === 1, null, { timeout: 45000 });
    assert.equal((await page.evaluate(() => window.readRenderProbe())).native, true);
    result.adapter = await page.evaluate(async () => {
      const adapter = await navigator.gpu.requestAdapter();
      const info = adapter.info;
      return { vendor: info.vendor, architecture: info.architecture, device: info.device, description: info.description, fallback: adapter.isFallbackAdapter };
    });
    for (const kind of ['rain', 'snow', 'storm', 'wind']) {
      const previous = await page.evaluate(() => window.readRenderProbe().particles[0].uuid);
      await page.evaluate(kind => window.setWeatherKind(kind), kind);
      if (kind !== 'rain') await page.waitForFunction(previous => window.readRenderProbe().particles[0]?.uuid !== previous, previous);
      await page.waitForTimeout(250);
      const before = await page.evaluate(() => window.readRenderProbe());
      const imageBefore = await page.screenshot();
      await page.waitForTimeout(350);
      const after = await page.evaluate(() => window.readRenderProbe());
      const imageAfter = await page.screenshot({ path: path.join(output, `${kind}.png`) });
      assert.equal(after.particles[0].count, 5000);
      assert.equal(after.particles[0].version, 0, `${kind}: static GPU positions`);
      assert.deepEqual(after.particles[0].sample, before.particles[0].sample);
      assert.ok(after.particles[0].time > before.particles[0].time, `${kind}: time advances`);
      assert.ok(painted(imageAfter) > 100, `${kind}: particles must paint`);
      assert.ok(!imageBefore.equals(imageAfter), `${kind}: rendered motion`);
      result.scenarios.push({ kind, paintedPixels: painted(imageAfter), frames: after.frames - before.frames, positionVersion: after.particles[0].version });
      console.log(`Verified ${kind}`);
    }
    const followBefore = await page.evaluate(() => window.readRenderProbe().particles[0].position);
    await page.evaluate(() => window.moveCamera());
    await page.waitForTimeout(100);
    const followAfter = await page.evaluate(() => window.readRenderProbe().particles[0].position);
    assert.equal(followAfter[0] - followBefore[0], 2);
    const resourcesBefore = await page.evaluate(() => window.readRenderProbe());
    for (let i = 0; i < 12; i++) {
      await page.evaluate(i => window.setPostSettings({ bloomStrength: i / 10, bloomRadius: 0.3, bloomThreshold: 0.8, saturation: 1 + i / 20 }), i);
      await page.waitForTimeout(30);
    }
    const resourcesAfter = await page.evaluate(() => window.readRenderProbe());
    assert.equal(resourcesAfter.textures, resourcesBefore.textures, 'numeric edits retain postprocessing textures');
    result.texturesAcrossEdits = [resourcesBefore.textures, resourcesAfter.textures];
    result.orbit = await page.evaluate(() => window.benchmarkOrbit());
    await page.evaluate(() => window.setWeatherEnabled(false));
    await page.waitForFunction(() => window.readRenderProbe().particles.length === 0);
    await page.evaluate(() => window.setWeatherEnabled(true));
    await page.waitForFunction(() => window.readRenderProbe().particles.length === 1);
    await page.evaluate(() => window.unmountProbe());
    await page.waitForTimeout(200);
    await page.goto(`${base}/scripts/fixtures/rendering-performance.html?legacy`);
    await page.waitForFunction(() => window.readRenderProbe?.().particles.length === 1);
    const legacyBefore = await page.evaluate(() => window.readRenderProbe());
    await page.waitForTimeout(350);
    const legacyAfter = await page.evaluate(() => window.readRenderProbe());
    assert.equal(legacyAfter.native, false);
    assert.ok(legacyAfter.particles[0].version > legacyBefore.particles[0].version);
    assert.notDeepEqual(legacyAfter.particles[0].sample, legacyBefore.particles[0].sample);
    const legacyImage = await page.screenshot({ path: path.join(output, 'webgl.png') });
    assert.ok(painted(legacyImage) > 100);
    result.webgl = { animated: true, paintedPixels: painted(legacyImage) };
    await page.evaluate(() => window.unmountProbe());
    await page.waitForTimeout(200);
    await page.goto(`${base}/scripts/fixtures/gpu-driven.html`);
    await page.waitForFunction(() => window.probe !== undefined);
    const indirect = await page.evaluate(() => window.probe);
    assert.equal(indirect.error, undefined, indirect.error);
    result.indirect = indirect.result;
    await page.goto(`${base}/engine`);
    await page.locator('[data-backend="Native WebGPU"]').waitFor({ timeout: 45000 });
    await page.getByRole('button', { name: 'Engine lab', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="active-mode"]')?.textContent === 'gpu');
    await page.getByRole('button', { name: /자동 탐험/ }).click();
    await page.waitForTimeout(500);
    const engineImage = await page.screenshot({ path: path.join(output, 'engine.png') });
    assert.ok(painted(engineImage) > 100);
    result.engine = { backend: await page.locator('[data-backend]').getAttribute('data-backend'), mode: await page.getByTestId('active-mode').innerText(), visible: await page.getByTestId('visible-count').innerText() };
    await page.getByRole('button', { name: /CPU 컬링/ }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="active-mode"]')?.textContent === 'cpu');
    await page.getByRole('button', { name: /GPU 간접 드로우/ }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="active-mode"]')?.textContent === 'gpu');
    await page.goto('about:blank');
    assert.deepEqual(errors, []);
    result.errors = errors;
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser?.close();
    stop();
    fs.writeFileSync(path.join(output, 'vite.log'), serverLog.join(''));
    fs.writeFileSync(path.join(output, 'errors.json'), JSON.stringify(errors, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
