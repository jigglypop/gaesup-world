const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ALIASES = [
  ['@/', 'src/'],
  ['@core/', 'src/core/'],
  ['@hooks/', 'src/core/hooks/'],
  ['@stores/', 'src/core/stores/'],
  ['@constants/', 'src/core/constants/'],
  ['@utils/', 'src/core/utils/'],
  ['@motions/', 'src/core/motions/'],
];
const FORBIDDEN = [/^react$/, /^react\//, /^react-dom/, /^zustand/, /^@react-three\//];
const LAYER_ONE_ALLOWED = [/^@react-three\/rapier$/];
let allowed = [];
const IMPORT_PATTERN = /(?:import|export)\s+(?:type\s+)?(?:[^'"`]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
const TYPE_ONLY_PATTERN = /^\s*(?:import|export)\s+type\s/;

function resolveFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

function resolveSpecifier(from, specifier) {
  if (specifier.startsWith('.')) return resolveFile(path.resolve(path.dirname(from), specifier));
  for (const [prefix, target] of ALIASES) {
    if (specifier.startsWith(prefix)) return resolveFile(path.join(ROOT, target, specifier.slice(prefix.length)));
  }
  return null;
}

function collectRuntimeImports(file) {
  const source = fs.readFileSync(file, 'utf8');
  const statements = source.split(/;\s*\n|\n(?=import|export)/);
  const specifiers = [];
  for (const statement of statements) {
    if (TYPE_ONLY_PATTERN.test(statement)) continue;
    IMPORT_PATTERN.lastIndex = 0;
    let match;
    while ((match = IMPORT_PATTERN.exec(statement))) specifiers.push(match[1]);
  }
  return specifiers;
}

function checkEntry(entry) {
  const start = path.join(ROOT, entry);
  const parents = new Map([[start, null]]);
  const queue = [start];
  const violations = [];
  while (queue.length > 0) {
    const file = queue.shift();
    for (const specifier of collectRuntimeImports(file)) {
      if (FORBIDDEN.some((pattern) => pattern.test(specifier)) && !allowed.some((pattern) => pattern.test(specifier))) {
        const chain = [];
        for (let cursor = file; cursor; cursor = parents.get(cursor)) chain.unshift(path.relative(ROOT, cursor));
        violations.push({ specifier, chain });
        continue;
      }
      const resolved = resolveSpecifier(file, specifier);
      if (!resolved || parents.has(resolved)) continue;
      parents.set(resolved, file);
      queue.push(resolved);
    }
  }
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
