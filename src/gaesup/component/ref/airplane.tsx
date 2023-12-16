import { Collider } from "@dimforge/rapier3d-compat";

import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { ReactNode, Ref, forwardRef, useContext } from "react";
import * as THREE from "three";
import {
  controllerInnerType,
  controllerType,
  groundRayType,
} from "../../controller/type";
import { getRayHit } from "../../utils/ray";
import { useForwardRef } from "../../utils/ref";
import { GaesupWorldContext } from "../../world/context";

export const AirplaneRigidBody = forwardRef(
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

export const AirplaneCollider = forwardRef(
  ({ prop }: { prop: controllerInnerType }, ref: Ref<Collider>) => {
    const { airplaneCollider: collider } = useContext(GaesupWorldContext);
    const { airplaneSizeX, airplaneSizeY, airplaneSizeZ } = collider;

    const colliderRef = useForwardRef<Collider>(ref);
    const { rapier } = useRapier();
    const { groundRay } = prop;
    groundRay.length = airplaneSizeY * 5 + 2;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit<groundRayType>({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();

    return (
      <CuboidCollider
        ref={ref}
        args={[airplaneSizeX / 2, airplaneSizeY / 2, airplaneSizeZ / 2]}
        position={[0, airplaneSizeY / 2, 0]}
      />
    );
  }
);

export const AirplaneGroup = forwardRef(
  (
    {
      props,
      children,
    }: {
      props: controllerType;
      children: ReactNode;
    },
    ref: Ref<THREE.Group>
  ) => {
    return (
      <group ref={ref} userData={{ intangible: true }} {...props.airplane}>
        {children}
      </group>
    );
  }
);
