import { Collider } from "@dimforge/rapier3d-compat";

import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { ReactNode, Ref, forwardRef, useContext } from "react";
import * as THREE from "three";
import { GaesupWorldContext } from "../../stores/context";

import {
  controllerType,
  groundRayType,
  propType,
  slopeRayType,
} from "../../controller/type";
import { getRayHit } from "../../utils/ray";
import { useForwardRef } from "../../utils/ref";

export const CharacterRigidBody = forwardRef(
  (
    {
      controllerProps,
      children,
    }: {
      controllerProps: controllerType;
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
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

export const CharacterCapsuleCollider = forwardRef(
  ({ prop }: { prop: propType }, ref: Ref<Collider>) => {
    const { characterCollider: collider } = useContext(GaesupWorldContext);
    const colliderRef = useForwardRef<Collider>(ref);
    const { rapier } = useRapier();
    const { groundRay, slopeRay } = prop;
    groundRay.length = collider.radius + 2;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit<groundRayType>({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();

    slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);
    slopeRay.length = collider.radius + 3;
    slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);

    return (
      <CapsuleCollider ref={ref} args={[collider.height, collider.radius]} />
    );
  }
);

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
