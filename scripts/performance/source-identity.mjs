import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Content identity includes uncommitted and untracked code, never file contents in the output. */
export function sourceIdentity(root) {
  const files = [];
  const visit = (relative) => {
    for (const entry of readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const name = `${relative}/${entry.name}`;
      if (entry.isDirectory()) visit(name);
      else if (/\.(?:tsx?|jsx?|mjs|cjs|css|glsl|json)$/.test(name)) files.push(name);
    }
  };
  for (const dir of ['src', 'examples', 'scripts/performance']) visit(dir);
  for (const file of ['package.json', 'vite.config.ts', 'tsconfig.json', 'pnpm-lock.yaml', 'package-lock.json']) {
    if (existsSync(path.join(root, file))) files.push(file);
  }
  files.sort();
  const hash = createHash('sha256');
  const manifest = files.map((file) => {
    const digest = createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex');
    hash.update(`${file}\0${digest}\n`);
    return { path: file, sha256: digest };
  });
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
  const lock = ['pnpm-lock.yaml', 'package-lock.json'].find((file) => existsSync(path.join(root, file)));
  const versions = {};
  for (const name of ['three', 'react', '@react-three/fiber', 'zustand']) {
    const filename = path.join(root, 'node_modules', name, 'package.json');
    versions[name] = existsSync(filename) ? JSON.parse(readFileSync(filename, 'utf8')).version : 'unknown';
  }
  return {
    commit: git('rev-parse', 'HEAD'),
    contentHash: hash.digest('hex'),
    lockfileHash: lock ? createHash('sha256').update(readFileSync(path.join(root, lock))).digest('hex') : null,
    dirty: git('status', '--porcelain', '--untracked-files=normal').length > 0,
    manifest, versions,
    host: { cpu: os.cpus()[0]?.model ?? 'unknown', platform: `${os.platform()} ${os.release()}`, node: process.version },
  };
}
