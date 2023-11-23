import { atom } from "jotai";
import * as THREE from "three";

export type GaeSupPropsType = {
  text: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
};

export type minimapType = {
  [key: string]: GaeSupPropsType;
};

export const minimapAtom = atom<minimapType>({});
minimapAtom.debugLabel = "minimaps";
