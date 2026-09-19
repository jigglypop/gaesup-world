const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const THREE = require('three');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const baseline = execFileSync('git', ['rev-parse', process.argv[2] || 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
function load(relative, before) {
  const source = before ? execFileSync('git', ['show', `${baseline}:${relative}`], { cwd: root, encoding: 'utf8' }) : fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  const localRequire = name => name.startsWith('.') ? load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), `${name}.ts`)), before) : require(name);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(localRequire, module, module.exports);
  return module.exports;
}
const checks = [true, false].map(before => load('src/core/camera/utils/camera.ts', before).cameraUtils.improvedCollisionCheck);
const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.computeBoundingSphere();
const material = new THREE.MeshBasicMaterial();
const from = new THREE.Vector3();
const to = new THREE.Vector3(0, 0, 10);
const results = [];
try {
  for (const excludedCount of [0, 1000, 10000]) {
    const scene = new THREE.Scene();
    const excluded = new THREE.Group();
    scene.add(excluded);
    for (let i = 0; i < excludedCount; i++) excluded.add(new THREE.Mesh(geometry, material));
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.z = 5;
    scene.add(obstacle);
    scene.updateMatrixWorld(true);
    const excludedObjects = [excluded];
    const run = checks.map(check => () => check(from, to, scene, 0.5, excludedObjects));
    const before = run[0]();
    const after = run[1]();
    assert.equal(after.safe, before.safe);
    assert.deepEqual(after.position.toArray(), before.position.toArray());
    assert.equal(after.obstacles[0].object, before.obstacles[0].object);
    for (let i = 0; i < 50; i++) { run[0](); run[1](); }
    const samples = [[], []];
    for (let i = 0; i < 100; i++) for (const index of i % 2 ? [0, 1] : [1, 0]) {
      const start = performance.now();
      for (let j = 0; j < 20; j++) run[index]();
      samples[index].push((performance.now() - start) / 20);
    }
    results.push({ excludedMeshes: excludedCount, queriesPerSample: 20, samples: 100, mediansMs: samples.map(values => values.sort((a, b) => a - b)[50]) });
  }
  const report = { baseline, node: process.version, scope: 'CPU collision query, one real blocker plus excluded mesh subtree', results };
  fs.mkdirSync(path.join(root, '.tmp'), { recursive: true });
  fs.writeFileSync(path.join(root, '.tmp/camera-collision-benchmark.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { geometry.dispose(); material.dispose(); }
