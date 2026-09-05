// Runs real Rapier WASM against an isolated Fiber scheduler with a stub renderer.
// --installed-rapier uses the fixture's real dependency graph; otherwise resolution is redirected in this process.
// The renderer is a stub: this does not validate GPU rendering or the declared peer support range.

const path = require('path'),
  Module = require('module'),
  assert = require('assert/strict');
if (!process.argv[2])
  throw new Error('Usage: node scripts/probe-r3f10-rapier.cjs <isolated-fixture-directory>');
const fixtureRequire = Module.createRequire(
  path.join(path.resolve(process.argv[2]), 'package.json'),
);
const workspaceRequire = Module.createRequire(path.join(__dirname, '..', 'package.json'));
const installedRapier = process.argv.includes('--installed-rapier');
if (installedRapier) {
  const rapierRequire = Module.createRequire(fixtureRequire.resolve('@react-three/rapier'));
  assert.equal(rapierRequire.resolve('@react-three/fiber'), fixtureRequire.resolve('@react-three/fiber'));
  assert.equal(rapierRequire.resolve('react'), fixtureRequire.resolve('react'));
}
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
if (!installedRapier) {
  Module._resolveFilename = function (id, ...rest) {
    return mapping.get(id) ?? originalResolve.call(this, id, ...rest);
  };
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
const React = fixtureRequire('react'),
  THREE = fixtureRequire('three'),
  fiber = fixtureRequire('@react-three/fiber');
const { Physics, RigidBody, CuboidCollider, BallCollider, useRapier } =
  (installedRapier ? fixtureRequire : workspaceRequire)('@react-three/rapier');
const canvas = {
  width: 100,
  height: 100,
  style: {},
  addEventListener() {},
  removeEventListener() {},
};
let renders = 0;
const gl = {
  domElement: canvas,
  isWebGLRenderer: true,
  render() {
    renders++;
  },
  setSize() {},
  setPixelRatio() {},
  getPixelRatio() {
    return 1;
  },
  getSize(v) {
    return v.set(100, 100);
  },
  xr: { addEventListener() {}, removeEventListener() {}, setAnimationLoop() {} },
  shadowMap: {},
  dispose() {},
  forceContextLoss() {},
  renderLists: { dispose() {} },
};
fiber.extend(THREE);
let state, body, world;
let frames = 0,
  totalDelta = 0;
function Tick() {
  world = useRapier().world;
  fiber.useFrame((s, dt) => {
    frames++;
    totalDelta += dt;
  });
  return null;
}
function Scene({ paused = false, includeBody = true }) {
  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(
      Physics,
      { gravity: [0, -9.81, 0], paused, timeStep: 1 / 60 },
      React.createElement(Tick),
      React.createElement(
        RigidBody,
        { type: 'fixed', colliders: false },
        React.createElement(CuboidCollider, { args: [10, 0.5, 10], position: [0, -0.5, 0] }),
      ),
      includeBody &&
        React.createElement(
          RigidBody,
          { ref: (v) => { body = v; }, position: [0, 5, 0], colliders: false },
          React.createElement(BallCollider, { args: [0.5] }),
        ),
    ),
  );
}
(async () => {
  const root = fiber.createRoot(canvas);
  try {
    await root.configure({
      gl,
      frameloop: 'never',
      size: { width: 100, height: 100, top: 0, left: 0 },
      onCreated: (s) => (state = s),
    });
    await React.act(async () => {
      root.render(React.createElement(Scene));
    });
    for (let retry = 0; !body && retry < 30; retry++) {
      await React.act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });
    }
    assert(body, 'Rapier body must mount');
    let time = 0;
    const frameDuration = 'clock' in state ? 1 / 60 : 1000 / 60;
    const advance = (count) => {
      for (let i = 0; i < count; i++) {
        time += frameDuration;
        state.advance(time, false);
      }
    };
    const initial = body.translation().y;
    advance(180);
    const landed = body.translation().y;
    assert(landed > 0.45 && landed < 0.6, 'ball rests on the ground');
    await React.act(async () => {
      root.render(React.createElement(Scene, { paused: true }));
    });
    body.setTranslation({ x: 0, y: 5, z: 0 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    advance(60);
    assert.equal(body.translation().y, 5);
    await React.act(async () => {
      root.render(React.createElement(Scene));
    });
    advance(60);
    assert(body.translation().y < 5);
    const resumed = body.translation().y;
    const removedHandle = body.handle;
    await React.act(async () => {
      root.render(React.createElement(Scene, { includeBody: false }));
    });
    assert(!world.getRigidBody(removedHandle), 'Unmounted body must leave the physics world');
    process.stdout.write(
      JSON.stringify({
        installedRapier,
        resolverOverride: !installedRapier,
        fiberPath: fixtureRequire.resolve('@react-three/fiber'),
        rapierPath: (installedRapier ? fixtureRequire : workspaceRequire).resolve('@react-three/rapier'),
        initial,
        landed,
        resumed,
        callbackRefCleared: body === null,
        frames,
        totalDelta,
        renders,
        clockPresent: 'clock' in state,
      }) + '\n',
    );
  } finally {
    await React.act(async () => root.unmount());
    const unmountedFrames = frames;
    state?.advance(10_000, false);
    assert.equal(frames, unmountedFrames, 'Frame subscriptions must stop on unmount');
    process.stdout.write('Unmount cleanup passed\n');
  }
})().catch((e) => {
  process.stderr.write(String(e.stack ?? e) + '\n');
  process.exitCode = 1;
});
