import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const guardPath = join(dirname(fileURLToPath(import.meta.url)), 'astra-guard.mjs');
process.argv[1] = guardPath;

try {
  await import(pathToFileURL(guardPath).href);
} catch (error) {
  console.error(`Astra guard bootstrap failed: ${error}`);
  process.exitCode = 2;
}
