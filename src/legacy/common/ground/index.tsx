"use client";

import { RigidBody } from "@react-three/rapier";

export default function Ground() {
  return (
    <RigidBody
      type="fixed"
      colliders="hull"
      userData={{ intangible: true }}>
      <mesh
        receiveShadow
        position={[0, -0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0}
        />
      </mesh>
    </RigidBody>
  );
}
