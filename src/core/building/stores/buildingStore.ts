import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { 
  BuildingSystemState, 
  MeshConfig, 
  WallGroupConfig, 
  TileGroupConfig,
  WallConfig,
  TileConfig,
  Position3D
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
  
  checkTilePosition: (position: Position3D) => boolean;
  checkWallPosition: (position: Position3D, rotation: number) => boolean;
  
  addMesh: (mesh: MeshConfig) => void;
  updateMesh: (id: string, updates: Partial<MeshConfig>) => void;
  removeMesh: (id: string) => void;
  
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
  
  setEditMode: (mode: 'none' | 'wall' | 'tile') => void;
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
    selectedWallGroupId: undefined,
    selectedTileGroupId: undefined,
    editMode: 'none',
    showGrid: true,
    gridSize: 100,
    snapToGrid: true,
    hoverPosition: null,
    currentTileMultiplier: 1,
    currentWallRotation: 0,

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
      
      state.meshes.set('wood-floor', {
        id: 'wood-floor',
        color: '#654321',
        material: 'STANDARD',
        roughness: 0.6,
      });

      // 기본 그룹 생성
      state.wallGroups.set('default-walls', {
        id: 'default-walls',
        name: 'Default Walls',
        frontMeshId: 'brick-wall',
        backMeshId: 'brick-wall',
        sideMeshId: 'brick-wall',
        walls: [],
      });
      
      state.tileGroups.set('default-tiles', {
        id: 'default-tiles',
        name: 'Default Tiles',
        floorMeshId: 'wood-floor',
        tiles: [],
      });
      
      // 기본 선택 설정
      state.selectedWallGroupId = 'default-walls';
      state.selectedTileGroupId = 'default-tiles';
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
          group.walls[wallIndex] = { ...group.walls[wallIndex], ...updates };
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
        group.tiles.push(tile);
      }
    }),

    updateTile: (groupId, tileId, updates) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        const tileIndex = group.tiles.findIndex(t => t.id === tileId);
        if (tileIndex !== -1) {
          group.tiles[tileIndex] = { ...group.tiles[tileIndex], ...updates };
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
  }))
); 