import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { 
  BuildingSystemState, 
  MeshConfig, 
  WallGroupConfig, 
  TileGroupConfig,
  WallConfig,
  TileConfig,
  Position3D,
  WallCategory,
  TileCategory
} from '../types';
import { TILE_CONSTANTS } from '../types/constants';

// Enable Map and Set support in Immer
enableMapSet();

interface BuildingStore extends BuildingSystemState {
  initialized: boolean;
  initializeDefaults: () => void;
  
  hoverPosition: Position3D | null;
  setHoverPosition: (position: Position3D | null) => void;
  
  currentTileMultiplier: number;
  setTileMultiplier: (multiplier: number) => void;
  
  currentWallRotation: number;
  setWallRotation: (rotation: number) => void;
  
  selectedTileObjectType: 'water' | 'grass' | 'flag' | 'none';
  setSelectedTileObjectType: (type: 'water' | 'grass' | 'flag' | 'none') => void;
  
  checkTilePosition: (position: Position3D) => boolean;
  checkWallPosition: (position: Position3D, rotation: number) => boolean;
  
  addMesh: (mesh: MeshConfig) => void;
  updateMesh: (id: string, updates: Partial<MeshConfig>) => void;
  removeMesh: (id: string) => void;
  
  addWallCategory: (category: WallCategory) => void;
  updateWallCategory: (id: string, updates: Partial<WallCategory>) => void;
  removeWallCategory: (id: string) => void;
  setSelectedWallCategory: (id: string) => void;
  
  addTileCategory: (category: TileCategory) => void;
  updateTileCategory: (id: string, updates: Partial<TileCategory>) => void;
  removeTileCategory: (id: string) => void;
  setSelectedTileCategory: (id: string) => void;
  
  addWallGroup: (group: WallGroupConfig) => void;
  updateWallGroup: (id: string, updates: Partial<WallGroupConfig>) => void;
  removeWallGroup: (id: string) => void;
  
  addWall: (groupId: string, wall: WallConfig) => void;
  updateWall: (groupId: string, wallId: string, updates: Partial<WallConfig>) => void;
  removeWall: (groupId: string, wallId: string) => void;
  
  addTileGroup: (group: TileGroupConfig) => void;
  updateTileGroup: (id: string, updates: Partial<TileGroupConfig>) => void;
  removeTileGroup: (id: string) => void;
  
  addTile: (groupId: string, tile: TileConfig) => void;
  updateTile: (groupId: string, tileId: string, updates: Partial<TileConfig>) => void;
  removeTile: (groupId: string, tileId: string) => void;
  
  setEditMode: (mode: 'none' | 'wall' | 'tile' | 'npc') => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  
  snapPosition: (position: Position3D) => Position3D;
  isInEditMode: () => boolean;
}

export const useBuildingStore = create<BuildingStore>()(
  immer((set, get) => ({
    initialized: false,
    meshes: new Map(),
    wallGroups: new Map(),
    tileGroups: new Map(),
    wallCategories: new Map(),
    tileCategories: new Map(),
    editMode: 'none',
    showGrid: true,
    gridSize: 100,
    snapToGrid: true,
    hoverPosition: null,
    currentTileMultiplier: 1,
    currentWallRotation: 0,
    selectedTileObjectType: 'none',

    initializeDefaults: () => set((state) => {
      if (state.initialized) return;
      
      // 기본 재질 초기화
      state.meshes.set('brick-wall', {
        id: 'brick-wall',
        color: '#8B4513',
        material: 'STANDARD',
        roughness: 0.8,
      });
      
      state.meshes.set('glass-wall', {
        id: 'glass-wall',
        material: 'GLASS',
        opacity: 0.3,
        transparent: true,
      });
      
      state.meshes.set('concrete-wall', {
        id: 'concrete-wall',
        color: '#808080',
        material: 'STANDARD',
        roughness: 0.9,
      });
      
      state.meshes.set('wood-floor', {
        id: 'wood-floor',
        color: '#654321',
        material: 'STANDARD',
        roughness: 0.6,
      });
      
      state.meshes.set('marble-floor', {
        id: 'marble-floor',
        color: '#f0f0f0',
        material: 'STANDARD',
        roughness: 0.2,
        metalness: 0.1,
      });

      // 기본 벽 카테고리 생성
      state.wallCategories.set('interior-walls', {
        id: 'interior-walls',
        name: 'Interior Walls',
        description: 'Walls for interior spaces',
        wallGroupIds: ['plaster-walls', 'painted-walls']
      });
      
      state.wallCategories.set('exterior-walls', {
        id: 'exterior-walls',
        name: 'Exterior Walls',
        description: 'Walls for building exteriors',
        wallGroupIds: ['brick-walls', 'concrete-walls']
      });
      
      state.wallCategories.set('special-walls', {
        id: 'special-walls',
        name: 'Special Walls',
        description: 'Glass and special material walls',
        wallGroupIds: ['glass-walls']
      });

      // 기본 타일 카테고리 생성
      state.tileCategories.set('wood-floors', {
        id: 'wood-floors',
        name: 'Wood Floors',
        description: 'Various wood flooring options',
        tileGroupIds: ['oak-floor', 'pine-floor']
      });
      
      state.tileCategories.set('stone-floors', {
        id: 'stone-floors',
        name: 'Stone Floors',
        description: 'Marble and stone flooring',
        tileGroupIds: ['marble-floor', 'granite-floor']
      });

      // 기본 그룹 생성
      state.wallGroups.set('brick-walls', {
        id: 'brick-walls',
        name: 'Brick Walls',
        frontMeshId: 'brick-wall',
        backMeshId: 'brick-wall',
        sideMeshId: 'brick-wall',
        walls: [],
      });
      
      state.wallGroups.set('glass-walls', {
        id: 'glass-walls',
        name: 'Glass Walls',
        frontMeshId: 'glass-wall',
        backMeshId: 'glass-wall',
        sideMeshId: 'glass-wall',
        walls: [],
      });
      
      state.wallGroups.set('concrete-walls', {
        id: 'concrete-walls',
        name: 'Concrete Walls',
        frontMeshId: 'concrete-wall',
        backMeshId: 'concrete-wall',
        sideMeshId: 'concrete-wall',
        walls: [],
      });
      
      state.wallGroups.set('plaster-walls', {
        id: 'plaster-walls',
        name: 'Plaster Walls',
        frontMeshId: 'brick-wall', // 임시로 brick 재질 사용
        backMeshId: 'brick-wall',
        sideMeshId: 'brick-wall',
        walls: [],
      });
      
      state.wallGroups.set('painted-walls', {
        id: 'painted-walls',
        name: 'Painted Walls',
        frontMeshId: 'brick-wall', // 임시로 brick 재질 사용
        backMeshId: 'brick-wall',
        sideMeshId: 'brick-wall',
        walls: [],
      });
      
      state.tileGroups.set('oak-floor', {
        id: 'oak-floor',
        name: 'Oak Wood Floor',
        floorMeshId: 'wood-floor',
        tiles: [],
      });
      
      state.tileGroups.set('pine-floor', {
        id: 'pine-floor',
        name: 'Pine Wood Floor',
        floorMeshId: 'wood-floor',
        tiles: [],
      });
      
      state.tileGroups.set('marble-floor', {
        id: 'marble-floor',
        name: 'Marble Floor',
        floorMeshId: 'marble-floor',
        tiles: [],
      });
      
      state.tileGroups.set('granite-floor', {
        id: 'granite-floor',
        name: 'Granite Floor',
        floorMeshId: 'marble-floor', // 임시로 marble 재질 사용
        tiles: [],
      });
      
      // 기본 선택 설정
      state.selectedWallCategoryId = 'exterior-walls';
      state.selectedWallGroupId = 'brick-walls';
      state.selectedTileCategoryId = 'wood-floors';
      state.selectedTileGroupId = 'oak-floor';
      
      // 기본 바닥 타일 추가 (10x10 그리드)
      const oakFloorGroup = state.tileGroups.get('oak-floor');
      if (oakFloorGroup) {
        const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
        const startX = -5 * cellSize;
        const startZ = -5 * cellSize;
        
        for (let x = 0; x < 10; x++) {
          for (let z = 0; z < 10; z++) {
            oakFloorGroup.tiles.push({
              id: `default-tile-${x}-${z}`,
              position: {
                x: startX + x * cellSize,
                y: 0,
                z: startZ + z * cellSize
              },
              tileGroupId: oakFloorGroup.id,
              size: 1
            });
          }
        }
      }
      
      state.initialized = true;
    }),

    addMesh: (mesh) => set((state) => {
      state.meshes.set(mesh.id, mesh);
    }),

    updateMesh: (id, updates) => set((state) => {
      const mesh = state.meshes.get(id);
      if (mesh) {
        state.meshes.set(id, { ...mesh, ...updates });
      }
    }),

    removeMesh: (id) => set((state) => {
      state.meshes.delete(id);
    }),

    addWallGroup: (group) => set((state) => {
      state.wallGroups.set(group.id, group);
    }),

    updateWallGroup: (id, updates) => set((state) => {
      const group = state.wallGroups.get(id);
      if (group) {
        state.wallGroups.set(id, { ...group, ...updates });
      }
    }),

    removeWallGroup: (id) => set((state) => {
      state.wallGroups.delete(id);
    }),

    addWall: (groupId, wall) => set((state) => {
      const group = state.wallGroups.get(groupId);
      if (group) {
        group.walls.push(wall);
      }
    }),

    updateWall: (groupId, wallId, updates) => set((state) => {
      const group = state.wallGroups.get(groupId);
      if (group) {
        const wallIndex = group.walls.findIndex(w => w.id === wallId);
        if (wallIndex !== -1) {
          const wall = group.walls[wallIndex];
          if (wall) {
            Object.assign(wall, updates);
          }
        }
      }
    }),

    removeWall: (groupId, wallId) => set((state) => {
      const group = state.wallGroups.get(groupId);
      if (group) {
        group.walls = group.walls.filter(w => w.id !== wallId);
      }
    }),

    addTileGroup: (group) => set((state) => {
      state.tileGroups.set(group.id, group);
    }),

    updateTileGroup: (id, updates) => set((state) => {
      const group = state.tileGroups.get(id);
      if (group) {
        state.tileGroups.set(id, { ...group, ...updates });
      }
    }),

    removeTileGroup: (id) => set((state) => {
      state.tileGroups.delete(id);
    }),

    addTile: (groupId, tile) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        const tileWithObject: TileConfig = {
          ...tile,
          objectType: state.selectedTileObjectType,
          ...(state.selectedTileObjectType === 'grass'
            ? { objectConfig: { grassDensity: 1000 } }
            : {}),
        };
        group.tiles.push(tileWithObject);
      }
    }),

    updateTile: (groupId, tileId, updates) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        const tileIndex = group.tiles.findIndex(t => t.id === tileId);
        if (tileIndex !== -1) {
          const tile = group.tiles[tileIndex];
          if (tile) {
            Object.assign(tile, updates);
          }
        }
      }
    }),

    removeTile: (groupId, tileId) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        group.tiles = group.tiles.filter(t => t.id !== tileId);
      }
    }),

    setEditMode: (mode) => set((state) => {
      state.editMode = mode;
      if (mode !== 'none') {
        state.showGrid = true;
      }
    }),

    setShowGrid: (show) => set((state) => {
      state.showGrid = show;
    }),

    setGridSize: (size) => set((state) => {
      state.gridSize = size;
    }),

    setSnapToGrid: (snap) => set((state) => {
      state.snapToGrid = snap;
    }),

    setHoverPosition: (position) => set((state) => {
      state.hoverPosition = position;
    }),

    setTileMultiplier: (multiplier) => set((state) => {
      state.currentTileMultiplier = multiplier;
    }),

    setWallRotation: (rotation) => set((state) => {
      state.currentWallRotation = rotation;
    }),

    snapPosition: (position) => {
      const { snapToGrid } = get();
      if (!snapToGrid) return position;
      
      const snapSize = TILE_CONSTANTS.SNAP_GRID_SIZE;
      return {
        x: Math.round(position.x / snapSize) * snapSize,
        y: position.y,
        z: Math.round(position.z / snapSize) * snapSize,
      };
    },
    
    checkTilePosition: (position) => {
      const { tileGroups, currentTileMultiplier } = get();
      const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
      const tileSize = cellSize * currentTileMultiplier;
      const halfSize = tileSize / 2;
      
      for (const group of tileGroups.values()) {
        for (const tile of group.tiles) {
          const existingTileSize = (tile.size || 1) * cellSize;
          const existingHalfSize = existingTileSize / 2;
          
          // 두 타일의 경계가 겹치는지 확인
          if (
            Math.abs(tile.position.x - position.x) < (halfSize + existingHalfSize - 0.1) &&
            Math.abs(tile.position.z - position.z) < (halfSize + existingHalfSize - 0.1)
          ) {
            return true;
          }
        }
      }
      return false;
    },
    
    checkWallPosition: (position, rotation) => {
      const { wallGroups } = get();
      const tolerance = 0.5;
      
      for (const group of wallGroups.values()) {
        for (const wall of group.walls) {
          // 간단한 근접 체크 (더 정교한 충돌 검사가 필요할 수 있음)
          if (
            Math.abs(wall.position.x - position.x) < tolerance &&
            Math.abs(wall.position.z - position.z) < tolerance &&
            Math.abs(wall.rotation.y - rotation) < 0.1
          ) {
            return true;
          }
        }
      }
      return false;
    },
    
    isInEditMode: () => {
      const { editMode } = get();
      return editMode !== 'none';
    },

    addWallCategory: (category) => set((state) => {
      state.wallCategories.set(category.id, category);
    }),
    
    updateWallCategory: (id, updates) => set((state) => {
      const category = state.wallCategories.get(id);
      if (category) {
        state.wallCategories.set(id, { ...category, ...updates });
      }
    }),
    
    removeWallCategory: (id) => set((state) => {
      state.wallCategories.delete(id);
    }),
    
    setSelectedWallCategory: (id) => set((state) => {
      state.selectedWallCategoryId = id;
      const category = state.wallCategories.get(id);
      if (category && category.wallGroupIds.length > 0) {
        const firstWallGroupId = category.wallGroupIds[0];
        if (firstWallGroupId) {
          state.selectedWallGroupId = firstWallGroupId;
        }
      }
    }),
    
    addTileCategory: (category) => set((state) => {
      state.tileCategories.set(category.id, category);
    }),
    
    updateTileCategory: (id, updates) => set((state) => {
      const category = state.tileCategories.get(id);
      if (category) {
        state.tileCategories.set(id, { ...category, ...updates });
      }
    }),
    
    removeTileCategory: (id) => set((state) => {
      state.tileCategories.delete(id);
    }),
    
    setSelectedTileCategory: (id) => set((state) => {
      state.selectedTileCategoryId = id;
      const category = state.tileCategories.get(id);
      if (category && category.tileGroupIds.length > 0) {
        const firstTileGroupId = category.tileGroupIds[0];
        if (firstTileGroupId) {
          state.selectedTileGroupId = firstTileGroupId;
        }
      }
    }),
    
    setSelectedTileObjectType: (type) => set((state) => {
      state.selectedTileObjectType = type;
    }),
  }))
); 