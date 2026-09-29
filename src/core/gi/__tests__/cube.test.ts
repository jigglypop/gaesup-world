import {
  CUBE_STRIDE,
  accumulateAmbientCube,
  evaluateAmbientCube,
  fibonacciSphereDirection,
} from '../index';
import type { MutableRgb } from '../index';

const SAMPLE_COUNT = 4096;
const ESTIMATOR_SCALE = 4;
const FACES = ['+x', '-x', '+y', '-y', '+z', '-z'];

function project(radiance: (x: number, y: number, z: number) => number): Float64Array {
  const target = new Float64Array(CUBE_STRIDE);
  for (let index = 0; index < SAMPLE_COUNT; index++) {
    const d = fibonacciSphereDirection(index, SAMPLE_COUNT);
    const value = radiance(d.x, d.y, d.z);
    accumulateAmbientCube(target, d.x, d.y, d.z, value, value * 2, value * 3);
  }
  return target.map((value) => (value * ESTIMATOR_SCALE) / SAMPLE_COUNT);
}

function face(cube: Float64Array, index: number, channel: number): number {
  return cube[index * 3 + channel] ?? 0;
}

describe('조도 큐브', () => {
  it('상수 방사휘도는 모든 면에서 같은 조도/PI가 된다', () => {
    const cube = project(() => 0.7);

    FACES.forEach((_, index) => {
      expect(Math.abs(face(cube, index, 0) - 0.7)).toBeLessThan(0.01);
      expect(Math.abs(face(cube, index, 1) - 1.4)).toBeLessThan(0.02);
      expect(Math.abs(face(cube, index, 2) - 2.1)).toBeLessThan(0.03);
    });
  });

  it('위쪽 반구 방사휘도는 위 1, 옆 0.5, 아래 0을 만든다', () => {
    const cube = project((_x, y) => (y >= 0 ? 1 : 0));

    expect(Math.abs(face(cube, 2, 0) - 1)).toBeLessThan(0.01);
    expect(Math.abs(face(cube, 3, 0) - 0)).toBeLessThan(0.01);
    for (const side of [0, 1, 4, 5]) {
      expect(Math.abs(face(cube, side, 0) - 0.5)).toBeLessThan(0.01);
    }
  });

  it('축 방향 법선에서는 저장된 면 값을 정확히 반환한다', () => {
    const cube = new Float64Array(CUBE_STRIDE);
    cube.forEach((_, index) => {
      cube[index] = index + 1;
    });
    const out: MutableRgb = [0, 0, 0];

    evaluateAmbientCube(cube, 0, 0, -1, 0, out);

    expect(out).toEqual([10, 11, 12]);
    evaluateAmbientCube(cube, 0, 1, 0, 0, out);
    expect(out).toEqual([1, 2, 3]);
    evaluateAmbientCube(cube, 0, 0, 0, -1, out);
    expect(out).toEqual([16, 17, 18]);
  });

  it('대각선 법선은 가중 평균이고 법선 길이와 무관하며 범위를 벗어나지 않는다', () => {
    const cube = new Float64Array(CUBE_STRIDE).fill(1);
    cube[0] = 3;
    cube[6] = 5;
    const unit: MutableRgb = [0, 0, 0];
    const scaled: MutableRgb = [0, 0, 0];

    evaluateAmbientCube(cube, 0, Math.SQRT1_2, Math.SQRT1_2, 0, unit);
    evaluateAmbientCube(cube, 0, 4, 4, 0, scaled);

    expect(unit[0]).toBeCloseTo(4, 9);
    expect(scaled[0]).toBeCloseTo(4, 9);
    for (let index = 0; index < 200; index++) {
      const d = fibonacciSphereDirection(index, 200);
      const out: MutableRgb = [0, 0, 0];
      evaluateAmbientCube(cube, 0, d.x, d.y, d.z, out);
      expect(out[0]).toBeGreaterThanOrEqual(1 - 1e-9);
      expect(out[0]).toBeLessThanOrEqual(5 + 1e-9);
    }
  });

  it('영벡터 법선은 0을 반환한다', () => {
    const cube = new Float64Array(CUBE_STRIDE).fill(2);
    const out: MutableRgb = [9, 9, 9];

    evaluateAmbientCube(cube, 0, 0, 0, 0, out);

    expect(out).toEqual([0, 0, 0]);
  });
});
