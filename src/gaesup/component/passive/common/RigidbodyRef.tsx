import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";

export const RigidBodyRef = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody colliders={false} ref={ref} userData={{ intangible: true }}>
        {children}
      </RigidBody>
    );
  }
);
