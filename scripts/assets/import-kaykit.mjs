// Reproducible, free CC0 reference assets from the creator's own repositories.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { dedup, prune, resample } from '@gltf-transform/functions';
import validator from 'gltf-validator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'public/gltf/kaykit');
const sources = path.join(root, '.asset-work/kaykit-sources');
const packs = {
  adventurers: {
    repo: 'KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',
    revision: '672074b73ba276876a19e8816ecdc5241817ab47',
    directory: 'addons/kaykit_character_pack_adventures',
    license: 'LICENSE.txt',
  },
  medieval: {
    repo: 'KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0',
    revision: '84fa4e91af6a88989be7c99e0891cede11f2ca38',
    directory: 'addons/kaykit_medieval_hexagon_pack/Assets',
    license: '../../../LICENSE.txt',
  },
};
const assets = [
  ['rogue', 'adventurers', 'Characters/gltf/Rogue.glb'],
  ['rogue-hooded', 'adventurers', 'Characters/gltf/Rogue_Hooded.glb'],
  ['mage', 'adventurers', 'Characters/gltf/Mage.glb'],
  ['knight', 'adventurers', 'Characters/gltf/Knight.glb'],
  ['sword', 'adventurers', 'Assets/gltf/sword_1handed.gltf'],
  ['axe', 'adventurers', 'Assets/gltf/axe_1handed.gltf'],
  ['staff', 'adventurers', 'Assets/gltf/staff.gltf'],
  ['tree-oak', 'medieval', 'gltf/decoration/nature/tree_single_A.gltf'],
  ['tree-pine', 'medieval', 'gltf/decoration/nature/tree_single_B.gltf'],
  ['tile-grass', 'medieval', 'gltf/tiles/base/hex_grass.gltf'],
];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const downloads = new Map();
async function download(packName, relative) {
  const pack = packs[packName];
  const repoPath = path.posix.normalize(path.posix.join(pack.directory, relative));
  const url = `https://raw.githubusercontent.com/${pack.repo}/${pack.revision}/${repoPath}`;
  const localPath = path.join(sources, packName, repoPath);
  if (downloads.has(url)) return downloads.get(url);
  let bytes;
  try { bytes = await readFile(localPath); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(path.dirname(localPath), { recursive: true });
    await writeFile(localPath, bytes, { flag: 'wx' });
  }
  const entry = { url, localPath, bytes, sha256: digest(bytes) };
  downloads.set(url, entry);
  return entry;
}

const io = new NodeIO();
await mkdir(output, { recursive: true });
const manifest = {
  version: 1, status: 'reference-unapproved', author: 'Kay Lousberg', license: 'CC0-1.0', packs,
  conventions: { units: 'meters', up: '+Y', forward: '+Z', rigId: 'kaykit-adventurers-1', rightHand: 'handslot_r' },
  assets: [],
};
for (const packName of Object.keys(packs)) {
  const license = await download(packName, packs[packName].license);
  if (!/CC0|Creative Commons Zero/i.test(license.bytes.toString())) throw new Error(`Unconfirmed license: ${packName}`);
  await writeFile(path.join(output, `LICENSE-${packName}.txt`), license.bytes);
}
for (const [id, packName, relative] of assets) {
  const source = await download(packName, relative);
  const json = relative.endsWith('.glb')
    ? JSON.parse(source.bytes.subarray(20, 20 + source.bytes.readUInt32LE(12)).toString().trim())
    : JSON.parse(source.bytes.toString());
  const resources = [...(json.buffers ?? []), ...(json.images ?? [])].filter((item) => item.uri && !item.uri.startsWith('data:'));
  for (const resource of resources) await download(packName, path.posix.join(path.posix.dirname(relative), resource.uri));
  const document = await io.read(source.localPath);
  // GLTFLoader sanitizes punctuation in names used by animation bindings.
  // Author the normalized names once so socket metadata and loaded bones agree.
  for (const node of document.getRoot().listNodes()) node.setName(node.getName().replace(/[.:[\]/\s]/g, '_'));
  const allAnimations = document.getRoot().listAnimations().map((clip) => clip.getName());
  const characterPrefix = { rogue: 'Rogue_', 'rogue-hooded': 'Rogue_', mage: 'Mage_', knight: 'Knight_' }[id];
  if (characterPrefix) {
    for (const node of document.getRoot().listNodes()) {
      if (node.getMesh() && !node.getName().startsWith(characterPrefix)) node.setMesh(null);
    }
  }
  // Keep authored locomotion/emotes only, without root-motion turn/death/combat baggage.
  const aliases = { Idle: 'idle', Walking_A: 'walk', Running_A: 'run', Jump_Start: 'jump', Jump_Idle: 'fall', Jump_Land: 'land', Interact: 'interact', Cheer: 'wave' };
  for (const clip of document.getRoot().listAnimations()) {
    const alias = aliases[clip.getName()];
    if (alias) clip.setName(alias); else clip.dispose();
  }
  await document.transform(resample(), dedup(), prune());
  const bytes = await io.writeBinary(document);
  const validation = await validator.validateBytes(bytes, { maxIssues: 100 });
  if (validation.issues.numErrors) throw new Error(`${id}: ${JSON.stringify(validation.issues)}`);
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  const entry = {
    id, url: `gltf/kaykit/${id}.glb`, source: source.url, sourceSha256: source.sha256,
    sha256: digest(bytes), bytes: bytes.length, bounds: getBounds(scene),
    animations: document.getRoot().listAnimations().map((clip) => clip.getName()),
    originalAnimations: allAnimations,
    meshes: document.getRoot().listNodes().filter((node) => node.getMesh()).map((node) => node.getName()),
    joints: document.getRoot().listSkins()[0]?.listJoints().map((node) => node.getName()) ?? [],
    bindPoseHash: document.getRoot().listSkins()[0] ? digest(Buffer.from(JSON.stringify(
      document.getRoot().listSkins()[0].listJoints().map((joint, index) => ({
        name: joint.getName(),
        inverseBind: document.getRoot().listSkins()[0].getInverseBindMatrices().getElement(index, []),
      })).sort((a, b) => a.name.localeCompare(b.name)),
    ))) : null,
    validation: { errors: validation.issues.numErrors, warnings: validation.issues.numWarnings },
  };
  await writeFile(path.join(output, `${id}.glb`), bytes);
  manifest.assets.push(entry);
  console.log(JSON.stringify({ id, bytes: entry.bytes, bounds: entry.bounds, animations: entry.animations, errors: entry.validation.errors }));
}
manifest.sources = [...downloads.values()].map(({ url, sha256 }) => ({ url, sha256 }));
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
