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
  const manifest = JSON.parse(fs.readFileSync(path.join(outputRoot, '.vite', 'manifest.json'), 'utf8'));
  const initialChunks = new Set();
  function visitInitialChunk(key) {
    if (initialChunks.has(key)) return;
    initialChunks.add(key);
    for (const dependency of manifest[key]?.imports ?? []) visitInitialChunk(dependency);
  }
  for (const [key, chunk] of Object.entries(manifest)) {
    if (chunk.isEntry) visitInitialChunk(key);
  }
  const initialJsBytes = [...initialChunks].reduce((total, key) => {
    const file = manifest[key].file;
    return total + (file.endsWith('.js') ? fs.statSync(path.join(outputRoot, file)).size : 0);
  }, 0);
  console.log(`Initial static imports: ${initialChunks.size} chunks, ${initialJsBytes} JS bytes.`);
  for (const route of ['examples/pages/AdminPage.tsx', 'examples/AdminTest.tsx', 'examples/pages/AssetsPage.tsx']) {
    if (!manifest[route]?.isDynamicEntry || initialChunks.has(route)) {
      throw new Error(`Expected an independently lazy route: ${route}`);
    }
  }
  const adminUiChunks = Object.entries(manifest).filter(([, chunk]) =>
    /^assets\/GaesupAdmin-.+\.js$/.test(chunk.file),
  );
  if (adminUiChunks.length === 0 || adminUiChunks.some(([key]) => initialChunks.has(key))) {
    throw new Error('Expected shared administrator UI outside the initial static import graph.');
  }
  const deferredAdminBytes = adminUiChunks.reduce(
    (total, [, chunk]) => total + fs.statSync(path.join(outputRoot, chunk.file)).size,
    0,
  );
  console.log(`Administrator UI deferred from initial imports: ${deferredAdminBytes} JS bytes.`);
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

  const builtStyles = cssAssets.map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8')).join('\n');
  for (const selector of ['.mailbox-panel', '.mailbox-list', '[data-world-overlay]']) {
    if (!builtStyles.includes(selector)) {
      throw new Error(`Missing world panel styles in demo build: ${selector}`);
    }
  }

  for (const file of indexJs) {
    const source = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    if (source.includes('examples.package-surface')) {
      throw new Error(`Package surface code leaked into initial chunk: ${file}`);
    }
  }

  console.log('Demo package surface chunk verification passed.');
} finally {
  cleanupOutput();
}
