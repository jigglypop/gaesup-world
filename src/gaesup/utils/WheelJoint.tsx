import { RapierRigidBody, useRevoluteJoint } from "@react-three/rapier";
import { RefObject } from "react";
import * as THREE from "three";

export type wheelJointType = {
  bodyRef: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
};

export default function WheelJoint({
  bodyRef,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
}: wheelJointType) {
  const jointRefs = useRevoluteJoint(bodyRef, wheel, [
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
  ]);
  return null;
}
