import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const filename = '.artifacts/release/manifest.json';
const manifest = JSON.parse(readFileSync(filename, 'utf8'));
let metadata;
// npm can acknowledge publication before its processing queue exposes the version.
// Keep deployment gated on the registry instead of retrying an immutable publish.
// The registry CDN caches 404s for five minutes. Probing a cache-busted URL neither fails on nor
// poisons the public URL that installs use while the version is still propagating.
const attempts = 90;
const fresh = url => `${url}?verify=${Date.now()}`;
for (let attempt = 0; attempt < attempts; attempt++) {
  const response = await fetch(fresh(`https://registry.npmjs.org/${manifest.name}/${manifest.version}`), { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
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
let bytes;
for (let attempt = 0; attempt < attempts && !bytes; attempt++) {
  const response = await fetch(fresh(metadata.dist.tarball), { signal: AbortSignal.timeout(60000) });
  if (response.ok) { bytes = Buffer.from(await response.arrayBuffer()); break; }
  if (response.status !== 404 && response.status !== 429 && response.status < 500) throw new Error(`Tarball returned ${response.status}`);
  console.log(`Waiting for tarball ${manifest.version}, attempt ${attempt + 1}/${attempts} (${response.status})`);
  if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 10000));
}
if (!bytes) throw new Error('Published tarball is not available.');
const actual = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
if (actual !== integrity) throw new Error('Registry tarball integrity mismatch.');
writeFileSync('.artifacts/release/package.tgz', bytes);
writeFileSync(filename, JSON.stringify({ ...manifest, integrity, tarball: metadata.dist.tarball, registryVerifiedAt: new Date().toISOString() }, null, 2));
console.log(`Verified ${manifest.name}@${manifest.version} and tarball integrity.`);
