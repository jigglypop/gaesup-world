import * as THREE from 'three';

import { cullSpheres, extractFrustumPlanes, FRUSTUM_PLANES_LENGTH } from '../core/culling';

const IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

describe('culling', () => {
  test.each([
    [THREE.WebGLCoordinateSystem, false],
    [THREE.WebGPUCoordinateSystem, false],
    [THREE.WebGPUCoordinateSystem, true],
  ] as const)('culls near and far bounds for coordinate system %i with reversed depth %s', (coordinateSystem, reversedDepth) => {
    const projection = new THREE.Matrix4().makePerspective(-10, 10, 10, -10, 10, 100, coordinateSystem, reversedDepth);
    const planes = extractFrustumPlanes(new Float32Array(projection.elements), new Float32Array(FRUSTUM_PLANES_LENGTH), coordinateSystem === THREE.WebGPUCoordinateSystem || reversedDepth);
    const positions = new Float32Array([0, 0, -7, 0, 0, -20, 0, 0, -110, 0, 0, 20]);
    const visibility = new Uint8Array(4);
    expect(cullSpheres(planes, positions, 1, 4, visibility)).toBe(1);
    expect([...visibility]).toEqual([0, 1, 0, 0]);
  });

  test('항등 행렬 프러스텀은 단위 큐브 내부만 통과시킨다', () => {
    const planes = extractFrustumPlanes(IDENTITY, new Float32Array(FRUSTUM_PLANES_LENGTH));
    const positions = new Float32Array([0, 0, 0, 5, 0, 0, 0, -5, 0, 0.9, 0.9, 0.9]);
    const visibility = new Uint8Array(4);
    const visibleCount = cullSpheres(planes, positions, 0.01, 4, visibility);
    expect(visibleCount).toBe(2);
    expect([...visibility]).toEqual([1, 0, 0, 1]);
  });

  test('경계 밖이라도 반지름이 걸치면 보이는 것으로 판정한다', () => {
    const planes = extractFrustumPlanes(IDENTITY, new Float32Array(FRUSTUM_PLANES_LENGTH));
    const positions = new Float32Array([1.4, 0, 0]);
    const visibility = new Uint8Array(1);
    expect(cullSpheres(planes, positions, 0.5, 1, visibility)).toBe(1);
    expect(cullSpheres(planes, positions, 0.1, 1, visibility)).toBe(0);
  });

  test('평면은 정규화되어 거리 비교가 반지름 단위와 일치한다', () => {
    const planes = extractFrustumPlanes(IDENTITY, new Float32Array(FRUSTUM_PLANES_LENGTH));
    for (let plane = 0; plane < 6; plane += 1) {
      const offset = plane * 4;
      const length = Math.hypot(
        planes[offset] ?? 0,
        planes[offset + 1] ?? 0,
        planes[offset + 2] ?? 0,
      );
      expect(length).toBeCloseTo(1, 5);
    }
  });

  test('만 개 인스턴스 컬링이 할당 없이 가시 개수를 반환한다', () => {
    const planes = extractFrustumPlanes(IDENTITY, new Float32Array(FRUSTUM_PLANES_LENGTH));
    const count = 10000;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset] = index % 2 === 0 ? 0 : 100;
      positions[offset + 1] = 0;
      positions[offset + 2] = 0;
    }
    const visibility = new Uint8Array(count);
    expect(cullSpheres(planes, positions, 0.1, count, visibility)).toBe(count / 2);
  });
});
