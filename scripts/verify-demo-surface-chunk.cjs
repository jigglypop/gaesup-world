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
  function sourcesOf(key) {
    const map = path.join(outputRoot, `${manifest[key].file}.map`);
    return fs.existsSync(map) ? JSON.parse(fs.readFileSync(map, 'utf8')).sources : [];
  }
  function sourcesFor(chunks) {
    return [...chunks].flatMap(sourcesOf);
  }
  // A single lazy route may be emitted as a shared chunk instead of a dynamic-entry facade, so chunks are found by the
  // source files their maps contain.
  const routeChunks = ['examples/minihome/Minihome.tsx', 'examples/minihome/Miniroom.tsx'].map((route) => {
    const key = Object.keys(manifest).find((candidate) => sourcesOf(candidate).some((source) => source.endsWith(route)));
    if (!key || initialChunks.has(key)) throw new Error(`Expected an independently lazy route: ${route}`);
    return key;
  });
  const cssAssets = assets.filter((file) => file.endsWith('.css'));

  if (cssAssets.length === 0) {
    throw new Error('Expected minihome styles in the demo build.');
  }

  const builtStyles = cssAssets
    .map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8'))
    .join('\n');
  for (const selector of ['.world-stage', '.miniroom-view', '.world-status']) {
    if (!builtStyles.includes(selector)) {
      throw new Error(`Missing minihome styles in demo build: ${selector}`);
    }
  }

  if (sourcesFor(initialChunks).some((source) => /\/three\/|\/src\/next\//.test(source))) {
    throw new Error('Engine code leaked into the initial UI import graph.');
  }
  // The home route must not pay for modules only the R3F world and editor use.
  const homeChunks = new Set();
  for (const key of routeChunks) visitStaticChunk(key, homeChunks);
  const homeHeavy = sourcesFor(homeChunks).filter((source) =>
    /\/src\/core\/editor\/|\/src\/core\/rendering\/postprocess\/|\/postprocessing\/|@dimforge\/rapier3d/.test(source),
  );
  if (homeHeavy.length > 0) {
    throw new Error(`The home route eagerly loads editor/postprocessing/physics modules: ${homeHeavy.slice(0, 5).join(', ')}`);
  }

  console.log('Minihome lazy route and styles verification passed.');
} finally {
  cleanupOutput();
}
