import { n3 } from '@core/utils/vector';

export type MeshType = {
  id: string;
  material: string;
  color: string;
  mapTextureUrl: string;
  normalTextureUrl: string;
  // TODO: Add more mesh types as needed
  meshType: 'none' | 'wall' | 'floor' | 'ceiling';
};

export type TileType = {
  id: string;
  position: n3;
  groupId?: string; // ID of the TileGroup it belongs to
  color?: string;
  isCollideable?: boolean;
};

export type TileGroupType = {
  id:string;
  mapText: string;
  floorMeshId: string | null;
}

export type WallType = {
  id: string;
  position: n3;
  rotation: n3;
  groupId?: string; // ID of the WallGroup it belongs to
};

export type WallGroupType = {
  id: string;
  // ... other properties for wall groups
}

// Replaces the temporary definition
export type InteractableObjectType = {
  id: string;
  url: string;
  name: string;
  objectType: string;
  position: n3;
  rotation: n3;
  scale: n3;
  linkUrl?: string;
  color?: string;
};

export type NpcType = {
  id: string;
  username: string | null;
  currentAnimation: string | null;
  position: n3;
  rotation: n3;
  objects: {
    body: InteractableObjectType;
    hat?: InteractableObjectType;
    // ... other parts
  };
};

export interface WorldSlice {
  meshes: Map<string, MeshType>;
  currentMeshId: string | null;
  addMesh: (mesh: MeshType) => void;
  removeMesh: (id: string) => void;
  updateMesh: (id: string, newMesh: Partial<MeshType>) => void;
  setCurrentMeshId: (id: string | null) => void;

  tiles: Map<string, TileType>;
  addTile: (tile: TileType) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, newTile: Partial<TileType>) => void;

  tileGroups: Map<string, TileGroupType>;
  addTileGroup: (group: TileGroupType) => void;
  removeTileGroup: (groupId: string) => void;
  updateTileGroup: (groupId: string, newGroup: Partial<TileGroupType>) => void;
  addTileToGroup: (groupId: string, tileId: string) => void;
  removeTileFromGroup: (tileId: string) => void;

  walls: Map<string, WallType>;
  addWall: (wall: WallType) => void;
  removeWall: (id: string) => void;
  updateWall: (id: string, newWall: Partial<WallType>) => void;

  wallGroups: Map<string, WallGroupType>;
  addWallGroup: (group: WallGroupType) => void;
  removeWallGroup: (groupId: string) => void;
  updateWallGroup: (groupId: string, newGroup: Partial<WallGroupType>) => void;
  addWallToGroup: (groupId: string, wallId: string) => void;
  removeWallFromGroup: (wallId: string) => void;

  npcs: Map<string, NpcType>;
  addNpc: (npc: NpcType) => void;
  removeNpc: (id: string) => void;
  updateNpc: (id: string, newNpc: Partial<NpcType>) => void;

  interactableObjects: Map<string, InteractableObjectType>;
  addInteractableObject: (obj: InteractableObjectType) => void;
  removeInteractableObject: (id: string) => void;
  updateInteractableObject: (
    id: string,
    newObj: Partial<InteractableObjectType>
  ) => void;
} 