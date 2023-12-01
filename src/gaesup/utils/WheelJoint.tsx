import { refsType } from "@gaesup/type";
import { RapierRigidBody, useRevoluteJoint } from "@react-three/rapier";
import { RefObject } from "react";
import * as THREE from "three";

export type wheelJointType = {
  refs: refsType;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
};

export default function WheelJoint({
  refs,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
}: wheelJointType) {
  refs.jointRefs = useRevoluteJoint(refs.rigidBodyRef, wheel, [
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
  ]);
  return null;
}
