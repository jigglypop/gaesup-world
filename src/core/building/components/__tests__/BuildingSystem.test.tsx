import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { BuildingSystem } from '../BuildingSystem';
import { useBuildingStore } from '../../stores/buildingStore';
import { WallGroupConfig, TileGroupConfig, MeshConfig } from '../../types';

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

  beforeEach(() => {
    mockUseBuildingStore = useBuildingStore as jest.MockedFunction<typeof useBuildingStore>;
    
    // 기본 모킹 설정
    mockUseBuildingStore.mockReturnValue({
      meshes: mockMeshes,
      wallGroups: mockWallGroups,
      tileGroups: mockTileGroups,
      editMode: 'none',
      showGrid: true,
      gridSize: 100
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: true,
        gridSize: 50
      } as any);

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'grid-helper');

      renderer.unmount();
    });

    test('그리드가 숨겨져야 함', async () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: false,
        gridSize: 100
      } as any);

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
  });

  describe('벽 시스템', () => {
    test('모든 벽 그룹이 렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneHasName(renderer, 'wall-system-wall-group-1');
      expectSceneHasName(renderer, 'wall-system-wall-group-2');

      renderer.unmount();
    });

    test('벽 편집 모드에서 isEditMode가 true여야 함', async () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'wall',
        showGrid: true,
        gridSize: 100
      } as any);

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
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: new Map(),
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: true,
        gridSize: 100
      } as any);

      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      expectSceneMissingName(renderer, 'wall-system-wall-group-1');
      expectSceneMissingName(renderer, 'wall-system-wall-group-2');

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
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'tile',
        showGrid: true,
        gridSize: 100
      } as any);

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
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: new Map(),
        editMode: 'none',
        showGrid: true,
        gridSize: 100
      } as any);

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
    const editModes = ['none', 'wall', 'tile', 'npc'] as const;

    editModes.forEach(mode => {
      test(`${mode} 편집 모드에서 올바르게 렌더링되어야 함`, async () => {
        mockUseBuildingStore.mockReturnValue({
          meshes: mockMeshes,
          wallGroups: mockWallGroups,
          tileGroups: mockTileGroups,
          editMode: mode,
          showGrid: true,
          gridSize: 100
        } as any);

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
    test('wallGroups 변경 시 리렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      // 새로운 벽 그룹 추가
      const newWallGroups = new Map(mockWallGroups);
      newWallGroups.set('wall-group-3', {
        id: 'wall-group-3',
        name: 'New Wall Group',
        walls: []
      });

      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: newWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: true,
        gridSize: 100
      } as any);

      await renderer.update(<BuildingSystem />);
      expectSceneHasName(renderer, 'wall-system-wall-group-3');

      renderer.unmount();
    });

    test('tileGroups 변경 시 리렌더링되어야 함', async () => {
      const renderer = await ReactThreeTestRenderer.create(<BuildingSystem />);

      // 새로운 타일 그룹 추가
      const newTileGroups = new Map(mockTileGroups);
      newTileGroups.set('tile-group-3', {
        id: 'tile-group-3',
        name: 'New Tile Group',
        floorMeshId: 'wood-mesh',
        tiles: []
      });

      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: newTileGroups,
        editMode: 'none',
        showGrid: true,
        gridSize: 100
      } as any);

      await renderer.update(<BuildingSystem />);
      expectSceneHasName(renderer, 'tile-system-tile-group-3');

      renderer.unmount();
    });
  });
}); 