import { ObjectMap } from "@react-three/fiber";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
export declare const useGltfAndSize: (url: string) => {
    gltf: GLTF & ObjectMap;
    size: THREE.Vector3;
};
