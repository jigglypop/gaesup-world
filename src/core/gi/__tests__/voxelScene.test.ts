import {
  MAX_MATERIAL_ID,
  alignedProbeLayout,
  computeBoxBounds,
  computeGridSpec,
  createGridForBounds,
  createVoxelGrid,
  expandBounds,
  rebuildVoxelGrid,
  voxelMaterialId,
} from '../index';
import type { VoxelSourceBox } from '../index';

const ZERO = { x: 0, y: 0, z: 0 };

function box(x: number, color: number, emissive?: number): VoxelSourceBox {
  return {
    min: { x, y: 0, z: 0 },
    max: { x: x + 1, y: 1, z: 1 },
    albedo: [color, color, color],
    ...(emissive === undefined ? {} : { emissive: [emissive, emissive, emissive] as const }),
  };
}

describe('복셀 장면 재구성', () => {
  it('같은 색 박스는 팔레트 항목을 공유하고 다른 색은 새 항목을 만든다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 2, 2]);

    rebuildVoxelGrid(grid, [box(0, 0.3), box(1, 0.3), box(2, 0.7), box(3, 0.7, 2)]);

    const ids = [0, 1, 2, 3].map((x) => voxelMaterialId(grid, x, 0, 0));
    expect(ids[0]).toBe(ids[1]);
    expect(ids[2]).not.toBe(ids[0]);
    expect(ids[3]).not.toBe(ids[2]);
    expect(grid.materials[ids[3] ?? 0]?.emissive).toEqual([2, 2, 2]);
    expect(grid.materials.length).toBe(5);
  });

  it('다시 재구성하면 이전 점유와 팔레트를 지운다', () => {
    const grid = createVoxelGrid(ZERO, 1, [8, 2, 2]);
    rebuildVoxelGrid(grid, [box(0, 0.3), box(1, 0.6)]);

    rebuildVoxelGrid(grid, [box(4, 0.9)]);

    expect(voxelMaterialId(grid, 0, 0, 0)).toBe(0);
    expect(voxelMaterialId(grid, 1, 0, 0)).toBe(0);
    expect(voxelMaterialId(grid, 4, 0, 0)).toBe(2);
    expect(grid.materials.length).toBe(3);
  });

  it('겹치는 박스는 나중 박스가 덮어쓴다', () => {
    const grid = createVoxelGrid(ZERO, 1, [4, 2, 2]);

    rebuildVoxelGrid(grid, [box(1, 0.3), box(1, 0.8)]);

    expect(grid.materials[voxelMaterialId(grid, 1, 0, 0)]?.albedo).toEqual([0.8, 0.8, 0.8]);
  });

  it('팔레트가 가득 차면 기본 재질로 대체한다', () => {
    const count = MAX_MATERIAL_ID + 40;
    const grid = createVoxelGrid(ZERO, 1, [count, 2, 2]);
    const boxes = Array.from({ length: count }, (_, index) =>
      box(index, (index + 1) / (count + 2)),
    );

    rebuildVoxelGrid(grid, boxes);

    expect(grid.materials.length).toBe(MAX_MATERIAL_ID + 1);
    expect(voxelMaterialId(grid, count - 1, 0, 0)).toBe(1);
    expect(voxelMaterialId(grid, 0, 0, 0)).toBe(2);
  });

  it('박스 목록의 경계를 계산하고 비어 있으면 null을 반환한다', () => {
    expect(computeBoxBounds([])).toBeNull();
    expect(computeBoxBounds([box(2, 0.5), box(-3, 0.5)])).toEqual({
      min: { x: -3, y: 0, z: 0 },
      max: { x: 3, y: 1, z: 1 },
    });
  });

  it('경계와 여백에 맞는 그리드를 만든다', () => {
    const grid = createGridForBounds(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 8, y: 4, z: 6 } },
      0.5,
      1,
    );

    expect(grid.origin).toEqual({ x: -1, y: -1, z: -1 });
    expect(grid.dims).toEqual([20, 12, 16]);
  });

  it('경계를 step의 배수로 바깥쪽 정렬한다', () => {
    const expanded = expandBounds(
      { min: { x: 1.2, y: -0.5, z: 8 }, max: { x: 9.1, y: 3, z: 15.9 } },
      4,
    );

    expect(expanded).toEqual({
      min: { x: 0, y: -4, z: 8 },
      max: { x: 12, y: 4, z: 16 },
    });
  });

  it('그리드 명세는 경계와 여백으로 원점과 차원을 계산한다', () => {
    const spec = computeGridSpec({ min: { x: 0, y: 0, z: 0 }, max: { x: 8, y: 4, z: 6 } }, 0.5, 1);

    expect(spec.origin).toEqual({ x: -1, y: -1, z: -1 });
    expect(spec.dims).toEqual([20, 12, 16]);
  });

  it('프로브 격자는 월드에 정렬되고 축마다 오프셋만큼 어긋난다', () => {
    const layout = alignedProbeLayout({ min: { x: 0, y: 0, z: 0 }, max: { x: 8, y: 4, z: 6 } }, 2, {
      x: 1,
      y: 0.5,
      z: 1,
    });

    expect(layout.origin).toEqual({ x: 1, y: 0.5, z: 1 });
    expect(layout.counts).toEqual([4, 2, 3]);
  });

  it('경계가 음수 좌표에서 시작해도 경계를 덮는다', () => {
    const layout = alignedProbeLayout(
      { min: { x: -3, y: 0, z: 0 }, max: { x: 5, y: 1, z: 1 } },
      2,
      { x: 1, y: 0.5, z: 1 },
    );

    expect(layout.origin.x).toBe(-3);
    expect(layout.counts[0]).toBe(5);
  });
});
