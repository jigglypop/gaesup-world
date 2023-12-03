import { GroupProps } from "@react-three/fiber";
import { atom, useAtom } from "jotai";
import * as THREE from "three";
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

export function useColliderInit(scene: THREE.Object3D, character?: GroupProps) {
  const [collider, setcollider] = useAtom(colliderAtom);
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  if (size.x !== 0 && size.y !== 0 && size.z !== 0) {
    const height = size.y / 2;
    const halfHeight = height / 2;
    const diameter = Math.max(size.x, size.z);
    const radius = diameter / 2;
    setcollider({
      height: height - diameter / 2,
      halfHeight: halfHeight - radius / 2,
      diameter,
      radius,
    });
  }
  return { collider, setcollider };
}
