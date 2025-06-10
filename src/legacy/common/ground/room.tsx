"use client";

import { Grid } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function UpdateGround() {
  return (
    <RigidBody
      type="fixed"
      colliders="hull"
      userData={{ intangible: true }}>
      <Grid
        infiniteGrid={true}
        cellColor={"#000000"}
        sectionSize={4}
        sectionColor={"#2a2a2a"}
        cellThickness={0.5}
        cellSize={1}
        position={[-2, 0.1, 2]}
      />
    </RigidBody>
  );
}
