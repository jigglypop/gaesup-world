import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Document, NodeIO } from '@gltf-transform/core';
import { validateBytes } from 'gltf-validator';
import {
  SphereGeometry,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  Vector3,
  Euler,
  Color,
} from 'three';

// Authored test geometry, not AI output or a production art approval.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rig = JSON.parse(await fs.readFile(path.join(root, 'src/avatar/core/rig.json'), 'utf8'));
const output = path.join(root, 'public/gltf/avatars/manual-v1');
const io = new NodeIO();
const absolute = {};
for (const [key, parent, x, y, z] of rig.bones)
  absolute[key] = new Vector3(x, y, z).add(parent ? absolute[parent] : new Vector3());
const upper = ['torsoUpper', 'torsoLower', 'armUpperL', 'armLowerL', 'armUpperR', 'armLowerR'];
const lower = ['legUpperL', 'legUpperR', 'legLowerL', 'legLowerR'];
const definitions = [
  { id: 'body-sd-neutral-v1', slot: 'body', name: '뉴트럴 바디', color: '#f1c3a1' },
  ...['#473346', '#bc754b', '#263c61'].map((color, i) => ({
    id: `hair-00${i + 1}`,
    slot: 'hair',
    name: ['밤색 보브', '캐러멜 헤어', '네이비 헤어'][i],
    color,
    variant: i,
  })),
  ...['#e58266', '#6babc0', '#d1b563'].map((color, i) => ({
    id: `top-00${i + 1}`,
    slot: 'top',
    name: ['코랄 니트', '블루 재킷', '머스터드 니트'][i],
    color,
    variant: i,
    hide: upper,
  })),
  ...['#32465d', '#688177', '#857097'].map((color, i) => ({
    id: `bottom-00${i + 1}`,
    slot: 'bottom',
    name: ['네이비 팬츠', '세이지 팬츠', '라일락 팬츠'][i],
    color,
    variant: i,
    hide: lower,
  })),
  ...['#f4e4c9', '#50566f'].map((color, i) => ({
    id: `shoes-00${i + 1}`,
    slot: 'shoes',
    name: ['크림 스니커즈', '슬레이트 슈즈'][i],
    color,
    hide: ['footL', 'footR'],
  })),
  ...['#c1a276', '#986776'].map((color, i) => ({
    id: `hat-00${i + 1}`,
    slot: 'hat',
    name: ['샌드 버킷햇', '로즈 베레모'][i],
    color,
    variant: i,
  })),
  { id: 'bag-001', slot: 'bag', name: '미니 백팩', color: '#a88658' },
  { id: 'hand-001', slot: 'hand', name: '작은 지팡이', color: '#71503b' },
  {
    id: 'onepiece-001',
    slot: 'onepiece',
    name: '민트 원피스',
    color: '#88b7a1',
    hide: [...upper, ...lower],
  },
];

async function build(def, lod) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene();
  const nodes = {};
  for (const [key, parent, x, y, z] of rig.bones) {
    const node = doc.createNode(key).setTranslation([x, y, z]);
    nodes[key] = node;
    if (parent) nodes[parent].addChild(node);
    else scene.addChild(node);
  }
  const access = (type, array) =>
    doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
  const inverse = new Float32Array(
    rig.bones.flatMap(
      ([key]) =>
        new Matrix4().makeTranslation(...absolute[key].clone().negate().toArray()).elements,
    ),
  );
  const skin = doc
    .createSkin()
    .setSkeleton(nodes.root)
    .setInverseBindMatrices(access('MAT4', inverse));
  for (const [key] of rig.bones) skin.addJoint(nodes[key]);
  const material = (color) =>
    doc
      .createMaterial()
      .setBaseColorFactor([...new Color(color).toArray(), 1])
      .setRoughnessFactor(0.8)
      .setMetallicFactor(0);
  const main = material(def.color);
  const ink = material('#30313d');
  const light = material('#f8eddb');
  const regions = {};
  const meshNodes = [];
  const segments = lod ? 8 : 18;
  const rigid = ['hair', 'hat', 'bag', 'hand'].includes(def.slot);
  function add(geometry, bone, region, mat = main) {
    const pos = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const primitive = doc
      .createPrimitive()
      .setAttribute('POSITION', access('VEC3', new Float32Array(pos.array)))
      .setAttribute('NORMAL', access('VEC3', new Float32Array(normals.array)))
      .setMaterial(mat);
    if (geometry.index)
      primitive.setIndices(access('SCALAR', new Uint16Array(geometry.index.array)));
    if (!rigid) {
      const joint = rig.bones.findIndex(([key]) => key === bone);
      const joints = new Uint16Array(pos.count * 4);
      const weights = new Float32Array(pos.count * 4);
      for (let i = 0; i < pos.count; i++) {
        joints[i * 4] = joint;
        weights[i * 4] = 1;
      }
      primitive
        .setAttribute('JOINTS_0', access('VEC4', joints))
        .setAttribute('WEIGHTS_0', access('VEC4', weights));
    }
    const node = doc
      .createNode(`visual_${meshNodes.length}`)
      .setMesh(doc.createMesh().addPrimitive(primitive));
    if (!rigid) node.setSkin(skin);
    scene.addChild(node);
    meshNodes.push(node);
    if (region) (regions[region] ??= []).push(node);
    geometry.dispose();
  }
  function ellipsoid(center, size, bone, region, mat) {
    const geo = new SphereGeometry(1, segments, Math.max(6, segments / 2));
    geo.scale(...size).translate(...center);
    add(geo, bone, region, mat);
  }
  function limb(start, end, radius, bone, region, mat) {
    const a = absolute[start];
    const b = absolute[end];
    const direction = b.clone().sub(a);
    const geo = new SphereGeometry(1, segments, Math.max(6, segments / 2));
    geo
      .scale(radius, direction.length() * 0.63, radius)
      .applyQuaternion(
        new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
      )
      .translate(...a.clone().add(b).multiplyScalar(0.5).toArray());
    add(geo, bone, region, mat);
  }
  function bodyTorso(clothing = false) {
    ellipsoid(
      [0, 1.0, 0],
      [clothing ? 0.245 : 0.205, 0.2, clothing ? 0.15 : 0.12],
      'chest',
      clothing ? undefined : 'torsoUpper',
    );
    ellipsoid(
      [0, 0.78, 0],
      [clothing ? 0.22 : 0.18, 0.16, clothing ? 0.15 : 0.125],
      'hips',
      clothing ? undefined : 'torsoLower',
    );
    for (const side of ['L', 'R']) {
      limb(
        `upperArm${side}`,
        `lowerArm${side}`,
        clothing ? 0.095 : 0.067,
        `upperArm${side}`,
        clothing ? undefined : `armUpper${side}`,
      );
      limb(
        `lowerArm${side}`,
        `hand${side}`,
        clothing ? 0.077 : 0.057,
        `lowerArm${side}`,
        clothing ? undefined : `armLower${side}`,
      );
    }
  }
  function legs(clothing = false) {
    for (const side of ['L', 'R']) {
      limb(
        `upperLeg${side}`,
        `lowerLeg${side}`,
        clothing ? 0.1 : 0.075,
        `upperLeg${side}`,
        clothing ? undefined : `legUpper${side}`,
      );
      limb(
        `lowerLeg${side}`,
        `foot${side}`,
        clothing ? 0.084 : 0.059,
        `lowerLeg${side}`,
        clothing ? undefined : `legLower${side}`,
      );
    }
  }
  if (def.slot === 'body') {
    bodyTorso();
    legs();
    ellipsoid([0, 1.44, 0], [0.275, 0.305, 0.25], 'head', 'head');
    ellipsoid([0, 1.2, 0], [0.078, 0.1, 0.08], 'neck', 'neck');
    for (const sign of [-1, 1]) {
      ellipsoid([sign * 0.093, 1.46, 0.235], [0.028, 0.043, 0.014], 'head', 'head', ink);
      ellipsoid([sign * 0.088, 1.474, 0.247], [0.008, 0.01, 0.006], 'head', 'head', light);
      ellipsoid([sign * 0.266, 1.44, 0], [0.044, 0.072, 0.054], 'head', 'head');
      ellipsoid(
        [sign * 0.49, 0.72, 0],
        [0.065, 0.075, 0.06],
        sign > 0 ? 'handL' : 'handR',
        sign > 0 ? 'handL' : 'handR',
      );
    }
    ellipsoid([0, 1.36, 0.249], [0.032, 0.008, 0.005], 'head', 'head', ink);
    for (const side of ['L', 'R'])
      ellipsoid(
        [absolute[`foot${side}`].x, 0.073, 0.052],
        [0.08, 0.07, 0.13],
        `foot${side}`,
        `foot${side}`,
      );
  } else if (def.slot === 'top' || def.slot === 'onepiece') {
    bodyTorso(true);
    if (def.variant === 1)
      for (const y of [0.86, 0.96, 1.06])
        ellipsoid([0, y, 0.15], [0.014, 0.014, 0.008], 'chest', undefined, light);
    if (def.slot === 'onepiece')
      add(new CylinderGeometry(0.19, 0.32, 0.43, segments).translate(0, 0.54, 0), 'hips');
  } else if (def.slot === 'bottom') {
    legs(true);
    ellipsoid([0, 0.71, 0], [0.2, 0.12, 0.145], 'hips');
  } else if (def.slot === 'shoes')
    for (const side of ['L', 'R'])
      ellipsoid([absolute[`foot${side}`].x, 0.078, 0.056], [0.105, 0.08, 0.155], `foot${side}`);
  else if (def.slot === 'hair') {
    add(
      new SphereGeometry(1, segments, 10, 0, Math.PI * 2, 0, Math.PI * 0.48).scale(
        0.287,
        0.32,
        0.266,
      ),
      'head',
    );
    ellipsoid([0, 0.17, 0.208], [0.23, 0.1, 0.075], 'head');
    for (const sign of [-1, 1])
      ellipsoid(
        [sign * 0.254, def.variant === 1 ? -0.08 : 0.015, -0.025],
        [0.071, def.variant === 1 ? 0.27 : 0.15, 0.17],
        'head',
      );
  } else if (def.slot === 'hat') {
    if (def.variant === 0)
      add(new CylinderGeometry(0.22, 0.28, 0.18, segments).translate(0, 0.32, 0), 'head');
    else ellipsoid([0.03, 0.3, 0], [0.32, 0.11, 0.29], 'head');
    ellipsoid([0, 0.245, 0], [0.35, 0.025, 0.32], 'head');
  } else if (def.slot === 'bag') {
    ellipsoid([0, -0.07, -0.09], [0.15, 0.2, 0.085], 'upperChest');
  } else if (def.slot === 'hand') {
    add(new CylinderGeometry(0.024, 0.024, 0.6, 8), 'handR');
    ellipsoid([0, 0.32, 0], [0.065, 0.065, 0.065], 'handR', undefined, light);
  }

  if (def.slot === 'body') {
    const poses = {
      idle: { head: [0, 0.06, 0], chest: [0, 0, 0.018] },
      walk: {
        upperLegL: [0.45, 0, 0],
        upperLegR: [-0.45, 0, 0],
        upperArmL: [-0.25, 0, 0],
        upperArmR: [0.25, 0, 0],
      },
      run: {
        upperLegL: [0.9, 0, 0],
        upperLegR: [-0.9, 0, 0],
        lowerLegL: [0.55, 0, 0],
        upperArmL: [-0.7, 0, 0],
        upperArmR: [0.7, 0, 0],
      },
      jump: {
        upperArmL: [0, 0, 1.3],
        upperArmR: [0, 0, -1.3],
        lowerLegL: [0.6, 0, 0],
        lowerLegR: [0.6, 0, 0],
      },
      sit: {
        upperLegL: [-1.4, 0, 0],
        upperLegR: [-1.4, 0, 0],
        lowerLegL: [1.5, 0, 0],
        lowerLegR: [1.5, 0, 0],
      },
      armsUp: { upperArmL: [0, 0, 1.9], upperArmR: [0, 0, -1.9] },
      crouch: {
        upperLegL: [-0.9, 0, 0],
        upperLegR: [-0.9, 0, 0],
        lowerLegL: [1.5, 0, 0],
        lowerLegR: [1.5, 0, 0],
        chest: [0.35, 0, 0],
      },
    };
    for (const [name, pose] of Object.entries(poses)) {
      const animation = doc.createAnimation(name);
      const times = access('SCALAR', new Float32Array([0, 0.5, 1, 1.5, 2]));
      for (const [key] of rig.bones) {
        const rotation = pose[key] ?? [0, 0, 0];
        const stationary = ['sit', 'armsUp', 'crouch'].includes(name);
        const values = [0, 1, 0, -1, 0].flatMap((phase) =>
          new Quaternion()
            .setFromEuler(new Euler(...rotation.map((v) => v * (stationary ? 1 : phase))))
            .toArray(),
        );
        const sampler = doc
          .createAnimationSampler()
          .setInput(times)
          .setOutput(access('VEC4', new Float32Array(values)))
          .setInterpolation('LINEAR');
        animation
          .addSampler(sampler)
          .addChannel(
            doc
              .createAnimationChannel()
              .setTargetNode(nodes[key])
              .setTargetPath('rotation')
              .setSampler(sampler),
          );
      }
      const hipsY = name === 'sit' ? 0.54 : name === 'crouch' ? 0.51 : 0.72;
      const positions = [0, 1, 0, 1, 0].flatMap((v) => [
        0,
        hipsY + (name === 'jump' ? v * 0.23 : 0),
        0,
      ]);
      const translation = doc
        .createAnimationSampler()
        .setInput(times)
        .setOutput(access('VEC3', new Float32Array(positions)));
      animation
        .addSampler(translation)
        .addChannel(
          doc
            .createAnimationChannel()
            .setTargetNode(nodes.hips)
            .setTargetPath('translation')
            .setSampler(translation),
        );
    }
  }
  const bytes = await io.writeBinary(doc);
  const validation = await validateBytes(bytes, { maxIssues: 20 });
  if (validation.issues.numErrors) throw new Error(JSON.stringify(validation.issues));
  const jsonLength = new DataView(bytes.buffer, bytes.byteOffset).getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(bytes.slice(20, 20 + jsonLength)));
  const nodeIndex = (node) => json.nodes.findIndex((entry) => entry.name === node.getName());
  const refs = (list) => list.map((node) => ({ node: nodeIndex(node), primitive: 0 }));
  const file = `${def.id}${lod ? '-lod1' : ''}.glb`;
  await fs.writeFile(path.join(output, file), bytes);
  return {
    source: { uri: `/gltf/avatars/manual-v1/${file}` },
    meshes: refs(meshNodes),
    bones: Object.fromEntries(rig.bones.map(([key]) => [key, nodeIndex(nodes[key])])),
    ...(def.slot === 'body'
      ? {
          bodyRegions: Object.fromEntries(
            Object.entries(regions).map(([key, list]) => [key, refs(list)]),
          ),
        }
      : {}),
    evidence: {
      file,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      errors: validation.issues.numErrors,
      warnings: validation.issues.numWarnings,
    },
  };
}

await fs.mkdir(output, { recursive: true });
const records = [];
const evidence = [];
for (const def of definitions) {
  const high = await build(def, 0);
  const low = await build(def, 1);
  evidence.push(high.evidence, low.evidence);
  delete high.evidence;
  delete low.evidence;
  const attachment = ['hair', 'hat'].includes(def.slot)
    ? { mode: 'bone', bone: 'head' }
    : def.slot === 'bag'
      ? { mode: 'socket', socket: 'back' }
      : def.slot === 'hand'
        ? { mode: 'socket', socket: 'handR' }
        : { mode: 'skinned' };
  const manifest = {
    schemaVersion: 1,
    assetId: def.id,
    version: 1,
    kind: def.slot === 'body' ? 'avatar-body' : 'avatar-part',
    slot: def.slot,
    rig: rig.id,
    bodyArchetypes: [rig.bodyArchetype],
    ...high,
    attachment,
    hideBodyRegions: def.hide ?? [],
    lods: [{ level: 1, ...low }],
    tags: ['manual-fixture', 'MIT', 'SD'],
  };
  records.push({
    slot: def.slot,
    id: def.id,
    name: def.name,
    kind: manifest.kind,
    url: manifest.source.uri,
    colors: { primary: def.color },
    metadata: { avatar: manifest },
  });
}
await fs.writeFile(path.join(output, 'catalog.json'), JSON.stringify(records, null, 2) + '\n');
await fs.writeFile(
  path.join(output, 'evidence.json'),
  JSON.stringify(
    {
      generator: 'scripts/build-avatar-fixtures.mjs',
      license: 'MIT',
      source: 'Original procedural test fixtures authored for this repository',
      visualApproval: 'pending',
      assets: evidence,
    },
    null,
    2,
  ) + '\n',
);
process.stdout.write(
  JSON.stringify({
    records: records.length,
    glbs: evidence.length,
    bytes: evidence.reduce((n, e) => n + e.bytes, 0),
    errors: 0,
  }) + '\n',
);
