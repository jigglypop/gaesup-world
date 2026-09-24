import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
assert.ok(existsSync(path.join(root, 'AGENTS.md')), 'Missing AGENTS.md');
// Check executable gates, not prose in AGENTS.md.
const scripts = JSON.parse(read('package.json')).scripts;
for (const gate of ['test:harness', 'lint', 'test:asset-tools', 'build']) {
  assert.ok(scripts.verify.includes(gate), `verify must invoke ${gate}`);
}
for (const gate of ['verify', 'test:memory:ci', 'test:package:built', 'test:demo']) {
  assert.ok(scripts['verify:full'].includes(gate), `verify:full must invoke ${gate}`);
}
const tsconfig = JSON.parse(read('tsconfig.json'));
for (const flag of ['strict', 'noUncheckedIndexedAccess', 'exactOptionalPropertyTypes']) {
  assert.equal(tsconfig.compilerOptions[flag], true, `Required TypeScript contract: ${flag}`);
}
for (const file of ['scripts/verify-package-consumer.cjs', 'scripts/verify-demo-surface-chunk.cjs']) {
  assert.ok(existsSync(path.join(root, file)), `Missing validation entry: ${file}`);
}
console.log('Repository harness configuration and verification entries passed.');
