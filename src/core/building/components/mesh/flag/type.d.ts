import * as THREE from "three";

export interface FlagMeshProps {
  geometry: THREE.BufferGeometry;
  pamplet_url?: string | null;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      flagMaterial: {
        ref: React.RefObject<THREE.Material>;
        map?: THREE.Texture | null;
        transmission?: number;
        roughness?: number;
        envMapIntensity?: number;
        side?: THREE.Side;
        transparent?: boolean;
      };
    }
  }
}
