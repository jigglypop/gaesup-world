import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import semanticRelease from 'semantic-release';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', windowsHide: true }).trim();
const sourceCommit = git('rev-parse', 'HEAD');
if (git('status', '--porcelain')) throw new Error('Release requires a committed worktree.');
if (!git('tag', '--list', 'v*')) {
  const baseline = JSON.parse(readFileSync('scripts/release/baseline.json', 'utf8'));
  const previous = JSON.parse(git('show', `${baseline.commit}:package.json`));
  if (previous.version !== baseline.version) throw new Error('Historical release boundary version mismatch.');
  git('merge-base', '--is-ancestor', baseline.commit, sourceCommit);
  const response = await fetch(`https://registry.npmjs.org/${previous.name}/${baseline.version}`);
  if (!response.ok || (await response.json()).version !== baseline.version) throw new Error('Historical npm version is unavailable.');
  throw new Error(`Historical release tag v${baseline.version} is missing. A repository maintainer must create it at ${baseline.commit} before the first automated release. The workflow token cannot introduce historical workflow files through a tag.`);
}
const result = await semanticRelease();
let release = result ? { version: result.nextRelease.version, tag: result.nextRelease.gitTag } : null;
// A rerun after successful publication can reuse the release commit directly following
// this source commit. Never deploy unrelated newer main changes or invent a new version.
if (!release) {
  for (const tag of git('tag', '--list', 'v*', '--sort=-version:refname').split('\n').slice(0, 20)) {
    if (!/^v\d+\.\d+\.\d+$/.test(tag)) continue;
    const commit = git('rev-parse', `${tag}^{commit}`);
    const parent = git('rev-parse', `${tag}^`);
    const changed = git('diff', '--name-only', sourceCommit, tag).split('\n').filter(Boolean);
    if ((commit === sourceCommit || parent === sourceCommit) && changed.every(file => ['CHANGELOG.md', 'package.json', 'pnpm-lock.yaml'].includes(file))) {
      release = { version: tag.slice(1), tag }; break;
    }
  }
}
mkdirSync('.artifacts/release', { recursive: true });
if (!release) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'released=false\n');
  console.log('No release for this source commit.');
} else {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const taggedPackage = JSON.parse(git('show', `${release.tag}:package.json`));
  const manifest = { schemaVersion: 1, name: pkg.name, version: release.version, sourceCommit: taggedPackage.gaesupRelease?.sourceCommit ?? sourceCommit,
    releaseCommit: git('rev-parse', `${release.tag}^{commit}`), tag: release.tag,
    runUrl: process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null };
  writeFileSync('.artifacts/release/manifest.json', JSON.stringify(manifest, null, 2));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `released=true\nversion=${release.version}\n`);
  console.log(JSON.stringify(manifest));
}
