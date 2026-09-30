import type {
  BuildingBlockConfig,
  MeshConfig,
  PlacedObject,
  TileGroupConfig,
  WallConfig,
  WallGroupConfig,
} from '../../../building/types';
import { buildingToVoxelBoxes, wallPieces } from '../buildingVoxelBoxes';
import type { BuildingVoxelSource } from '../types';

const WHITE: MeshConfig = { id: 'white', color: '#ffffff' };
const GLASS: MeshConfig = { id: 'glass', color: '#9ed8ff', material: 'GLASS' };

function createSource(overrides: Partial<BuildingVoxelSource> = {}): BuildingVoxelSource {
  return {
    meshes: new Map([
      [WHITE.id, WHITE],
      [GLASS.id, GLASS],
    ]),
    tileGroups: new Map(),
    wallGroups: new Map(),
    blocks: [],
    objects: [],
    ...overrides,
  };
}

function tileGroup(size: number | undefined, meshId = 'white'): TileGroupConfig {
  return {
    id: 'floor',
    name: '바닥',
    floorMeshId: meshId,
    tiles: [
      {
        id: 'tile',
        tileGroupId: 'floor',
        position: { x: 0, y: 0, z: 0 },
        ...(size === undefined ? {} : { size }),
      },
    ],
  };
}

function wallSource(
  wall: Partial<WallConfig>,
  group: Partial<WallGroupConfig> = {},
): BuildingVoxelSource {
  const walls: WallConfig[] = [
    {
      id: 'wall',
      wallGroupId: 'walls',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      ...wall,
    },
  ];
  return createSource({
    wallGroups: new Map([
      ['walls', { id: 'walls', name: '벽', frontMeshId: 'white', walls, ...group }],
    ]),
  });
}

describe('건축 상태의 복셀 박스 변환', () => {
  it('타일은 4m 격자 크기에 1m 두께의 박스가 된다', () => {
    const boxes = buildingToVoxelBoxes(
      createSource({ tileGroups: new Map([['floor', tileGroup(undefined)]]) }),
    );

    expect(boxes.length).toBe(1);
    expect(boxes[0]?.min).toEqual({ x: -2, y: 0, z: -2 });
    expect(boxes[0]?.max).toEqual({ x: 2, y: 1, z: 2 });
    expect(boxes[0]?.albedo).toEqual([1, 1, 1]);
  });

  it('타일 크기 배수만큼 넓어지고 유리 재질 타일은 빛을 막지 않는다', () => {
    const large = buildingToVoxelBoxes(
      createSource({ tileGroups: new Map([['floor', tileGroup(2)]]) }),
    );
    const glass = buildingToVoxelBoxes(
      createSource({ tileGroups: new Map([['floor', tileGroup(1, 'glass')]]) }),
    );

    expect(large[0]?.max.x).toBe(4);
    expect(glass.length).toBe(0);
  });

  it('블록은 셀 크기와 높이 단계에 맞는 박스가 된다', () => {
    const block: BuildingBlockConfig = {
      id: 'block',
      position: { x: 0, y: 1, z: 0 },
      size: { x: 2, y: 3, z: 1 },
      materialId: 'white',
    };

    const [box] = buildingToVoxelBoxes(createSource({ blocks: [block] }));

    expect(box?.min).toEqual({ x: -2, y: 1, z: -2 });
    expect(box?.max).toEqual({ x: 6, y: 4, z: 2 });
  });

  it('회전하지 않은 일반 벽은 길이 4m, 높이 4m, 두께 0.5m의 박스가 된다', () => {
    const boxes = buildingToVoxelBoxes(wallSource({}));

    expect(boxes.length).toBe(1);
    expect(boxes[0]?.min).toEqual({ x: -2, y: 0, z: 1.75 });
    expect(boxes[0]?.max).toEqual({ x: 2, y: 4, z: 2.25 });
  });

  it('90도 회전한 벽은 길이 방향이 z축으로 바뀐다', () => {
    const [box] = buildingToVoxelBoxes(wallSource({ rotation: { x: 0, y: Math.PI / 2, z: 0 } }));

    expect(box?.min.x).toBeCloseTo(1.75, 9);
    expect(box?.max.x).toBeCloseTo(2.25, 9);
    expect(box?.min.z).toBeCloseTo(-2, 9);
    expect(box?.max.z).toBeCloseTo(2, 9);
  });

  it('벽 위치와 높이 기준점이 박스에 반영된다', () => {
    const [box] = buildingToVoxelBoxes(wallSource({ position: { x: 10, y: 3, z: -6 } }));

    expect(box?.min).toEqual({ x: 8, y: 3, z: -4.25 });
    expect(box?.max).toEqual({ x: 12, y: 7, z: -3.75 });
  });

  it('문과 아치는 좌우 기둥과 상단 인방만 남겨 개구부를 비운다', () => {
    const door = wallPieces('door', 4, 4, 0.5);
    const arch = wallPieces('arch', 4, 4, 0.5);

    expect(door.length).toBe(3);
    const header = door[2];
    expect(header?.size[1]).toBeCloseTo(0.88, 9);
    expect(header?.center[1]).toBeCloseTo(4 - 0.44, 9);
    expect(arch[2]?.size[1]).toBeCloseTo(1.36, 9);
    const pillar = door[0];
    expect((pillar?.center[0] ?? 0) + (pillar?.size[0] ?? 0) / 2).toBeLessThan(0);
  });

  it('창 벽은 기둥 둘과 아래위 띠로 이루어진다', () => {
    const pieces = wallPieces('window', 4, 4, 0.5);

    expect(pieces.length).toBe(4);
    expect(pieces[2]?.size[1]).toBeCloseTo(0.96, 9);
    expect(pieces[3]?.center[1]).toBeCloseTo(4 - 0.48, 9);
  });

  it('반벽은 높이의 46%만 채우고 유리와 난간은 생략한다', () => {
    const half = wallPieces('half', 4, 4, 0.5);

    expect(half.length).toBe(1);
    expect(half[0]?.size[1]).toBeCloseTo(1.84, 9);
    expect(wallPieces('glass', 4, 4, 0.5)).toEqual([]);
    expect(wallPieces('railing', 4, 4, 0.5)).toEqual([]);
  });

  it('그룹 기본 벽 종류를 따르고 벽 자체 종류가 우선한다', () => {
    expect(buildingToVoxelBoxes(wallSource({}, { defaultWallKind: 'door' })).length).toBe(3);
    expect(
      buildingToVoxelBoxes(wallSource({ wallKind: 'solid' }, { defaultWallKind: 'door' })).length,
    ).toBe(1);
  });

  it('불 오브젝트만 발광 박스가 되고 나무 등은 무시한다', () => {
    const objects: PlacedObject[] = [
      { id: 'fire', type: 'fire', position: { x: 1, y: 0, z: 2 }, config: { fireIntensity: 2 } },
      { id: 'tree', type: 'tree', position: { x: 5, y: 0, z: 5 } },
    ];

    const boxes = buildingToVoxelBoxes(createSource({ objects }));

    expect(boxes.length).toBe(1);
    expect(boxes[0]?.min.x).toBeCloseTo(0.7, 9);
    expect(boxes[0]?.min.z).toBeCloseTo(1.7, 9);
    expect(boxes[0]?.max.y).toBe(1);
    expect(boxes[0]?.emissive?.[0] ?? 0).toBeGreaterThan(5);
  });
});
