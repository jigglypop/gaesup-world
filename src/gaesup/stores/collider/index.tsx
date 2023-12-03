import { atom } from "jotai";
export type colliderAtomType = {
  halfHeight: number;
  height: number;
  radius: number;
  diameter: number;
  wheelSizeX?: number;
  wheelSizeY?: number;
  wheelSizeZ?: number;
  sizeX?: number;
  sizeY?: number;
  sizeZ?: number;
  x?: number;
  y?: number;
  z?: number;
};

export const colliderAtom = atom<colliderAtomType>({
  height: 0.7,
  halfHeight: 0.35,
  radius: 0.3,
  diameter: 0.6,
  wheelSizeX: 1,
  wheelSizeY: 1,
  wheelSizeZ: 1,
  sizeX: 1,
  sizeY: 1,
  sizeZ: 1,
  x: 1,
  y: 1,
  z: 1,
});
colliderAtom.debugLabel = "collider";
