const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const { chromium } = require('@playwright/test');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '.tmp/unified-world');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, env: { ...process.env, BROWSER: 'none' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const logs = [], errors = [], warnings = [];
  server.stdout.on('data', data => logs.push(String(data)));
  server.stderr.on('data', data => logs.push(String(data)));
  let browser;
  const result = {};
  try {
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(base)).ok) break; } catch {}
      await delay(200);
    }
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu'] });
    result.browser = browser.version();
    const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' || /GPUValidationError|Invalid RenderPipeline/.test(message.text())) { errors.push(message.text()); console.log('ERROR', message.text()); }
      else if (message.type() === 'warning') warnings.push(message.text());
    });
    await page.goto(`${base}/scripts/fixtures/unified-world.html`);
    await page.waitForTimeout(2500);
    await page.waitForFunction(async () => (await window.worldProbe?.())?.gpu >= 3, null, { timeout: 45000 });
    await page.waitForTimeout(1500);
    result.initial = await page.evaluate(() => window.worldProbe());
    assert.equal(result.initial.sources, 4, 'blocks, multi-material walls, and box tiles');
    assert.equal(result.initial.gpu, 6, 'adjacent wall side groups merged');
    assert.equal(result.initial.native, true);
    assert.equal(result.initial.readbacks, 0, 'no CPU culling readback');
    assert.ok(result.initial.shadows > 0, 'original instances cast shadows');
    await page.waitForTimeout(300);
    assert.equal((await page.evaluate(() => window.worldProbe())).computeCalls, result.initial.computeCalls, 'stationary camera reuses culling output');
    result.front = await page.evaluate(() => window.worldProbe(true));
    assert.ok(result.front.counts.every(count => count > 0));
    result.picking = await page.evaluate(() => window.pickWorld());
    assert.ok(result.picking.includes(0), 'stable source instance picking');
    await page.screenshot({ path: path.join(output, 'balanced.png') });
    await page.evaluate(() => window.moveWorld());
    await page.waitForTimeout(500);
    result.away = await page.evaluate(() => window.worldProbe(true));
    assert.ok(result.away.counts.every(count => count === 0), 'offscreen GPU indirect counts');
    await page.evaluate(() => { window.restoreWorld(); window.editWorld(); window.resetHistory(); });
    await page.waitForTimeout(800);
    result.edited = await page.evaluate(() => window.worldProbe(true));
    assert.ok(result.edited.counts.every(count => count > 0));
    const projection = result.edited.projection;
    await page.waitForTimeout(200);
    assert.deepEqual((await page.evaluate(() => window.worldProbe())).projection, projection, 'camera jitter restored');
    result.qualities = {};
    for (const quality of ['performance', 'quality', 'balanced', 'quality', 'balanced']) {
      await page.evaluate(quality => window.setWorldQuality(quality), quality);
      await page.waitForTimeout(800);
      result.qualities[quality] = await page.evaluate(() => window.worldProbe());
      await page.screenshot({ path: path.join(output, `${quality}.png`) });
    }
    await page.evaluate(() => window.setWorldEnabled(false));
    await page.waitForTimeout(500);
    result.removed = await page.evaluate(() => window.worldProbe());
    assert.equal(result.removed.gpu, 0);
    assert.equal(result.removed.sources, 0);
    await page.evaluate(() => window.setWorldEnabled(true));
    await page.waitForFunction(async () => (await window.worldProbe())?.gpu >= 3);
    await page.waitForTimeout(500);
    result.remounted = await page.evaluate(() => window.worldProbe());
    assert.equal(result.remounted.storage, result.initial.storage, 'GPU storage resources released on remount');
    assert.equal(result.remounted.textures, result.initial.textures, 'postprocess resources stable across quality changes');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(350);
    result.resized = await page.evaluate(() => window.worldProbe());
    assert.notDeepEqual(result.resized.projection, result.remounted.projection);
    assert.equal(result.resized.textures, result.initial.textures);
    await page.setViewportSize({ width: 960, height: 640 });
    await page.waitForTimeout(350);
    assert.deepEqual((await page.evaluate(() => window.worldProbe())).projection, result.remounted.projection);
    await page.evaluate(() => window.editMaterial(true));
    await page.waitForTimeout(500);
    result.transparent = await page.evaluate(() => window.worldProbe());
    assert.equal(result.transparent.gpu, 2, 'transparent material batches keep original rendering');
    await page.evaluate(() => window.editMaterial(false));
    await page.waitForFunction(async () => (await window.worldProbe()).gpu === 6);
    await page.waitForTimeout(500);
    const residentImage = await page.screenshot({ path: path.join(output, 'resident-comparison.png') });
    await page.evaluate(() => window.setResident(false));
    await page.waitForTimeout(400);
    assert.equal((await page.evaluate(() => window.worldProbe())).gpu, 0);
    const standardImage = await page.screenshot({ path: path.join(output, 'standard-instances.png') });
    const a = PNG.sync.read(residentImage), b = PNG.sync.read(standardImage);
    let sum = 0, large = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      const difference = Math.max(...[0, 1, 2].map(channel => Math.abs(a.data[i + channel] - b.data[i + channel])));
      sum += difference;
      if (difference > 30) large++;
    }
    result.imageComparison = { meanMaxChannelDifference: sum / (a.width * a.height), fractionAbove30: large / (a.width * a.height) };
    assert.ok(result.imageComparison.meanMaxChannelDifference < 4 && result.imageComparison.fractionAbove30 < 0.02, 'resident material/shadow image matches original instances');
    await page.evaluate(() => window.unmountWorld());
    await page.waitForTimeout(200);
    await page.goto(`${base}/scripts/fixtures/unified-world.html?legacy`);
    await page.waitForTimeout(2000);
    await page.waitForFunction(async () => (await window.worldProbe?.())?.sources >= 3);
    result.legacy = await page.evaluate(() => window.worldProbe());
    assert.equal(result.legacy.native, false);
    assert.equal(result.legacy.gpu, 0);
    await page.screenshot({ path: path.join(output, 'webgl.png') });
    await page.evaluate(() => window.unmountWorld());
    await page.waitForTimeout(200);
    assert.deepEqual(errors, []);
    result.errors = errors;
    result.warnings = warnings;
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser?.close(); server.kill();
    fs.writeFileSync(path.join(output, 'vite.log'), logs.join(''));
    fs.writeFileSync(path.join(output, 'errors.json'), JSON.stringify({ errors, warnings, result }, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
