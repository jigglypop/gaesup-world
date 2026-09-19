// CPU-only matched benchmark. Usage: node scripts/benchmark-runtime.cjs [baseline-ref]
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const THREE = require('three');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const baseline = execFileSync('git', ['rev-parse', process.argv[2] || 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();

function load(relative, before, cache = new Map()) {
  if (cache.has(relative)) return cache.get(relative);
  const source = before
    ? execFileSync('git', ['show', `${baseline}:${relative}`], { cwd: root, encoding: 'utf8' })
    : fs.readFileSync(path.join(root, relative), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  cache.set(relative, module.exports);
  const customRequire = (name) => {
    if (name.endsWith('/wasm/loader')) return { loadCoreWasm: async () => null };
    if (name.startsWith('.')) return load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), `${name}.ts`)), before, cache);
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: relative })(customRequire, module, module.exports);
  return module.exports;
}
function measure(before, after, iterations = 60) {
  for (let i = 0; i < 20; i++) { before(); after(); }
  const samples = [[], []];
  for (let i = 0; i < iterations; i++) {
    for (const index of i % 2 ? [0, 1] : [1, 0]) {
      const start = performance.now();
      (index ? after : before)();
      samples[index].push(performance.now() - start);
    }
  }
  const summary = samples.map(values => {
    values.sort((a, b) => a - b);
    return { medianMs: values[Math.floor(values.length / 2)], p95Ms: values[Math.floor(values.length * 0.95)] };
  });
  return { iterations, before: summary[0], after: summary[1], speedup: summary[0].medianMs / summary[1].medianMs };
}

async function main() {
  const navigation = [true, false].map(before => load('src/core/navigation/NavigationSystem.ts', before).NavigationSystem);
  const results = [];
  for (const scenario of ['open', 'barrier', 'weighted', 'unreachable']) {
    const width = 100;
    const systems = navigation.map(Type => Type.getInstance({ cellSize: 1, worldMinX: 0, worldMinZ: 0, worldMaxX: width, worldMaxZ: width }));
    await Promise.all(systems.map(system => system.init()));
    for (const system of systems) {
      if (scenario === 'barrier' || scenario === 'unreachable') system.setBlocked(50.5, scenario === 'barrier' ? 45 : 50, 1, scenario === 'barrier' ? 90 : 100);
      if (scenario === 'weighted') {
        for (let z = 0; z < width; z++) for (let x = 0; x < width; x++) system.setCost(x + 0.5, z + 0.5, 1 + (x * 17 + z * 31) % 9);
      }
    }
    const run = systems.map(system => () => system.findPath(5.5, 5.5, 94.5, 5.5, { weighted: scenario === 'weighted' }));
    const cost = route => route.length === 0 ? Infinity : route.slice(1).reduce((sum, point, i) => {
      const previous = route[i];
      const diagonal = point[0] !== previous[0] && point[2] !== previous[2];
      const weight = scenario === 'weighted' ? 1 + (Math.floor(point[0]) * 17 + Math.floor(point[2]) * 31) % 9 : 1;
      return sum + (diagonal ? 14 : 10) * weight;
    }, 0);
    assert.equal(cost(run[0]()), cost(run[1]()), `${scenario}: path cost`);
    results.push({ subsystem: 'navigation-js', scenario, gridCells: width * width, ...measure(...run) });
    systems.forEach(system => system.dispose());
  }
  const grids = [true, false].map(before => new (load('src/core/world/core/SpatialGrid.ts', before).SpatialGrid)({ cellSize: 10 }));
  let seed = 271828;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 10000; i++) {
    const position = new THREE.Vector3(random() * 1000 - 500, random() * 10, random() * 1000 - 500);
    grids.forEach(grid => grid.add(String(i), position));
  }
  const queries = Array.from({ length: 1000 }, () => new THREE.Vector3(random() * 1000 - 500, 5, random() * 1000 - 500));
  for (const radius of [2, 10, 35]) {
    for (const query of queries) assert.deepEqual(grids[0].getNearby(query, radius), grids[1].getNearby(query, radius));
    const run = grids.map(grid => {
      const out = [];
      return () => { for (const query of queries) grid.getNearby(query, radius, out); };
    });
    results.push({ subsystem: 'spatial-grid', radius, queriesPerSample: queries.length, objects: 10000, ...measure(...run) });
  }
  const report = { baseline, node: process.version, cpu: os.cpus()[0].model, platform: process.platform, seed: 271828, warmup: 20, scope: 'Node CPU only; WASM loader disabled; no browser/GPU/FPS claim', results };
  fs.mkdirSync(path.join(root, '.tmp'), { recursive: true });
  fs.writeFileSync(path.join(root, '.tmp/runtime-benchmark.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
