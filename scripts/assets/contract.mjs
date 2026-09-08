import { readFile } from 'node:fs/promises';

import ts from 'typescript';

const source = await readFile(
  new URL('../../src/core/assets/production/index.ts', import.meta.url),
  'utf8',
);
const compiled = ts
  .transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  })
  .outputText.replace(/export \* from ['"]\.\/types['"];?/g, '');
// Execute the same pure contract as the library, without importing React or a built dist.
export const contract = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);
