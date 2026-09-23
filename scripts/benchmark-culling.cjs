const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/next/core/culling.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const context = { exports: {}, Float32Array, Uint32Array, Uint8Array, Math };
vm.runInNewContext(compiled.outputText, context);
const { cullSpheres, compactVisible, cullAndCompactSpheres, extractFrustumPlanes } =
  context.exports;
const count = 100000;
const positions = new Float32Array(count * 3);
let seed = 271828;
for (let i = 0; i < positions.length; i += 1) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  positions[i] = (seed / 4294967296 - 0.5) * 6;
}
const planes = extractFrustumPlanes(
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  new Float32Array(24),
);
const flags = new Uint8Array(count);
const beforeIndices = new Uint32Array(count);
const afterIndices = new Uint32Array(count);
function before() {
  cullSpheres(planes, positions, 0.2, count, flags);
  return compactVisible(flags, count, beforeIndices);
}
function after() {
  return cullAndCompactSpheres(planes, positions, 0.2, count, afterIndices);
}
for (let i = 0; i < 50; i += 1) {
  before();
  after();
}
const samples = { before: [], after: [] };
for (let i = 0; i < 200; i += 1) {
  for (const mode of i % 2 ? ['before', 'after'] : ['after', 'before']) {
    const start = performance.now();
    (mode === 'before' ? before : after)();
    samples[mode].push(performance.now() - start);
  }
}
const visible = before();
assert.equal(after(), visible);
assert.deepEqual(beforeIndices.subarray(0, visible), afterIndices.subarray(0, visible));
function median(values) {
  return values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
}
const result = {
  count,
  visible,
  samples: 200,
  seed: 271828,
  node: process.version,
  beforeMedianMs: median(samples.before),
  afterMedianMs: median(samples.after),
  visibilityScratchBytesRemoved: flags.byteLength,
};
const output = path.join(root, '.tmp/engine-showcase');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'culling-benchmark.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
