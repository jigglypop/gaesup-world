const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
if (!process.argv[2])
  throw new Error('Usage: node scripts/probe-r3f10-cancellation.cjs <isolated-fixture-directory>');
const fixtureRequire = Module.createRequire(
  path.join(path.resolve(process.argv[2]), 'package.json'),
);
const mapping = new Map(
  [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom',
    'three',
    'three/webgpu',
    '@react-three/fiber',
  ].map((id) => [id, fixtureRequire.resolve(id)]),
);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...rest) {
  return mapping.get(id) ?? originalResolve.call(this, id, ...rest);
};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
const React = fixtureRequire('react');
const fiber = fixtureRequire('@react-three/fiber');
process.stdout.write(
  JSON.stringify({
    fiber: fixtureRequire('@react-three/fiber/package.json').version,
    threeRevision: fixtureRequire('three').REVISION,
  }) + '\n',
);
const canvas = {
  width: 100,
  height: 100,
  style: {},
  addEventListener() {},
  removeEventListener() {},
};
let disposed = 0;
const rendererSizes = [];
const renderer = {
  domElement: canvas,
  backend: { isWebGPUBackend: true },
  hasInitialized: () => true,
  render() {},
  setSize(width, height) { rendererSizes.push([width, height]); },
  setPixelRatio() {},
  setAnimationLoop() {},
  getPixelRatio: () => 1,
  getSize: (value) => value.set(100, 100),
  shadowMap: {},
  dispose() {
    disposed++;
  },
};
const verifyCleanupInvalidation = process.argv.includes('--verify-cleanup-invalidation');
const drainChildren = process.argv.includes('--drain-children');
const cleanupWarnings = [];
const nativeWarn = console.warn;
if (verifyCleanupInvalidation) console.warn = (...args) => {
  cleanupWarnings.push(args.map(String).join(' '));
  nativeWarn(...args);
};

(async () => {
  const root = fiber.createRoot(canvas);
  let resolveRenderer;
  const pending = new Promise((resolve) => {
    resolveRenderer = resolve;
  });
  const configure = root.configure({
    renderer: () => pending,
    frameloop: 'never',
    size: { width: 100, height: 100, top: 0, left: 0 },
  });
  const deferUnmount = process.argv.includes('--defer-unmount');
  try {
    if (!deferUnmount) await React.act(async () => root.unmount());
    await new Promise((resolve) => setTimeout(resolve, 600));
    const rootRetainedWhilePending = fiber._roots.has(canvas);
    resolveRenderer(renderer);
    await configure;
    if (process.argv.includes('--verify-resize') || verifyCleanupInvalidation) {
      let store;
      function CleanupInvalidation() {
        React.useEffect(() => () => store.getState().invalidate(), []);
        return null;
      }
      await React.act(async () => { store = root.render(verifyCleanupInvalidation ? React.createElement(CleanupInvalidation) : null); });
      store.getState().setSize(320, 180, 12, 24);
      assert.deepEqual(rendererSizes.at(-1), [320, 180]);
      assert.equal(store.getState().camera.aspect, 320 / 180);
      const resizeCount = rendererSizes.length;
      store.getState().setSize(320, 180, 12, 24);
      assert.equal(rendererSizes.length, resizeCount, 'Unchanged size must not resize the renderer again');
      store.getState().setSize(180, 320, 12, 24);
      assert.deepEqual(rendererSizes.at(-1), [180, 320]);
      assert.equal(store.getState().camera.aspect, 180 / 320);
      process.stdout.write('Resize updated renderer and camera; unchanged dimensions skipped renderer resize.\n');
    }
    const result = {
      deferUnmount,
      rootRetainedWhilePending,
      rootPresentAfterLateConfigure: fiber._roots.has(canvas),
      frameworkDisposals: disposed,
    };
    process.stdout.write(JSON.stringify(result) + '\n');
    if (process.argv.includes('--require-framework-cleanup')) {
      assert.equal(
        result.rootPresentAfterLateConfigure,
        false,
        'Framework must remove a cancelled root',
      );
      assert.equal(result.frameworkDisposals, 1, 'Framework must release the late renderer');
    }
  } finally {
    if (drainChildren) {
      await React.act(async () => { root.render(null); });
      assert.equal(fiber._roots.has(canvas), true, 'Scheduler owner must survive child cleanup');
    }
    if (disposed === 0) renderer.dispose();
    await React.act(async () => root.unmount());
    await new Promise((resolve) => setTimeout(resolve, 600));
    assert.equal(
      fiber._roots.has(canvas),
      false,
      'Owner retry after initialization must remove the root',
    );
    assert.equal(disposed, 1, 'The renderer owner releases exactly once');
    if (verifyCleanupInvalidation) {
      assert.equal(cleanupWarnings.filter(message => message.includes('invalidation ignored')).length, drainChildren ? 0 : 1,
        'Child cleanup must run before scheduler unregister to avoid stale invalidation');
      process.stdout.write(drainChildren
        ? 'Child cleanup before root unmount completed without stale scheduler invalidation.\n'
        : 'Cleanup invalidation warning reproduced independently of physics; root removal and owner disposal completed.\n');
    }
    process.stdout.write(
      'Owner cleanup after initialization removed the root and disposed the renderer once.\n',
    );
  }
})().finally(() => { console.warn = nativeWarn; }).catch((error) => {
  process.stderr.write(String(error.stack ?? error) + '\n');
  process.exitCode = 1;
});
