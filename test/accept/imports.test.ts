import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { acceptScenario } from './scenario';
import { moduleScopeEffects, packageSourceFiles, type ModuleScopeEffects } from './support/moduleScope';

// What importing a package entry runs before anything is called: registrations and polyfills (statement calls),
// decorator registries and global stores. Other module-scope calls are mostly pure values and are only recorded.
acceptScenario('S-H14', () => {
  const total: ModuleScopeEffects = { statementCalls: [], classDecorators: [], globalStores: [], otherCalls: [] };
  const files = packageSourceFiles();
  for (const file of files) {
    const effects = moduleScopeEffects(file);
    for (const kind of Object.keys(total) as (keyof ModuleScopeEffects)[]) total[kind].push(...effects[kind]);
  }
  const report = path.resolve(__dirname, '../../.artifacts/accept/headless/S-H14-effects.txt');
  mkdirSync(path.dirname(report), { recursive: true });
  writeFileSync(report, (['statementCalls', 'classDecorators', 'globalStores'] as const)
    .flatMap((kind) => total[kind].map((effect) => `${kind} ${effect.file}:${effect.line} ${effect.callee}`)).join('\n'));
  return {
    statementCalls: total.statementCalls.length,
    classDecorators: total.classDecorators.length,
    globalStores: total.globalStores.length,
    otherCalls: total.otherCalls.length,
    sourceFiles: files.length,
  };
}, 60_000);
