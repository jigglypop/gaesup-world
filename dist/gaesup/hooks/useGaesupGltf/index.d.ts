import * as THREE from "three";
import { GLTFResult } from "../../component/type";
import { urlsType } from "../../world/context/type";
export type gltfAndSizeType = {
    size: THREE.Vector3;
    setSize: (size: THREE.Vector3, keyName?: string) => void;
    getSize: () => THREE.Vector3;
};
export type useGltfAndSizeType = {
    url: string;
};
export declare const useGltfAndSize: ({ url }: useGltfAndSizeType) => {
    gltf: GLTFResult;
    size: THREE.Vector3;
    setSize: (size?: THREE.Vector3, keyName?: string) => THREE.Vector3;
    getSize: (keyName?: string) => THREE.Vector3;
};
export declare const useGaesupGltf: () => {
    getSizesByUrls: (urls?: urlsType) => {
        characterUrl?: THREE.Vector3;
        vehicleUrl?: THREE.Vector3;
        airplaneUrl?: THREE.Vector3;
        wheelUrl?: THREE.Vector3;
    };
};
