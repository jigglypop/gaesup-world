import type { MutableRgb, ProbeVolumeConfig } from '../types';
import { CUBE_STRIDE, evaluateAmbientCube } from './cube';

export type ProbeFieldSource = {
  readonly config: ProbeVolumeConfig;
  readonly cube: Float32Array;
  readonly valid: Uint8Array;
};

export const BACKFACE_FLOOR = 0.2;
export const FEED_BACKFACE_FLOOR = 0.02;
const HALF = 0.5;
const WEIGHT_EPSILON = 1e-6;
const DISTANCE_EPSILON = 1e-6;

function cellFloor(coordinate: number, count: number): number {
  return count <= 1 ? 0 : Math.min(Math.max(Math.floor(coordinate), 0), count - 2);
}

function cellFraction(coordinate: number, cell: number, count: number): number {
  return count <= 1 ? 0 : Math.min(Math.max(coordinate - cell, 0), 1);
}

/**
 * 프로브 격자에서 위치 (px, py, pz)와 법선 (nx, ny, nz)의 조도/PI를 구한다.
 * 유효한 이웃 프로브 8개를 삼선형 가중치에 뒤쪽 프로브 감쇠(DDGI 방식)를 곱해 평균한다.
 * backfaceFloor가 작을수록 표면 뒤쪽 프로브를 강하게 배제해 얇은 벽 너머의 빛 새기가 줄어든다.
 */
export function sampleProbeField(
  field: ProbeFieldSource,
  px: number,
  py: number,
  pz: number,
  nx: number,
  ny: number,
  nz: number,
  out: MutableRgb,
  backfaceFloor: number,
  corner: MutableRgb,
): void {
  const { origin, spacing, counts } = field.config;
  const gx = (px - origin.x) / spacing;
  const gy = (py - origin.y) / spacing;
  const gz = (pz - origin.z) / spacing;
  const x0 = cellFloor(gx, counts[0]);
  const y0 = cellFloor(gy, counts[1]);
  const z0 = cellFloor(gz, counts[2]);
  const tx = cellFraction(gx, x0, counts[0]);
  const ty = cellFraction(gy, y0, counts[1]);
  const tz = cellFraction(gz, z0, counts[2]);
  let red = 0;
  let green = 0;
  let blue = 0;
  let weightSum = 0;
  for (let index8 = 0; index8 < 8; index8++) {
    const cx = index8 & 1;
    const cy = (index8 >> 1) & 1;
    const cz = (index8 >> 2) & 1;
    const ix = Math.min(x0 + cx, counts[0] - 1);
    const iy = Math.min(y0 + cy, counts[1] - 1);
    const iz = Math.min(z0 + cz, counts[2] - 1);
    const index = ix + counts[0] * (iy + counts[1] * iz);
    if (field.valid[index] !== 1) continue;
    let weight = (cx === 1 ? tx : 1 - tx) * (cy === 1 ? ty : 1 - ty) * (cz === 1 ? tz : 1 - tz);
    if (weight <= 0) continue;
    const vx = origin.x + ix * spacing - px;
    const vy = origin.y + iy * spacing - py;
    const vz = origin.z + iz * spacing - pz;
    const distance = Math.hypot(vx, vy, vz);
    if (distance > DISTANCE_EPSILON) {
      const facing = (HALF * (distance + vx * nx + vy * ny + vz * nz)) / distance;
      weight *= facing * facing + backfaceFloor;
    }
    evaluateAmbientCube(field.cube, index * CUBE_STRIDE, nx, ny, nz, corner);
    red += weight * corner[0];
    green += weight * corner[1];
    blue += weight * corner[2];
    weightSum += weight;
  }
  if (weightSum < WEIGHT_EPSILON) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return;
  }
  const inverse = 1 / weightSum;
  out[0] = red * inverse;
  out[1] = green * inverse;
  out[2] = blue * inverse;
}
