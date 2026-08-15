import { entityIndexOf, NextWorld } from '../core/World';
import {
  compactVisible,
  cullSpheres,
  extractFrustumPlanes,
  FRUSTUM_PLANES_LENGTH,
} from '../core/culling';
import { composeTrsMatrix, MATRIX_STRIDE, packInstanceMatrices } from '../core/instancing';

const IDENTITY_VP = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const HALF_SQRT2 = Math.SQRT1_2;

describe('instancing', () => {
  test('기본 트랜스폼은 항등 행렬로 합성된다', () => {
    const world = new NextWorld();
    const index = entityIndexOf(world.createEntity());
    const out = new Float32Array(MATRIX_STRIDE);
    composeTrsMatrix(world.transforms, index, out, 0);
    expect([...out]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  test('이동은 열우선 행렬의 12-14 슬롯에 기록된다', () => {
    const world = new NextWorld();
    const index = entityIndexOf(world.createEntity());
    world.transforms.setPosition(index, 3, -4, 5);
    const out = new Float32Array(MATRIX_STRIDE);
    composeTrsMatrix(world.transforms, index, out, 0);
    expect([out[12], out[13], out[14]]).toEqual([3, -4, 5]);
  });

  test('Y축 90도 회전은 X축을 -Z 방향으로 보낸다', () => {
    const world = new NextWorld();
    const index = entityIndexOf(world.createEntity());
    world.transforms.setRotation(index, 0, HALF_SQRT2, 0, HALF_SQRT2);
    const out = new Float32Array(MATRIX_STRIDE);
    composeTrsMatrix(world.transforms, index, out, 0);
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[1]).toBeCloseTo(0, 5);
    expect(out[2]).toBeCloseTo(-1, 5);
    expect(out[8]).toBeCloseTo(1, 5);
    expect(out[10]).toBeCloseTo(0, 5);
  });

  test('스케일은 각 축 열에 곱해진다', () => {
    const world = new NextWorld();
    const index = entityIndexOf(world.createEntity());
    world.transforms.setScale(index, 2, 3, 4);
    const out = new Float32Array(MATRIX_STRIDE);
    composeTrsMatrix(world.transforms, index, out, 0);
    expect([out[0], out[5], out[10]]).toEqual([2, 3, 4]);
  });

  test('compactVisible은 가시 인덱스만 순서대로 압축한다', () => {
    const visibility = new Uint8Array([1, 0, 0, 1, 1]);
    const outIndices = new Uint32Array(5);
    const count = compactVisible(visibility, 5, outIndices);
    expect(count).toBe(3);
    expect([outIndices[0], outIndices[1], outIndices[2]]).toEqual([0, 3, 4]);
  });

  test('컬링-압축-패킹 파이프라인이 가시 인스턴스 행렬만 만든다', () => {
    const world = new NextWorld();
    const inside = entityIndexOf(world.createEntity());
    const outside = entityIndexOf(world.createEntity());
    world.transforms.setPosition(inside, 0.5, 0, 0);
    world.transforms.setPosition(outside, 50, 0, 0);
    const count = world.entityCount;
    const planes = extractFrustumPlanes(IDENTITY_VP, new Float32Array(FRUSTUM_PLANES_LENGTH));
    const visibility = new Uint8Array(count);
    cullSpheres(planes, world.transforms.positions, 0.1, count, visibility);
    const indices = new Uint32Array(count);
    const visibleCount = compactVisible(visibility, count, indices);
    expect(visibleCount).toBe(1);
    const matrices = new Float32Array(visibleCount * MATRIX_STRIDE);
    packInstanceMatrices(world.transforms, indices, visibleCount, matrices);
    expect(matrices[12]).toBeCloseTo(0.5, 5);
  });
});
