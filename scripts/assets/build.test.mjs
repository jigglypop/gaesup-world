import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { Document, NodeIO } from '@gltf-transform/core';

import { buildDelivery, validateDeliveryGlb } from './build.mjs';
import { contract } from './contract.mjs';
import { publishAsset } from './publish.mjs';

test('delivery builds three authored LODs, validates decoded Meshopt, and remains unpublished', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gaesup-delivery-'));
  try {
    const document = new Document();
    const buffer = document.createBuffer();
    const position = document
      .createAccessor()
      .setType('VEC3')
      .setBuffer(buffer)
      .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 1]));
    const primitive = document.createPrimitive().setAttribute('POSITION', position);
    const mesh = document.createMesh().addPrimitive(primitive);
    document.createScene().addChild(document.createNode().setMesh(mesh));
    const bytes = await new NodeIO().writeBinary(document);
    for (const level of [0, 1, 2]) await writeFile(path.join(directory, `lod${level}.glb`), bytes);
    const manifest = await buildDelivery(directory, {
      id: 'test-chair',
      version: '1',
      name: 'Test chair',
      kind: 'object3d',
      source: { author: 'test', license: 'test', sourcePath: 'fixture', generator: 'test' },
      colliders: [],
      sockets: [],
    });
    assert.equal(manifest.artifacts.length, 6);
    assert.deepEqual(
      manifest.lods.map((lod) => lod.triangles),
      [1, 1, 1],
    );
    for (const artifact of manifest.artifacts) {
      const result = await validateDeliveryGlb(await readFile(path.join(directory, artifact.path)));
      assert.equal(result.issues.numErrors, 0);
    }
    assert.deepEqual(JSON.parse(await readFile(path.join(directory, 'quality.json'), 'utf8')), {
      browser: [],
    });
    await assert.rejects(validateDeliveryGlb(Buffer.from('not a glb')));
    const catalog = path.join(directory, 'catalog');
    const inspect = async (folder) =>
      JSON.parse(await readFile(path.join(folder, 'manifest.json'), 'utf8'));
    await assert.rejects(publishAsset(directory, catalog, inspect), /Publication blocked/);
    const evidence = {
      subject: contract.assetApprovalSubject(manifest),
      decision: 'approved',
      reviewer: 'TEST ONLY',
      recordedAt: '2026-09-09T00:00:00Z',
      evidence: ['synthetic unit test'],
    };
    const quality = {
      provenance: evidence,
      technical: evidence,
      art: evidence,
      browser: ['android', 'iphone', 'integrated-gpu'].map((device) => {
        const profile = device === 'integrated-gpu' ? 'desktop' : 'mobile';
        const {
          id: _id,
          policyVersion: _policy,
          ...metrics
        } = contract.ASSET_BUDGET_PROFILES[profile];
        return {
          ...evidence,
          device,
          profile,
          metrics,
          policyVersion: 1,
          model: 'test',
          os: 'test',
          browser: 'test',
          backend: 'webgl',
          sceneVersion: 'test',
          durationMinutes: 15,
          roomTransitions: 30,
          outfitSwaps: 100,
          contextRecovery: true,
        };
      }),
    };
    await writeFile(path.join(directory, 'quality.json'), JSON.stringify(quality));
    // Fail the catalog update after the immutable version has been committed.
    await mkdir(path.join(catalog, 'catalog.json'), { recursive: true });
    await assert.rejects(publishAsset(directory, catalog, inspect));
    await rm(path.join(catalog, 'catalog.json'), { recursive: true });
    await publishAsset(directory, catalog, inspect);
    await publishAsset(directory, catalog, inspect);
    assert.equal(JSON.parse(await readFile(path.join(catalog, 'catalog.json'), 'utf8')).length, 1);
    const lock = path.join(catalog, '.publish.lock');
    await writeFile(lock, 'another publisher');
    await assert.rejects(publishAsset(directory, catalog, inspect), { code: 'EEXIST' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
