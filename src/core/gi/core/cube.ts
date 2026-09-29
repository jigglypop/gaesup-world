import type { MutableRgb } from '../types';

export const CUBE_FACE_COUNT = 6;
export const CUBE_CHANNELS = 3;
export const CUBE_STRIDE = CUBE_FACE_COUNT * CUBE_CHANNELS;

const WEIGHT_EPSILON = 1e-12;

/**
 * 면 순서는 +x, -x, +y, -y, +z, -z이며 한 면은 RGB 3개다. 각 면에는 그 축 방향 법선에서의 조도/PI가 저장된다.
 */
function faceOffset(axis: 0 | 1 | 2, component: number): number {
  return (axis * 2 + (component >= 0 ? 0 : 1)) * CUBE_CHANNELS;
}

function addToFace(
  target: Float64Array,
  offset: number,
  weight: number,
  r: number,
  g: number,
  b: number,
): void {
  target[offset] = (target[offset] ?? 0) + r * weight;
  target[offset + 1] = (target[offset + 1] ?? 0) + g * weight;
  target[offset + 2] = (target[offset + 2] ?? 0) + b * weight;
}

/**
 * 방향 (dx, dy, dz)에서 들어온 방사휘도를 큐브 세 면에 코사인 가중으로 누적한다.
 * 구면 균등 표본 N개의 합에 4 / N을 곱하면 각 면의 조도/PI 추정값이 된다.
 */
export function accumulateAmbientCube(
  target: Float64Array,
  dx: number,
  dy: number,
  dz: number,
  r: number,
  g: number,
  b: number,
): void {
  addToFace(target, faceOffset(0, dx), Math.abs(dx), r, g, b);
  addToFace(target, faceOffset(1, dy), Math.abs(dy), r, g, b);
  addToFace(target, faceOffset(2, dz), Math.abs(dz), r, g, b);
}

/**
 * 법선 (nx, ny, nz)의 조도/PI를 n^2 가중 평균으로 복원한다(Valve ambient cube).
 * 가중치가 음수가 될 수 없어 음의 조도나 링잉이 생기지 않고, 축 방향 법선에서는 저장값과 정확히 같다.
 */
export function evaluateAmbientCube(
  values: ArrayLike<number>,
  base: number,
  nx: number,
  ny: number,
  nz: number,
  out: MutableRgb,
): void {
  const wx = nx * nx;
  const wy = ny * ny;
  const wz = nz * nz;
  const sum = wx + wy + wz;
  if (sum < WEIGHT_EPSILON) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return;
  }
  const ox = base + faceOffset(0, nx);
  const oy = base + faceOffset(1, ny);
  const oz = base + faceOffset(2, nz);
  const scale = 1 / sum;
  out[0] = (wx * (values[ox] ?? 0) + wy * (values[oy] ?? 0) + wz * (values[oz] ?? 0)) * scale;
  out[1] =
    (wx * (values[ox + 1] ?? 0) + wy * (values[oy + 1] ?? 0) + wz * (values[oz + 1] ?? 0)) * scale;
  out[2] =
    (wx * (values[ox + 2] ?? 0) + wy * (values[oy + 2] ?? 0) + wz * (values[oz + 2] ?? 0)) * scale;
}
