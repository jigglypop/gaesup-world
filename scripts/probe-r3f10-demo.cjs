const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

if (!process.argv[2]) throw Error('Usage: node scripts/probe-r3f10-demo.cjs <isolated-fixture-directory>');
const workspace = path.resolve(__dirname, '..');
const fixture = path.resolve(process.argv[2]);
const packagePath = name => fs.realpathSync(path.join(fixture, 'node_modules', name)).replaceAll('\\', '/');
const boundary = path.join(workspace, 'src/core/rendering/legacyDrei.ts').replaceAll('\\', '/');
const guardInactiveRoots = process.argv.includes('--guard-inactive-roots');
const inspectWorld = process.argv.includes('--inspect-world');

(async () => {
  const { build } = await import('vite');
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-r3f10-demo-'));
  await build({
    root: workspace,
    resolve: {
      alias: [
        { find: /^three$/, replacement: packagePath('three/build/three.module.js') },
        { find: /^three\/webgpu$/, replacement: packagePath('three/build/three.webgpu.js') },
        { find: /^three\/tsl$/, replacement: packagePath('three/build/three.tsl.js') },
        { find: 'three/addons', replacement: packagePath('three/examples/jsm') },
        { find: 'three', replacement: packagePath('three') },
        { find: 'react', replacement: packagePath('react') },
        { find: 'react-dom', replacement: packagePath('react-dom') },
        { find: /^@react-three\/fiber$/, replacement: packagePath('@react-three/fiber/dist/index.mjs') },
        { find: /^@react-three\/drei$/, replacement: packagePath('@react-three/drei/index.mjs') },
        { find: '@gaesup-probe/drei-legacy', replacement: packagePath('@react-three/drei/legacy/index.mjs') },
      ],
    },
    plugins: [{
      name: 'isolated-drei-legacy-boundary',
      enforce: 'pre',
      load(id) {
        if (inspectWorld && id.replaceAll('\\', '/') === path.join(workspace, 'examples/pages/World.tsx').replaceAll('\\', '/')) {
          const source = fs.readFileSync(id, 'utf8').replaceAll('\r\n', '\n');
          assert.equal(source.split('<Canvas\n').length, 2);
          return source.replace('<Canvas\n', '<Canvas onCreated={(state) => { globalThis.__worldProbeState = state; }}\n');
        }
        if (id.replaceAll('\\', '/') === boundary) {
          return "export { Grid, Line, Text, shaderMaterial } from '@gaesup-probe/drei-legacy';";
        }
        if (guardInactiveRoots && id.replaceAll('\\', '/') === packagePath('@react-three/fiber/dist/index.mjs')) {
          const source = fs.readFileSync(id, 'utf8');
          const target = 'function invalidate(state, frames = 1, stackFrames = false) {';
          assert.equal(source.split(target).length, 2, 'Expected the audited alpha invalidate implementation');
          return source.replace(target, target + '\n  if (state && !state.internal.active) return;');
        }
      },
    }],
    build: { outDir, emptyOutDir: true, manifest: true },
    logLevel: 'warn',
  });
  const assets = path.join(outDir, 'assets');
  const sources = new Set(fs.readdirSync(assets).filter(file => file.endsWith('.map')).flatMap(file => {
    const map = JSON.parse(fs.readFileSync(path.join(assets, file), 'utf8'));
    return map.sources.map(source => path.resolve(assets, source).replaceAll('\\', '/'));
  }));
  const fiberSources = [...sources].filter(source => source.includes('/node_modules/@react-three/fiber/'));
  assert.deepEqual(fiberSources, [packagePath('@react-three/fiber/dist/index.mjs')], 'Expected only the isolated Fiber implementation');
  for (const dependency of ['react', 'react-dom', '@react-three/drei']) {
    const dependencySources = [...sources].filter(source => source.includes(`/node_modules/${dependency}/`));
    assert.ok(dependencySources.length > 0, `Missing source evidence for ${dependency}`);
    assert.ok(dependencySources.every(source => source.startsWith(packagePath(dependency) + '/')), `Mixed installations of ${dependency}`);
  }
  process.stdout.write(JSON.stringify({ outDir, fiberSources, virtualLegacyBoundary: true, guardInactiveRoots, inspectWorld, versions: Object.fromEntries(
    ['react', 'three', '@react-three/fiber', '@react-three/drei'].map(name => [
      name, JSON.parse(fs.readFileSync(packagePath(name + '/package.json'), 'utf8')).version,
    ]),
  ) }) + '\n');
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
