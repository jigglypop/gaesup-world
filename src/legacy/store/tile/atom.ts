import { atom } from "jotai";
import { tileAtomType } from "./type";

export const tileAtom = atom<tileAtomType>({
  type: "create",
  current: null,
  update: {},
  create: {},
  delete: {},
  tilesByParentsId: {},
});

tileAtom.debugLabel = "tile";
