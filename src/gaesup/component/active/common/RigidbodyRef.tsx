import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";
import { controllerInnerType } from "../../../controller/type";

export const RigidBodyRef = forwardRef(
  (
    { children, name }: { children: ReactNode; name?: string },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody colliders={false} ref={ref} name={name}>
        {children}
      </RigidBody>
    );
  }
);

export const PassiveRigidBodyRef = forwardRef(
  (
    {
      props,
      children,
    }: {
      props: controllerInnerType;
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody colliders={false} ref={ref} {...props.rigidBodyProps}>
        {children}
      </RigidBody>
    );
  }
);
