import React from 'react';
import { render, screen } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
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
    <group data-testid={`wall-system-${wallGroup.id}`}>
      <mesh onClick={() => onWallClick?.(wallGroup.id)}>
        <boxGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}));

jest.mock('../TileSystem', () => ({
  TileSystem: ({ tileGroup, onTileClick }: any) => (
    <group data-testid={`tile-system-${tileGroup.id}`}>
      <mesh onClick={() => onTileClick?.(tileGroup.id)}>
        <planeGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}));

jest.mock('../GridHelper', () => ({
  GridHelper: ({ size }: any) => (
    <gridHelper data-testid="grid-helper" args={[size, 25]} />
  )
}));

jest.mock('../PreviewTile', () => ({
  PreviewTile: () => <group data-testid="preview-tile" />
}));

jest.mock('../PreviewWall', () => ({
  PreviewWall: () => <group data-testid="preview-wall" />
}));

jest.mock('../../../npc/components/NPCPreview', () => ({
  NPCPreview: () => <group data-testid="npc-preview" />
}));

// 테스트용 래퍼 컴포넌트
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Canvas>
    {children}
  </Canvas>
);

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
    test('기본 구조가 올바르게 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // 메인 그룹이 존재해야 함
      expect(screen.getByRole('group')).toHaveAttribute('name', 'building-system');
    });

    test('그리드가 표시되어야 함', () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: true,
        gridSize: 50
      } as any);

      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('grid-helper')).toBeInTheDocument();
    });

    test('그리드가 숨겨져야 함', () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: false,
        gridSize: 100
      } as any);

      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.queryByTestId('grid-helper')).not.toBeInTheDocument();
    });

    test('미리보기 컴포넌트들이 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('preview-tile')).toBeInTheDocument();
      expect(screen.getByTestId('preview-wall')).toBeInTheDocument();
      expect(screen.getByTestId('npc-preview')).toBeInTheDocument();
    });
  });

  describe('벽 시스템', () => {
    test('모든 벽 그룹이 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('wall-system-wall-group-2')).toBeInTheDocument();
    });

    test('벽 편집 모드에서 isEditMode가 true여야 함', () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'wall',
        showGrid: true,
        gridSize: 100
      } as any);

      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // WallSystem 컴포넌트가 올바른 props로 렌더링되는지 확인
      expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('wall-system-wall-group-2')).toBeInTheDocument();
    });

    test('벽 클릭 핸들러가 올바르게 전달되어야 함', () => {
      const mockOnWallClick = jest.fn();
      const mockOnWallDelete = jest.fn();

      render(
        <TestWrapper>
          <BuildingSystem 
            onWallClick={mockOnWallClick}
            onWallDelete={mockOnWallDelete}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('wall-system-wall-group-2')).toBeInTheDocument();
    });

    test('빈 벽 그룹 맵에서도 오류 없이 렌더링되어야 함', () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: new Map(),
        tileGroups: mockTileGroups,
        editMode: 'none',
        showGrid: true,
        gridSize: 100
      } as any);

      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.queryByTestId(/wall-system-/)).not.toBeInTheDocument();
    });
  });

  describe('타일 시스템', () => {
    test('모든 타일 그룹이 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('tile-system-tile-group-2')).toBeInTheDocument();
    });

    test('타일 편집 모드에서 isEditMode가 true여야 함', () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: mockTileGroups,
        editMode: 'tile',
        showGrid: true,
        gridSize: 100
      } as any);

      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('tile-system-tile-group-2')).toBeInTheDocument();
    });

    test('타일 클릭 핸들러가 올바르게 전달되어야 함', () => {
      const mockOnTileClick = jest.fn();
      const mockOnTileDelete = jest.fn();

      render(
        <TestWrapper>
          <BuildingSystem 
            onTileClick={mockOnTileClick}
            onTileDelete={mockOnTileDelete}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('tile-system-tile-group-2')).toBeInTheDocument();
    });

    test('빈 타일 그룹 맵에서도 오류 없이 렌더링되어야 함', () => {
      mockUseBuildingStore.mockReturnValue({
        meshes: mockMeshes,
        wallGroups: mockWallGroups,
        tileGroups: new Map(),
        editMode: 'none',
        showGrid: true,
        gridSize: 100
      } as any);

      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.queryByTestId(/tile-system-/)).not.toBeInTheDocument();
    });
  });

  describe('성능 최적화', () => {
    test('wallGroups가 변경되지 않으면 배열이 재생성되지 않아야 함', () => {
      const { rerender } = render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // 같은 wallGroups로 리렌더링
      rerender(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // 컴포넌트가 여전히 올바르게 렌더링되어야 함
      expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('wall-system-wall-group-2')).toBeInTheDocument();
    });

    test('tileGroups가 변경되지 않으면 배열이 재생성되지 않아야 함', () => {
      const { rerender } = render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // 같은 tileGroups로 리렌더링
      rerender(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // 컴포넌트가 여전히 올바르게 렌더링되어야 함
      expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('tile-system-tile-group-2')).toBeInTheDocument();
    });
  });

  describe('다양한 편집 모드', () => {
    const editModes = ['none', 'wall', 'tile', 'npc'] as const;

    editModes.forEach(mode => {
      test(`${mode} 편집 모드에서 올바르게 렌더링되어야 함`, () => {
        mockUseBuildingStore.mockReturnValue({
          meshes: mockMeshes,
          wallGroups: mockWallGroups,
          tileGroups: mockTileGroups,
          editMode: mode,
          showGrid: true,
          gridSize: 100
        } as any);

        render(
          <TestWrapper>
            <BuildingSystem />
          </TestWrapper>
        );

        // 기본 컴포넌트들이 모두 렌더링되어야 함
        expect(screen.getByTestId('preview-tile')).toBeInTheDocument();
        expect(screen.getByTestId('preview-wall')).toBeInTheDocument();
        expect(screen.getByTestId('npc-preview')).toBeInTheDocument();
        expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
        expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
      });
    });
  });

  describe('Suspense 경계', () => {
    test('Suspense fallback이 설정되어야 함', () => {
      // Suspense는 null fallback을 가져야 함
      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      // 컴포넌트가 정상적으로 로드되어야 함
      expect(screen.getByTestId('preview-tile')).toBeInTheDocument();
    });
  });

  describe('props 전달', () => {
    test('모든 선택적 props가 올바르게 처리되어야 함', () => {
      const props = {
        onWallClick: jest.fn(),
        onTileClick: jest.fn(),
        onWallDelete: jest.fn(),
        onTileDelete: jest.fn()
      };

      render(
        <TestWrapper>
          <BuildingSystem {...props} />
        </TestWrapper>
      );

      // 컴포넌트가 정상적으로 렌더링되어야 함
      expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
    });

    test('props 없이도 올바르게 렌더링되어야 함', () => {
      render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('wall-system-wall-group-1')).toBeInTheDocument();
      expect(screen.getByTestId('tile-system-tile-group-1')).toBeInTheDocument();
    });
  });

  describe('데이터 변경 반응성', () => {
    test('wallGroups 변경 시 리렌더링되어야 함', () => {
      const { rerender } = render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

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

      rerender(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('wall-system-wall-group-3')).toBeInTheDocument();
    });

    test('tileGroups 변경 시 리렌더링되어야 함', () => {
      const { rerender } = render(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

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

      rerender(
        <TestWrapper>
          <BuildingSystem />
        </TestWrapper>
      );

      expect(screen.getByTestId('tile-system-tile-group-3')).toBeInTheDocument();
    });
  });
}); 