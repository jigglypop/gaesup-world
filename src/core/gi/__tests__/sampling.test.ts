import {
  cosineHemisphereDirection,
  fibonacciSphereDirection,
  orientToNormal,
  r2Sample,
  rotationFromSample,
} from '../index';
import type { Mat3 } from '../index';

const SAMPLE_COUNT = 4096;
const MEAN_COSINE = 2 / 3;

function dot(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(a: { x: number; y: number; z: number }) {
  return Math.hypot(a.x, a.y, a.z);
}

describe('샘플링', () => {
  it('R2 수열은 [0, 1) 범위를 벗어나지 않는다', () => {
    for (let index = 0; index < 1000; index++) {
      const [u1, u2] = r2Sample(index);
      expect(u1).toBeGreaterThanOrEqual(0);
      expect(u1).toBeLessThan(1);
      expect(u2).toBeGreaterThanOrEqual(0);
      expect(u2).toBeLessThan(1);
    }
  });

  it('코사인 반구 샘플은 단위 길이이고 z가 음수가 아니다', () => {
    for (let index = 0; index < 256; index++) {
      const [u1, u2] = r2Sample(index);
      const direction = cosineHemisphereDirection(u1, u2);
      expect(length(direction)).toBeCloseTo(1, 9);
      expect(direction.z).toBeGreaterThanOrEqual(0);
    }
  });

  it('코사인 가중 샘플의 cos 평균은 2/3에 수렴한다', () => {
    let sum = 0;
    for (let index = 0; index < SAMPLE_COUNT; index++) {
      const [u1, u2] = r2Sample(index);
      sum += cosineHemisphereDirection(u1, u2).z;
    }

    expect(Math.abs(sum / SAMPLE_COUNT - MEAN_COSINE)).toBeLessThan(0.02);
  });

  it('법선 정렬은 길이를 보존하고 로컬 z를 법선 방향 성분으로 옮긴다', () => {
    const inv = 1 / Math.sqrt(3);
    const normals = [
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: inv, y: inv, z: inv },
      { x: -inv, y: inv, z: -inv },
    ];

    for (const normal of normals) {
      for (let index = 0; index < 32; index++) {
        const [u1, u2] = r2Sample(index);
        const local = cosineHemisphereDirection(u1, u2);
        const world = orientToNormal(local, normal);
        expect(length(world)).toBeCloseTo(1, 9);
        expect(dot(world, normal)).toBeCloseTo(local.z, 9);
      }
    }
  });

  it('법선 정렬은 서로 직교하는 기저를 만든다', () => {
    const inv = 1 / Math.sqrt(3);
    const normal = { x: inv, y: -inv, z: inv };
    const axisX = orientToNormal({ x: 1, y: 0, z: 0 }, normal);
    const axisY = orientToNormal({ x: 0, y: 1, z: 0 }, normal);
    const axisZ = orientToNormal({ x: 0, y: 0, z: 1 }, normal);

    expect(dot(axisX, axisY)).toBeCloseTo(0, 9);
    expect(dot(axisX, axisZ)).toBeCloseTo(0, 9);
    expect(dot(axisY, axisZ)).toBeCloseTo(0, 9);
    expect(axisZ.x).toBeCloseTo(normal.x, 9);
    expect(axisZ.y).toBeCloseTo(normal.y, 9);
    expect(axisZ.z).toBeCloseTo(normal.z, 9);
  });

  it('무작위 회전 행렬은 직교하고 행렬식이 1이다', () => {
    const m: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    for (let index = 0; index < 64; index++) {
      const [u1, u2] = r2Sample(index);
      rotationFromSample(u1, u2, (index * 0.618) % 1, m);
      const rows = [
        { x: m[0], y: m[1], z: m[2] },
        { x: m[3], y: m[4], z: m[5] },
        { x: m[6], y: m[7], z: m[8] },
      ];
      expect(dot(rows[0]!, rows[0]!)).toBeCloseTo(1, 9);
      expect(dot(rows[1]!, rows[1]!)).toBeCloseTo(1, 9);
      expect(dot(rows[0]!, rows[1]!)).toBeCloseTo(0, 9);
      expect(dot(rows[0]!, rows[2]!)).toBeCloseTo(0, 9);
      const determinant =
        m[0] * (m[4] * m[8] - m[5] * m[7]) -
        m[1] * (m[3] * m[8] - m[5] * m[6]) +
        m[2] * (m[3] * m[7] - m[4] * m[6]);
      expect(determinant).toBeCloseTo(1, 9);
    }
  });

  it('피보나치 구면 방향은 단위 길이이고 양 극에서 시작해 끝난다', () => {
    const count = 100;

    for (let index = 0; index < count; index++) {
      expect(length(fibonacciSphereDirection(index, count))).toBeCloseTo(1, 9);
    }
    expect(fibonacciSphereDirection(0, count).z).toBeCloseTo(0.99, 9);
    expect(fibonacciSphereDirection(count - 1, count).z).toBeCloseTo(-0.99, 9);
  });

  it('피보나치 구면 방향의 평균은 원점에 가깝다', () => {
    const count = 1024;
    let x = 0;
    let y = 0;
    let z = 0;
    for (let index = 0; index < count; index++) {
      const direction = fibonacciSphereDirection(index, count);
      x += direction.x;
      y += direction.y;
      z += direction.z;
    }

    expect(Math.hypot(x, y, z) / count).toBeLessThan(0.05);
  });
});
