import { readFile } from 'node:fs/promises';

import ts from 'typescript';

const THREE_URL = import.meta.resolve('three');

/** Runs a library module in Node without React or a built dist; it may import only `three` and types. */
async function load(relative) {
  const source = await readFile(new URL(`../../src/core/assets/${relative}`, import.meta.url), 'utf8');
  const compiled = ts
    .transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    })
    .outputText.replace(/export \* from ['"]\.\/types['"];?/g, '')
    .replace(/from ['"]three['"]/g, `from '${THREE_URL}'`);
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}

// Execute the same pure contract as the library.
export const contract = await load('production/index.ts');
// The engine's model and figure inspection, sharing the tools' three instance.
export const inspection = await load('pipeline/modelInspection.ts');
