const fs = require('fs');
const path = require('path');

const { ROOT, importChain, walkRuntimeImports } = require('./lib/importGraph.cjs');

const FORBIDDEN = [/^react$/, /^react\//, /^react-dom/, /^zustand/, /^@react-three\//];
const LAYER_ONE_ALLOWED = [/^@react-three\/rapier$/];
let allowed = [];

function checkEntry(entry) {
  const violations = [];
  const parents = walkRuntimeImports(entry, (specifier, file, reached) => {
    if (!FORBIDDEN.some((pattern) => pattern.test(specifier)) || allowed.some((pattern) => pattern.test(specifier))) return true;
    violations.push({ specifier, chain: importChain(reached, file) });
    return false;
  });
  return { files: parents.size, violations };
}

function listLayerOneFiles(directory, files = []) {
  for (const name of fs.readdirSync(directory)) {
    const full = path.join(directory, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name !== '__tests__' && name !== 'node_modules') listLayerOneFiles(full, files);
      continue;
    }
    const relative = path.relative(ROOT, full).split(path.sep).join('/');
    if (/\/core\//.test(relative.replace(/^src\/core/, '')) && /\.ts$/.test(name) && !/\.test\.ts$/.test(name)) {
      files.push(relative);
    }
  }
  return files;
}

function runLayerOneAudit(maxViolations) {
  allowed = LAYER_ONE_ALLOWED;
  const files = listLayerOneFiles(path.join(ROOT, 'src/core'));
  const offenders = [];
  for (const file of files) {
    const { violations } = checkEntry(file);
    if (violations.length > 0) offenders.push({ file, first: violations[0] });
  }
  console.log(`layer1: ${files.length} files, ${offenders.length} reach React/Zustand/R3F indirectly`);
  for (const offender of offenders) {
    console.log(`  ${offender.file}: ${offender.first.specifier} <- ${offender.first.chain.join(' -> ')}`);
  }
  if (Number.isFinite(maxViolations) && offenders.length > maxViolations) process.exitCode = 1;
}

const args = process.argv.slice(2);
if (args.includes('--layer1')) {
  const maxArg = args.find((arg) => arg.startsWith('--max-violations='));
  runLayerOneAudit(maxArg ? Number(maxArg.split('=')[1]) : Number.POSITIVE_INFINITY);
  return;
}
const entries = args;
let failed = false;
for (const entry of entries.length > 0 ? entries : ['src/server-contracts.ts']) {
  const { files, violations } = checkEntry(entry);
  console.log(`${entry}: ${files} files, ${violations.length} framework imports`);
  for (const violation of violations.slice(0, 10)) {
    console.log(`  ${violation.specifier} <- ${violation.chain.join(' -> ')}`);
  }
  if (violations.length > 0) failed = true;
}
process.exitCode = failed ? 1 : 0;
