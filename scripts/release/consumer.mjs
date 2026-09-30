import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('.artifacts/release/manifest.json', 'utf8'));
if (!manifest.registryVerifiedAt || !manifest.integrity) throw new Error('Registry verification must precede consumer verification.');
execFileSync(process.execPath, ['scripts/verify-package-consumer.cjs'], { stdio: 'inherit', env: {
  ...process.env, GAESUP_PACKAGE_ARCHIVE: '.artifacts/release/package.tgz',
  GAESUP_EXPECTED_INTEGRITY: manifest.integrity, GAESUP_CONSUMER_RECEIPT: '.artifacts/release/consumer.json',
} });
