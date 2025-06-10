import { atom } from "jotai";
import { zoomAtomType } from "./type";

export const zoomAtom = atom<zoomAtomType>({
  zoom: 1,
  takeZoom: false,
  pinchList: [],
  dist: -1,
});
zoomAtom.debugLabel = "zoom";
