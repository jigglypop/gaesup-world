import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, getBounds, meshopt, textureCompress } from '@gltf-transform/functions';
import validator from 'gltf-validator';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

import { contract } from './contract.mjs';
import { writeJson } from './meshy.mjs';

export async function validateGlb(bytes) {
  const result = await validator.validateBytes(new Uint8Array(bytes), { maxIssues: 1000 });
  if (result.issues.numErrors > 0)
    throw new Error(`glTF validation failed: ${JSON.stringify(result.issues.messages)}`);
  return result;
}

export async function validateDeliveryGlb(bytes) {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const document = await io.readBinary(new Uint8Array(bytes));
  const compression = document
    .getRoot()
    .listExtensionsUsed()
    .find((extension) => extension.extensionName === 'EXT_meshopt_compression');
  if (!compression) return validateGlb(bytes);
  compression.dispose();
  return validateGlb(await io.writeBinary(document));
}

export async function buildDelivery(directory, specification) {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
  const artifacts = [];
  const lods = [];
  const reports = [];
  let bounds;
  let materials;
  const addArtifact = async (file, bytes) => {
    await writeFile(path.join(directory, file), bytes, { flag: 'wx' });
    artifacts.push({
      path: file,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
    });
  };
  for (const level of [0, 1, 2]) {
    const original = await readFile(path.join(directory, `lod${level}.glb`));
    await validateGlb(original);
    const document = await io.readBinary(original);
    const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
    if (!scene) throw new Error('Missing GLB scene');
    let triangles = 0;
    scene.traverse((node) => {
      for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
        if (primitive.getMode() !== 4) throw new Error('Delivery requires triangle primitives');
        const count =
          primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION')?.getCount() ?? 0;
        if (count % 3) throw new Error('Invalid triangle count');
        triangles += count / 3;
      }
    });
    if (level === 0) {
      bounds = getBounds(scene);
      materials = document
        .getRoot()
        .listMaterials()
        .map((material) => ({
          name: material.getName(),
          alphaMode: material.getAlphaMode(),
          texturePaths: [],
        }));
    }
    await document.transform(
      dedup(),
      textureCompress({ encoder: sharp, resize: [512, 512], targetFormat: 'png' }),
    );
    const fallback = `lod${level}-fallback.glb`;
    await addArtifact(fallback, await io.writeBinary(document));
    await document.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    const filename = `lod${level}-meshopt.glb`;
    const encoded = await io.writeBinary(document);
    await addArtifact(filename, encoded);
    const decoded = await io.readBinary(encoded);
    if (!decoded.getRoot().listMeshes().length) throw new Error('Meshopt round trip lost meshes');
    lods.push({
      level,
      path: filename,
      fallbackPath: fallback,
      triangles,
      minScreenPixels: [160, 60, 0][level],
    });
    reports.push({
      level,
      triangles,
      bytes: encoded.length,
      textures: document
        .getRoot()
        .listTextures()
        .map((texture) => ({
          name: texture.getName(),
          size: texture.getSize(),
          residentBytesEstimate: ((texture.getSize()?.reduce((a, b) => a * b, 1) ?? 0) * 4 * 4) / 3,
        })),
      meshoptRoundTrip: true,
      ktx2: document.getRoot().listTextures().length ? 'not-built' : 'not-required',
    });
  }
  const manifest = { ...specification, schemaVersion: 1, artifacts, lods, bounds, materials };
  const errors = contract.validateAssetManifest(manifest);
  if (errors.length) throw new Error(errors.join(', '));
  await writeJson(path.join(directory, 'manifest.json'), manifest);
  await writeJson(path.join(directory, 'technical-report.json'), {
    reports,
    validator: 'Khronos glTF Validator',
    compressionComplete: reports.every((entry) => entry.ktx2 === 'not-required'),
  });
  await writeJson(path.join(directory, 'quality.json'), { browser: [] });
  return manifest;
}
