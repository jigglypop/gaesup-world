const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

if (!process.argv[2]) throw Error('Usage: node scripts/verify-r3f10-install.cjs <installed-fixture-directory>');

(async () => {
  const root = path.join(path.resolve(process.argv[2]), 'node_modules/@react-three/fiber/dist');
  const results = [];
  for (const entry of ['index.mjs', 'index.cjs', 'legacy.mjs', 'legacy.cjs', 'webgpu/index.mjs', 'webgpu/index.cjs']) {
    try {
      const api = entry.endsWith('.cjs')
        ? require(path.join(root, entry))
        : await import(pathToFileURL(path.join(root, entry)).href);
      const warnings = [];
      const previous = console.warn;
      try {
        console.warn = (...args) => warnings.push(args.join(' '));
        api.invalidate({ internal: { active: false, rootId: 'audit-missing' } });
        assert.equal(warnings.length, 0);
        api.invalidate({ internal: { active: true, rootId: 'audit-missing' } });
        assert.equal(warnings.length, 1);
        assert.match(warnings[0], /invalidation ignored/);
      } finally {
        console.warn = previous;
      }
      results.push({ entry, inactiveSkipped: true, activePathRetained: true });
    } catch (error) {
      results.push({ entry, error: error.message });
      process.exitCode = 1;
    }
  }
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
