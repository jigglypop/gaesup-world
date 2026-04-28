import type { CellCoord, EdgeCoord } from '../../grid';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface MeshConfig {
  id: string;
  assetId?: string;
  color?: string;
  material?: 'STANDARD' | 'GLASS' | 'METAL';
  textureUrl?: string;
  mapTextureUrl?: string;
  normalTextureUrl?: string;
  materialParams?: {
    color?: string;
    mapTextureUrl?: string;
    normalTextureUrl?: string;
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
  };
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
}

export interface WallConfig {
  id: string;
  position: Position3D;
  rotation: Rotation3D;
  wallGroupId: string;
  edge?: EdgeCoord;
  width?: number;
  height?: number;
  depth?: number;
}

export interface WallGroupConfig {
  id: string;
  name: string;
  frontMeshId?: string;
  backMeshId?: string;
  sideMeshId?: string;
  walls: WallConfig[];
}

export type TileObjectType = 'water' | 'grass' | 'sand' | 'snowfield' | 'none';
export type PlacedObjectType = 'sakura' | 'flag' | 'fire' | 'billboard';
export type TileShapeType = 'box' | 'stairs' | 'round' | 'ramp';

export interface ObjectConfig {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  flagTexture?: string;
  flagWidth?: number;
  flagHeight?: number;
  flagStyle?: FlagStyle;
  fireIntensity?: number;
  fireWidth?: number;
  fireHeight?: number;
  fireColor?: string;
  billboardText?: string;
  billboardImageUrl?: string;
  billboardColor?: string;
}

export interface PlacedObject {
  id: string;
  type: PlacedObjectType;
  position: Position3D;
  rotation?: number;
  config?: ObjectConfig;
}

export interface BillboardConfig {
  id: string;
  position: Position3D;
  width: number;
  height: number;
  rotation?: Partial<Rotation3D>;
  text?: string;
  imageUrl?: string;
  color?: string;
}

export interface BloomConfig {
  id: string;
  position: Position3D;
  intensity?: number;
  color?: string;
}

export interface TileConfig {
  id: string;
  position: Position3D;
  tileGroupId: string;
  materialId?: string;
  cell?: CellCoord;
  footprint?: CellCoord[];
  size?: number;
  rotation?: number;
  shape?: TileShapeType;
  objectType?: TileObjectType;
  objectConfig?: {
    /** Blades per square meter. The mesh layer multiplies this by tile area. */
    grassDensity?: number;
    waterScale?: number;
    terrainColor?: string;
    terrainAccentColor?: string;
  };
}

export interface BuildingBlockConfig {
  id: string;
  position: Position3D;
  cell?: CellCoord;
  size?: {
    x?: number;
    y?: number;
    z?: number;
  };
  materialId?: string;
  tags?: string[];
}

export interface BuildingSerializedState {
  version: 1;
  meshes: MeshConfig[];
  wallGroups: WallGroupConfig[];
  tileGroups: TileGroupConfig[];
  blocks: BuildingBlockConfig[];
  objects: PlacedObject[];
}

export type FlagStyle = 'flag' | 'banner' | 'panel' | 'placard';

export const FLAG_STYLE_META: Record<FlagStyle, {
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  windStrength: number;
  poleType: 'side' | 'top' | 'frame' | 'both';
}> = {
  flag:    { label: 'Flag',    defaultWidth: 1.5, defaultHeight: 1.0, windStrength: 1.0, poleType: 'side' },
  banner:  { label: 'Banner',  defaultWidth: 1.2, defaultHeight: 3.0, windStrength: 0.3, poleType: 'top' },
  panel:   { label: 'Panel',   defaultWidth: 2.0, defaultHeight: 1.5, windStrength: 0.0, poleType: 'frame' },
  placard: { label: 'Placard', defaultWidth: 4.0, defaultHeight: 1.0, windStrength: 0.5, poleType: 'both' },
};

export interface TileGroupConfig {
  id: string;
  name: string;
  floorMeshId: string;
  tiles: TileConfig[];
}

export interface WallCategory {
  id: string;
  name: string;
  description?: string;
  wallGroupIds: string[];
}

export interface TileCategory {
  id: string;
  name: string;
  description?: string;
  tileGroupIds: string[];
}

export interface BuildingSystemState {
  meshes: Map<string, MeshConfig>;
  wallGroups: Map<string, WallGroupConfig>;
  tileGroups: Map<string, TileGroupConfig>;
  blocks: BuildingBlockConfig[];
  wallCategories: Map<string, WallCategory>;
  tileCategories: Map<string, TileCategory>;
  objects: PlacedObject[];
  selectedWallGroupId?: string;
  selectedTileGroupId?: string;
  selectedWallCategoryId?: string;
  selectedTileCategoryId?: string;
  editMode: 'none' | 'wall' | 'tile' | 'block' | 'npc' | 'object';
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
}
