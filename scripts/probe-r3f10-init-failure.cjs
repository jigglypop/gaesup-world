const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');

if (!process.argv[2]) throw Error('Usage: node scripts/probe-r3f10-init-failure.cjs <isolated-fixture-directory>');
const fixtureRequire = createRequire(path.join(path.resolve(process.argv[2]), 'package.json'));
const React = fixtureRequire('react');
const { createRoot, _roots } = fixtureRequire('@react-three/fiber');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

(async () => {
  const canvas = { width: 100, height: 100, style: {}, addEventListener() {}, removeEventListener() {} };
  const failure = new Error('Injected renderer initialization failure');
  const initializeRenderer = async () => { throw failure; };
  if (process.argv.includes('--initialize-before-root')) {
    let rootCreated = false;
    await assert.rejects((async () => {
      const renderer = await initializeRenderer();
      const root = createRoot(canvas);
      rootCreated = true;
      await root.configure({ renderer });
    })(), error => error === failure);
    assert.equal(rootCreated, false);
    assert.equal(_roots.has(canvas), false);
    process.stdout.write('Renderer initialization rejected before root allocation; original error preserved and no root retained.\n');
    return;
  }
  const root = createRoot(canvas);
  const warnings = [];
  const nativeWarn = console.warn;
  console.warn = (...args) => {
    warnings.push(args.map(String).join(' '));
  };
  try {
    await assert.rejects(root.configure({
      renderer: initializeRenderer,
      size: { width: 100, height: 100, top: 0, left: 0 },
      frameloop: 'never',
    }), error => error === failure);
    await React.act(async () => root.unmount());
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = {
      fiber: fixtureRequire('@react-three/fiber/package.json').version,
      errorPropagated: true,
      rootRetainedAfterUnmount: _roots.has(canvas),
      warnings,
    };
    process.stdout.write(JSON.stringify(result) + '\n');
    if (process.argv.includes('--require-cleanup')) {
      assert.equal(result.rootRetainedAfterUnmount, false, 'Failed initialization must not retain the root');
      assert.deepEqual(warnings, [], 'Failed initialization teardown must not throw internally');
    }
  } finally {
    console.warn = nativeWarn;
  }
})().catch(error => {
  process.stderr.write(String(error.stack ?? error) + '\n');
  process.exitCode = 1;
});
