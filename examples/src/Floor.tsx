"use client";

import { Grid } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { GaeSupProps } from "../../src";

export default function Floor() {
  return (
    <GaeSupProps type="ground">
      <Grid
        renderOrder={-1}
        position={[0, -0.8, 0]}
        infiniteGrid
        cellSize={2}
        cellThickness={1}
        cellColor={"#1d1d1d"}
        sectionSize={5}
        sectionThickness={0}
        fadeDistance={1000}
        userData={{ intangible: true }}
      />
      <RigidBody type="fixed" userData={{ intangible: true }}>
        <mesh receiveShadow position={[0, -3.5, 0]}>
          <boxGeometry args={[1000, 5, 1000]} />
        </mesh>
        <mesh
          receiveShadow
          position={[0, -0.9, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#b963ff" />
          {/* <MeshReflectorMaterial
            mirror={1}
            blur={[300, 100]}
            resolution={2048}
            mixBlur={10}
            mixStrength={10}
            depthScale={10}
            minDepthThreshold={10}
            maxDepthThreshold={14}
            color="#b963ff"
          /> */}
        </mesh>
      </RigidBody>
    </GaeSupProps>
  );
}
