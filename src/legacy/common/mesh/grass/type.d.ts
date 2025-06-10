import * as THREE from "three";

export interface GrassMeshProps {
  options?: {
    bW: number;
    bH: number;
    joints: number;
  };
  width?: number;
  instances?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      grassMaterial: {
        ref: React.RefObject<THREE.Material>;
        map: THREE.Texture | null;
        alphaMap: THREE.Texture | null;
        toneMapped: boolean;
        side: THREE.DoubleSide;
        transparent: boolean;
      };
    }
  }
}
