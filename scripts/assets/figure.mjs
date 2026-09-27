// Figure preset: a web-ready character GLB from its master (clips, materials, geometry and texture budgets).
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Logger } from '@gltf-transform/core';
import { EXTTextureWebP } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, resample, simplify, weld } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { Matrix4, Object3D, Quaternion, Vector3 } from 'three';

import { createIO, validateDeliveryGlb } from './build.mjs';
import { inspection } from './contract.mjs';

export const FIGURE_DEFAULTS = Object.freeze({
  /** Triangles a figure may carry: a scene draws a dozen of them, each again for shadows. */
  budget: 20_000,
  /**
   * Colour texels per metre of surface. A figure 3-4 m from the camera gets 400-540 screen pixels per metre (fov 48°
   * on a 1440 px canvas), so ~1.7 m figures keep 2048 maps and smaller ones step down.
   */
  texelDensity: 512,
});

/** Material extensions that only shape highlights or depth, which a matte figure has neither of. */
const GLOSS_EXTENSIONS = [
  'KHR_materials_specular',
  'KHR_materials_ior',
  'KHR_materials_clearcoat',
  'KHR_materials_sheen',
  'KHR_materials_iridescence',
  'KHR_materials_anisotropy',
  'KHR_materials_volume',
];

/** Accessor values as plain numbers, normalized integers decoded. */
function numbers(accessor) {
  const out = [];
  for (let index = 0; index < accessor.getCount(); index++) out.push(...accessor.getElement(index, []));
  return out;
}

const clipDuration = (animation) =>
  Math.max(0, ...animation.listSamplers().map((sampler) => sampler.getInput()?.getMax([])[0] ?? 0));

function restValue(node, path) {
  if (path === 'rotation') return node.getRotation();
  if (path === 'translation') return node.getTranslation();
  if (path === 'scale') return node.getScale();
  return node.getWeights().length ? node.getWeights() : (node.getMesh()?.getWeights() ?? []);
}

/** Whether a clip only holds the rest pose for under 0.1 s (`restpose`, `Walking.001`): never worth shipping. */
export function isStubClip(animation) {
  const duration = clipDuration(animation);
  if (duration >= inspection.REST_POSE_STUB_SECONDS) return false;
  return inspection.isRestPoseStub(
    duration,
    animation.listChannels().map((channel) => ({
      values: numbers(channel.getSampler().getOutput()),
      rest: restValue(channel.getTargetNode(), channel.getTargetPath()),
    })),
  );
}

/** A clip by exact name, else by engine name (`walk` finds `Walking`). */
function findClip(document, name) {
  const clips = document.getRoot().listAnimations();
  const engineName = inspection.figureClipName(name) ?? name;
  return (
    clips.find((clip) => clip.getName() === name) ??
    clips.find((clip) => inspection.figureClipName(clip.getName()) === engineName)
  );
}

/** Gives clips their engine names (`Walking` → `walk`) unless another clip already has that name. */
function renameClips(root) {
  const names = new Set(root.listAnimations().map((animation) => animation.getName()));
  for (const animation of root.listAnimations()) {
    const name = inspection.figureClipName(animation.getName());
    if (!name || names.has(name)) continue;
    names.delete(animation.getName());
    names.add(name);
    animation.setName(name);
  }
}

/** Fully rough and non-metallic, as the engine draws figures: metallic-roughness maps and gloss extensions go. */
function makeMatte(document) {
  for (const material of document.getRoot().listMaterials())
    material.setMetallicFactor(0).setRoughnessFactor(1).setMetallicRoughnessTexture(null);
  for (const extension of document.getRoot().listExtensionsUsed())
    if (GLOSS_EXTENSIONS.includes(extension.extensionName)) extension.dispose();
}

const countTriangles = (root) =>
  root
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .reduce((sum, primitive) => sum + (primitive.getIndices() ?? primitive.getAttribute('POSITION')).getCount() / 3, 0);

/** GPU bytes of every texture uploaded as RGBA8 with mipmaps. */
export const textureMemory = (document) =>
  document
    .getRoot()
    .listTextures()
    .reduce((sum, texture) => sum + ((texture.getSize() ?? [0, 0]).reduce((a, b) => a * b, 1) * 16) / 3, 0);

// ---- Rigs and clips, posed with three.js for world-space math.

/** The default scene as three.js objects, with the first node of each humanoid bone name. */
function rigOf(document) {
  const objects = new Map();
  const bones = new Map();
  const build = (node) => {
    const object = new Object3D();
    object.position.fromArray(node.getTranslation());
    object.quaternion.fromArray(node.getRotation());
    object.scale.fromArray(node.getScale());
    objects.set(node, object);
    const name = inspection.humanoidBoneName(node.getName());
    if (!bones.has(name)) bones.set(name, node);
    for (const child of node.listChildren()) object.add(build(child));
    return object;
  };
  const root = new Object3D();
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  for (const node of scene?.listChildren() ?? []) root.add(build(node));
  root.updateMatrixWorld(true);
  return { root, objects, bones, object: (name) => objects.get(bones.get(name)) };
}

/** A sampler's value at `time`: linear between keys (quaternions the short way, normalized), held for STEP. */
function sample(sampler, time) {
  const times = sampler.getInput().getArray();
  const output = sampler.getOutput();
  const interpolation = sampler.getInterpolation();
  // Cubic-spline keys store in-tangent, value, out-tangent: read the values.
  const [stride, at] = interpolation === 'CUBICSPLINE' ? [3, 1] : [1, 0];
  let index = 0;
  while (index < times.length - 2 && times[index + 1] <= time) index++;
  const next = Math.min(index + 1, times.length - 1);
  const span = times[next] - times[index];
  const t =
    interpolation === 'STEP' || span <= 0
      ? Number(time >= times[next])
      : Math.min(1, Math.max(0, (time - times[index]) / span));
  const a = output.getElement(index * stride + at, []);
  const b = output.getElement(next * stride + at, []);
  if (a.length === 4 && a.reduce((dot, value, c) => dot + value * b[c], 0) < 0) b.forEach((value, c) => (b[c] = -value));
  const value = a.map((start, c) => start + (b[c] - start) * t);
  const length = value.length === 4 ? Math.hypot(...value) || 1 : 1;
  return value.map((component) => component / length);
}

function pose(rig, animation, time) {
  for (const channel of animation.listChannels()) {
    const object = rig.objects.get(channel.getTargetNode());
    const path = channel.getTargetPath();
    if (!object || (path !== 'rotation' && path !== 'translation')) continue;
    const value = sample(channel.getSampler(), time);
    if (path === 'rotation') object.quaternion.fromArray(value);
    else object.position.fromArray(value);
  }
  rig.root.updateMatrixWorld(true);
}

/**
 * Carries `source`, a clip of `donor`, onto the figure as a new clip `name`. The first frame of `poseRef`, a clip
 * both rigs have, is taken as one pose on both skeletons: every bone turns by the source's world rotation away from
 * that pose, whatever its local axes, and the hips move by the source's sway scaled by hip height.
 */
export function addClip(document, { name, donor, source, poseRef }) {
  const from = rigOf(donor);
  const to = rigOf(document);
  const clip = findClip(donor, source);
  const fromRef = findClip(donor, poseRef);
  const toRef = findClip(document, poseRef);
  if (!clip) throw new Error(`The donor has no clip ${source}`);
  if (!fromRef || !toRef) throw new Error(`Both rigs need the reference clip ${poseRef}`);
  if (!from.bones.has('Hips') || !to.bones.has('Hips')) throw new Error('Both rigs need hips');
  pose(from, fromRef, 0);
  pose(to, toRef, 0);
  const depth = (object) => {
    let count = 0;
    for (let parent = object.parent; parent; parent = parent.parent) count++;
    return count;
  };
  const rotated = clip.listChannels().filter((channel) => channel.getTargetPath() === 'rotation');
  const bones = [...new Set(rotated.map((channel) => inspection.humanoidBoneName(channel.getTargetNode().getName())))]
    .filter((bone) => to.bones.has(bone))
    .sort((a, b) => depth(to.object(a)) - depth(to.object(b)));
  const world = (rig, bone) => rig.object(bone).getWorldQuaternion(new Quaternion());
  const fromStart = new Map(bones.map((bone) => [bone, world(from, bone).invert()]));
  const toStart = new Map(bones.map((bone) => [bone, world(to, bone)]));
  const fromHips = from.object('Hips').getWorldPosition(new Vector3());
  const toHips = to.object('Hips').getWorldPosition(new Vector3());
  const scale = toHips.y / fromHips.y;
  const times = clip
    .listSamplers()
    .map((sampler) => sampler.getInput().getArray())
    .reduce((longest, keys) => (keys.length > longest.length ? keys : longest));
  const rotations = new Map(bones.map((bone) => [bone, new Float32Array(times.length * 4)]));
  const hipsPath = new Float32Array(times.length * 3);
  const turn = new Quaternion();
  const parent = new Quaternion();
  const at = new Vector3();
  const hips = to.object('Hips');
  times.forEach((time, key) => {
    pose(from, clip, time);
    for (const bone of bones) {
      const object = to.object(bone);
      turn.copy(world(from, bone)).multiply(fromStart.get(bone)).multiply(toStart.get(bone));
      object.quaternion.copy(object.parent.getWorldQuaternion(parent).invert().multiply(turn));
      object.updateMatrixWorld(true);
      object.quaternion.toArray(rotations.get(bone), key * 4);
    }
    from.object('Hips').getWorldPosition(at).sub(fromHips).multiplyScalar(scale).add(toHips);
    hips.position.copy(hips.parent.worldToLocal(at));
    hips.updateMatrixWorld(true);
    hips.position.toArray(hipsPath, key * 3);
  });

  const buffer = document.getRoot().listBuffers()[0] ?? document.createBuffer();
  const input = document.createAccessor().setType('SCALAR').setArray(new Float32Array(times)).setBuffer(buffer);
  const animation = document.createAnimation(name);
  const channel = (node, path, values) => {
    const output = document.createAccessor().setType(path === 'rotation' ? 'VEC4' : 'VEC3').setArray(values).setBuffer(buffer);
    const sampler = document.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
    animation.addSampler(sampler).addChannel(document.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(sampler));
  };
  for (const bone of bones) channel(to.bones.get(bone), 'rotation', rotations.get(bone));
  channel(to.bones.get('Hips'), 'translation', hipsPath);
  return animation;
}

// ---- Textures: size from texel density, normal maps at half size, UV island dilation.

/** A material's textures: role, texture and the UV set it reads. */
function textureSlots(material) {
  return [
    ['colour', material.getBaseColorTexture(), material.getBaseColorTextureInfo()],
    ['colour', material.getEmissiveTexture(), material.getEmissiveTextureInfo()],
    ['normal', material.getNormalTexture(), material.getNormalTextureInfo()],
    ['data', material.getOcclusionTexture(), material.getOcclusionTextureInfo()],
    ['data', material.getMetallicRoughnessTexture(), material.getMetallicRoughnessTextureInfo()],
  ]
    .filter(([, texture]) => texture)
    .map(([role, texture, info]) => ({ role, texture, texCoord: info.getTexCoord() }));
}

/** Triangle primitives drawn with `material`, with the node that draws them. */
const drawsOf = (document, material) =>
  document
    .getRoot()
    .listNodes()
    .flatMap((node) =>
      (node.getMesh()?.listPrimitives() ?? [])
        .filter((primitive) => primitive.getMaterial() === material && primitive.getMode() === 4)
        .map((primitive) => ({ node, primitive })),
    );

const cornersOf = (primitive) =>
  primitive.getIndices()?.getArray() ??
  Array.from({ length: primitive.getAttribute('POSITION').getCount() }, (_, index) => index);

/** World positions in the bind pose: skinned by the joints' rest matrices, else placed by the node. */
function bindPositions(node, primitive) {
  const position = primitive.getAttribute('POSITION');
  const joints = primitive.getAttribute('JOINTS_0');
  const weights = primitive.getAttribute('WEIGHTS_0');
  const skin = node.getSkin();
  const inverses = skin?.getInverseBindMatrices();
  const matrices =
    skin && joints && weights
      ? skin.listJoints().map((joint, index) => {
          const inverse = inverses ? new Matrix4().fromArray(inverses.getElement(index, [])) : new Matrix4();
          return new Matrix4().fromArray(joint.getWorldMatrix()).multiply(inverse);
        })
      : null;
  const placement = new Matrix4().fromArray(node.getWorldMatrix());
  const out = new Float32Array(position.getCount() * 3);
  const point = new Vector3();
  const skinned = new Vector3();
  const part = new Vector3();
  const joint = [];
  const weight = [];
  for (let index = 0; index < position.getCount(); index++) {
    point.fromArray(position.getElement(index, []));
    if (matrices) {
      joints.getElement(index, joint);
      weights.getElement(index, weight);
      skinned.set(0, 0, 0);
      for (let slot = 0; slot < 4; slot++)
        if (weight[slot]) skinned.addScaledVector(part.copy(point).applyMatrix4(matrices[joint[slot]]), weight[slot]);
      point.copy(skinned);
    } else point.applyMatrix4(placement);
    point.toArray(out, index * 3);
  }
  return out;
}

/** Texels per metre of surface: texture side × √(UV area / world area) over the triangles that use it. */
function texelDensity(draws, texCoord, [width, height]) {
  let world = 0;
  let uv = 0;
  const [a, b, c] = [new Vector3(), new Vector3(), new Vector3()];
  for (const { node, primitive } of draws) {
    const uvs = primitive.getAttribute(`TEXCOORD_${texCoord}`);
    if (!uvs) continue;
    const positions = bindPositions(node, primitive);
    const corners = cornersOf(primitive);
    for (let i = 0; i + 2 < corners.length; i += 3) {
      a.fromArray(positions, corners[i] * 3);
      b.fromArray(positions, corners[i + 1] * 3).sub(a);
      c.fromArray(positions, corners[i + 2] * 3).sub(a);
      world += b.cross(c).length() / 2;
      const [[u0, v0], [u1, v1], [u2, v2]] = [0, 1, 2].map((k) => uvs.getElement(corners[i + k], []));
      uv += Math.abs((u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0)) / 2;
    }
  }
  return world && uv ? Math.sqrt(width * height) * Math.sqrt(uv / world) : Infinity;
}

/** UV corners (u, v per corner) of every triangle that samples a texture. */
function uvTriangles(uses) {
  const out = [];
  for (const { draws, texCoord } of uses) {
    for (const { primitive } of draws) {
      const uvs = primitive.getAttribute(`TEXCOORD_${texCoord}`);
      if (uvs) for (const corner of cornersOf(primitive)) out.push(...uvs.getElement(corner, []));
    }
  }
  return out;
}

/**
 * Texels UV triangles touch at `width` × `height`, conservatively: a texel counts when a triangle overlaps its
 * square. Each triangle is moved into the tile its centre lies in, as atlases repeat.
 */
export function uvCoverage(triangles, width, height) {
  const covered = new Uint8Array(width * height);
  const x = [0, 0, 0];
  const y = [0, 0, 0];
  for (let t = 0; t + 5 < triangles.length; t += 6) {
    const tileU = Math.floor((triangles[t] + triangles[t + 2] + triangles[t + 4]) / 3);
    const tileV = Math.floor((triangles[t + 1] + triangles[t + 3] + triangles[t + 5]) / 3);
    for (let k = 0; k < 3; k++) {
      x[k] = (triangles[t + k * 2] - tileU) * width;
      y[k] = (triangles[t + k * 2 + 1] - tileV) * height;
    }
    const area = (x[1] - x[0]) * (y[2] - y[0]) - (x[2] - x[0]) * (y[1] - y[0]);
    if (!area) continue;
    const sign = Math.sign(area);
    const minX = Math.max(0, Math.floor(Math.min(...x) - 1));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(...x)));
    const minY = Math.max(0, Math.floor(Math.min(...y) - 1));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(...y)));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        let inside = true;
        for (let k = 0; k < 3 && inside; k++) {
          const ex = x[(k + 1) % 3] - x[k];
          const ey = y[(k + 1) % 3] - y[k];
          // Inside the edge, or within half a texel square of it.
          inside = sign * (ex * (py + 0.5 - y[k]) - ey * (px + 0.5 - x[k])) >= -0.5 * (Math.abs(ex) + Math.abs(ey));
        }
        if (inside) covered[py * width + px] = 1;
      }
    }
  }
  return covered;
}

/** Fills every uncovered texel with the colour of its nearest covered texel (8-connected, breadth first). */
export function fillUncovered(pixels, width, height, channels, covered) {
  const queue = new Int32Array(width * height);
  const seen = Uint8Array.from(covered);
  let tail = 0;
  for (let index = 0; index < covered.length; index++) if (covered[index]) queue[tail++] = index;
  for (let head = 0; head < tail; head++) {
    const index = queue[head];
    const x = index % width;
    const y = (index - x) / width;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (seen[next]) continue;
        seen[next] = 1;
        pixels.copyWithin(next * channels, index * channels, index * channels + channels);
        queue[tail++] = next;
      }
    }
  }
  return pixels;
}

function encode(pixels, width, height, channels, mimeType, lossless) {
  const image = sharp(pixels, { raw: { width, height, channels } });
  if (mimeType === 'image/jpeg') return image.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  if (mimeType === 'image/png') return image.png({ compressionLevel: 9 }).toBuffer();
  return image.webp(lossless ? { lossless: true } : { quality: 90 }).toBuffer();
}

/**
 * Sizes every map for the figure: colour maps to the texel density, normal maps to half the colour size as
 * lossless WebP, other maps no larger than the colour map; never upscaled. With `dilate`, texels no UV triangle
 * covers take the nearest covered colour at the source and at the output size, so mip levels never blend islands
 * with the background.
 */
async function fitTextures(document, { texelDensity: target, dilate }) {
  const plans = new Map();
  for (const material of document.getRoot().listMaterials()) {
    const slots = textureSlots(material);
    const draws = drawsOf(document, material);
    const colour = slots.find((slot) => slot.role === 'colour');
    let colourSize = null;
    if (colour) {
      const size = colour.texture.getSize();
      const halvings = Math.max(0, Math.floor(Math.log2(texelDensity(draws, colour.texCoord, size) / target)));
      colourSize = size.map((side) => Math.max(1, Math.round(side / 2 ** halvings)));
    }
    for (const { role, texture, texCoord } of slots) {
      const source = texture.getSize();
      const wanted = colourSize && role === 'normal' ? colourSize.map((side) => Math.max(1, side >> 1)) : (colourSize ?? source);
      const plan = plans.get(texture) ?? { size: [0, 0], lossless: false, uses: [] };
      plan.size = plan.size.map((side, axis) => Math.max(side, Math.min(wanted[axis], source[axis])));
      plan.lossless ||= role === 'normal';
      plan.uses.push({ draws, texCoord });
      plans.set(texture, plan);
    }
  }
  for (const [texture, { size, lossless, uses }] of plans) {
    const [width, height] = size;
    const resized = width !== texture.getSize()[0] || height !== texture.getSize()[1];
    const mimeType = lossless ? 'image/webp' : texture.getMimeType();
    if (!resized && !dilate && mimeType === texture.getMimeType()) continue;
    let { data, info } = await sharp(texture.getImage()).raw().toBuffer({ resolveWithObject: true });
    const { channels } = info;
    const triangles = dilate ? uvTriangles(uses) : null;
    if (triangles) fillUncovered(data, info.width, info.height, channels, uvCoverage(triangles, info.width, info.height));
    if (resized) {
      data = await sharp(data, { raw: { width: info.width, height: info.height, channels } })
        .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
        .raw()
        .toBuffer();
      if (triangles) fillUncovered(data, width, height, channels, uvCoverage(triangles, width, height));
    }
    texture.setImage(new Uint8Array(await encode(data, width, height, channels, mimeType, lossless))).setMimeType(mimeType);
  }
  if (document.getRoot().listTextures().some((texture) => texture.getMimeType() === 'image/webp'))
    document.createExtension(EXTTextureWebP).setRequired(true);
}

/**
 * The figure preset. Optionally carries a clip in first (`clip`: see addClip, skipped when the figure already has
 * one of that name), drops rest-pose stubs, gives clips engine names, makes materials matte with `matte`, simplifies
 * past `budget` triangles, resamples clips, fits textures and compresses with Meshopt.
 */
export async function optimizeFigure(
  document,
  { matte = false, budget = FIGURE_DEFAULTS.budget, texelDensity = FIGURE_DEFAULTS.texelDensity, dilate = false, clip } = {},
) {
  await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  // Quantization clones skins and prunes the originals; only warnings are worth printing.
  document.setLogger(new Logger(Logger.Verbosity.WARN));
  const root = document.getRoot();
  const added = clip && !findClip(document, clip.name) ? addClip(document, clip).getName() : null;
  const stubs = root.listAnimations().filter(isStubClip);
  const dropped = stubs.map((animation) => animation.getName());
  for (const animation of stubs) animation.dispose();
  renameClips(root);
  if (matte) makeMatte(document);
  const triangles = countTriangles(root);
  await document.transform(
    dedup(),
    prune(),
    // Welding first lets the simplifier collapse across shared positions.
    ...(triangles > budget
      ? [weld(), simplify({ simplifier: MeshoptSimplifier, ratio: budget / triangles, error: 0.002 })]
      : []),
    // Drops keys that linear interpolation already reproduces.
    resample(),
  );
  await fitTextures(document, { texelDensity, dilate });
  // Quantized, reordered and compressed geometry and clips; the engine's loader decodes them with MeshoptDecoder.
  await document.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  return { added, dropped, triangles: [triangles, countTriangles(root)] };
}

/**
 * Builds `output` from the figure master `input` and validates the result. `addClip` names a clip to carry in:
 * `{ name, from: 'donor.glb#Clip', poseRef }`.
 */
export async function buildFigureFile(input, output, { addClip: carry, ...options } = {}) {
  const io = await createIO();
  const document = await io.read(input);
  const before = { bytes: (await stat(input)).size, textureMemory: textureMemory(document) };
  let clip;
  if (carry) {
    const split = carry.from.lastIndexOf('#');
    if (split < 0) throw new Error('--from needs donor.glb#Clip');
    clip = {
      name: carry.name,
      donor: await io.read(carry.from.slice(0, split)),
      source: carry.from.slice(split + 1),
      poseRef: carry.poseRef ?? 'walk',
    };
  }
  const result = await optimizeFigure(document, { ...options, clip });
  const bytes = await io.writeBinary(document);
  await validateDeliveryGlb(bytes);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, bytes);
  return {
    output,
    ...result,
    bytes: [before.bytes, bytes.length],
    textureMemory: [before.textureMemory, textureMemory(document)],
    clips: document.getRoot().listAnimations().map((animation) => animation.getName()),
    textures: document.getRoot().listTextures().map((texture) => `${texture.getMimeType()} ${texture.getSize()?.join('x')}`),
  };
}
