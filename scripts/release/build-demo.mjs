import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(readFileSync('.artifacts/release/manifest.json', 'utf8'));
const consumer = JSON.parse(readFileSync('.artifacts/release/consumer.json', 'utf8'));
const local = process.argv.includes('--local');
if (!local && !manifest.registryVerifiedAt) throw new Error('Production demo requires registry verification. Use --local only for local tarball validation.');
if (manifest.integrity && consumer.integrity !== manifest.integrity) throw new Error('Consumer integrity differs from the release.');
const packageRoot = path.join(consumer.path, 'node_modules', manifest.name);
const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
if (pkg.version !== manifest.version) throw new Error('Demo must use the verified published version.');
execFileSync(process.execPath, ['scripts/build-demo.mjs'], { stdio: 'inherit', env: { ...process.env, GAESUP_PACKAGE_ROOT: packageRoot } });
const assets = readdirSync('demo-dist/assets').sort().map(file => ({ file, sha256: createHash('sha256').update(readFileSync(path.join('demo-dist/assets', file))).digest('hex') }));
writeFileSync('demo-dist/version.json', JSON.stringify({ ...manifest, version: pkg.version, packageSource: local ? 'local-tarball' : 'npm', builtAt: new Date().toISOString(), assets }, null, 2));
console.log(`Built examples against the verified ${pkg.name}@${pkg.version} consumer installation (${local ? 'local tarball' : 'npm'}).`);
