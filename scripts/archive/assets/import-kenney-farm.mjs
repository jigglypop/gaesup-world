// Reproducible CC0 farm library for the minihome example, from Kenney's Nature Kit.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Document, NodeIO, getBounds } from '@gltf-transform/core';
import { KHRMaterialsUnlit } from '@gltf-transform/extensions';
import { dedup, mergeDocuments, prune, unpartition } from '@gltf-transform/functions';
import validator from 'gltf-validator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ARCHIVE_URL = 'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip';
const work = path.join(root, '.asset-work/kenney');
const archive = path.join(work, 'nature-kit.zip');
const extracted = path.join(work, 'nature');
const models = path.join(extracted, 'Models/GLTF format');
const destination = path.join(root, 'public/gltf/farm');

// Muted, warm palette of the target look; Kenney's defaults are saturated and unlit.
const PALETTE = {
  grass: '#6f9a4c', leafsGreen: '#93ac5c', leafsDark: '#6d8a45', leafsFall: '#e2873b',
  woodBark: '#8c6a4b', wood: '#b9905f', woodDark: '#8a6441', woodInner: '#e3c98f',
  dirt: '#9b6b45', dirtDark: '#7d5436', corn: '#efcf6a', _defaultMat: '#f1ead8',
  woodBirch: '#dcd2bc', woodBarkDark: '#6e5238', colorYellow: '#f2d25b', colorRed: '#e0674f', colorPurple: '#a68ac8',
};
const ASSETS = [
  ['pumpkin', 'crop_pumpkin'], ['carrot', 'crop_carrot'], ['melon', 'crop_melon'], ['turnip', 'crop_turnip'],
  ['corn', 'crops_cornStageD'], ['wheat', 'crops_wheatStageB'], ['sprout', 'crops_leafsStageB'],
  ['soil-row', 'crops_dirtDoubleRow'], ['tree-oak', 'tree_oak'], ['tree-fat', 'tree_fat'], ['tree-default', 'tree_default'],
  ['log-stack', 'log_stack'], ['sign', 'sign'], ['pot', 'pot_large'], ['bush', 'plant_bushDetailed'],
  ['flower-yellow', 'flower_yellowA'], ['flower-red', 'flower_redA'], ['flower-purple', 'flower_purpleA'],
  ['stump', 'stump_round'], ['grass-tuft', 'grass_leafs'],
];

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const linear = (hex) => {
  const channel = (offset) => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return [channel(1), channel(3), channel(5), 1];
};

if (!existsSync(models)) {
  await mkdir(work, { recursive: true });
  if (!existsSync(archive)) {
    const response = await fetch(ARCHIVE_URL);
    if (!response.ok) throw new Error(`Kenney download failed: ${response.status}`);
    await writeFile(archive, Buffer.from(await response.arrayBuffer()));
  }
  await mkdir(extracted, { recursive: true });
  execFileSync('tar', ['-xf', archive, '-C', extracted]);
}
const license = await readFile(path.join(extracted, 'License.txt'));
if (!license.toString().includes('Creative Commons Zero, CC0')) throw new Error('Unconfirmed license');

const io = new NodeIO().registerExtensions([KHRMaterialsUnlit]);
const library = new Document();
const scene = library.createScene('farm-library');
library.getRoot().setDefaultScene(scene);
const assets = [];
for (const [id, name] of ASSETS) {
  const file = path.join(models, `${name}.glb`);
  const original = await readFile(file);
  const document = await io.read(file);
  for (const material of document.getRoot().listMaterials()) {
    material.setExtension('KHR_materials_unlit', null);
    material.setRoughnessFactor(0.92).setMetallicFactor(0);
    const color = PALETTE[material.getName()];
    if (color) material.setBaseColorFactor(linear(color));
  }
  for (const extension of document.getRoot().listExtensionsUsed()) extension.dispose();
  const sourceScene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  const bounds = getBounds(sourceScene);
  const mapping = mergeDocuments(library, document);
  const center = [(bounds.min[0] + bounds.max[0]) / 2, bounds.min[1], (bounds.min[2] + bounds.max[2]) / 2];
  const group = library.createNode(id).setTranslation([-center[0], -center[1], -center[2]]);
  for (const child of sourceScene.listChildren()) group.addChild(mapping.get(child));
  scene.addChild(library.createNode(`${id}-root`).addChild(group));
  for (const importedScene of document.getRoot().listScenes()) mapping.get(importedScene).dispose();
  assets.push({ id, sourceFile: `${name}.glb`, sourceSha256: hash(original), bounds: getBounds(group) });
}
await library.transform(dedup(), prune(), unpartition());
const bytes = await io.writeBinary(library);
const validation = await validator.validateBytes(bytes, { maxIssues: 100 });
if (validation.issues.numErrors) throw new Error(JSON.stringify(validation.issues));
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'farm-library.glb'), bytes);
await writeFile(path.join(destination, 'LICENSE.txt'), license);
const manifest = {
  version: 1, author: 'Kenney', license: 'CC0-1.0', source: 'https://kenney.nl/assets/nature-kit', archive: ARCHIVE_URL,
  archiveSha256: hash(await readFile(archive)), url: 'gltf/farm/farm-library.glb', sha256: hash(bytes), bytes: bytes.length,
  units: 'meters', up: '+Y', pivot: 'ground-center', assets, validation: validation.issues,
  adaptations: ['KHR_materials_unlit removed so assets receive scene lighting', 'Material colors remapped to a muted farm palette', 'Pivots moved to ground center'],
};
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ bytes: bytes.length, assets: assets.length, errors: validation.issues.numErrors }));
