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
  for (const sceneMeshes of [1000, 10000]) {
    const scene = new THREE.Scene();
    for (let i = 0; i < sceneMeshes; i++) {
      const holder = new THREE.Group();
      holder.position.set((i % 100) * 3 + 20, 0, Math.floor(i / 100) * 3);
      holder.add(new THREE.Mesh(geometry, material));
      scene.add(holder);
    }
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.z = 5;
    scene.add(obstacle);
    scene.updateMatrixWorld(true);
    const run = checks.map(check => () => check(from, to, scene, 0.5));
    const before = run[0]();
    const after = run[1]();
    assert.equal(after.safe, before.safe);
    assert.deepEqual(after.position.toArray(), before.position.toArray());
    for (let i = 0; i < 20; i++) { run[0](); run[1](); }
    const samples = [[], []];
    for (let i = 0; i < 40; i++) for (const index of i % 2 ? [0, 1] : [1, 0]) {
      const start = performance.now();
      for (let j = 0; j < 5; j++) run[index]();
      samples[index].push((performance.now() - start) / 5);
    }
    results.push({ offRayMeshes: sceneMeshes, queriesPerSample: 5, samples: 40, mediansMs: samples.map(values => values.sort((a, b) => a - b)[20]) });
  }
  // Per-query call counts of the working tree must not grow with instance or scene size.
  const counted = (object, name, counter) => {
    const original = object[name];
    object[name] = function (...args) { counter[name] = (counter[name] || 0) + 1; return original.apply(this, args); };
    return () => { object[name] = original; };
  };
  const timed = (label, scene, compareResult) => {
    scene.updateMatrixWorld(true);
    const run = checks.map(check => () => check(from, to, scene, 0.5));
    const before = run[0]();
    const after = run[1]();
    if (compareResult) assert.deepEqual(after.position.toArray(), before.position.toArray());
    for (let i = 0; i < 10; i++) { run[0](); run[1](); }
    const calls = {};
    const restore = [counted(THREE.Object3D.prototype, 'updateWorldMatrix', calls), counted(THREE.Mesh.prototype, 'getVertexPosition', calls)];
    try { run[1](); } finally { restore.forEach(undo => undo()); }
    const samples = [[], []];
    for (let i = 0; i < 40; i++) for (const index of i % 2 ? [0, 1] : [1, 0]) {
      const start = performance.now();
      for (let j = 0; j < 5; j++) run[index]();
      samples[index].push((performance.now() - start) / 5);
    }
    results.push({ case: label, workingTreeCallsPerQuery: calls, mediansMs: samples.map(values => values.sort((a, b) => a - b)[20]) });
  };
  for (const count of [1000, 10000]) {
    const scene = new THREE.Scene();
    const batch = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) batch.setMatrixAt(i, matrix.makeTranslation((i % 100) * 3 + 20, 0, Math.floor(i / 100) * 3));
    batch.computeBoundingSphere();
    batch.computeBoundingBox();
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.z = 5;
    scene.add(batch, obstacle);
    timed(`off-ray InstancedMesh ${count}`, scene, true);
    batch.dispose();
  }
  {
    // 30-bone chain skinning a ~5k-triangle body standing on the camera path.
    const body = new THREE.SphereGeometry(1, 64, 40);
    const count = body.getAttribute('position').count;
    const indices = new Uint16Array(count * 4);
    const weights = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) { indices[i * 4] = i % 30; weights[i * 4] = 1; }
    body.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
    body.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
    const bones = Array.from({ length: 30 }, () => new THREE.Bone());
    for (let i = 1; i < bones.length; i++) { bones[i - 1].add(bones[i]); bones[i].position.y = 0.05; }
    const mesh = new THREE.SkinnedMesh(body, material);
    mesh.add(bones[0]);
    mesh.bind(new THREE.Skeleton(bones));
    mesh.position.z = 5;
    const scene = new THREE.Scene();
    scene.add(mesh);
    timed('SkinnedMesh 30 bones, ~5k triangles (working tree approximates with bounds)', scene, false);
    body.dispose();
  }
  const report = { baseline, node: process.version, scope: 'CPU collision query: excluded subtree, off-ray meshes, instanced and skinned targets; mediansMs = [baseline, working tree]', results };
  fs.mkdirSync(path.join(root, '.tmp'), { recursive: true });
  fs.writeFileSync(path.join(root, '.tmp/camera-collision-benchmark.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { geometry.dispose(); material.dispose(); }
