import { meshType } from "@store/mesh/type";
import { tileType } from "@store/tile/type";
import { tileParentType } from "@store/tileParent/type";

export type tileParentsType = {
  mesh: meshType;
  tiles: tileType[];
  tileParent: tileParentType;
  isUpdate?: boolean;
};

export type tileParentsComponentType = {
  tilesByParentsId: {
    [k: string]: tileType[];
  };
  tileParentMap: {
    [k: string]: tileParentType;
  };
  meshes: {
    [k: string]: meshType;
  };
  isUpdate?: boolean;
};
