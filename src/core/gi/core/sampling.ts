import type { Vec3 } from '../../grid';
import type { Mat3 } from '../types';

const TWO_PI = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const R2_ALPHA_X = 0.7548776662466927;
const R2_ALPHA_Y = 0.5698402909980532;
const SAMPLE_CENTER = 0.5;

function fract(value: number): number {
  return value - Math.floor(value);
}

/**
 * Roberts R2 저불일치 수열. 프레임마다 index를 바꿔 프로브 레이 방향을 회전시킬 때 쓴다.
 */
export function r2Sample(index: number): readonly [number, number] {
  return [fract(SAMPLE_CENTER + index * R2_ALPHA_X), fract(SAMPLE_CENTER + index * R2_ALPHA_Y)];
}

/**
 * 코사인 가중 반구 샘플(+z 기준). pdf = cos(theta) / PI 이므로 조도 추정량은 L_i 평균에 PI를 곱한 값이다.
 */
export function cosineHemisphereDirection(u1: number, u2: number): Vec3 {
  const radius = Math.sqrt(u1);
  const phi = TWO_PI * u2;
  return {
    x: radius * Math.cos(phi),
    y: radius * Math.sin(phi),
    z: Math.sqrt(Math.max(0, 1 - u1)),
  };
}

/**
 * +z 기준 로컬 방향을 주어진 법선 기준 월드 방향으로 회전한다(Duff et al. 무분기 직교 기저).
 */
export function orientToNormal(local: Vec3, normal: Vec3): Vec3 {
  const sign = normal.z >= 0 ? 1 : -1;
  const a = -1 / (sign + normal.z);
  const b = normal.x * normal.y * a;
  const tangentX = 1 + sign * normal.x * normal.x * a;
  const tangentY = sign * b;
  const tangentZ = -sign * normal.x;
  const bitangentX = b;
  const bitangentY = sign + normal.y * normal.y * a;
  const bitangentZ = -normal.y;
  return {
    x: local.x * tangentX + local.y * bitangentX + local.z * normal.x,
    y: local.x * tangentY + local.y * bitangentY + local.z * normal.y,
    z: local.x * tangentZ + local.y * bitangentZ + local.z * normal.z,
  };
}

/**
 * 균등 분포 회전(Shoemake 쿼터니언)을 3x3 행 우선 행렬로 out에 기록한다.
 * 프로브마다, 프레임마다 레이 분포를 회전시켜 시간에 걸쳐 방향 편향을 상쇄하는 데 쓴다.
 */
export function rotationFromSample(u1: number, u2: number, u3: number, out: Mat3): void {
  const a = Math.sqrt(1 - u1);
  const b = Math.sqrt(u1);
  const x = a * Math.sin(TWO_PI * u2);
  const y = a * Math.cos(TWO_PI * u2);
  const z = b * Math.sin(TWO_PI * u3);
  const w = b * Math.cos(TWO_PI * u3);
  out[0] = 1 - 2 * (y * y + z * z);
  out[1] = 2 * (x * y - z * w);
  out[2] = 2 * (x * z + y * w);
  out[3] = 2 * (x * y + z * w);
  out[4] = 1 - 2 * (x * x + z * z);
  out[5] = 2 * (y * z - x * w);
  out[6] = 2 * (x * z - y * w);
  out[7] = 2 * (y * z + x * w);
  out[8] = 1 - 2 * (x * x + y * y);
}

/**
 * 구면 위 균등 분포 방향. 프로브가 사방으로 쏘는 레이의 기본 분포로 쓴다.
 */
export function fibonacciSphereDirection(index: number, count: number): Vec3 {
  const z = 1 - (2 * (index + SAMPLE_CENTER)) / count;
  const radius = Math.sqrt(Math.max(0, 1 - z * z));
  const phi = index * GOLDEN_ANGLE;
  return { x: radius * Math.cos(phi), y: radius * Math.sin(phi), z };
}
