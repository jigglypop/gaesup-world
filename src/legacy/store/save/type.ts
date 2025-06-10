import { npcType } from "@store/npc/type";
import { portalType } from "@store/portal/type";
import {
  threeObjectRequestType,
  threeObjectType,
} from "@store/threeObject/type";
import { tileType } from "@store/tile/type";
import { wallType } from "@store/wall/type";

// save wall request type
export type saveWallRequestType = {
  update: wallType[];
  create: wallType[];
  delete: wallType[];
};
// save portal request type
export type savePortalRequestType = {
  create: Omit<portalType, "id">[];
  delete: string[];
};
// save tile request type
export type saveTileRequestType = {
  update: tileType[];
  create: tileType[];
  delete: tileType[];
};

export type saveNpcRequestType = {
  update: npcType[];
  create: npcType[];
  delete: npcType[];
};

// save request type
export type saveThreeObjectRequestType = {
  update: threeObjectRequestType[];
  create: threeObjectRequestType[];
  delete: string[];
};

export type saveRequestType = {
  wall: saveWallRequestType;
  tile: saveTileRequestType;
  threeObject: saveThreeObjectRequestType;
  npc: saveNpcRequestType;
};

export type saveResponseType = {
  walls: wallType[];
  tiles: tileType[];
  threeObjects: threeObjectType[];
  npcs: npcType[];
};

export type saveRoomAtomType = saveRequestType;
