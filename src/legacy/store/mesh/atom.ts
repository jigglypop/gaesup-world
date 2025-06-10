import { atom } from "jotai";
import { meshAtomType } from "./type";

export const meshAtom = atom<meshAtomType>({
  type: "origin",
  current_id: null,
  tapName: "기존",
  mesh_list: {},
  current: null,
});

meshAtom.debugLabel = "mesh";
