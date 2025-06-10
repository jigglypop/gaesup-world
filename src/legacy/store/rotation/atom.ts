import { CAMERA_POSITION, ROTATE } from "@constants/main";
import { atom } from "jotai";
import { rotationAtomType } from "./type";

export const rotationAtom = atom<rotationAtomType>({
  default: -ROTATE,
  angle: 0,
  x: CAMERA_POSITION.x,
  y: CAMERA_POSITION.y,
  z: CAMERA_POSITION.z,
});
rotationAtom.debugLabel = "rotation";
