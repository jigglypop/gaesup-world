const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');

if (!process.argv[2]) throw Error('Usage: node scripts/probe-r3f10-configure-failure.cjs <isolated-fixture-directory>');
const fixtureRequire = createRequire(path.join(path.resolve(process.argv[2]), 'package.json'));
const React = fixtureRequire('react');
const { Scene } = fixtureRequire('three');
const { createRoot, _roots } = fixtureRequire('@react-three/fiber');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

(async () => {
  const canvas = { width: 100, height: 100, style: {}, addEventListener() {}, removeEventListener() {} };
  const failure = new Error('Injected initialized renderer resize failure');
  const early = process.argv.includes('--early');
  let disposals = 0;
  const renderer = {
    domElement: canvas,
    backend: { isWebGPUBackend: true },
    hasInitialized: () => { if (early) throw failure; return true; },
    xr: {},
    render() {},
    setSize() { throw failure; },
    setPixelRatio() {},
    setAnimationLoop() {},
    getPixelRatio: () => 1,
    getSize: (value) => value.set(100, 100),
    shadowMap: {},
    dispose() { disposals++; },
  };
  const warnings = [];
  const nativeWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(' '));
  try {
    const root = createRoot(canvas);
    await assert.rejects(root.configure({
      renderer, frameloop: 'never', size: { width: 100, height: 100, top: 0, left: 0 },
    }), (error) => error === failure);
    const registeredAfterFailure = _roots.has(canvas);
    const rootStore = _roots.get(canvas).store;
    const sceneCreatedBeforeFailure = Boolean(rootStore.getState().scene);
    assert.equal(sceneCreatedBeforeFailure, !early);
    if (!rootStore.getState().scene) rootStore.setState({ scene: new Scene() });
    if (!rootStore.getState().xr) rootStore.setState({ xr: { connect() {}, disconnect() {} } });
    await React.act(async () => root.unmount());
    await new Promise((resolve) => setTimeout(resolve, 600));
    const frameworkDisposals = disposals;
    renderer.dispose();
    const result = {
      fiber: fixtureRequire('@react-three/fiber/package.json').version,
      registeredAfterFailure,
      sceneCreatedBeforeFailure,
      registeredAfterUnmount: _roots.has(canvas),
      frameworkDisposals,
      ownerDisposals: disposals - frameworkDisposals,
      warnings,
    };
    process.stdout.write(JSON.stringify(result) + '\n');
    assert.equal(registeredAfterFailure, true);
    assert.equal(result.registeredAfterUnmount, false);
    assert.equal(frameworkDisposals, 0);
    assert.equal(disposals, 1);
    assert.deepEqual(warnings, []);
  } finally {
    console.warn = nativeWarn;
    if (disposals === 0) renderer.dispose();
  }
})().catch((error) => { process.stderr.write(String(error.stack ?? error) + '\n'); process.exitCode = 1; });
