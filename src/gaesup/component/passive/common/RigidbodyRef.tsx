import {
  CollisionEnterPayload,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";

export const RigidBodyRef = forwardRef(
  (
    {
      children,
      position,
      rotation,
      onCollisionEnter,
    }: {
      children: ReactNode;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    const _euler = rotation.clone();
    _euler.x = 0;
    _euler.z = 0;
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        position={position}
        rotation={_euler}
        userData={{ intangible: true }}
        onCollisionEnter={onCollisionEnter}
      >
        {children}
      </RigidBody>
    );
  }
);
