"use client";

import { Environment } from "@react-three/drei";

export default function UpdateEnvironmentOuter() {
  return (
    <>
      <Environment
        background
        files={["image/back.hdr"]}
        backgroundBlurriness={1}
        backgroundIntensity={0.1}
      />
    </>
  );
}
