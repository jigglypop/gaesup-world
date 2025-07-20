import { renderHook, act } from '@testing-library/react';
import { useBuildingStore } from '../buildingStore';
import { 
  MeshConfig, 
  WallGroupConfig, 
  TileGroupConfig, 
  WallConfig, 
  TileConfig, 
  WallCategory, 
  TileCategory,
  Position3D 
} from '../../types';

// 초기 상태 리셋을 위한 헬퍼
const resetStore = () => {
  useBuildingStore.setState({
    initialized: false,
    meshes: new Map(),
    wallGroups: new Map(),
    tileGroups: new Map(),
    wallCategories: new Map(),
    tileCategories: new Map(),
    selectedWallGroupId: undefined,
    selectedTileGroupId: undefined,
    selectedWallCategoryId: undefined,
    selectedTileCategoryId: undefined,
    editMode: 'none',
    showGrid: true,
    gridSize: 100,
    snapToGrid: true,
    hoverPosition: null,
    currentTileMultiplier: 1,
    currentWallRotation: 0,
    selectedTileObjectType: 'none',
  });
};

describe('BuildingStore 테스트', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('초기 상태', () => {
    test('기본 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const state = result.current;

      expect(state.initialized).toBe(false);
      expect(state.meshes).toBeInstanceOf(Map);
      expect(state.wallGroups).toBeInstanceOf(Map);
      expect(state.tileGroups).toBeInstanceOf(Map);
      expect(state.wallCategories).toBeInstanceOf(Map);
      expect(state.tileCategories).toBeInstanceOf(Map);
      expect(state.editMode).toBe('none');
      expect(state.showGrid).toBe(true);
      expect(state.gridSize).toBe(100);
      expect(state.snapToGrid).toBe(true);
      expect(state.currentTileMultiplier).toBe(1);
      expect(state.currentWallRotation).toBe(0);
      expect(state.selectedTileObjectType).toBe('none');
    });

    test('모든 Map이 비어있어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const state = result.current;

      expect(state.meshes.size).toBe(0);
      expect(state.wallGroups.size).toBe(0);
      expect(state.tileGroups.size).toBe(0);
      expect(state.wallCategories.size).toBe(0);
      expect(state.tileCategories.size).toBe(0);
    });
  });

  describe('기본 기능 테스트', () => {
    test('호버 위치 설정이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const position: Position3D = { x: 10, y: 5, z: 15 };

      act(() => {
        result.current.setHoverPosition(position);
      });

      expect(result.current.hoverPosition).toEqual(position);

      act(() => {
        result.current.setHoverPosition(null);
      });

      expect(result.current.hoverPosition).toBeNull();
    });

    test('타일 배수 설정이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.setTileMultiplier(3);
      });

      expect(result.current.currentTileMultiplier).toBe(3);
    });

    test('벽 회전 설정이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.setWallRotation(Math.PI / 2);
      });

      expect(result.current.currentWallRotation).toBe(Math.PI / 2);
    });

    test('타일 오브젝트 타입 설정이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.setSelectedTileObjectType('grass');
      });

      expect(result.current.selectedTileObjectType).toBe('grass');
    });
  });

  describe('편집 모드 관리', () => {
    test('편집 모드 설정이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.setEditMode('wall');
      });

      expect(result.current.editMode).toBe('wall');
      expect(result.current.isInEditMode()).toBe(true);

      act(() => {
        result.current.setEditMode('none');
      });

      expect(result.current.editMode).toBe('none');
      expect(result.current.isInEditMode()).toBe(false);
    });

    test('편집 모드 변경 시 그리드가 표시되어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.setShowGrid(false);
        result.current.setEditMode('tile');
      });

      expect(result.current.showGrid).toBe(true);
    });

    test('그리드 설정이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.setShowGrid(false);
        result.current.setGridSize(50);
        result.current.setSnapToGrid(false);
      });

      expect(result.current.showGrid).toBe(false);
      expect(result.current.gridSize).toBe(50);
      expect(result.current.snapToGrid).toBe(false);
    });
  });

  describe('Mesh 관리', () => {
    test('메시 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const mesh: MeshConfig = {
        id: 'test-mesh',
        color: '#FF0000',
        material: 'STANDARD',
        roughness: 0.5
      };

      act(() => {
        result.current.addMesh(mesh);
      });

      expect(result.current.meshes.has('test-mesh')).toBe(true);
      expect(result.current.meshes.get('test-mesh')).toEqual(mesh);
    });

    test('메시 업데이트가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const mesh: MeshConfig = {
        id: 'test-mesh',
        color: '#FF0000',
        material: 'STANDARD'
      };

      act(() => {
        result.current.addMesh(mesh);
        result.current.updateMesh('test-mesh', { color: '#00FF00', roughness: 0.8 });
      });

      const updatedMesh = result.current.meshes.get('test-mesh');
      expect(updatedMesh?.color).toBe('#00FF00');
      expect(updatedMesh?.roughness).toBe(0.8);
      expect(updatedMesh?.material).toBe('STANDARD'); // 기존 값 유지
    });

    test('존재하지 않는 메시 업데이트 시 무시되어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.updateMesh('non-existent', { color: '#00FF00' });
      });

      expect(result.current.meshes.has('non-existent')).toBe(false);
    });

    test('메시 제거가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const mesh: MeshConfig = { id: 'test-mesh', color: '#FF0000' };

      act(() => {
        result.current.addMesh(mesh);
        result.current.removeMesh('test-mesh');
      });

      expect(result.current.meshes.has('test-mesh')).toBe(false);
    });
  });

  describe('Wall Category 관리', () => {
    test('벽 카테고리 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const category: WallCategory = {
        id: 'interior-walls',
        name: 'Interior Walls',
        description: 'Interior wall category',
        wallGroupIds: ['group1', 'group2']
      };

      act(() => {
        result.current.addWallCategory(category);
      });

      expect(result.current.wallCategories.has('interior-walls')).toBe(true);
      expect(result.current.wallCategories.get('interior-walls')).toEqual(category);
    });

    test('벽 카테고리 업데이트가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const category: WallCategory = {
        id: 'interior-walls',
        name: 'Interior Walls',
        wallGroupIds: []
      };

      act(() => {
        result.current.addWallCategory(category);
        result.current.updateWallCategory('interior-walls', { 
          name: 'Updated Interior Walls',
          description: 'Updated description' 
        });
      });

      const updated = result.current.wallCategories.get('interior-walls');
      expect(updated?.name).toBe('Updated Interior Walls');
      expect(updated?.description).toBe('Updated description');
    });

    test('벽 카테고리 제거가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const category: WallCategory = {
        id: 'interior-walls',
        name: 'Interior Walls',
        wallGroupIds: []
      };

      act(() => {
        result.current.addWallCategory(category);
        result.current.removeWallCategory('interior-walls');
      });

      expect(result.current.wallCategories.has('interior-walls')).toBe(false);
    });

    test('벽 카테고리 선택이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const category: WallCategory = {
        id: 'interior-walls',
        name: 'Interior Walls',
        wallGroupIds: ['group1', 'group2']
      };

      act(() => {
        result.current.addWallCategory(category);
        result.current.setSelectedWallCategory('interior-walls');
      });

      expect(result.current.selectedWallCategoryId).toBe('interior-walls');
      expect(result.current.selectedWallGroupId).toBe('group1'); // 첫 번째 그룹 자동 선택
    });
  });

  describe('Tile Category 관리', () => {
    test('타일 카테고리 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const category: TileCategory = {
        id: 'wood-floors',
        name: 'Wood Floors',
        description: 'Wood floor category',
        tileGroupIds: ['oak', 'pine']
      };

      act(() => {
        result.current.addTileCategory(category);
      });

      expect(result.current.tileCategories.has('wood-floors')).toBe(true);
      expect(result.current.tileCategories.get('wood-floors')).toEqual(category);
    });

    test('타일 카테고리 선택이 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const category: TileCategory = {
        id: 'wood-floors',
        name: 'Wood Floors',
        tileGroupIds: ['oak', 'pine']
      };

      act(() => {
        result.current.addTileCategory(category);
        result.current.setSelectedTileCategory('wood-floors');
      });

      expect(result.current.selectedTileCategoryId).toBe('wood-floors');
      expect(result.current.selectedTileGroupId).toBe('oak'); // 첫 번째 그룹 자동 선택
    });
  });

  describe('Wall Group 관리', () => {
    test('벽 그룹 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        frontMeshId: 'brick-mesh',
        walls: []
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
      });

      expect(result.current.wallGroups.has('brick-walls')).toBe(true);
      expect(result.current.wallGroups.get('brick-walls')).toEqual(wallGroup);
    });

    test('벽 그룹 업데이트가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        walls: []
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
        result.current.updateWallGroup('brick-walls', { name: 'Updated Brick Walls' });
      });

      const updated = result.current.wallGroups.get('brick-walls');
      expect(updated?.name).toBe('Updated Brick Walls');
    });

    test('벽 그룹 제거가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        walls: []
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
        result.current.removeWallGroup('brick-walls');
      });

      expect(result.current.wallGroups.has('brick-walls')).toBe(false);
    });
  });

  describe('Individual Wall 관리', () => {
    test('벽 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        walls: []
      };
      const wall: WallConfig = {
        id: 'wall-1',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        wallGroupId: 'brick-walls'
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
        result.current.addWall('brick-walls', wall);
      });

      const group = result.current.wallGroups.get('brick-walls');
      expect(group?.walls).toHaveLength(1);
      expect(group?.walls[0]).toEqual(wall);
    });

    test('벽 업데이트가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        walls: []
      };
      const wall: WallConfig = {
        id: 'wall-1',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        wallGroupId: 'brick-walls'
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
        result.current.addWall('brick-walls', wall);
        result.current.updateWall('brick-walls', 'wall-1', { 
          position: { x: 10, y: 5, z: 15 } 
        });
      });

      const group = result.current.wallGroups.get('brick-walls');
      const updatedWall = group?.walls.find(w => w.id === 'wall-1');
      expect(updatedWall?.position).toEqual({ x: 10, y: 5, z: 15 });
    });

    test('벽 제거가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        walls: []
      };
      const wall: WallConfig = {
        id: 'wall-1',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        wallGroupId: 'brick-walls'
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
        result.current.addWall('brick-walls', wall);
        result.current.removeWall('brick-walls', 'wall-1');
      });

      const group = result.current.wallGroups.get('brick-walls');
      expect(group?.walls).toHaveLength(0);
    });
  });

  describe('Tile Group 관리', () => {
    test('타일 그룹 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const tileGroup: TileGroupConfig = {
        id: 'oak-floor',
        name: 'Oak Floor',
        floorMeshId: 'oak-mesh',
        tiles: []
      };

      act(() => {
        result.current.addTileGroup(tileGroup);
      });

      expect(result.current.tileGroups.has('oak-floor')).toBe(true);
      expect(result.current.tileGroups.get('oak-floor')).toEqual(tileGroup);
    });
  });

  describe('Individual Tile 관리', () => {
    test('타일 추가가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const tileGroup: TileGroupConfig = {
        id: 'oak-floor',
        name: 'Oak Floor',
        floorMeshId: 'oak-mesh',
        tiles: []
      };
      const tile: TileConfig = {
        id: 'tile-1',
        position: { x: 0, y: 0, z: 0 },
        tileGroupId: 'oak-floor'
      };

      act(() => {
        result.current.addTileGroup(tileGroup);
        result.current.addTile('oak-floor', tile);
      });

      const group = result.current.tileGroups.get('oak-floor');
      expect(group?.tiles).toHaveLength(1);
      expect(group?.tiles[0]).toEqual(expect.objectContaining(tile));
    });

    test('타일 추가 시 선택된 오브젝트 타입이 적용되어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const tileGroup: TileGroupConfig = {
        id: 'oak-floor',
        name: 'Oak Floor',
        floorMeshId: 'oak-mesh',
        tiles: []
      };
      const tile: TileConfig = {
        id: 'tile-1',
        position: { x: 0, y: 0, z: 0 },
        tileGroupId: 'oak-floor'
      };

      act(() => {
        result.current.setSelectedTileObjectType('grass');
        result.current.addTileGroup(tileGroup);
        result.current.addTile('oak-floor', tile);
      });

      const group = result.current.tileGroups.get('oak-floor');
      const addedTile = group?.tiles[0];
      expect(addedTile?.objectType).toBe('grass');
      expect(addedTile?.objectConfig?.grassDensity).toBe(1000);
    });

    test('타일 업데이트가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const tileGroup: TileGroupConfig = {
        id: 'oak-floor',
        name: 'Oak Floor',
        floorMeshId: 'oak-mesh',
        tiles: []
      };
      const tile: TileConfig = {
        id: 'tile-1',
        position: { x: 0, y: 0, z: 0 },
        tileGroupId: 'oak-floor'
      };

      act(() => {
        result.current.addTileGroup(tileGroup);
        result.current.addTile('oak-floor', tile);
        result.current.updateTile('oak-floor', 'tile-1', { 
          size: 2,
          objectType: 'water' 
        });
      });

      const group = result.current.tileGroups.get('oak-floor');
      const updatedTile = group?.tiles.find(t => t.id === 'tile-1');
      expect(updatedTile?.size).toBe(2);
      expect(updatedTile?.objectType).toBe('water');
    });

    test('타일 제거가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const tileGroup: TileGroupConfig = {
        id: 'oak-floor',
        name: 'Oak Floor',
        floorMeshId: 'oak-mesh',
        tiles: []
      };
      const tile: TileConfig = {
        id: 'tile-1',
        position: { x: 0, y: 0, z: 0 },
        tileGroupId: 'oak-floor'
      };

      act(() => {
        result.current.addTileGroup(tileGroup);
        result.current.addTile('oak-floor', tile);
        result.current.removeTile('oak-floor', 'tile-1');
      });

      const group = result.current.tileGroups.get('oak-floor');
      expect(group?.tiles).toHaveLength(0);
    });
  });

  describe('위치 스냅 기능', () => {
    test('스냅 기능이 활성화된 경우 위치가 그리드에 맞춰져야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const position: Position3D = { x: 2.3, y: 5, z: 7.8 };

      act(() => {
        result.current.setSnapToGrid(true);
      });

      const snappedPosition = result.current.snapPosition(position);
      expect(snappedPosition.x).toBe(0); // 2.3을 4로 나누고 반올림하면 0
      expect(snappedPosition.y).toBe(5); // y는 변경되지 않음
      expect(snappedPosition.z).toBe(8); // 7.8을 4로 나누고 반올림하면 8
    });

    test('스냅 기능이 비활성화된 경우 원래 위치가 반환되어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const position: Position3D = { x: 2.3, y: 5, z: 7.8 };

      act(() => {
        result.current.setSnapToGrid(false);
      });

      const snappedPosition = result.current.snapPosition(position);
      expect(snappedPosition).toEqual(position);
    });
  });

  describe('위치 충돌 검사', () => {
    test('타일 위치 충돌 검사가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const tileGroup: TileGroupConfig = {
        id: 'oak-floor',
        name: 'Oak Floor',
        floorMeshId: 'oak-mesh',
        tiles: []
      };
      const existingTile: TileConfig = {
        id: 'tile-1',
        position: { x: 0, y: 0, z: 0 },
        tileGroupId: 'oak-floor',
        size: 1
      };

      act(() => {
        result.current.addTileGroup(tileGroup);
        result.current.addTile('oak-floor', existingTile);
      });

      // 같은 위치에 타일 배치 시도
      const conflictPosition: Position3D = { x: 0, y: 0, z: 0 };
      expect(result.current.checkTilePosition(conflictPosition)).toBe(true);

      // 충분히 떨어진 위치는 충돌하지 않음
      const safePosition: Position3D = { x: 10, y: 0, z: 10 };
      expect(result.current.checkTilePosition(safePosition)).toBe(false);
    });

    test('벽 위치 충돌 검사가 올바르게 작동해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());
      const wallGroup: WallGroupConfig = {
        id: 'brick-walls',
        name: 'Brick Walls',
        walls: []
      };
      const existingWall: WallConfig = {
        id: 'wall-1',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        wallGroupId: 'brick-walls'
      };

      act(() => {
        result.current.addWallGroup(wallGroup);
        result.current.addWall('brick-walls', existingWall);
      });

      // 같은 위치와 회전에 벽 배치 시도
      const conflictPosition: Position3D = { x: 0, y: 0, z: 0 };
      expect(result.current.checkWallPosition(conflictPosition, 0)).toBe(true);

      // 다른 위치는 충돌하지 않음
      const safePosition: Position3D = { x: 10, y: 0, z: 10 };
      expect(result.current.checkWallPosition(safePosition, 0)).toBe(false);
    });
  });

  describe('초기화 기능', () => {
    test('initializeDefaults가 기본 데이터를 올바르게 설정해야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.initializeDefaults();
      });

      expect(result.current.initialized).toBe(true);
      expect(result.current.meshes.size).toBeGreaterThan(0);
      expect(result.current.wallGroups.size).toBeGreaterThan(0);
      expect(result.current.tileGroups.size).toBeGreaterThan(0);
      expect(result.current.wallCategories.size).toBeGreaterThan(0);
      expect(result.current.tileCategories.size).toBeGreaterThan(0);
    });

    test('initializeDefaults가 중복 실행되지 않아야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.initializeDefaults();
      });

      const firstMeshCount = result.current.meshes.size;

      act(() => {
        result.current.initializeDefaults();
      });

      expect(result.current.meshes.size).toBe(firstMeshCount);
    });

    test('기본 선택 값이 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useBuildingStore());

      act(() => {
        result.current.initializeDefaults();
      });

      expect(result.current.selectedWallCategoryId).toBeTruthy();
      expect(result.current.selectedWallGroupId).toBeTruthy();
      expect(result.current.selectedTileCategoryId).toBeTruthy();
      expect(result.current.selectedTileGroupId).toBeTruthy();
    });
  });
}); 