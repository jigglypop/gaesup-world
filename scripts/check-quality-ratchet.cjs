const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASELINE_FILE = path.join(ROOT, 'quality-baseline.json');
const SOURCE_DIR = path.join(ROOT, 'src');
const TEST_PATTERN = /__tests__|\.test\.|\.spec\./;
const LOGGER_FILE = path.join('src', 'core', 'utils', 'logger.ts');
const FRAME_HOST_DIR = path.join('src', 'core', 'runtime', 'frame', 'react');
const COMPONENT_LINE_LIMIT = 200;
const MODULE_LINE_LIMIT = 500;

const METRICS = {
  interfaceDeclarations: (source) => count(source, /^\s*(?:export\s+)?(?:declare\s+)?interface\s/gm),
  consoleCalls: (source, file) =>
    file === LOGGER_FILE ? 0 : count(source, /\bconsole\.(?:log|warn|error|info|debug)\(/g),
  anyUsages: (source) => count(source, /:\s*any\b|\bas any\b|<any>|\bany\[\]/g),
  rawUseFrame: (source, file) => (file.startsWith(FRAME_HOST_DIR) ? 0 : count(source, /\buseFrame\(/g)),
  oversizedComponents: (source, file) =>
    file.endsWith('.tsx') && lineCount(source) > COMPONENT_LINE_LIMIT ? 1 : 0,
  oversizedModules: (source, file) =>
    file.endsWith('.ts') && lineCount(source) > MODULE_LINE_LIMIT ? 1 : 0,
};

function count(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function lineCount(source) {
  return source.split('\n').length;
}

function collectSourceFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceFiles(fullPath, files);
    else if (/\.tsx?$/.test(entry.name) && !TEST_PATTERN.test(fullPath)) files.push(fullPath);
  }
  return files;
}

function measure() {
  const totals = Object.fromEntries(Object.keys(METRICS).map((name) => [name, 0]));
  for (const file of collectSourceFiles(SOURCE_DIR)) {
    const relative = path.relative(ROOT, file);
    const source = fs.readFileSync(file, 'utf8');
    for (const [name, metric] of Object.entries(METRICS)) totals[name] += metric(source, relative);
  }
  return totals;
}

function main() {
  const current = measure();
  if (process.argv.includes('--update')) {
    fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(current, null, 2)}\n`);
    process.stdout.write(`quality baseline updated: ${JSON.stringify(current)}\n`);
    return;
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  const increased = [];
  const decreased = [];
  for (const [name, value] of Object.entries(current)) {
    const limit = baseline[name] ?? 0;
    if (value > limit) increased.push(`${name}: ${limit} -> ${value}`);
    else if (value < limit) decreased.push(`${name}: ${limit} -> ${value}`);
  }
  if (increased.length > 0) {
    process.stderr.write(`quality ratchet failed (increased):\n  ${increased.join('\n  ')}\n`);
    process.exitCode = 1;
  }
  if (decreased.length > 0) {
    process.stderr.write(
      `quality improved; run "pnpm check:quality --update" to lock it in:\n  ${decreased.join('\n  ')}\n`,
    );
    process.exitCode = 1;
  }
  if (process.exitCode !== 1) process.stdout.write(`quality ratchet ok: ${JSON.stringify(current)}\n`);
}

main();
