import { meshType, meshTypeString } from "@store/mesh/type";
import { atom } from "jotai";
import { tileParentAtomType } from "./type";

export const defaultMesh = {
  mesh_id: "-1",
  material: "standard",
  color: "rgb(0,0,0)",
  map_texture_url: "",
  normal_texture_url: "",
  wall_parent_id: null,
  three_object_id: null,
  tile_parent_id: null,
  mesh_type: "floor",
};

export const getDefaultMesh = (mesh_type: meshTypeString) => {
  return {
    ...defaultMesh,
    mesh_type,
  };
};

export const getNormalMesh = (mesh_type: string): meshType => {
  return {
    ...defaultMesh,
    mesh_type: mesh_type as meshTypeString,
  };
};

export const defaultTileParent = {
  tile_parent_id: "-1",
  map_text: "",
  floor_mesh_id: null,
};

export const defaultNewTileParent = {
  tile_parent_id: "-1",
  map_text: "",
  floor: {
    ...getDefaultMesh("floor" as meshTypeString),
  },
};

export const tileParentAtom = atom<tileParentAtomType>({
  tileParents: {},
  tile_parent_id: "-1",
  meshType: "floor",
  delete: {},
  update: {},
  newTileParent: {
    ...defaultNewTileParent,
  },
});

tileParentAtom.debugLabel = "tile_parent";
