import {
  CollisionEnterPayload,
  RapierRigidBody,
  RigidBody,
  euler,
} from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";

export const RigidBodyRef = forwardRef(
  (
    {
      children,
      name,
      position,
      rotation,
      userData,
      onCollisionEnter,
    }: {
      children: ReactNode;
      name?: string;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      userData?: { intangible: boolean };
      onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        name={name}
        position={position}
        rotation={euler().set(0, rotation?.clone().y || 0, 0)}
        userData={userData}
        onCollisionEnter={onCollisionEnter}
      >
        {children}
      </RigidBody>
    );
  }
);
