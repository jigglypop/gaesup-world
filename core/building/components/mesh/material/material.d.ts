import * as THREE from "three";
export type materialType = {
    color?: string;
    roughness?: number;
    metalness?: number;
    transmission?: number;
    envMapIntensity?: number;
};
export declare const glassMaterial: (props: materialType) => THREE.MeshPhysicalMaterial;
