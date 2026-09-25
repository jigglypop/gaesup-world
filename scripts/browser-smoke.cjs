const { chromium } = require('@playwright/test');
const { PNG } = require('pngjs');

const { collectPageErrors, startDevServer } = require('./lib/devServer.cjs');

async function expectWorldCanvasPaint(page) {
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('canvas')).some((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return rect.width >= 200 && rect.height >= 200;
    });
  }, undefined, { timeout: 30_000 });
  await page.waitForTimeout(2_000);

  const handles = await page.$$('canvas');
  let canvas = null;
  let canvasArea = 0;
  for (const handle of handles) {
    const rect = await handle.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    });
    const area = rect.width * rect.height;
    if (!canvas || area > canvasArea) {
      canvas = handle;
      canvasArea = area;
    }
  }
  if (!canvas) {
    throw new Error('World canvas smoke failed: missing canvas handle');
  }

  const geometry = await canvas.evaluate((node) => {
    if (!(node instanceof HTMLCanvasElement)) {
      return { ok: false, reason: 'missing canvas' };
    }
    const rect = node.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 200) {
      return { ok: false, reason: `canvas too small: ${rect.width}x${rect.height}` };
    }
    return { ok: true, reason: 'canvas is visible' };
  });

  if (!geometry.ok) {
    throw new Error(`World canvas smoke failed: ${geometry.reason}`);
  }

  const sample = await page.evaluate(async () => {
    const canvas = Array.from(document.querySelectorAll('canvas')).reduce((best, candidate) => {
      const rect = candidate.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (!best) return candidate;
      const bestRect = best.getBoundingClientRect();
      return area > bestRect.width * bestRect.height ? candidate : best;
    }, null);
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { ok: false, reason: 'missing canvas' };
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 200) {
      return { ok: false, reason: `canvas too small: ${rect.width}x${rect.height}` };
    }

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) {
      return { ok: false, reason: 'webgl context unavailable' };
    }

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const points = [
      [Math.floor(width * 0.25), Math.floor(height * 0.25)],
      [Math.floor(width * 0.5), Math.floor(height * 0.5)],
      [Math.floor(width * 0.75), Math.floor(height * 0.75)],
    ];
    const pixel = new Uint8Array(4);

    for (const [x, y] of points) {
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
        return { ok: true, reason: 'canvas has painted pixels' };
      }
    }

    return { ok: false, reason: 'sampled canvas pixels are blank' };
  });

  if (sample.ok) {
    return;
  }

  const screenshot = await canvas.screenshot({ timeout: 10_000 });
  const png = PNG.sync.read(screenshot);
  let firstColor = null;
  let distinctPixels = 0;
  const step = Math.max(4, Math.floor((png.width * png.height) / 4_000) * 4);

  for (let i = 0; i < png.data.length; i += step) {
    const color = [
      png.data[i],
      png.data[i + 1],
      png.data[i + 2],
      png.data[i + 3],
    ].join(',');
    if (firstColor === null) {
      firstColor = color;
      continue;
    }
    if (color !== firstColor) {
      distinctPixels += 1;
      if (distinctPixels >= 8) return;
    }
  }

  if (distinctPixels < 8) {
    throw new Error(`World canvas smoke failed: ${sample.reason}`);
  }
}

async function main() {
  const { url: baseUrl, stop } = await startDevServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const pageErrors = collectPageErrors(page);

    // The default route is the minihome product example; it reports its backend once the renderer is up.
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('.miniroom-view:not([data-renderer="loading"])').waitFor({ timeout: 30_000 });
    await expectWorldCanvasPaint(page);

    await page.goto(`${baseUrl}/world`, { waitUntil: 'domcontentloaded' });
    await expectWorldCanvasPaint(page);

    if (pageErrors.length > 0) {
      throw new Error(`Browser smoke captured page errors:\n${pageErrors.join('\n')}`);
    }

    console.log('Browser smoke passed for / and /world.');
  } finally {
    if (browser) await browser.close();
    stop();
  }
}

// probe-webgpu-world reuses the canvas paint check.
module.exports = { expectWorldCanvasPaint };
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
