const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const workspace = path.resolve(__dirname, '..');
const requireWorkspace = createRequire(path.join(workspace, 'package.json'));
const { chromium } = requireWorkspace('@playwright/test');
if (!process.argv[2])
  throw Error(
    'Usage: node scripts/probe-r3f10-browser.cjs <isolated-fixture-directory> [--require-webgpu]',
  );
const fixture = path.resolve(process.argv[2]);
const strict = process.argv.includes('--strict');
const ownersPerCycle = strict ? 2 : 1;
const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-r3f10-browser-'));
process.stdout.write(
  JSON.stringify({
    versions: Object.fromEntries(
      ['react', 'three', '@react-three/fiber'].map((name) => [
        name,
        JSON.parse(
          fs.readFileSync(path.join(fixture, 'node_modules', name, 'package.json'), 'utf8'),
        ).version,
      ]),
    ),
  }) + '\n',
);
for (const file of ['browser.html', 'browser-probe.mjs']) {
  fs.copyFileSync(
    path.join(__dirname, 'fixtures', 'r3f10-browser', file),
    path.join(runRoot, file),
  );
}

(async () => {
  const { createServer } = await import(pathToFileURL(requireWorkspace.resolve('vite')));
  const packagePath = (name) => path.join(fixture, 'node_modules', name).replace(/\\/g, '/');
  const aliases = [
    { find: /^three$/, replacement: packagePath('three/build/three.module.js') },
    { find: /^three\/webgpu$/, replacement: packagePath('three/build/three.webgpu.js') },
    { find: /^three\/tsl$/, replacement: packagePath('three/build/three.tsl.js') },
    { find: 'three/addons', replacement: packagePath('three/examples/jsm') },
    { find: 'three', replacement: packagePath('three') },
    { find: 'react', replacement: packagePath('react') },
    { find: 'react-dom', replacement: packagePath('react-dom') },
    { find: '@react-three/fiber', replacement: packagePath('@react-three/fiber/dist/index.mjs') },
    { find: 'its-fine', replacement: createRequire(path.join(fixture, 'node_modules/@react-three/fiber/package.json')).resolve('its-fine') },
    {
      find: '@react-three/rapier',
      replacement: path
        .join(
          path.dirname(requireWorkspace.resolve('@react-three/rapier')),
          'react-three-rapier.esm.js',
        )
        .replace(/\\/g, '/'),
    },
  ];
  const server = await createServer({
    configFile: false,
    root: runRoot,
    logLevel: 'warn',
    resolve: { alias: aliases },
    server: { host: '127.0.0.1', port: 0, fs: { allow: [runRoot, fixture, workspace] } },
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({
      headless: true,
      args: process.env.GAESUP_NATIVE_PROBE === '1' ? ['--enable-unsafe-webgpu'] : [],
    });
    const page = await browser.newPage({ viewport: { width: 960, height: 800 } });
    if (process.argv.includes('--trace-invalidation')) await page.addInitScript(() => {
      const warn = console.warn;
      console.warn = (...args) => {
        if (args.some(value => String(value).includes('invalidation ignored'))) {
          warn(...args, new Error('Invalidation source').stack);
        } else warn(...args);
      };
    });
    const errors = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
      process.stderr.write('PAGE ERROR: ' + error.stack + '\n');
    });
    page.on('console', (message) => {
      if (message.type() === 'error' || message.text().includes('invalidation ignored') ||
        message.text().includes('teardown may be incomplete')) {
        errors.push(message.text());
        process.stderr.write('CONSOLE ERROR: ' + message.text() + '\n');
      }
    });
    await page.goto(server.resolvedUrls.local[0] + 'browser.html' + (strict ? '?strict' : ''));
    for (let cycle = 1; cycle <= 3; cycle++) {
      const startingFrames = await page.evaluate(() => window.rendererProbe?.frames ?? 0);
      if (cycle > 1) await page.getByTestId('remount').click();
      await page.waitForFunction(
        (frames) =>
          window.rendererProbe?.frames > frames + 20 && window.rendererProbe.renderCalls > 0,
        startingFrames,
        { timeout: 30000 },
      );
      process.stdout.write(
        JSON.stringify({ stage: 'initial', ...(await page.evaluate(() => window.rendererProbe)) }) +
          '\n',
      );
      if (
        process.argv.includes('--require-webgpu') &&
        (await page.evaluate(() => window.rendererProbe.backend)) !== 'webgpu'
      )
        throw Error('Native WebGPU backend required; fallback is not accepted');
      await page.getByTestId('resume').click();
      await page.waitForFunction(
        () => window.rendererProbe.height > 0.49 && window.rendererProbe.height < 0.51,
      );
      process.stdout.write(
        JSON.stringify({ stage: 'landed', ...(await page.evaluate(() => window.rendererProbe)) }) +
          '\n',
      );
      await page.screenshot({ path: path.join(runRoot, `rendered-${cycle}.png`) });
      if (cycle === 1) {
        const creations = await page.evaluate(() => window.rendererProbe.rendererCreated);
        if ((await page.evaluate(() => window.rendererProbe.runtimeContext)) !== 'initial')
          throw Error('Parent context did not reach the scene');
        await page.getByTestId('context').click();
        await page.waitForFunction(() => window.rendererProbe.runtimeContext === 'updated');
        if ((await page.evaluate(() => window.rendererProbe.rendererCreated)) !== creations)
          throw Error('Context update recreated the renderer');
        await page.setViewportSize({ width: 640, height: 900 });
        await page.waitForFunction(() => {
          const size = window.rendererProbe.viewport();
          return size.width === 640 && size.aspect === size.width / size.height &&
            size.bufferWidth === Math.floor(size.width * size.dpr);
        });
        const size = await page.evaluate(() => window.rendererProbe.viewport());
        if ((await page.evaluate(() => window.rendererProbe.rendererCreated)) !== creations)
          throw Error('Resize recreated the renderer');
        const canvas = page.locator('#scene canvas');
        await canvas.click();
        await page.waitForFunction(() => window.rendererProbe.pointerHits > 0);
        await page.screenshot({ path: path.join(runRoot, 'resized.png') });
        process.stdout.write(JSON.stringify({ stage: 'resize-pointer', ...size }) + '\n');
        await page.setViewportSize({ width: 960, height: 800 });
        await page.waitForFunction(() => window.rendererProbe.viewport().width === 960);
      }
      process.stdout.write(
        JSON.stringify({
          stage: 'resources-live',
          cycle,
          resources: await page.evaluate(() => window.rendererProbe.resources()),
        }) + '\n',
      );
      await page.getByTestId('pause').click();
      await page.waitForFunction(() => window.rendererProbe.height === 5);
      const pausedAt = await page.evaluate(() => window.rendererProbe.frames);
      await page.waitForFunction((frames) => window.rendererProbe.frames > frames + 20, pausedAt);
      if ((await page.evaluate(() => window.rendererProbe.height)) !== 5)
        throw Error('Physics continued while paused');
      await page.getByTestId('resume').click();
      await page.waitForFunction(
        () => window.rendererProbe.height > 0.49 && window.rendererProbe.height < 0.51,
      );
      await page.getByTestId('remove').click();
      await page.waitForFunction(() => window.rendererProbe.bodyRemoved);
      await page.getByTestId('unmount').click();
      await page.waitForFunction(() => window.rendererProbe.rootRemoved());
      if ((await page.evaluate(() => window.rendererProbe.rendererDisposed)) !== cycle * ownersPerCycle)
        throw Error('Renderer owner did not release exactly one renderer per cycle');
      await page.evaluate(() => window.rendererProbe.releaseRenderer());
      if ((await page.evaluate(() => window.rendererProbe.rendererDisposed)) !== cycle * ownersPerCycle)
        throw Error('Repeated release disposed the renderer twice');
      const frames = await page.evaluate(() => window.rendererProbe.frames);
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            let count = 0;
            const tick = () => (++count === 20 ? resolve() : requestAnimationFrame(tick));
            requestAnimationFrame(tick);
          }),
      );
      if ((await page.evaluate(() => window.rendererProbe.frames)) !== frames)
        throw Error('Frame callbacks survived unmount');
      process.stdout.write(
        JSON.stringify({
          stage: 'cycle-complete',
          cycle,
          ...(await page.evaluate(() => window.rendererProbe)),
          resources: await page.evaluate(() => window.rendererProbe.resources()),
        }) + '\n',
      );
    }
    await page.goto(server.resolvedUrls.local[0] + 'browser.html?cancel-init' + (strict ? '&strict' : ''));
    await page.waitForFunction(() => typeof window.rendererProbe?.finishInitialization === 'function');
    await page.getByTestId('unmount').click();
    await page.evaluate(() => window.rendererProbe.finishInitialization());
    await page.waitForFunction(count => window.rendererProbe.rootRemoved() && window.rendererProbe.rendererDisposed === count, ownersPerCycle);
    const cancelled = await page.evaluate(() => ({
      frames: window.rendererProbe.frames,
      created: window.rendererProbe.rendererCreated,
      disposed: window.rendererProbe.rendererDisposed,
      rootsCreated: window.rendererProbe.rootsCreated,
      initializationError: window.rendererProbe.initializationError,
      cleanupError: window.rendererProbe.cleanupError,
    }));
    if (cancelled.frames !== 0 || cancelled.rootsCreated !== 0 || cancelled.created !== ownersPerCycle || cancelled.initializationError || cancelled.cleanupError)
      throw Error('Cancelled initialization rendered or failed cleanup: ' + JSON.stringify(cancelled));
    process.stdout.write(JSON.stringify({ stage: 'cancelled-initialization', ...cancelled }) + '\n');
    await page.goto(server.resolvedUrls.local[0] + 'browser.html?fail-init' + (strict ? '&strict' : ''));
    await page.waitForFunction(() => window.rendererProbe?.initializationError && !document.querySelector('#scene canvas'));
    const failed = await page.evaluate(() => ({ ...window.rendererProbe, rootRemoved: window.rendererProbe.rootRemoved() }));
    if (failed.frames !== 0 || failed.rootsCreated !== 0 || failed.rendererCreated !== 0 || !failed.rootRemoved || failed.cleanupError ||
      !failed.initializationError.includes('Injected renderer initialization failure'))
      throw Error('Failed initialization retained a root or canvas: ' + JSON.stringify(failed));
    process.stdout.write(JSON.stringify({ stage: 'failed-initialization', ...failed }) + '\n');
    for (const [failureMode, expectedError] of [
      ['fail-configure', 'Injected initialized renderer resize failure'],
      ['fail-configure-early', 'Injected renderer readiness failure'],
    ]) {
      await page.goto(server.resolvedUrls.local[0] + 'browser.html?' + failureMode + (strict ? '&strict' : ''));
      await page.waitForFunction(count => window.rendererProbe?.initializationError &&
        window.rendererProbe.rendererDisposed === count && window.rendererProbe.rootsRemaining() === 0, ownersPerCycle);
      await page.evaluate(() => window.rendererProbe.unmountOwned(() => undefined));
      const configureFailed = await page.evaluate(() => ({
        frames: window.rendererProbe.frames,
        created: window.rendererProbe.rendererCreated,
        disposed: window.rendererProbe.rendererDisposed,
        rootsCreated: window.rendererProbe.rootsCreated,
        rootsRemaining: window.rendererProbe.rootsRemaining(),
        canvases: document.querySelectorAll('#scene canvas').length,
        initializationError: window.rendererProbe.initializationError,
        cleanupError: window.rendererProbe.cleanupError,
      }));
      if (configureFailed.frames !== 0 || configureFailed.created !== ownersPerCycle ||
        configureFailed.disposed !== ownersPerCycle || configureFailed.rootsCreated !== 1 ||
        configureFailed.rootsRemaining !== 0 || configureFailed.canvases !== 0 || configureFailed.cleanupError ||
        !configureFailed.initializationError.includes(expectedError))
        throw Error('Failed configure retained resources or lost the original error: ' + JSON.stringify(configureFailed));
      process.stdout.write(JSON.stringify({ stage: failureMode, ...configureFailed }) + '\n');
    }
    if (errors.length) throw Error(errors.join('\n'));
    process.stdout.write('Artifacts: ' + runRoot + '\n');
    process.stdout.write(
      JSON.stringify({ stage: 'complete', ...(await page.evaluate(() => window.rendererProbe)) }) +
        '\n',
    );
  } finally {
    await browser?.close();
    await server.close();
  }
})().catch((error) => {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
});
