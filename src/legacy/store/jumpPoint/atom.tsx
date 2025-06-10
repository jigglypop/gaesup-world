import { atom } from "jotai";
import { jumpPointAtomType } from "./type";

export const jumpPointAtom = atom<jumpPointAtomType>({
  degree: 0,
  points: {},
  on: true,
});
jumpPointAtom.debugLabel = "jumpPoint";
