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
  /**
   * Optional LOD parameters. When provided, the mesh reduces drawn instances
   * with distance using SFE-style suppression (w = exp(-sigma)).
   */
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  /**
   * Optional world-space center used for LOD distance.
   * When omitted, the component falls back to its world transform.
   */
  center?: [number, number, number];
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
