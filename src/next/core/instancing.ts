import { TransformStore } from './TransformStore';

const POSITION_STRIDE = 3;
const ROTATION_STRIDE = 4;
const SCALE_STRIDE = 3;

export const MATRIX_STRIDE = 16;

export function composeTrsMatrix(
  store: TransformStore,
  index: number,
  out: Float32Array,
  outOffset: number,
): Float32Array {
  const positionOffset = index * POSITION_STRIDE;
  const rotationOffset = index * ROTATION_STRIDE;
  const scaleOffset = index * SCALE_STRIDE;
  const tx = store.positions[positionOffset] ?? 0;
  const ty = store.positions[positionOffset + 1] ?? 0;
  const tz = store.positions[positionOffset + 2] ?? 0;
  const qx = store.rotations[rotationOffset] ?? 0;
  const qy = store.rotations[rotationOffset + 1] ?? 0;
  const qz = store.rotations[rotationOffset + 2] ?? 0;
  const qw = store.rotations[rotationOffset + 3] ?? 1;
  const sx = store.scales[scaleOffset] ?? 1;
  const sy = store.scales[scaleOffset + 1] ?? 1;
  const sz = store.scales[scaleOffset + 2] ?? 1;
  const xx = qx * qx;
  const yy = qy * qy;
  const zz = qz * qz;
  const xy = qx * qy;
  const xz = qx * qz;
  const yz = qy * qz;
  const wx = qw * qx;
  const wy = qw * qy;
  const wz = qw * qz;
  out[outOffset] = (1 - 2 * (yy + zz)) * sx;
  out[outOffset + 1] = 2 * (xy + wz) * sx;
  out[outOffset + 2] = 2 * (xz - wy) * sx;
  out[outOffset + 3] = 0;
  out[outOffset + 4] = 2 * (xy - wz) * sy;
  out[outOffset + 5] = (1 - 2 * (xx + zz)) * sy;
  out[outOffset + 6] = 2 * (yz + wx) * sy;
  out[outOffset + 7] = 0;
  out[outOffset + 8] = 2 * (xz + wy) * sz;
  out[outOffset + 9] = 2 * (yz - wx) * sz;
  out[outOffset + 10] = (1 - 2 * (xx + yy)) * sz;
  out[outOffset + 11] = 0;
  out[outOffset + 12] = tx;
  out[outOffset + 13] = ty;
  out[outOffset + 14] = tz;
  out[outOffset + 15] = 1;
  return out;
}

export function packInstanceMatrices(
  store: TransformStore,
  indices: Uint32Array,
  count: number,
  out: Float32Array,
): Float32Array {
  for (let slot = 0; slot < count; slot += 1) {
    const index = indices[slot] ?? 0;
    composeTrsMatrix(store, index, out, slot * MATRIX_STRIDE);
  }
  return out;
}
