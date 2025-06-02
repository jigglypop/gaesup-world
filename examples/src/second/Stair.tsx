import { Gltf, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { GaeSupProps } from "../../../src";

const gltf_url = "./stair.glb";

export default function Stair() {
  return (
    <GaeSupProps>
      <RigidBody
        type="kinematicPosition"
        colliders="trimesh"
        position={[0, 0.3, 0]}
      >
        <Gltf src={gltf_url} />
      </RigidBody>
    </GaeSupProps>
  );
}
