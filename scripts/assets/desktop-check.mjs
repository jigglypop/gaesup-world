import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from '@playwright/test';

import { buildDelivery } from './build.mjs';

const directory = path.resolve('.asset-work', `desktop-check-${Date.now()}`);
await mkdir(directory, { recursive: true });
const delivery = path.join(directory, 'delivery');
await mkdir(delivery);
for (const level of [0, 1, 2])
  await copyFile('public/gltf/props/table.glb', path.join(delivery, `lod${level}.glb`));
await buildDelivery(delivery, {
  id: 'legacy-table-diagnostic',
  version: '1',
  name: 'Legacy table diagnostic (not product art)',
  kind: 'object3d',
  source: {
    author: 'legacy repository',
    license: 'unverified',
    sourcePath: 'public/gltf/props/table.glb',
    generator: 'diagnostic reuse; identical LOD geometry',
  },
  colliders: [],
  sockets: [],
});
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu'],
});
const report = {
  startedAt: new Date().toISOString(),
  scope: 'desktop diagnostic; legacy fixture, not new character approval',
  errors: [],
  checks: [],
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (error) => report.errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text());
  });
  await page.goto('http://127.0.0.1:5188/asset-review');
  await page.getByRole('heading', { name: '제품 에셋 검수', exact: true }).waitFor();
  await page
    .locator('input[type=file]')
    .setInputFiles(
      (await readdir(delivery))
        .filter(
          (file) =>
            file === 'manifest.json' ||
            file.endsWith('-meshopt.glb') ||
            file.endsWith('-fallback.glb'),
        )
        .map((file) => path.join(delivery, file)),
    );
  await page.getByLabel('검수자', { exact: true }).fill('desktop diagnostic');
  await page
    .getByLabel('검수 근거 / 캡처 경로', { exact: true })
    .fill('Automated loading check; no art approval issued');
  await page.waitForFunction(() =>
    [...document.querySelectorAll('button')].some(
      (button) => button.textContent.includes('아트 승인 기록') && !button.disabled,
    ),
  );
  report.checks.push('meshopt loaded');
  report.environment = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      userAgent: navigator.userAgent,
      renderer: debug
        ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER),
      width: canvas.width,
      height: canvas.height,
      backend: 'webgl2',
    };
  });
  await page.screenshot({ path: path.join(directory, 'review.png'), fullPage: true });
  for (let index = 0; index < 100; index++) {
    await page.getByLabel('LOD').selectOption(String(index % 3));
    await page.getByLabel('납품 변형본').selectOption(index % 2 ? 'fallback' : 'primary');
    await page.getByLabel('회색 실루엣', { exact: true }).setChecked(index % 2 === 0);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('button')].some(
        (button) => button.textContent.includes('아트 승인 기록') && !button.disabled,
      ),
    );
  }
  report.checks.push('100 LOD/variant/silhouette changes (not outfit swaps)');
  report.contextRecovery = await page.evaluate(async () => {
    const canvas = document.querySelector('canvas');
    const extension = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    if (!extension) return 'unsupported';
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve('timeout'), 10000);
      canvas.addEventListener(
        'webglcontextrestored',
        () => {
          clearTimeout(timeout);
          resolve('restored');
        },
        { once: true },
      );
      canvas.addEventListener(
        'webglcontextlost',
        () => setTimeout(() => extension.restoreContext(), 250),
        { once: true },
      );
      extension.loseContext();
    });
  });
  await page.screenshot({ path: path.join(directory, 'review-restored.png'), fullPage: true });
  await page.goto('http://127.0.0.1:5188/world');
  await page.locator('canvas').first().waitFor({ timeout: 60000 });
  await page.screenshot({ path: path.join(directory, 'world.png'), fullPage: true });
  report.worldFrameTiming = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const start = performance.now();
        let frames = 0;
        function frame(now) {
          frames++;
          if (now - start < 10000) requestAnimationFrame(frame);
          else
            resolve({
              frames,
              seconds: (now - start) / 1000,
              rafPerSecond: (frames * 1000) / (now - start),
              note: 'RAF cadence, not GPU timing',
            });
        }
        requestAnimationFrame(frame);
      }),
  );
  report.checks.push('world canvas mounted');
  await page.screenshot({ path: path.join(directory, 'world-settled.png'), fullPage: true });
  report.reviewApprovalButtonUsed = false;
} catch (error) {
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  process.stdout.write(JSON.stringify({ directory, ...report }, null, 2));
}
