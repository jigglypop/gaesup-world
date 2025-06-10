import { meshTypeString } from "@store/mesh/type";
import { getDefaultMesh } from "@store/tileParent/atom";
import { atom } from "jotai";
import { wallParentAtomType } from "./type";

export const defaultWallParent = {
  wall_parent_id: "-1",
  name: "",
  front_mesh_id: null,
  back_mesh_id: null,
  bone_mesh_id: null,
};

export const defaultNewWallParent = {
  wall_parent_id: "-1",
  name: "",
  front: {
    ...getDefaultMesh("front" as meshTypeString),
  },
  back: {
    ...getDefaultMesh("back" as meshTypeString),
  },
  bone: {
    ...getDefaultMesh("bone" as meshTypeString),
  },
};

export const wallParentAtom = atom<wallParentAtomType>({
  wallParents: {},
  wall_parent_id: "-1",
  meshType: "front",
  delete: {},
  update: {},
  newWallParent: {
    ...defaultNewWallParent,
  },
});

wallParentAtom.debugLabel = "wall_parent";
