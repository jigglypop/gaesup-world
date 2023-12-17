import { ObjectMap } from "@react-three/fiber";
import { GLTF } from "three-stdlib";

export type GLTFResult = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.SkinnedMesh };
  materials: { [name: string]: THREE.Material | THREE.MeshStandardMaterial };
} & ObjectMap;
