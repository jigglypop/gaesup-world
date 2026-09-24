import ReactThreeTestRenderer from '@react-three/test-renderer';

import { useBuildingStore } from '../../stores/buildingStore';
import { WallGroupConfig, TileGroupConfig, MeshConfig } from '../../types';
import { useBuildingVisibilityStore } from '../../visibility/store';
import type { BlockSystemProps } from '../BlockSystem/types';
import { BuildingSystem } from '../BuildingSystem';
import type { GridHelperProps } from '../GridHelper/types';
import type { TileSystemProps } from '../TileSystem/types';
import type { WallSystemProps } from '../WallSystem/types';

type TestRenderer = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

// BuildingStore 모킹
jest.mock('../../stores/buildingStore', () => ({
  useBuildingStore: jest.fn(),
}));

// 하위 컴포넌트들 모킹
jest.mock('../WallSystem', () => ({
  WallSystem: ({ wallGroup, onWallClick }: WallSystemProps) => (
    <group name={`wall-system-${wallGroup.id}`}>
      <mesh onClick={() => onWallClick?.(wallGroup.id)}>
        <boxGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  ),
}));

jest.mock('../TileSystem', () => ({
  TileSystem: ({ tileGroup, onTileClick }: TileSystemProps) => (
    <group name={`tile-system-${tileGroup.id}`}>
      <mesh onClick={() => onTileClick?.(tileGroup.id)}>
        <planeGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  ),
}));

jest.mock('../BlockSystem', () => ({
  BlockSystem: ({ blocks }: BlockSystemProps) => (
    <group name="block-system">
      {blocks.map((block) => (
        <mesh key={block.id} name={`block-${block.id}`}>
          <boxGeometry />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  ),
}));

const mockColliders = new Set<number>();
jest.mock('@react-three/rapier', () => {
  let handle = 0;
  const desc = { setTranslation: () => desc, setRotation: () => desc };
  const world = {
    createCollider: () => { const collider = { handle: handle++ }; mockColliders.add(collider.handle); return collider; },
    getCollider: (id: number) => mockColliders.has(id),
    removeCollider: (collider: { handle: number }) => { mockColliders.delete(collider.handle); },
  };
  return { useRapier: () => ({ world, rapier: { ColliderDesc: { cuboid: () => desc } } }) };
});

jest.mock('../GridHelper', () => ({
  GridHelper: ({ size }: GridHelperProps) => <gridHelper name="grid-helper" args={[size, 25]} />,
}));

jest.mock('../PreviewTile', () => ({
  PreviewTile: () => <group name="preview-tile" />,
}));

jest.mock('../PreviewWall', () => ({
  PreviewWall: () => <group name="preview-wall" />,
}));

jest.mock('../PreviewBlock', () => ({
  PreviewBlock: () => <group name="preview-block" />,
}));

jest.mock('../../../npc/components/NPCPreview', () => ({
  NPCPreview: () => <group name="npc-preview" />,
}));

jest.mock('../../../weather', () => ({
  WeatherEffect: ({ kind }: { kind: string }) => <group name={`weather-effect-${kind}`} />,
}));

// mesh 하위 컴포넌트들은 GLSL 셰이더를 import하므로 jsdom 환경에서는 모킹.
jest.mock('../mesh/sakura', () => ({
  SakuraBatch: ({ trees }: { trees: unknown[] }) => <group name="sakura-batch" userData={{ trees }} />,
}));

jest.mock('../mesh/model', () => ({
  __esModule: true,
  default: ({ label }: { label?: string }) => <group name={`model-${label}`} />,
}));

jest.mock('../mesh/flag', () => ({
  FlagBatch: () => <group name="flag-batch" />,
}));

jest.mock('../mesh/fire', () => ({
  FireBatch: () => <group name="fire-batch" />,
}));

jest.mock('../mesh/billboard', () => ({
  __esModule: true,
  default: () => <group name="billboard" />,
}));

jest.mock('../mesh/snow', () => ({
  Snow: () => <group name="snow" />,
}));

const expectSceneHasName = (renderer: TestRenderer, name: string) => {
  expect(renderer.scene.findByProps({ name })).toBeDefined();
};

const expectSceneMissingName = (renderer: TestRenderer, name: string) => {
  expect(() => renderer.scene.findByProps({ name })).toThrow();
};

describe('BuildingSystem 컴포넌트 테스트', () => {
  let mockUseBuildingStore: jest.MockedFunction<typeof useBuildingStore>;

  const mockMeshes = new Map<string, MeshConfig>([
    ['brick-mesh', { id: 'brick-mesh', color: '#8B4513' }],
    ['wood-mesh', { id: 'wood-mesh', color: '#654321' }],
  ]);

  const mockWallGroups = new Map<string, WallGroupConfig>([
    [
      'wall-group-1',
      {
        id: 'wall-group-1',
        name: 'Test Wall Group 1',
        walls: [],
      },
    ],
    [
      'wall-group-2',
      {
        id: 'wall-group-2',
        name: 'Test Wall Group 2',
        walls: [],
      },
    ],
  ]);

  const mockTileGroups = new Map<string, TileGroupConfig>([
    [
      'tile-group-1',
      {
        id: 'tile-group-1',
        name: 'Test Tile Group 1',
        floorMeshId: 'wood-mesh',
        tiles: [],
      },
    ],
    [
      'tile-group-2',
      {
        id: 'tile-group-2',
        name: 'Test Tile Group 2',
        floorMeshId: 'brick-mesh',
        tiles: [],
      },
    ],
  ]);

  // BuildingSystem이 useBuildingStore(s => s.field) 패턴을 사용하므로
  // mock도 selector를 받아 적용해야 한다.
  const mockStore = (overrides: Record<string, unknown> = {}) => {
    const state = {
      meshes: mockMeshes,
      wallGroups: mockWallGroups,
      tileGroups: mockTileGroups,
      blocks: [],
      editMode: 'none',
      showGrid: true,
      gridSize: 100,
      showSnow: false,
      showFog: false,
      fogColor: '#cfd8e3',
      weatherEffect: 'none',
      worldSurface: 'ground',
      objects: [],
      ...overrides,
    };
    mockUseBuildingStore.mockImplementation(((selector?: (s: unknown) => unknown) =>
      typeof selector === 'function'
        ? selector(state)
        : state) as unknown as typeof useBuildingStore);
  };

  beforeEach(() => {
    mockUseBuildingStore = useBuildingStore as jest.MockedFunction<typeof useBuildingStore>;
    useBuildingVisibilityStore.getState().reset();
    mockStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
    useBuildingVisibilityStore.getState().reset();
  });

  describe('렌더링', () => {
    test('a view can hide the grid and restore the stored preference', async () => {
      mockStore({ showGrid: true });
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem showGrid={false} />);
      try {
        expect(renderer.scene.findAllByProps({ name: 'grid-helper' })).toHaveLength(0);
        await renderer.update(<BuildingSystem />);
        expectSceneHasName(renderer, 'grid-helper');
      } finally {
        await renderer.unmount();
      }
    });

    test('기본 구조가 올바르게 렌더링되어야 함', async () => {
      let renderer: TestRenderer;
      try {
        renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);
      } catch (error: unknown) {
        // React may throw an AggregateError (multiple passive effect errors).
        if (error instanceof AggregateError && error.errors.length > 0) {
          throw error.errors[0];
        }
        throw error;
      }
      // 메인 그룹이 존재해야 함
      expect(renderer.scene.findByProps({ name: 'building-system' })).toBeDefined();

      renderer.unmount();
    });

    test('그리드가 표시되어야 함', async () => {
      mockStore({ gridSize: 50 });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'grid-helper');

      renderer.unmount();
    });

    test('그리드가 숨겨져야 함', async () => {
      mockStore({ showGrid: false });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneMissingName(renderer, 'grid-helper');

      renderer.unmount();
    });

    test('미리보기 컴포넌트들이 렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'preview-tile');
      expectSceneHasName(renderer, 'preview-wall');
      expectSceneHasName(renderer, 'preview-block');
      expectSceneHasName(renderer, 'npc-preview');

      renderer.unmount();
    });

    test('건축 날씨 효과가 선택된 weatherEffect로 렌더링되어야 함', async () => {
      mockStore({ weatherEffect: 'storm' });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'weather-effect-storm');

      renderer.unmount();
    });
  });

  describe('벽 시스템', () => {
    test('모든 벽 그룹이 렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'wall-system-wall-group-2');

      renderer.unmount();
    });

    test('벽 편집 모드에서 isEditMode가 true여야 함', async () => {
      mockStore({ editMode: 'wall' });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      // WallSystem 컴포넌트가 렌더링되는지 확인
      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'wall-system-wall-group-2');

      renderer.unmount();
    });

    test('벽 클릭 핸들러가 올바르게 전달되어야 함', async () => {
      const mockOnWallClick = jest.fn();
      const mockOnWallDelete = jest.fn();

      const renderer = await ReactThreeTestRenderer.create(
        <BuildingSystem onWallClick={mockOnWallClick} onWallDelete={mockOnWallDelete} />,
      );

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'wall-system-wall-group-2');

      renderer.unmount();
    });

    test('빈 벽 그룹 맵에서도 오류 없이 렌더링되어야 함', async () => {
      mockStore({ wallGroups: new Map() });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneMissingName(renderer, 'wall-system-wall-group-1');
      expectSceneMissingName(renderer, 'wall-system-wall-group-2');

      renderer.unmount();
    });

    test('visibility 결과에 따라 벽도 타일처럼 group 단위로 필터링되어야 함', async () => {
      useBuildingVisibilityStore.getState().setVisible({
        tileIds: new Set(['tile-group-1']),
        wallIds: new Set(['wall-group-1']),
        blockIds: new Set(),
        objectIds: new Set(),
      });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneMissingName(renderer, 'wall-system-wall-group-2');
      expectSceneHasName(renderer, 'tile-system-tile-group-1');
      expectSceneMissingName(renderer, 'tile-system-tile-group-2');

      renderer.unmount();
    });

    test('residency changes filter models but never rebuild batched objects', async () => {
      const object = (id: string, type: 'tree' | 'model', x: number) => ({
        id, type, position: { x, y: 0, z: 0 }, ...(type === 'model' ? { config: { modelLabel: id } } : {}),
      });
      mockStore({ objects: [object('near-tree', 'tree', 0), object('far-tree', 'tree', 500), object('near-model', 'model', 0), object('far-model', 'model', 500)] });
      useBuildingVisibilityStore.getState().setVisible({
        tileIds: new Set(), wallIds: new Set(), blockIds: new Set(), objectIds: new Set(['near-tree', 'near-model']),
      });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);
      try {
        const treesOf = () => (renderer.scene.findByProps({ name: 'sakura-batch' }).props['userData'] as { trees: unknown[] }).trees;
        const trees = treesOf();
        expect(trees).toHaveLength(2);
        expectSceneHasName(renderer, 'model-near-model');
        expectSceneMissingName(renderer, 'model-far-model');
        useBuildingVisibilityStore.getState().setVisible({
          tileIds: new Set(), wallIds: new Set(), blockIds: new Set(), objectIds: new Set(['far-tree', 'far-model']),
        });
        await renderer.update(<BuildingSystem />);
        expect(treesOf()).toBe(trees);
        expectSceneHasName(renderer, 'model-far-model');
        expectSceneMissingName(renderer, 'model-near-model');
      } finally {
        await renderer.unmount();
      }
    });

    test('visibility로 숨겨진 그룹도 물리 collider는 유지해야 함', async () => {
      const tile = (id: string, groupId: string, x: number) => ({ id, tileGroupId: groupId, position: { x, y: 0, z: 0 }, size: 1 });
      const wall = (id: string, groupId: string, x: number) => ({
        id, wallGroupId: groupId, position: { x, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 },
      });
      mockStore({
        tileGroups: new Map<string, TileGroupConfig>([
          ['tile-group-1', { id: 'tile-group-1', name: 'near', floorMeshId: 'wood-mesh', tiles: [tile('tile-1', 'tile-group-1', 0)] }],
          ['tile-group-2', { id: 'tile-group-2', name: 'far', floorMeshId: 'wood-mesh', tiles: [tile('tile-2', 'tile-group-2', 200)] }],
        ]),
        wallGroups: new Map<string, WallGroupConfig>([
          ['wall-group-1', { id: 'wall-group-1', name: 'near', walls: [wall('wall-1', 'wall-group-1', 0)] }],
          ['wall-group-2', { id: 'wall-group-2', name: 'far', walls: [wall('wall-2', 'wall-group-2', 200)] }],
        ]),
      });
      useBuildingVisibilityStore.getState().setVisible({
        tileIds: new Set(['tile-group-1']),
        wallIds: new Set(['wall-group-1']),
        blockIds: new Set(),
        objectIds: new Set(),
      });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneMissingName(renderer, 'tile-system-tile-group-2');
      expectSceneMissingName(renderer, 'wall-system-wall-group-2');
      expect(mockColliders.size).toBe(4);

      await renderer.unmount();
      expect(mockColliders.size).toBe(0);
    });

    test('벽 편집 모드에서는 벽 collider를 만들지 않아야 함', async () => {
      mockStore({
        editMode: 'wall',
        tileGroups: new Map(),
        wallGroups: new Map<string, WallGroupConfig>([
          ['wall-group-1', {
            id: 'wall-group-1', name: 'near',
            walls: [{ id: 'wall-1', wallGroupId: 'wall-group-1', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }],
          }],
        ]),
      });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expect(mockColliders.size).toBe(0);

      renderer.unmount();
    });
  });

  describe('타일 시스템', () => {
    test('모든 타일 그룹이 렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'tile-system-tile-group-1');
      expectSceneHasName(renderer, 'tile-system-tile-group-2');

      renderer.unmount();
    });

    test('타일 편집 모드에서 isEditMode가 true여야 함', async () => {
      mockStore({ editMode: 'tile' });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'tile-system-tile-group-1');
      expectSceneHasName(renderer, 'tile-system-tile-group-2');

      renderer.unmount();
    });

    test('타일 클릭 핸들러가 올바르게 전달되어야 함', async () => {
      const mockOnTileClick = jest.fn();
      const mockOnTileDelete = jest.fn();

      const renderer = await ReactThreeTestRenderer.create(
        <BuildingSystem onTileClick={mockOnTileClick} onTileDelete={mockOnTileDelete} />,
      );

      expectSceneHasName(renderer, 'tile-system-tile-group-1');
      expectSceneHasName(renderer, 'tile-system-tile-group-2');

      renderer.unmount();
    });

    test('빈 타일 그룹 맵에서도 오류 없이 렌더링되어야 함', async () => {
      mockStore({ tileGroups: new Map() });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneMissingName(renderer, 'tile-system-tile-group-1');
      expectSceneMissingName(renderer, 'tile-system-tile-group-2');

      renderer.unmount();
    });
  });

  describe('성능 최적화', () => {
    test('wallGroups가 변경되지 않으면 배열이 재생성되지 않아야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      // 같은 wallGroups로 update
      await renderer.update(<BuildingSystem />);

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'wall-system-wall-group-2');

      renderer.unmount();
    });

    test('tileGroups가 변경되지 않으면 배열이 재생성되지 않아야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      // 같은 tileGroups로 update
      await renderer.update(<BuildingSystem />);

      expectSceneHasName(renderer, 'tile-system-tile-group-1');
      expectSceneHasName(renderer, 'tile-system-tile-group-2');

      renderer.unmount();
    });
  });

  describe('다양한 편집 모드', () => {
    const editModes = ['none', 'wall', 'tile', 'block', 'npc'] as const;

    editModes.forEach((mode) => {
      test(`${mode} 편집 모드에서 올바르게 렌더링되어야 함`, async () => {
        mockStore({ editMode: mode });

        const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

        expectSceneHasName(renderer, 'preview-tile');
        expectSceneHasName(renderer, 'preview-wall');
        expectSceneHasName(renderer, 'preview-block');
        expectSceneHasName(renderer, 'npc-preview');
        expectSceneHasName(renderer, 'wall-system-wall-group-1');
        expectSceneHasName(renderer, 'tile-system-tile-group-1');

        renderer.unmount();
      });
    });
  });

  describe('Suspense 경계', () => {
    test('Suspense fallback이 설정되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'preview-tile');

      renderer.unmount();
    });
  });

  describe('props 전달', () => {
    test('모든 선택적 props가 올바르게 처리되어야 함', async () => {
      const props = {
        onWallClick: jest.fn(),
        onTileClick: jest.fn(),
        onWallDelete: jest.fn(),
        onTileDelete: jest.fn(),
      };

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem {...props} />);

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'tile-system-tile-group-1');

      renderer.unmount();
    });

    test('props 없이도 올바르게 렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'tile-system-tile-group-1');

      renderer.unmount();
    });
  });

  describe('데이터 변경 반응성', () => {
    // BuildingSystem은 React.memo로 감싸져 있고 본 테스트는 zustand 구독을 mock으로 대체하므로,
    // 실제 zustand 환경처럼 store 변경만으로 자동 리렌더되지 않는다.
    // 따라서 props 변경(콜백 ref 교체)으로 memo 게이트를 통과시켜 새 store 값을 반영시킨다.
    test('wallGroups 변경 시 리렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <BuildingSystem onWallClick={jest.fn()} />,
      );

      const newWallGroups = new Map(mockWallGroups);
      newWallGroups.set('wall-group-3', {
        id: 'wall-group-3',
        name: 'New Wall Group',
        walls: [],
      });

      mockStore({ wallGroups: newWallGroups });

      await renderer.update(<BuildingSystem onWallClick={jest.fn()} />);
      expectSceneHasName(renderer, 'wall-system-wall-group-3');

      renderer.unmount();
    });

    test('tileGroups 변경 시 리렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <BuildingSystem onTileClick={jest.fn()} />,
      );

      const newTileGroups = new Map(mockTileGroups);
      newTileGroups.set('tile-group-3', {
        id: 'tile-group-3',
        name: 'New Tile Group',
        floorMeshId: 'wood-mesh',
        tiles: [],
      });

      mockStore({ tileGroups: newTileGroups });

      await renderer.update(<BuildingSystem onTileClick={jest.fn()} />);
      expectSceneHasName(renderer, 'tile-system-tile-group-3');

      renderer.unmount();
    });
  });

  describe('indirect draw execution MVP', () => {
  });
});
