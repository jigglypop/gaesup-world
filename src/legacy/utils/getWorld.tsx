import { MAIN_POSITION, MAIN_ROTATION } from "@constants/main";
import { RefObject } from "react";
import * as THREE from "three";

export const updateWorld = ({
  ref,
}: {
  ref: RefObject<THREE.Group | undefined>;
}) => {
  if (!ref || !ref?.current) return;
  const obj = new THREE.Object3D();
  ref.current.updateMatrixWorld();
  obj.position.set(MAIN_POSITION.x, MAIN_POSITION.y, MAIN_POSITION.z);
  obj.rotation.set(MAIN_ROTATION.x, MAIN_ROTATION.y, MAIN_ROTATION.z);
  obj.applyMatrix4(ref.current.matrixWorld);
  return obj;
};
