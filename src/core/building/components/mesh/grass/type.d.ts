import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

export type GrassMeshProps = ThreeElements["group"] & {
  options?: {
    bW: number;
    bH: number;
    joints: number;
  };
  width?: number;
  instances?: number;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      grassMaterial: {
        ref?: React.RefObject<THREE.ShaderMaterial | null> | undefined;
        map?: THREE.Texture | null;
        alphaMap?: THREE.Texture | null;
        toneMapped?: boolean;
        side?: THREE.Side;
        transparent?: boolean;
      };
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        grassMaterial: {
          ref?: React.RefObject<THREE.ShaderMaterial | null> | undefined;
          map?: THREE.Texture | null;
          alphaMap?: THREE.Texture | null;
          toneMapped?: boolean;
          side?: THREE.Side;
          transparent?: boolean;
        };
      }
    }
  }
}
