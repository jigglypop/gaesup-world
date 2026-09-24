import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.argv[2];
if (!base) throw new Error('Usage: node scripts/release/live.mjs <site-url>');
const expected = JSON.parse(readFileSync('.artifacts/release/manifest.json', 'utf8'));
const root = base.endsWith('/') ? base : `${base}/`;
let live;
for (let attempt = 0; attempt < 8; attempt++) {
  const response = await fetch(`${root}version.json?release=${expected.version}&attempt=${attempt}`, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
  if (response.ok) { live = await response.json(); if (live.version === expected.version && live.releaseCommit === expected.releaseCommit) break; }
  console.log(`Waiting for live release (${attempt + 1}/8)`);
  if (attempt < 7) await new Promise(resolve => setTimeout(resolve, 5000));
}
assert.equal(live?.version, expected.version);
assert.equal(live?.releaseCommit, expected.releaseCommit);
assert.equal(live?.integrity, expected.integrity);
assert.equal(live?.packageSource, 'npm');
for (const route of ['', 'engine/', 'performance/']) {
  const response = await fetch(new URL(route, root), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, route);
  assert.match(await response.text(), /<div id="root"/);
}
console.log(`Live routes and npm release identity verified: ${root} ${live.version}. Browser interaction remains a separate gate.`);
