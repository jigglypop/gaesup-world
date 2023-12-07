import { Collider } from "@dimforge/rapier3d-compat";

import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useAtomValue } from "jotai";
import { ReactNode, Ref, forwardRef, useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext, gaesupWorldPropType } from "../stores/context";
import { optionsAtom } from "../stores/options";
import { groundRayType } from "../type";

export const AirplaneRigidBody = forwardRef(
  (
    {
      groundRay,
      children,
    }: {
      groundRay: groundRayType;
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    const options = useAtomValue(optionsAtom);
    return (
      <RigidBody colliders={false} ref={ref}>
        {/* {options.debug && (
          <mesh visible={options.debug}>
            <arrowHelper
              args={[groundRay.dir, groundRay.origin, groundRay.length]}
            />
          </mesh>
        )} */}
        {children}
      </RigidBody>
    );
  }
);

export const AirplaneCollider = forwardRef((_, ref: Ref<Collider>) => {
  const { airplaneCollider: collider } =
    useContext<gaesupWorldPropType>(GaesupWorldContext);
  const { airplaneSizeX, airplaneSizeY, airplaneSizeZ } = collider;

  return (
    <CuboidCollider
      ref={ref}
      args={[airplaneSizeX / 2, airplaneSizeY / 2, airplaneSizeZ / 2]}
      position={[0, airplaneSizeY / 2, 0]}
    />
  );
});

export const AirplaneGroup = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: Ref<THREE.Group>
  ) => {
    return (
      <group ref={ref} userData={{ intangible: true }}>
        {children}
      </group>
    );
  }
);
