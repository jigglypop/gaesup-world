import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsSpecular } from '@gltf-transform/extensions';
import sharp from 'sharp';
import { Matrix4, Quaternion, Vector3 } from 'three';

export async function createTestGlb() {
  const document = new Document();
  const buffer = document.createBuffer();
  const position = document.createAccessor().setType('VEC3').setBuffer(buffer)
    .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 1]));
  const mesh = document.createMesh().addPrimitive(document.createPrimitive().setAttribute('POSITION', position));
  document.createScene().addChild(document.createNode().setMesh(mesh));
  return new NodeIO().writeBinary(document);
}

// A 1.7 m figure in a T pose facing +Z (its left at +X): Mixamo joint, parent, world position.
const JOINTS = [
  ['Hips', null, 0, 0.9, 0],
  ['Spine', 'Hips', 0, 1.1, 0],
  ['Neck', 'Spine', 0, 1.45, 0],
  ['Head', 'Neck', 0, 1.55, 0],
  ['LeftArm', 'Spine', 0.2, 1.4, 0],
  ['LeftForeArm', 'LeftArm', 0.45, 1.4, 0],
  ['LeftHand', 'LeftForeArm', 0.7, 1.4, 0],
  ['RightArm', 'Spine', -0.2, 1.4, 0],
  ['RightForeArm', 'RightArm', -0.45, 1.4, 0],
  ['RightHand', 'RightForeArm', -0.7, 1.4, 0],
  ['LeftUpLeg', 'Hips', 0.1, 0.85, 0],
  ['LeftLeg', 'LeftUpLeg', 0.1, 0.45, 0],
  ['LeftFoot', 'LeftLeg', 0.1, 0.05, 0],
  ['RightUpLeg', 'Hips', -0.1, 0.85, 0],
  ['RightLeg', 'RightUpLeg', -0.1, 0.45, 0],
  ['RightFoot', 'RightLeg', -0.1, 0.05, 0],
];
const parentOf = new Map(JOINTS.map(([name, parent]) => [name, parent]));

export const turn = (axis, degrees) => new Quaternion().setFromAxisAngle(new Vector3(...axis), (degrees * Math.PI) / 180);
const X = [1, 0, 0];
const Z = [0, 0, 1];
const ARMS_DOWN = { LeftArm: turn(Z, -80), RightArm: turn(Z, 80) };
const cycle = (t, degrees) => degrees * Math.sin(2 * Math.PI * t);

/** Clip kinds: local rotations over normalized time on a rig whose rest rotations are all identity. */
const CLIPS = {
  Idle: { duration: 2, sway: 0.02, pose: (t, armsOut) => ({ ...(armsOut ? {} : ARMS_DOWN), Spine: turn(X, cycle(t, 3)) }) },
  Walking: { duration: 1, pose: (t) => ({ ...ARMS_DOWN, LeftUpLeg: turn(X, cycle(t, 20)), RightUpLeg: turn(X, cycle(t, -20)) }) },
  Running: { duration: 0.7, pose: (t) => ({ ...ARMS_DOWN, LeftUpLeg: turn(X, cycle(t, 35)), RightUpLeg: turn(X, cycle(t, -35)) }) },
  // Blender's leftover: two keys of the rest pose in 0.05 s.
  restpose: { duration: 0.05, pose: () => ({ Hips: new Quaternion() }) },
};

/** Every face of a joint's box maps to that joint's island in a 4 × 4 atlas, with gaps between islands. */
export const ISLAND = { size: 0.19, margin: 0.03 };
const FACES = [0, 1, 2].flatMap((axis) => [1, -1].map((sign) => ({ axis, sign, u: (axis + 1) % 3, v: (axis + 2) % 3 })));

async function png(width, height, paint) {
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) pixels.set(paint(x / width, y / height), (y * width + x) * 4);
  return new Uint8Array(await sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer());
}

const islandOf = (joint) => [(joint % 4) / 4 + ISLAND.margin, Math.floor(joint / 4) / 4 + ISLAND.margin];

/**
 * A skinned humanoid figure: one box per joint skinned to it, a UV island per box, clips named by `clips`
 * (name → kind of CLIPS). `frames` turns bones' local axes (joint → quaternion) and `scale` resizes the figure while
 * every clip keeps its world-space pose, as rigs of one pose built by different tools do. With `textures`, the
 * material carries 64 px colour (islands on black), normal and metallic-roughness maps and a specular extension.
 */
export async function createFigureDocument({
  clips = { Idle: 'Idle', Walking: 'Walking', Running: 'Running', restpose: 'restpose' },
  armsOut = false,
  frames = {},
  scale = 1,
  textures = true,
} = {}) {
  const document = new Document();
  const buffer = document.createBuffer();
  const accessor = (type, array) => document.createAccessor().setType(type).setArray(array).setBuffer(buffer);
  const frame = (name) => new Quaternion().fromArray(frames[name] ?? [0, 0, 0, 1]);
  const parentFrame = (name) => (parentOf.get(name) ? frame(parentOf.get(name)) : new Quaternion());
  const world = new Map(JOINTS.map(([name, , x, y, z]) => [name, new Vector3(x, y, z).multiplyScalar(scale)]));
  const armature = document.createNode('Armature');
  const nodes = new Map();
  for (const [name, parent] of JOINTS) {
    const offset = world.get(name).clone().sub(parent ? world.get(parent) : new Vector3());
    const node = document
      .createNode(`mixamorig:${name}`)
      .setTranslation(offset.applyQuaternion(parentFrame(name).invert()).toArray())
      .setRotation(parentFrame(name).invert().multiply(frame(name)).toArray());
    (parent ? nodes.get(parent) : armature).addChild(node);
    nodes.set(name, node);
  }

  const [positions, normals, uvs, joints, weights, indices] = [[], [], [], [], [], []];
  JOINTS.forEach(([name], joint) => {
    const size = (name === 'Head' ? 0.3 : 0.1) * scale;
    const center = world.get(name).clone();
    if (name.endsWith('Foot')) center.y = 0.05 * scale;
    const [u0, v0] = islandOf(joint);
    for (const { axis, sign, u, v } of FACES) {
      const base = positions.length / 3;
      for (const [du, dv] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const corner = center.toArray();
        corner[axis] += (sign * size) / 2;
        corner[u] += (du - 0.5) * size;
        corner[v] += (dv - 0.5) * size;
        positions.push(...corner);
        normals.push(...[0, 1, 2].map((component) => (component === axis ? sign : 0)));
        uvs.push(u0 + du * ISLAND.size, v0 + dv * ISLAND.size);
        joints.push(joint, 0, 0, 0);
        weights.push(1, 0, 0, 0);
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  });
  const skin = document.createSkin('Armature').setSkeleton(nodes.get('Hips'));
  for (const [name] of JOINTS) skin.addJoint(nodes.get(name));
  const inverses = JOINTS.flatMap(([name]) =>
    new Matrix4().compose(world.get(name), frame(name), new Vector3(1, 1, 1)).invert().toArray(),
  );
  skin.setInverseBindMatrices(accessor('MAT4', new Float32Array(inverses)));
  const material = document.createMaterial('Body').setMetallicFactor(1).setRoughnessFactor(1);
  if (textures) {
    const texture = async (name, paint) =>
      document.createTexture(name).setMimeType('image/png').setImage(await png(64, 64, paint));
    const colour = await texture('colour', (x, y) => {
      const joint = Math.floor(y * 4) * 4 + Math.floor(x * 4);
      const [u0, v0] = islandOf(joint);
      const inside = x >= u0 && x < u0 + ISLAND.size && y >= v0 && y < v0 + ISLAND.size;
      return inside ? [200, 40 + joint * 10, 60, 255] : [0, 0, 0, 255];
    });
    // Not solid colours, which prune would drop on its own.
    material
      .setBaseColorTexture(colour)
      .setNormalTexture(await texture('normal', (x) => [128 + Math.round(40 * Math.sin(x * 12)), 128, 255, 255]))
      .setMetallicRoughnessTexture(await texture('metal-rough', (x) => [0, 100 + Math.round(x * 100), 0, 255]));
    const specular = document.createExtension(KHRMaterialsSpecular);
    material.setExtension('KHR_materials_specular', specular.createSpecular().setSpecularFactor(0.5));
  }
  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', accessor('VEC3', new Float32Array(positions)))
    .setAttribute('NORMAL', accessor('VEC3', new Float32Array(normals)))
    .setAttribute('TEXCOORD_0', accessor('VEC2', new Float32Array(uvs)))
    .setAttribute('JOINTS_0', accessor('VEC4', new Uint16Array(joints)))
    .setAttribute('WEIGHTS_0', accessor('VEC4', new Float32Array(weights)))
    .setIndices(accessor('SCALAR', new Uint16Array(indices)))
    .setMaterial(material);
  const body = document.createNode('Body').setMesh(document.createMesh('Body').addPrimitive(primitive)).setSkin(skin);
  document.createScene().addChild(armature).addChild(body);

  for (const [name, kind] of Object.entries(clips)) {
    const { duration, sway = 0, pose } = CLIPS[kind];
    const times = Array.from({ length: 9 }, (_, key) => (duration * key) / 8);
    const poses = times.map((time) => pose(time / duration, armsOut));
    const input = accessor('SCALAR', new Float32Array(times));
    const animation = document.createAnimation(name);
    const channel = (node, path, values) => {
      const output = accessor(path === 'rotation' ? 'VEC4' : 'VEC3', new Float32Array(values));
      const sampler = document.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
      animation.addSampler(sampler).addChannel(document.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(sampler));
    };
    // A bone's keys in its own axes: the parent's frame undone, the pose applied, its frame restored.
    for (const bone of Object.keys(poses[0])) {
      channel(nodes.get(bone), 'rotation', poses.flatMap((local) => parentFrame(bone).invert().multiply(local[bone]).multiply(frame(bone)).toArray()));
    }
    if (sway) {
      channel(nodes.get('Hips'), 'translation', times.flatMap((time) =>
        world.get('Hips').clone().add(new Vector3(sway * scale * Math.sin((2 * Math.PI * time) / duration), 0, 0)).toArray()));
    }
  }
  return document;
}
