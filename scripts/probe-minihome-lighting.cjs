const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { PNG } = require('pngjs');

const { collectPageErrors, launchWebGpuBrowser, startProbeServer } = require('./lib/devServer.cjs');
const { openRoomSettingsOnLoad, saveRoomGlb } = require('./lib/minihome.cjs');

async function main() {
  const output = path.resolve('.artifacts/minihome', `lighting-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.mkdirSync(output, { recursive: true });
  const server = await startProbeServer();
  const browser = await launchWebGpuBrowser();
  const rows = []; const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1040 } });
    collectPageErrors(page, { console: 'gpu', errors });
    await openRoomSettingsOnLoad(page);
    const ready = () => page.waitForFunction(() => window.miniroom?.diagnostics().renderedFrames > 0 && !window.miniroom?.diagnostics().pendingFrame, undefined, { timeout: 60000 });
    async function shot(stage) {
      await ready(); await page.locator('canvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
      const filename = `${stage}.png`; const bytes = await page.locator('canvas').screenshot({ path: path.join(output, filename) });
      const png = PNG.sync.read(bytes); let dark = 0;
      for (let i = 0; i < png.data.length; i += 4) if (Math.max(png.data[i], png.data[i + 1], png.data[i + 2]) < 24) dark++;
      const row = { stage, filename, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), darkFraction: dark / (png.width * png.height), diagnostics: await page.evaluate(() => window.miniroom.diagnostics()) };
      rows.push(row); console.log(JSON.stringify({ stage, darkFraction: row.darkFraction }));
    }
    async function select(label, value) {
      await page.getByLabel(label, { exact: true }).selectOption(value);
      if (label === '미니룸 아바타') await page.waitForFunction(style => window.miniroom?.diagnostics().avatar.style === style, value, { timeout: 60000 });
    }
    await page.goto(server.url); await shot('01-initial');
    await select('미니룸 아바타', 'blue'); await shot('02-avatar');
    await select('미니룸 조명', 'evening'); await shot('03-evening');
    await select('미니룸 화질', 'economy'); await shot('04-economy');
    await select('미니룸 카메라', 'front'); await shot('05-front');
    await page.getByRole('button', { name: '미니홈피 저장' }).click(); await page.reload();
    await page.waitForFunction(() => window.miniroom?.diagnostics().avatar.style === 'blue', undefined, { timeout: 60000 }); await shot('06-reload');
    await select('미니룸 아바타', 'mint'); await shot('07-mint');
    await saveRoomGlb(page, path.join(output, 'export.glb')); await shot('08-export');
    await select('미니룸 카메라', 'isometric'); await shot('09-isometric');
    await select('미니룸 아바타', 'classic'); await shot('10-classic');
    await page.setViewportSize({ width: 390, height: 844 }); await shot('11-mobile');
    assert.deepEqual(errors, []);
    assert.ok(rows.every(row => row.darkFraction < 0.1), 'Unlit room silhouette detected; inspect stage captures.');
  } finally {
    fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({ output, rows, errors }, null, 2));
    await browser.close(); server.stop(); console.log(`Evidence: ${output}`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
