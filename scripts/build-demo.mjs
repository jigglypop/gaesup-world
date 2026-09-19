import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.GAESUP_BASE_URL ?? '/gaesup-world/';
execFileSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build', `--base=${base}`], { cwd: root, stdio: 'inherit' });
const output = path.join(root, 'demo-dist');
copyFileSync(path.join(output, 'index.html'), path.join(output, '404.html'));
mkdirSync(path.join(output, 'engine'), { recursive: true });
copyFileSync(path.join(output, 'index.html'), path.join(output, 'engine', 'index.html'));
writeFileSync(path.join(output, '.nojekyll'), '');
const { version } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim().length > 0;
writeFileSync(path.join(output, 'version.json'), JSON.stringify({ version, commit, dirty, builtAt: new Date().toISOString() }, null, 2));
