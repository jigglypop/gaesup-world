const { chromium, expect } = require('@playwright/test');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => {
      const live = new Set();
      for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
        const create = type.prototype.createTexture;
        const remove = type.prototype.deleteTexture;
        type.prototype.createTexture = function (...args) {
          const texture = create.apply(this, args);
          if (texture) live.add(texture);
          return texture;
        };
        type.prototype.deleteTexture = function (texture) {
          live.delete(texture);
          return remove.call(this, texture);
        };
      }
      window.getPlaygroundTextureCount = () => live.size;
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173/blueprint-playground', { waitUntil: 'networkidle' });
    console.log(await page.locator('body').ariaSnapshot());
    const viewport = page.getByRole('group', { name: '전사 이동 체험 화면', exact: true });
    const capture = name => page.screenshot({ path: path.join(os.tmpdir(), `blueprint-playground-${name}.png`) });
    await viewport.click();
    await capture('idle');
    await page.keyboard.down('KeyD');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.keyboard.up('KeyD');
    await capture('moved');
    await page.getByRole('button', { name: '처음 위치로', exact: true }).click();
    await viewport.click();
    await new Promise(resolve => setTimeout(resolve, 400));
    await page.keyboard.down('Space');
    await new Promise(resolve => setTimeout(resolve, 250));
    await page.keyboard.up('Space');
    await capture('jump');
    const forward = page.getByRole('button', { name: '앞으로', exact: true });
    await expect(forward).toBeInViewport();
    const box = await forward.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await new Promise(resolve => setTimeout(resolve, 400));
    await page.mouse.move(2, 2);
    await page.mouse.up();
    await capture('pointer-release');
    const textureCounts = [];
    for (let cycle = 0; cycle < 4; cycle++) {
      await page.getByRole('button', { name: '처음 위치로', exact: true }).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      textureCounts.push(await page.evaluate(() => window.getPlaygroundTextureCount()));
    }
    expect(textureCounts[0]).toBeGreaterThan(0);
    expect(new Set(textureCounts).size).toBe(1);
    await capture('reset');
    await page.setViewportSize({ width: 1440, height: 900 });
    await capture('desktop');
    expect(errors).toEqual([]);
    console.log('Live WebGL textures after repeated resets:', textureCounts);
    console.log('No page errors; keyboard and captured-pointer interactions completed. Screenshots require visual movement verification.');
  } finally {
    await browser.close();
  }
})();
