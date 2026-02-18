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
  color?: string;
  material?: 'STANDARD' | 'GLASS' | 'METAL';
  mapTextureUrl?: string;
  normalTextureUrl?: string;
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

export interface TileConfig {
  id: string;
  position: Position3D;
  tileGroupId: string;
  size?: number;
  rotation?: number;
  objectType?: 'water' | 'grass' | 'flag' | 'none';
  objectConfig?: {
    flagTexture?: string;
    flagWidth?: number;
    flagHeight?: number;
    flagStyle?: FlagStyle;
    grassDensity?: number;
    waterScale?: number;
  };
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
  wallCategories: Map<string, WallCategory>;
  tileCategories: Map<string, TileCategory>;
  selectedWallGroupId?: string;
  selectedTileGroupId?: string;
  selectedWallCategoryId?: string;
  selectedTileCategoryId?: string;
  editMode: 'none' | 'wall' | 'tile' | 'npc';
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
}