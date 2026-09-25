const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const baseline = execFileSync('git', ['rev-parse', process.argv[2] || 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
function load(relative, before, cache = new Map()) {
  if (cache.has(relative)) return cache.get(relative);
  const source = before ? execFileSync('git', ['show', `${baseline}:${relative}`], { cwd: root, encoding: 'utf8' }) : fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  cache.set(relative, module.exports);
  const localRequire = name => name.startsWith('.') ? load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), `${name}.ts`)), before, cache) : require(name);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(localRequire, module, module.exports);
  return module.exports;
}
const implementations = [true, false].map(before => ({
  ...load('src/core/scene-object/core.ts', before),
  ...load('src/core/scene-object/commands.ts', before),
}));
async function main() {
const { sourceIdentity } = await import('./performance/source-identity.mjs');
const scenarios = [];
for (const count of [100, 1000, 5000, 10000]) {
const repetitions = [];
for (let repetition = 0; repetition < 5; repetition++) {
  const states = implementations.map(api => api.createSceneDocument({ id: 'benchmark', objects: Array.from({ length: count }, (_, i) => ({ id: `object-${i}`, name: 'Original' })) }));
  const samples = [[], []];
  for (let i = 0; i < 70; i++) {
    const command = { type: 'scene-object.update', objectId: `object-${i % count}`, patch: { name: `Edited ${i}`, transform: { position: [i, 0, 2] } } };
    for (const index of (i + repetition) % 2 ? [1, 0] : [0, 1]) {
      const started = performance.now();
      const result = implementations[index].applySceneDocumentCommand(states[index], command);
      const elapsed = performance.now() - started;
      assert.equal(result.accepted, true);
      states[index] = result.document;
      if (i >= 20) samples[index].push(elapsed);
    }
  }
  assert.deepEqual(states[0], states[1], 'identical accepted document');
  const metrics = samples.map(values => { const sorted = [...values].sort((a, b) => a - b); return { medianMs: sorted[24], p95Ms: sorted[47], samplesMs: values }; });
  repetitions.push({ baseline: metrics[0], candidate: metrics[1], speedup: metrics[0].medianMs / metrics[1].medianMs });
}
  const medians = key => repetitions.map(run => run[key].medianMs).sort((a, b) => a - b);
  scenarios.push({ objects: count, samplesPerRun: 50, baselineMedianMs: medians('baseline')[2], candidateMedianMs: medians('candidate')[2], repetitions });
}
const report = { baseline, candidateSource: sourceIdentity(root), node: process.version, cpu: os.cpus()[0].model,
  scope: 'Five repeats of alternating matched CPU scene-command name/transform updates, 20 warmup / 50 samples per repeat; immutable results checked for equality. Not a GPU/FPS measurement.', scenarios };
const output = path.join(root, '.artifacts/performance', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'scene-command-benchmark.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ output, baseline, candidateSourceHash: report.candidateSource.contentHash, scenarios: scenarios.map(({ repetitions, ...row }) => ({ ...row, repeats: repetitions.length, speedup: row.baselineMedianMs / row.candidateMedianMs })) }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
