import { meshType } from "@store/mesh/type";
import { tileType } from "@store/tile/type";

export type tileParentType = {
  tile_parent_id: string;
  map_text: string;
  floor_mesh_id: string | null;
};

export type newTileParentType = {
  tile_parent_id: string;
  map_text: string;
  floor: meshType;
};

export type tileParentAtomType = {
  tileParents: {
    [key: string]: tileParentType;
  };
  tile_parent_id: string;
  meshType: "floor";
  newTileParent: newTileParentType;
  delete: {
    [key: string]: newTileParentType;
  };
  update: {
    [key: string]: newTileParentType;
  };
};

export type tileParentResponseType = {
  tilesByParentsId: {
    [k: string]: tileType[];
  };
  tileParentMap: {
    [k: string]: tileParentType;
  };
  meshes: meshType[];
};
