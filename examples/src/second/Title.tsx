import { Gltf } from "@react-three/drei";

const url = "./texts.glb";

export default function Title() {
  return (
    <group position={[0, 7, 33]} receiveShadow castShadow>
      <Gltf src={url} receiveShadow castShadow />
    </group>
  );
}
