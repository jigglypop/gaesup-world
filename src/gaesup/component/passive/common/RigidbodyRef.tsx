import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";

export const RigidBodyRef = forwardRef(
  (
    {
      children,
      position,
      rotation,
    }: {
      children: ReactNode;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        position={position}
        rotation={rotation}
        userData={{ intangible: true }}
      >
        {children}
      </RigidBody>
    );
  }
);
