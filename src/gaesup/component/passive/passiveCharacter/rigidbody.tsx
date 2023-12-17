import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";

export const PassiveCharacterRigidBody = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody colliders={false} canSleep={false} ref={ref}>
        {children}
      </RigidBody>
    );
  }
);
