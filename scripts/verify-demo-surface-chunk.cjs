const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-world-demo-'));
const ROUTE = 'examples/minihome/Minihome.tsx';

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

try {
  buildDemo();
  const manifest = JSON.parse(
    fs.readFileSync(path.join(outputRoot, '.vite', 'manifest.json'), 'utf8'),
  );
  function visitStaticChunk(key, chunks) {
    if (chunks.has(key)) return;
    chunks.add(key);
    for (const dependency of manifest[key]?.imports ?? []) visitStaticChunk(dependency, chunks);
  }
  const initialChunks = new Set();
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

  if (sourcesFor(initialChunks).some((source) => /\/three\//.test(source))) {
    throw new Error('Engine code leaked into the initial UI import graph.');
  }
  // A single lazy route may be emitted as a shared chunk instead of a dynamic-entry facade, so its chunk is found by
  // the source files the maps contain.
  const routeChunk = Object.keys(manifest).find((key) => sourcesOf(key).some((source) => source.endsWith(ROUTE)));
  if (!routeChunk || initialChunks.has(routeChunk)) throw new Error(`Expected an independently lazy route: ${ROUTE}`);
  // The world route loads the engine and physics; editor and post-processing load only when a scene asks for them.
  const routeChunks = new Set();
  visitStaticChunk(routeChunk, routeChunks);
  const heavy = sourcesFor(routeChunks).filter((source) =>
    /\/src\/core\/editor\/|\/src\/core\/rendering\/postprocess\/|\/postprocessing\//.test(source),
  );
  if (heavy.length > 0) {
    throw new Error(`The world route eagerly loads editor/postprocessing modules: ${heavy.slice(0, 5).join(', ')}`);
  }

  console.log('Example lazy route verification passed.');
} finally {
  cleanupOutput();
}
