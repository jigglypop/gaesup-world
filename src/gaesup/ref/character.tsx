import { Collider } from "@dimforge/rapier3d-compat";

import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useAtomValue } from "jotai";
import { ReactNode, Ref, forwardRef, useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext, gaesupWorldPropType } from "../stores/context";
import { optionsAtom } from "../stores/options";
import { controllerType, groundRayType, slopeRayType } from "../type";

export const CharacterRigidBody = forwardRef(
  (
    {
      controllerProps,
      groundRay,
      children,
    }: {
      controllerProps: controllerType;
      groundRay: groundRayType;
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    const options = useAtomValue(optionsAtom);
    return (
      <RigidBody
        colliders={false}
        canSleep={false}
        ref={ref}
        {...controllerProps}
      >
        {/* {options.debug && (
          <mesh
            visible={options.debug}
            userData={{
              intangible: true,
            }}
          >
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

export const CharacterCapsuleCollider = forwardRef((_, ref: Ref<Collider>) => {
  const { characterCollider: collider } =
    useContext<gaesupWorldPropType>(GaesupWorldContext);
  return (
    <CapsuleCollider ref={ref} args={[collider.height, collider.radius]} />
  );
});

export const CharacterGroup = forwardRef(
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

export const CharacterSlopeRay = forwardRef(
  (
    {
      groundRay,
      slopeRay,
    }: {
      groundRay: groundRayType;
      slopeRay: slopeRayType;
    },
    ref: Ref<THREE.Mesh>
  ) => {
    const options = useAtomValue(optionsAtom);
    return (
      <mesh
        position={[
          groundRay.offset.x,
          groundRay.offset.y,
          groundRay.offset.z + slopeRay.offset.z,
        ]}
        ref={ref}
        visible={false}
        userData={{ intangible: true }}
      >
        {/* {options.debug && (
          <mesh userData={{ intangible: true }}>
            <arrowHelper
              args={[slopeRay.dir, slopeRay.origin, slopeRay.length, "#ff0000"]}
            />
          </mesh>
        )} */}
        <boxGeometry args={[0.15, 0.15, 0.15]} />
      </mesh>
    );
  }
);
