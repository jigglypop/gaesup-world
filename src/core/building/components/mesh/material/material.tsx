import * as THREE from "three";

export type materialType = {
  color?: string;
  roughness?: number;
  metalness?: number;
  transmission?: number;
  envMapIntensity?: number;
};

export const glassMaterial = (props: materialType) => {
  return new THREE.MeshPhysicalMaterial({
    color: props.color || "#ffffff",
    transmission: props.transmission || 0.98,
    roughness: props.roughness || 0.1,
    envMapIntensity: props.envMapIntensity || 1,
  });
};
