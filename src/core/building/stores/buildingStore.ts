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
  TileObjectType,
  Position3D,
  WallCategory,
  TileCategory,
  FlagStyle,
  FLAG_STYLE_META,
} from '../types';
import { TILE_CONSTANTS } from '../types/constants';

// Enable Map and Set support in Immer
enableMapSet();

type TileMeta = { x: number; z: number; halfSize: number };
type WallMeta = { x: number; z: number; rotY: number };

const zigZag = (n: number): number => (n >= 0 ? n * 2 : (-n * 2) - 1);
const pair = (a: number, b: number): number => {
  const A = zigZag(a);
  const B = zigZag(b);
  const sum = A + B;
  return (sum * (sum + 1)) / 2 + B;
};

const unindexId = (cells: Map<number, Set<string>>, cellsById: Map<string, number[]>, id: string): void => {
  const keys = cellsById.get(id);
  if (!keys) return;
  for (const key of keys) {
    const set = cells.get(key);
    if (!set) continue;
    set.delete(id);
    if (set.size === 0) cells.delete(key);
  }
  cellsById.delete(id);
};

const indexAabb = (
  cells: Map<number, Set<string>>,
  cellsById: Map<string, number[]>,
  id: string,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  cellSize: number,
): void => {
  const minCellX = Math.floor(minX / cellSize);
  const maxCellX = Math.floor(maxX / cellSize);
  const minCellZ = Math.floor(minZ / cellSize);
  const maxCellZ = Math.floor(maxZ / cellSize);

  const keys: number[] = [];
  for (let cx = minCellX; cx <= maxCellX; cx++) {
    for (let cz = minCellZ; cz <= maxCellZ; cz++) {
      const key = pair(cx, cz);
      let set = cells.get(key);
      if (!set) {
        set = new Set<string>();
        cells.set(key, set);
      }
      set.add(id);
      keys.push(key);
    }
  }
  cellsById.set(id, keys);
};

interface BuildingStore extends BuildingSystemState {
  initialized: boolean;
  initializeDefaults: () => void;

  // Internal spatial indexes for fast placement checks.
  tileIndex: Map<number, Set<string>>;
  tileCells: Map<string, number[]>;
  tileMeta: Map<string, TileMeta>;
  wallIndex: Map<number, Set<string>>;
  wallCells: Map<string, number[]>;
  wallMeta: Map<string, WallMeta>;
  
  hoverPosition: Position3D | null;
  setHoverPosition: (position: Position3D | null) => void;
  
  currentTileMultiplier: number;
  setTileMultiplier: (multiplier: number) => void;
  
  currentWallRotation: number;
  setWallRotation: (rotation: number) => void;
  
  selectedTileObjectType: TileObjectType;
  setSelectedTileObjectType: (type: TileObjectType) => void;

  currentFlagWidth: number;
  currentFlagHeight: number;
  currentFlagImageUrl: string;
  currentFlagStyle: FlagStyle;
  setFlagWidth: (width: number) => void;
  setFlagHeight: (height: number) => void;
  setFlagImageUrl: (url: string) => void;
  setFlagStyle: (style: FlagStyle) => void;

  currentFireIntensity: number;
  setFireIntensity: (intensity: number) => void;

  currentBillboardText: string;
  currentBillboardImageUrl: string;
  currentBillboardColor: string;
  setBillboardText: (text: string) => void;
  setBillboardImageUrl: (url: string) => void;
  setBillboardColor: (color: string) => void;

  showSnow: boolean;
  setShowSnow: (show: boolean) => void;
  
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
    tileIndex: new Map(),
    tileCells: new Map(),
    tileMeta: new Map(),
    wallIndex: new Map(),
    wallCells: new Map(),
    wallMeta: new Map(),
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
    currentFlagWidth: 1.5,
    currentFlagHeight: 1.0,
    currentFlagImageUrl: '',
    currentFlagStyle: 'flag' as FlagStyle,
    currentFireIntensity: 1.5,
    currentBillboardText: 'HELLO',
    currentBillboardImageUrl: '',
    currentBillboardColor: '#00ff88',
    showSnow: false,

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

      // 데모 레이아웃: 7x7 센터 플라자 + 오브젝트 쇼케이스
      //
      //  gx: -3  -2  -1   0   1   2   3
      //  -----------------------------------
      // -3  oak  oak  oak FLAG oak GRSS GRSS
      // -2  oak  oak  oak  oak oak GRSS GRSS
      // -1  WTR  oak  MRB  MRB MRB oak  oak
      //  0  WTR  oak  MRB  MRB MRB oak  oak
      //  1  oak  oak  MRB  MRB MRB oak  oak
      //  2  oak SIGN  oak  oak oak  oak FIRE
      //  3  oak  oak  oak  oak oak  oak  oak

      const oakFloorGroup = state.tileGroups.get('oak-floor');
      const marbleFloorGroup = state.tileGroups.get('marble-floor');
      const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;

      const addTileToState = (
        group: TileGroupConfig,
        tile: TileConfig,
      ): void => {
        group.tiles.push(tile);
        const hs = ((tile.size || 1) * cellSize) / 2;
        state.tileMeta.set(tile.id, { x: tile.position.x, z: tile.position.z, halfSize: hs });
        indexAabb(
          state.tileIndex, state.tileCells, tile.id,
          tile.position.x - hs, tile.position.x + hs,
          tile.position.z - hs, tile.position.z + hs,
          cellSize,
        );
      };

      if (oakFloorGroup && marbleFloorGroup) {
        for (let gx = -3; gx <= 3; gx++) {
          for (let gz = -3; gz <= 3; gz++) {
            const px = gx * cellSize;
            const pz = gz * cellSize;

            const isMarble = Math.abs(gx) <= 1 && Math.abs(gz) <= 1;
            const isGrass = gx >= 2 && gz <= -2;
            const isWater = gx === -3 && (gz === -1 || gz === 0);
            const isFlag = gx === 0 && gz === -3;
            const isFire = gx === 3 && gz === 2;
            const isBillboard = gx === -2 && gz === 2;

            const group = isMarble ? marbleFloorGroup : oakFloorGroup;

            const base: TileConfig = {
              id: `demo-${gx + 3}-${gz + 3}`,
              position: { x: px, y: 0, z: pz },
              tileGroupId: group.id,
              size: 1,
            };

            if (isGrass) {
              addTileToState(group, { ...base, objectType: 'grass', objectConfig: { grassDensity: 800 } });
            } else if (isWater) {
              addTileToState(group, { ...base, objectType: 'water' });
            } else if (isFlag) {
              addTileToState(group, {
                ...base,
                objectType: 'flag',
                objectConfig: { flagWidth: 1.5, flagHeight: 1.0, flagStyle: 'flag' as FlagStyle },
              });
            } else if (isFire) {
              addTileToState(group, { ...base, objectType: 'fire', objectConfig: { fireIntensity: 1.5 } });
            } else if (isBillboard) {
              addTileToState(group, {
                ...base,
                objectType: 'billboard',
                objectConfig: { billboardText: 'GAESUP\nWORLD', billboardColor: '#00ff88' },
              });
            } else {
              addTileToState(group, base);
            }
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
      const group = state.wallGroups.get(id);
      if (group) {
        for (const wall of group.walls) {
          unindexId(state.wallIndex, state.wallCells, wall.id);
          state.wallMeta.delete(wall.id);
        }
      }
      state.wallGroups.delete(id);
    }),

    addWall: (groupId, wall) => set((state) => {
      const group = state.wallGroups.get(groupId);
      if (group) {
        group.walls.push(wall);

        const tol = 0.5;
        state.wallMeta.set(wall.id, { x: wall.position.x, z: wall.position.z, rotY: wall.rotation.y });
        indexAabb(
          state.wallIndex,
          state.wallCells,
          wall.id,
          wall.position.x - tol,
          wall.position.x + tol,
          wall.position.z - tol,
          wall.position.z + tol,
          1,
        );
      }
    }),

    updateWall: (groupId, wallId, updates) => set((state) => {
      const group = state.wallGroups.get(groupId);
      if (group) {
        const wallIndex = group.walls.findIndex(w => w.id === wallId);
        if (wallIndex !== -1) {
          const wall = group.walls[wallIndex];
          if (wall) {
            const shouldReindex = updates.position !== undefined || updates.rotation !== undefined;
            if (shouldReindex) {
              unindexId(state.wallIndex, state.wallCells, wallId);
              state.wallMeta.delete(wallId);
            }
            Object.assign(wall, updates);

            if (shouldReindex) {
              const tol = 0.5;
              state.wallMeta.set(wall.id, { x: wall.position.x, z: wall.position.z, rotY: wall.rotation.y });
              indexAabb(
                state.wallIndex,
                state.wallCells,
                wall.id,
                wall.position.x - tol,
                wall.position.x + tol,
                wall.position.z - tol,
                wall.position.z + tol,
                1,
              );
            }
          }
        }
      }
    }),

    removeWall: (groupId, wallId) => set((state) => {
      const group = state.wallGroups.get(groupId);
      if (group) {
        unindexId(state.wallIndex, state.wallCells, wallId);
        state.wallMeta.delete(wallId);
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
      const group = state.tileGroups.get(id);
      if (group) {
        for (const tile of group.tiles) {
          unindexId(state.tileIndex, state.tileCells, tile.id);
          state.tileMeta.delete(tile.id);
        }
      }
      state.tileGroups.delete(id);
    }),

    addTile: (groupId, tile) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        const objectConfig: TileConfig['objectConfig'] =
          state.selectedTileObjectType === 'grass'
            ? { grassDensity: 1000 }
            : state.selectedTileObjectType === 'flag'
              ? {
                  flagWidth: state.currentFlagWidth,
                  flagHeight: state.currentFlagHeight,
                  flagStyle: state.currentFlagStyle,
                  ...(state.currentFlagImageUrl ? { flagTexture: state.currentFlagImageUrl } : {}),
                }
              : state.selectedTileObjectType === 'fire'
                ? { fireIntensity: state.currentFireIntensity }
                : state.selectedTileObjectType === 'billboard'
                  ? {
                      billboardText: state.currentBillboardText,
                      billboardColor: state.currentBillboardColor,
                      ...(state.currentBillboardImageUrl ? { billboardImageUrl: state.currentBillboardImageUrl } : {}),
                    }
                  : undefined;
        const tileWithObject: TileConfig = {
          ...tile,
          objectType: state.selectedTileObjectType,
          ...(objectConfig ? { objectConfig } : {}),
        };
        group.tiles.push(tileWithObject);

        const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
        const halfSize = ((tileWithObject.size || 1) * cellSize) / 2;
        state.tileMeta.set(tileWithObject.id, { x: tileWithObject.position.x, z: tileWithObject.position.z, halfSize });
        indexAabb(
          state.tileIndex,
          state.tileCells,
          tileWithObject.id,
          tileWithObject.position.x - halfSize,
          tileWithObject.position.x + halfSize,
          tileWithObject.position.z - halfSize,
          tileWithObject.position.z + halfSize,
          cellSize,
        );
      }
    }),

    updateTile: (groupId, tileId, updates) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        const tileIndex = group.tiles.findIndex(t => t.id === tileId);
        if (tileIndex !== -1) {
          const tile = group.tiles[tileIndex];
          if (tile) {
            const shouldReindex = updates.position !== undefined || updates.size !== undefined;
            if (shouldReindex) {
              unindexId(state.tileIndex, state.tileCells, tileId);
              state.tileMeta.delete(tileId);
            }
            Object.assign(tile, updates);

            if (shouldReindex) {
              const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
              const halfSize = ((tile.size || 1) * cellSize) / 2;
              state.tileMeta.set(tile.id, { x: tile.position.x, z: tile.position.z, halfSize });
              indexAabb(
                state.tileIndex,
                state.tileCells,
                tile.id,
                tile.position.x - halfSize,
                tile.position.x + halfSize,
                tile.position.z - halfSize,
                tile.position.z + halfSize,
                cellSize,
              );
            }
          }
        }
      }
    }),

    removeTile: (groupId, tileId) => set((state) => {
      const group = state.tileGroups.get(groupId);
      if (group) {
        unindexId(state.tileIndex, state.tileCells, tileId);
        state.tileMeta.delete(tileId);
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
      const { tileIndex, tileMeta, currentTileMultiplier } = get();
      const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE;
      const halfSize = (cellSize * currentTileMultiplier) / 2;

      const minX = position.x - halfSize;
      const maxX = position.x + halfSize;
      const minZ = position.z - halfSize;
      const maxZ = position.z + halfSize;

      const minCellX = Math.floor(minX / cellSize);
      const maxCellX = Math.floor(maxX / cellSize);
      const minCellZ = Math.floor(minZ / cellSize);
      const maxCellZ = Math.floor(maxZ / cellSize);

      for (let cx = minCellX; cx <= maxCellX; cx++) {
        for (let cz = minCellZ; cz <= maxCellZ; cz++) {
          const key = pair(cx, cz);
          const set = tileIndex.get(key);
          if (!set) continue;
          for (const id of set) {
            const meta = tileMeta.get(id);
            if (!meta) continue;
            if (
              Math.abs(meta.x - position.x) < (halfSize + meta.halfSize - 0.1) &&
              Math.abs(meta.z - position.z) < (halfSize + meta.halfSize - 0.1)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    
    checkWallPosition: (position, rotation) => {
      const { wallIndex, wallMeta } = get();
      const tolerance = 0.5;

      const minX = position.x - tolerance;
      const maxX = position.x + tolerance;
      const minZ = position.z - tolerance;
      const maxZ = position.z + tolerance;

      const minCellX = Math.floor(minX / 1);
      const maxCellX = Math.floor(maxX / 1);
      const minCellZ = Math.floor(minZ / 1);
      const maxCellZ = Math.floor(maxZ / 1);

      for (let cx = minCellX; cx <= maxCellX; cx++) {
        for (let cz = minCellZ; cz <= maxCellZ; cz++) {
          const key = pair(cx, cz);
          const set = wallIndex.get(key);
          if (!set) continue;
          for (const id of set) {
            const meta = wallMeta.get(id);
            if (!meta) continue;
            if (
              Math.abs(meta.x - position.x) < tolerance &&
              Math.abs(meta.z - position.z) < tolerance &&
              Math.abs(meta.rotY - rotation) < 0.1
            ) {
              return true;
            }
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

    setFlagWidth: (width) => set((state) => { state.currentFlagWidth = width; }),
    setFlagHeight: (height) => set((state) => { state.currentFlagHeight = height; }),
    setFlagImageUrl: (url) => set((state) => { state.currentFlagImageUrl = url; }),
    setFlagStyle: (style) => set((state) => {
      state.currentFlagStyle = style;
      const meta = FLAG_STYLE_META[style];
      state.currentFlagWidth = meta.defaultWidth;
      state.currentFlagHeight = meta.defaultHeight;
    }),

    setFireIntensity: (intensity) => set((state) => { state.currentFireIntensity = intensity; }),

    setBillboardText: (text) => set((state) => { state.currentBillboardText = text; }),
    setBillboardImageUrl: (url) => set((state) => { state.currentBillboardImageUrl = url; }),
    setBillboardColor: (color) => set((state) => { state.currentBillboardColor = color; }),

    setShowSnow: (show) => set((state) => { state.showSnow = show; }),
  }))
); 