import type { ProbeFaceBuffers, VoxelDims } from '../types';

/** Faces of an irradiance cube in atlas order: +x -x +y -y +z -z, laid side by side along the atlas x axis. */
export const PROBE_ATLAS_FACES = 6;
/** Channels per atlas texel (RGBA; alpha is always 1). */
export const PROBE_ATLAS_CHANNELS = 4;

const HALF_ONE = 0x3c00;
const HALF_MAX = 0x7bff;
const floatView = new Float32Array(1);
const bitsView = new Uint32Array(floatView.buffer);

/** Length of one level's atlas: every probe's six faces, four half floats each. */
export function probeAtlasLength(counts: VoxelDims): number {
  return counts[0] * counts[1] * counts[2] * PROBE_ATLAS_FACES * PROBE_ATLAS_CHANNELS;
}

/**
 * Where probe `index`'s texel of `face` starts in the atlas. A probe row (fixed y and z) holds the six faces one after
 * another, each `counts[0]` texels wide, so hardware filtering inside a face never reads its neighbour.
 */
export function probeAtlasOffset(counts: VoxelDims, index: number, face: number): number {
  const x = index % counts[0];
  const row = (index - x) / counts[0];
  return ((row * PROBE_ATLAS_FACES + face) * counts[0] + x) * PROBE_ATLAS_CHANNELS;
}

/** The half-float bits of alpha 1, written into every texel. */
export const PROBE_ATLAS_ALPHA = HALF_ONE;

/**
 * IEEE 754 half-float bits of `value`, rounded to nearest even. Irradiance is never negative or huge, but the
 * conversion stays total: NaN becomes 0 and anything past the half range the largest finite half.
 */
export function toHalfFloat(value: number): number {
  if (!(value === value)) return 0;
  floatView[0] = value;
  const bits = bitsView[0] ?? 0;
  const sign = (bits >>> 16) & 0x8000;
  const exponent = ((bits >>> 23) & 0xff) - 127 + 15;
  const mantissa = bits & 0x7fffff;
  if (exponent >= 0x1f) return sign | HALF_MAX;
  if (exponent <= 0) {
    // Subnormal half (or zero): shift the implicit one in and round what falls off.
    if (exponent < -10) return sign;
    const full = mantissa | 0x800000;
    const shift = 14 - exponent;
    let half = full >>> shift;
    const rest = full & ((1 << shift) - 1);
    const halfway = 1 << (shift - 1);
    if (rest > halfway || (rest === halfway && (half & 1) === 1)) half += 1;
    return sign | half;
  }
  let half = sign | (exponent << 10) | (mantissa >>> 13);
  const rest = mantissa & 0x1fff;
  // A carry out of the mantissa correctly bumps the exponent; one past the largest finite half stays finite.
  if (rest > 0x1000 || (rest === 0x1000 && (half & 1) === 1)) half += 1;
  return (half & 0x7fff) > HALF_MAX ? sign | HALF_MAX : half;
}

/** Writes a level's six per-face RGBA float buffers (ProbeVolume.exportFaceData) into its half-float atlas. */
export function writeFaceBuffersToAtlas(target: Uint16Array, counts: VoxelDims, faces: ProbeFaceBuffers): void {
  const rowLength = counts[0] * PROBE_ATLAS_CHANNELS;
  const rows = counts[1] * counts[2];
  for (let face = 0; face < PROBE_ATLAS_FACES; face++) {
    const source = faces[face];
    if (!source) continue;
    for (let row = 0; row < rows; row++) {
      const from = row * rowLength;
      const to = (row * PROBE_ATLAS_FACES + face) * rowLength;
      for (let index = 0; index < rowLength; index++) {
        target[to + index] = toHalfFloat(source[from + index] ?? 0);
      }
    }
  }
}

/**
 * Writes every probe's irradiance cube (`cubeOf(index)`: six faces of RGB, ProbeVolume's layout) into a level's
 * half-float atlas in one pass.
 */
export function packProbeAtlas(target: Uint16Array, counts: VoxelDims, cubeOf: (index: number) => ArrayLike<number>): void {
  if (target.length !== probeAtlasLength(counts)) {
    throw new RangeError('[ProbeVolume Error]: atlas size does not match the probe count');
  }
  const faceStride = counts[0] * PROBE_ATLAS_CHANNELS;
  const probeCount = counts[0] * counts[1] * counts[2];
  for (let index = 0; index < probeCount; index++) {
    const cube = cubeOf(index);
    let texel = probeAtlasOffset(counts, index, 0);
    for (let face = 0; face < PROBE_ATLAS_FACES; face++) {
      const base = face * 3;
      target[texel] = toHalfFloat(cube[base] ?? 0);
      target[texel + 1] = toHalfFloat(cube[base + 1] ?? 0);
      target[texel + 2] = toHalfFloat(cube[base + 2] ?? 0);
      target[texel + 3] = PROBE_ATLAS_ALPHA;
      texel += faceStride;
    }
  }
}

/** An atlas array of `length` from `pool` (removed from it), or a new one; callers hand spent arrays back to the pool. */
export function takeProbeAtlas(pool: Uint16Array[], length: number): Uint16Array {
  const index = pool.findIndex((array) => array.length === length);
  if (index < 0) return new Uint16Array(length);
  const [atlas] = pool.splice(index, 1);
  return atlas ?? new Uint16Array(length);
}
