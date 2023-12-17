"use client";

import { Grid, MeshReflectorMaterial } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Floor() {
  return (
    <>
      <Grid
        renderOrder={-1}
        position={[0, -0.8, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={1}
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor={"#212121"}
        fadeDistance={1000}
      />
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -3.5, 0]}>
          <boxGeometry args={[1000, 5, 1000]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>
        <mesh
          receiveShadow
          position={[0, -0.9, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1000, 1000]} />
          <MeshReflectorMaterial
            mirror={0}
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={80}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#212121"
            metalness={0.5}
          />
        </mesh>
      </RigidBody>
    </>
  );
}
