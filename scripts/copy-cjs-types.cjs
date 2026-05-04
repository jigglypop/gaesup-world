const fs = require('fs');
const path = require('path');

const pairs = [
  ['dist/index.d.ts', 'dist/index.d.cts'],
  ['dist/admin-entry.d.ts', 'dist/admin-entry.d.cts'],
  ['dist/assets.d.ts', 'dist/assets.d.cts'],
  ['dist/blueprints/index.d.ts', 'dist/blueprints/index.d.cts'],
  ['dist/blueprints/editor.d.ts', 'dist/blueprints/editor.d.cts'],
  ['dist/editor.d.ts', 'dist/editor.d.cts'],
  ['dist/network.d.ts', 'dist/network.d.cts'],
  ['dist/plugins.d.ts', 'dist/plugins.d.cts'],
  ['dist/postprocessing.d.ts', 'dist/postprocessing.d.cts'],
  ['dist/runtime.d.ts', 'dist/runtime.d.cts'],
  ['dist/server-contracts.d.ts', 'dist/server-contracts.d.cts'],
];

for (const [source, target] of pairs) {
  if (!fs.existsSync(source)) continue;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}
