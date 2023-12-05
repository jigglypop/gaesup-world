import { V3 } from "@/gaesup/utils/vector";
import { currentType } from "@gaesup/type";
import { euler, quat, vec3 } from "@react-three/rapier";
import { atom } from "jotai";

export const currentAtom = atom<currentType>({
  position: V3(0, 2, 5),
  standPosition: vec3(),
  velocity: vec3(),
  reverseVelocity: vec3(),
  quat: quat(),
  euler: euler(),
  dir: vec3(),
  direction: vec3(),
  refs: {},
  axisX: V3(1, 0, 0),
  axisY: V3(0, 1, 0),
  axisZ: V3(0, 0, 1),
  yaw: 0,
  pitch: 0,
  roll: 0,
});

currentAtom.debugPrivate = true;
