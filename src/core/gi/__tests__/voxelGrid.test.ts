import {
  clearVoxelGrid,
  createVoxelGrid,
  fillVoxelBox,
  isInsideVoxelGrid,
  isVoxelOccupied,
  voxelIndex,
} from '../index';

const ZERO = { x: 0, y: 0, z: 0 };

function countOccupied(occupancy: Uint8Array): number {
  return occupancy.reduce((sum, value) => sum + value, 0);
}

describe('복셀 그리드', () => {
  it('유효하지 않은 크기와 차원은 예외를 던진다', () => {
    expect(() => createVoxelGrid(ZERO, 0, [2, 2, 2])).toThrow('[VoxelGrid Error]');
    expect(() => createVoxelGrid(ZERO, NaN, [2, 2, 2])).toThrow('[VoxelGrid Error]');
    expect(() => createVoxelGrid(ZERO, 1, [0, 2, 2])).toThrow('[VoxelGrid Error]');
    expect(() => createVoxelGrid(ZERO, 1, [1.5, 2, 2])).toThrow('[VoxelGrid Error]');
    expect(() => createVoxelGrid({ x: Infinity, y: 0, z: 0 }, 1, [2, 2, 2])).toThrow(
      '[VoxelGrid Error]',
    );
  });

  it('복셀 인덱스는 x가 가장 빠르고 그다음 y, z 순서다', () => {
    const grid = createVoxelGrid(ZERO, 1, [4, 3, 2]);

    expect(voxelIndex(grid, 0, 0, 0)).toBe(0);
    expect(voxelIndex(grid, 1, 0, 0)).toBe(1);
    expect(voxelIndex(grid, 0, 1, 0)).toBe(4);
    expect(voxelIndex(grid, 0, 0, 1)).toBe(12);
    expect(grid.occupancy.length).toBe(24);
  });

  it('AABB와 겹치는 복셀만 채운다', () => {
    const grid = createVoxelGrid(ZERO, 1, [4, 4, 4]);

    fillVoxelBox(grid, { min: { x: 1, y: 0, z: 1 }, max: { x: 3, y: 1, z: 2 } });

    expect(isVoxelOccupied(grid, 1, 0, 1)).toBe(true);
    expect(isVoxelOccupied(grid, 2, 0, 1)).toBe(true);
    expect(isVoxelOccupied(grid, 3, 0, 1)).toBe(false);
    expect(isVoxelOccupied(grid, 1, 1, 1)).toBe(false);
    expect(isVoxelOccupied(grid, 1, 0, 2)).toBe(false);
    expect(countOccupied(grid.occupancy)).toBe(2);
  });

  it('그리드 밖으로 나간 영역은 잘라내고 완전히 밖이면 무시한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [4, 4, 4]);

    fillVoxelBox(grid, { min: { x: -5, y: 0, z: 0 }, max: { x: 1.5, y: 1, z: 1 } });
    expect(countOccupied(grid.occupancy)).toBe(2);

    clearVoxelGrid(grid);
    fillVoxelBox(grid, { min: { x: 10, y: 0, z: 0 }, max: { x: 12, y: 1, z: 1 } });
    fillVoxelBox(grid, { min: { x: -3, y: 0, z: 0 }, max: { x: -1, y: 1, z: 1 } });
    expect(countOccupied(grid.occupancy)).toBe(0);
  });

  it('복셀보다 얇거나 두께가 없는 박스도 최소 한 복셀을 채운다', () => {
    const grid = createVoxelGrid(ZERO, 1, [4, 4, 4]);

    fillVoxelBox(grid, { min: { x: 1.2, y: 0, z: 0 }, max: { x: 1.4, y: 1, z: 1 } });
    expect(isVoxelOccupied(grid, 1, 0, 0)).toBe(true);
    expect(countOccupied(grid.occupancy)).toBe(1);

    clearVoxelGrid(grid);
    fillVoxelBox(grid, { min: { x: 2, y: 0.5, z: 0.5 }, max: { x: 2, y: 0.5, z: 0.5 } });
    expect(isVoxelOccupied(grid, 2, 0, 0)).toBe(true);
    expect(countOccupied(grid.occupancy)).toBe(1);
  });

  it('원점과 복셀 크기를 반영해 월드 좌표를 복셀로 변환한다', () => {
    const grid = createVoxelGrid({ x: -2, y: 0, z: -2 }, 0.5, [8, 2, 8]);

    fillVoxelBox(grid, { min: { x: -1, y: 0, z: -1 }, max: { x: -0.5, y: 0.5, z: -0.5 } });

    expect(isVoxelOccupied(grid, 2, 0, 2)).toBe(true);
    expect(isVoxelOccupied(grid, 3, 0, 2)).toBe(false);
    expect(countOccupied(grid.occupancy)).toBe(1);
  });

  it('범위 밖 좌표는 점유되지 않은 것으로 취급한다', () => {
    const grid = createVoxelGrid(ZERO, 1, [2, 2, 2]);

    fillVoxelBox(grid, { min: ZERO, max: { x: 2, y: 2, z: 2 } });

    expect(isInsideVoxelGrid(grid, -1, 0, 0)).toBe(false);
    expect(isInsideVoxelGrid(grid, 2, 0, 0)).toBe(false);
    expect(isVoxelOccupied(grid, -1, 0, 0)).toBe(false);
    expect(isVoxelOccupied(grid, 2, 1, 1)).toBe(false);
    expect(isVoxelOccupied(grid, 1, 1, 1)).toBe(true);
  });

  it('비우기는 모든 점유를 지운다', () => {
    const grid = createVoxelGrid(ZERO, 1, [3, 3, 3]);
    fillVoxelBox(grid, { min: ZERO, max: { x: 3, y: 3, z: 3 } });

    clearVoxelGrid(grid);

    expect(countOccupied(grid.occupancy)).toBe(0);
  });
});
