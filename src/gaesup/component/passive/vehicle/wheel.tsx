import { Gltf } from "@react-three/drei";
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { Ref, RefObject, forwardRef } from "react";
import { vehicleColliderType } from "../../../world/context/type";

export type wheelRegidBodyType = {
  wheelPosition: [number, number, number];
  bodyRef: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
  vehicleCollider: vehicleColliderType;
  url: string;
};

export const WheelRegidBodyRef = forwardRef(
  ({ props }: { props: wheelRegidBodyType }, ref: Ref<RapierRigidBody>) => {
    const {
      vehicleCollider: { wheelSizeX, wheelSizeY },
      bodyRef,
      wheel,
      bodyAnchor,
      wheelAnchor,
      rotationAxis,
      wheelPosition,
      url,
    } = props;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);

    return (
      <RigidBody position={wheelPosition} colliders={false} ref={ref}>
        <CylinderCollider
          args={[wheelSizeX / 2, wheelSizeY / 2]}
          rotation={[0, 0, Math.PI / 2]}
        />
        <Gltf src={url} />
      </RigidBody>
    );
  }
);
