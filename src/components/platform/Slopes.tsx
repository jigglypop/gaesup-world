"use client";

import { Html, useGLTF } from "@react-three/drei";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { SetStateAction, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import GaeSupProps from "../../gaesup/stores/gaesupProps";
import { S3 } from "../../gaesup/utils/constant";
import { ControlledInput } from "./ControlledInput";

export default function Slopes() {
  // Load models
  const slopes = useGLTF(S3 + "/slopes.glb");
  const [angle, setAngle] = useState<number>(25);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  useEffect(() => {
    // Receive Shadows
    slopes.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.receiveShadow = true;
      }
    });
  }, []);

  return (
    <GaeSupProps text="Slopes" jumpPoint={true} position={[-15, -0.8, 15]}>
      <RigidBody
        type="fixed"
        colliders="hull"
        ref={rigidBodyRef}
        rotation={[-(angle * Math.PI) / 180, 0, 0]}
      >
        <mesh receiveShadow castShadow>
          <boxGeometry args={[10, 1, 10]} />
          <meshBasicMaterial transparent opacity={0.9} />
        </mesh>
      </RigidBody>
      <Html zIndexRange={[1, 0]}>
        <ControlledInput
          type={angle}
          onChange={(e: { target: { value: SetStateAction<number> } }) =>
            setAngle(e.target.value)
          }
          value={angle}
        />
      </Html>
    </GaeSupProps>
  );
}
