import { Collider, Ray, RayColliderToi } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
  vec3,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaeSupProps } from "../../../src";

export type rayType = {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  springDir: THREE.Vector3;
  velocity: THREE.Vector3;
  hit: RayColliderToi | null;
  parent: THREE.Object3D | null;
  rayCast: Ray | null;
  length: number;
};

export default function FloatMove() {
  // Preset
  const cuboidColliderRef = useRef<Collider>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();

  const ray: rayType = useMemo(() => {
    return {
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3(),
      springDir: vec3(),
      velocity: vec3(),
      hit: null,
      parent: null,
      rayCast: null,
      length: 0.8,
    };
  }, []);
  ray.rayCast = new rapier.Ray(ray.origin, ray.dir);
  let movingDir = 1;

  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setEnabledRotations(false, true, false, false);
      rigidBodyRef.current.setEnabledTranslations(true, true, false, false);
    }
  }, []);

  useFrame(() => {
    // Ray cast for moving platform
    if (rigidBodyRef.current && ray.rayCast && cuboidColliderRef.current) {
      ray.origin.set(
        rigidBodyRef.current.translation().x,
        rigidBodyRef.current.translation().y,
        rigidBodyRef.current.translation().z
      );
      ray.hit = world.castRay(
        ray.rayCast,
        ray.length,
        false,
        undefined,
        undefined,
        cuboidColliderRef.current,
        rigidBodyRef.current
      );
      // Apply moving velocity to the platform
      if (rigidBodyRef.current.translation().x > 10) {
        movingDir = -1;
      } else if (rigidBodyRef.current.translation().x < -5) {
        movingDir = 1;
      }

      if (movingDir > 0) {
        rigidBodyRef.current.setLinvel(
          ray.velocity.set(2, rigidBodyRef.current.linvel().y, 0),
          false
        );
      } else {
        rigidBodyRef.current.setLinvel(
          ray.velocity.set(-2, rigidBodyRef.current.linvel().y, 0),
          false
        );
      }
    }

    // Ray for moving platform
    if (ray.hit && rigidBodyRef.current) {
      if (ray.hit.collider.parent()) {
        const floatingForceMove =
          2.5 * (0.8 - ray.hit.toi) - rigidBodyRef.current.linvel().y * 0.15;
        rigidBodyRef.current.applyImpulse(
          vec3().set(0, floatingForceMove, 0),
          true
        );
      }
    }
  });

  return (
    <GaeSupProps text="moving" jumpPoint={true} position={[0, 5, -17]}>
      <RigidBody mass={1} colliders={false} ref={rigidBodyRef}>
        <CuboidCollider args={[1.25, 0.1, 1.25]} ref={cuboidColliderRef} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.5, 0.2, 2.5]} />
          <meshStandardMaterial color={"#d8fff6"} transparent opacity={0.8} />
        </mesh>
      </RigidBody>
    </GaeSupProps>
  );
}
