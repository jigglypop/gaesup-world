"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  quat,
  vec3,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { GaeSupProps } from "../../../src";

export type dynamicType = {
  time: number | null;
  X: THREE.Vector3;
  Y: THREE.Vector3;
  Qt: THREE.Quaternion;
};

export default function DynamicPlatforms() {
  const sideMovePlatformRef = useRef<RapierRigidBody>(null);
  const verticalMovePlatformRef = useRef<RapierRigidBody>(null);
  const rotatePlatformRef = useRef<RapierRigidBody>(null);
  const rotationDrumRef = useRef<RapierRigidBody>(null);

  const dynamic = useMemo<dynamicType>(() => {
    return {
      time: null,
      X: vec3().set(1, 0, 0),
      Y: vec3().set(0, 1, 0),
      Qt: quat(),
    };
  }, []);

  useFrame((state) => {
    dynamic.time = state.clock.elapsedTime;
    const { time, Qt, X, Y } = dynamic;
    if (dynamic.time) {
      sideMovePlatformRef.current?.setNextKinematicTranslation({
        x: 5 * Math.sin(time / 2) - 12,
        y: -0.5,
        z: -10,
      });

      verticalMovePlatformRef.current?.setNextKinematicTranslation({
        x: -25,
        y: 2 * Math.sin(time / 2) + 2,
        z: 0,
      });
      verticalMovePlatformRef.current?.setNextKinematicRotation(
        Qt.setFromAxisAngle(Y, time * 0.5)
      );

      rotatePlatformRef.current?.setNextKinematicRotation(
        Qt.setFromAxisAngle(Y, time * 0.5)
      );

      rotationDrumRef.current?.setNextKinematicRotation(
        Qt.setFromAxisAngle(X, time * 0.5)
      );
    }
  });

  return (
    <GaeSupProps text="dynamic" jumpPoint={true} position={[-10, 0, -10]}>
      <RigidBody
        type="kinematicPosition"
        ref={sideMovePlatformRef}
        colliders={false}
      >
        <Text
          scale={0.5}
          color="black"
          maxWidth={10}
          textAlign="center"
          position={[0, 2.5, 0]}
        >
          Kinematic Moving Platform
        </Text>
        <CuboidCollider args={[2.5, 0.1, 2.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial color={"moccasin"} />
        </mesh>
      </RigidBody>

      {/* Elevating platform */}
      <RigidBody
        type="kinematicPosition"
        position={[-25, 0, 0]}
        ref={verticalMovePlatformRef}
        colliders={false}
      >
        <Text
          scale={0.5}
          color="black"
          maxWidth={10}
          textAlign="center"
          position={[0, 2.5, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          Kinematic Elevating Platform
        </Text>
        <CuboidCollider args={[2.5, 0.1, 2.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial color={"moccasin"} />
        </mesh>
      </RigidBody>

      {/* Rotating Platform */}
      <RigidBody
        type="kinematicPosition"
        position={[-25, -0.5, -10]}
        ref={rotatePlatformRef}
        colliders={false}
      >
        <Text
          scale={0.5}
          color="black"
          maxWidth={10}
          textAlign="center"
          position={[0, 2.5, 0]}
        >
          Kinematic Rotating Platform
        </Text>
        <CuboidCollider args={[2.5, 0.1, 2.5]} />
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 0.2, 5]} />
          <meshStandardMaterial color={"moccasin"} />
        </mesh>
      </RigidBody>

      {/* Rotating drum */}
      <Text
        scale={0.5}
        color="black"
        maxWidth={10}
        textAlign="center"
        position={[-15, 2.5, -15]}
      >
        Kinematic Rotating Drum
      </Text>
      <RigidBody
        colliders={false}
        type="kinematicPosition"
        position={[-15, -1, -15]}
        ref={rotationDrumRef}
      >
        <group rotation={[0, 0, Math.PI / 2]}>
          <CylinderCollider args={[5, 1]} />
          <mesh receiveShadow>
            <cylinderGeometry args={[1, 1, 10]} />
            <meshStandardMaterial color={"moccasin"} />
          </mesh>
        </group>
      </RigidBody>
    </GaeSupProps>
  );
}
