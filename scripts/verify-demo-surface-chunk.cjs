const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-world-demo-'));
const assetsDir = path.join(outputRoot, 'assets');

function buildDemo() {
  childProcess.execFileSync(
    process.execPath,
    [
      path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
      'build',
      '--outDir',
      outputRoot,
      '--emptyOutDir',
      '--manifest',
    ],
    {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    },
  );
}

function cleanupOutput() {
  const resolvedOutputRoot = path.resolve(outputRoot);
  const resolvedTempDirectory = path.resolve(os.tmpdir());

  if (!resolvedOutputRoot.startsWith(resolvedTempDirectory + path.sep)) {
    throw new Error(`Refusing to clean unexpected path: ${resolvedOutputRoot}`);
  }

  fs.rmSync(resolvedOutputRoot, { recursive: true, force: true });
}

function listAssets() {
  if (!fs.existsSync(assetsDir)) return [];
  return fs.readdirSync(assetsDir).sort();
}

try {
  buildDemo();
  const assets = listAssets();
  const manifest = JSON.parse(
    fs.readFileSync(path.join(outputRoot, '.vite', 'manifest.json'), 'utf8'),
  );
  const initialChunks = new Set();
  function visitStaticChunk(key, chunks) {
    if (chunks.has(key)) return;
    chunks.add(key);
    for (const dependency of manifest[key]?.imports ?? []) visitStaticChunk(dependency, chunks);
  }
  for (const [key, chunk] of Object.entries(manifest)) {
    if (chunk.isEntry) visitStaticChunk(key, initialChunks);
  }
  const initialJsBytes = [...initialChunks].reduce((total, key) => {
    const file = manifest[key].file;
    return total + (file.endsWith('.js') ? fs.statSync(path.join(outputRoot, file)).size : 0);
  }, 0);
  console.log(`Initial static imports: ${initialChunks.size} chunks, ${initialJsBytes} JS bytes.`);
  for (const route of [
    'examples/minihome/Minihome.tsx',
    'examples/minihome/Miniroom.tsx',
    'examples/engine/EngineShowcase.tsx',
    'examples/engine/EngineCanvas.tsx',
    'examples/engine/PackageInspector.tsx',
    'examples/engine/packageSurface.ts',
  ]) {
    if (!manifest[route]?.isDynamicEntry || initialChunks.has(route)) {
      throw new Error(`Expected an independently lazy route: ${route}`);
    }
  }
  const cssAssets = assets.filter((file) => file.endsWith('.css'));

  if (cssAssets.length === 0) {
    throw new Error('Expected showcase styles in the demo build.');
  }

  const builtStyles = cssAssets
    .map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8'))
    .join('\n');
  for (const selector of [
    '.home-book',
    '.miniroom-view',
    '.home-tabs',
    '.viewport',
    '.scene-card',
    '.lab',
    '.metrics',
  ]) {
    if (!builtStyles.includes(selector)) {
      throw new Error(`Missing showcase styles in demo build: ${selector}`);
    }
  }

  function sourcesFor(chunks) {
    return [...chunks].flatMap((key) => {
      const map = path.join(outputRoot, `${manifest[key].file}.map`);
      return fs.existsSync(map) ? JSON.parse(fs.readFileSync(map, 'utf8')).sources : [];
    });
  }
  if (sourcesFor(initialChunks).some((source) => /\/three\/|\/src\/next\//.test(source))) {
    throw new Error('Engine code leaked into the initial UI import graph.');
  }
  const engineChunks = new Set();
  visitStaticChunk('examples/engine/EngineCanvas.tsx', engineChunks);
  if (
    sourcesFor(engineChunks).some((source) =>
      /\/src\/core\/(editor|building)\/|@react-three\/rapier/.test(source),
    )
  ) {
    throw new Error('Opening the forest eagerly loads editor/building/physics modules.');
  }

  console.log('Showcase lazy engine and responsive styles verification passed.');
} finally {
  cleanupOutput();
}
