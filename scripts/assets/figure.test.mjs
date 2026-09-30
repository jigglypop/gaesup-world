import assert from 'node:assert/strict';
import test from 'node:test';

import { Document } from '@gltf-transform/core';
import sharp from 'sharp';

import { createIO, validateDeliveryGlb } from './build.mjs';
import { inspection } from './contract.mjs';
import { addClip, fillUncovered, optimizeFigure, uvCoverage } from './figure.mjs';
import { loadGlb } from './inspect.mjs';
import { createFigureDocument, ISLAND, turn } from './test-fixtures.mjs';

const io = await createIO();

async function inspectDocument(document) {
  const bytes = Buffer.from(await io.writeBinary(document));
  const { scene, animations } = await loadGlb(bytes);
  return inspection.inspectFigure(scene, animations, { bytes: bytes.length });
}

test('figure preset drops stubs, names clips, mattes and fits textures while keeping the rig', async () => {
  const document = await createFigureDocument();
  const result = await optimizeFigure(document, { matte: true, texelDensity: 20 });
  assert.deepEqual(result.dropped, ['restpose']);
  const root = document.getRoot();
  assert.deepEqual(root.listAnimations().map((clip) => clip.getName()), ['idle', 'walk', 'run']);
  const [material] = root.listMaterials();
  assert.equal(material.getMetallicFactor(), 0);
  assert.equal(material.getRoughnessFactor(), 1);
  assert.equal(material.getMetallicRoughnessTexture(), null);
  assert.equal(material.getExtension('KHR_materials_specular'), null);
  // 64 px at ~99 texels per metre is four times the asked density: two halvings, normals one more.
  assert.deepEqual(material.getBaseColorTexture().getSize(), [16, 16]);
  assert.deepEqual(material.getNormalTexture().getSize(), [8, 8]);
  assert.equal(material.getNormalTexture().getMimeType(), 'image/webp');
  assert.equal((await sharp(material.getNormalTexture().getImage()).stats()).channels[2].min, 255);
  assert.equal(root.listTextures().length, 2);
  assert.deepEqual(root.listSkins().map((skin) => skin.listJoints().length), [16]);

  const bytes = await io.writeBinary(document);
  await validateDeliveryGlb(bytes);
  const used = (await io.readBinary(bytes)).getRoot().listExtensionsUsed().map((extension) => extension.extensionName);
  for (const name of ['EXT_meshopt_compression', 'KHR_mesh_quantization', 'EXT_texture_webp']) assert.ok(used.includes(name), name);
  assert.ok(!used.includes('KHR_materials_specular'));
  const report = await inspectDocument(await io.readBinary(bytes));
  assert.equal(report.verdict, 'pass');
  assert.deepEqual(report.clips.map((clip) => clip.name), ['idle', 'walk', 'run']);
});

test('a figure over the triangle budget is welded and simplified to it', async () => {
  const document = new Document();
  const buffer = document.createBuffer();
  const segments = 60;
  const positions = [];
  const indices = [];
  for (let y = 0; y <= segments; y++) for (let x = 0; x <= segments; x++) positions.push(x / segments, y / segments, Math.sin(x / 9) * 0.05);
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      const a = y * (segments + 1) + x;
      indices.push(a, a + 1, a + segments + 2, a, a + segments + 2, a + segments + 1);
    }
  }
  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', document.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer))
    .setIndices(document.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer));
  document.createScene().addChild(document.createNode().setMesh(document.createMesh().addPrimitive(primitive)));
  const { triangles } = await optimizeFigure(document, { budget: 1000 });
  assert.equal(triangles[0], segments * segments * 2);
  assert.ok(triangles[1] <= 1000 && triangles[1] > 100, `${triangles[1]} triangles`);
});

test('UV coverage is conservative and uncovered texels take the nearest covered colour', () => {
  // One triangle over the left half of an 8 × 4 image (UV v grows downwards like image rows).
  const covered = uvCoverage([0, 0, 0.5, 0, 0, 1], 8, 4);
  assert.deepEqual(Array.from(covered), [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]);
  // A sliver thinner than a texel still claims the texels it crosses.
  assert.ok(uvCoverage([0.1, 0.51, 0.9, 0.52, 0.1, 0.52], 8, 8).includes(1));
  const pixels = new Uint8Array([9, 0, 0, 0, 0, 0, 0, 7]);
  fillUncovered(pixels, 8, 1, 1, new Uint8Array([1, 0, 0, 0, 0, 0, 0, 1]));
  assert.deepEqual(Array.from(pixels), [9, 9, 9, 9, 7, 7, 7, 7]);
});

test('dilation fills the atlas background from the islands at the output size', async () => {
  const document = await createFigureDocument();
  await optimizeFigure(document, { dilate: true });
  const colour = document.getRoot().listMaterials()[0].getBaseColorTexture();
  const { data, info } = await sharp(colour.getImage()).raw().toBuffer({ resolveWithObject: true });
  // The first texel right of the first island, halfway down it, was black background.
  const at = (8 * info.width + Math.ceil((ISLAND.margin + ISLAND.size) * info.width)) * info.channels;
  assert.deepEqual(Array.from(data.subarray(at, at + 3)), [200, 40, 60]);
});

// Bones turned about their own axes, a shorter body: another tool's rig of the same humanoid.
const OTHER_AXES = {
  Hips: turn([0, 1, 0], -90).toArray(),
  Spine: turn([0, 0, 1], 30).toArray(),
  LeftArm: turn([0, 1, 0], 90).toArray(),
  RightArm: turn([1, 0, 0], 90).toArray(),
  LeftUpLeg: turn([1, 0, 0], 180).toArray(),
};

test('an idle carried to a rig with other local axes keeps its arms down and hip sway', async () => {
  const donor = await createFigureDocument({ clips: { Idle_4: 'Idle', Walking: 'Walking' }, textures: false });
  const target = await createFigureDocument({ clips: { walk: 'Walking' }, frames: OTHER_AXES, scale: 0.8, textures: false });
  const naive = await createFigureDocument({ clips: { walk: 'Walking' }, frames: OTHER_AXES, scale: 0.8, textures: false });

  addClip(target, { name: 'idle', donor, source: 'Idle_4', poseRef: 'walk' });
  const report = await inspectDocument(target);
  const donorIdle = (await inspectDocument(donor)).clips.find((clip) => clip.name === 'Idle_4');
  const idle = report.clips.find((clip) => clip.name === 'idle');
  assert.equal(report.verdict, 'pass');
  for (const drop of idle.armDrop) assert.ok(drop < -0.95, `arm drop ${drop}`);
  assert.ok(Math.abs(idle.hipsDrift - donorIdle.hipsDrift) < 0.002, `${idle.hipsDrift} vs ${donorIdle.hipsDrift}`);

  // Copying local rotations bone by bone ignores the axes and lifts the arms.
  const source = donor.getRoot().listAnimations().find((clip) => clip.getName() === 'Idle_4');
  const copy = naive.createAnimation('idle');
  const nodes = new Map(naive.getRoot().listNodes().map((node) => [node.getName(), node]));
  for (const channel of source.listChannels()) {
    const sampler = naive.createAnimationSampler().setInterpolation('LINEAR')
      .setInput(naive.createAccessor().setType('SCALAR').setArray(channel.getSampler().getInput().getArray().slice()))
      .setOutput(naive.createAccessor().setType(channel.getSampler().getOutput().getType()).setArray(channel.getSampler().getOutput().getArray().slice()));
    copy.addSampler(sampler).addChannel(naive.createAnimationChannel().setTargetNode(nodes.get(channel.getTargetNode().getName())).setTargetPath(channel.getTargetPath()).setSampler(sampler));
  }
  const buffer = naive.getRoot().listBuffers()[0];
  for (const accessor of naive.getRoot().listAccessors()) accessor.setBuffer(buffer);
  assert.ok((await inspectDocument(naive)).issues.some((issue) => issue.code === 'arms-out'));
});

test('the preset carries a clip in only when the figure lacks one of that name', async () => {
  const donor = await createFigureDocument({ clips: { Idle_4: 'Idle', Walking: 'Walking' }, textures: false });
  const target = await createFigureDocument({ clips: { Walking: 'Walking' }, textures: false });
  const clip = { name: 'idle', donor, source: 'Idle_4', poseRef: 'walk' };
  assert.equal((await optimizeFigure(target, { clip })).added, 'idle');
  const again = await createFigureDocument({ clips: { Idle: 'Idle', Walking: 'Walking' }, textures: false });
  assert.equal((await optimizeFigure(again, { clip })).added, null);
  assert.throws(() => addClip(target, { ...clip, source: 'Dance' }), /no clip Dance/);
});
