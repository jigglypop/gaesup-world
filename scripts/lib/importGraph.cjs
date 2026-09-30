// Runtime import graph of the source tree, shared by check-entry-isolation and the S-H14 acceptance scenario.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
// Wildcard tsconfig paths, e.g. ['@core/', 'src/core/']; tsconfig is the only alias list.
const ALIASES = Object.entries(JSON.parse(fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8')).compilerOptions.paths)
  .filter(([alias]) => alias.endsWith('/*'))
  .map(([alias, [target]]) => [alias.slice(0, -1), target.replace(/^\.\//, '').slice(0, -1)]);
const IMPORT_PATTERN = /(?:import|export)\s+(?:type\s+)?(?:[^'"`]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
const TYPE_ONLY_PATTERN = /^\s*(?:import|export)\s+type\s/;

function resolveFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}

/** Resolves a relative or tsconfig-aliased specifier to a source file; null for packages. */
function resolveSpecifier(from, specifier) {
  if (specifier.startsWith('.')) return resolveFile(path.resolve(path.dirname(from), specifier));
  for (const [prefix, target] of ALIASES) {
    if (specifier.startsWith(prefix)) return resolveFile(path.join(ROOT, target, specifier.slice(prefix.length)));
  }
  return null;
}

/** Specifiers a file imports or re-exports at runtime; type-only statements are skipped. */
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

/**
 * Breadth-first walk of runtime imports from `entry` (relative to the repository root). `visit(specifier, file)`
 * returning false stops that edge; it also receives the parent map so far. Returns every reached source file mapped to the file that first imported it.
 */
function walkRuntimeImports(entry, visit = () => true) {
  const start = path.resolve(ROOT, entry);
  const parents = new Map([[start, null]]);
  const queue = [start];
  while (queue.length > 0) {
    const file = queue.shift();
    for (const specifier of collectRuntimeImports(file)) {
      if (visit(specifier, file, parents) === false) continue;
      const resolved = resolveSpecifier(file, specifier);
      if (!resolved || parents.has(resolved)) continue;
      parents.set(resolved, file);
      queue.push(resolved);
    }
  }
  return parents;
}

/** Import chain from the entry to `file`, as repository-relative paths. */
function importChain(parents, file) {
  const chain = [];
  for (let cursor = file; cursor; cursor = parents.get(cursor)) chain.unshift(path.relative(ROOT, cursor));
  return chain;
}

module.exports = { ROOT, resolveSpecifier, collectRuntimeImports, walkRuntimeImports, importChain };
