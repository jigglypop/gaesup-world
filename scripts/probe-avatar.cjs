const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const { chromium } = require('@playwright/test');

async function main() {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, '.tmp/avatar-browser');
  await fs.mkdir(output, { recursive: true });
  const { createServer } = await import('vite');
  const server = await createServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: { host: '127.0.0.1', port: 0, open: false },
  });
  await server.listen();
  let browser;
  try {
    const address = server.httpServer.address();
    const url = `http://127.0.0.1:${address.port}/avatar`;
    browser = await chromium.launch({
      headless: true,
      ...(process.env.AVATAR_BROWSER_CHANNEL
        ? { channel: process.env.AVATAR_BROWSER_CHANNEL }
        : {}),
      args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist'],
    });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const equipment = async () =>
      JSON.parse(await page.getByTestId('avatar-equipment').textContent());
    const ready = () =>
      page.locator('.avatar-studio[data-ready="true"]').waitFor({ timeout: 60000 });
    await page.goto(url);
    await ready();
    assert.equal((await equipment()).top, 'top-001');
    await page.getByRole('button', { name: '상의', exact: true }).click();
    await page.getByRole('button', { name: /블루 재킷/ }).click();
    await page.waitForFunction(() =>
      document.querySelector('[data-testid="avatar-equipment"]').textContent.includes('top-002'),
    );
    await page.getByRole('button', { name: '아바타 저장', exact: true }).click();
    await page.getByRole('status').filter({ hasText: '아바타를 저장했습니다' }).waitFor();
    await page.reload();
    await ready();
    assert.equal((await equipment()).top, 'top-002');
    await page.getByRole('button', { name: '상의', exact: true }).click();
    await page.route('**/top-003.glb', (route) => route.abort());
    await page.getByRole('button', { name: /머스터드 니트/ }).click();
    await page.getByRole('alert').waitFor();
    assert.equal((await equipment()).top, 'top-002');
    await page.unroute('**/top-003.glb');
    await page.getByRole('button', { name: /머스터드 니트/ }).click();
    await page.waitForFunction(() =>
      document.querySelector('[data-testid="avatar-equipment"]').textContent.includes('top-003'),
    );
    await page.getByRole('button', { name: '원피스', exact: true }).click();
    await page.getByRole('button', { name: /민트 원피스/ }).click();
    await page.waitForFunction(() =>
      document
        .querySelector('[data-testid="avatar-equipment"]')
        .textContent.includes('onepiece-001'),
    );
    assert.equal((await equipment()).top, undefined);
    assert.equal((await equipment()).bottom, undefined);
    await page.getByRole('button', { name: '기본 코디', exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector('[data-testid="avatar-equipment"]').textContent.includes('top-001'),
    );
    const poses = ['기본', '걷기', '달리기', '점프', '앉기', '팔 들기', '웅크리기'];
    for (let index = 0; index < poses.length; index++) {
      await page.getByRole('button', { name: poses[index], exact: true }).click();
      await page.waitForTimeout(500);
      await page
        .locator('.avatar-preview')
        .screenshot({ path: path.join(output, `pose-${index}.png`) });
    }
    await page.getByRole('button', { name: '기본', exact: true }).click();
    await page.getByText('개발자 · 테스트 에셋 정보', { exact: true }).click();
    await page.getByRole('button', { name: 'LOD 0 전환' }).click();
    await page.getByRole('button', { name: 'LOD 1 전환' }).waitFor();
    await page.getByRole('button', { name: 'LOD 1 전환' }).click();
    await page.getByRole('button', { name: 'LOD 0 전환' }).waitFor();
    await page.getByText('개발자 · 테스트 에셋 정보', { exact: true }).click();
    await page.getByRole('button', { name: '헤어', exact: true }).click();
    await page.screenshot({ path: path.join(output, 'customizer.png'), fullPage: true });
    const backend = await page.locator('.avatar-studio').getAttribute('data-backend');
    const adapterInfo = await page.evaluate(async () => {
      const adapter = await navigator.gpu?.requestAdapter();
      return adapter
        ? { vendor: adapter.info.vendor, architecture: adapter.info.architecture }
        : null;
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      'mobile overflow',
    );
    assert.deepEqual(errors, []);
    const result = {
      backend,
      adapterInfo,
      saveReload: true,
      failedLoadPreservesEquipment: true,
      retryAfterFailedLoad: true,
      onepieceConflict: true,
      lodSwap: true,
      poses: 7,
      mobileOverflow: false,
      pageErrors: errors,
      screenshots: output,
    };
    await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    process.stdout.write(JSON.stringify(result) + '\n');
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch((error) => {
  process.stderr.write(String(error.stack ?? error) + '\n');
  process.exitCode = 1;
});
