const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { PNG } = require('pngjs');
const ts = require('typescript');

(async () => {
  const flag = process.argv.includes('--flag');
  const output = fs.mkdtempSync(
    path.join(os.tmpdir(), flag ? 'gaesup-flag-' : 'gaesup-toon-water-'),
  );
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 660, height: 350 } });
    const errors = [];
    const root = path.resolve(__dirname, '..');
    const replacements = new Map([
      ['three', '/water-vendor/three.module.js'],
      ['three/webgpu', '/water-vendor/three.webgpu.js'],
      ['three/tsl', '/water-vendor/three.tsl.js'],
      ['../../src/core/rendering/tsl/toonWater', '/water-material.js'],
      ['../../src/core/rendering/tsl/flag', '/water-material.js'],
      ['../../src/core/building/components/mesh/water/index.tsx?raw', '/water-source.js'],
    ]);
    const rewrite = (source) => {
      for (const [from, to] of replacements) source = source.replaceAll(`'${from}'`, `'${to}'`);
      return source;
    };
    for (const name of ['three.module.js', 'three.webgpu.js', 'three.tsl.js', 'three.core.js']) {
      await page.route(`**/water-vendor/${name}`, (route) =>
        route.fulfill({
          contentType: 'text/javascript',
          body: rewrite(fs.readFileSync(path.join(root, 'node_modules/three/build', name), 'utf8')),
        }),
      );
    }
    await page.route('**/water-material.js', (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: rewrite(
          ts.transpileModule(
            fs.readFileSync(
              path.join(root, `src/core/rendering/tsl/${flag ? 'flag' : 'toonWater'}.ts`),
              'utf8',
            ),
            {
              compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
            },
          ).outputText,
        ),
      }),
    );
    await page.route('**/water-source.js', (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: `export default ${JSON.stringify(fs.readFileSync(path.join(root, 'src/core/building/components/mesh/water/index.tsx'), 'utf8'))}`,
      }),
    );
    await page.route('**/scripts/fixtures/toon-water-compare.js', (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: rewrite(
          fs.readFileSync(
            path.join(
              __dirname,
              flag ? 'fixtures/flag-compare.js' : 'fixtures/toon-water-compare.js',
            ),
            'utf8',
          ),
        ),
      }),
    );
    for (const name of ['vert', 'frag']) {
      await page.route(`**/flag-${name}.js`, (route) =>
        route.fulfill({
          contentType: 'text/javascript',
          body: `export default ${JSON.stringify(fs.readFileSync(path.join(root, `src/core/building/components/mesh/flag/${name}.glsl`), 'utf8'))}`,
        }),
      );
    }
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.route('**/water-comparison', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><body style="margin:0;display:flex;gap:10px;background:#222"><script type="module" src="/scripts/fixtures/toon-water-compare.js"></script></body></html>',
      }),
    );
    await page.goto('http://127.0.0.1:5173/water-comparison');
    await page
      .waitForFunction(() => !!window.waterCompare, undefined, { timeout: 30000 })
      .catch((error) => {
        throw new Error(`${error.message}\n${errors.join('\n')}`);
      });
    const results = [];
    const nativeAdapterAvailable = await page.evaluate(async () =>
      Boolean(await navigator.gpu?.requestAdapter()),
    );
    let previous;
    for (const mode of flag ? ['single', 'batch', 'batch-srgb'] : ['water']) {
      previous = undefined;
      for (const time of [0, 3, 12]) {
        const state = await page.evaluate(
          ({ time, mode }) => window.waterCompare.render(time, mode),
          { time, mode },
        );
        const left = await page
          .locator('#legacy')
          .screenshot({ path: path.join(output, `legacy-${mode}-${time}.png`) });
        const right = await page
          .locator('#nodes')
          .screenshot({ path: path.join(output, `nodes-${mode}-${time}.png`) });
        const a = PNG.sync.read(left).data;
        const b = PNG.sync.read(right).data;
        if (previous)
          assert.notDeepEqual(b, previous, 'Animation must change across sampled times');
        previous = b;
        let difference = 0;
        let foregroundDifference = 0;
        let foregroundPixels = 0;
        for (let i = 0; i < a.length; i += 4) {
          let pixelDifference = 0;
          let foreground = false;
          for (let channel = 0; channel < 3; channel++) {
            pixelDifference += Math.abs(a[i + channel] - b[i + channel]);
            foreground ||=
              Math.abs(a[i + channel] - a[channel]) > 2 ||
              Math.abs(b[i + channel] - b[channel]) > 2;
          }
          difference += pixelDifference;
          if (foreground) {
            foregroundPixels++;
            foregroundDifference += pixelDifference;
          }
        }
        results.push({
          ...state,
          meanChannelDifference: difference / (320 * 320 * 3),
          foregroundPixels,
          foregroundMeanDifference: foregroundDifference / (foregroundPixels * 3),
        });
      }
    }
    await page.screenshot({ path: path.join(output, 'comparison.png') });
    await page.evaluate(() => window.waterCompare.dispose());
    fs.writeFileSync(
      path.join(output, 'results.json'),
      JSON.stringify({ nativeAdapterAvailable, results, errors }, null, 2),
    );
    process.stdout.write(
      `${JSON.stringify({ output, nativeAdapterAvailable, results, errors }, null, 2)}\n`,
    );
    assert.deepEqual(errors, []);
    for (const result of results) {
      assert.ok(
        result.meanChannelDifference < 3,
        'Colors must match within 3/255 mean channel error',
      );
      assert.ok(result.foregroundPixels > 1000, 'The effect must occupy a visible area');
      assert.ok(
        result.foregroundMeanDifference < 6,
        'Foreground colors must match within 6/255 mean channel error',
      );
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
