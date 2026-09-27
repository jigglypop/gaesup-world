import type { Draft } from 'immer';

import type { BuildingSpatialIndex } from './spatialIndex';
import type {
  BuildingBlockConfig,
  BuildingSerializedState,
  BuildingTool,
  BuildingSystemState,
  BuildingTreeKind,
  BuildingWallKind,
  BuildingWeatherEffect,
  BuildingWorldSurface,
  FlagStyle,
  MeshConfig,
  PlacedObject,
  PlacedObjectType,
  Position3D,
  TileCategory,
  TileConfig,
  TileGroupConfig,
  TileObjectType,
  TileShapeType,
  WallCategory,
  WallConfig,
  WallGroupConfig,
} from '../types';

export interface BuildingStore extends BuildingSystemState {
  initialized: boolean;
  initializeDefaults: () => void;

  // Internal spatial indexes for fast placement checks.
  spatialIndex: BuildingSpatialIndex;

  hoverPosition: Position3D | null;
  setHoverPosition: (position: Position3D | null) => void;

  /**
   * What a click does in the edit mode: `place` new pieces (default); `paint` the tile clicked with the current floor
   * and ground cover, or the wall clicked with the current wall type and kind; `erase` the piece clicked, objects too.
   */
  buildingTool: BuildingTool;
  setBuildingTool: (tool: BuildingTool) => void;
  /** Paints or erases the piece of the current edit mode with this id, as the tool says; nothing for `place`. */
  applyToolTo: (id: string) => void;

  currentTileMultiplier: number;
  setTileMultiplier: (multiplier: number) => void;
  currentTileHeight: number;
  setTileHeight: (height: number) => void;
  currentTileShape: TileShapeType;
  setTileShape: (shape: TileShapeType) => void;
  currentTileRotation: number;
  setTileRotation: (rotation: number) => void;
  currentTileMaterialId: string | null;
  setCurrentTileMaterialId: (materialId: string | null) => void;
  currentCustomTileName: string;
  currentCustomTileColor: string;
  currentCustomTileTextureUrl: string;
  setCustomTileDraft: (
    draft: Partial<{
      name: string;
      color: string;
      textureUrl: string;
    }>,
  ) => void;
  applyTilePreset: (presetId: string) => void;
  applyCustomTile: () => void;

  currentWallRotation: number;
  setWallRotation: (rotation: number) => void;
  currentWallMaterialId: string | null;
  setCurrentWallMaterialId: (materialId: string | null) => void;
  currentWallKind: BuildingWallKind;
  setWallKind: (kind: BuildingWallKind) => void;
  applyWallPreset: (presetId: string) => void;

  selectedTileObjectType: TileObjectType;
  setSelectedTileObjectType: (type: TileObjectType) => void;
  currentTerrainColor: string;
  currentTerrainAccentColor: string;
  setTerrainColors: (color: string, accentColor?: string) => void;

  selectedPlacedObjectType: PlacedObjectType | 'none';
  setSelectedPlacedObjectType: (type: PlacedObjectType | 'none') => void;
  selectedModelObjectId: string;
  setSelectedModelObjectId: (id: string) => void;
  currentModelUrl: string;
  setModelUrl: (url: string) => void;
  currentModelScale: number;
  setModelScale: (scale: number) => void;
  currentModelColor: string;
  setModelColor: (color: string) => void;
  selectedWallId: string | null;
  selectedTileId: string | null;
  selectedBlockId: string | null;
  setSelectedWallId: (id: string | null) => void;
  setSelectedTileId: (id: string | null) => void;
  setSelectedBlockId: (id: string | null) => void;

  currentFlagWidth: number;
  currentFlagHeight: number;
  currentFlagImageUrl: string;
  currentFlagStyle: FlagStyle;
  setFlagWidth: (width: number) => void;
  setFlagHeight: (height: number) => void;
  setFlagImageUrl: (url: string) => void;
  setFlagStyle: (style: FlagStyle) => void;

  currentFireIntensity: number;
  currentFireWidth: number;
  currentFireHeight: number;
  currentFireColor: string;
  setFireIntensity: (intensity: number) => void;
  setFireWidth: (width: number) => void;
  setFireHeight: (height: number) => void;
  setFireColor: (color: string) => void;

  currentObjectRotation: number;
  setObjectRotation: (rotation: number) => void;

  currentObjectPrimaryColor: string;
  currentObjectSecondaryColor: string;
  currentTreeKind: BuildingTreeKind;
  setObjectPrimaryColor: (color: string) => void;
  setObjectSecondaryColor: (color: string) => void;
  setTreeKind: (kind: BuildingTreeKind) => void;

  currentBillboardText: string;
  currentBillboardImageUrl: string;
  currentBillboardColor: string;
  currentBillboardWidth: number;
  currentBillboardHeight: number;
  currentBillboardScale: number;
  currentBillboardOffsetY: number;
  currentBillboardElevation: number;
  currentBillboardIntensity: number;
  setBillboardText: (text: string) => void;
  setBillboardImageUrl: (url: string) => void;
  setBillboardColor: (color: string) => void;
  setBillboardWidth: (width: number) => void;
  setBillboardHeight: (height: number) => void;
  setBillboardScale: (scale: number) => void;
  setBillboardOffsetY: (offsetY: number) => void;
  setBillboardElevation: (elevation: number) => void;
  setBillboardIntensity: (intensity: number) => void;

  addObject: (obj: PlacedObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<PlacedObject>) => void;

  showSnow: boolean;
  setShowSnow: (show: boolean) => void;
  showFog: boolean;
  setShowFog: (show: boolean) => void;
  fogColor: string;
  setFogColor: (color: string) => void;
  weatherEffect: BuildingWeatherEffect;
  setWeatherEffect: (effect: BuildingWeatherEffect) => void;
  worldSurface: BuildingWorldSurface;
  setWorldSurface: (surface: BuildingWorldSurface) => void;

  checkTilePosition: (position: Position3D) => boolean;
  checkBlockPosition: (block: Pick<BuildingBlockConfig, 'position' | 'size' | 'cell'>) => boolean;
  checkWallPosition: (position: Position3D, rotation: number) => boolean;
  /**
   * Returns the Y position (m) at which a new tile placed at `position` would
   * rest on top of each existing tile that overlaps the XZ footprint. Returns
   * 0 when nothing is below.
   */
  getSupportHeightAt: (position: Position3D) => number;

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
  moveWallToGroup: (wallId: string, targetGroupId: string) => void;
  removeWall: (groupId: string, wallId: string) => void;

  addTileGroup: (group: TileGroupConfig) => void;
  updateTileGroup: (id: string, updates: Partial<TileGroupConfig>) => void;
  removeTileGroup: (id: string) => void;

  addTile: (groupId: string, tile: TileConfig) => void;
  updateTile: (groupId: string, tileId: string, updates: Partial<TileConfig>) => void;
  removeTile: (groupId: string, tileId: string) => void;

  addBlock: (block: BuildingBlockConfig) => void;
  updateBlock: (blockId: string, updates: Partial<BuildingBlockConfig>) => void;
  removeBlock: (blockId: string) => void;

  setEditMode: (mode: BuildingSystemState['editMode']) => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;

  snapPosition: (position: Position3D) => Position3D;
  isInEditMode: () => boolean;
  serialize: () => BuildingSerializedState;
  hydrate: (data: Partial<BuildingSerializedState> | null | undefined) => void;
  prepareHydrate: (data: Partial<BuildingSerializedState> | null | undefined) => () => void;
}

/** The immer `set` and `get` the store's action groups share. */
export type BuildingSet = (recipe: (state: Draft<BuildingStore>) => void) => void;
export type BuildingGet = () => BuildingStore;
