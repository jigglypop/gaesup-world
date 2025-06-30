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
}

export interface TileGroupConfig {
  id: string;
  name: string;
  floorMeshId: string;
  tiles: TileConfig[];
}

export interface BuildingSystemState {
  meshes: Map<string, MeshConfig>;
  wallGroups: Map<string, WallGroupConfig>;
  tileGroups: Map<string, TileGroupConfig>;
  selectedWallGroupId?: string;
  selectedTileGroupId?: string;
  editMode: 'none' | 'wall' | 'tile';
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
}