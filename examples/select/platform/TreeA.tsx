"use client";

import { Gltf } from "@react-three/drei";
import { S3 } from "../../../src/gaesup/utils/constant";

export default function TreeA() {
  return <Gltf src={S3 + "/treeA.glb"} position={[2, -1, 2]} scale={5} />;
}
