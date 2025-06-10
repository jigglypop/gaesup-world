import { meshType } from "@store/mesh/type";
import { wallType } from "@store/wall/type";

export type wallParentType = {
  wall_parent_id: string;
  name: string;
  front_mesh_id: string | null;
  back_mesh_id: string | null;
  bone_mesh_id: string | null;
};

export type newWallParentType = {
  wall_parent_id: string;
  name: string;
  front: meshType;
  back: meshType;
  bone: meshType;
};

export type wallParentRequestType = {
  name: string;
};

export type wallParentAtomType = {
  wallParents: {
    [key: string]: wallParentType;
  };
  wall_parent_id: string;
  meshType: "front" | "back" | "bone";
  newWallParent: newWallParentType;
  delete: {
    [key: string]: newWallParentType;
  };
  update: {
    [key: string]: newWallParentType;
  };
};

export type wallParntMapType = {
  [key: string]: wallParentType;
};

export type wallsByParentsIdType = {
  [key: string]: wallType[];
};

export type wallParentResponseType = {
  wallParentMap: wallParntMapType;
  wallsByParentsId: wallsByParentsIdType;
};
