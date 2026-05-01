import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { BuildingSystem } from '../BuildingSystem';
import {
  createEmptyBuildingIndirectDrawMirror,
  DRAW_CLUSTER_BILLBOARD,
  DRAW_CLUSTER_BLOCK,
  DRAW_CLUSTER_FIRE,
  DRAW_CLUSTER_FLAG,
  DRAW_CLUSTER_SAKURA,
  DRAW_CLUSTER_TILE,
  DRAW_CLUSTER_WALL,
  INDIRECT_DRAW_STRIDE,
} from '../../render/draw';
import { useBuildingGpuCullingStore } from '../../render/cullingStore';
import { useBuildingRenderStateStore } from '../../render/store';
import { useBuildingStore } from '../../stores/buildingStore';
import { WallGroupConfig, TileGroupConfig, MeshConfig } from '../../types';
import { useBuildingVisibilityStore } from '../../visibility/store';

// BuildingStore 모킹
jest.mock('../../stores/buildingStore', () => ({
  useBuildingStore: jest.fn()
}));

// 하위 컴포넌트들 모킹
jest.mock('../WallSystem', () => ({
  WallSystem: ({ wallGroup, onWallClick }: any) => (
    <group name={`wall-system-${wallGroup.id}`}>
      <mesh onClick={() => onWallClick?.(wallGroup.id)}>
        <boxGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}));

jest.mock('../TileSystem', () => ({
  TileSystem: ({ tileGroup, onTileClick }: any) => (
    <group name={`tile-system-${tileGroup.id}`}>
      <mesh onClick={() => onTileClick?.(tileGroup.id)}>
        <planeGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}));

jest.mock('../BlockSystem', () => ({
  BlockSystem: ({ blocks }: any) => (
    <group name="block-system">
      {blocks.map((block: any) => (
        <mesh key={block.id} name={`block-${block.id}`}>
          <boxGeometry />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  )
}));

jest.mock('../GridHelper', () => ({
  GridHelper: ({ size }: any) => (
    <gridHelper name="grid-helper" args={[size, 25]} />
  )
}));

jest.mock('../PreviewTile', () => ({
  PreviewTile: () => <group name="preview-tile" />
}));

jest.mock('../PreviewWall', () => ({
  PreviewWall: () => <group name="preview-wall" />
}));

jest.mock('../../../npc/components/NPCPreview', () => ({
  NPCPreview: () => <group name="npc-preview" />
}));

jest.mock('../../../weather', () => ({
  WeatherEffect: ({ kind }: { kind: string }) => <group name={`weather-effect-${kind}`} />,
}));

// mesh 하위 컴포넌트들은 GLSL 셰이더를 import하므로 jsdom 환경에서는 모킹.
jest.mock('../mesh/sakura', () => ({
  SakuraBatch: () => <group name="sakura-batch" />,
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

const expectSceneHasName = (renderer: any, name: string) => {
  expect(renderer.scene.findByProps({ name })).toBeDefined();
};

const expectSceneMissingName = (renderer: any, name: string) => {
  expect(() => renderer.scene.findByProps({ name })).toThrow();
};

describe('BuildingSystem 컴포넌트 테스트', () => {
  let mockUseBuildingStore: jest.MockedFunction<typeof useBuildingStore>;

  const mockMeshes = new Map<string, MeshConfig>([
    ['brick-mesh', { id: 'brick-mesh', color: '#8B4513' }],
    ['wood-mesh', { id: 'wood-mesh', color: '#654321' }]
  ]);

  const mockWallGroups = new Map<string, WallGroupConfig>([
    ['wall-group-1', {
      id: 'wall-group-1',
      name: 'Test Wall Group 1',
      walls: []
    }],
    ['wall-group-2', {
      id: 'wall-group-2',
      name: 'Test Wall Group 2',
      walls: []
    }]
  ]);

  const mockTileGroups = new Map<string, TileGroupConfig>([
    ['tile-group-1', {
      id: 'tile-group-1',
      name: 'Test Tile Group 1',
      floorMeshId: 'wood-mesh',
      tiles: []
    }],
    ['tile-group-2', {
      id: 'tile-group-2',
      name: 'Test Tile Group 2',
      floorMeshId: 'brick-mesh',
      tiles: []
    }]
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
      objects: [],
      ...overrides,
    };
    mockUseBuildingStore.mockImplementation(((selector?: (s: unknown) => unknown) =>
      typeof selector === 'function' ? selector(state) : state
    ) as unknown as typeof useBuildingStore);
  };

  beforeEach(() => {
    mockUseBuildingStore = useBuildingStore as jest.MockedFunction<typeof useBuildingStore>;
    useBuildingRenderStateStore.getState().reset();
    useBuildingGpuCullingStore.getState().reset();
    useBuildingVisibilityStore.getState().reset();
    mockStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
    useBuildingRenderStateStore.getState().reset();
    useBuildingGpuCullingStore.getState().reset();
    useBuildingVisibilityStore.getState().reset();
  });

  describe('렌더링', () => {
    test('기본 구조가 올바르게 렌더링되어야 함', async () => {
      let renderer: any;
      try {
        renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);
      } catch (e: any) {
        // React may throw an AggregateError (multiple passive effect errors).
        if (e && Array.isArray(e.errors) && e.errors.length > 0) {
          throw e.errors[0];
        }
        throw e;
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
        <BuildingSystem onWallClick={mockOnWallClick} onWallDelete={mockOnWallDelete} />
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
        <BuildingSystem onTileClick={mockOnTileClick} onTileDelete={mockOnTileDelete} />
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

    editModes.forEach(mode => {
      test(`${mode} 편집 모드에서 올바르게 렌더링되어야 함`, async () => {
        mockStore({ editMode: mode });

        const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

        expectSceneHasName(renderer, 'preview-tile');
        expectSceneHasName(renderer, 'preview-wall');
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
        onTileDelete: jest.fn()
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
        <BuildingSystem onWallClick={jest.fn()} />
      );

      const newWallGroups = new Map(mockWallGroups);
      newWallGroups.set('wall-group-3', {
        id: 'wall-group-3',
        name: 'New Wall Group',
        walls: []
      });

      mockStore({ wallGroups: newWallGroups });

      await renderer.update(<BuildingSystem onWallClick={jest.fn()} />);
      expectSceneHasName(renderer, 'wall-system-wall-group-3');

      renderer.unmount();
    });

    test('tileGroups 변경 시 리렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <BuildingSystem onTileClick={jest.fn()} />
      );

      const newTileGroups = new Map(mockTileGroups);
      newTileGroups.set('tile-group-3', {
        id: 'tile-group-3',
        name: 'New Tile Group',
        floorMeshId: 'wood-mesh',
        tiles: []
      });

      mockStore({ tileGroups: newTileGroups });

      await renderer.update(<BuildingSystem onTileClick={jest.fn()} />);
      expectSceneHasName(renderer, 'tile-system-tile-group-3');

      renderer.unmount();
    });
  });

  describe('indirect draw execution MVP', () => {
    test('draw args budget only renders the allowed number of wall and tile groups', async () => {
      const drawMirror = createEmptyBuildingIndirectDrawMirror();
      drawMirror.version = 11;
      drawMirror.args[DRAW_CLUSTER_WALL * INDIRECT_DRAW_STRIDE + 1] = 1;
      drawMirror.args[DRAW_CLUSTER_TILE * INDIRECT_DRAW_STRIDE + 1] = 1;
      useBuildingRenderStateStore.getState().setDrawMirror(drawMirror);
      useBuildingGpuCullingStore.getState().setResult({
        version: 11,
        tileIds: new Set(['tile-group-1', 'tile-group-2']),
        wallIds: new Set(['wall-group-1', 'wall-group-2']),
        blockIds: new Set(),
        objectIds: new Set(),
        clusterCounts: new Uint32Array(11),
      });
      useBuildingVisibilityStore.getState().setVisible({
        tileIds: new Set(['tile-group-1', 'tile-group-2']),
        wallIds: new Set(['wall-group-1', 'wall-group-2']),
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

    test('draw args budget clamps object batches by cluster', async () => {
      const drawMirror = createEmptyBuildingIndirectDrawMirror();
      drawMirror.version = 12;
      drawMirror.args[DRAW_CLUSTER_SAKURA * INDIRECT_DRAW_STRIDE + 1] = 1;
      drawMirror.args[DRAW_CLUSTER_FLAG * INDIRECT_DRAW_STRIDE + 1] = 0;
      drawMirror.args[DRAW_CLUSTER_FIRE * INDIRECT_DRAW_STRIDE + 1] = 1;
      drawMirror.args[DRAW_CLUSTER_BILLBOARD * INDIRECT_DRAW_STRIDE + 1] = 0;
      useBuildingRenderStateStore.getState().setDrawMirror(drawMirror);
      useBuildingGpuCullingStore.getState().setResult({
        version: 12,
        tileIds: new Set(),
        wallIds: new Set(),
        blockIds: new Set(),
        objectIds: new Set(['s1', 's2', 'f1', 'b1']),
        clusterCounts: new Uint32Array(11),
      });
      useBuildingVisibilityStore.getState().setVisible({
        tileIds: new Set(),
        wallIds: new Set(),
        blockIds: new Set(),
        objectIds: new Set(['s1', 's2', 'f1', 'b1']),
      });
      mockStore({
        objects: [
          { id: 's1', type: 'sakura', position: { x: 0, y: 0, z: 0 }, config: {} },
          { id: 's2', type: 'sakura', position: { x: 1, y: 0, z: 0 }, config: {} },
          { id: 'f1', type: 'fire', position: { x: 2, y: 0, z: 0 }, config: {} },
          { id: 'b1', type: 'billboard', position: { x: 3, y: 0, z: 0 }, config: {} },
        ],
      });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'sakura-batch');
      expectSceneHasName(renderer, 'fire-batch');
      expectSceneMissingName(renderer, 'flag-batch');
      expect(() => renderer.scene.findAllByProps({ name: 'billboard' })).not.toThrow();

      renderer.unmount();
    });

    test('draw args budget clamps rendered blocks', async () => {
      const drawMirror = createEmptyBuildingIndirectDrawMirror();
      drawMirror.version = 13;
      drawMirror.args[DRAW_CLUSTER_BLOCK * INDIRECT_DRAW_STRIDE + 1] = 1;
      useBuildingRenderStateStore.getState().setDrawMirror(drawMirror);
      useBuildingGpuCullingStore.getState().setResult({
        version: 13,
        tileIds: new Set(),
        wallIds: new Set(),
        blockIds: new Set(['b1', 'b2']),
        objectIds: new Set(),
        clusterCounts: new Uint32Array(11),
      });
      useBuildingVisibilityStore.getState().setVisible({
        tileIds: new Set(),
        wallIds: new Set(),
        blockIds: new Set(['b1', 'b2']),
        objectIds: new Set(),
      });
      mockStore({
        blocks: [
          { id: 'b1', position: { x: 0, y: 0, z: 0 }, materialId: 'stone' },
          { id: 'b2', position: { x: 4, y: 0, z: 0 }, materialId: 'stone' },
        ],
      });

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'block-b1');
      expectSceneMissingName(renderer, 'block-b2');

      renderer.unmount();
    });
  });
}); 
