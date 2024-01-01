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
        userData={{ intangible: true }}
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
            mirror={1}
            blur={[300, 100]}
            resolution={2048}
            mixBlur={10}
            mixStrength={10}
            depthScale={10}
            minDepthThreshold={10}
            maxDepthThreshold={14}
            color="#1f1f1f"
          />
        </mesh>
      </RigidBody>
    </>
  );
}
