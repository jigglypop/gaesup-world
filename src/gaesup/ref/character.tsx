import { Collider } from "@dimforge/rapier3d-compat";

import {
  CapsuleCollider,
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useAtom, useAtomValue } from "jotai";
import { ReactNode, Ref, forwardRef } from "react";
import * as THREE from "three";
import { colliderAtom } from "../stores/collider";
import { optionsAtom } from "../stores/options";
import {
  GLTFResult,
  controllerType,
  groundRayType,
  slopeRayType,
} from "../type";

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
    // const options = useAtomValue(optionsAtom);
    return (
      <RigidBody
        colliders={false}
        canSleep={false}
        ref={ref}
        {...controllerProps}
      >
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

export const CharacterCapsuleCollider = forwardRef(
  ({ url, gltf }: { url: string; gltf: GLTFResult }, ref: Ref<Collider>) => {
    const [collider, setCollider] = useAtom(colliderAtom);

    return (
      <CapsuleCollider ref={ref} args={[collider.height, collider.radius]} />
    );
  }
);

export const CharacterCuboidCollider = forwardRef((_, ref: Ref<Collider>) => {
  const collider = useAtomValue(colliderAtom);
  return (
    <CuboidCollider ref={ref} args={[collider.x, collider.y, collider.z]} />
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
        {options.debug && (
          <mesh>
            <arrowHelper
              args={[slopeRay.dir, slopeRay.origin, slopeRay.length, "#ff0000"]}
            />
          </mesh>
        )}
        <boxGeometry args={[0.15, 0.15, 0.15]} />
      </mesh>
    );
  }
);
