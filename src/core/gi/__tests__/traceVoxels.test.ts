import { createVoxelGrid, fillVoxelBox, isVoxelOccupied, traceVoxelRay } from '../index';
import type { VoxelGrid } from '../index';

const ZERO = { x: 0, y: 0, z: 0 };
const MAX_DISTANCE = 100;
const RANDOM_SEED = 20260929;
const RAY_COUNT = 3000;
const MARCH_STEP = 0.004;
const FLOAT_SLACK = 1e-9;
const CONTAINMENT_SLACK = 1e-6;

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function marchFirstHit(
  grid: VoxelGrid,
  origin: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number },
  maxDistance: number,
): number | null {
  const { origin: base, voxelSize } = grid;
  for (let t = 0; t <= maxDistance; t += MARCH_STEP) {
    const x = Math.floor((origin.x + direction.x * t - base.x) / voxelSize);
    const y = Math.floor((origin.y + direction.y * t - base.y) / voxelSize);
    const z = Math.floor((origin.z + direction.z * t - base.z) / voxelSize);
    if (isVoxelOccupied(grid, x, y, z)) return t;
  }
  return null;
}

function createWallGrid(): VoxelGrid {
  const grid = createVoxelGrid(ZERO, 1, [8, 8, 8]);
  fillVoxelBox(grid, { min: { x: 4, y: 0, z: 0 }, max: { x: 5, y: 8, z: 8 } });
  return grid;
}

describe('복셀 DDA 레이 트레이스', () => {
  it('벽에 닿는 거리와 진입 면 법선을 반환한다', () => {
    const hit = traceVoxelRay(
      createWallGrid(),
      { x: 0.5, y: 3.5, z: 3.5 },
      { x: 1, y: 0, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit).not.toBeNull();
    expect(hit?.distance).toBeCloseTo(3.5, 9);
    expect(hit?.voxel).toEqual([4, 3, 3]);
    expect(hit?.normal.x).toBeCloseTo(-1, 9);
    expect(hit?.normal.y).toBeCloseTo(0, 9);
    expect(hit?.normal.z).toBeCloseTo(0, 9);
  });

  it('방향 벡터가 정규화되지 않아도 월드 단위 거리를 반환한다', () => {
    const hit = traceVoxelRay(
      createWallGrid(),
      { x: 0.5, y: 3.5, z: 3.5 },
      { x: 5, y: 0, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit?.distance).toBeCloseTo(3.5, 9);
  });

  it('점유 복셀이 없는 방향은 null을 반환한다', () => {
    const hit = traceVoxelRay(
      createWallGrid(),
      { x: 0.5, y: 3.5, z: 3.5 },
      { x: -1, y: 0, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit).toBeNull();
  });

  it('최대 거리 안에 벽이 없으면 null을 반환한다', () => {
    const grid = createWallGrid();
    const origin = { x: 0.5, y: 3.5, z: 3.5 };
    const direction = { x: 1, y: 0, z: 0 };

    expect(traceVoxelRay(grid, origin, direction, 3)).toBeNull();
    expect(traceVoxelRay(grid, origin, direction, 3.6)?.distance).toBeCloseTo(3.5, 9);
  });

  it('그리드 밖에서 시작한 레이는 경계 진입 거리를 더해 계산한다', () => {
    const hit = traceVoxelRay(
      createWallGrid(),
      { x: -3, y: 3.5, z: 3.5 },
      { x: 1, y: 0, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit?.distance).toBeCloseTo(7, 9);
    expect(hit?.voxel).toEqual([4, 3, 3]);
    expect(hit?.normal.x).toBeCloseTo(-1, 9);
  });

  it('그리드를 비켜가는 레이는 null을 반환한다', () => {
    const grid = createWallGrid();

    expect(
      traceVoxelRay(grid, { x: -3, y: 20, z: 3.5 }, { x: 1, y: 0, z: 0 }, MAX_DISTANCE),
    ).toBeNull();
    expect(
      traceVoxelRay(grid, { x: -3, y: 3.5, z: 3.5 }, { x: -1, y: 0, z: 0 }, MAX_DISTANCE),
    ).toBeNull();
  });

  it('시작점이 점유 복셀 안이면 거리 0을 반환한다', () => {
    const hit = traceVoxelRay(
      createWallGrid(),
      { x: 4.5, y: 3.5, z: 3.5 },
      { x: 0, y: 1, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit?.distance).toBe(0);
    expect(hit?.voxel).toEqual([4, 3, 3]);
    expect(hit?.normal.y).toBeCloseTo(-1, 9);
  });

  it('영벡터 방향이나 0 이하의 최대 거리는 null을 반환한다', () => {
    const grid = createWallGrid();
    const origin = { x: 0.5, y: 3.5, z: 3.5 };

    expect(traceVoxelRay(grid, origin, ZERO, MAX_DISTANCE)).toBeNull();
    expect(traceVoxelRay(grid, origin, { x: 1, y: 0, z: 0 }, 0)).toBeNull();
  });

  it('여러 점유 복셀 중 가장 가까운 것을 반환한다', () => {
    const grid = createWallGrid();
    fillVoxelBox(grid, { min: { x: 2, y: 3, z: 3 }, max: { x: 3, y: 4, z: 4 } });

    const hit = traceVoxelRay(grid, { x: 0.5, y: 3.5, z: 3.5 }, { x: 1, y: 0, z: 0 }, MAX_DISTANCE);

    expect(hit?.distance).toBeCloseTo(1.5, 9);
    expect(hit?.voxel).toEqual([2, 3, 3]);
  });

  it('바닥을 향한 레이는 윗면 높이와 위쪽 법선을 반환한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 8, 8]);
    fillVoxelBox(grid, { min: ZERO, max: { x: 8, y: 1, z: 8 } });

    const hit = traceVoxelRay(
      grid,
      { x: 3.5, y: 4.5, z: 3.5 },
      { x: 0, y: -1, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit?.distance).toBeCloseTo(3.5, 9);
    expect(hit?.voxel).toEqual([3, 0, 3]);
    expect(hit?.normal.y).toBeCloseTo(1, 9);
  });

  it('대각선 레이도 벽까지의 유클리드 거리를 반환한다', () => {
    const hit = traceVoxelRay(
      createWallGrid(),
      { x: 0.5, y: 0.5, z: 0.5 },
      { x: 1, y: 1, z: 0 },
      MAX_DISTANCE,
    );

    expect(hit?.distance).toBeCloseTo(3.5 * Math.SQRT2, 6);
    expect(hit?.normal.x).toBeCloseTo(-1, 9);
  });

  it('무작위 레이의 결과가 촘촘한 레이 마칭과 일치한다', () => {
    const random = createRandom(RANDOM_SEED);
    const grid = createVoxelGrid({ x: -1.5, y: 0.25, z: 2 }, 0.75, [10, 8, 12]);
    for (let index = 0; index < 40; index++) {
      const min = {
        x: -1.5 + random() * 7,
        y: 0.25 + random() * 5,
        z: 2 + random() * 8,
      };
      fillVoxelBox(grid, {
        min,
        max: { x: min.x + random() * 1.5, y: min.y + random() * 1.5, z: min.z + random() * 1.5 },
      });
    }

    let hitCount = 0;
    for (let index = 0; index < RAY_COUNT; index++) {
      const origin = {
        x: -6 + random() * 18,
        y: -4 + random() * 14,
        z: -3 + random() * 22,
      };
      const raw = { x: random() - 0.5, y: random() - 0.5, z: random() - 0.5 };
      const length = Math.hypot(raw.x, raw.y, raw.z);
      const direction = { x: raw.x / length, y: raw.y / length, z: raw.z / length };
      const maxDistance = 4 + random() * 20;

      const hit = traceVoxelRay(grid, origin, direction, maxDistance);
      const marched = marchFirstHit(grid, origin, direction, maxDistance);

      if (marched !== null) {
        expect(hit).not.toBeNull();
        const distance = hit?.distance ?? Infinity;
        expect(distance).toBeLessThanOrEqual(marched + FLOAT_SLACK);
        expect(distance).toBeGreaterThanOrEqual(marched - MARCH_STEP - FLOAT_SLACK);
      }
      if (hit) {
        hitCount++;
        const probe = hit.distance + CONTAINMENT_SLACK;
        const voxelSize = grid.voxelSize;
        const inside = [
          origin.x + direction.x * probe,
          origin.y + direction.y * probe,
          origin.z + direction.z * probe,
        ].map((value, axis) => {
          const base = [grid.origin.x, grid.origin.y, grid.origin.z][axis] ?? 0;
          return (value - base) / voxelSize;
        });
        hit.voxel.forEach((cell, axis) => {
          const local = inside[axis] ?? Infinity;
          expect(local).toBeGreaterThanOrEqual(cell - CONTAINMENT_SLACK);
          expect(local).toBeLessThanOrEqual(cell + 1 + CONTAINMENT_SLACK);
        });
      }
    }

    expect(hitCount).toBeGreaterThan(RAY_COUNT / 20);
  });
});
