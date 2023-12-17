import { useGLTF } from "@react-three/drei";
import { ObjectMap } from "@react-three/fiber";
import THREE from "three";
import { GLTF } from "three-stdlib";

export const useGltfAndSize = (url: string) => {
  const gltf = useGLTF(url) as GLTF & ObjectMap;
  const { scene } = gltf;
  const size = new THREE.Box3()
    .setFromObject(scene)
    .getSize(new THREE.Vector3());
  return { gltf, size };
};
