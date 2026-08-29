const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'demo-dist', 'assets');

function listAssets() {
  if (!fs.existsSync(assetsDir)) return [];
  return fs.readdirSync(assetsDir).sort();
}

const assets = listAssets();
const surfaceJs = assets.filter((file) => /^packageSurface-.+\.js$/.test(file));
const cssAssets = assets.filter((file) => file.endsWith('.css'));
const indexJs = assets.filter((file) => /^index-.+\.js$/.test(file));

if (surfaceJs.length === 0) {
  throw new Error('Expected demo build to emit a lazy packageSurface JS chunk.');
}

if (cssAssets.length === 0) {
  throw new Error('Expected demo build to emit CSS for gaesup-world/style.css.');
}

const hasEditorTheme = cssAssets.some((file) => {
  const source = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  return source.includes('--editor-bg-1');
});

if (!hasEditorTheme) {
  throw new Error('Expected demo build CSS to include the gaesup-world editor theme.');
}

for (const file of indexJs) {
  const source = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  if (source.includes('examples.package-surface')) {
    throw new Error(`Package surface code leaked into initial chunk: ${file}`);
  }
}

console.log('Demo package surface chunk verification passed.');
