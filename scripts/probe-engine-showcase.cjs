const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { chromium } = require('@playwright/test');

async function main() {
  const baseUrl = process.env.GAESUP_PROBE_URL ?? 'http://127.0.0.1:5174';
  const output = path.resolve(__dirname, '../.tmp/engine-showcase');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-unsafe-webgpu', '--enable-gpu'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' ||
        /GPUValidationError|pipeline creation failed|Invalid RenderPipeline/i.test(message.text())
      )
        errors.push(message.text());
    });
    await page.goto(`${baseUrl}/scripts/fixtures/gpu-driven.html`);
    const probe = await page.evaluate(() => window.probe);
    assert.ok(!probe.error, probe.error);
    assert.equal(probe.result.native, true);
    await page.goto(`${baseUrl}/engine`);
    await page.locator('[data-backend="Native WebGPU"]').waitFor({ timeout: 60000 });
    await page.getByRole('button', { name: '엔진 살펴보기' }).click();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="active-mode"]')?.textContent === 'gpu',
    );
    await page.waitForFunction(() => {
      const count = Number(
        document.querySelector('[data-testid="visible-count"]')?.textContent.replaceAll(',', ''),
      );
      return count > 0 && count < 4096;
    });
    const gpuMetrics = await page.locator('.metrics').innerText();
    await page.getByRole('button', { name: '공개 패키지 API 확인' }).click();
    await page
      .getByRole('status')
      .filter({ hasText: '공개 모듈 로드 완료' })
      .waitFor({ timeout: 60000 });
    assert.equal(await page.locator('.package-inspector .metrics > div').count(), 16);
    await page.screenshot({ path: path.join(output, 'desktop-lab.png') });
    await page.getByRole('button', { name: 'CPU 컬링', exact: false }).click();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="active-mode"]')?.textContent === 'cpu',
    );
    await page.getByRole('button', { name: '전체 렌더링', exact: false }).click();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="visible-count"]')?.textContent === '4,096',
    );
    await page.getByRole('button', { name: 'GPU 간접 드로우', exact: false }).click();
    await page.getByRole('combobox').selectOption('16384');
    await page.waitForFunction(
      () => document.querySelector('[data-testid="active-mode"]')?.textContent === 'gpu',
    );
    await page.getByRole('button', { name: '엔진 실험실 닫기' }).click();
    await page.getByRole('button', { name: /호숫가 산책/ }).click();
    await page.getByRole('button', { name: /낮/ }).click();
    await page.screenshot({ path: path.join(output, 'desktop-forest.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'mobile.png') });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      'Mobile overflows horizontally.',
    );
    assert.deepEqual(errors, []);
    const fallback = await browser.newPage();
    await fallback.addInitScript(() => {
      Object.defineProperty(navigator, 'gpu', { value: undefined });
    });
    const fallbackErrors = [];
    fallback.on('pageerror', (error) => fallbackErrors.push(error.message));
    await fallback.goto(`${baseUrl}/engine`);
    await fallback.locator('[data-backend="WebGL2 compatibility"]').waitFor({ timeout: 60000 });
    await fallback.getByRole('button', { name: '엔진 살펴보기' }).click();
    await fallback.waitForFunction(
      () => document.querySelector('[data-testid="active-mode"]')?.textContent === 'cpu',
    );
    assert.deepEqual(fallbackErrors, []);
    const result = {
      ...probe.result,
      gpuMetrics,
      errors,
      fallback: 'WebGL2 / CPU verified',
      fallbackErrors,
    };
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ ...result, output }, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
