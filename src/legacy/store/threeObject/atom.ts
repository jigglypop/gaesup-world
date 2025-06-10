import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import {
  threeObjectAtomType,
  threeObjectRequestType,
  threeObjectType,
} from "./type";

export const _threeObject: threeObjectRequestType = {
  three_object_id: "-1",
  gltf_url: undefined,
  object_type: "normal",
  object_name: "의자",
  colliders: "cuboid",
  rigid_body_type: "fixed",
  link_url: undefined,
  count: [1, 1, 1],
  position: [0.0, 0.0, 0.0],
  rotation: [0.0, 0.0, 0.0],
  scale: [1.0, 1.0, 1.0],
  color: undefined,
  pamplet_url: undefined,
  poster_url: undefined,
  npc_id: null,
};

export const getDefaultThreeObject = (item: Partial<threeObjectType>) => {
  return {
    ..._threeObject,
    ...item,
  };
};

export function convertThreeObjectRequest(
  obj: threeObjectType
): threeObjectRequestType {
  const request: threeObjectRequestType = {
    three_object_id: obj.three_object_id,
    object_type: obj.object_type,
    object_name: obj.object_name,
    count: obj.count,
    scale: obj.scale,
    gltf_url: obj.gltf_url || undefined,
    colliders: obj.colliders || undefined,
    rigid_body_type: obj.rigid_body_type || undefined,
    link_url: obj.link_url || "",
    npc_id: obj.npc_id || "-1",
    color: obj.color || null,
    pamplet_url: obj.pamplet_url || null,
    poster_url: obj.poster_url || null,
  };
  return request;
}

export const threeObjectAtom = atom<threeObjectAtomType>({
  type: "create",
  current: null,
  itemType: {
    color: false,
    pamplet_url: false,
    poster_url: false,
  },
  update: {},
  create: {},
  delete: [],
  threeObjectsById: {},
});

export const resetNormalAtom = atomWithDefault((get) => get(threeObjectAtom));

threeObjectAtom.debugLabel = "threeObject";
