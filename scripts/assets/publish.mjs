import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';

import { contract } from './contract.mjs';
import { writeJson } from './meshy.mjs';

export async function publishAsset(directory, catalogDirectory, inspect) {
  const manifest = await inspect(directory);
  const quality = JSON.parse(await readFile(path.join(directory, 'quality.json'), 'utf8'));
  const blockers = contract.assetPublicationBlockers(manifest, quality);
  if (blockers.length) throw new Error(`Publication blocked: ${blockers.join(', ')}`);
  await mkdir(catalogDirectory, { recursive: true });
  const lockPath = path.join(catalogDirectory, '.publish.lock');
  const lock = await open(lockPath, 'wx');
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    const versionDirectory = path.join(catalogDirectory, manifest.id, manifest.version);
    let existing;
    try {
      existing = JSON.parse(await readFile(path.join(versionDirectory, 'manifest.json'), 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (existing) {
      if (contract.assetApprovalSubject(existing) !== contract.assetApprovalSubject(manifest))
        throw new Error('Published version is immutable; choose a new version');
      await inspect(versionDirectory);
      const previous = JSON.parse(
        await readFile(path.join(versionDirectory, 'quality.json'), 'utf8'),
      );
      if (JSON.stringify(previous) !== JSON.stringify(quality))
        throw new Error('Published evidence is immutable; choose a new version');
    } else {
      const staging = `${versionDirectory}.staging-${randomUUID()}`;
      await mkdir(staging, { recursive: true });
      for (const artifact of manifest.artifacts) {
        const target = path.join(staging, artifact.path);
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(path.join(directory, artifact.path), target);
      }
      await writeJson(path.join(staging, 'manifest.json'), manifest);
      await inspect(staging);
      await writeJson(path.join(staging, 'quality.json'), quality);
      await rename(staging, versionDirectory);
    }
    const catalogFile = path.join(catalogDirectory, 'catalog.json');
    let catalog;
    try {
      catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      catalog = [];
    }
    await writeJson(catalogFile, [
      ...catalog.filter((entry) => entry.manifest.id !== manifest.id),
      { manifest, quality },
    ]);
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}
