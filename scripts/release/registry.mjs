import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const filename = '.artifacts/release/manifest.json';
const manifest = JSON.parse(readFileSync(filename, 'utf8'));
let metadata;
// npm can acknowledge publication before its processing queue exposes the version.
// Keep deployment gated on the registry instead of retrying an immutable publish.
const attempts = 90;
for (let attempt = 0; attempt < attempts; attempt++) {
  const response = await fetch(`https://registry.npmjs.org/${manifest.name}/${manifest.version}`, { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
  if (response.ok) { metadata = await response.json(); break; }
  if (response.status !== 404 && response.status !== 429 && response.status < 500) throw new Error(`Registry returned ${response.status}`);
  console.log(`Waiting for registry ${manifest.version}, attempt ${attempt + 1}/${attempts} (${response.status})`);
  if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 10000));
}
if (!metadata || metadata.version !== manifest.version) throw new Error('Published version is not available. Publication and deployment are separate states.');
if (metadata.gaesupRelease?.sourceCommit !== manifest.sourceCommit || metadata.gaesupRelease?.version !== manifest.version) throw new Error('Registry package source metadata differs from the release.');
if (metadata.gitHead && metadata.gitHead !== manifest.releaseCommit) throw new Error('Registry gitHead differs from the release tag.');
const integrity = metadata.dist.integrity;
if (!integrity?.startsWith('sha512-')) throw new Error('Expected registry SHA-512 integrity.');
const response = await fetch(metadata.dist.tarball, { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error(`Tarball returned ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const actual = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
if (actual !== integrity) throw new Error('Registry tarball integrity mismatch.');
writeFileSync('.artifacts/release/package.tgz', bytes);
writeFileSync(filename, JSON.stringify({ ...manifest, integrity, tarball: metadata.dist.tarball, registryVerifiedAt: new Date().toISOString() }, null, 2));
console.log(`Verified ${manifest.name}@${manifest.version} and tarball integrity.`);
