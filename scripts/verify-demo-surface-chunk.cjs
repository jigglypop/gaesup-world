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
const surfaceCss = assets.filter((file) => /^packageSurface-.+\.css$/.test(file));
const indexJs = assets.filter((file) => /^index-.+\.js$/.test(file));

if (surfaceJs.length === 0) {
  throw new Error('Expected demo build to emit a lazy packageSurface JS chunk.');
}

if (surfaceCss.length === 0) {
  throw new Error('Expected demo build to emit a packageSurface CSS chunk for gaesup-world/style.css.');
}

for (const file of indexJs) {
  const source = fs.readFileSync(path.join(assetsDir, file), 'utf8');
  if (source.includes('examples.package-surface')) {
    throw new Error(`Package surface code leaked into initial chunk: ${file}`);
  }
}

console.log('Demo package surface chunk verification passed.');
