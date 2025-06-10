import { atom } from "jotai";
import { wallAtomType } from "./type";

export const wallAtom = atom<wallAtomType>({
  type: "create",
  current: null,
  update: {},
  create: {},
  delete: {},
});

wallAtom.debugLabel = "wall";
