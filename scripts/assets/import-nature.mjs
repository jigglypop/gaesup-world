import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO, getBounds } from '@gltf-transform/core';
import { dedup, prune, mergeDocuments, unpartition } from '@gltf-transform/functions';
import sharp from 'sharp';
import validator from 'gltf-validator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, '.asset-work/quaternius/nature-standard');
const destination = path.join(root, 'public/gltf/nature');
const license = await readFile(path.join(source, 'License_Standard.txt'));
if (!license.toString().includes('CC0 1.0')) throw new Error('Unconfirmed license');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const io = new NodeIO();
const library = new Document();
const scene = library.createScene('nature-library');
library.getRoot().setDefaultScene(scene);
const assets = [];
for (const [id, name] of [
  ['oak-a', 'CommonTree_1'], ['oak-b', 'CommonTree_3'], ['pine', 'Pine_1'],
  ['grass', 'Grass_Common_Short'], ['bush', 'Bush_Common'], ['fern', 'Fern_1'], ['flowers', 'Flower_3_Group'],
]) {
  const original = await readFile(path.join(source, 'glTF', `${name}.gltf`));
  const document = await io.read(path.join(source, 'glTF', `${name}.gltf`));
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      // Source vertex RGB encodes wind masks, not albedo. Standard PBR would
      // multiply them into the textures and turn grass black / bushes red.
      primitive.setAttribute('COLOR_0', null);
      // Grass cards use upward-facing normals for soft, readable foliage shading.
      if (id === 'grass') {
        const normal = primitive.getAttribute('NORMAL');
        if (normal) for (let vertex = 0; vertex < normal.getCount(); vertex++) normal.setElement(vertex, [0, 1, 0]);
      }
    }
  }
  for (const texture of document.getRoot().listTextures()) {
    const bytes = await sharp(texture.getImage()).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).png().toBuffer();
    texture.setImage(bytes).setMimeType('image/png');
  }
  for (const material of document.getRoot().listMaterials()) {
    material.setRoughnessFactor(1).setMetallicFactor(0);
    if (id === 'grass') material.setBaseColorTexture(null).setBaseColorFactor([.22, .38, .065, 1]);
    if (id === 'bush') {
      // Reuse the authored green leaf atlas, including its cutout alpha.
      const texture = material.getBaseColorTexture();
      if (texture) texture.setImage(await sharp(await readFile(path.join(source, 'glTF', 'Leaves_NormalTree_C.png'))).resize(1024, 1024).png().toBuffer());
    }
    if (/Bark/.test(material.getName())) material.setAlphaMode('OPAQUE');
    else if (material.getAlphaMode() === 'MASK') material.setDoubleSided(true).setAlphaCutoff(.4);
  }
  const sourceScene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  const bounds = getBounds(sourceScene);
  const mapping = mergeDocuments(library, document);
  const group = library.createNode(id).setTranslation([0, -bounds.min[1], 0]);
  for (const child of sourceScene.listChildren()) group.addChild(mapping.get(child));
  scene.addChild(group);
  for (const importedScene of document.getRoot().listScenes()) mapping.get(importedScene).dispose();
  assets.push({ id, sourceFile: `${name}.gltf`, sourceSha256: hash(original), bounds: getBounds(group) });
}
await library.transform(dedup(), prune(), unpartition());
const bytes = await io.writeBinary(library);
const validation = await validator.validateBytes(bytes, { maxIssues: 100 });
if (validation.issues.numErrors) throw new Error(JSON.stringify(validation.issues));
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'nature-library.glb'), bytes);
await writeFile(path.join(destination, 'LICENSE.txt'), license);
const manifest = {
  version: 1, status: 'reference-unapproved', author: 'Quaternius', license: 'CC0-1.0',
  source: 'https://quaternius.itch.io/stylized-nature-megakit', archive: 'Stylized Nature MegaKit[Standard].zip',
  archiveSha256: hash(await readFile(path.join(root, '.asset-work/quaternius/stylized-nature-megakit-standard.zip'))),
  url: 'gltf/nature/nature-library.glb', sha256: hash(bytes), bytes: bytes.length,
  units: 'meters', up: '+Y', pivot: 'ground-center', assets, validation: validation.issues,
  adaptations: ['Source wind-mask COLOR_0 removed from PBR export; original archived', 'Grass uses a green tint and upward normals', 'Bush uses the authored green CommonTree leaf atlas', 'Textures resized to maximum 1024px', 'Shared textures deduplicated'],
};
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ bytes: bytes.length, assets, errors: validation.issues.numErrors }, null, 2));
