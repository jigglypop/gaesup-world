import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [filename, ...directories] = process.argv.slice(2);
if (!filename || !/^[a-z0-9-]+\.json$/.test(filename) || !directories.length) {
  throw new Error('Usage: node scripts/performance/bundle.mjs <name.json> <evidence-directory>...');
}
const sources = {};
const runs = new Map();
for (const directory of directories) {
  for (const name of readdirSync(directory)) {
    if (!/^[0-9a-f-]{36}\.json$/.test(name)) continue;
    const { source, ...run } = JSON.parse(readFileSync(path.join(directory, name), 'utf8'));
    if (run.schemaVersion !== 1 || !source?.contentHash) throw new Error(`Invalid run: ${name}`);
    sources[source.contentHash] = source;
    runs.set(run.runId, { ...run, sourceHash: source.contentHash });
  }
}
if (!runs.size) throw new Error('No run files found');
const target = path.resolve('examples/performance/baselines');
mkdirSync(target, { recursive: true });
writeFileSync(path.join(target, filename), JSON.stringify({ schemaVersion: 1, sources, runs: [...runs.values()] }) + '\n');
console.log(`${runs.size} runs, ${Object.keys(sources).length} source manifests: ${filename}`);
