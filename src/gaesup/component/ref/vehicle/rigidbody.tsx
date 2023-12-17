import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { ReactNode, Ref, forwardRef } from "react";
import { controllerInnerType } from "../../../controller/type";

export const VehicleRigidBody = forwardRef(
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
        {props.debug && (
          <mesh visible={props.debug}>
            <arrowHelper
              args={[
                props.groundRay.dir,
                props.groundRay.origin,
                props.groundRay.length,
              ]}
            />
          </mesh>
        )}
        {children}
      </RigidBody>
    );
  }
);
