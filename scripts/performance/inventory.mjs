import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { sourceIdentity } from './source-identity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const identity = sourceIdentity(root);
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const markers = {
  frame: /\b(?:useFrame|requestAnimationFrame|setAnimationLoop)\s*\(/g,
  subscription: /\b(?:subscribe|addEventListener|setInterval)\s*\(/g,
  serialization: /\bJSON\.(?:stringify|parse)\s*\(/g,
  sceneQuery: /\b(?:intersectObjects?|castRay|computeColliderMovement|findPath)\s*\(/g,
  gpu: /\b(?:render|renderAsync|compute|computeAsync|writeBuffer|readBuffer|mapAsync)\s*\(/g,
  allocation: /\bnew\s+(?:Vector[234]|Matrix[34]|Quaternion|Box3|Float32Array|Map|Set)\s*\(/g,
};
const modules = identity.manifest.filter(({ path: file }) => /^src\/(?:core|next)\/.*\.(?:ts|tsx)$/.test(file)).map(file => {
  const source = readFileSync(path.join(root, file.path), 'utf8');
  const ast = ts.createSourceFile(file.path, source, ts.ScriptTarget.Latest, true);
  const imports = ast.statements.filter(ts.isImportDeclaration).map(node => node.moduleSpecifier.text);
  const counts = Object.fromEntries(Object.entries(markers).map(([name, regex]) => [name, [...source.matchAll(regex)].length]));
  const kind = /(?:__tests__\/|\.(?:test|spec)\.)/.test(file.path) ? 'test'
    : /\.d\.ts$/.test(file.path) || ast.statements.every(node => ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isImportDeclaration(node) && node.importClause?.isTypeOnly || ts.isExportDeclaration(node) && node.isTypeOnly) ? 'types'
    : 'runtime';
  return { ...file, domain: file.path.split('/').slice(1, 3).join('/'), kind,
    lines: source.split('\n').length, imports, markers: counts,
    audit: kind === 'runtime' ? 'unreviewed' : 'not-runtime',
    evidence: [], note: 'Static markers are review leads, not measured bottlenecks.' };
});
const domains = Object.values(modules.reduce((all, module) => {
  const row = all[module.domain] ??= { domain: module.domain, runtime: 0, types: 0, test: 0, lines: 0, markers: 0 };
  row[module.kind]++; row.lines += module.lines;
  if (module.kind === 'runtime') row.markers += Object.values(module.markers).reduce((a, b) => a + b, 0);
  return all;
}, {}));
const report = { schemaVersion: 1, generatedAt: new Date().toISOString(),
  scope: 'Every TypeScript module in src/core and src/next. Static inventory only; manual and runtime audit remain required.',
  source: identity, exports: pkg.exports, domains, modules };
const stamp = report.generatedAt.replace(/[:.]/g, '-');
const output = path.join(root, '.artifacts/performance/inventory', stamp);
mkdirSync(output, { recursive: true });
const json = JSON.stringify(report, null, 2);
writeFileSync(path.join(output, 'inventory.json'), json);
writeFileSync(path.join(output, 'summary.md'), [
  '# Core source inventory', '', `Source: ${identity.commit} / ${identity.contentHash}`, '',
  report.scope, '', '| Domain | Runtime | Types | Tests | Lines | Static markers |', '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...domains.map(row => `| ${row.domain} | ${row.runtime} | ${row.types} | ${row.test} | ${row.lines} | ${row.markers} |`),
  '', 'No module is automatically marked reviewed. Evidence must reference a real inspection or measurement.', '',
].join('\n'));
console.log(JSON.stringify({ output, sha256: createHash('sha256').update(json).digest('hex'), modules: modules.length, runtime: modules.filter(module => module.kind === 'runtime').length, domains: domains.length, sourceHash: identity.contentHash }, null, 2));
