import { Collider } from "@dimforge/rapier3d-compat";
import { Gltf } from "@react-three/drei";
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { Ref, RefObject, forwardRef, useContext, useRef } from "react";
import { GaesupWorldContext } from "../../../world/context";

export type wheelRegidBodyType = {
  index: number;
  wheelPosition: [number, number, number];
  bodyRef: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
};

export const WheelRegidBodyRef = forwardRef(
  (
    {
      index,
      wheelPosition,
      bodyRef,
      wheel,
      bodyAnchor,
      wheelAnchor,
      rotationAxis,
    }: wheelRegidBodyType,
    ref: Ref<RapierRigidBody>
  ) => {
    const { vehicleCollider: collider, url } = useContext(GaesupWorldContext);
    const { wheelSizeX, wheelSizeY } = collider;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
    const colliderRef = useRef<Collider>(null);

    return (
      <RigidBody
        position={wheelPosition}
        colliders={false}
        ref={ref}
        userData={{ intangible: true }}
      >
        <CylinderCollider
          args={[wheelSizeX / 2, wheelSizeY / 2]}
          rotation={[0, 0, Math.PI / 2]}
          ref={colliderRef}
        />
        <Gltf src={url.wheelUrl} />
      </RigidBody>
    );
  }
);
