import { atom } from "jotai";
import { portalAtomType } from "./type";

export const portalAtom = atom<portalAtomType>({
  type: "create",
  current: {
    id: "",
    title: "",
    position: [0.0, 0.0, 0.0],
  },
  update: {},
  create: {},
  delete: {},
});

portalAtom.debugLabel = "portal";
