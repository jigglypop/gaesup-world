const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');

async function main() {
  const output = path.resolve('.artifacts/minihome', new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu'] });
  const errors = [];
  const screenshots = [];
  const evidence = {};
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1040 } });
    await page.addInitScript(() => {
      const Native = window.AudioContext;
      window.__miniAudioContexts = [];
      window.__miniAudioSources = new Set();
      window.AudioContext = class extends Native {
        constructor(...args) { super(...args); window.__miniAudioContexts.push(this); }
        createOscillator() {
          const source = super.createOscillator(); const start = source.start.bind(source);
          source.start = (...args) => { window.__miniAudioSources.add(source); source.addEventListener('ended', () => window.__miniAudioSources.delete(source), { once: true }); return start(...args); };
          return source;
        }
      };
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/GPUValidationError|Invalid RenderPipeline/.test(message.text())) errors.push(message.text()); });
    await page.goto(process.env.GAESUP_PROBE_URL ?? 'http://127.0.0.1:5174');
    await page.waitForFunction(() => !!window.miniroom, { timeout: 60000 });
    const waitStyle = style => page.waitForFunction(expected => {
      const avatar = window.miniroom?.diagnostics().avatar;
      return avatar?.style === expected && avatar.status === 'ready' && !document.querySelector('[role="alert"]');
    }, style, { timeout: 60000 });
    for (const style of ['coral', 'blue', 'mint']) {
      await page.getByLabel('미니룸 아바타', { exact: true }).selectOption(style);
      await waitStyle(style);
      const avatar = await page.evaluate(() => window.miniroom.diagnostics().avatar);
      assert.ok(avatar.parts >= 5, JSON.stringify(avatar));
      assert.equal(avatar.animation, 'idle');
      await page.locator('canvas').scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const image = path.join(output, `avatar-${style}.png`);
      await page.locator('.miniroom-view').screenshot({ path: image }); screenshots.push(image);
    }
    evidence.avatarPresets = true;
    assert.equal(await page.evaluate(() => window.__miniAudioContexts.length), 0, 'AudioContext must remain lazy');
    await page.getByRole('button', { name: '배경음 재생', exact: true }).click();
    await page.waitForFunction(() => window.__miniAudioContexts[0]?.state === 'running' && window.__miniAudioSources.size > 0);
    await page.getByLabel('미니룸 배경음', { exact: true }).selectOption('bright');
    await page.getByRole('button', { name: '배경음 정지', exact: true }).click();
    await page.waitForFunction(() => window.__miniAudioSources.size === 0);
    assert.equal(await page.evaluate(() => window.__miniAudioContexts.length), 1);
    evidence.audioLazyStartStop = true;
    // A failed outfit load must retain the last complete avatar and be retryable.
    await page.route('**/top-002.glb', route => route.abort());
    await page.getByLabel('미니룸 아바타', { exact: true }).selectOption('blue');
    await page.getByRole('button', { name: '아바타 다시 불러오기', exact: true }).waitFor({ timeout: 60000 });
    assert.equal(await page.evaluate(() => window.miniroom.diagnostics().avatar.style), 'mint');
    await page.unroute('**/top-002.glb');
    await page.getByRole('button', { name: '아바타 다시 불러오기', exact: true }).click();
    await waitStyle('blue'); evidence.failedOutfitPreservesPrevious = true;
    await page.getByLabel('미니룸 조명', { exact: true }).selectOption('evening');
    await page.getByLabel('미니룸 화질', { exact: true }).selectOption('economy');
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('front');
    await page.getByRole('button', { name: '미니홈피 저장' }).click();
    await page.reload(); await waitStyle('blue');
    assert.equal(await page.evaluate(() => window.__miniAudioContexts.length), 0, 'Saved preference must not autoplay');
    assert.equal(await page.getByLabel('미니룸 배경음', { exact: true }).inputValue(), 'bright');
    evidence.audioPreferenceWithoutAutoplay = true;
    for (const [label, value] of [['미니룸 조명', 'evening'], ['미니룸 화질', 'economy'], ['미니룸 카메라', 'front']]) assert.equal(await page.getByLabel(label, { exact: true }).inputValue(), value);
    evidence.settingsReload = true;
    await page.getByLabel('미니룸 아바타', { exact: true }).selectOption('mint'); await waitStyle('mint');
    await page.getByRole('button', { name: '실행 취소', exact: true }).click(); await waitStyle('blue');
    await page.getByRole('button', { name: '다시 실행', exact: true }).click(); await waitStyle('mint');
    evidence.avatarUndoRedo = true;
    // Export must retain skin joints within the exported scene.
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: '3D 방 내보내기 (.glb)', exact: true }).click();
    const glbPath = path.join(output, 'avatar-room.glb'); await (await download).saveAs(glbPath);
    const validation = await require('gltf-validator').validateBytes(new Uint8Array(fs.readFileSync(glbPath)));
    assert.equal(validation.issues.numErrors, 0, JSON.stringify(validation.issues));
    evidence.glbErrors = validation.issues.numErrors;
    await page.getByLabel('미니룸 카메라', { exact: true }).selectOption('isometric');
    const canvas = page.locator('canvas'); await canvas.scrollIntoViewIfNeeded();
    await canvas.focus(); await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => window.miniroom?.diagnostics().avatar.animation === 'walk');
    await page.waitForFunction(() => window.miniroom?.diagnostics().avatar.animation === 'idle');
    await page.waitForFunction(() => !window.miniroom?.diagnostics().pendingFrame);
    const idle = await page.evaluate(() => window.miniroom.diagnostics().loopCallbacks);
    await page.waitForTimeout(800);
    assert.equal(await page.evaluate(() => window.miniroom.diagnostics().loopCallbacks), idle);
    evidence.walkIdleDemandLoop = true;
    for (let i = 0; i < 6; i++) {
      const style = i % 2 ? 'classic' : 'coral';
      await page.getByLabel('미니룸 아바타', { exact: true }).selectOption(style); await waitStyle(style);
    }
    evidence.repeatedSwitches = 6;
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    evidence.mobileOverflow = false;
    assert.deepEqual(errors, []);
  } finally {
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ evidence, errors, screenshots }, null, 2));
    await browser.close(); console.log(JSON.stringify({ output, evidence, errors }, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
