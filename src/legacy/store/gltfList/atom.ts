import { objectTypeString } from "@store/update/type";
import { atom } from "jotai";
import { gltfListAtomType } from "./type";

export const gltfListAtom = atom<
  gltfListAtomType & {
    tapList: objectTypeString[];
    toName: Record<objectTypeString, string>;
  }
>({
  npc: {},
  normal: {},
  wall: {},
  tile: {},
  portal: {},
  category: "기본",
  gltf_url: null,
  tapList: ["wall", "tile", "npc", "normal", "portal"],
  toName: {
    wall: "벽",
    tile: "타일",
    npc: "NPC",
    normal: "일반",
    portal: "포탈",
  },
});

gltfListAtom.debugLabel = "gltf_list";
