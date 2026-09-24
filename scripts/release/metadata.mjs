import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function prepare(_config, { cwd, nextRelease }) {
  const filename = path.join(cwd, 'package.json');
  const pkg = JSON.parse(readFileSync(filename, 'utf8'));
  pkg.gaesupRelease = { version: nextRelease.version, sourceCommit: nextRelease.gitHead };
  writeFileSync(filename, `${JSON.stringify(pkg, null, 2)}\n`);
}
