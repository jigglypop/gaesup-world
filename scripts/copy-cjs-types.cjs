const fs = require('fs');
const path = require('path');

const pairs = [
  ['dist/index.d.ts', 'dist/index.d.cts'],
  ['dist/admin-entry.d.ts', 'dist/admin-entry.d.cts'],
  ['dist/blueprints/index.d.ts', 'dist/blueprints/index.d.cts'],
  ['dist/blueprints/editor.d.ts', 'dist/blueprints/editor.d.cts'],
  ['dist/postprocessing.d.ts', 'dist/postprocessing.d.cts'],
];

for (const [source, target] of pairs) {
  if (!fs.existsSync(source)) continue;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

