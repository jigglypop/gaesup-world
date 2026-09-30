import * as THREE from 'three';

import { smoothSeamNormals } from '../normals';

const tilt = (degrees: number) => [Math.sin(THREE.MathUtils.degToRad(degrees)), 0, Math.cos(THREE.MathUtils.degToRad(degrees))];

/** Two triangles split along a UV seam: vertices 1 and 3, 2 and 4 share positions but not UVs or normals. */
function seam(leftDegrees: number, rightDegrees: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0.4, 0, 0, 0.4, 0.6, 0, 0.6, 1, 1, 1], 2));
  const left = tilt(leftDegrees);
  const right = tilt(rightDegrees);
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute([...left, ...left, ...left, ...right, ...right, ...right], 3));
  geometry.setIndex([0, 1, 2, 3, 5, 4]);
  return geometry;
}

const normalOf = (geometry: THREE.BufferGeometry, index: number) =>
  new THREE.Vector3().fromBufferAttribute(geometry.getAttribute('normal'), index);

describe('이음 법선 평활', () => {
  test('crease 각도 안의 이음 법선만 합치고 위상·UV는 그대로 둔다', () => {
    const geometry = seam(-15, 15);
    const index = geometry.index!.array.slice();
    const uv = (geometry.getAttribute('uv').array as Float32Array).slice();
    const normal = geometry.getAttribute('normal');
    expect(smoothSeamNormals(geometry)).toBe(4);
    for (const vertex of [1, 2, 3, 4]) expect(normalOf(geometry, vertex).toArray()).toEqual([expect.closeTo(0, 6), 0, expect.closeTo(1, 6)]);
    expect(normalOf(geometry, 0).x).toBeCloseTo(Math.sin(THREE.MathUtils.degToRad(-15)));
    expect(normalOf(geometry, 5).x).toBeCloseTo(Math.sin(THREE.MathUtils.degToRad(15)));
    expect(geometry.getAttribute('normal')).toBe(normal);
    expect(geometry.index!.array).toEqual(index);
    expect(geometry.getAttribute('uv').array).toEqual(uv);
  });

  test('날카로운 모서리, 다른 스킨, 다른 morph 이동은 나눈 채로 둔다', () => {
    expect(smoothSeamNormals(seam(-50, 50))).toBe(0);
    expect(smoothSeamNormals(seam(-50, 50), { creaseDeg: 120 })).toBe(4);

    const skinned = seam(-15, 15);
    skinned.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
    skinned.setAttribute('skinWeight', new THREE.Float32BufferAttribute(Array.from({ length: 6 }, () => [1, 0, 0, 0]).flat(), 4));
    expect(smoothSeamNormals(skinned)).toBe(0);

    const morphed = seam(-15, 15);
    morphed.morphAttributes.position = [new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3)];
    expect(smoothSeamNormals(morphed)).toBe(0);

    const morphedNormals = seam(-15, 15);
    morphedNormals.morphAttributes.normal = [new THREE.Float32BufferAttribute(new Float32Array(18), 3)];
    expect(smoothSeamNormals(morphedNormals)).toBe(0);
  });

  test('양자화한 법선도 제자리에서 고친다', () => {
    const geometry = seam(-15, 15);
    const quantized = new THREE.Int8BufferAttribute(new Int8Array(18), 3, true);
    const source = geometry.getAttribute('normal');
    for (let i = 0; i < 6; i++) quantized.setXYZ(i, source.getX(i), source.getY(i), source.getZ(i));
    geometry.setAttribute('normal', quantized);
    const version = quantized.version;
    expect(smoothSeamNormals(geometry)).toBe(4);
    expect(quantized.version).toBeGreaterThan(version);
    expect(normalOf(geometry, 1).x).toBeCloseTo(0, 2);
  });
});
