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
} finally {
  cleanupOutput();
}
